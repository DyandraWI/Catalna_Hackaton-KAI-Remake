import { useState, useEffect, useRef } from "react";
import L from 'leaflet';
import { Train, MapPin, Navigation, RotateCcw, Clock, Route, Activity, Search, X, Target, RotateCw } from "lucide-react";

export default function LiveMap({
  latestOrder,
  stations,
  currentStation,
  selectedTrain,
  followingTrain: followingTrainProp,
  onTrainSelect,
  onTrainFollow,
  onStopFollowing
}) {
  const [showRoute, setShowRoute] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingTrainId, setFollowingTrainId] = useState(null);
  const [realTimeUpdate, setRealTimeUpdate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkersRef = useRef({});
  const routeLinesRef = useRef({});
  const stationMarkersRef = useRef({});
  const followingIntervalRef = useRef(null);

  // Station coordinates database (expanded)
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

  // Define train routes matching schedule table
  const trainRoutes = {
    10501: { // Argo Bromo Anggrek
      stations: ["Jakarta Gambir", "Cikampek", "Cirebon", "Semarang", "Solo", "Mojokerto", "Surabaya Pasar Turi"],
      color: "#f59e0b",
      direction: 1
    },
    10502: { // Jayabaya
      stations: ["Jakarta Pasar Senen", "Bekasi", "Cikampek", "Yogyakarta", "Solo", "Madiun", "Kertosono", "Malang"],
      color: "#ef4444", 
      direction: 1
    },
    10503: { // Taksaka
      stations: ["Jakarta Gambir", "Cikampek", "Cirebon", "Semarang", "Yogyakarta"],
      color: "#8b5cf6",
      direction: 1
    },
    10504: { // Gajayana
      stations: ["Jakarta Gambir", "Cikampek", "Cirebon", "Semarang", "Solo", "Madiun", "Kertosono", "Malang"],
      color: "#06b6d4",
      direction: 1
    },
    10505: { // Lodaya
      stations: ["Jakarta Gambir", "Cikampek", "Purwakarta", "Padalarang", "Cimahi", "Bandung"],
      color: "#10b981",
      direction: 1
    },
    10506: { // Matarmaja
      stations: ["Jakarta Pasar Senen", "Bekasi", "Cikampek", "Cirebon", "Semarang Tawang"],
      color: "#f97316",
      direction: 1
    }
  };

  // Train position tracking with route progress
  const [trainData, setTrainData] = useState({
    10501: { routeProgress: 0.3, speed: 88 },
    10502: { routeProgress: 0.6, speed: 80 },
    10503: { routeProgress: 0.45, speed: 67 },
    10504: { routeProgress: 0.25, speed: 85 },
    10505: { routeProgress: 0.7, speed: 75 },
    10506: { routeProgress: 0.4, speed: 82 }
  });

  // Calculate position along route
  const calculateTrainPosition = (trainNumber, routeProgress) => {
    const route = trainRoutes[trainNumber];
    if (!route || !route.stations || route.stations.length < 2) {
      return stationCoordinates["Jakarta Gambir"] || [-6.2, 106.8];
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
      return stationCoordinates["Jakarta Gambir"] || [-6.2, 106.8];
    }

    const lat = fromStation[0] + (toStation[0] - fromStation[0]) * segmentProgress;
    const lng = fromStation[1] + (toStation[1] - fromStation[1]) * segmentProgress;

    return [lat, lng];
  };

  // All trains from schedule table
  const allScheduleTrains = [
    {
      id: 10501,
      trainNumber: "10501",
      name: "Argo Bromo Anggrek",
      class: "Eksekutif",
      route: "Jakarta Gambir → Surabaya Pasar Turi",
      departure: "19:10",
      arrival: "05:30",
      platform: "Platform 1",
      status: "TEPAT WAKTU",
      speed: trainData[10501].speed,
      lat: calculateTrainPosition(10501, trainData[10501].routeProgress)[0],
      lng: calculateTrainPosition(10501, trainData[10501].routeProgress)[1],
      delay: 0,
      color: trainRoutes[10501].color,
      routeProgress: trainData[10501].routeProgress,
      currentStation: trainRoutes[10501].stations[Math.floor(trainData[10501].routeProgress * (trainRoutes[10501].stations.length - 1))],
      nextStation: trainRoutes[10501].stations[Math.min(Math.floor(trainData[10501].routeProgress * (trainRoutes[10501].stations.length - 1)) + 1, trainRoutes[10501].stations.length - 1)]
    },
    {
      id: 10502,
      trainNumber: "10502",
      name: "Jayabaya",
      class: "Bisnis", 
      route: "Jakarta Pasar Senen → Malang",
      departure: "20:00",
      arrival: "07:15",
      platform: "Platform 2",
      status: "TERLAMBAT",
      speed: trainData[10502].speed,
      lat: calculateTrainPosition(10502, trainData[10502].routeProgress)[0],
      lng: calculateTrainPosition(10502, trainData[10502].routeProgress)[1],
      delay: 15,
      color: trainRoutes[10502].color,
      routeProgress: trainData[10502].routeProgress,
      currentStation: trainRoutes[10502].stations[Math.floor(trainData[10502].routeProgress * (trainRoutes[10502].stations.length - 1))],
      nextStation: trainRoutes[10502].stations[Math.min(Math.floor(trainData[10502].routeProgress * (trainRoutes[10502].stations.length - 1)) + 1, trainRoutes[10502].stations.length - 1)]
    },
    {
      id: 10503,
      trainNumber: "10503",
      name: "Taksaka",
      class: "Eksekutif",
      route: "Jakarta Gambir → Yogyakarta", 
      departure: "07:00",
      arrival: "15:30",
      platform: "Platform 3",
      status: "TEPAT WAKTU",
      speed: trainData[10503].speed,
      lat: calculateTrainPosition(10503, trainData[10503].routeProgress)[0],
      lng: calculateTrainPosition(10503, trainData[10503].routeProgress)[1],
      delay: 0,
      color: trainRoutes[10503].color,
      routeProgress: trainData[10503].routeProgress,
      currentStation: trainRoutes[10503].stations[Math.floor(trainData[10503].routeProgress * (trainRoutes[10503].stations.length - 1))],
      nextStation: trainRoutes[10503].stations[Math.min(Math.floor(trainData[10503].routeProgress * (trainRoutes[10503].stations.length - 1)) + 1, trainRoutes[10503].stations.length - 1)]
    },
    {
      id: 10504,
      trainNumber: "10504",
      name: "Gajayana",
      class: "Eksekutif",
      route: "Jakarta Gambir → Malang",
      departure: "18:00", 
      arrival: "04:45",
      platform: "Platform 1",
      status: "TEPAT WAKTU",
      speed: trainData[10504].speed,
      lat: calculateTrainPosition(10504, trainData[10504].routeProgress)[0],
      lng: calculateTrainPosition(10504, trainData[10504].routeProgress)[1],
      delay: 0,
      color: trainRoutes[10504].color,
      routeProgress: trainData[10504].routeProgress,
      currentStation: trainRoutes[10504].stations[Math.floor(trainData[10504].routeProgress * (trainRoutes[10504].stations.length - 1))],
      nextStation: trainRoutes[10504].stations[Math.min(Math.floor(trainData[10504].routeProgress * (trainRoutes[10504].stations.length - 1)) + 1, trainRoutes[10504].stations.length - 1)]
    },
    {
      id: 10505,
      trainNumber: "10505",
      name: "Lodaya",
      class: "Bisnis",
      route: "Jakarta Gambir → Bandung",
      departure: "15:30",
      arrival: "18:45",
      platform: "Platform 4", 
      status: "TEPAT WAKTU",
      speed: trainData[10505].speed,
      lat: calculateTrainPosition(10505, trainData[10505].routeProgress)[0],
      lng: calculateTrainPosition(10505, trainData[10505].routeProgress)[1],
      delay: 0,
      color: trainRoutes[10505].color,
      routeProgress: trainData[10505].routeProgress,
      currentStation: trainRoutes[10505].stations[Math.floor(trainData[10505].routeProgress * (trainRoutes[10505].stations.length - 1))],
      nextStation: trainRoutes[10505].stations[Math.min(Math.floor(trainData[10505].routeProgress * (trainRoutes[10505].stations.length - 1)) + 1, trainRoutes[10505].stations.length - 1)]
    },
    {
      id: 10506,
      trainNumber: "10506", 
      name: "Matarmaja",
      class: "Ekonomi Plus",
      route: "Jakarta Pasar Senen → Semarang Tawang",
      departure: "14:00",
      arrival: "21:30",
      platform: "Platform 2",
      status: "TEPAT WAKTU",
      speed: trainData[10506].speed,
      lat: calculateTrainPosition(10506, trainData[10506].routeProgress)[0],
      lng: calculateTrainPosition(10506, trainData[10506].routeProgress)[1],
      delay: 0,
      color: trainRoutes[10506].color,
      routeProgress: trainData[10506].routeProgress,
      currentStation: trainRoutes[10506].stations[Math.floor(trainData[10506].routeProgress * (trainRoutes[10506].stations.length - 1))],
      nextStation: trainRoutes[10506].stations[Math.min(Math.floor(trainData[10506].routeProgress * (trainRoutes[10506].stations.length - 1)) + 1, trainRoutes[10506].stations.length - 1)]
    }
  ];

  // Generate coordinates for user train
  const generateStationCoords = (stations) => {
    return stations.map((station, idx) => {
      return stationCoordinates[station.name] || [-6.2 + (idx * 0.4), 106.8 + (idx * 0.6)];
    });
  };

  // User train data
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
    color: "#10b981",
    currentStation: stations[currentStation]?.name || "Jakarta",
    nextStation: stations[currentStation + 1]?.name || "Tujuan"
  } : null;

  const stationCoords = latestOrder ? generateStationCoords(stations) : [];

  // Filter trains
  const filteredTrains = allScheduleTrains.filter(train =>
    train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.trainNumber.includes(searchTerm) ||
    train.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combine all trains
  const allTrains = userTrain ? [userTrain, ...filteredTrains] : filteredTrains;
  const currentFollowingTrain = followingTrainId ? allTrains.find(t => t.id === followingTrainId) : null;

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([-7.0, 109.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 6
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Realistic train movement simulation
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
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Draw route lines ONLY for followed train
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear ALL existing route lines
    Object.values(routeLinesRef.current).forEach(line => {
      mapInstanceRef.current.removeLayer(line);
    });
    routeLinesRef.current = {};

    // Clear ALL existing station markers
    Object.values(stationMarkersRef.current).forEach(markers => {
      markers.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    });
    stationMarkersRef.current = {};

    // Only draw route for followed train
    if (showRoute && followingTrainId) {
      const followedTrain = allTrains.find(t => t.id === followingTrainId);
      
      if (followedTrain) {
        if (followedTrain.isUserTrain) {
          // Draw user train route
          if (stationCoords.length > 1) {
            const userRouteLine = L.polyline(stationCoords, {
              color: followedTrain.color,
              weight: 5,
              opacity: 0.8,
              dashArray: '12, 6'
            }).addTo(mapInstanceRef.current);

            routeLinesRef.current[followedTrain.id] = userRouteLine;

            // Add user train station markers
            stationMarkersRef.current[followedTrain.id] = [];
            
            stations.forEach((station, idx) => {
              const coords = stationCoordinates[station.name];
              if (coords) {
                const isPassed = idx < currentStation;
                const isCurrent = idx === currentStation;
                
                const stationIcon = L.divIcon({
                  html: `<div style="
                    width: 14px;
                    height: 14px;
                    background: ${isPassed || isCurrent ? followedTrain.color : '#6b7280'};
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    ${isCurrent ? 'animation: pulse 1.5s infinite; transform: scale(1.4);' : ''}
                  "></div>`,
                  iconSize: [14, 14],
                  className: 'user-station-marker'
                });

                const marker = L.marker(coords, { icon: stationIcon })
                  .addTo(mapInstanceRef.current)
                  .bindPopup(`
                    <div style="text-align: center; padding: 8px;">
                      <div style="font-weight: bold; color: #065f46;">${station.name}</div>
                      <div style="font-size: 12px; color: #6b7280;">${station.time}</div>
                      ${isCurrent ? '<div style="font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 600;">🎫 Your Train Here</div>' : ''}
                      ${isPassed ? '<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">✅ Passed</div>' : ''}
                      ${!isPassed && !isCurrent ? '<div style="font-size: 12px; color: #3b82f6; margin-top: 4px;">⏳ Coming</div>' : ''}
                    </div>
                  `);

                stationMarkersRef.current[followedTrain.id].push(marker);
              }
            });
          }
        } else {
          // Draw other train route
          const route = trainRoutes[followedTrain.id];
          if (route && route.stations) {
            const routeCoords = route.stations
              .map(stationName => stationCoordinates[stationName])
              .filter(coord => coord);

            if (routeCoords.length > 1) {
              const routeLine = L.polyline(routeCoords, {
                color: route.color,
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 6'
              }).addTo(mapInstanceRef.current);

              routeLinesRef.current[followedTrain.id] = routeLine;

              // Add station markers for followed train
              stationMarkersRef.current[followedTrain.id] = [];
              
              route.stations.forEach((stationName, idx) => {
                const coords = stationCoordinates[stationName];
                if (coords) {
                  const isCurrentStation = stationName === followedTrain.currentStation;
                  const isPassed = followedTrain.routeProgress > (idx / (route.stations.length - 1));
                  
                  const stationIcon = L.divIcon({
                    html: `<div style="
                      width: 12px;
                      height: 12px;
                      background: ${isPassed ? route.color : '#6b7280'};
                      border: 2px solid white;
                      border-radius: 50%;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      ${isCurrentStation ? 'animation: pulse 1.5s infinite; transform: scale(1.3);' : ''}
                    "></div>`,
                    iconSize: [12, 12],
                    className: 'station-marker'
                  });

                  const marker = L.marker(coords, { icon: stationIcon })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`
                      <div style="text-align: center; padding: 8px;">
                        <div style="font-weight: bold; color: #1f2937;">${stationName}</div>
                        <div style="font-size: 12px; color: #6b7280; margin: 4px 0;">
                          ${followedTrain.name} Route
                        </div>
                        ${isCurrentStation ? '<div style="font-size: 12px; color: ' + route.color + '; font-weight: 600;">🚄 Train Here Now</div>' : ''}
                        ${isPassed && !isCurrentStation ? '<div style="font-size: 12px; color: #6b7280;">✅ Passed</div>' : ''}
                        ${!isPassed && !isCurrentStation ? '<div style="font-size: 12px; color: #3b82f6;">⏳ Upcoming</div>' : ''}
                      </div>
                    `);

                  stationMarkersRef.current[followedTrain.id].push(marker);
                }
              });
            }
          }
        }
      }
    }
  }, [showRoute, followingTrainId, allTrains, stationCoords, currentStation, stations, trainData]);

  // Auto-follow function
  const startAutoFollow = (trainId) => {
    setIsFollowing(true);
    setFollowingTrainId(trainId);
    
    if (followingIntervalRef.current) {
      clearInterval(followingIntervalRef.current);
    }

    followingIntervalRef.current = setInterval(() => {
      const train = allTrains.find(t => t.id === trainId);
      if (train && mapInstanceRef.current) {
        mapInstanceRef.current.setView([train.lat, train.lng], 11, {
          animate: true,
          duration: 1
        });
      }
    }, 1000);

    const train = allTrains.find(t => t.id === trainId);
    if (train && onTrainFollow) {
      onTrainFollow(train);
    }
  };

  // Stop auto-follow
  const stopAutoFollow = () => {
    setIsFollowing(false);
    setFollowingTrainId(null);
    
    if (followingIntervalRef.current) {
      clearInterval(followingIntervalRef.current);
      followingIntervalRef.current = null;
    }

    if (onStopFollowing) {
      onStopFollowing();
    }
  };

  // Handle train click
  const handleTrainClick = (train) => {
    if (followingTrainId === train.id) {
      stopAutoFollow();
    } else {
      startAutoFollow(train.id);
    }
  };

  // Update train markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    Object.values(trainMarkersRef.current).forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    trainMarkersRef.current = {};

    allTrains.forEach(train => {
      const isFollowed = followingTrainId === train.id;
      const isUserTrain = train.isUserTrain;
      
      const trainIcon = L.divIcon({
        html: `<div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isUserTrain ? '48px' : '40px'};
          height: ${isUserTrain ? '48px' : '40px'};
          background: ${isUserTrain ? 'linear-gradient(135deg, #10b981, #059669)' : train.color || '#3b82f6'};
          border: 3px solid white;
          border-radius: 50%;
          font-size: ${isUserTrain ? '20px' : '16px'};
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          cursor: pointer;
          transform: ${isFollowed ? 'scale(1.2)' : 'scale(1)'};
          transition: all 0.3s ease;
          ${isFollowed ? 'animation: pulse 2s infinite;' : ''}
          z-index: ${isFollowed ? '1001' : '1000'};
        ">${isUserTrain ? '🎫' : '🚄'}</div>`,
        iconSize: [isUserTrain ? 48 : 40, isUserTrain ? 48 : 40],
        className: `train-marker ${isFollowed ? 'following' : ''}`
      });

      const marker = L.marker([train.lat, train.lng], { icon: trainIcon })
        .addTo(mapInstanceRef.current)
        .on('click', () => handleTrainClick(train))
        .bindPopup(`
          <div style="padding: 12px; min-width: 240px;">
            <div style="font-weight: bold; color: ${isUserTrain ? '#065f46' : '#1f2937'}; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              ${isUserTrain ? '🎫' : '🚄'} ${train.name}
              ${isUserTrain ? '<span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 10px;">MY TRAIN</span>' : ''}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin: 4px 0;">
              ${train.trainNumber} • ${train.class || 'N/A'}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${train.route}</div>
            <div style="background: #f9fafb; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
              <div style="font-size: 11px; color: #6b7280;">Current Position:</div>
              <div style="font-size: 13px; font-weight: 600; color: #1f2937;">${train.currentStation}</div>
              <div style="font-size: 11px; color: #6b7280;">Next: ${train.nextStation}</div>
              ${train.routeProgress ? `<div style="font-size: 11px; color: #3b82f6;">Progress: ${Math.round(train.routeProgress * 100)}%</div>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
              <span style="color: ${train.status === 'TEPAT WAKTU' ? '#059669' : '#f59e0b'}; font-weight: 600;">${train.status}</span>
              <span style="font-weight: 600;">${train.speed} km/h</span>
            </div>
            ${train.departure ? `<div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Depart: ${train.departure} | Arrive: ${train.arrival}</div>` : ''}
            ${train.platform ? `<div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">${train.platform}</div>` : ''}
            ${train.delay > 0 ? `<div style="font-size: 12px; color: #f59e0b; margin-bottom: 8px;">Delay: +${train.delay} min</div>` : ''}
            <button 
              onclick="window.toggleTrainFollow(${train.id})" 
              style="
                width: 100%;
                background: ${isFollowed ? '#dc2626' : train.color || '#059669'};
                color: white;
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
              "
            >
              ${isFollowed ? '🛑 Stop Following' : '🎯 Follow Train'}
            </button>
          </div>
        `);

      trainMarkersRef.current[train.id] = marker;
    });
  }, [allTrains, followingTrainId, trainData]);

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
  }, [followingTrainId, allTrains]);

  // Center map to all trains
  const centerToAllTrains = () => {
    if (allTrains.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(allTrains.map(train => [train.lat, train.lng]));
      mapInstanceRef.current.fitBounds(bounds.pad(0.1));
      stopAutoFollow();
    }
  };

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (followingIntervalRef.current) {
        clearInterval(followingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white h-screen flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
        {!sidebarCollapsed && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Target size={16} />
                  Klik kereta untuk auto-follow
                </h3>
                <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-gray-200 rounded">
                  <X size={16} />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari kereta atau rute..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={centerToAllTrains}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-1"
                >
                  <RotateCcw size={12} />
                  Center All
                </button>
                {isFollowing && (
                  <button
                    onClick={stopAutoFollow}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition flex items-center justify-center gap-1"
                  >
                    <X size={12} />
                    Stop Follow
                  </button>
                )}
              </div>
            </div>

            {/* User Train Priority */}
            {userTrain && (
              <div className="p-4 bg-green-50 border-b">
                <div 
                  className={`bg-white rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    followingTrainId === userTrain.id 
                      ? 'border-green-400 bg-green-50 shadow-md' 
                      : 'border-green-200 hover:border-green-300'
                  }`}
                  onClick={() => handleTrainClick(userTrain)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-green-800 flex items-center gap-2">
                      🎫 {userTrain.name}
                      {followingTrainId === userTrain.id && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      MY TRAIN
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{userTrain.route}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    📍 {userTrain.currentStation} → {userTrain.nextStation}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-semibold">{userTrain.status}</span>
                    <span className="text-gray-600">⚡ {userTrain.speed} km/h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Train List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Semua Kereta ({filteredTrains.length})
                </h4>
                <div className="space-y-3">
                  {filteredTrains.map((train) => (
                    <div
                      key={train.id}
                      className={`bg-white rounded-lg border p-3 cursor-pointer transition-all ${
                        followingTrainId === train.id 
                          ? 'border-blue-400 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleTrainClick(train)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: train.color }}
                          ></div>
                          {train.name}
                          {followingTrainId === train.id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            train.status === 'TEPAT WAKTU'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {train.status}
                          </span>
                          {followingTrainId === train.id && (
                            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                              <Target size={10} />
                              LOCKED
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{train.route}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        📍 {train.currentStation} → {train.nextStation}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">⚡ {train.speed} km/h</span>
                          <span className="text-gray-500">• {train.class}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {train.delay > 0 && <span className="text-orange-600">+{train.delay}m</span>}
                          {train.routeProgress && (
                            <span className="text-blue-600">{Math.round(train.routeProgress * 100)}%</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {train.departure} - {train.arrival} • {train.platform}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Route Legend */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-xs text-gray-600 mb-2">
                💡 Route line hanya muncul saat kereta di-follow
              </div>
              {isFollowing && currentFollowingTrain && (
                <div className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-4 h-1 rounded"
                    style={{ backgroundColor: currentFollowingTrain.color }}
                  ></div>
                  <span className="text-gray-600">
                    Route: {currentFollowingTrain.name}
                  </span>
                </div>
              )}
              {isFollowing && currentFollowingTrain && (
                <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-2">
                  <RotateCw size={12} className="animate-spin" />
                  Following: {currentFollowingTrain.name}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Map Header */}
        <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Train size={20} />
                </button>
              )}
              <h1 className="text-xl font-bold text-gray-800">KAI Live Tracker</h1>
              <p className="text-sm text-gray-600">Pantau pergerakan real-time kereta api Indonesia</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={centerToAllTrains}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                title="Center to all trains"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`p-2 rounded-lg transition ${showRoute ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Toggle routes"
              >
                <Navigation size={16} />
              </button>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Live Updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div 
          ref={mapRef} 
          style={{ height: '100%', width: '100%', paddingTop: '80px' }}
          className="leaflet-container"
        />

        {/* Following Indicator */}
        {isFollowing && currentFollowingTrain && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-10">
            <Target size={18} className="animate-pulse" />
            <div>
              <div className="font-semibold text-sm">Auto-Following</div>
              <div className="text-xs text-blue-200">
                {currentFollowingTrain.name} • {currentFollowingTrain.speed} km/h
              </div>
              <div className="text-xs text-blue-200">
                {currentFollowingTrain.currentStation} → {currentFollowingTrain.nextStation}
              </div>
            </div>
            <button onClick={stopAutoFollow} className="ml-2 hover:bg-blue-700 rounded p-1 transition">
              ✕
            </button>
          </div>
        )}

        {/* Real-time Status */}
        <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-3 z-10">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-700">Live Tracking</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {isFollowing ? `Following 1 train` : `Monitoring ${allTrains.length} trains`}
          </div>
          <div className="text-xs text-gray-400">
            Updated: {realTimeUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
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
      `}</style>
    </div>
  );
}