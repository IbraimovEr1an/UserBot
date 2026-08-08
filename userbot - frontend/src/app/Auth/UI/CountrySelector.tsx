import { Search, X } from "lucide-react";
import Country from "../../../data/CountryCode.json";
import { useLanguage } from "../../../Hook/useLanguage";
import { useEffect, useState } from "react";
import Loading from "../../../Layout/Loading";

export interface CountryType {
  code: string;
  dial_code: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
}

interface CountrySelectorProp {
  onSelect: (country: CountryType) => void;
  onClose: () => void;
}

export const Countryies = Country as CountryType[];

function CountrySelector({ onClose, onSelect }: CountrySelectorProp) {
  const { ready, t, lang } = useLanguage("Login");
  const [isSearchTxt, setSearchTxt] = useState<string>("");
  const [isCountryies, setCountryies] = useState<CountryType[]>([]);

  const handleCountrySearch = (txt: string): void => {
    const Search = Countryies.filter(
      (item) =>
        item[`name_${lang}`].includes(txt) || item.dial_code.includes(txt),
    );
    setSearchTxt(txt);
    setCountryies(Search);
  };

  useEffect(() => {
    setCountryies(Countryies);
  }, [Countryies]);

  if (ready) {
    return <Loading />;
  }

  return (
    <div
      className="fixed inset-0 flex-center bg-black/50"
      onClick={() => onClose()}
    >
      <div
        className="bg-[#161D28] py-3 w-85 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-white text-[17px] px-5">{t("country")}</h1>

        <label className="relative inline-block w-full mt-3 mb-2.5">
          <Search className="absolute top-1/2 -translate-y-1/2 left-5 size-4.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={isSearchTxt}
            placeholder={t("search")}
            onChange={(e) => handleCountrySearch(e.target.value)}
            className="w-full text-sm text-white px-11"
            autoComplete="off"
            maxLength={35}
          />

          <X
            className={`absolute top-1/2 -translate-y-1/2 right-5 size-4.5 cursor-pointer ${isSearchTxt.replaceAll(" ", "").length > 0 ? "rotate-0 opacity-100 scale-100 visible" : "rotate-360 opacity-0 scale-0 invisible"} transition-all duration-300`}
            onClick={() => handleCountrySearch("")}
          />
        </label>

        <ul
          className={`text-sm border-y ${isCountryies.length > 0 ? "border-y-black/60" : "border-t-black/60 border-b-transparent"} transition-border duration-300 py-3 overflow-y-auto h-105`}
        >
          {isCountryies.length > 0 ? (
            isCountryies.map((item) => {
              return (
                <li
                  className="flex items-center gap-1.5 px-5 py-2.25 hover:bg-input-hover/70 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <h1 className="text-white">{item[`name_${lang}`]}</h1>
                  <p className="text-gray-400">{item.dial_code}</p>
                </li>
              );
            })
          ) : (
            <div className="text-center text-[13px] mt-4 text-gray-400">
              {t("country_empty")}
            </div>
          )}
        </ul>

        <div className="text-end mr-3 mt-2">
          <button
            className="text-blue-400 text-sm cursor-pointer"
            onClick={onClose}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CountrySelector;
