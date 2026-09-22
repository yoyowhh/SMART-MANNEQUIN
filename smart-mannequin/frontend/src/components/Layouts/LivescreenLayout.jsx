import { Outlet, useLocation } from "react-router-dom";
import HeaderPage from "../Fragments/Header";
import Sidebar from "../Fragments/Sidebar";
import { useState, useEffect } from "react";
import Footer from "../Fragments/Footer";
import { useMediaQuery } from "react-responsive";

const LivescreenLayout = () => {
  const [isCollapse, setIsCollapse] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const location = useLocation();

  const handleCollapsedChange = () => {
    setIsCollapse(!isCollapse);
  };

  // Scroll halus ke atas setiap kali rute halaman berpindah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden">
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
      <div className="flex flex-1 min-w-0 overflow-x-hidden">
        {!isMobile && (
          <Sidebar
            collapsed={isCollapse}
            handleCollapsedChange={handleCollapsedChange}
            isMobileView={false}
          />
        )}
        <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-3 sm:pb-4 flex-1 min-w-0 bg-[#f8fafc] overflow-x-hidden">
          <div key={location.pathname} className="animate-page-enter w-full">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LivescreenLayout;
