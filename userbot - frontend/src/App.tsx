import { useTgViewport, isTelegramStatus } from "./Hook/useTelegramViewport";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import ErrorModule from "./Layout/ErrorModule";
import Loading from "./Layout/Loading";
import { Fragment, lazy, Suspense, useEffect } from "react";
import "./App.css";
import ErrorContentModule from "./Components/ErrorContentModule";

const MyAccounts = lazy(() => import("./app/Dashboard/My-Accounts"));
const Authenticator = lazy(() => import("./app/Auth/Authenticator"));
const Dashboard = lazy(() => import("./app/Dashboard/Layout"));
const Account = lazy(() => import("./app/Dashboard/Account"));
const Auth = lazy(() => import("./app/Auth/Layout"));
const Login = lazy(() => import("./app/Auth/Login"));
const Code = lazy(() => import("./app/Auth/Code"));

const Router = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect("/dashboard"),
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        index: true,
        element: <MyAccounts />,
      },
      {
        path: "account/:phone",
        element: <Account />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "code",
        element: <Code />,
      },
      {
        path: "authenticator",
        element: <Authenticator />,
      },
    ],
  },
]);

function App() {
  const [loading, status] = useTgViewport();

  if (loading === "loading") {
    return <Loading />;
  }

  if (isTelegramStatus(status)) {
    return <ErrorModule error={status} />;
  }

  return (
    <Fragment>
      <ErrorContentModule />

      <Suspense fallback={<Loading />}>
        <RouterProvider router={Router} />
      </Suspense>
    </Fragment>
  );
}

export default App;
