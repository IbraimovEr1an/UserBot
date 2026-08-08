import crypto from "crypto";
import type {
  ExpressContext,
  ExpressContextPromise,
} from "../types/express.js";
import redisClient from "../config/redis.js";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET env da mavjud emas");
const JWT_SECRET = process.env.JWT_SECRET;

// Browser uchun UUID yaratadi
const getDeviceId = ({ req, res }: ExpressContext) => {
  let id = req.cookies?.device_id;

  if (!id) {
    id = crypto.randomUUID();
    res.cookie("device_id", id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }

  return id;
};

// Browser turini aniqlash | Telegram || Browser
const getRateKey = ({ req, res }: ExpressContext) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (token) {
    try {
      const { uid } = jwt.verify(token, JWT_SECRET) as { uid: number };
      return { key: `tg:${uid}`, isTelegram: true };
    } catch (err) {}
  }

  return { key: `device:${getDeviceId({ req, res })}`, isTelegram: false };
};

const LIMITS = {
  tg: { max: 30, windowSec: 60 },
  device: { max: 15, windowSec: 300 },
};

// Limitni boshqarish
export const handleRateLimit: ExpressContextPromise = async ({
  req,
  res,
  next,
}) => {
  const { key, isTelegram } = getRateKey({ req, res });
  const { max, windowSec } = isTelegram ? LIMITS.tg : LIMITS.device;
  const redisKey = `rateLimit:${key}`;

  try {
    const count = await redisClient.incr(redisKey);

    if (count === 1) {
      await redisClient.expire(redisKey, windowSec);
    }

    if (count > max) {
      return res.status(429).json({
        message: "too-many-requests",
      });
    }

    next?.();
  } catch (err) {
    console.error(
      "(Middleware/rate.limit.ts) - xatolik yuz berdi ",
      (err as Error).message,
    );
    return res.status(400).json({ message: "server-error" });
  }
};
