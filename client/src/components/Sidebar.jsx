// Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { Home, Ticket, Train, History, X } from "lucide-react";
import logoKAI from "../assets/logo_kai.svg";

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Pesan Tiket", path: "/booking", icon: <Ticket size={20} /> },
    { name: "Tracking", path: "/tracking", icon: <Train size={20} /> },
    { name: "Riwayat Pemesanan", path: "/history", icon: <History size={20} /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <div
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col p-6 shadow-lg transform transition-transform duration-300 
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-sm`}
      >
        {/* Header logo */}
        <div className="mb-10 flex justify-between items-center">
          <img src={logoKAI} alt="KAI Logo" className="w-28 h-auto" />
          {/* Close button in mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menu.map((item, idx) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setOpen(false)}
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
    </>
  );
}
