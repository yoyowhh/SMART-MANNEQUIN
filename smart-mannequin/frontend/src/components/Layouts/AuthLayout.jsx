import { Outlet } from "react-router-dom";
import Footer from "../Fragments/Footer";

export const AuthLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};
