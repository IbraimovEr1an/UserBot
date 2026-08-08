import type { ExpressContextPromise } from "../types/express.js";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET env da mavjud emas");
const JWT_SECRET: string = process.env.JWT_SECRET;

const authMiddleware: ExpressContextPromise = async ({ req, res, next }) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "no-token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: number };

    req.user = { uid: decoded.uid };
    next?.();
  } catch (err) {
    return res.status(401).json({ message: "no-token" });
  }
};

export default authMiddleware;
