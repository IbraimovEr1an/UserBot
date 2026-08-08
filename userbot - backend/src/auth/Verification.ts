import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import type { ExpressContextPromise } from "../types/express.js";
import { TelegramSecurity } from "../integrations/telegram/verification.js";

interface UserProps {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  balance: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET env da mavjud emas");
const JWT_SECRET: string = process.env.JWT_SECRET;

const Verification: ExpressContextPromise = async ({ req, res, next }) => {
  const Check = new TelegramSecurity();
  const { initData } = req.body;
  let ErrorText: string = "";

  if (!initData) ErrorText = "error";
  else if (!Check.telegramHashChech(initData)) ErrorText = "telegram-data";
  else if (!Check.telegramAuthDate(initData)) ErrorText = "telegram-auth";
  else if (!Check.telegramUserInfo(initData)) ErrorText = "telegram-auth-user";

  if (ErrorText) return res.status(400).json({ message: ErrorText });
  const user: UserProps = Check.telegramUserInfo(initData);

  const sql = "SELECT balance, language_code FROM users WHERE uid = $1";
  let { rows } = await db<{ language_code: string; balance: number }>(sql, [
    user.id,
  ]);

  if (!rows.length) {
    await db("INSERT INTO users (uid) VALUES ($1)", [user.id]);
    ({ rows } = await db<{ language_code: string; balance: number }>(sql, [
      user.id,
    ]));
  }

  user.language_code = rows[0]?.language_code ?? "uz";
  user.balance = String(rows[0]?.balance);

  const token = jwt.sign({ uid: user.id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json({ success: true, user, token });
};

export default Verification;
