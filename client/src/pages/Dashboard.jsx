import { Link } from "react-router-dom";
import { 
  Ticket, Train, Search, History, Calendar, Clock, CreditCard, 
  ArrowRight, User, Car, Bike, Bus 
} from "lucide-react";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Dashboard() {
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("kai_history") || "[]");
    if (history.length > 0) {
      setLatestOrder(history[0]);
    }
  }, []);

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function untuk render icon transportasi yang sesuai
  const getTransportIcon = (transportId) => {
    if (!transportId) return <Car size={24} />;
    
    switch(transportId) {
      case "gojek_bike":
        return <Bike size={24} />;
      case "gojek_car":
        return <Car size={24} />;
      case "shuttle_bus":
        return <Bus size={24} />;
      default:
        return <Car size={24} />;
    }
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">
            Selamat datang kembali di KAI Dashboard 🚆
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Link
          to="/booking"
          className="bg-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pesan Tiket</p>
              <h2 className="text-3xl font-bold mt-2">+</h2>
            </div>
            <Ticket size={32} />
          </div>
        </Link>

        <Link
          to="/tracking"
          className="bg-orange-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tracking Kereta</p>
              <h2 className="text-3xl font-bold mt-2">Live</h2>
            </div>
            <Train size={32} />
          </div>
        </Link>

        <div className="bg-blue-800 text-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cek Kode Booking</p>
              <h2 className="text-3xl font-bold mt-2">QR</h2>
            </div>
            <Search size={32} />
          </div>
        </div>

        <Link
          to="/history"
          className="bg-white text-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Riwayat</p>
              <h2 className="text-3xl font-bold mt-2">
                {JSON.parse(localStorage.getItem("kai_history") || "[]").length}
              </h2>
            </div>
            <History size={32} className="text-gray-600" />
          </div>
        </Link>
      </div>

      {/* Tiket Terbaru - Enhanced */}
      {latestOrder && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🎟️ Tiket Terbaru Anda</h2>
                <p className="text-sm opacity-90 mt-1">E-Ticket Active</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-xs opacity-80">Kode Booking</p>
                <p className="text-xl font-bold">{latestOrder.id}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Section - Ticket Info */}
              <div className="col-span-2 space-y-4">
                {/* Passenger Name */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Nama Penumpang</p>
                      <p className="text-lg font-bold text-gray-800">
                        {latestOrder.passengerName || "Guest"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-3">Rute Perjalanan</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Dari</p>
                      <p className="text-lg font-bold text-gray-800">
                        {latestOrder.origin.split(" (")[0]}
                      </p>
                    </div>
                    <div className="flex-shrink-0 mx-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <ArrowRight className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm text-gray-600">Ke</p>
                      <p className="text-lg font-bold text-gray-800">
                        {latestOrder.destination.split(" (")[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Class & Seat */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Kelas</p>
                    <p className="text-lg font-bold text-purple-700 capitalize">
                      {latestOrder.className}
                    </p>
                  </div>
                  <div className="flex-1 bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <p className="text-xs text-gray-600 mb-1">Kursi</p>
                    <p className="text-lg font-bold text-orange-700">
                      {latestOrder.seats.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Transportation Add-on (UPDATED dengan dynamic icon) */}
                {latestOrder.transportAddon && latestOrder.transportAddon.id !== "none" && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        {/* Dynamic Icon berdasarkan transport ID */}
                        {getTransportIcon(latestOrder.transportAddon.id)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">Transportasi Lanjutan</p>
                        <p className="text-lg font-bold text-gray-800">
                          {latestOrder.transportAddon.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {latestOrder.transportAddon.provider}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          + Rp {latestOrder.transportPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Info Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-blue-600" />
                      <p className="text-xs text-gray-600">Tanggal</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      {formatDate(latestOrder.date)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-green-600" />
                      <p className="text-xs text-gray-600">Dipesan</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      {formatDateTime(latestOrder.timeBooked)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={16} className="text-orange-600" />
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      Rp {latestOrder.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to="/tracking"
                  className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition text-center"
                >
                  Lihat Tracking Kereta →
                </Link>
              </div>

              {/* Right Section - QR Code */}
              <div className="col-span-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 h-full flex flex-col items-center justify-center">
                  <p className="text-sm font-semibold text-gray-700 mb-4">
                    E-Ticket QR Code
                  </p>
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <QRCodeCanvas
                      value={JSON.stringify(latestOrder)}
                      size={160}
                      level="H"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-4 text-center">
                    Scan di pintu masuk stasiun
                  </p>
                  <div className="mt-4 w-full">
                    <button
                      onClick={() => window.print()}
                      className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Cetak Tiket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!latestOrder && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Belum Ada Tiket
          </h3>
          <p className="text-gray-500 mb-6">
            Pesan tiket kereta pertamamu sekarang!
          </p>
          <Link
            to="/booking"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Pesan Tiket
          </Link>
        </div>
      )}
    </div>
  );
}
