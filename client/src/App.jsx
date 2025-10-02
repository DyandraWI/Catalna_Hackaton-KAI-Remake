// src/App.jsx
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

/** Simple Logout component used as route target */
function Logout({ onLoggedOut }) {
  useEffect(() => {
    localStorage.removeItem("user_profile");
    onLoggedOut && onLoggedOut();
    // redirect to login
    window.location.href = "/login";
  }, []);
  return null;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // on app load, validate stored profile
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_profile");
      if (!raw) {
        setIsLoggedIn(false);
        return;
      }
      const profile = JSON.parse(raw);
      // basic validation: must be object and have email or name
      setIsLoggedIn(Boolean(profile && (profile.email || profile.name)));
    } catch (err) {
      // invalid JSON or other error -> treat as logged out
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing */}
        <Route path="/" element={<Landing />} />

        {/* Login/Register: only redirect to dashboard if truly logged in */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              // pass callback so Login can set app-level auth state
              <Login onAuth={() => setIsLoggedIn(true)} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register onAuth={() => setIsLoggedIn(true)} />
            )
          }
        />

        {/* Protected area: if not logged in, redirect to /login */}
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar />
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="booking" element={<Booking />} />
                      <Route path="history" element={<History />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="tracking" element={<Tracking />} />
                      {/* optional logout route */}
                      <Route
                        path="logout"
                        element={<Logout onLoggedOut={() => setIsLoggedIn(false)} />}
                      />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;