import { TelegramClient } from "telegram";
import redisClient from "../../config/redis.js";
import connectWithRetry from "./ConnectWithRety.js";
import { StringSession } from "telegram/sessions/index.js";

interface SendCodeProps {
  success: boolean;
  error?: string;
}

if (!process.env.API_ID) throw new Error("(.env) API_ID mavjud emas");
if (!process.env.API_HASH) throw new Error("(.env) API_HASH mavjud emas");

const apiHash: string = process.env.API_HASH;
const apiId: number = Number(process.env.API_ID);

export default async (uid: number, phone: string): Promise<SendCodeProps> => {
  const stringSession = new StringSession("");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    autoReconnect: true,
    retryDelay: 2000,
    timeout: 10,
  });

  try {
    await connectWithRetry(client);
    const res = await client.sendCode({ apiId, apiHash }, phone);

    const key: string = `session:${uid}:${phone}`;

    const value = JSON.stringify({
      session: stringSession.save(),
      phoneCodeHash: res.phoneCodeHash,
    });

    await redisClient.set(key, value, { EX: 60 * 60 });

    return { success: true };
  } catch (err) {
    let message: string = "";
    if (err && typeof err === "object" && "errorMessage" in err) {
      message = String((err as { errorMessage: unknown }).errorMessage);
    } else if (err instanceof Error) {
      message = err.message;
    } else {
      message = "unknown-error";
    }

    return { success: false, error: message };
  } finally {
    await client.disconnect();
    await client.destroy?.();
  }
};
