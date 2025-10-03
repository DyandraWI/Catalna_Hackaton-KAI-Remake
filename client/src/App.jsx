// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Tracking from "./pages/Tracking";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    try {
      const profile = raw ? JSON.parse(raw) : null;
      setIsLoggedIn(Boolean(profile?.email));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onAuth={() => setIsLoggedIn(true)} />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register onAuth={() => setIsLoggedIn(true)} />}
        />
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar setSidebarOpen={setSidebarOpen} />
                  <main className="flex-1 overflow-y-auto p-4">
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="booking" element={<Booking />} />
                      <Route path="history" element={<History />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="tracking" element={<Tracking />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
