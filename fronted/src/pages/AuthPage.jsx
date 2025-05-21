import { useState } from "react";
import { Eye, EyeOff, Mail, User, Lock, UserRound } from "lucide-react";
import SignUp from "../components/SignUp";
import Login from "../components/Login";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        {/* <div className="text-3xl font-bold">Hello</div> */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-200 rounded-full p-1 flex w-full max-w-xs">
            <button
              onClick={() => setIsLogin(true)}
              className={`py-2 w-1/2 rounded-full transition-all duration-300 ease-in-out font-medium ${
                isLogin ? "bg-blue-500 text-white shadow-md" : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`py-2 w-1/2 rounded-full transition-all duration-300 ease-in-out font-medium ${
                !isLogin ? "bg-blue-500 text-white shadow-md" : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form container with transition */}
        <div
          className="relative overflow-hidden"
          style={{ height: isLogin ? "300px" : "460px" }}
        >
          {/* Login Form */}
          <Login isLogin={isLogin} toggleForm={toggleForm} />

          {/* Sign Up Form */}
          <SignUp isLogin={isLogin} toggleForm={toggleForm} />
        </div>
      </div>
    </div>
  );
}
