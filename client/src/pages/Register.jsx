// src/pages/Register.jsx (ubah sedikit)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

   const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("kai_users") || "[]");
    if (users.some((u) => u.email === form.email.trim())) {
      setError("Email sudah terdaftar.");
      return;
    }

    const newUser = {
      email: form.email.trim(),
      password: form.password,
      profile: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
    };
    users.push(newUser);
    localStorage.setItem("kai_users", JSON.stringify(users));

    // Set profile login & beri tahu App
    localStorage.setItem("user_profile", JSON.stringify(newUser.profile));
    if (typeof onAuth === "function") onAuth();
    alert("Registrasi berhasil! Selamat datang, " + newUser.profile.name);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-[#002571] text-center">Daftar Akun Baru</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Nama Lengkap</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Nomor Telepon</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Konfirmasi Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent"
            />
          </div>

          {error && <p className="text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#F06A25] text-white py-3 rounded-lg font-bold hover:bg-[#E6251C] transition"
          >
            Daftar
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#002571] font-semibold hover:text-[#F06A25]">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
