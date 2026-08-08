import { createClient, type RedisClientType } from "redis";

const REDIS_URL: string = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient: RedisClientType = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (r) => {
      if (r > 5) {
        console.error("Redis: Ulanishga bo'lgan urinishlar tugadi.");
        return false;
      }
      return Math.min(r * 100, 3000);
    },
  },
});

redisClient.on("error", (err) =>
  console.error("Redis: Xatolik yuz berdi - ", err.message),
);

redisClient.on("connect", () => {
  console.log("Redis: Ulanish ornatilmoqda...");
});

redisClient.on("ready", () => {
  console.log("Redis: Ulandi");
});

redisClient.on("reconnecting", () => {
  console.log("Redis: Qayta ulanmoqda...");
});

redisClient.on("end", () => {
  console.log("Redis: Ulanish yopildi");
});

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
};

export default redisClient;
