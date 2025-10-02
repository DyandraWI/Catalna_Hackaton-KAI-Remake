import { Train, MapPin, Clock, Search, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function Schedule({
  latestOrder,
  stations,
  currentStation,
  trainPosition,
  isMoving,
  countdown,
  progressPercent,
  isCompleted,
  onTrainSelect,
  onTrainFollow
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');

  // Mock train data untuk schedule table
  const mockTrainSchedule = [
    {
      id: 1,
      trainNumber: "10501",
      name: "Argo Bromo Anggrek",
      class: "Eksekutif",
      route: "Jakarta Gambir → Surabaya Pasar Turi",
      departure: "19:10",
      arrival: "05:30",
      platform: "Platform 1",
      status: "TEPAT WAKTU",
      delay: 0,
      isUserTrain: latestOrder && latestOrder.trainName === "Argo Bromo Anggrek"
    },
    {
      id: 2,
      trainNumber: "10502",
      name: "Jayabaya",
      class: "Bisnis",
      route: "Jakarta Pasar Senen → Malang",
      departure: "20:00",
      arrival: "07:15 (+15 min)",
      platform: "Platform 2",
      status: "TERLAMBAT",
      delay: 15,
      isUserTrain: latestOrder && latestOrder.trainName === "Jayabaya"
    },
    {
      id: 3,
      trainNumber: "10503",
      name: "Taksaka",
      class: "Eksekutif",
      route: "Jakarta Gambir → Yogyakarta",
      departure: "07:00",
      arrival: "15:30",
      platform: "Platform 3",
      status: "TEPAT WAKTU",
      delay: 0
    },
    {
      id: 4,
      trainNumber: "10504",
      name: "Gajayana",
      class: "Eksekutif",
      route: "Jakarta Gambir → Malang",
      departure: "18:00",
      arrival: "04:45",
      platform: "Platform 1",
      status: "TEPAT WAKTU",
      delay: 0
    },
    {
      id: 5,
      trainNumber: "10505",
      name: "Lodaya",
      class: "Bisnis",
      route: "Jakarta Gambir → Bandung",
      departure: "15:30",
      arrival: "18:45",
      platform: "Platform 4",
      status: "TEPAT WAKTU",
      delay: 0
    },
    {
      id: 6,
      trainNumber: "10506",
      name: "Matarmaja",
      class: "Ekonomi Plus",
      route: "Jakarta Pasar Senen → Semarang Tawang",
      departure: "14:00",
      arrival: "21:30",
      platform: "Platform 2",
      status: "TEPAT WAKTU",
      delay: 0
    }
  ];

  // Filter trains
  const filteredTrains = mockTrainSchedule.filter(train => {
    const matchesSearch = train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         train.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         train.trainNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'TEPAT WAKTU' && train.status === 'TEPAT WAKTU') ||
                         (statusFilter === 'TERLAMBAT' && train.status === 'TERLAMBAT');
    
    const matchesRoute = routeFilter === 'all' || 
                        train.route.toLowerCase().includes(routeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesRoute;
  });

  // Get statistics
  const stats = {
    total: mockTrainSchedule.length,
    onTime: mockTrainSchedule.filter(t => t.status === 'TEPAT WAKTU').length,
    delayed: mockTrainSchedule.filter(t => t.status === 'TERLAMBAT').length,
    percentage: Math.round((mockTrainSchedule.filter(t => t.status === 'TEPAT WAKTU').length / mockTrainSchedule.length) * 100)
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Train className="text-gray-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Kereta</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.onTime}</div>
              <div className="text-sm text-gray-600">Tepat Waktu</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <div className="text-red-600 text-lg">⚠</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.delayed}</div>
              <div className="text-sm text-gray-600">Terlambat</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 text-lg">%</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
              <div className="text-sm text-gray-600">Ketepatan Waktu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari kereta atau rute..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="TEPAT WAKTU">Tepat Waktu</option>
            <option value="TERLAMBAT">Terlambat</option>
          </select>
          
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Rute</option>
            <option value="jakarta">Dari Jakarta</option>
            <option value="surabaya">Ke Surabaya</option>
            <option value="bandung">Ke Bandung</option>
            <option value="yogyakarta">Ke Yogyakarta</option>
          </select>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              📅 Jadwal Kereta Hari Ini
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium">Live Updates</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No. Kereta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Kereta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rute</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Keberangkatan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kedatangan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Keterlambatan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTrains.map((train) => (
                <tr 
                  key={train.id} 
                  className={`hover:bg-gray-50 transition ${train.isUserTrain ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                >
                  <td className="px-4 py-4 text-sm font-semibold text-blue-600">
                    {train.trainNumber}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-800">{train.name}</div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{train.class}</div>
                      {train.isUserTrain && (
                        <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded font-medium">
                          🎫 MY TRAIN
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{train.route}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-800">{train.departure}</td>
                  <td className="px-4 py-4 text-sm text-gray-800">{train.arrival}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{train.platform}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      train.status === 'TEPAT WAKTU' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {train.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {train.delay > 0 ? (
                      <span className="text-red-600 font-semibold">+{train.delay} min</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Tepat Waktu</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onTrainFollow && onTrainFollow(train)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1"
                    >
                      <MapPin size={12} />
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}