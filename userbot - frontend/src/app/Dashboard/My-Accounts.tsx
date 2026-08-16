import Setting from "./Components/Settings";
import Stars from "../../assets/stars.svg";
import useFetch from "../../Hook/useFetch";
import Avatar from "../../Components/Avatar";
import DuckError from "../../assets/DuckError.webp";
import DuckEmpty from "../../assets/DuckEmpty.gif";
import { useLanguage } from "../../Hook/useLanguage";
import useErrorStore from "../../Hook/useErrorStore";
import SearchEmpty from "../../assets/SearchEmpty.gif";
import DuckLoading from "../../assets/DuckLoading.webp";
import useCloudTelegram from "../../Hook/useCloudTelegram";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronRight, CirclePlus, Search, Settings, X } from "lucide-react";
import type { User, UserDataProps, UsersDataProps } from "../../Type/Dashboard";
import { useNavigate } from "react-router-dom";

const Message = ({ image, txt }: { image: string; txt: string }) => {
  return (
    <div className="mt-10 flex-center flex-col text-[13px] text-center text-gray-500">
      <img src={image} alt="Duck-Loading" className="size-35" />
      <p className="mt-4 max-w-4/5 leading-5 wrap-break-word">{txt}</p>
    </div>
  );
};

const isFormat = (v: Record<string, unknown>): boolean => {
  const Values = Object.values(v).filter(Boolean);
  if (!Values.length) return false;

  return Values.every(
    (item) => typeof item === "string" && item.trim().length > 0,
  );
};

const defaultUserData: UserDataProps = {
  id: "0000000000",
  first_name: "undefined",
  last_name: "undefined",
  balance: "0",
  photo_url: "undefined",
};

