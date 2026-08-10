import useCloudTelegram from "../../Hook/useCloudTelegram";
import { useEffect, useState } from "react";
import Stars from "../../assets/stars.svg";
import { ChevronRight, CirclePlus, Search, Settings, X } from "lucide-react";
import useFetch from "../../Hook/useFetch";
import Avatar from "../../Components/Avatar";

interface UserDataProps {
  id: string;
  first_name: string;
  last_name?: string;
  balance: string;
  photo_url?: string;
}

interface UsersDataProps {
  success: boolean;
  users: {
    id: number | string;
    phone: string;
    status: boolean;
    firstName: string;
    lastName: string;
  }[];
}

const defaultUserData: UserDataProps = {
  id: "0000000000",
  first_name: "undefined",
  last_name: "undefined",
  balance: "0",
  photo_url: "undefined",
};

function MyAccounts() {
  const [userData, setData] = useState<UserDataProps>(defaultUserData);
  const { loading, error, data, useData } = useFetch<UsersDataProps>(
    "/dashboard/my-accounts",
  );
  const [isSearchInput, setSearchInput] = useState<string>("");
  const [isLoader, setLoader] = useState<boolean>(true);

  useEffect(() => {
    const isFormat = (v: Record<string, unknown>): boolean => {
      const Values = Object.values(v).filter(Boolean);
      if (!Values.length) return false;

      return Values.every(
        (item) => typeof item === "string" && item.trim().length > 0,
      );
    };

    (async () => {
      const Keys: string[] = [
        "id",
        "first_name",
        "last_name",
        "balance",
        "photo_url",
      ];
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

  if (isLoader) {
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
    <div className="size-full">
      <header className="flex items-center justify-between bg-input-color px-3 py-2 rounded-sm border border-white/5">
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

        <button className="bg-[#2C3743] hover:bg-[#374250] border border-[#3E4A58] p-2.5 rounded-full text-[#E8EBEE] cursor-pointer transition-all duration-300">
          <Settings className="size-4.5" />
        </button>
      </header>

      <label className="block w-full my-2 relative">
        <Search className="absolute top-1/2 left-2 -translate-y-1/2 size-5 text-gray-500 pointer-events-none" />
        <input
          type="text"
          maxLength={50}
          autoComplete="off"
          placeholder="Qidiruv..."
          className="input-style pl-8 pr-8"
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <X
          className={`absolute top-1/2 right-3 -translate-y-1/2 size-5 text-white cursor-pointer ${isSearchInput.trim().length > 0 ? "opacity-100 rotate-180 scale-100" : "opacity-0 rotate-0 scale-0"} transition-all duration-300`}
        />
      </label>

      <h1 className="text-white font-medium text-[17px] mb-2">
        Mening hisoblarim
      </h1>

      <button
        type="button"
        className={`flex items-center gap-2 bg-input-color hover:bg-input-hover border border-white/5 duration-300 text-blue-400 py-2.5 px-3 text-sm cursor-pointer w-full ${data.success && data.users.length > 0 ? "rounded-t-lg" : "rounded-lg"} transition-all duration-300`}
        onClick={() => (window.location.href = "/auth/login")}
      >
        <CirclePlus className="size-5.5" />
        Yangi hisob qo'shish
      </button>

      <div className="h-50 w-full bg-input-color my-1 rounded-sm border border-white/5">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/empty-bookmark-illustration-svg-download-png-15032806.png"
          alt="Empty"
          className="size-30"
        />
      </div>

      {data.success && data?.users?.length > 0 && (
        <ul className="grid grid-cols-1 gap-0.5 mt-0.5">
          {data.users.map((item) => {
            return (
              <li>
                <button
                  type="button"
                  className="bg-input-color hover:bg-input-hover transition-all duration-300 border border-white/5 px-3 py-1.5 rounded-xs flex items-center justify-between cursor-pointer w-full"
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
                        {item.status ? item.firstName || item.lastName : "Null"}
                      </span>
                      <span className="text-xs">
                        {item.status ? item.phone : "Null"}
                      </span>
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
  );
}

export default MyAccounts;
