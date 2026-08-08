import { useCallback, useState } from "react";
import useCloudTelegram from "./useCloudTelegram";

type RecordType = Record<string, unknown>;

interface useDataProps {
  method?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
  headers?: RecordType;
  body?: RecordType;
  cookie?: boolean;
}

type useDataFn = (options: useDataProps) => Promise<RecordType>;

interface useFetchProps {
  error: string;
  loading: boolean;
  useData: useDataFn;
  data: Record<string, unknown>;
}

const RequestsURL: string = import.meta.env.VITE_BACKEND_URL;

function useFetch(url: string): useFetchProps {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<Record<string, unknown>>({});

  const useData: useDataFn = useCallback(
    async ({ method = "POST", headers = {}, body = {}, cookie = false }) => {
      setData({});
      setError("");
      setLoading(true);

      if (!RequestsURL) {
        setLoading(false);
        setError("server-error");
        return { success: false };
      }

      let fetchOptions: RecordType = {
        method,
        credentials: cookie ? "include" : "same-origin",
      };

      const isTelegram =
        typeof window !== "undefined" && window.Telegram?.WebApp?.CloudStorage;

      if (isTelegram) {
        try {
          const saved = await useCloudTelegram.getItems(["token"]);
          headers.Authorization = `Bearer ${saved?.token}`;
        } catch (err) {}
      }

      if (body && method !== "GET") {
        fetchOptions.headers = {
          "Content-Type": "application/json",
          ...headers,
        };
        fetchOptions.body = JSON.stringify(body);
      }

      try {
        const response = await fetch(`${RequestsURL}${url}`, fetchOptions);
        const text = await response.text();
        const rows = text ? JSON.parse(text) : {};
        if (!response.ok) throw new Error(rows.message || "server-error");

        setData(rows);
        return rows;
      } catch (err) {
        let message: string = "server-error";

        if (err instanceof TypeError) {
          message = "server-error";
        } else if (err instanceof Error && err.message) {
          message = err.message;
        }

        setError(message);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  return { loading, error, data, useData };
}

export default useFetch;
