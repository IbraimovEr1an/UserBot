import { useNavigate } from "react-router-dom";
import BackButton from "../../Components/BackButton";
import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../Hook/useLanguage";
import CountrySelector, {
  Countryies,
  type CountryType,
} from "./UI/CountrySelector";
import { ChevronDown } from "lucide-react";
import useFetch from "../../Hook/useFetch";
import useErrorStore from "../../Hook/useErrorStore";
import useCloudTelegram from "../../Hook/useCloudTelegram";

const DefaultCountry =
  Countryies.find((item) => item.code === "UZ") ?? Countryies[0];

function Login() {
  const Navigate = useNavigate();
  BackButton({ link: "/dashboard" });
  const { ready, t, lang } = useLanguage("Login");
  const [isNumber, setNumber] = useState<string>("");
  const showError = useErrorStore((state) => state.showError);
  const [optenCountry, setOpenCountry] = useState<boolean>(false);
  const { loading, error, data, useData } = useFetch("/auth/login");
  const [isCountry, setCountry] = useState<CountryType>(DefaultCountry);

  const FormatNumber = useMemo(() => {
    const num = isNumber.replace(/\D/g, "");
    const format = [
      num.slice(0, 2),
      num.slice(2, 5),
      num.slice(5, 7),
      num.slice(7, 9),
    ].filter(Boolean);

    return format.join(" ");
  }, [isNumber]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || FormatNumber.length !== 12) return;
    const formData = Object.fromEntries(new FormData(e.currentTarget));
    (async () => {
      await useData({ body: formData });
    })();
  };

  useEffect(() => {
    if (!error) return;
    showError(t(error));
  }, [error]);

  useEffect(() => {
    if (data?.success && data?.phone) {
      (async () =>
        useCloudTelegram.setItem("login_phone", data.phone as string))();
      Navigate("/auth/code");
    }
  }, [data]);

  if (ready) {
    return (
      <div className="size-full flex flex-col justify-center">
        <div className="loader-animation h-7 w-2/4 rounded-xs"></div>
        <div className="loader-animation h-4 w-3/4 rounded-xs my-2"></div>
        <div className="loader-animation h-4 w-3/5 rounded-xs"></div>
        <div className="loader-animation h-8 w-full my-2 rounded-xs"></div>
        <div className="grid grid-cols-4 gap-1.5">
          <div className="loader-animation h-8 rounded-xs"></div>
          <div className="loader-animation h-8 rounded-xs col-span-3"></div>
        </div>
        <div className="loader-animation h-8 rounded-xs mt-2"></div>
        <div className="flex justify-center">
          <div className="loader-animation h-4 rounded-xs mt-3 w-1/2"></div>
        </div>
      </div>
    );
  }

  if (optenCountry) {
    return (
      <CountrySelector
        onSelect={(v) => setCountry(v)}
        onClose={() => setOpenCountry(false)}
      />
    );
  }

  return (
    <div className="size-full max-w-100 mx-auto flex-center flex-col px-6">
      <div className="text-start">
        <h1 className="text-white text-lg font-medium">{t("h1")}</h1>
        <p className="text-sm mt-2 text-gray-500">{t("p")}</p>

        <form noValidate className="w-full mt-3" onSubmit={handleSubmit}>
          <label
            className="block w-full relative border-b border-b-white/7 py-2 cursor-pointer"
            onClick={() => setOpenCountry(true)}
          >
            <h1 className="text-white">{isCountry[`name_${lang}`]}</h1>
            <ChevronDown className="absolute top-1/2 -translate-y-1/2 right-0 size-5 text-gray-500" />
          </label>

          <div className="w-full grid grid-cols-4 gap-2">
            <label className="relative block py-2">
              <input
                readOnly
                type="text"
                name="code"
                value={isCountry.dial_code}
                autoComplete="off"
                className="w-full text-center bg-transparent text-white pointer-events-none"
              />
              <span className="absolute left-0 bottom-0 h-px w-full bg-white/7" />
            </label>

            <label className="relative block col-span-3 py-2">
              <input
                type="text"
                name="phone"
                maxLength={30}
                readOnly={loading}
                value={FormatNumber}
                autoComplete="off"
                onChange={(e) => setNumber(e.target.value)}
                className="peer w-full bg-transparent text-white outline-none"
              />
              <span className="absolute left-0 bottom-0 h-px w-full bg-white/7" />
              <span className="absolute left-1/2 bottom-0 -translate-x-1/2 h-px w-full bg-button-color scale-x-0 transition-transform duration-200 peer-focus:scale-x-100" />
            </label>
          </div>

          <button
            type="submit"
            className={`w-full ${FormatNumber.length === 12 ? "bg-button-color text-white cursor-pointer" : "bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed"} my-3 py-2 rounded-sm text-sm transition-all duration-300`}
          >
            {loading ? t("wait") : t("nx")}
          </button>
        </form>

        <p className="text-center text-[13px] text-blue-300 mt-3">
          <span
            className="cursor-pointer"
            onClick={() => Navigate("/auth/qrcode")}
          >
            {t("qrcode")}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
