import useFetch from "./useFetch";
import { useEffect, useState } from "react";
import useCloudTelegram from "./useCloudTelegram";

const telegramStatus = [
  "error",
  "server-error",
  "telegram-data",
  "telegram-auth",
  "telegram-auth-user",
  "too-many-requests",
] as const;

type TelegramLoaderProps = "loading" | "ready";
type TelegramStatusProps = (typeof telegramStatus)[number];

export const isTelegramStatus = (v: unknown): v is TelegramStatusProps => {
  return (
    typeof v === "string" && telegramStatus.includes(v as TelegramStatusProps)
  );
};

const isFormatData = (v: unknown): string => {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "1" : "0";
  return String(v);
};

export const useTgViewport = () => {
  const { loading, error, data, useData } = useFetch("/auth/verification");
  const [status, setStatus] = useState<TelegramStatusProps | null>(null);
  const [loader, setLoader] = useState<TelegramLoaderProps>("loading");
  const [isFetchStarted, setFetchStarted] = useState<boolean>(false);
  console.log(error);
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    setFetchStarted(true);
    (async () =>
      await useData({
        body: { initData: tg?.initData || null },
        cookie: true,
      }))();
  }, []);

  useEffect(() => {
    if (!isFetchStarted || loading) return;

    const tg = window.Telegram?.WebApp;
    const root = document.documentElement;

    if (!tg || !tg.initData || error || !data?.success) {
      root.style.setProperty("--tg-viewport-height", "100%");
      setStatus(isTelegramStatus(error) ? error : "error");
      setLoader("ready");
      return;
    }

    if (data?.success && data?.user && data?.token) {
      (async () => {
        const newData = data?.user as Record<string, unknown>;
        const Keys: string[] = Object.keys(newData);
        const saved = await useCloudTelegram.getItems(Keys);
        const isValid =
          saved &&
          Keys.every(
            (item) => isFormatData(newData[item]) === isFormatData(saved[item]),
          );

        if (!isValid) {
          const entr = Keys.map((k) => [k, isFormatData(newData[k])] as const);
          const format = Object.fromEntries(entr);
          await useCloudTelegram.setItems(format);
          await useCloudTelegram.setItem("token", `${data?.token}`);
        }
      })();
    }

    tg.ready();
    tg.expand();
    setStatus(null);

    const updateViewport = () => {
      const height = tg.viewportStableHeight;
      root.style.setProperty("--tg-viewport-height", `${height}px`);
      setLoader("ready");
    };

    updateViewport();

    tg.onEvent("viewportChanged", updateViewport);
    window.addEventListener("resize", updateViewport);

    return () => {
      tg.offEvent("viewportChanged", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, [isFetchStarted, loading, error, data]);

  return [loader, status] as const;
};
