import { Fragment } from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <Fragment>
      <Outlet />
    </Fragment>
  );
}

export default Layout;
