import {
  AlarmClock,
  Clock,
  DatabaseX,
  Send,
  ShieldAlert,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../Hook/useLanguage";

type ErrorArrayType = [LucideIcon, string, string, string, boolean];

interface ErrorArrayProps {
  [key: string]: ErrorArrayType;
}

interface ErrorModuleProps {
  error:
    | "error"
    | "server-error"
    | "telegram-data"
    | "telegram-auth"
    | "telegram-auth-user"
    | "too-many-requests";
}

const ErrorModuleArray: ErrorArrayProps = {
  error: [Send, "telegram-h1", "telegram-p", "telegram-btn", false],
  "server-error": [DatabaseX, "server-h1", "server-p", "server-btn", true],
  "telegram-data": [ShieldAlert, "data-h1", "data-p", "server-btn", true],
  "telegram-auth": [Clock, "auth-h1", "auth-p", "server-btn", false],
  "telegram-auth-user": [UserX, "user-h1", "user-p", "server-btn", false],
  "too-many-requests": [AlarmClock, "limit-h1", "limit-p", "server-btn", true],
};

function ErrorModule({ error }: ErrorModuleProps) {
  const BOT_USERNAME: string = import.meta.env.VITE_BOT_USERNAME;
  const { t, ready } = useLanguage("ErrorModule");
  const text: ErrorArrayType = ErrorModuleArray[error];
  const Icon: LucideIcon = text[0];

  if (ready) {
    return (
      <div className="size-full flex-center flex-col">
        <div className="size-15 bg-gray-animation rounded-full"></div>
        <div className="h-7 w-48 mt-5 bg-gray-animation"></div>
        <div className="h-5 w-58 mt-2 bg-gray-animation"></div>
        <div className="h-10 w-73 mt-3 bg-gray-animation"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 text-center flex-center flex-col">
      <button className="bg-[#9835FF] size-14 rounded-full flex-center">
        <Icon className="size-6.5 text-white" />
      </button>

      <h1 className="text-xl font-medium text-white mt-4 mb-2">{t(text[1])}</h1>

      <p className="text-sm max-w-80">{t(text[2])}</p>

      <button
        className="w-full max-w-75 mt-4 h-11 rounded-sm text-[16px] bg-button-color text-white cursor-pointer font-medium"
        onClick={() => {
          if (text[4]) window.location.reload();
          if (!text[4]) {
            if (!BOT_USERNAME) return alert("(.env) BOT_USERNAME mavjud emas!");
            window.location.href = `https://t.me/${BOT_USERNAME}`;
          }
        }}
      >
        {t(text[3])}
      </button>
    </div>
  );
}

export default ErrorModule;
