import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import useCloudTelegram from "./useCloudTelegram";

type Lang = "uz" | "en" | "ru";
type Translations = Record<string, string>;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  nameSpace: (name: string) => Promise<Translations>;
}

type modulePromise = Record<string, () => Promise<{ default: Translations }>>;
const modules = import.meta.glob("../lang/*/*.json") as modulePromise;
const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Lang>("uz");
  const cache = useRef<Record<string, Translations | undefined>>({});
  const inFlight = useRef<Record<string, Promise<Translations> | undefined>>(
    {},
  );

  const handleNameSpace = useCallback(
    async (ns: string): Promise<Translations> => {
      const cacheKey = `${language}:${ns}`;

      if (cache.current[cacheKey]) {
        return cache.current[cacheKey]!;
      }

      if (inFlight.current[cacheKey]) {
        return inFlight.current[cacheKey]!;
      }

      const mod = modules[`../lang/${language}/${ns}.json`];
      if (!mod) return {};

      const pr = mod().then((m) => {
        cache.current[cacheKey] = m.default;
        delete inFlight.current[cacheKey];
        return m.default;
      });

      inFlight.current[cacheKey] = pr;
      return pr;
    },
    [language],
  );

  useEffect(() => {
    (async () => {
      const languageCode = await useCloudTelegram.getItems(["language_code"]);

      if (!languageCode.language_code?.trim()) {
        await useCloudTelegram.setItem("language_code", "uz");
        setLanguage("uz");
        return;
      }

      setLanguage(languageCode.language_code as Lang);
    })();
  }, []);

  const setLang = useCallback(async (lang: Lang) => {
    try {
      setLanguage(lang);
      await useCloudTelegram.setItem("language_code", lang);
    } catch (err) {
      console.error("Language error - ", err);
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{ lang: language, setLang, nameSpace: handleNameSpace }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

const useTransition = () => {
  const tx = useContext(LanguageContext);
  if (!tx) throw new Error("use-language");
  return tx;
};

export const useLanguage = (n: string) => {
  const { lang, nameSpace, setLang } = useTransition();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [ready, setReady] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setReady(true);

    nameSpace(n).then((d) => {
      if (!cancelled) {
        setTranslations(d);
        setReady(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [lang, n, nameSpace]);

  const t = (key: string) => translations[key] ?? key;

  return { t, ready, lang, setLang };
};
