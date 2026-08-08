import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="size-full">
      <Outlet />
    </div>
  );
}

export default Layout;
