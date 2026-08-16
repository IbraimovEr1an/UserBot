import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../Components/BackButton";
import { useEffect, useState } from "react";
import useFetch from "../../Hook/useFetch";
import Avatar from "../../Components/Avatar";
import { type User } from "../../Type/Dashboard";
import useErrorStore from "../../Hook/useErrorStore";
import { useLanguage } from "../../Hook/useLanguage";

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

  useEffect(() => {
    if (!phone || typeof phone !== "string") {
      navigate("/dashboard");
      return;
    }

    (async () => {
      await useData({ body: { phone } });
    })();
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

  if (!isUserData || loading || ready) return null;

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

      <main>
        
      </main>
    </div>
  );
}

export default Account;