function MyAccounts() {
  const useFetchData = useFetch<UsersDataProps>("/dashboard/my-accounts");
  const [userData, setData] = useState<UserDataProps>(defaultUserData);
  const [isSearchInput, setSearchInput] = useState<string>("");
  const showError = useErrorStore((state) => state.showError);
  const [isSettings, setSettings] = useState<boolean>(false);
  const [isDataUsers, setDataUsers] = useState<User[]>([]);
  const { loading, error, data, useData } = useFetchData;
  const [isLoader, setLoader] = useState<boolean>(true);
  const { t, ready } = useLanguage("Dashboard");
  const Navigate = useNavigate();

  const isUserFilter = useMemo(() => {
    const searchText = isSearchInput.toLowerCase().trim();

    const matchesSearch = (value: string) =>
      value.toLocaleLowerCase().includes(searchText);

    const isMatchedUser = (user: User) =>
      matchesSearch(user.phone) ||
      matchesSearch(user.firstName.trim()) ||
      matchesSearch(user.lastName.trim());

    return isDataUsers.filter(isMatchedUser);
  }, [isSearchInput, isDataUsers]);

  useEffect(() => {
    (async () => {
      const Keys = ["id", "first_name", "last_name", "balance", "photo_url"];
      const saved = await useCloudTelegram.getItems(Keys);
      const isValid = isFormat(saved);
      if (!isValid) return window.Telegram?.WebApp?.close();
      setData(saved as any as UserDataProps);
      setLoader(false);
    })();
  }, []);

  useEffect(() => {
    (async () => await useData({ cookie: true }))();
  }, []);

  useEffect(() => {
    if (!error) return;

    if (error === "no-auth") {
      const timer = setTimeout(() => window.Telegram?.WebApp?.close());
      return () => clearTimeout(timer);
    }

    showError(error);
  }, [error]);

  useEffect(() => {
    if (data?.success) {
      setDataUsers(data?.users.filter((a) => a.status));
    }
  }, [data]);

  if (isLoader || ready) {
    return (
      <div className="size-full">
        <header className="h-13 w-full loader-animation rounded-sm"></header>
        <div className="h-8 w-full my-2 loader-animation rounded-sm"></div>
        <div className="h-6 w-1/2 loader-animation rounded-xs"></div>
        <div className="h-100 w-full loader-animation rounded-sm mt-2"></div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="size-full">
        <header className="bg-input-color px-3 py-2 rounded-sm border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={userData.photo_url}
                alt="User"
                className="rounded-full size-11"
              />

              <div className="text-white text-[16px] font-medium">
                <h1>{userData.first_name}</h1>
                <div className="flex items-center -mt-1.5">
                  <img
                    src={Stars}
                    alt="Stars"
                    className="size-7.5 -ml-1.25 -mr-0.5"
                  />
                  <p>{userData.balance}</p>
                </div>
              </div>
            </div>

            <button
              className="bg-[#2C3743] hover:bg-[#374250] border border-[#3E4A58] p-2.5 rounded-full text-[#E8EBEE] cursor-pointer transition-all duration-300"
              onClick={() => setSettings(true)}
            >
              <Settings className="size-4.5" />
            </button>
          </div>

          <button
            type="button"
            className="bg-button-color text-white w-full text-sm py-2 rounded-sm mt-2 cursor-pointer"
          >
            {t("pay")}
          </button>
        </header>

        <label className="block w-full my-2 relative">
          <Search className="absolute top-1/2 left-2 -translate-y-1/2 size-5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            maxLength={50}
            autoComplete="off"
            value={isSearchInput}
            placeholder={t("input")}
            className="input-style pl-8 pr-8"
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <X
            className={`absolute top-1/2 right-3 -translate-y-1/2 size-5 text-white cursor-pointer ${isSearchInput.trim().length > 0 ? "opacity-100 rotate-180 scale-100" : "opacity-0 rotate-0 scale-0"} transition-all duration-300`}
            onClick={() => setSearchInput("")}
          />
        </label>

        <h1 className="text-white font-medium text-[17px] mb-2">
          {t("accounts")}
        </h1>

        <button
          type="button"
          className={`flex items-center gap-2 bg-input-color hover:bg-input-hover border border-white/5 duration-300 text-blue-400 py-2.5 px-3 text-sm cursor-pointer w-full ${data?.success && isUserFilter.length > 0 ? "rounded-t-lg" : "rounded-lg"} transition-all duration-300`}
          onClick={() => Navigate("/auth/login")}
        >
          <CirclePlus className="size-5.5" />
          {t("new-account")}
        </button>

        {loading && <Message txt={t("loading")} image={DuckLoading} />}
        {error && <Message txt={t("error")} image={DuckError} />}

        {data?.success && (
          <Fragment>
            {isDataUsers.length === 0 && (
              <Message txt={t("empty")} image={DuckEmpty} />
            )}

            {isDataUsers.length > 0 && isUserFilter.length === 0 && (
              <Message
                txt={t("search").replace("name", isSearchInput)}
                image={SearchEmpty}
              />
            )}
          </Fragment>
        )}

        {isUserFilter.length > 0 && (
          <ul className="grid grid-cols-1 gap-0.5 mt-0.5">
            {isUserFilter.map((item, index) => {
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      Navigate(
                        `/dashboard/account/${item.phone}`,
                      )
                    }
                    className={`bg-input-color hover:bg-input-hover transition-all duration-300 border border-white/5 px-3 py-1.5 flex items-center justify-between cursor-pointer w-full rounded-xs ${isUserFilter.length - 1 === index ? "rounded-b-lg" : ""}`}
                  >
                    <div className="flex-center gap-2">
                      <Avatar
                        id={item.id}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        size={38}
                      />
                      <div className="flex flex-col items-start text-sm gap-0.5">
                        <span className="text-white font-medium">
                          {item.firstName || item.lastName}
                        </span>
                        <span className="text-xs">{item.phone}</span>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-gray-500" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Setting status={isSettings} onClick={(s) => setSettings(s)} />
    </Fragment>
  );
}

export default MyAccounts;
