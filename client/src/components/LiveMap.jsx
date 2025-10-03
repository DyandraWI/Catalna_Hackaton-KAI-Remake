import { useState, useEffect, useRef } from "react";
import L from 'leaflet';
import { Train, MapPin, Navigation, X, Search, Menu } from "lucide-react";

export default function LiveMap({
  latestOrder,
  stations,
  currentStation,
  selectedTrain,
  followingTrain,
  onTrainSelect,
  onTrainFollow,
  onStopFollowing
}) {
  const [showRoute, setShowRoute] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [realTimeUpdate, setRealTimeUpdate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const stationMarkersRef = useRef([]);
  const otherTrainMarkersRef = useRef([]);

  // Mock train data
  const mockTrains = [
    {
      id: 1,
      trainNumber: "10501",
      name: "Argo Bromo Anggrek",
      route: "Jakarta Gambir → Surabaya Pasar Turi",
      status: "TERLAMBAT",
      speed: 88,
      lat: -6.7,
      lng: 108.5,
      delay: 0,
      color: "orange"
    },
    {
      id: 2,
      trainNumber: "10502", 
      name: "Jayabaya",
      route: "Jakarta Pasar Senen → Malang",
      status: "TERLAMBAT",
      speed: 80,
      lat: -7.2,
      lng: 112.7,
      delay: 15,
      color: "orange"
    },
    {
      id: 3,
      trainNumber: "10503",
      name: "Taksaka", 
      route: "Jakarta Gambir → Yogyakarta",
      status: "TERLAMBAT",
      speed: 67,
      lat: -7.8,
      lng: 110.4,
      delay: 12,
      color: "orange"
    }
  ];

  // Generate coordinates
  const generateStationCoords = (stations) => {
    const coordinatesMap = {
      "Jakarta Gambir": [-6.1754, 106.8272],
      "Jakarta Pasar Senen": [-6.1744, 106.8406],
      "Jatinegara": [-6.2153, 106.8707],
      "Cimahi": [-6.8771, 107.5426],
      "Bandung": [-6.9175, 107.6191],
      "Bekasi": [-6.2383, 106.9756],
      "Cirebon": [-6.7063, 108.5571],
      "Semarang": [-6.9667, 110.4167],
      "Yogyakarta": [-7.7956, 110.3695],
      "Surabaya Gubeng": [-7.2653, 112.7516],
      "Surabaya Pasar Turi": [-7.2492, 112.7349],
      "Malang": [-7.9666, 112.6326]
    };

    return stations.map((station, idx) => {
      return coordinatesMap[station.name] || [-6.2 + (idx * 0.4), 106.8 + (idx * 0.6)];
    });
  };

  const userTrain = latestOrder ? {
    id: 999,
    trainNumber: latestOrder.trainNumber || "MY001",
    name: latestOrder.trainName || "Kereta Anda",
    route: `${latestOrder.origin} → ${latestOrder.destination}`,
    status: "TEPAT WAKTU",
    speed: Math.floor(60 + Math.random() * 40),
    lat: generateStationCoords(stations)[currentStation]?.[0] || -6.2,
    lng: generateStationCoords(stations)[currentStation]?.[1] || 106.8,
    isUserTrain: true,
    color: "green"
  } : null;

  const stationCoords = latestOrder ? generateStationCoords(stations) : [];

  const filteredTrains = mockTrains.filter(train =>
    train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.trainNumber.includes(searchTerm) ||
    train.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([-6.9, 109.0], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 6
    }).addTo(map);

    mapInstanceRef.current = map;
  }, []);

  // Update train markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    otherTrainMarkersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    otherTrainMarkersRef.current = [];

    filteredTrains.forEach(train => {
      const trainIcon = L.divIcon({
        html: `<div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          font-size: 16px;
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">🚄</div>`,
        iconSize: [40, 40],
        className: 'other-train-marker'
      });

      const marker = L.marker([train.lat, train.lng], { icon: trainIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding: 8px;">
            <div style="font-weight: bold; color: #1f2937;">${train.name}</div>
            <div style="font-size: 12px; color: #6b7280; margin: 4px 0;">${train.trainNumber}</div>
            <div style="font-size: 12px; color: #6b7280;">${train.route}</div>
            <div style="margin-top: 8px; font-size: 12px;">
              <span style="color: #f59e0b; font-weight: 600;">${train.status}</span> • 
              <span>${train.speed} km/h</span>
            </div>
          </div>
        `);

      otherTrainMarkersRef.current.push(marker);
    });

    if (userTrain) {
      if (trainMarkerRef.current) {
        mapInstanceRef.current.removeLayer(trainMarkerRef.current);
      }

      const userTrainIcon = L.divIcon({
        html: `<div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: 4px solid white;
          border-radius: 50%;
          font-size: 20px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
          cursor: pointer;
          z-index: 1000;
        ">🎫</div>`,
        iconSize: [48, 48],
        className: 'user-train-marker'
      });

      const userMarker = L.marker([userTrain.lat, userTrain.lng], { icon: userTrainIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding: 12px;">
            <div style="font-weight: bold; color: #065f46; margin-bottom: 8px;">🎫 ${userTrain.name}</div>
            <div style="font-size: 12px; color: #6b7280;">${userTrain.route}</div>
            <div style="margin-top: 8px; font-size: 12px;">
              <span style="color: #10b981; font-weight: 600;">${userTrain.status}</span> • 
              <span>${userTrain.speed} km/h</span>
            </div>
          </div>
        `);

      trainMarkerRef.current = userMarker;
    }
  }, [filteredTrains, userTrain]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white h-[calc(100vh-200px)] lg:h-screen flex flex-col lg:flex-row relative">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        ${sidebarCollapsed && !mobileSidebarOpen ? 'w-0' : 'w-full lg:w-80'}
        ${mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:block'}
        transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden
      `}>
        {(!sidebarCollapsed || mobileSidebarOpen) && (
          <>
            {/* Sidebar Header */}
            <div className="p-3 lg:p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm lg:text-base font-semibold text-gray-800">
                  👋 Klik kereta untuk auto-follow
                </h3>
                <button
                  onClick={() => {
                    setSidebarCollapsed(true);
                    setMobileSidebarOpen(false);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari kereta atau rute..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* User Train (Priority) */}
            {userTrain && (
              <div className="p-3 lg:p-4 bg-green-50 border-b">
                <div className="bg-white rounded-lg border-2 border-green-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm lg:text-base font-semibold text-green-800 truncate">
                      🎫 {userTrain.name}
                    </div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                      MY TRAIN
                    </div>
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 mb-2 truncate">{userTrain.route}</div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <div className="flex items-center gap-2 lg:gap-4">
                      <span className="text-green-600 font-semibold">{userTrain.status}</span>
                      <span className="text-gray-600">⚡ {userTrain.speed} km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Train List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 lg:p-4">
                <h4 className="text-sm lg:text-base font-semibold text-gray-800 mb-3">Kereta Lainnya</h4>
                <div className="space-y-2 lg:space-y-3">
                  {filteredTrains.map((train) => (
                    <div
                      key={train.id}
                      className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition cursor-pointer"
                      onClick={() => {
                        onTrainFollow && onTrainFollow(train);
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm lg:text-base font-semibold text-gray-800 truncate">
                          {train.name}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                            {train.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs lg:text-sm text-gray-600 mb-1 truncate">{train.route}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">⚡ {train.speed} km/h</span>
                        {train.delay > 0 && (
                          <span className="text-orange-600">+{train.delay} min</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Route Legend */}
            <div className="p-3 lg:p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <div className="w-4 h-1 bg-orange-500 rounded"></div>
                <span className="text-gray-600">Garis oranye: Rute kereta</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Map Header - Responsive */}
        <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-3 lg:p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
              {(sidebarCollapsed || !mobileSidebarOpen) && (
                <button
                  onClick={() => {
                    setSidebarCollapsed(false);
                    setMobileSidebarOpen(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 lg:hidden"
                >
                  <Menu size={20} />
                </button>
              )}
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                >
                  <Train size={20} />
                </button>
              )}
              <div className="min-w-0">
                <h1 className="text-base lg:text-xl font-bold text-gray-800 truncate">
                  KAI Live Tracker
                </h1>
                <p className="hidden lg:block text-xs lg:text-sm text-gray-600">
                  Pantau pergerakan real-time kereta api Indonesia
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`p-2 rounded-lg transition ${showRoute ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <Navigation size={14} className="lg:w-4 lg:h-4" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div 
          ref={mapRef} 
          style={{ height: '100%', width: '100%', paddingTop: '60px' }}
          className="leaflet-container"
        />

        {/* Following Indicator */}
        {isFollowing && followingTrain && (
          <div className="absolute bottom-4 left-4 right-4 lg:right-auto bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-10">
            <Train size={14} className="lg:w-4 lg:h-4 animate-pulse flex-shrink-0" />
            <span className="text-xs lg:text-sm font-semibold truncate">
              Following: {followingTrain.name}
            </span>
            <button
              onClick={onStopFollowing}
              className="ml-auto hover:bg-blue-700 rounded p-1 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
        }
      `}</style>
    </div>
  );
}
