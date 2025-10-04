import { useState, useEffect, useRef } from "react";
import L from 'leaflet';
import { Train, MapPin, Navigation, RotateCcw, Search, X, Target, RotateCw, Bug, Info } from "lucide-react";

export default function LiveMap({
  userBookings = [],
  bookingVersion = 0,
  onRefreshBookings,
  onClearAllBookings,
  onRemoveBooking
}) {
  const [showRoute, setShowRoute] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingTrainId, setFollowingTrainId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkersRef = useRef({});
  const routeLinesRef = useRef({});
  const stationMarkersRef = useRef({});
  const followingIntervalRef = useRef(null);

  // Station coordinates
  const stationCoordinates = {
    "Jakarta Gambir": [-6.1754, 106.8272],
    "Jakarta Pasar Senen": [-6.1744, 106.8406],
    "Jatinegara": [-6.2153, 106.8707],
    "Bekasi": [-6.2383, 106.9756],
    "Cikampek": [-6.4175, 107.4575],
    "Purwakarta": [-6.5567, 107.4331],
    "Padalarang": [-6.8388, 107.4769],
    "Cimahi": [-6.8771, 107.5426],
    "Bandung": [-6.9175, 107.6191],
    "Cirebon": [-6.7063, 108.5571],
    "Brebes": [-6.8731, 109.0424],
    "Tegal": [-6.8694, 109.1402],
    "Pekalongan": [-6.8886, 109.6753],
    "Semarang": [-6.9667, 110.4167],
    "Semarang Tawang": [-6.9667, 110.4167],
    "Yogyakarta": [-7.7956, 110.3695],
    "Solo": [-7.5563, 110.8316],
    "Madiun": [-7.6298, 111.5239],
    "Kertosono": [-7.5851, 112.0998],
    "Mojokerto": [-7.4664, 112.4336],
    "Surabaya Gubeng": [-7.2653, 112.7516],
    "Surabaya Pasar Turi": [-7.2492, 112.7349],
    "Malang": [-7.9666, 112.6326],
    "Blitar": [-8.0983, 112.1681]
  };

  // Train routes
  const trainRoutes = {
    10501: {
      stations: ["Jakarta Gambir", "Cikampek", "Cirebon", "Semarang", "Solo", "Mojokerto", "Surabaya Pasar Turi"],
      color: "#f59e0b"
    },
    10502: {
      stations: ["Jakarta Pasar Senen", "Bekasi", "Cikampek", "Yogyakarta", "Solo", "Madiun", "Kertosono", "Malang"],
      color: "#ef4444"
    },
    10503: {
      stations: ["Jakarta Gambir", "Cikampek", "Cirebon", "Semarang", "Yogyakarta"],
      color: "#8b5cf6"
    },
    10504: {
      stations: ["Jakarta Gambir", "Cikampek", "Cirebon", "Semarang", "Solo", "Madiun", "Kertosono", "Malang"],
      color: "#06b6d4"
    },
    10505: {
      stations: ["Jakarta Gambir", "Cikampek", "Purwakarta", "Padalarang", "Cimahi", "Bandung"],
      color: "#10b981"
    },
    10506: {
      stations: ["Jakarta Pasar Senen", "Bekasi", "Cikampek", "Cirebon", "Semarang Tawang"],
      color: "#f97316"
    }
  };

  // Train data
  const [trainData, setTrainData] = useState({
    10501: { routeProgress: 0.3, speed: 88 },
    10502: { routeProgress: 0.6, speed: 80 },
    10503: { routeProgress: 0.45, speed: 67 },
    10504: { routeProgress: 0.25, speed: 85 },
    10505: { routeProgress: 0.7, speed: 75 },
    10506: { routeProgress: 0.4, speed: 82 }
  });

  // Calculate train position
  const calculateTrainPosition = (trainNumber, routeProgress) => {
    const route = trainRoutes[trainNumber];
    if (!route || !route.stations || route.stations.length < 2) {
      return [-6.2, 106.8];
    }

    const stations = route.stations;
    const totalSegments = stations.length - 1;
    const currentSegment = Math.floor(routeProgress * totalSegments);
    const segmentProgress = (routeProgress * totalSegments) - currentSegment;

    const fromStationIdx = Math.min(currentSegment, stations.length - 2);
    const toStationIdx = fromStationIdx + 1;

    const fromStation = stationCoordinates[stations[fromStationIdx]];
    const toStation = stationCoordinates[stations[toStationIdx]];

    if (!fromStation || !toStation) {
      return [-6.2, 106.8];
    }

    const lat = fromStation[0] + (toStation[0] - fromStation[0]) * segmentProgress;
    const lng = fromStation[1] + (toStation[1] - fromStation[1]) * segmentProgress;

    return [lat, lng];
  };

  // Base schedule trains
  const baseScheduleTrains = [
    {
      id: 10501,
      trainNumber: "10501",
      name: "Argo Bromo Anggrek",
      class: "Eksekutif",
      route: "Jakarta Gambir → Surabaya Pasar Turi",
      departure: "19:10",
      arrival: "05:30",
      status: "TEPAT WAKTU",
      speed: trainData[10501]?.speed || 88,
      lat: calculateTrainPosition(10501, trainData[10501]?.routeProgress || 0.3)[0],
      lng: calculateTrainPosition(10501, trainData[10501]?.routeProgress || 0.3)[1],
      color: trainRoutes[10501].color,
      routeProgress: trainData[10501]?.routeProgress || 0.3,
      currentStation: "Cirebon",
      nextStation: "Semarang",
      canTrack: true
    },
    {
      id: 10502,
      trainNumber: "10502",
      name: "Jayabaya",
      class: "Bisnis",
      route: "Jakarta Pasar Senen → Malang",
      departure: "20:00",
      arrival: "07:15",
      status: "TERLAMBAT",
      speed: trainData[10502]?.speed || 80,
      lat: calculateTrainPosition(10502, trainData[10502]?.routeProgress || 0.6)[0],
      lng: calculateTrainPosition(10502, trainData[10502]?.routeProgress || 0.6)[1],
      color: trainRoutes[10502].color,
      routeProgress: trainData[10502]?.routeProgress || 0.6,
      currentStation: "Solo",
      nextStation: "Malang",
      delay: 15,
      canTrack: true
    },
    {
      id: 10503,
      trainNumber: "10503",
      name: "Taksaka",
      class: "Eksekutif",
      route: "Jakarta Gambir → Yogyakarta",
      departure: "07:00",
      arrival: "15:30",
      status: "TEPAT WAKTU",
      speed: trainData[10503]?.speed || 67,
      lat: calculateTrainPosition(10503, trainData[10503]?.routeProgress || 0.45)[0],
      lng: calculateTrainPosition(10503, trainData[10503]?.routeProgress || 0.45)[1],
      color: trainRoutes[10503].color,
      routeProgress: trainData[10503]?.routeProgress || 0.45,
      currentStation: "Semarang",
      nextStation: "Yogyakarta",
      canTrack: true
    },
    {
      id: 10504,
      trainNumber: "10504",
      name: "Gajayana",
      class: "Eksekutif",
      route: "Jakarta Gambir → Malang",
      departure: "18:00",
      arrival: "04:45",
      status: "TEPAT WAKTU",
      speed: trainData[10504]?.speed || 85,
      lat: calculateTrainPosition(10504, trainData[10504]?.routeProgress || 0.25)[0],
      lng: calculateTrainPosition(10504, trainData[10504]?.routeProgress || 0.25)[1],
      color: trainRoutes[10504].color,
      routeProgress: trainData[10504]?.routeProgress || 0.25,
      currentStation: "Cikampek",
      nextStation: "Cirebon",
      canTrack: true
    },
    {
      id: 10505,
      trainNumber: "10505",
      name: "Lodaya",
      class: "Bisnis",
      route: "Jakarta Gambir → Bandung",
      departure: "15:30",
      arrival: "18:45",
      status: "TEPAT WAKTU",
      speed: trainData[10505]?.speed || 75,
      lat: calculateTrainPosition(10505, trainData[10505]?.routeProgress || 0.7)[0],
      lng: calculateTrainPosition(10505, trainData[10505]?.routeProgress || 0.7)[1],
      color: trainRoutes[10505].color,
      routeProgress: trainData[10505]?.routeProgress || 0.7,
      currentStation: "Cikampek",
      nextStation: "Bandung",
      canTrack: true
    },
    {
      id: 10506,
      trainNumber: "10506",
      name: "Matarmaja",
      class: "Ekonomi Plus",
      route: "Jakarta Pasar Senen → Semarang",
      departure: "14:00",
      arrival: "21:30",
      status: "TEPAT WAKTU",
      speed: trainData[10506]?.speed || 82,
      lat: calculateTrainPosition(10506, trainData[10506]?.routeProgress || 0.4)[0],
      lng: calculateTrainPosition(10506, trainData[10506]?.routeProgress || 0.4)[1],
      color: trainRoutes[10506].color,
      routeProgress: trainData[10506]?.routeProgress || 0.4,
      currentStation: "Cikampek",
      nextStation: "Cirebon",
      canTrack: true
    }
  ];

  // Get user bookings for today
  const getTodayUserBookings = () => {
    if (!Array.isArray(userBookings)) return [];
    
    const today = new Date().toDateString();
    return userBookings.filter(booking => {
      if (!booking) return false;
      const travelDate = booking.travelDate || booking.date || booking.departureDate;
      if (!travelDate) return true;
      return new Date(travelDate).toDateString() === today;
    });
  };

  // Enhanced schedule trains with bookings
  const enhanceScheduleTrainsWithBookings = () => {
    const todayBookings = getTodayUserBookings();
    console.log("Today's user bookings:", todayBookings);
    
    return baseScheduleTrains.map(train => {
      const userBooking = todayBookings.find(booking => 
        booking.trainNumber === train.trainNumber ||
        booking.trainNumber === train.id.toString() ||
        booking.trainName === train.name ||
        booking.trainName?.toLowerCase().includes(train.name.toLowerCase()) ||
        train.name.toLowerCase().includes(booking.trainName?.toLowerCase())
      );
      
      if (userBooking) {
        console.log(`✅ Found booking for train ${train.name}`);
        return {
          ...train,
          isUserBooked: true,
          userBooking: userBooking,
          ticketDetails: {
            seats: userBooking.seats || userBooking.seatNumbers || [],
            class: userBooking.class || userBooking.trainClass || train.class,
            passengers: userBooking.passengers || userBooking.passengerCount || 1,
            bookingId: userBooking.id || userBooking.bookingId
          }
        };
      }
      return train;
    });
  };

  // Get enhanced trains
  const scheduleTrains = enhanceScheduleTrainsWithBookings();
  
  // Filter trains
  const filteredScheduleTrains = scheduleTrains.filter(train =>
    train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.trainNumber.includes(searchTerm) ||
    train.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userBookedCount = scheduleTrains.filter(t => t.isUserBooked).length;
  const currentFollowingTrain = followingTrainId ? scheduleTrains.find(t => t.id === followingTrainId) : null;

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log("Initializing map...");
    
    try {
      const map = L.map(mapRef.current).setView([-7.0, 109.5], 7);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 6
      }).addTo(map);

      mapInstanceRef.current = map;
      console.log("Map initialized successfully");
      
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (mapInstanceRef.current) {
        console.log("Cleaning up map");
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Train movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTrainData(prev => {
        const newData = { ...prev };
        
        Object.keys(newData).forEach(trainNumber => {
          const route = trainRoutes[trainNumber];
          if (route) {
            const speedFactor = newData[trainNumber].speed / 15000;
            const newProgress = Math.min(0.99, newData[trainNumber].routeProgress + speedFactor);
            
            newData[trainNumber] = {
              ...newData[trainNumber],
              routeProgress: newProgress
            };
          }
        });
        
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ADDED: Draw route lines for followed train
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    console.log("Drawing routes for following train:", followingTrainId);

    // Clear existing route lines
    Object.values(routeLinesRef.current).forEach(line => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(line);
      }
    });
    routeLinesRef.current = {};

    // Clear existing station markers
    Object.values(stationMarkersRef.current).forEach(markers => {
      markers.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
    });
    stationMarkersRef.current = {};

    // Draw route for followed train
    if (showRoute && followingTrainId) {
      const followedTrain = scheduleTrains.find(t => t.id === followingTrainId);
      
      if (followedTrain && followedTrain.canTrack !== false) {
        const route = trainRoutes[followedTrain.id];
        
        if (route && route.stations) {
          console.log(`Drawing route for ${followedTrain.name}:`, route.stations);
          
          // Get coordinates for all stations in route
          const routeCoords = route.stations
            .map(stationName => stationCoordinates[stationName])
            .filter(coord => coord);

          if (routeCoords.length > 1) {
            // Draw route line
            const routeLine = L.polyline(routeCoords, {
              color: route.color,
              weight: 5,
              opacity: 0.8,
              dashArray: followedTrain.isUserBooked ? '12, 6' : '10, 6'
            }).addTo(mapInstanceRef.current);

            routeLinesRef.current[followedTrain.id] = routeLine;
            console.log("Route line added to map");

            // Add station markers along the route
            stationMarkersRef.current[followedTrain.id] = [];
            
            route.stations.forEach((stationName, idx) => {
              const coords = stationCoordinates[stationName];
              if (coords) {
                const isCurrentStation = stationName === followedTrain.currentStation;
                const isPassed = followedTrain.routeProgress > (idx / (route.stations.length - 1));
                
                const stationIcon = L.divIcon({
                  html: `<div style="
                    width: ${followedTrain.isUserBooked ? '16px' : '14px'};
                    height: ${followedTrain.isUserBooked ? '16px' : '14px'};
                    background: ${isPassed ? route.color : '#6b7280'};
                    border: ${followedTrain.isUserBooked ? '3px' : '2px'} solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    ${isCurrentStation ? 'animation: pulse 1.5s infinite; transform: scale(1.3);' : ''}
                  "></div>`,
                  iconSize: [followedTrain.isUserBooked ? 16 : 14, followedTrain.isUserBooked ? 16 : 14],
                  className: 'station-marker'
                });

                const marker = L.marker(coords, { icon: stationIcon })
                  .addTo(mapInstanceRef.current)
                  .bindPopup(`
                    <div style="text-align: center; padding: 10px;">
                      <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${stationName}</div>
                      <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">
                        ${followedTrain.name} Route
                      </div>
                      ${followedTrain.isUserBooked ? '<div style="font-size: 12px; color: #10b981; margin: 4px 0; font-weight: 600;">🎫 Your Booked Train</div>' : ''}
                      ${isCurrentStation ? '<div style="font-size: 12px; color: ' + route.color + '; font-weight: 600; margin: 4px 0;">🚄 Train Here Now</div>' : ''}
                      ${isPassed && !isCurrentStation ? '<div style="font-size: 12px; color: #6b7280; margin: 4px 0;">✅ Passed</div>' : ''}
                      ${!isPassed && !isCurrentStation ? '<div style="font-size: 12px; color: #3b82f6; margin: 4px 0;">⏳ Upcoming</div>' : ''}
                    </div>
                  `);

                stationMarkersRef.current[followedTrain.id].push(marker);
              }
            });

            console.log(`Added ${route.stations.length} station markers`);
          }
        }
      }
    }
  }, [showRoute, followingTrainId, scheduleTrains, trainData]);

  // Update train markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    console.log("Updating train markers...");

    // Clear existing markers
    Object.values(trainMarkersRef.current).forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    trainMarkersRef.current = {};

    // Add train markers
    scheduleTrains.forEach(train => {
      try {
        const isFollowed = followingTrainId === train.id;
        const isUserBooked = train.isUserBooked;
        
        const trainIcon = L.divIcon({
          html: `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isUserBooked ? '52px' : '40px'};
            height: ${isUserBooked ? '52px' : '40px'};
            background: ${isUserBooked ? 'linear-gradient(135deg, #10b981, #059669)' : train.color};
            border: ${isUserBooked ? '4px' : '3px'} solid white;
            border-radius: 50%;
            font-size: ${isUserBooked ? '22px' : '16px'};
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            cursor: pointer;
            transform: ${isFollowed ? 'scale(1.2)' : 'scale(1)'};
            transition: all 0.3s ease;
            ${isFollowed ? 'animation: pulse 2s infinite;' : ''}
            ${isUserBooked ? 'animation: bounce 2s infinite;' : ''}
            z-index: ${isFollowed ? '1001' : isUserBooked ? '1000' : '999'};
          ">${isUserBooked ? '🎫' : '🚄'}</div>`,
          iconSize: [isUserBooked ? 52 : 40, isUserBooked ? 52 : 40],
          className: `train-marker`
        });

        const marker = L.marker([train.lat, train.lng], { icon: trainIcon })
          .addTo(mapInstanceRef.current)
          .on('click', () => handleTrainClick(train))
          .bindPopup(`
            <div style="padding: 12px; min-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 8px;">
                ${isUserBooked ? '🎫' : '🚄'} ${train.name}
                ${isUserBooked ? '<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 8px; font-size: 10px; margin-left: 8px;">MY TICKET</span>' : ''}
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${train.trainNumber} • ${train.class}</div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${train.route}</div>
              <div style="font-size: 12px; margin-bottom: 8px;">
                📍 ${train.currentStation} → ${train.nextStation}
              </div>
              <div style="font-size: 12px; margin-bottom: 8px;">
                Speed: ${train.speed} km/h | Progress: ${Math.round((train.routeProgress || 0) * 100)}%
              </div>
              ${isUserBooked && train.ticketDetails ? `
                <div style="background: #dcfce7; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                  <div style="font-size: 11px; color: #065f46; font-weight: 600;">🎫 Your Booking:</div>
                  <div style="font-size: 11px; color: #065f46;">Seats: ${train.ticketDetails.seats?.join(', ') || 'N/A'}</div>
                  <div style="font-size: 11px; color: #065f46;">Passengers: ${train.ticketDetails.passengers || 1}</div>
                </div>
              ` : ''}
              <button 
                onclick="window.toggleTrainFollow(${train.id})" 
                style="width: 100%; background: ${isFollowed ? '#dc2626' : (isUserBooked ? '#10b981' : train.color)}; color: white; padding: 8px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"
              >
                ${isFollowed ? '🛑 Stop Following' : (isUserBooked ? '🎫 Track My Train' : '🎯 Follow Train')}
              </button>
            </div>
          `);

        trainMarkersRef.current[train.id] = marker;
        
      } catch (error) {
        console.error(`Error creating marker for train ${train.id}:`, error);
      }
    });

    console.log("Train markers updated");
    
  }, [scheduleTrains, followingTrainId, bookingVersion]);

  // Global function for popup buttons
  useEffect(() => {
    window.toggleTrainFollow = (trainId) => {
      if (followingTrainId === trainId) {
        stopAutoFollow();
      } else {
        startAutoFollow(trainId);
      }
    };

    return () => {
      delete window.toggleTrainFollow;
    };
  }, [followingTrainId]);

  // Functions
  const startAutoFollow = (trainId) => {
    const train = scheduleTrains.find(t => t.id === trainId);
    if (!train || train.canTrack === false) {
      alert("Kereta ini tidak dapat dilacak.");
      return;
    }
    setIsFollowing(true);
    setFollowingTrainId(trainId);
    
    if (followingIntervalRef.current) {
      clearInterval(followingIntervalRef.current);
    }

    followingIntervalRef.current = setInterval(() => {
      const train = scheduleTrains.find(t => t.id === trainId);
      if (train && mapInstanceRef.current) {
        mapInstanceRef.current.setView([train.lat, train.lng], 11, {
          animate: true,
          duration: 1
        });
      }
    }, 1000);
  };

  const stopAutoFollow = () => {
    setIsFollowing(false);
    setFollowingTrainId(null);
    
    if (followingIntervalRef.current) {
      clearInterval(followingIntervalRef.current);
      followingIntervalRef.current = null;
    }
  };

  const handleTrainClick = (train) => {
    if (followingTrainId === train.id) {
      stopAutoFollow();
    } else {
      startAutoFollow(train.id);
    }
  };

  const centerToAllTrains = () => {
    if (scheduleTrains.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(scheduleTrains.map(train => [train.lat, train.lng]));
      mapInstanceRef.current.fitBounds(bounds.pad(0.1));
      stopAutoFollow();
    }
  };

  return (
    <div className="bg-white h-screen flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-72'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
        {!sidebarCollapsed && (
          <>
            {/* Header */}
            <div className="p-2 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                  <Target size={12} />
                  Live Tracking
                </h3>
                <div className="flex items-center gap-1">
                  {onRefreshBookings && (
                    <button
                      onClick={onRefreshBookings}
                      className="p-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                      title="Refresh Bookings"
                    >
                      <RotateCw size={8} />
                    </button>
                  )}
                  
                  {onClearAllBookings && (
                    <button
                      onClick={() => {
                        if (confirm("Hapus semua booking?")) {
                          onClearAllBookings();
                        }
                      }}
                      className="p-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      title="Clear All Bookings"
                    >
                      <X size={8} />
                    </button>
                  )}
                  
                  {debugMode && (
                    <button
                      onClick={() => setDebugMode(false)}
                      className="p-1 bg-green-100 text-green-700 rounded text-xs"
                    >
                      <Bug size={8} />
                    </button>
                  )}
                  <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-gray-200 rounded">
                    <X size={12} />
                  </button>
                </div>
              </div>

              {debugMode && (
                <div className="mb-1 p-1 bg-green-50 border border-green-200 rounded text-xs">
                  <div className="text-green-700 text-xs">
                    Props: {userBookings?.length || 0} | My: {userBookedCount} | Version: {bookingVersion} | Following: {followingTrainId || 'none'}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-1 mt-1">
                <button
                  onClick={centerToAllTrains}
                  className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-1"
                >
                  <RotateCcw size={8} />
                  Center
                </button>
                {isFollowing && (
                  <button
                    onClick={stopAutoFollow}
                    className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-red-700 transition flex items-center justify-center gap-1"
                  >
                    <X size={8} />
                    Stop
                  </button>
                )}
              </div>
            </div>

            {userBookedCount > 0 && (
              <div className="px-2 py-1 bg-green-100 border-b border-green-200">
                <div className="text-center">
                  <div className="text-xs font-bold text-green-800">{userBookedCount} My Tickets</div>
                </div>
              </div>
            )}

            {/* Train List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                    📅 Today ({filteredScheduleTrains.length})
                    <div className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full text-xs">Live</div>
                  </h4>
                  {!debugMode && (
                    <button
                      onClick={() => setDebugMode(true)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Bug size={8} className="text-gray-400" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  {filteredScheduleTrains.map((train) => (
                    <div
                      key={train.id}
                      className={`rounded-lg border-2 p-1.5 cursor-pointer transition-all ${
                        train.isUserBooked
                          ? followingTrainId === train.id
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-400 shadow-lg transform scale-105'
                            : 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 hover:border-green-400 hover:shadow-md'
                          : followingTrainId === train.id 
                            ? 'bg-blue-50 border-blue-400 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleTrainClick(train)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                          <div 
                            className={`w-2 h-2 rounded-full ${train.isUserBooked ? 'animate-pulse' : ''}`}
                            style={{ backgroundColor: train.color }}
                          ></div>
                          <span className="truncate">{train.name}</span>
                          {followingTrainId === train.id && (
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {train.isUserBooked && (
                            <span className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded-full font-bold">
                              🎫
                            </span>
                          )}
                          <span className={`text-xs px-1 py-0.5 rounded-full font-medium ${
                            train.status === 'TEPAT WAKTU'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {train.status === 'TEPAT WAKTU' ? 'OK' : 'LATE'}
                          </span>
                          {followingTrainId === train.id && (
                            <Target size={6} className="text-blue-600" />
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mb-1 truncate">{train.route}</div>
                      <div className="text-xs text-gray-500 mb-1">
                        📍 {train.currentStation} → {train.nextStation}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">⚡{train.speed}</span>
                          <span className="text-gray-500">• {train.class}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {train.delay > 0 && <span className="text-orange-600">+{train.delay}m</span>}
                          <span className="text-blue-600">{Math.round((train.routeProgress || 0) * 100)}%</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mt-0.5">
                        {train.departure} - {train.arrival}
                      </div>

                      {train.isUserBooked && train.ticketDetails && (
                        <div className="mt-1 pt-1 border-t border-green-300">
                          <div className="text-xs text-green-800 bg-green-200 px-1 py-0.5 rounded flex items-center justify-between">
                            <span>🎫 {train.ticketDetails.seats?.join(', ') || 'N/A'}</span>
                            {onRemoveBooking && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Remove booking for ${train.name}?`)) {
                                    onRemoveBooking(train.userBooking.id || train.userBooking.bookingId);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 ml-1"
                                title="Remove Booking"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {userBookings.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-sm mb-2">🚂</div>
                    <div className="text-xs text-gray-500 mb-2">No bookings found</div>
                    <div className="text-xs text-gray-400">Click any train to track it</div>
                  </div>
                )}
              </div>
            </div>

            {showLegend && (
              <div className="p-1 border-t bg-gray-50">
                <div className="text-xs text-gray-600 mb-0.5">
                  🎫 = your ticket | Click train to follow | Route shows when following
                </div>
                <div className="text-center mt-1">
                  <button
                    onClick={() => setShowLegend(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Hide Info
                  </button>
                </div>
              </div>
            )}

            {!showLegend && (
              <div className="p-1 border-t bg-gray-50 text-center">
                <button
                  onClick={() => setShowLegend(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 w-full"
                >
                  <Info size={8} />
                  Info
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-2 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(false)} className="p-1 hover:bg-gray-100 rounded">
                  <Train size={16} />
                </button>
              )}
              <h1 className="text-base font-bold text-gray-800">KAI Live Tracker</h1>
              <p className="text-xs text-gray-600">
                {userBookedCount > 0 ? `${userBookedCount} booked` : 'Monitor'}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={centerToAllTrains}
                className="p-1.5 rounded hover:bg-gray-100 transition"
                title="Center all"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`p-1.5 rounded transition ${showRoute ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Toggle routes"
              >
                <Navigation size={14} />
              </button>
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${userBookedCount > 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className={`font-medium ${userBookedCount > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                  {userBookedCount > 0 ? `${userBookedCount}` : 'Live'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div 
          ref={mapRef} 
          style={{ height: '100%', width: '100%', paddingTop: '50px' }}
          className="leaflet-container"
        />

        {isFollowing && currentFollowingTrain && (
          <div className={`absolute bottom-4 left-4 px-2 py-1.5 rounded-lg shadow-lg flex items-center gap-2 z-10 text-white ${
            currentFollowingTrain.isUserBooked ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            <Target size={12} className="animate-pulse" />
            <div>
              <div className="text-xs font-semibold">
                {currentFollowingTrain.isUserBooked ? '🎫 My' : 'Tracking'}
              </div>
              <div className={`text-xs ${currentFollowingTrain.isUserBooked ? 'text-green-200' : 'text-blue-200'}`}>
                {currentFollowingTrain.name} • {currentFollowingTrain.speed}km/h
              </div>
            </div>
            <button onClick={stopAutoFollow} className={`ml-1 rounded p-0.5 transition ${
              currentFollowingTrain.isUserBooked ? 'hover:bg-green-700' : 'hover:bg-blue-700'
            }`}>
              <X size={10} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-10px); }
          70% { transform: translateY(-5px); }
          90% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}