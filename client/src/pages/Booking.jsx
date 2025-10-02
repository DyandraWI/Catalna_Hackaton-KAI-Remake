import { useState, useMemo, useEffect } from "react";
import SeatMap from "../components/SeatMap";
import OrderSummary from "../components/OrderSummary";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowRight, ArrowLeft, MapPin, Users, CreditCard, CheckCircle, Calendar as CalendarIcon } from "lucide-react";

const CITIES = {
  Bandung: ["Cimahi (CMI)", "Bandung (BD)"],
  Jakarta: ["Jakarta Gambir (GMR)", "Jakarta Kota (JAK)"],
  Surabaya: ["Surabaya Gubeng (SGU)", "Surabaya Pasar Turi (SBI)"],
  Yogyakarta: ["Yogyakarta (YK)"],
};

const CLASS_OPTIONS = [
  { id: "economy", name: "Ekonomi", price: 75000, desc: "AC, toilet, kapasitas 80–106", color: "bg-blue-500" },
  { id: "business", name: "Bisnis", price: 150000, desc: "Fasilitas lebih baik", color: "bg-purple-500" },
  { id: "executive", name: "Eksekutif", price: 300000, desc: "Kursi empuk, kapasitas 50", color: "bg-orange-500" },
];

function generateSeats(clsId) {
  if (clsId === "executive") return makeSeats(5, 4, 0.1);
  if (clsId === "business") return makeSeats(8, 4, 0.15);
  return makeSeats(10, 4, 0.25);

  function makeSeats(rows, cols, occRatio) {
    const seats = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        seats.push({
          id: `${r}-${c}`,
          label: `${String.fromCharCode(65 + r)}${c + 1}`,
          row: r,
          col: c,
          occupied: Math.random() < occRatio,
        });
      }
    }
    return seats;
  }
}

