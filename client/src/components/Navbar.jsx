import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.error("Error parsing profile:", err);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user_profile");
    navigate("/"); // Redirect ke Landing page
    window.location.reload(); // Force reload untuk update state App.jsx
  };


  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Left: Search or Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Selamat Datang, {profile?.name || "User"}! 👋
        </h2>
      </div>

      {/* Right: Notification + Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              {profile?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-800">
                {profile?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{profile?.email || ""}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-gray-700"
                onClick={() => setOpen(false)}
              >
                <User size={18} className="text-blue-600" />
                <span className="font-medium">Profil Saya</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-gray-700"
                onClick={() => setOpen(false)}
              >
                <Settings size={18} className="text-gray-600" />
                <span className="font-medium">Pengaturan</span>
              </Link>

              <hr className="my-2 border-gray-200" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600 w-full text-left"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
