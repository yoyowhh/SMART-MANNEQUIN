import React, { useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronDown,
  Bell,
  LogOut,
  User,
  Check,
  PanelLeft,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { showConfirmation, showSuccess } from "../../../helpers/sweetalert";

const HeaderPage = ({ isCollapse, handleCollapsedChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [currentLang, setCurrentLang] = useState(
    i18n.resolvedLanguage || i18n.language || "id"
  );
  const [isMannequinOpen, setIsMannequinOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const mannequinRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const param = useParams();
  const mannequinId = param?.id || 1;

  // Nama pengguna dari localStorage atau default Yohana Meilyawati
  const storedUser = localStorage.getItem("user");
  const userName =
    storedUser && storedUser !== "User" ? storedUser : "Yohana Meilyawati";

  // Email pengguna yang sedang login
  const getUserEmail = () => {
    const fromStorage =
      localStorage.getItem("user_email") ||
      localStorage.getItem("email");
    if (fromStorage) return fromStorage;

    try {
      const token = Cookies.get("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload?.email) return payload.email;
      }
    } catch (e) {
      // ignore
    }

    return "yohana@stas-rg.com";
  };

  const userEmail = getUserEmail();

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mannequinRef.current &&
        !mannequinRef.current.contains(event.target)
      ) {
        setIsMannequinOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update currentLang jika i18n berubah
  useEffect(() => {
    if (i18n.resolvedLanguage) {
      setCurrentLang(i18n.resolvedLanguage);
    }
  }, [i18n.resolvedLanguage]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    showConfirmation("Apakah Anda yakin ingin keluar / logout?").then(
      (result) => {
        if (result) {
          localStorage.removeItem("user");
          localStorage.removeItem("user_email");
          Cookies.remove("token");
          Cookies.remove("expirationTime");

          showSuccess("Logout Berhasil!").then(() => {
            navigate("/login");
          });
        }
      }
    );
  };

  // Navigasi ganti manekin
  const switchMannequin = (targetId) => {
    setIsMannequinOpen(false);
    const path = location.pathname;
    // Jika path ada id (/1/sensor/... atau /2/sensor/...)
    if (path.match(/^\/\d+(\/.*)?$/)) {
      const newPath = path.replace(/^\/\d+/, `/${targetId}`);
      navigate(newPath);
    } else {
      navigate(`/${targetId}`);
    }
  };

  // Breadcrumb items generator
  const getBreadcrumbs = () => {
    const path = location.pathname.toLowerCase();
    const homePath = mannequinId ? `/${mannequinId}` : "/";
    const smartskinPath = mannequinId ? `/${mannequinId}/sensor/smartskin` : "/sensor/smartskin";

    const crumbs = [
      { label: "STAS RG", path: homePath }
    ];

    // Detail sensor smartskin (sub-sensor)
    if (path.includes("/sensor/smartskin/")) {
      crumbs.push({ label: "SmartSkin", path: smartskinPath });
      if (path.includes("/temp")) {
        crumbs.push({ label: "SmartSkin Suhu" });
      } else if (path.includes("/press")) {
        crumbs.push({ label: "SmartSkin Tekanan" });
      } else if (path.includes("/vib")) {
        crumbs.push({ label: "SmartSkin Getaran" });
      } else if (path.includes("/flex")) {
        crumbs.push({ label: "SmartSkin Flex" });
      } else {
        crumbs.push({ label: "SmartSkin Detail" });
      }
      return crumbs;
    }

    if (path.includes("/sensor/smartskin")) {
      crumbs.push({ label: "SmartSkin" });
      return crumbs;
    }

    if (path.includes("/sensor/loadcell")) {
      crumbs.push({ label: "Sensor Load Cell" });
      return crumbs;
    }

    if (path.includes("/sensor/sound")) {
      crumbs.push({ label: "Sensor Suara" });
      return crumbs;
    }

    if (path.includes("/sensor/gas")) {
      crumbs.push({ label: "Sensor Gas" });
      return crumbs;
    }

    if (path.includes("/sensor/lidar")) {
      crumbs.push({ label: "Sensor LiDAR" });
      return crumbs;
    }

    if (path.includes("/sensor/camera")) {
      crumbs.push({ label: "Kamera Thermal" });
      return crumbs;
    }

    if (path.includes("/sensor/adxl")) {
      crumbs.push({ label: "Sensor ADXL345" });
      return crumbs;
    }

    if (path.includes("/sensor/mpu6050")) {
      crumbs.push({ label: "Sensor MPU6050" });
      return crumbs;
    }

    if (path.includes("/sensor/bme")) {
      crumbs.push({ label: "Sensor BME280" });
      return crumbs;
    }

    if (path.includes("/sensor/wit")) {
      crumbs.push({ label: "Sensor Wit Motion" });
      return crumbs;
    }

    if (path.includes("/team")) {
      crumbs.push({ label: "Informasi Tim" });
      return crumbs;
    }

    if (path.includes("/mannequin") || path.includes("/manekin")) {
      crumbs.push({ label: "Visualisasi Manekin" });
      return crumbs;
    }

    crumbs.push({ label: "Dashboard Overview" });
    return crumbs;
  };

  return (
    <header className="sticky top-0 bg-white border-b border-slate-200 h-16 shadow-xs z-50 flex items-center justify-between px-4 sm:px-6">
      {/* Bagian Kiri: Logo, Title, Sidebar Toggle, & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/images/stas-rg/logo_stas.png"
            alt="STAS RG"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 leading-tight text-base tracking-tight">
              STAS RG
            </span>
            <span className="text-[11px] font-semibold text-[#00ba88] leading-none">
              Smart Mannequin
            </span>
          </div>
        </Link>

        {/* Separator vertikal */}
        <div className="h-7 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

        {/* Tombol Toggle Sidebar */}
        <button
          onClick={handleCollapsedChange}
          className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center justify-center shadow-xs"
          title={isCollapse ? "Buka Sidebar" : "Tutup Sidebar"}>
          <svg
            className="w-5 h-5 text-slate-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            <path d="m14 9-3 3 3 3" />
          </svg>
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-sm ml-1">
          {getBreadcrumbs().map((crumb, idx, arr) => {
            const isLast = idx === arr.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && <span className="text-slate-400 font-normal">›</span>}
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    className="font-semibold text-[#0284c7] hover:underline transition">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-bold text-slate-800" : "font-medium text-slate-500"}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Bagian Kanan: Pill Manekin, Bahasa, Mode, Notifikasi, & Profil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dropdown Pill Manekin */}
        <div className="relative" ref={mannequinRef}>
          <button
            onClick={() => setIsMannequinOpen(!isMannequinOpen)}
            className="flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 py-1.5 rounded-full border border-slate-200 transition text-xs sm:text-sm font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ba88] inline-block" />
            <span>Manekin {mannequinId}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                isMannequinOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMannequinOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Manekin
              </div>
              <button
                onClick={() => switchMannequin(1)}
                className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition ${
                  String(mannequinId) === "1"
                    ? "text-[#00ba88] font-bold bg-[#00ba88]/10"
                    : "text-slate-700"
                }`}>
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      String(mannequinId) === "1"
                        ? "bg-[#00ba88]"
                        : "bg-slate-300"
                    }`}
                  />
                  Manekin 1
                </span>
                {String(mannequinId) === "1" && (
                  <Check className="w-4 h-4 text-[#00ba88]" />
                )}
              </button>
              <button
                onClick={() => switchMannequin(2)}
                className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition ${
                  String(mannequinId) === "2"
                    ? "text-[#00ba88] font-bold bg-[#00ba88]/10"
                    : "text-slate-700"
                }`}>
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      String(mannequinId) === "2"
                        ? "bg-[#00ba88]"
                        : "bg-slate-300"
                    }`}
                  />
                  Manekin 2
                </span>
                {String(mannequinId) === "2" && (
                  <Check className="w-4 h-4 text-[#00ba88]" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Dual Flag Language Toggle Pill */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-full border border-slate-200">
          <button
            onClick={() => changeLanguage("id")}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${
              currentLang === "id"
                ? "bg-[#00ba88] ring-2 ring-[#00ba88]/30 shadow-xs scale-105"
                : "opacity-60 hover:opacity-100 hover:bg-slate-200"
            }`}
            title="Bahasa Indonesia">
            <ReactCountryFlag
              countryCode="ID"
              svg
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </button>
          <button
            onClick={() => changeLanguage("en")}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${
              currentLang === "en"
                ? "bg-[#00ba88] ring-2 ring-[#00ba88]/30 shadow-xs scale-105"
                : "opacity-60 hover:opacity-100 hover:bg-slate-200"
            }`}
            title="English (UK)">
            <ReactCountryFlag
              countryCode="GB"
              svg
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </button>
        </div>


        {/* Notification Button */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#F1F5F9] border border-slate-200 hover:bg-[#E2E8F0] text-slate-700 transition"
            title="Notifikasi">
            <Bell className="w-4 h-4 text-slate-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              3
            </span>
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <span className="font-bold text-xs text-slate-800">
                  Notifikasi Sistem
                </span>
                <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                  3 Aktif
                </span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <p className="font-semibold text-slate-800">
                    Sensor Load Cell Terhubung
                  </p>
                  <p className="text-[11px] text-slate-500">
                    5 sensor load cell aktif membaca data
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <p className="font-semibold text-slate-800">
                    Smart Skin Real-Time
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Koneksi WebSocket socket.io terhubung
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                  <p className="font-semibold text-slate-800">LoRa Gateway</p>
                  <p className="text-[11px] text-slate-500">
                    Sinyal frekuensi 920MHz stabil
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill with Logout Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] pl-1.5 pr-3 py-1 rounded-full border border-slate-200 cursor-pointer transition text-xs sm:text-sm font-medium text-slate-800">
            <img
              src="/images/gweh.png"
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-xs"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=Yohana+Meilyawati&background=0284c7&color=fff&bold=true";
              }}
            />
            <span className="hidden sm:inline font-semibold">{userName}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu Profil & Logout */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Info Pengguna */}
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl mb-2">
                <img
                  src="/images/gweh.png"
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://ui-avatars.com/api/?name=Yohana+Meilyawati&background=0284c7&color=fff&bold=true";
                  }}
                />
                <div className="flex flex-col min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">
                    {userName}
                  </p>
                  <p
                    className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]"
                    title={userEmail}>
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Garis Pemisah */}
              <div className="h-[1px] bg-slate-100 my-2" />

              {/* Tombol Logout (Di bagian profil sesuai permintaan) */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-semibold text-left group">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-200 transition">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-red-600 leading-tight">
                    Keluar / Logout
                  </span>
                  <span className="text-[10px] text-red-400 font-normal">
                    Keluar dari akun Anda
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderPage;