// Custom Date Picker Component
function CustomDatePicker({ value, onChange, label }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const today = new Date();
  const selectedDate = value ? new Date(value) : null;

  // Generate dates untuk 14 hari ke depan
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                      "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(date) {
    if (!date) return "Pilih Tanggal";
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  function handleDateSelect(date) {
    onChange({ target: { value: formatDateForInput(date) } });
    setShowCalendar(false);
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Display Button */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full border border-gray-300 rounded-lg p-3 flex items-center justify-between hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
      >
        <span className={selectedDate ? "text-gray-800" : "text-gray-400"}>
          {formatDisplayDate(selectedDate)}
        </span>
        <CalendarIcon size={20} className="text-gray-500" />
      </button>

      {/* Custom Calendar Dropdown */}
      {showCalendar && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowCalendar(false)}
          ></div>

          {/* Calendar */}
          <div className="absolute z-20 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-full animate-fadeIn">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Pilih Tanggal Keberangkatan</h3>
              <p className="text-sm text-gray-500">Maksimal 14 hari ke depan</p>
            </div>

            {/* Quick Date Buttons */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dates.map((date, idx) => {
                const isSelected = selectedDate && 
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();
                const isToday = idx === 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all hover:shadow-md ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : isToday
                        ? "bg-orange-100 text-orange-600 border border-orange-300"
                        : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:border-blue-300 border border-transparent"
                    }`}
                  >
                    <span className="text-xs font-medium">{dayNames[date.getDay()]}</span>
                    <span className="text-lg font-bold mt-1">{date.getDate()}</span>
                    <span className="text-xs mt-1">{monthNames[date.getMonth()].slice(0, 3)}</span>
                  </button>
                );
              })}
            </div>

            {/* Alternative: Manual Input */}
            <div className="border-t pt-4">
              <label className="block text-xs text-gray-600 mb-2">Atau pilih tanggal manual:</label>
              <input
                type="date"
                value={value}
                onChange={(e) => {
                  onChange(e);
                  setShowCalendar(false);
                }}
                min={formatDateForInput(today)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Booking() {
  const location = useLocation();
  const [step, setStep] = useState(1);

  const [originCity, setOriginCity] = useState("Bandung");
  const [originStation, setOriginStation] = useState(CITIES["Bandung"][0]);
  const [destCity, setDestCity] = useState("Jakarta");
  const [destStation, setDestStation] = useState(CITIES["Jakarta"][0]);
  const [date, setDate] = useState("");
  const [passenger, setPassenger] = useState(1);
  const [selectedClass, setSelectedClass] = useState("economy");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [voucher, setVoucher] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [orderComplete, setOrderComplete] = useState(null);

  useEffect(() => {
    if (location.state?.rebook) {
      const { originCity, origin, destCity, destination, date, className } = location.state.rebook;
      if (originCity) setOriginCity(originCity);
      if (origin) setOriginStation(origin);
      if (destCity) setDestCity(destCity);
      if (destination) setDestStation(destination);
      if (date) setDate(date);
      if (className) setSelectedClass(className);
    }
  }, [location.state]);

  const seats = useMemo(() => generateSeats(selectedClass), [selectedClass]);

  const pricePerSeat = CLASS_OPTIONS.find((c) => c.id === selectedClass)?.price || 0;
  const subtotal = pricePerSeat * passenger;
  const voucherDiscount =
    voucher.trim().toUpperCase() === "KAI20" ? Math.min(0.2 * subtotal, 50000) : 0;
  const total = subtotal - voucherDiscount;

  function toggleSeat(seatObj) {
    if (seatObj.occupied) return;

    if (selectedSeats.find((s) => s.id === seatObj.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seatObj.id));
    } else {
      if (selectedSeats.length < passenger) {
        setSelectedSeats([...selectedSeats, seatObj]);
      } else {
        alert(`Maksimal ${passenger} kursi bisa dipilih.`);
      }
    }
  }

  function handlePay() {
    if (!date) return alert("Pilih tanggal berangkat terlebih dahulu.");
    if (selectedSeats.length !== passenger) return alert(`Pilih ${passenger} kursi.`);

    // Get user profile
    const userProfile = JSON.parse(localStorage.getItem("user_profile") || '{"name":"Guest User","email":"","phone":""}');

    const ticket = {
      id: `KAI-${Date.now().toString().slice(-6)}`,
      passengerName: userProfile.name,
      passengerEmail: userProfile.email,
      passengerPhone: userProfile.phone,
      originCity,
      origin: originStation,
      destCity,
      destination: destStation,
      date,
      passenger,
      className: selectedClass,
      seats: selectedSeats.map((s) => s.label),
      price: total,
      paymentMethod,
      eta: "Perkiraan tiba: " + addHours(date, 3),
      timeBooked: new Date().toISOString(),
    };

    setOrderComplete(ticket);

    const prev = JSON.parse(localStorage.getItem("kai_history") || "[]");
    prev.unshift(ticket);
    localStorage.setItem("kai_history", JSON.stringify(prev));
  }


  const canNextStep1 = 
    originStation && 
    destStation && 
    date && 
    passenger > 0 && 
    !(originStation === destStation && originCity === destCity);
  const canNextStep2 = selectedClass && selectedSeats.length === passenger;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {!orderComplete ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Pesan Tiket Kereta</h1>
              <p className="text-gray-500 mt-1">Lengkapi data pemesanan Anda</p>
            </div>

            {/* Progress Stepper */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <StepIndicator num={1} label="Info Perjalanan" active={step >= 1} icon={<MapPin size={20} />} />
                <div className={`flex-1 h-1 mx-4 ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}></div>
                <StepIndicator num={2} label="Pilih Kelas & Kursi" active={step >= 2} icon={<Users size={20} />} />
                <div className={`flex-1 h-1 mx-4 ${step >= 3 ? "bg-blue-600" : "bg-gray-300"}`}></div>
                <StepIndicator num={3} label="Pembayaran" active={step >= 3} icon={<CreditCard size={20} />} />
              </div>
            </div>

            {/* Step 1: Route & Date */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="text-blue-600" /> Informasi Perjalanan
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kota Asal</label>
                    <select
                      value={originCity}
                      onChange={(e) => {
                        const newOriginCity = e.target.value;
                        setOriginCity(newOriginCity);
                        setOriginStation(CITIES[newOriginCity][0]);
                        
                        if (newOriginCity === destCity) {
                          const otherCity = Object.keys(CITIES).find(c => c !== newOriginCity);
                          setDestCity(otherCity);
                          setDestStation(CITIES[otherCity][0]);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.keys(CITIES).map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stasiun Asal</label>
                    <select
                      value={originStation}
                      onChange={(e) => {
                        const newOriginStation = e.target.value;
                        setOriginStation(newOriginStation);
                        
                        if (originCity === destCity && newOriginStation === destStation) {
                          const otherStation = CITIES[destCity].find(s => s !== newOriginStation);
                          if (otherStation) setDestStation(otherStation);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CITIES[originCity].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kota Tujuan</label>
                    <select
                      value={destCity}
                      onChange={(e) => {
                        const newDestCity = e.target.value;
                        setDestCity(newDestCity);
                        setDestStation(CITIES[newDestCity][0]);
                        
                        if (newDestCity === originCity) {
                          const otherCity = Object.keys(CITIES).find(c => c !== newDestCity);
                          setOriginCity(otherCity);
                          setOriginStation(CITIES[otherCity][0]);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.keys(CITIES).map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stasiun Tujuan</label>
                    <select
                      value={destStation}
                      onChange={(e) => {
                        const newDestStation = e.target.value;
                        setDestStation(newDestStation);
                        
                        if (originCity === destCity && newDestStation === originStation) {
                          const otherStation = CITIES[originCity].find(s => s !== newDestStation);
                          if (otherStation) setOriginStation(otherStation);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CITIES[destCity].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Date Picker - Full Width */}
                  <div className="col-span-2">
                    <CustomDatePicker
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      label="Tanggal Keberangkatan"
                    />
                  </div>

                  {/* Enhanced Passenger Input - Full Width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Penumpang</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setPassenger(Math.max(1, passenger - 1))}
                        className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-bold text-xl"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={passenger}
                        onChange={(e) => setPassenger(+e.target.value)}
                        className="flex-1 text-center border border-gray-300 rounded-lg p-3 text-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setPassenger(Math.min(4, passenger + 1))}
                        className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-bold text-xl"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Maksimal 4 penumpang per pemesanan</p>
                  </div>
                </div>

                {/* Warning jika stasiun sama */}
                {originStation === destStation && originCity === destCity && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">!</div>
                    <p className="text-sm text-red-700 font-medium">
                      Stasiun keberangkatan dan tujuan tidak boleh sama. Pilih stasiun yang berbeda.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => canNextStep1 && setStep(2)}
                  disabled={!canNextStep1}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                    canNextStep1
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Lanjut ke Pilih Kelas <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* Step 2: Class & Seats */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Pilih Kelas Kereta</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {CLASS_OPTIONS.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedClass(c.id);
                          setSelectedSeats([]);
                        }}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                          selectedClass === c.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className={`w-12 h-12 ${c.color} rounded-full flex items-center justify-center text-white font-bold text-xl mb-3`}>
                          {c.name[0]}
                        </div>
                        <h3 className="font-bold text-lg">{c.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
                        <p className="text-blue-600 font-bold mt-3">Rp {c.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Pilih Kursi ({selectedSeats.length}/{passenger})</h2>
                  <SeatMap
                    seats={seats}
                    selectedSeats={selectedSeats}
                    onToggle={toggleSeat}
                    passenger={passenger}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                  >
                    <ArrowLeft size={20} /> Kembali
                  </button>
                  <button
                    onClick={() => canNextStep2 && setStep(3)}
                    disabled={!canNextStep2}
                    className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      canNextStep2
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Lanjut ke Pembayaran <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <OrderSummary
                  origin={originStation}
                  destination={destStation}
                  date={date}
                  passenger={passenger}
                  className={selectedClass}
                  seat={selectedSeats}
                  pricePerSeat={pricePerSeat}
                  onVoucherChange={setVoucher}
                  voucher={voucher}
                  subtotal={subtotal}
                  discount={voucherDiscount}
                  total={total}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  onPay={handlePay}
                />

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 border-2 border-gray-300 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                >
                  <ArrowLeft size={20} /> Kembali ke Pilih Kursi
                </button>
              </div>
            )}
          </>
        ) : (
         <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto text-center animate-fadeIn">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Tiket Berhasil Dipesan! 🎉</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 text-left">
          {/* Passenger Info */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-600 mb-2">Nama Penumpang</p>
            <p className="text-lg font-bold text-gray-800">{orderComplete.passengerName}</p>
            {orderComplete.passengerEmail && (
              <p className="text-sm text-gray-600 mt-1">{orderComplete.passengerEmail}</p>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">Kode Booking</p>
          <p className="text-3xl font-bold text-blue-600 mb-4">{orderComplete.id}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Rute</p>
              <p className="font-semibold">{orderComplete.origin} → {orderComplete.destination}</p>
            </div>
            <div>
              <p className="text-gray-600">Tanggal</p>
              <p className="font-semibold">{orderComplete.date}</p>
            </div>
            <div>
              <p className="text-gray-600">Kelas</p>
              <p className="font-semibold capitalize">{orderComplete.className}</p>
            </div>
            <div>
              <p className="text-gray-600">Kursi</p>
              <p className="font-semibold">{orderComplete.seats.join(", ")}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600">Total Pembayaran</p>
            <p className="text-2xl font-bold text-gray-800">Rp {orderComplete.price.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <QRCodeCanvas value={JSON.stringify(orderComplete)} size={200} className="shadow-lg rounded-xl" />
          <p className="text-sm text-gray-600 mt-3">Scan QR code ini di stasiun</p>
        </div>
        
        <button
          onClick={() => window.location.href = "/"}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ num, label, active, icon }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${
          active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        {icon}
      </div>
      <p className={`text-xs mt-2 font-medium ${active ? "text-blue-600" : "text-gray-500"}`}>{label}</p>
    </div>
  );
}

function addHours(dateStr, h) {
  const d = new Date(dateStr);
  d.setHours(d.getHours() + h);
  return d.toLocaleString();
}