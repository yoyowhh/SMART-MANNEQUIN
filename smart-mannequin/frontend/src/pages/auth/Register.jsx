import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, Activity } from "lucide-react";
import { postData, buildApiUrl } from "../../service/api";
import { showError, showSuccess } from "../../helpers/sweetalert";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    postData(buildApiUrl("/auth/signup"), data)
      .then(() => {
        showSuccess("Pendaftaran Berhasil!\nSilakan masuk dengan akun Anda.").then(() => {
          navigate("/login");
        });
      })
      .catch(() => {
        showError("Gagal membuat akun. Silakan periksa kembali data Anda.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1522] p-2 sm:p-4 lg:p-6 flex items-center justify-center font-sans antialiased">
      {/* Outer Shell matching the modern split card reference */}
      <div className="w-full max-w-[1400px] min-h-[92vh] rounded-[36px] bg-[#090f19] border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Atmosphere, Hero Visual, and Tagline */}
        <div className="relative flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden bg-gradient-to-br from-emerald-950/70 via-slate-950 to-[#070d18] text-white">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />

          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "36px 36px",
            }}
          />

          {/* Top Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-md shadow-sm">
              <img
                src="/images/stas-rg/logo_stas.png"
                alt="STAS Logo"
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-serif">
                STAS
              </span>
              <span className="text-xs text-emerald-400 block -mt-1 font-sans font-medium tracking-wide">
                Smart Mannequin
              </span>
            </div>
          </div>

          {/* Central Mannequin Visual & Telemetry Badges */}
          <div className="relative z-10 my-8 sm:my-10 flex flex-col items-center justify-center">
            <div className="relative group max-w-[280px] sm:max-w-[340px]">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl group-hover:bg-emerald-500/30 transition-all duration-700" />
              
              <img
                src="/images/img-manekin.png"
                alt="Smart Mannequin"
                className="relative z-10 w-full h-auto object-contain max-h-[300px] sm:max-h-[380px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] transform hover:scale-[1.02] transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = "/manequin.png";
                }}
              />

              {/* Floating Telemetry Chips */}
              <div className="absolute -left-4 top-1/4 z-20 backdrop-blur-md bg-slate-900/80 border border-emerald-500/30 rounded-2xl px-3 py-1.5 shadow-lg text-[11px] text-emerald-300 flex items-center gap-1.5 hidden sm:flex">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SmartSkin • Active</span>
              </div>
              <div className="absolute -right-4 bottom-1/4 z-20 backdrop-blur-md bg-slate-900/80 border border-teal-500/30 rounded-2xl px-3 py-1.5 shadow-lg text-[11px] text-teal-300 flex items-center gap-1.5 hidden sm:flex">
                <Activity className="w-3 h-3 text-teal-400" />
                <span>LiDAR & IMU • Connected</span>
              </div>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="relative z-10 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Join the research on passenger comfort.
            </h1>
            <p className="text-sm sm:text-base text-slate-300/90 mt-3 font-normal leading-relaxed">
              Create an account to access live sensor data, calibration tools, and telemetry exports.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Rounded Form Card like in Reference */}
        <div className="w-full lg:w-[480px] xl:w-[540px] bg-[#fdfbf7] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-[390px]">
            {/* Card Title */}
            <div className="text-left mb-7">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create an account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Register to get access to telemetry dashboards.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-xs font-bold text-slate-700 tracking-wide">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#00ba88] focus:ring-2 focus:ring-[#00ba88]/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700 tracking-wide">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#00ba88] focus:ring-2 focus:ring-[#00ba88]/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    minLength={8}
                    placeholder="At least 8 characters"
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm rounded-2xl py-3 pl-10 pr-11 focus:outline-none focus:border-[#00ba88] focus:ring-2 focus:ring-[#00ba88]/20 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-[#00ba88] hover:bg-[#009e73] active:scale-[0.99] transition-all duration-200 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <span>Create account</span>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Login Link */}
            <div className="mt-7 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#00ba88] hover:text-[#009e73] font-bold transition-colors">
                  Log in
                </Link>
              </p>
            </div>

            {/* Institutional Subtext */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ba88]" />
              <span>Telkom University • Smart Anthropometric Mannequin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;