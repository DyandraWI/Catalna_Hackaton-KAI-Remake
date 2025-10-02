import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, UserPlus, Train } from "lucide-react";

export default function Register({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    password: "", 
    confirmPassword: "" 
  });
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
      profile: { 
        name: form.name.trim(), 
        email: form.email.trim(), 
        phone: form.phone.trim() 
      },
    };
    
    users.push(newUser);
    localStorage.setItem("kai_users", JSON.stringify(users));

    // TIDAK set user_profile dan TIDAK panggil onAuth()
    // Hanya simpan user ke database dan redirect ke login
    alert("Registrasi berhasil! Silakan login dengan akun Anda.");
    navigate("/login"); // Redirect ke login page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#002571] to-[#003DA5] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Train className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#002571]">Daftar Akun Baru</h1>
          <p className="text-gray-500 mt-2">Bergabunglah dengan KAI Booking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <User size={16} className="text-[#002571]" />
              Nama Lengkap
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Masukkan nama lengkap"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent transition"
            />
          </div>

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
              <Phone size={16} className="text-[#002571]" />
              Nomor Telepon
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="08xxxxxxxxxx"
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
              minLength={6}
              placeholder="Minimal 6 karakter"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F06A25] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <Lock size={16} className="text-[#002571]" />
              Konfirmasi Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Ulangi password"
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
            className="w-full bg-gradient-to-r from-[#F06A25] to-[#E6251C] text-white py-3 rounded-lg font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Daftar Sekarang
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#002571] font-semibold hover:text-[#F06A25] transition">
            Masuk di sini
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