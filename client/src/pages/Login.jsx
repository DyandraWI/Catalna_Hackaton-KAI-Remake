import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Train } from "lucide-react";

export default function Login({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ambil users dari localStorage (disimpan saat register)
    const users = JSON.parse(localStorage.getItem("kai_users") || "[]");
    const user = users.find((u) => u.email === form.email.trim());

    if (!user) {
      setError("Email tidak terdaftar.");
      return;
    }
    if (user.password !== form.password) {
      setError("Password salah.");
      return;
    }

    // Login success: simpan profile ke localStorage & inform App
    localStorage.setItem("user_profile", JSON.stringify(user.profile));
    if (typeof onAuth === "function") onAuth(); // beri tahu App bahwa sudah login
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#002571] to-[#003DA5] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Train className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#002571]">Masuk ke KAI Booking</h1>
          <p className="text-gray-500 mt-2">Selamat datang kembali!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <Mail size={16} className="text-[#002571]" />
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="contoh@email.com"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <Lock size={16} className="text-[#002571]" />
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Masukkan password"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#F06A25] to-[#E6251C] text-white py-3 rounded-lg font-bold hover:shadow-2xl hover:scale-105 transition-all"
          >
            Masuk
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#002571] font-semibold hover:text-[#F06A25] transition">
            Daftar di sini
          </Link>
        </p>

        <div className="text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-[#002571] transition">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
