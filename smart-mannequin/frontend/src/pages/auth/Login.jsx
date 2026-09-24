import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, Activity } from "lucide-react";
import { postData, buildApiUrl } from "../../service/api";
import { showError, showSuccess } from "../../helpers/sweetalert";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target);
    const data = {
      email: formData.get("Email"),
      password: formData.get("password"),
    };

    postData(buildApiUrl("/auth/signin"), data)
      .then((res) => {
        if (res.name) {
          localStorage.setItem("user", res.name);
        }
        if (res.email || data.email) {
          localStorage.setItem("user_email", res.email || data.email);
        }

        showSuccess("Login Berhasil!\nMengarahkan ke Dashboard...").then(() => {
          navigate("/");
        });
      })
      .catch(() => {
        showError("Invalid email or password");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGuestLogin = () => {
    localStorage.setItem("user", "Guest Researcher");
    localStorage.setItem("user_email", "researcher@stas.telkomuniversity.ac.id");
    showSuccess("Akses Demo Diaktifkan").then(() => {
      navigate("/");
    });
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
                STAS-RG
              </span>
              <span className="text-xs text-emerald-400 block -mt-1 font-sans font-medium tracking-wide">
                Research Center Smart Technology & Applied Science
              </span>
            </div>
          </div>

          {/* Central Mannequin Visual & Telemetry Badges */}
          <div className="relative z-10 my-8 sm:my-10 flex flex-col items-center justify-center">
            <div className="relative group max-w-[280px] sm:max-w-[340px]">
              {/* Backlight Glow for Image */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl group-hover:bg-emerald-500/30 transition-all duration-700" />
              
              <img
                src="/images/img-manekin.png"
                alt="Smart Mannequin"
                className="relative z-10 w-full h-auto object-contain max-h-[300px] sm:max-h-[380px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] transform hover:scale-[1.02] transition-transform duration-500"
                onError={(e) => {
                  // Fallback to manequin.png if img-manekin has issues
                  e.currentTarget.src = "/manequin.png";
                }}
              />
            </div>
          </div>

          {/* Headline & Subtitle matching the reference layout */}
          <div className="relative z-10 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Every detail matters in safety & comfort.
            </h1>
            <p className="text-sm sm:text-base text-slate-300/90 mt-3 font-normal leading-relaxed">
              Log in to monitor live anthropometric telemetry, posture dynamics, and cabin comfort analytics.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Rounded Form Card like in the Reference Image */}
        <div className="w-full lg:w-[480px] xl:w-[540px] bg-[#fdfbf7] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-[390px]">
            {/* Card Title */}
            <div className="text-left mb-7">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Log in to your account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Welcome back! Please enter your details.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="Email"
                  className="block text-xs font-bold text-slate-700 tracking-wide">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="Email"
                    name="Email"
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
                    placeholder="Enter your password"
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

              {/* Forgot password link */}
              <div className="flex justify-end pt-0.5">
                <span
                  onClick={() => alert("Silakan hubungi administrator laboratorium STAS untuk mereset kata sandi.")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">
                  Forgot your password?
                </span>
              </div>

              {/* Submit Button (Vibrant Green matching reference) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-[#00ba88] hover:bg-[#009e73] active:scale-[0.99] transition-all duration-200 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span>Log in</span>
                  )}
                </button>
              </div>
            </form>

            {/* Divider with "or" */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Secondary Action / Google SSO Style Button */}
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-slate-700 text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Bottom Register Link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#00ba88] hover:text-[#009e73] font-bold transition-colors">
                  Sign up
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

export default LoginPage;
