import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6">
      <div className="w-full max-w-sm bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-white">
        <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-4 rounded-2xl border border-gray-700 bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition shadow-md"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-4 rounded-2xl border border-gray-700 bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition shadow-md"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 rounded-2xl font-semibold text-lg transition shadow-xl disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
