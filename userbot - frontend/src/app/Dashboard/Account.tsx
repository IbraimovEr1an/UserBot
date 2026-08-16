import { useNavigate, useParams } from "react-router-dom";
import useErrorStore from "../../Hook/useErrorStore";
import { useLanguage } from "../../Hook/useLanguage";
import BackButton from "../../Components/BackButton";
import Data from "../../data/AccountSetting.json";
import { type User } from "../../Type/Dashboard";
import Switch from "../../Components/UI/Switch";
import Avatar from "../../Components/Avatar";
import { useEffect, useState } from "react";
import useFetch from "../../Hook/useFetch";

interface UserData {
  success: boolean;
  user: User;
}

function Account() {
  const navigate = useNavigate();
  BackButton({ link: "/dashboard" });
  const { t, ready } = useLanguage("Account");
  const showError = useErrorStore((state) => state.showError);
  const { phone } = useParams<{ id: string; phone: string }>();
  const [isUserData, setUserData] = useState<User | null>(null);
  const dataFetch = useFetch<UserData>("/dashboard/account");
  const { loading, error, data, useData } = dataFetch;
  const [onStatus, setStatus] = useState<Record<string, boolean>>({});

  const Toggle = (id: string) => setStatus((p) => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    if (!phone || typeof phone !== "string") {
      navigate("/dashboard");
      return;
    }

    (async () => await useData({ body: { phone } }))();
  }, []);

  useEffect(() => {
    data?.success && setUserData(data.user);
  }, [data]);

  useEffect(() => {
    if (!error) return;

    showError(error);

    if (error === "no-auth") {
      const timer = setTimeout(() => window.Telegram?.WebApp?.close(), 3000);
      return () => clearTimeout(timer);
    }

    if (error === "no-phone" || error === "no-user-data") {
      const timer = setTimeout(() => navigate("/dashboard"), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (error) return null;

  if (!isUserData || loading || ready) {
    return (
      <div className="size-full">
        <div className="flex-center flex-col py-6">
          <div className="size-22 rounded-full loader-animation"></div>
          <div className="my-2 loader-animation w-3/5 h-4 rounded-full"></div>
          <div className="loader-animation w-2/5 h-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {Array.from({ length: 10 }).map((_, idx) => {
            return (
              <div
                key={idx}
                className={`loader-animation h-10 ${idx === 0 ? "rounded-t-xl" : idx === 9 ? "rounded-b-xl" : "rounded-xs"} flex items-center justify-between px-3`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="bg-gray-600 h-3 w-40 rounded-full animate-pulse"></div>
                  <div className="bg-gray-600 h-2 w-30 rounded-full animate-pulse"></div>
                </div>

                <div className="bg-gray-600 w-12 h-5 rounded-xl animate-pulse"></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="size-full">
      <header className="flex-center flex-col py-6">
        <Avatar
          id={isUserData.id}
          firstName={isUserData.firstName}
          lastName={isUserData.lastName}
          size={90}
          txtSize={27}
        />

        <h1 className="text-white mt-2 text-lg font-medium">
          {isUserData.firstName || isUserData.lastName}
        </h1>

        <p className="text-sm">{isUserData.phone}</p>
      </header>

      <main className="pb-10">
        <ul className="grid grid-cols-1 gap-1">
          {Data.map((item, idx) => {
            return (
              <li
                tabIndex={0}
                key={item.id}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    Toggle(item.id);
                  }
                }}
                className={`box flex items-center justify-between ${idx === 0 ? "rounded-t-xl" : idx === Data.length - 1 ? "rounded-b-xl" : "rounded-xs"}`}
              >
                <div className="text-[16px] [@media(hover:hover)]:text-sm">
                  <h1 className="text-white font-medium">{item.title}</h1>
                  <p className="text-xs mt-0.5">{item.decoration}</p>
                </div>

                <Switch
                  checked={onStatus[item.id] ?? false}
                  onChange={() => Toggle(item.id)}
                />
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="w-full bg-red-600 hover:bg-red-500 focus-visible:bg-red-500 transition-all duration-300 text-sm text-white py-2.5 mt-3 rounded-lg cursor-pointer"
        >
          Hisobni o'chirish
        </button>
      </main>
    </div>
  );
}

export default Account;
