import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import * as loadingAnimation from "../../lottie/loading.json";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
        showSuccess("Register success! Silakan login.").then(() => {
          navigate("/login");
        });
      })
      .catch(() => {
        showError("Gagal membuat akun. Cek data yang diisi.");
      })
      .finally(() => {
        setLoading(false);
      });
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
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Nama
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
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
              onClick={() => setShowPassword((current) => !current)}
              className="absolute top-1 right-3 text-gray-500 cursor-pointer">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <p className="text-xs text-gray-500 -mt-1">Minimal 8 karakter.</p>
        </div>
        <div className="flex items-center justify-between">
          {loading ? (
            <div className="bg-blue-500 hover:bg-blue-700 w-20 text-white font-bold rounded focus:outline-none focus:shadow-outline">
              <Lottie options={defaultOptions} height={42} width={42} />
            </div>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Daftar
            </button>
          )}
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;