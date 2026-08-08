import fs from "fs";
import "dotenv/config";
import https from "https";
import app from "./app.js";
import { connectRedis } from "./config/redis.js";
import { chechConnection, closeDB } from "./config/db.js";

(async () => {
  await connectRedis();
  await chechConnection();
  const PORT: number = Number(process.env.PORT) || 3000;

  const Options = {
    key: fs.readFileSync("localhost+2-key.pem"),
    cert: fs.readFileSync("localhost+2.pem"),
  };

  https
    .createServer(Options, app)
    .listen(PORT, "0.0.0.0", () =>
      console.log(`Server ishga tushdi (HTTPS) - ${PORT}`),
    );
})().catch((err) => {
  console.error("Server ishga tushurishda xatolik yuz berdi - ", err.message);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("server yopildi!");
  await closeDB();
  process.exit(0);
});
