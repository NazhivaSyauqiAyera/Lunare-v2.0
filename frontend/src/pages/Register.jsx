import { Link } from "react-router-dom";
import { FaMoon } from "react-icons/fa";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">

      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">

        <div className="flex justify-center mb-5">
          <div className="bg-[#E8B4D3] p-4 rounded-full">
            <FaMoon className="text-white text-3xl" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Start tracking your cycle beautifully
        </p>

        <form className="space-y-5">

          <input
            type="text"
            placeholder="Username"
            className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#E8B4D3]"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#E8B4D3]"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#E8B4D3]"
          />

          <button
            className="w-full bg-[#E8B4D3] hover:bg-[#d99ac1] text-white p-4 rounded-xl font-semibold transition"
          >
            Register
          </button>

        </form>

        <p className="text-center mt-6 text-gray-500">
          Already have an account?{" "}

          <Link
            to="/"
            className="text-[#B57EDC] font-semibold"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;