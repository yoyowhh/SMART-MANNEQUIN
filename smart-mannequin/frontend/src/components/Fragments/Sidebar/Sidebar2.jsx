import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SoundSvg from "../../Svg/livescreen/SoundSvg";
import CameraSvg from "../../Svg/livescreen/CameraSvg";
import WitSvg from "../../Svg/livescreen/WitSvg";
import ScaleSvg from "../../Svg/livescreen/ScaleSvg";
import DownloadSvg from "../../Svg/livescreen/DownloadSvg";
import GyroSvg from "../../Svg/livescreen/GyroSvg";
import GyroscopeSvg from "../../Svg/livescreen/GyroscopeSvg";
import HeartRateSvg from "../../Svg/livescreen/HeartRateSvg";
import SoundMaxSvg from "../../Svg/livescreen/SoundMaxSvg";
import GasSvg from "../../Svg/livescreen/GasSvg";
import {
  BiChevronsLeft,
  BiChevronsRight,
  BiChevronDown,
  BiChevronUp,
} from "react-icons/bi";

import React, { useState, useCallback } from "react";

const Sidebar2 = ({ collapsed, handleCollapsedChange, isMobileView }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const handleActiveMenu = useCallback(
    (path) => {
    },
    [pathname],
  );

  const handleChangeIconColor = () => {
    sensorList.map((sensor, index) => {
      sensor.icon = <SoundSvg color />;
    });
  };

  let thisColor = "white";

  const sensorList = [
    {
      label: "sensor.sound",
      path: "/mannequin2/sensor/sound",
      icon: <SoundSvg color={thisColor} />,
    },
    { label: "sensor.gas", path: "/mannequin2/sensor/gas", icon: <GasSvg /> },
    {
      label: "sensor.lidar",
      path: "/mannequin2/sensor/lidar",
      icon: <SoundMaxSvg />,
    },
    {
      label: "sensor.camera",
      path: "/mannequin2/sensor/camera",
      icon: <CameraSvg />,
    },
    { label: "sensor.wit", path: "/mannequin2/sensor/wit", icon: <WitSvg /> },
    {
      label: "sensor.adxl",
      path: "/mannequin2/sensor/adxl",
      icon: <GyroSvg />,
    },
    {
      label: "sensor.mpu6050",
      path: "/mannequin2/sensor/mpu6050",
      icon: <GyroscopeSvg />,
    },
    {
      label: "sensor.bme",
      path: "/mannequin2/sensor/bme",
      icon: <HeartRateSvg />,
    },
    {
      label: "sensor.loadcell",
      path: "/mannequin2/sensor/loadcell",
      icon: <ScaleSvg />,
    },
    {
      label: "sensor.smartskin",
      path: "/mannequin2/sensor/smartskin",
      icon: <DownloadSvg />,
    },
  ];
  return (
    <>
      {isMobileView ? (
        <div className="w-full bg-white shadow-md sticky top-20 z-50">
          <button
            onClick={toggleMobileMenu}
            className="w-full p-4 text-left flex items-center justify-between">
            <span>Menu</span>
            {mobileMenuOpen ? <BiChevronUp /> : <BiChevronDown />}
          </button>
          {mobileMenuOpen && (
            <div className="bg-white shadow-md">
              <Menu
                className="max-h-[80vh] overflow-y-auto"
                menuItemStyles={{
                  button: ({ level, active, disabled }) => {
                    return {
                      margin: "0 auto",
                      width: "100%",
                      color: active ? "#fff" : "#000",

                      backgroundColor: active ? "#00ba88" : undefined,
                      borderRadius: "12px",
                      "&:hover": {
                        backgroundColor: "#00ba88",
                        color: "#fff",
                        transition: "all 0.33s ease-in-out",
                      },
                    };
                  },
                }}>
                {/* Your existing menu items */}
                {sensorList.map((sensor, index) => (
                  <MenuItem
                    key={index}
                    component={<Link to={sensor.path} />}
                    icon={React.cloneElement(sensor.icon, {
                      color: sensor.path === pathname ? "#fff" : undefined,
                    })}
                    active={sensor.path === pathname}
                    onClick={() => {
                      handleActiveMenu(sensor.path);
                      toggleMobileMenu(); // Close menu after selection
                    }}>
                    {t(sensor.label)}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          )}
        </div>
      ) : (
        <ProSidebar collapsed={collapsed} className="h-[130vh]">
          <Menu
            className="overflow-y-auto"
            menuItemStyles={{
              button: ({ level, active, disabled }) => {
                return {
                  margin: "0 auto",
                  width: "100%",
                  color: active ? "#fff" : "#000",

                  backgroundColor: active ? "#00ba88" : undefined,
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "#00ba88",
                    color: "#fff",
                    transition: "all 0.33s ease-in-out",
                  },
                };
              },
            }}>

            <SubMenu
              icon={<img src="/images/stas-rg/pin-stas.png" />}
              label={t("Mannequin")}>
              <MenuItem onClick={() => navigate("/")}>
                {t("Mannequin")} 1
              </MenuItem>
              <MenuItem onClick={() => navigate("/mannequin2")}>
                {t("Mannequin")} 2
              </MenuItem>
            </SubMenu>

            <hr className="my-2" />

            <p className="opacity-70 pl-2 cursor-default mt-4">Sensor</p>

            {sensorList.map((sensor, index) => (
              <MenuItem
                key={index}
                component={<Link to={sensor.path} />}
                icon={React.cloneElement(sensor.icon, {
                  color: sensor.path === pathname ? "#fff" : undefined,
                })}
                active={sensor.path === pathname}
                onClick={() => handleActiveMenu(sensor.path)}>
                {t(sensor.label)}
              </MenuItem>
            ))}
          </Menu>
        </ProSidebar>
      )}
    </>
  );
};

export default Sidebar2;
