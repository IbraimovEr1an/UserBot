import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

process.on("unhandledRejection", (r) => {
  console.error("Unhandled Rejection - ", r);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception - ", err.message);
});

type StringOr = string | undefined;

const token: StringOr = process.env.BOT_TOKEN;
const WEB_APP: StringOr = process.env.WEB_APP;

if (!token) {
  console.error("BOT_TOKEN mavjud emas");
  process.exit(1);
}
if (!WEB_APP) {
  console.error("WEB_APP mavjud emas");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  if (!msg?.from) return;
  const userID: number = msg?.from?.id;
  const firstName: string = msg?.from?.first_name;

  try {
    await bot.sendMessage(
      msg.chat.id,
      `👋 Assalomu alaykum <b><a href='tg://user?id=${userID}'>${firstName}</a></b>\n\nBu bot orqali siz <b>Telegram UserBot</b> xizmatini oson va tez o'rnatishingiz mumkin.\n\n🔹 <b>UserBot nima?</b>\nSizning shaxsiy Telegram akkauntingiz asosida ishlaydigan, avtomatik funksiyalarni bajaruvchi bot.\n\n🔹 <b>Nima uchun kerak?</b>\n— Avtomatik xabar yuborish\n— Guruhlarni boshqarish\n— Maxsus skriptlarni ishga tushirish`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Ilovaga o'tish", web_app: { url: WEB_APP } }],
          ],
        },
        parse_mode: "HTML",
      },
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("Kutilmagan xatolik yuz berdi");
    }
  }
});

console.log("Bot started");
