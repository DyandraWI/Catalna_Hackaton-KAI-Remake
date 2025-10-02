import { useState, useEffect } from "react";
import { Train, MapPin, Clock, AlertCircle, Calendar, Map } from "lucide-react";
import { Link } from "react-router-dom";
import Schedule from "../components/Schedule";
import LiveMap from "../components/LiveMap";

export default function Tracking() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [latestOrder, setLatestOrder] = useState(null);
  const [currentStation, setCurrentStation] = useState(0);
  const [trainPosition, setTrainPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [followingTrain, setFollowingTrain] = useState(null);

  const generateStations = (origin, destination) => {
    const extractCity = (station) => station.split(" (")[0];
    
    const originCity = extractCity(origin);
    const destCity = extractCity(destination);

    const routeMap = {
      "Cimahi-Jakarta Gambir": [
        { name: "Cimahi", time: "08:00", stopDuration: 2000 },
        { name: "Bandung", time: "08:25", stopDuration: 2000 },
        { name: "Bekasi", time: "10:15", stopDuration: 2000 },
        { name: "Jatinegara", time: "11:00", stopDuration: 2000 },
        { name: "Jakarta Gambir", time: "11:30", stopDuration: 0 }
      ],
      "Bandung-Jakarta Gambir": [
        { name: "Bandung", time: "08:00", stopDuration: 2000 },
        { name: "Bekasi", time: "09:45", stopDuration: 2000 },
        { name: "Jatinegara", time: "10:30", stopDuration: 2000 },
        { name: "Jakarta Gambir", time: "11:00", stopDuration: 0 }
      ],
      "Jakarta Gambir-Bandung": [
        { name: "Jakarta Gambir", time: "08:00", stopDuration: 2000 },
        { name: "Jatinegara", time: "08:30", stopDuration: 2000 },
        { name: "Bekasi", time: "09:15", stopDuration: 2000 },
        { name: "Bandung", time: "11:00", stopDuration: 0 }
      ],
      "Jakarta Gambir-Surabaya Gubeng": [
        { name: "Jakarta Gambir", time: "08:00", stopDuration: 2000 },
        { name: "Cirebon", time: "11:30", stopDuration: 2000 },
        { name: "Semarang", time: "14:00", stopDuration: 2000 },
        { name: "Surabaya Gubeng", time: "18:00", stopDuration: 0 }
      ],
      "Surabaya Gubeng-Jakarta Gambir": [
        { name: "Surabaya Gubeng", time: "08:00", stopDuration: 2000 },
        { name: "Semarang", time: "12:00", stopDuration: 2000 },
        { name: "Cirebon", time: "14:30", stopDuration: 2000 },
        { name: "Jakarta Gambir", time: "18:00", stopDuration: 0 }
      ],
      "Jakarta Gambir-Yogyakarta": [
        { name: "Jakarta Gambir", time: "08:00", stopDuration: 2000 },
        { name: "Cirebon", time: "11:30", stopDuration: 2000 },
        { name: "Semarang", time: "14:00", stopDuration: 2000 },
        { name: "Yogyakarta", time: "16:30", stopDuration: 0 }
      ],
      "Yogyakarta-Jakarta Gambir": [
        { name: "Yogyakarta", time: "08:00", stopDuration: 2000 },
        { name: "Semarang", time: "10:30", stopDuration: 2000 },
        { name: "Cirebon", time: "13:00", stopDuration: 2000 },
        { name: "Jakarta Gambir", time: "16:30", stopDuration: 0 }
      ],
    };

    const routeKey = `${originCity}-${destCity}`;
    return routeMap[routeKey] || [
      { name: originCity, time: "08:00", stopDuration: 2000 },
      { name: destCity, time: "11:00", stopDuration: 0 }
    ];
  };

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("kai_history") || "[]");
    if (history.length > 0) {
      setLatestOrder(history[0]);
    }
  }, []);

  const stations = latestOrder 
    ? generateStations(latestOrder.origin, latestOrder.destination)
    : [];

  useEffect(() => {
    if (!latestOrder || stations.length === 0) return;

    let timeoutId;

    const moveToNextStation = () => {
      setCurrentStation((prev) => {
        if (prev >= stations.length - 1) {
          return prev;
        }

        const nextStation = prev + 1;
        
        setIsMoving(true);
        
        setTimeout(() => {
          setIsMoving(false);
          
          const stopDuration = stations[nextStation].stopDuration || 2000;
          timeoutId = setTimeout(moveToNextStation, stopDuration);
        }, 3000);

        return nextStation;
      });
    };

    timeoutId = setTimeout(moveToNextStation, 2000);

    return () => clearTimeout(timeoutId);
  }, [latestOrder, stations.length]);

  useEffect(() => {
    if (stations.length === 0) return;
    
    const targetPosition = (currentStation / (stations.length - 1)) * 100;
    setTrainPosition(targetPosition);
  }, [currentStation, stations.length]);

  // Countdown ETA
  useEffect(() => {
    if (!latestOrder || stations.length === 0) return;

    const lastStation = stations[stations.length - 1];
    const bookingDate = new Date(latestOrder.date);
    const [hours, minutes] = lastStation.time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes), 0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = bookingDate - now;

      const arrivalTime = lastStation.time;
      
      if (diff <= 0) {
        setCountdown(`${arrivalTime} - Sudah tiba 🚉`);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setCountdown(`${arrivalTime} (${days} hari ${hrs} jam)`);
        } else if (hrs > 0) {
          setCountdown(`${arrivalTime} (${hrs}j ${mins}m ${secs}d)`);
        } else if (mins > 0) {
          setCountdown(`${arrivalTime} (${mins}m ${secs}d)`);
        } else {
          setCountdown(`${arrivalTime} (${secs} detik)`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [latestOrder, stations]);

  const progressPercent = Math.floor((currentStation / (stations.length - 1)) * 100);
  const isCompleted = currentStation === stations.length - 1;

  // Handle train selection from components
  const handleTrainSelect = (train) => {
    setSelectedTrain(train);
    setFollowingTrain(train);
    setActiveTab('map');
  };

  const handleTrainFollow = (train) => {
    setFollowingTrain(train);
    setActiveTab('map');
  };

  const handleStopFollowing = () => {
    setFollowingTrain(null);
    setSelectedTrain(null);
  };

  if (!latestOrder) {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Tiket Aktif</h3>
            <p className="text-gray-500 mb-6">
              Pesan tiket terlebih dahulu untuk melihat tracking kereta
            </p>
            <Link
              to="/booking"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Pesan Tiket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tracking Kereta</h1>
        <p className="text-gray-500 mt-1">
          Pantau posisi kereta secara real-time
        </p>
      </div>

      {/* Ticket Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Kode Booking</p>
            <p className="text-2xl font-bold text-blue-600">{latestOrder.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rute</p>
            <p className="text-lg font-semibold text-gray-800">
              {latestOrder.origin} → {latestOrder.destination}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tanggal</p>
            <p className="text-lg font-semibold text-gray-800">{latestOrder.date}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'schedule'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar size={20} />
            <span>Jadwal Live</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'map'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('map')}
          >
            <Map size={20} />
            <span>Live Map</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'schedule' && (
        <Schedule
          latestOrder={latestOrder}
          stations={stations}
          currentStation={currentStation}
          trainPosition={trainPosition}
          isMoving={isMoving}
          countdown={countdown}
          progressPercent={progressPercent}
          isCompleted={isCompleted}
          onTrainSelect={handleTrainSelect}
          onTrainFollow={handleTrainFollow}
        />
      )}

      {activeTab === 'map' && (
        <LiveMap
          latestOrder={latestOrder}
          stations={stations}
          currentStation={currentStation}
          selectedTrain={selectedTrain}
          followingTrain={followingTrain}
          onTrainSelect={handleTrainSelect}
          onTrainFollow={handleTrainFollow}
          onStopFollowing={handleStopFollowing}
        />
      )}
    </div>
  );
}