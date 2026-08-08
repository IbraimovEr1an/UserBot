import { StringSession } from "telegram/sessions/StringSession.js";
import redisClient from "../../config/redis.js";
import { Api, TelegramClient } from "telegram";
import { computeCheck } from "telegram/Password.js";
import { db } from "../../config/db.js";

type CheckCodeType = {
  success: boolean;
  error?: string;
};

type SavedSession = {
  phoneCodeHash: string;
  session: string;
};

if (!process.env.API_ID) throw new Error("(.env) API_ID mavjud emas");
if (!process.env.API_HASH) throw new Error("(.env) API_HASH mavjud emas");

const apiHash: string = process.env.API_HASH;
const apiId: number = Number(process.env.API_ID);

const Authenticator2FA = async (
  id: number,
  phone: string,
  password: string,
): Promise<CheckCodeType> => {
  let saved: SavedSession;
  const key: string = `session:${id}:${phone}`;
  const raw = await redisClient.get(key);
  if (!raw) return { success: false, error: "SESSION_NOT_FOUND" };

  try {
    saved = JSON.parse(raw);
  } catch (err) {
    return { success: false, error: "SESSION_CORRUPTED" };
  }

  const stringSession = new StringSession(saved.session || "");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    autoReconnect: true,
    retryDelay: 2000,
    timeout: 10,
  });

  try {
    await client.connect();

    const User = await client.invoke(new Api.account.GetPassword());
    const Check = await computeCheck(User, password);
    await client.invoke(new Api.auth.CheckPassword({ password: Check }));
    const newStringSession = client.session.save();

    try {
      await db("INSERT INTO phone (uid,phone,temp_session) VALUES ($1,$2,$3)", [
        id,
        phone,
        newStringSession,
      ]);
    } catch (err) {
      return { success: false, error: "DB-ERROR" };
    }

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

    const MessageError = [
      "AUTH_KEY_UNREGISTERED",
      "AUTH_KEY_DUPLICATED",
      "SESSION_REVOKED",
      "SESSION_EXPIRED",
    ];

    if (MessageError.includes(message)) {
      await redisClient.del(key);
    }

    return { success: false, error: message };
  } finally {
    await client.disconnect();
    await client.destroy?.();
  }
};
export default Authenticator2FA;
