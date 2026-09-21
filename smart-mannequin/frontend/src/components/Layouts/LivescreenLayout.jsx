import { Outlet } from "react-router-dom";
import HeaderPage from "../Fragments/Header";
import Sidebar from "../Fragments/Sidebar";
import { useState } from "react";
import Footer from "../Fragments/Footer";
import { useMediaQuery } from "react-responsive";

const LivescreenLayout = () => {
  const [isCollapse, setIsCollapse] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleCollapsedChange = () => {
    setIsCollapse(!isCollapse);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <HeaderPage
        isCollapse={isCollapse}
        handleCollapsedChange={handleCollapsedChange}
      />

      {isMobile && (
        <Sidebar
          collapsed={isCollapse}
          handleCollapsedChange={handleCollapsedChange}
          isMobileView={true}
        />
      )}

      {/* Content */}
      <div className="flex flex-grow">
        {!isMobile && (
          <Sidebar
            className="z-30 fixed overflow-scroll"
            collapsed={isCollapse}
            handleCollapsedChange={handleCollapsedChange}
            isMobileView={false}
          />
        )}
        <div className="p-6 sm:p-8 w-full bg-[#f8fafc]">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="">
        <Footer />
      </div>
    </div>
  );
};

export default LivescreenLayout;
