import { Link, useLocation } from "react-router-dom";
import { Home, Ticket, Train, History } from "lucide-react";
import logoKAI from "../assets/logo_kai.svg";

export default function Sidebar() {
  const location = useLocation();
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Pesan Tiket", path: "/booking", icon: <Ticket size={20} /> },
    { name: "Tracking", path: "/tracking", icon: <Train size={20} /> },
    { name: "Riwayat Pemesanan", path: "/history", icon: <History size={20} /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 shadow-sm">
      {/* Logo KAI */}
      <div className="mb-10 flex justify-center">
        <img src={logoKAI} alt="KAI Logo" className="w-28 h-auto" />
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menu.map((item, idx) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                active
                  ? "bg-orange-500 text-white font-semibold shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-10 text-center">
        <p className="text-xs text-gray-400">© 2025 KAI</p>
      </div>
    </div>
  );
}
