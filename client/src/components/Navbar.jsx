import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Judul */}
      <h2 className="text-xl font-semibold text-gray-800">
        Selamat Datang di KAI 🚆
      </h2>

      {/*Notifikasi + Avatar */}
      <div className="flex items-center space-x-4">


        {/* Notifikasi */}
        <button className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 flex items-center">
          <Bell size={18} />
        </button>

        {/* Avatar Icon */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <User size={20} className="text-gray-700" />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 space-x-2"
              >
                <User size={16} />
                <span>Profil</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 space-x-2"
              >
                <Settings size={16} />
                <span>Pengaturan</span>
              </Link>
              <button
                className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100 text-red-500 space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
