import { useNavigate } from "react-router-dom";
import { Ticket, Calendar, Train, MapPin, Users, QrCode, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("kai_history") || "[]")
  );

  const handleDelete = (idx) => {
    const confirmed = window.confirm("Yakin ingin menghapus tiket ini dari riwayat?");
    if (confirmed) {
      const updated = history.filter((_, i) => i !== idx);
      setHistory(updated);
      localStorage.setItem("kai_history", JSON.stringify(updated));
    }
  };

  const handleRebook = (item) => {
    navigate("/booking", { state: { rebook: item } });
  };

  const getStatusColor = (date) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) return "text-gray-500 bg-gray-100";
    if (bookingDate.getTime() === today.getTime()) return "text-green-600 bg-green-100";
    return "text-blue-600 bg-blue-100";
  };

  const getStatusText = (date) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) return "Selesai";
    if (bookingDate.getTime() === today.getTime()) return "Hari Ini";
    return "Akan Datang";
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Pemesanan</h1>
          <p className="text-gray-500 mt-1">
            Lihat semua tiket yang pernah dipesan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Total Tiket</p>
            <p className="text-2xl font-bold text-gray-800">{history.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Perjalanan Hari Ini</p>
            <p className="text-2xl font-bold text-green-600">
              {history.filter(item => {
                const bookingDate = new Date(item.date);
                const today = new Date();
                return bookingDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Total Penumpang</p>
            <p className="text-2xl font-bold text-blue-600">
              {history.reduce((sum, item) => sum + (item.passenger || 1), 0)}
            </p>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Belum Ada Riwayat
            </h3>
            <p className="text-gray-500 mb-6">
              Tiket yang sudah dipesan akan muncul di sini
            </p>
            <button
              onClick={() => navigate("/booking")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Pesan Tiket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="p-6">
                  {/* Header Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Ticket className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kode Booking</p>
                        <p className="text-xl font-bold text-blue-600">{item.id}</p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        item.date
                      )}`}
                    >
                      {getStatusText(item.date)}
                    </span>
                  </div>

                  {/* Route Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">Dari</p>
                        <p className="text-lg font-bold text-gray-800">
                          {item.origin.split(" (")[0]}
                        </p>
                        <p className="text-sm text-gray-600">{item.origin}</p>
                      </div>

                      <div className="flex-shrink-0 mx-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                          <Train className="text-blue-600" size={24} />
                        </div>
                      </div>

                      <div className="flex-1 text-right">
                        <p className="text-xs text-gray-600 mb-1">Ke</p>
                        <p className="text-lg font-bold text-gray-800">
                          {item.destination.split(" (")[0]}
                        </p>
                        <p className="text-sm text-gray-600">{item.destination}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-blue-600" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Tanggal</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(item.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Train className="text-purple-600" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Kelas</p>
                        <p className="text-sm font-semibold text-gray-800 capitalize">
                          {item.className}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="text-orange-600" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Penumpang</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {item.passenger || 1} orang
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="text-green-600" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Kursi</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {Array.isArray(item.seats)
                            ? item.seats.join(", ")
                            : item.seat || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price & Time */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600">Total Pembayaran</p>
                      <p className="text-2xl font-bold text-gray-800">
                        Rp {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>Dipesan pada:</p>
                      <p>
                        {new Date(item.timeBooked).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <button
                    onClick={() => handleRebook(item)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    <RefreshCw size={18} />
                    Pesan Lagi
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        alert("QR Code: " + JSON.stringify(item, null, 2))
                      }
                      className="flex items-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 transition border border-gray-200"
                    >
                      <QrCode size={18} />
                      Lihat QR
                    </button>

                    <button
                      onClick={() => handleDelete(idx)}
                      className="flex items-center gap-2 bg-white text-red-600 px-4 py-3 rounded-lg font-semibold hover:bg-red-50 transition border border-red-200"
                    >
                      <Trash2 size={18} />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
