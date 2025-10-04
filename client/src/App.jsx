// App.jsx - Fixed chatbot handling
import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

// Components & Pages imports (same as before)
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import KAIChatbot from "./components/KAIChatbot";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Tracking from "./pages/Tracking";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Enhanced booking state management
  const [userBookings, setUserBookings] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [bookingVersion, setBookingVersion] = useState(0);
  
  // FIXED: Better chatbot state management
  const [chatbotVisible, setChatbotVisible] = useState(true);
  const [chatbotMinimized, setChatbotMinimized] = useState(false);

  // Initialize user data
  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    try {
      const profile = raw ? JSON.parse(raw) : null;
      if (profile?.email) {
        setIsLoggedIn(true);
        setUserProfile(profile);
        loadUserBookings();
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
      setUserProfile(null);
    }
  }, []);

  // Load user bookings
  const loadUserBookings = () => {
    console.log("=== LOADING USER BOOKINGS ===");
    
    try {
      const bookingKeys = [
        "kai_bookings",
        "user_bookings", 
        "bookings",
        "orders",
        "kai_history"
      ];
      
      let foundBookings = [];
      
      for (const key of bookingKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          console.log(`Found data in ${key}:`, data);
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            foundBookings = [...foundBookings, ...parsed];
          } else if (parsed && typeof parsed === 'object') {
            foundBookings.push(parsed);
          }
        }
      }
      
      const uniqueBookings = foundBookings.filter((booking, index, self) => 
        index === self.findIndex(b => (b.id || b.bookingId) === (booking.id || booking.bookingId))
      );
      
      console.log("Final unique bookings:", uniqueBookings);
      
      const activeBookings = uniqueBookings.filter(booking => {
        const now = new Date();
        const travelDate = booking.travelDate || booking.date || booking.departureDate;
        
        if (!travelDate) return true;
        
        const departureDateTime = new Date(`${travelDate} ${booking.departure || '00:00'}`);
        const hoursAfterDeparture = (now - departureDateTime) / (1000 * 60 * 60);
        
        return hoursAfterDeparture < 6;
      });
      
      console.log("Active bookings after filtering:", activeBookings);
      
      setUserBookings(activeBookings);
      setBookingVersion(prev => prev + 1);
      
      const activeBooking = activeBookings.find(booking => 
        booking.status === 'confirmed' || booking.status === 'active'
      ) || activeBookings[0];
      
      setActiveOrder(activeBooking || null);
      
    } catch (error) {
      console.error("Error loading user bookings:", error);
      setUserBookings([]);
      setActiveOrder(null);
      setBookingVersion(prev => prev + 1);
    }
  };

  // Enhanced booking management functions
  const refreshBookings = () => {
    console.log("🔄 MANUAL REFRESH BOOKINGS");
    loadUserBookings();
  };

  const clearAllBookings = () => {
    console.log("🗑️ CLEARING ALL BOOKINGS");
    
    const bookingKeys = [
      "kai_bookings",
      "user_bookings", 
      "bookings",
      "orders",
      "kai_history"
    ];
    
    bookingKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    setUserBookings([]);
    setActiveOrder(null);
    setBookingVersion(prev => prev + 1);
    
    console.log("✅ All bookings cleared");
  };

  const removeBooking = (bookingId) => {
    console.log("🗑️ REMOVING BOOKING:", bookingId);
    
    const updatedBookings = userBookings.filter(booking => 
      (booking.id || booking.bookingId) !== bookingId
    );
    
    setUserBookings(updatedBookings);
    setBookingVersion(prev => prev + 1);
    
    localStorage.setItem("kai_bookings", JSON.stringify(updatedBookings));
    
    if (activeOrder && (activeOrder.id || activeOrder.bookingId) === bookingId) {
      const newActiveOrder = updatedBookings[0] || null;
      setActiveOrder(newActiveOrder);
    }
    
    console.log("✅ Booking removed, remaining:", updatedBookings);
  };

  // Watch for localStorage changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      console.log("💾 Storage changed:", event.key);
      if (['kai_bookings', 'user_bookings', 'bookings', 'orders'].includes(event.key)) {
        loadUserBookings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodic sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoggedIn) {
        console.log("🔄 Periodic booking sync");
        loadUserBookings();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Authentication handlers
  const handleAuth = (profile) => {
    setIsLoggedIn(true);
    setUserProfile(profile);
    loadUserBookings();
  };

  const handleLogout = () => {
    localStorage.removeItem("user_profile");
    setIsLoggedIn(false);
    setUserProfile(null);
    setUserBookings([]);
    setActiveOrder(null);
    setBookingVersion(0);
    // FIXED: Don't reset chatbot state on logout
    // setChatbotVisible(true);
    // setChatbotMinimized(false);
  };

  // Booking handlers
  const handleNewBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: Date.now(),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    const updatedBookings = [newBooking, ...userBookings];
    setUserBookings(updatedBookings);
    setActiveOrder(newBooking);
    setBookingVersion(prev => prev + 1);
    
    localStorage.setItem("kai_bookings", JSON.stringify(updatedBookings));
    
    console.log("✅ New booking created:", newBooking);
  };

  const handleBookingUpdate = (bookingId, updates) => {
    const updatedBookings = userBookings.map(booking => 
      (booking.id || booking.bookingId) === bookingId 
        ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
        : booking
    );
    
    setUserBookings(updatedBookings);
    setBookingVersion(prev => prev + 1);
    
    if (activeOrder && (activeOrder.id || activeOrder.bookingId) === bookingId) {
      setActiveOrder({ ...activeOrder, ...updates });
    }
    
    localStorage.setItem("kai_bookings", JSON.stringify(updatedBookings));
    
    console.log("✅ Booking updated:", bookingId, updates);
  };

  // FIXED: Better chatbot handlers
  const handleChatbotClose = () => {
    console.log("🤖 Closing chatbot");
    setChatbotVisible(false);
    setChatbotMinimized(false);
  };

  const handleChatbotMinimize = () => {
    console.log("🤖 Minimizing chatbot");
    setChatbotMinimized(!chatbotMinimized);
  };

  const handleChatbotShow = () => {
    console.log("🤖 Showing chatbot");
    setChatbotVisible(true);
    setChatbotMinimized(false);
  };

  // Context value
  const contextValue = {
    userProfile,
    userBookings,
    activeOrder,
    isLoggedIn,
    bookingVersion,
    
    sidebarOpen,
    setSidebarOpen,
    
    handleAuth,
    handleLogout,
    handleNewBooking,
    handleBookingUpdate,
    refreshBookings,
    clearAllBookings,
    removeBooking,
    loadUserBookings,
    
    chatbotVisible,
    chatbotMinimized,
    handleChatbotClose,
    handleChatbotMinimize,
    handleChatbotShow
  };

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onAuth={handleAuth} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <Register onAuth={handleAuth} />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              isLoggedIn ? (
                <div className="flex h-screen bg-gray-50 relative">
                  <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                  
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar 
                      setSidebarOpen={setSidebarOpen} 
                      userProfile={userProfile}
                      onLogout={handleLogout}
                    />
                    
                    <main className="flex-1 overflow-y-auto p-4">
                      <Routes>
                        <Route 
                          path="dashboard" 
                          element={
                            <Dashboard 
                              userBookings={userBookings}
                              activeOrder={activeOrder}
                              onNewBooking={handleNewBooking}
                              onBookingUpdate={handleBookingUpdate}
                              onRefreshBookings={refreshBookings}
                              onClearAllBookings={clearAllBookings}
                              onRemoveBooking={removeBooking}
                            />
                          } 
                        />
                        <Route 
                          path="booking" 
                          element={
                            <Booking 
                              onNewBooking={handleNewBooking}
                              userProfile={userProfile}
                            />
                          } 
                        />
                        <Route 
                          path="history" 
                          element={
                            <History 
                              userBookings={userBookings}
                              onBookingUpdate={handleBookingUpdate}
                              onRemoveBooking={removeBooking}
                              onRefreshBookings={refreshBookings}
                            />
                          } 
                        />
                        <Route 
                          path="profile" 
                          element={
                            <Profile 
                              userProfile={userProfile}
                              setUserProfile={setUserProfile}
                            />
                          } 
                        />
                        <Route 
                          path="tracking" 
                          element={
                            <Tracking 
                              userBookings={userBookings}
                              activeOrder={activeOrder}
                              bookingVersion={bookingVersion}
                              onRefreshBookings={refreshBookings}
                              onClearAllBookings={clearAllBookings}
                              onRemoveBooking={removeBooking}
                            />
                          } 
                        />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>

                  {/* FIXED: Better chatbot rendering with error boundary */}
                  {chatbotVisible && (
                    <div className="fixed bottom-0 right-0 z-50">
                      <KAIChatbot 
                        userBookings={userBookings}
                        userProfile={userProfile}
                        activeOrder={activeOrder}
                        isMinimized={chatbotMinimized}
                        onMinimize={handleChatbotMinimize}
                        onClose={handleChatbotClose}
                      />
                    </div>
                  )}

                  {/* FIXED: Better chatbot toggle button */}
                  {!chatbotVisible && (
                    <button
                      onClick={handleChatbotShow}
                      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110"
                      title="Buka KAI Assistant"
                    >
                      <MessageCircle size={24} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        ?
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;