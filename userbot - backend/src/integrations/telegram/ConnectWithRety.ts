import type { TelegramClient } from "telegram";

const connectWithRetry = async (client: TelegramClient) => {
  for (let i = 1; i <= 3; i++) {
    try {
      await client.connect();
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const timeout = message.includes("TIMEOUT");

      if (!timeout || i === 3) {
        throw err;
      }

      console.log("Ulanishda (TIMEOUT) - ", `${i}/3`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

export default connectWithRetry;
