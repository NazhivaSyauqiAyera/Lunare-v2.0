import { Link, useNavigate } from "react-router-dom";
import { FaMoon } from "react-icons/fa";
import { useState } from "react";
import API from "../services/api";

function Login() {
    const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await API.post("/login", {
        email,
        password,
      });

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      alert("Login success 🌙");

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      alert("Invalid email or password");

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">

      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">

        <div className="flex justify-center mb-5">
          <div className="bg-[#E8B4D3] p-4 rounded-full">
            <FaMoon className="text-white text-3xl" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2">
          Lunare
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Track your cycle beautifully
        </p>

        <form 
        onSubmit={handleLogin}
        className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#E8B4D3]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#E8B4D3]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-[#E8B4D3] hover:bg-[#d99ac1] text-white p-4 rounded-xl font-semibold transition"
          >
            Login
          </button>

        </form>

        <p className="text-center mt-6 text-gray-500">
          Don’t have an account?{" "}

          <Link
            to="/register"
            className="text-[#B57EDC] font-semibold"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;