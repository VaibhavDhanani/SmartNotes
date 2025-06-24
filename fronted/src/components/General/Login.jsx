import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { loginUser } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { toast } from "react-toastify";

const Login = ({ isLogin, toggleForm }) => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const {updateUser} = useUser();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLoginSubmit = async  (e) => {
    e.preventDefault();
    const data = await loginUser(loginData);
    await updateUser(data);
    toast.success("Login done successfully");
    navigate('/');
  };

  return (
    <div>
      <div
        className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${
          isLogin ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="space-y-6">
          <div className="space-y-1">
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                value={loginData.email}
                onChange={handleLoginChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="test1@test.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={loginData.password}
                onChange={handleLoginChange}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="test@123"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-400" />
                ) : (
                  <Eye size={18} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={handleLoginSubmit}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              Login
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={toggleForm}
              className="font-medium text-blue-500 hover:text-blue-600 transition-colors duration-300"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
