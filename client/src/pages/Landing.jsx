import { Link } from "react-router-dom";
import { 
  Train, Ticket, MapPin, Clock, Shield, Zap, 
  ArrowRight, Star, Users, Calendar, CheckCircle,
  Sparkles, TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Zap className="text-[#F06A25]" size={32} />,
      title: "Pemesanan Cepat",
      desc: "Pesan tiket kereta hanya dalam 3 langkah mudah"
    },
    {
      icon: <Shield className="text-[#002571]" size={32} />,
      title: "Aman & Terpercaya",
      desc: "Pembayaran aman dengan sistem terenkripsi"
    },
    {
      icon: <Clock className="text-[#E6251C]" size={32} />,
      title: "Real-time Tracking",
      desc: "Pantau posisi kereta secara langsung"
    },
    {
      icon: <Ticket className="text-[#002571]" size={32} />,
      title: "E-Ticket Digital",
      desc: "QR Code untuk akses mudah tanpa antri"
    }
  ];

  const stats = [
    { number: "1M+", label: "Penumpang" },
    { number: "50+", label: "Rute Kereta" },
    { number: "4.9", label: "Rating" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Traveler",
      text: "Aplikasi terbaik untuk booking tiket kereta! Sangat mudah dan cepat.",
      rating: 5
    },
    {
      name: "Siti Nurhaliza",
      role: "Mahasiswa",
      text: "First & Last Mile service-nya sangat membantu. Tidak perlu repot cari ojol lagi!",
      rating: 5
    },
    {
      name: "Andi Wijaya",
      role: "Businessman",
      text: "Real-time tracking memudahkan saya merencanakan perjalanan bisnis.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar - KAI Colors */}
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                    src="src/assets/logo_kai.svg" 
                    alt="KAI Logo" 
                    className="w-full h-full object-contain"
                />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Link
                to="/login"
                className="text-[#002571] hover:text-[#F06A25] font-medium transition"
                >
                Login
                </Link>
                <Link
                to="/register"
                className="bg-[#F06A25] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#E6251C] transition shadow-lg shadow-orange-600/30"
                >
                Register
                </Link>

            </div>
            </div>
        </div>
        </nav>


      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#002571]/10 text-[#002571] px-4 py-2 rounded-full text-sm font-semibold border border-[#002571]/20">
                <Sparkles size={16} />
                Platform Booking Kereta #1 di Indonesia
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Perjalanan Kereta
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#002571] to-[#003DA5]"> Lebih Mudah</span>
                {" "}& Nyaman
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Pesan tiket kereta, tracking real-time, dan layanan transportasi lanjutan — semua dalam satu platform modern.
              </p>

              <div className="flex items-center gap-4">
                <Link
                to="/login"
                className="bg-gradient-to-r from-[#002571] to-[#003DA5] text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/30"
                >
                Pesan Tiket Sekarang
                <ArrowRight size={20} />
                </Link>

                <button className="border-2 border-[#F06A25] text-[#F06A25] px-8 py-4 rounded-xl font-bold hover:bg-[#F06A25] hover:text-white transition">
                  Pelajari Lebih Lanjut
                </button>
              </div>

              {/* Quick Stats - KAI Colors */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl font-bold text-[#002571]">{stat.number}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Interactive Card (KAI Colors) */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#002571] to-[#003DA5] rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-blue-200 text-sm">Kode Booking</p>
                    <h3 className="text-2xl font-bold">KAI-123456</h3>
                  </div>
                  <div className="bg-[#F06A25] rounded-full p-3 shadow-lg">
                    <Ticket size={24} />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-blue-200">Dari</p>
                      <p className="text-lg font-bold">Jakarta</p>
                    </div>
                    <div className="w-12 h-12 bg-[#F06A25] rounded-full flex items-center justify-center">
                      <ArrowRight className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-200">Ke</p>
                      <p className="text-lg font-bold">Bandung</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>2 Okt 2025</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>2 Penumpang</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-200">Total</p>
                    <p className="text-2xl font-bold">Rp 150.000</p>
                  </div>
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <CheckCircle size={16} />
                    Confirmed
                  </div>
                </div>
              </div>

              {/* Floating Elements - KAI Colors */}
              <div className="absolute -top-6 -right-6 bg-[#F06A25] text-white p-4 rounded-2xl shadow-xl animate-bounce">
                <TrendingUp size={24} />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#E6251C] text-white p-4 rounded-2xl shadow-xl">
                <Shield size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - KAI Colors */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Kenapa Memilih <span className="text-[#002571]">KAI Booking?</span>
            </h2>
            <p className="text-xl text-gray-600">
              Platform booking kereta dengan fitur terlengkap dan termudah
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 ${
                  activeFeature === idx ? "border-[#F06A25] scale-105" : "border-transparent"
                }`}
                onMouseEnter={() => setActiveFeature(idx)}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - KAI Colors */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cara <span className="text-[#F06A25]">Mudah</span> Pesan Tiket
            </h2>
            <p className="text-xl text-gray-600">Hanya 3 langkah untuk perjalanan Anda</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Pilih Rute & Tanggal",
                desc: "Tentukan stasiun keberangkatan, tujuan, dan tanggal perjalanan Anda",
                icon: <MapPin size={32} className="text-[#002571]" />
              },
              {
                step: "02",
                title: "Pilih Kelas & Kursi",
                desc: "Pilih kelas kereta dan nomor kursi sesuai preferensi Anda",
                icon: <Ticket size={32} className="text-[#F06A25]" />
              },
              {
                step: "03",
                title: "Bayar & Terima E-Ticket",
                desc: "Lakukan pembayaran dan dapatkan QR Code untuk akses mudah",
                icon: <CheckCircle size={32} className="text-[#E6251C]" />
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                  <div className="text-6xl font-bold text-[#002571]/10 mb-4">{item.step}</div>
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-[#F06A25]/30" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - KAI Colors */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Apa Kata <span className="text-[#002571]">Mereka?</span>
            </h2>
            <p className="text-xl text-gray-600">Testimoni dari pengguna setia KAI Booking</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-[#F06A25] fill-[#F06A25]" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#002571] to-[#003DA5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - KAI Colors */}
      <section className="py-20 bg-gradient-to-r from-[#002571] to-[#003DA5]">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Siap untuk Perjalanan Selanjutnya?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Bergabunglah dengan jutaan pengguna yang sudah mempercayai KAI Booking
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-3 bg-[#F06A25] text-white px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-xl"
          >
            Mulai Pesan Tiket
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer - KAI Colors */}
      <footer className="bg-[#002571] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
                <img 
                    src="src/assets/logo_kai.svg" 
                    alt="KAI Logo" 
                    className="w-full h-full object-contain"
                />
                </div>
              <p className="text-blue-200">
                Platform booking kereta <br />terpercaya di Indonesia
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#F06A25]">Layanan</h4>
              <ul className="space-y-2 text-blue-200">
                <li className="hover:text-white cursor-pointer transition">Pesan Tiket</li>
                <li className="hover:text-white cursor-pointer transition">Tracking Kereta</li>
                <li className="hover:text-white cursor-pointer transition">First & Last Mile</li>
                <li className="hover:text-white cursor-pointer transition">E-Ticket</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#F06A25]">Perusahaan</h4>
              <ul className="space-y-2 text-blue-200">
                <li className="hover:text-white cursor-pointer transition">Tentang Kami</li>
                <li className="hover:text-white cursor-pointer transition">Karir</li>
                <li className="hover:text-white cursor-pointer transition">Blog</li>
                <li className="hover:text-white cursor-pointer transition">Kontak</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#F06A25]">Bantuan</h4>
              <ul className="space-y-2 text-blue-200">
                <li className="hover:text-white cursor-pointer transition">FAQ</li>
                <li className="hover:text-white cursor-pointer transition">Syarat & Ketentuan</li>
                <li className="hover:text-white cursor-pointer transition">Kebijakan Privasi</li>
                <li className="hover:text-white cursor-pointer transition">Customer Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center text-blue-200">
            <p>© 2025 KAI Booking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
