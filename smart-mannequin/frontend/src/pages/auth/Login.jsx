import { useState } from "react";
import { postData } from "../../service/api";
import Lottie from "react-lottie";
import { useNavigate } from "react-router-dom";
import * as loadingAnimation from "../../lottie/loading.json";
import { showError, showSuccess } from "../../helpers/sweetalert";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { buildApiUrl } from "../../service/api";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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

        showSuccess("Login Success!\nRedirecting to Dashboard").then(() => {
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
    setShowPassword(!showPassword);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div
        style={{
          backgroundImage: "url('/images/background/bg-login.svg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className="absolute w-full h-full z-0"></div>
      <form
        onSubmit={handleSubmit}
        className="z-10 p-8 w-[400px] bg-white rounded shadow-xl">
        <div className="mb-4">
          <label
            htmlFor="Email"
            className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="text"
            id="Email"
            name="Email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            <span
              onClick={togglePassword}
              className="absolute top-1 right-3 text-gray-500 cursor-pointer">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {loading ? (
            <div className="bg-blue-500 hover:bg-blue-700 w-20 text-white font-bold rounded focus:outline-none focus:shadow-outline">
              {/* Lottie Animation for Loading */}
              <Lottie options={defaultOptions} height={42} width={42} />
            </div>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Sign In
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
