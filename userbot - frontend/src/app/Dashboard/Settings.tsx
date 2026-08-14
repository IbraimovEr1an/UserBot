import { useCallback, useEffect, useRef } from "react";
import { useLanguage } from "../../Hook/useLanguage";
import { X } from "lucide-react";

type Lang = "uz" | "ru" | "en";
type LanguageItem = [lang: Lang, label: string];

const Language: LanguageItem[] = [
  ["uz", "O'zbekcha"],
  ["en", "English"],
  ["ru", "Русский"],
];

type SettingsType = {
  status?: boolean;
  onClick: (v: boolean) => void;
};

function Setting({ status = false, onClick }: SettingsType) {
  const ulLanguageList = useRef<HTMLUListElement>(null);
  const { t, ready, lang, setLang } = useLanguage("Settings");

  const handleLanguage = useCallback(
    (li: HTMLLIElement, l: "uz" | "en" | "ru") => {
      if (!ulLanguageList.current) return;

      const btn = ulLanguageList.current?.querySelector("button");

      if (!btn) return;

      Object.assign(btn.style, {
        top: li.offsetTop + "px",
        left: li.offsetLeft + "px",
        height: li.offsetHeight + "px",
        width: li.offsetWidth + "px",
      });

      setLang(l);
    },
    [],
  );

  useEffect(() => {
    if (ready || !ulLanguageList.current) return;

    const ul = ulLanguageList.current;
    const li = ul.querySelector<HTMLLIElement>(`li[data-lang="${lang}"]`);
    if (!li) return;

    handleLanguage(li, lang);

    const handleResize = () => {
      const btn = ul.querySelector<HTMLButtonElement>("button");
      if (!btn) return;
      btn.style.transitionProperty = "none";
      handleLanguage(li, lang);
      requestAnimationFrame(() => {
        btn.style.transitionProperty = "";
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [ready, lang, handleLanguage]);

  return (
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-[3px] flex items-end text-white ${status ? "visible opacity-100" : "invisible opacity-0"} transition-all duration-300`}
      onClick={() => onClick(false)}
    >
      <div
        className={`bg-[#14171F] w-full h-[90%] max-w-125 mx-auto rounded-t-2xl border px-3 border-white/5 relative ${status ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"} duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="mx-auto mt-3 block h-1.5 w-11 bg-input-color cursor-grab border border-white/5 rounded-2xl"
        ></button>

        <button
          type="button"
          className="absolute top-3 right-3 text-gray-500 cursor-pointer"
          onClick={() => onClick(false)}
        >
          <X size={20} />
        </button>

        <h1 className="text-center mt-2 text-sm sm:text-lg">{t("h1")}</h1>

        <div className="mt-4">
          <h1 className="text-sm sm:text-[15px] mb-2">{t("lang")}</h1>

          <ul
            ref={ulLanguageList}
            className="relative grid grid-cols-3 p-1.25 text-xs rounded-sm sm:text-[13px] bg-[#1F222A] border border-white/3"
          >
            {Language.map(([code, label]) => {
              return (
                <li
                  key={code}
                  data-lang={code}
                  onClick={(e) => handleLanguage(e.currentTarget, code)}
                  className="px-3 py-1.75 cursor-pointer z-10"
                >
                  {label}
                </li>
              );
            })}

            <button
              type="button"
              className="absolute duration-300 bg-button-color rounded-sm z-9"
            ></button>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Setting;
