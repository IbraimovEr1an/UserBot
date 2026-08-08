import cors from "cors";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import authRouter from "./router/auth.router.js";
import cookieParser from "cookie-parser";
import { handleRateLimit } from "./Middleware/rate.limit.js";
import { wrap } from "./types/express.js";

const app = express();

process.on("uncaughtException", (err) => {
  console.error("Xatolik yuz berdi - ", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (r: any) => {
  const message = r?.message || String(r);
  if (message.includes("TIMEOUT")) {
    return;
  }

  console.error("Xatolik yuz berdi - ", r);
  process.exit(1);
});

app.use(
  cors({
    origin: process.env.FRONT_END || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/", wrap(handleRateLimit));
app.use("/auth", authRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ message: "server-error" });
});

export default app;
