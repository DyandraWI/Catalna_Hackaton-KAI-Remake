import { useState, useEffect } from "react";
import { Calendar, MapPin, CreditCard, Search, Filter, ChevronDown, X } from "lucide-react";

export default function History() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, canceled
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("kai_history") || "[]");
    setHistory(storedHistory);
    setFilteredHistory(storedHistory);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...history];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === "active") {
      filtered = filtered.filter((order) => order.status !== "canceled");
    } else if (filterStatus === "canceled") {
      filtered = filtered.filter((order) => order.status === "canceled");
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.timeBooked) - new Date(a.timeBooked));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.timeBooked) - new Date(b.timeBooked));
    }

    setFilteredHistory(filtered);
  }, [searchTerm, filterStatus, sortBy, history]);

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
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    if (status === "canceled") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <X size={12} className="mr-1" />
          Dibatalkan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <Calendar size={12} className="mr-1" />
        Aktif
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Riwayat Pemesanan
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">
            Lihat semua tiket yang pernah Anda pesan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Total Pesanan</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800">
                  {history.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Tiket Aktif</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {history.filter((order) => order.status !== "canceled").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Dibatalkan</p>
                <p className="text-xl lg:text-2xl font-bold text-red-600">
                  {history.filter((order) => order.status === "canceled").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari kode booking atau rute..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Tiket Aktif</option>
              <option value="canceled">Dibatalkan</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm || filterStatus !== "all"
                ? "Tidak Ada Hasil"
                : "Belum Ada Riwayat"}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Riwayat pemesanan akan muncul di sini"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((order, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 transition hover:shadow-md ${
                  order.status === "canceled"
                    ? "border-red-500 bg-red-50/30"
                    : "border-green-500"
                }`}
              >
                <div className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Order Info */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg lg:text-xl font-bold text-blue-600">
                              {order.id}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-xs lg:text-sm text-gray-500">
                            Dipesan: {formatDateTime(order.timeBooked)}
                          </p>
                          {order.status === "canceled" && order.canceledAt && (
                            <p className="text-xs text-red-600 mt-1">
                              Dibatalkan: {formatDateTime(order.canceledAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-3 text-sm lg:text-base">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="font-semibold text-gray-800">
                            {order.origin.split(" (")[0]}
                          </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="font-semibold text-gray-800">
                            {order.destination.split(" (")[0]}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Tanggal</p>
                          <p className="font-semibold text-gray-800">
                            {formatDate(order.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Kelas</p>
                          <p className="font-semibold text-gray-800 capitalize">
                            {order.className}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Kursi</p>
                          <p className="font-semibold text-gray-800">
                            {order.seats.join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Penumpang</p>
                          <p className="font-semibold text-gray-800">
                            {order.passengerName || "Guest"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total Harga</p>
                        <p className="text-xl lg:text-2xl font-bold text-gray-800">
                          Rp {order.price.toLocaleString()}
                        </p>
                      </div>
                      {order.status !== "canceled" && (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap">
                          Lihat Detail
                        </button>
                      )}
                    </div>
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
