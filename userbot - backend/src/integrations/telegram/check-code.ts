import { Api, TelegramClient } from "telegram";
import redisClient from "../../config/redis.js";
import { StringSession } from "telegram/sessions/StringSession.js";
import connectWithRetry from "./ConnectWithRety.js";
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

const CheckCode = async (
  id: number,
  phone: string,
  code: string,
): Promise<CheckCodeType> => {
  const key = `session:${id}:${phone}`;
  const raw = await redisClient.get(key);
  if (!raw) return { success: false, error: "SESSION_NOT_FOUND" };

  let saved: SavedSession;
  try {
    saved = JSON.parse(raw);
  } catch (err) {
    return { success: false, error: "SESSION_CORRUPTED" };
  }

  const client = new TelegramClient(
    new StringSession(saved.session || ""),
    apiId,
    apiHash,
    {
      connectionRetries: 5,
      autoReconnect: true,
      retryDelay: 2000,
      timeout: 10,
    },
  );

  try {
    await connectWithRetry(client);

    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash: saved.phoneCodeHash,
        phoneCode: code,
      }),
    );

    const sessionString = client.session.save() as unknown as string;
    await redisClient.del(key);

    try {
      await db("INSERT INTO phone (uid,phone,temp_session) VALUES ($1,$2,$3)", [
        id,
        phone,
        sessionString,
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

    if (message === "PHONE_CODE_EXPIRED" || message === "AUTH_RESTART") {
      await redisClient.del(key);
    }

    return { success: false, error: message };
  } finally {
    await client.disconnect();
    await client.destroy?.();
  }
};

export default CheckCode;
