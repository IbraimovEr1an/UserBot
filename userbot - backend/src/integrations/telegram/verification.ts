import crypto from "crypto";

export class TelegramSecurity {
  // Telegram | Auth | Hash
  telegramHashChech = (initData: string): boolean => {
    const URLParams = new URLSearchParams(initData);
    const token: string = process.env.BOT_TOKEN!;
    const hash = URLParams.get("hash");
    URLParams.delete("hash");
    let data: string[] = [];

    if (!token) throw new Error("(.env) BOT_TOKEN mavjud emas");

    for (const [key, value] of URLParams.entries()) {
      data.push(`${key}=${value}`);
    }
    data.sort();
    const checkData: string = data.join("\n");

    const key = crypto
      .createHmac("sha256", "WebAppData")
      .update(token)
      .digest();

    const computedHash = crypto
      .createHmac("sha256", key)
      .update(checkData)
      .digest("hex");

    return hash === computedHash;
  };

  // Telegram | Auth | Date
  telegramAuthDate = (initData: string): boolean => {
    const URLParams = new URLSearchParams(initData);
    const auth: string = URLParams.get("auth_date")!;
    const date = parseInt(auth ?? "0", 10);
    return Math.floor(Date.now() / 1000) - date <= 86400;
  };

  // Telegram | Auth | User | Info
  telegramUserInfo = (initData: string) => {
    const URLParams = new URLSearchParams(initData);
    const user: string | null = URLParams.get("user");
    return user ? JSON.parse(user) : null;
  };
}
