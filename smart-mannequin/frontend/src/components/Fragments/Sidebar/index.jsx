import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SoundSvg from "../../Svg/livescreen/SoundSvg";
import CameraSvg from "../../Svg/livescreen/CameraSvg";
import WitSvg from "../../Svg/livescreen/WitSvg";
import ScaleSvg from "../../Svg/livescreen/ScaleSvg";
import GyroSvg from "../../Svg/livescreen/GyroSvg";
import GyroscopeSvg from "../../Svg/livescreen/GyroscopeSvg";
import HeartRateSvg from "../../Svg/livescreen/HeartRateSvg";
import SoundMaxSvg from "../../Svg/livescreen/SoundMaxSvg";
import GasSvg from "../../Svg/livescreen/GasSvg";
import DownloadSvg from "../../Svg/livescreen/DownloadSvg";
import {
  BiChevronsLeft,
  BiChevronsRight,
  BiChevronDown,
  BiChevronUp,
} from "react-icons/bi";

import React, { useState, useCallback } from "react";
import { LayoutDashboard, Users, Bot } from "lucide-react";

const Sidebar = ({ collapsed, handleCollapsedChange, isMobileView }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  const params = useParams();
  const mannequinId = params?.id || 1;

  const isDashboardActive =
    pathname === "/" ||
    pathname === `/${mannequinId}` ||
    pathname === "/1" ||
    pathname === "/2";

  const isMannequinActive =
    pathname.includes("/mannequin") || pathname.includes("/manekin");

  const isTeamActive = pathname.includes("/team");

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const handleActiveMenu = useCallback((path) => {}, [pathname]);
  const handleNavigation = (path) => {
    navigate(path);
  };

  const sensorList = [
    {
      label: "sensor.sound",
      path: "/sensor/sound",
      icon: <SoundSvg />,
    },
    { label: "sensor.gas", path: "/sensor/gas", icon: <GasSvg /> },
    { label: "sensor.lidar", path: "/sensor/lidar", icon: <SoundMaxSvg /> },
    { label: "sensor.camera", path: "/sensor/camera", icon: <CameraSvg /> },

    { label: "sensor.adxl", path: "/sensor/adxl", icon: <GyroSvg /> },

    {
      label: "sensor.mpu6050",
      path: "/sensor/mpu6050",
      icon: <GyroscopeSvg />,
    },
    { label: "sensor.bme", path: "/sensor/bme", icon: <HeartRateSvg /> },

    { label: "sensor.loadcell", path: "/sensor/loadcell", icon: <ScaleSvg /> },
    {
      label: "sensor.smartskin",
      path: "/sensor/smartskin",
      icon: <DownloadSvg />,
    },
  ];

  // Modern styling for sidebar menu items
  const modernMenuItemStyles = {
    button: ({ level, active, disabled }) => {
      return {
        margin: "3px 8px",
        width: "calc(100% - 16px)",
        padding: "0 14px",
        height: "44px",
        borderRadius: "12px",
        fontSize: "13.5px",
        fontWeight: active ? "600" : "500",
        color: active ? "#ffffff" : "#475569",
        backgroundColor: active ? "#00ba88" : "transparent",
        background: active
          ? "linear-gradient(135deg, #00ba88 0%, #009e74 100%)"
          : "transparent",
        boxShadow: active
          ? "0 4px 14px -1px rgba(0, 186, 136, 0.35)"
          : "none",
        border: active
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid transparent",
        transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          background: active
            ? "linear-gradient(135deg, #00ba88 0%, #009e74 100%)"
            : "rgba(0, 186, 136, 0.08)",
          backgroundColor: active ? "#00ba88" : "rgba(0, 186, 136, 0.08)",
          color: active ? "#ffffff" : "#00ba88",
          transform: "translateX(4px)",
          boxShadow: active
            ? "0 6px 18px rgba(0, 186, 136, 0.4)"
            : "0 2px 10px rgba(0, 186, 136, 0.08)",
          borderColor: active
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(0, 186, 136, 0.2)",
        },
      };
    },
    icon: ({ active }) => ({
      color: active ? "#ffffff" : "inherit",
      transition: "color 0.2s ease, transform 0.2s ease",
    }),
  };

  return (
    <>
      {isMobileView ? (
        <div className="w-full bg-white shadow-md sticky top-20 z-50">
          <button
            onClick={toggleMobileMenu}
            className="w-full p-4 text-left flex items-center justify-between text-slate-800 font-semibold">
            <span>{t("sidebar.navMenu", "Menu Navigasi")}</span>
            {mobileMenuOpen ? <BiChevronUp className="w-5 h-5" /> : <BiChevronDown className="w-5 h-5" />}
          </button>
          {mobileMenuOpen && (
            <div className="bg-white shadow-md border-t border-slate-100">
              <Menu
                className="max-h-[80vh] overflow-y-auto py-2"
                menuItemStyles={modernMenuItemStyles}>
                <div className="px-5 py-1 mb-1">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                    {t("sidebar.mainMenu", "Menu Utama")}
                  </span>
                </div>
                <MenuItem
                  active={isDashboardActive}
                  component={<Link to={mannequinId ? `/${mannequinId}` : "/"} />}
                  icon={
                    <LayoutDashboard
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isDashboardActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                  }
                  onClick={toggleMobileMenu}
                  style={{ margin: "4px 0" }}>
                  {t("sidebar.dashboard", "Dashboard")}
                </MenuItem>

                <MenuItem
                  active={isMannequinActive}
                  component={<Link to={mannequinId ? `/${mannequinId}/mannequin` : "/mannequin"} />}
                  icon={
                    <Bot
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isMannequinActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                  }
                  onClick={toggleMobileMenu}
                  style={{ margin: "4px 0" }}>
                  {t("sidebar.mannequinVisual", "Visualisasi Manekin")}
                </MenuItem>

                <MenuItem
                  active={isTeamActive}
                  component={<Link to={mannequinId ? `/${mannequinId}/team` : "/team"} />}
                  icon={
                    <Users
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isTeamActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                  }
                  onClick={toggleMobileMenu}
                  style={{ margin: "4px 0" }}>
                  {t("informasiTim", "Informasi Tim")}
                </MenuItem>

                <div className="my-3 mx-4 border-t border-slate-100" />
                <div className="px-5 py-1 mb-1">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                    {t("sidebar.sensorTelemetry", "Sensor Telemetri")}
                  </span>
                </div>

                {sensorList.map((sensor) => {
                  const isExternal = sensor.isExternal;
                  const linkPath = isExternal
                    ? sensor.path
                    : `/${mannequinId}${sensor.path}`;
                  const isActive = !isExternal && linkPath === pathname;

                  return (
                    <MenuItem
                      key={sensor.label}
                      component={
                        isExternal ? (
                          <a
                            href={sensor.path}
                            target="_self"
                            rel="noopener noreferrer"
                          />
                        ) : (
                          <Link to={linkPath} />
                        )
                      }
                      icon={React.cloneElement(sensor.icon, {
                        color: isActive ? "#ffffff" : "#64748b",
                      })}
                      active={isActive}
                      onClick={() => {
                        if (isExternal) {
                          window.location.href = sensor.path;
                        } else {
                          handleActiveMenu(linkPath);
                          handleNavigation(linkPath);
                        }
                        toggleMobileMenu();
                      }}
                      style={{ margin: "4px 0" }}>
                      {t(sensor.label)}
                    </MenuItem>
                  );
                })}
              </Menu>
            </div>
          )}
        </div>
      ) : (
        <ProSidebar
          collapsed={collapsed}
          className="min-h-full"
          rootStyles={{
            borderRight: "1px solid #f1f5f9",
            backgroundColor: "#ffffff",
          }}>
          <Menu
            className="overflow-y-auto px-1 py-3"
            menuItemStyles={modernMenuItemStyles}>
            {!collapsed && (
              <div className="px-4 py-1 mb-1">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                  {t("sidebar.mainMenu", "Menu Utama")}
                </span>
              </div>
            )}
            <MenuItem
              active={isDashboardActive}
              component={<Link to={mannequinId ? `/${mannequinId}` : "/"} />}
              icon={
                <LayoutDashboard
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isDashboardActive
                      ? "text-white"
                      : hoveredItem === "dashboard"
                      ? "text-[#00ba88]"
                      : "text-slate-500"
                  }`}
                />
              }
              onMouseEnter={() => setHoveredItem("dashboard")}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ margin: "4px 0" }}>
              {t("sidebar.dashboard", "Dashboard")}
            </MenuItem>

            <MenuItem
              active={isMannequinActive}
              component={<Link to={mannequinId ? `/${mannequinId}/mannequin` : "/mannequin"} />}
              icon={
                <Bot
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isMannequinActive
                      ? "text-white"
                      : hoveredItem === "mannequin"
                      ? "text-[#00ba88]"
                      : "text-slate-500"
                  }`}
                />
              }
              onMouseEnter={() => setHoveredItem("mannequin")}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ margin: "4px 0" }}>
              {t("sidebar.mannequinVisual", "Visualisasi Manekin")}
            </MenuItem>

            <MenuItem
              active={isTeamActive}
              component={<Link to={mannequinId ? `/${mannequinId}/team` : "/team"} />}
              icon={
                <Users
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isTeamActive
                      ? "text-white"
                      : hoveredItem === "team"
                      ? "text-[#00ba88]"
                      : "text-slate-500"
                  }`}
                />
              }
              onMouseEnter={() => setHoveredItem("team")}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ margin: "4px 0" }}>
              {t("informasiTim", "Informasi Tim")}
            </MenuItem>

            <div className="my-3 mx-3 border-t border-slate-100" />

            {!collapsed && (
              <div className="px-4 py-1 mb-1">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                  {t("sidebar.sensorTelemetry", "Sensor Telemetri")}
                </span>
              </div>
            )}

            {sensorList.map((sensor) => {
              const isExternal = sensor.isExternal;
              const linkPath = isExternal
                ? sensor.path
                : `/${mannequinId}${sensor.path}`;
              const isActive = !isExternal && linkPath === pathname;
              const isHovered = hoveredItem === sensor.label;

              return (
                <MenuItem
                  key={sensor.label}
                  component={
                    isExternal ? (
                      <a
                        href={sensor.path}
                        target="_self"
                        rel="noopener noreferrer"
                      />
                    ) : (
                      <Link to={linkPath} />
                    )
                  }
                  icon={React.cloneElement(sensor.icon, {
                    color: isActive ? "#ffffff" : isHovered ? "#00ba88" : "#64748b",
                  })}
                  active={isActive}
                  onClick={() => {
                    if (isExternal) {
                      window.location.href = sensor.path;
                    } else {
                      handleActiveMenu(linkPath);
                      handleNavigation(linkPath);
                    }
                  }}
                  onMouseEnter={() => setHoveredItem(sensor.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ margin: "4px 0" }}>
                  {t(sensor.label)}
                </MenuItem>
              );
            })}
          </Menu>
        </ProSidebar>
      )}
    </>
  );
};

export default Sidebar;
