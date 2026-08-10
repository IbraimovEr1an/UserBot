import { TelegramClient } from "telegram";
import { db } from "../config/db.js";
import { StringSession } from "telegram/sessions/StringSession.js";
import connectWithRetry from "../integrations/telegram/ConnectWithRety.js";

interface ClientEntry {
  client: TelegramClient;
  date: number;
}

interface ClientResults {
  phone: string;
  client: TelegramClient | null;
}

interface CreateClientProps {
  uid: number;
  phone: string;
  session: string;
}

if (!process.env.API_ID) throw new Error("(.env) API_ID mavjud emas");
if (!process.env.API_HASH) throw new Error("(.env) API_HASH mavjud emas");

const apiHash: string = process.env.API_HASH;
const apiId: number = Number(process.env.API_ID);

const SESSION_ERRORS = [
  "AUTH_KEY_UNREGISTERED",
  "SESSION_REVOKED",
  "USER_DEACTIVATED",
];

class ClientManager {
  private clients: Map<string, ClientEntry> = new Map();
  private paddingClients: Map<string, Promise<TelegramClient>> = new Map();
  private key(uid: number, phone: string): string {
    return `${uid}:${phone}`;
  }

  // Xatolik halotini tekshirish
  private isSession(err: any): boolean {
    const message = err?.errorMessage || err?.message || "";
    return SESSION_ERRORS.some((item) => String(message).includes(item));
  }

  // Session va Clientni ochirish
  async handleDeleteSession(uid: number, phone: string): Promise<void> {
    const key = this.key(uid, phone);

    const entry = this.clients.get(key);
    if (entry) {
      await entry.client.disconnect().catch(() => {});
      this.clients.delete(key);
    }

    const sql: string = "DELETE FROM phone WHERE uid = $1 AND phone = $2";
    const txt = "[ClientManager] DB - ochirishda xatolik yuz berdi - ";
    await db(sql, [uid, phone]).catch((err) => console.error(txt, err));
  }

  // Client yaratish
  private async createClient({
    uid,
    phone,
    session,
  }: CreateClientProps): Promise<TelegramClient> {
    const client = new TelegramClient(
      new StringSession(session),
      apiId,
      apiHash,
      { connectionRetries: 5 },
    );

    try {
      await connectWithRetry(client);
    } catch (err) {
      if (this.isSession(err)) {
        await this.handleDeleteSession(uid, phone);
      }
      throw err;
    }

    this.clients.set(`${uid}:${phone}`, { client, date: Date.now() });

    return client;
  }

  // Sessionni olish
  private async resolveSession(uid: number, phone: string): Promise<string> {
    const sql = "SELECT temp_session FROM phone WHERE uid = $1 AND phone = $2";
    const res = await db(sql, [uid, phone]);

    if (!res.rows.length) throw new Error(`Session topilmadi: uid - ${uid}`);

    return res.rows[0].temp_session;
  }

  // UID | PHONE orqali client olish
  async getClient(uid: number, phone: string): Promise<TelegramClient> {
    const key = this.key(uid, phone);
    const entry = this.clients.get(key);

    if (entry?.client.connected) {
      entry.date = Date.now();
      return entry.client;
    }

    const padding = this.paddingClients.get(key);
    if (padding) return padding;

    const promise = (async () => {
      const session = await this.resolveSession(uid, phone);
      return this.createClient({ uid, phone, session });
    })().finally(() => this.paddingClients.delete(key));

    this.paddingClients.set(key, promise);
    return promise;
  }

  // Barcha clientlarni olish
  async getAllClients(uid: number): Promise<ClientResults[]> {
    const sql = "SELECT phone, temp_session FROM phone WHERE uid = $1";
    const users = await db(sql, [uid]);
    const results: ClientResults[] = [];

    await Promise.allSettled(
      users.rows.map(async ({ phone, temp_session }) => {
        const key = this.key(uid, phone);
        const entry = this.clients.get(key);

        if (entry?.client.connected) {
          entry.date = Date.now();
          results.push({ phone, client: entry.client });
          return;
        }

        try {
          const data = { uid, phone, session: temp_session };
          const client = await this.createClient(data);
          results.push({ phone, client });
        } catch (err) {
          results.push({ phone, client: null });
        }
      }),
    );

    return results;
  }

  async getAllUserProfiles(uid: number) {
    const clients = await this.getAllClients(uid);

    const profiles = await Promise.allSettled(
      clients.map(async ({ phone, client }) => {
        if (!client) return { phone, status: false };

        try {
          const Me = await client.getMe();

          return {
            id: Me.id.toString(),
            phone,
            status: true,
            firstName: Me.firstName ?? "",
            lastName: Me.lastName ?? "",
          };
        } catch (err: any) {
          if (this.isSession(err)) {
            await this.handleDeleteSession(uid, phone);
          }

          return { phone, status: false };
        }
      }),
    );

    return profiles.map((item) =>
      item.status === "fulfilled" ? item.value : { status: false },
    );
  }
}

export default new ClientManager();
