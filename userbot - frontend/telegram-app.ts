export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          auth_data?: number;
          hash?: string;
        };
        platform: string;
        colorSchema: "light" | "dark";
        MainButton: {
          setText: (txt: string) => void;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          enable: () => void;
          disable: () => void;
          showProgress: () => void;
          hideProgress: () => void;
          color: string;
          textColor: string;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        CloudStorage: {
          setItem: (
            key: string,
            value: string,
            callback?: (error: string | null, success?: boolean) => void,
          ) => void;
          getItem: (
            key: string,
            callback: (error: string | null, value?: string) => void,
          ) => void;
          getItems: (
            keys: string[],
            callback: (
              error: string | null,
              values?: Record<string, string>,
            ) => void,
          ) => void;
          removeItem: (
            key: string,
            callback?: (error: string | null, success?: boolean) => void,
          ) => void;
          removeItems: (
            keys: string[],
            callback?: (error: string | null, success?: boolean) => void,
          ) => void;
          getKeys: (
            callback: (error: string | null, keys?: string[]) => void,
          ) => void;
        };
        viewportHeight: number;
        viewportStableHeight: number;
        onEvent: (e: string, h: () => void) => void;
        offEvent: (e: string, h: () => void) => void;
      };
    };
  }
}
