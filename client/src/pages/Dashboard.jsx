import { Link } from "react-router-dom";
import { 
  Ticket, Train, Search, History, Calendar, Clock, CreditCard, 
  ArrowRight, User, Car, Bike, Bus, X, AlertTriangle
} from "lucide-react";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Dashboard() {
  const [activeTickets, setActiveTickets] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("kai_history") || "[]");
    // Filter semua tiket yang tidak dibatalkan (status !== 'canceled')
    const activeTicketsList = history.filter(ticket => ticket.status !== 'canceled');
    setActiveTickets(activeTicketsList);
  }, []);

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

  const getTransportIcon = (transportId) => {
    if (!transportId) return <Car size={24} />;
    switch (transportId) {
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

  // Handle cancel order untuk tiket tertentu
  const handleCancelOrder = () => {
    setCancelLoading(true);

    setTimeout(() => {
      const history = JSON.parse(localStorage.getItem("kai_history") || "[]");
      
      // Update status tiket yang dipilih menjadi 'canceled'
      const updatedHistory = history.map((ticket) => {
        if (ticket.id === ticketToCancel.id && ticket.status !== 'canceled') {
          return {
            ...ticket,
            status: 'canceled',
            canceledAt: new Date().toISOString()
          };
        }
        return ticket;
      });
      
      // Simpan kembali ke localStorage
      localStorage.setItem("kai_history", JSON.stringify(updatedHistory));
      
      // Update state dengan tiket aktif yang tersisa
      const remainingActiveTickets = updatedHistory.filter(ticket => ticket.status !== 'canceled');
      setActiveTickets(remainingActiveTickets);
      
      setShowCancelModal(false);
      setCancelLoading(false);
      setTicketToCancel(null);

      alert("✅ Pesanan berhasil dibatalkan! Tiket masih dapat dilihat di riwayat pemesanan.");
      
      // Trigger re-render untuk History page
      window.dispatchEvent(new Event('storage'));
    }, 1500);
  };

  const openCancelModal = (ticket) => {
    setTicketToCancel(ticket);
    setShowCancelModal(true);
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Selamat datang kembali di KAI Dashboard 🚆
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/booking"
          className="bg-blue-600 text-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium">Pesan Tiket</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">+</h2>
            </div>
            <Ticket size={28} className="sm:w-8 sm:h-8" />
          </div>
        </Link>

        <Link
          to="/tracking"
          className="bg-orange-500 text-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium">Tracking Kereta</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">Live</h2>
            </div>
            <Train size={28} className="sm:w-8 sm:h-8" />
          </div>
        </Link>

        <div className="bg-blue-800 text-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium">Cek Kode Booking</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">QR</h2>
            </div>
            <Search size={28} className="sm:w-8 sm:h-8" />
          </div>
        </div>

        <Link
          to="/history"
          className="bg-white text-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Riwayat</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                {JSON.parse(localStorage.getItem("kai_history") || "[]").length}
              </h2>
            </div>
            <History size={28} className="sm:w-8 sm:h-8 text-gray-600" />
          </div>
        </Link>
      </div>

      {/* Active Tickets Header */}
      {activeTickets.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              🎟️ Tiket Aktif Anda ({activeTickets.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Kelola semua tiket yang sedang aktif
            </p>
          </div>
        </div>
      )}

      {/* Multiple Active Tickets */}
      {activeTickets.length > 0 ? (
        <div className="space-y-6">
          {activeTickets.map((ticket, index) => (
            <div 
              key={ticket.id} 
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r text-white p-4 sm:p-6 ${
                index === 0 
                  ? 'from-blue-600 to-indigo-700' 
                  : index === 1 
                    ? 'from-green-600 to-emerald-700'
                    : index === 2
                      ? 'from-purple-600 to-violet-700'
                      : 'from-orange-600 to-red-700'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">
                      🎫 {index === 0 ? 'Tiket Terbaru' : `Tiket #${index + 1}`}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90 mt-1">E-Ticket Active</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 sm:px-4 sm:py-2">
                    <p className="text-[10px] sm:text-xs opacity-80">Kode Booking</p>
                    <p className="text-lg sm:text-xl font-bold">{ticket.id}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Info Section */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Nama Penumpang */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-600">Nama Penumpang</p>
                          <p className="text-base sm:text-lg font-bold text-gray-800">
                            {ticket.passengerName || "Guest"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rute */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-3">Rute Perjalanan</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600">Dari</p>
                          <p className="text-base sm:text-lg font-bold text-gray-800">
                            {ticket.origin.split(" (")[0]}
                          </p>
                        </div>
                        <div className="flex-shrink-0 mx-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <ArrowRight className="text-white" size={16} />
                          </div>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-xs sm:text-sm text-gray-600">Ke</p>
                          <p className="text-base sm:text-lg font-bold text-gray-800">
                            {ticket.destination.split(" (")[0]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Class & Seat */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Kelas</p>
                        <p className="text-base sm:text-lg font-bold text-purple-700 capitalize">
                          {ticket.className}
                        </p>
                      </div>
                      <div className="flex-1 bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Kursi</p>
                        <p className="text-base sm:text-lg font-bold text-orange-700">
                          {ticket.seats.join(", ")}
                        </p>
                      </div>
                    </div>

                    {/* Transport Addon */}
                    {ticket.transportAddon && ticket.transportAddon.id !== "none" && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center">
                            {getTransportIcon(ticket.transportAddon.id)}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Transportasi Lanjutan</p>
                            <p className="text-base sm:text-lg font-bold text-gray-800">
                              {ticket.transportAddon.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {ticket.transportAddon.provider}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-bold text-green-600">
                              + Rp {ticket.transportPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-blue-600" />
                          <p className="text-[10px] sm:text-xs text-gray-600">Tanggal</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{formatDate(ticket.date)}</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-green-600" />
                          <p className="text-[10px] sm:text-xs text-gray-600">Dipesan</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{formatDateTime(ticket.timeBooked)}</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={14} className="text-orange-600" />
                          <p className="text-[10px] sm:text-xs text-gray-600">Total</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800">Rp {ticket.price.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link
                        to="/tracking"
                        className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition text-center text-sm sm:text-base"
                      >
                        Lihat Tracking Kereta →
                      </Link>
                      <button
                        onClick={() => openCancelModal(ticket)}
                        className="w-full bg-red-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-700 transition text-sm sm:text-base"
                      >
                        Batalkan Pesanan
                      </button>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200 h-full flex flex-col items-center justify-center">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-4">
                        E-Ticket QR Code
                      </p>
                      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                        <QRCodeCanvas
                          value={JSON.stringify(ticket)}
                          size={140}
                          level="H"
                        />
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-600 mt-4 text-center">
                        Scan di pintu masuk stasiun
                      </p>
                      <div className="mt-4 w-full">
                        <button
                          onClick={() => window.print()}
                          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Cetak Tiket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-lg">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={32} className="sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Belum Ada Tiket Aktif
          </h3>
          <p className="text-gray-500 text-sm sm:text-base mb-6">
            Pesan tiket kereta untuk perjalanan Anda!
          </p>
          <Link
            to="/booking"
            className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Pesan Tiket
          </Link>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-2">
              Batalkan Pesanan?
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm sm:text-base">
              Apakah Anda yakin ingin membatalkan pesanan tiket dengan kode booking <strong>{ticketToCancel?.id}</strong>? 
              Tiket akan tetap tersimpan di riwayat pemesanan.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className="bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 text-sm sm:text-base"
              >
                Batal
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="bg-red-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {cancelLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  'Ya, Batalkan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
