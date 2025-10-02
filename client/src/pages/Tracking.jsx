import { useState, useEffect } from "react";
import { Train, MapPin, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Tracking() {
  const [latestOrder, setLatestOrder] = useState(null);
  const [currentStation, setCurrentStation] = useState(0);
  const [trainPosition, setTrainPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [countdown, setCountdown] = useState(null);

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

  // Countdown ETA - FIXED VERSION
  useEffect(() => {
    if (!latestOrder || stations.length === 0) return;

    const lastStation = stations[stations.length - 1];
    const bookingDate = new Date(latestOrder.date);
    const [hours, minutes] = lastStation.time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes), 0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = bookingDate - now;

      // Format waktu tiba
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

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🚆 Tracking Kereta Live
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isCompleted ? "Perjalanan selesai" : isMoving ? "Kereta sedang bergerak..." : "Kereta berhenti di stasiun"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{progressPercent}%</p>
            <p className="text-xs text-gray-500">Progress</p>
          </div>
        </div>

        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 -translate-y-1/2"></div>
          
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-green-400 to-green-600 -translate-y-1/2 transition-all duration-1000 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          ></div>

          <div className="relative flex justify-between items-center">
            {stations.map((station, idx) => {
              const isPassed = idx < currentStation;
              const isCurrent = idx === currentStation;
              
              return (
                <div key={idx} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-5 h-5 rounded-full border-4 transition-all duration-500 ${
                      isPassed
                        ? "bg-green-500 border-green-300 shadow-lg shadow-green-300/50"
                        : isCurrent
                        ? "bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-300/50 scale-125 animate-pulse"
                        : "bg-white border-gray-300"
                    }`}
                  ></div>
                  
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-semibold ${isPassed || isCurrent ? "text-gray-800" : "text-gray-400"}`}>
                      {station.name}
                    </p>
                    <p className={`text-xs ${isPassed || isCurrent ? "text-gray-600" : "text-gray-400"}`}>
                      {station.time}
                    </p>
                  </div>

                  {isPassed && (
                    <div className="absolute -top-8 bg-green-500 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-3000 ease-in-out"
            style={{ left: `${trainPosition}%` }}
          >
            <div className="relative">
              <div className={`bg-blue-600 text-white p-3 rounded-full shadow-2xl ${isMoving ? 'animate-bounce' : ''}`}>
                <Train size={24} className="transform rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <MapPin size={18} />
              <p className="text-xs font-semibold">Stasiun Saat Ini</p>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {isCompleted 
                ? stations[currentStation].name 
                : isMoving 
                  ? `Menuju ${stations[currentStation]?.name}` 
                  : stations[currentStation]?.name}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Clock size={18} />
              <p className="text-xs font-semibold">Estimasi Tiba</p>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {countdown || "Menghitung..."}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Train size={18} />
              <p className="text-xs font-semibold">Status</p>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {isCompleted ? "Tiba" : isMoving ? "Bergerak" : "Berhenti"}
            </p>
          </div>
        </div>

        <div className={`mt-6 p-4 rounded-xl ${isCompleted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
          <p className="text-sm font-semibold text-center">
            {isCompleted
              ? "✅ Kereta telah tiba di " + stations[stations.length - 1].name
              : isMoving
              ? `🚆 Kereta sedang menuju ${stations[currentStation]?.name} (${progressPercent}% perjalanan)`
              : `⏸️ Kereta berhenti di ${stations[currentStation]?.name}`}
          </p>
        </div>
      </div>
    </div>
  );
}
