import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Clock, Train, MapPin, CreditCard, Phone, Settings, ChevronRight, Zap, Star, Calendar, HelpCircle, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../App';

const KAIChatbot = ({ 
  isMinimized: defaultMinimized = false,
  onMinimize,
  onClose
}) => {
  const {
    userBookings,
    userProfile,
    activeOrder,
    handleBookingHelp,
    handleTrainTrack
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Halo ${userProfile?.name || 'User'}! 👋\n\nSaya KAI Assistant, siap membantu Anda dengan:\n🚄 Informasi kereta api\n🎫 Bantuan tiket & booking\n📍 Tracking kereta real-time\n📞 Layanan customer service\n\nAda yang bisa saya bantu hari ini?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Minimal suggestion data - even smaller
  const quickSuggestions = [
    { icon: "🎫", text: "My Tickets", query: "tampilkan tiket saya" },
    { icon: "📍", text: "Track", query: "tracking kereta saya" },
    { icon: "📅", text: "Schedule", query: "jadwal kereta hari ini" },
    { icon: "📞", text: "Call CS", query: "nomor customer service KAI" },
    { icon: "🚄", text: "JKT-BDG", query: "jadwal kereta Jakarta ke Bandung" },
    { icon: "🚄", text: "JKT-SBY", query: "jadwal kereta Jakarta ke Surabaya" },
    { icon: "💳", text: "Book", query: "bagaimana cara memesan tiket?" },
    { icon: "❓", text: "Help", query: "bantuan umum kereta api" }
  ];

  // Get micro user suggestions
  const getMicroUserSuggestions = () => {
    const suggestions = [];
    
    if (userBookings.length > 0) {
      suggestions.push({ icon: "📋", text: `${userBookings.length} Tickets`, query: "lihat semua tiket saya" });
    }
    
    if (activeOrder) {
      suggestions.push({ icon: "🗺️", text: "Live Track", query: `track kereta ${activeOrder.trainName}` });
    }
    
    return suggestions;
  };

  // Enhanced KAI-specific Q&A data
  const kaiQAData = [
    // Greetings & General
    { 
      keywords: ['halo', 'hai', 'hello', 'hi', 'selamat', 'pagi', 'siang', 'malam'],
      responses: [
        `Halo ${userProfile?.name || 'User'}! Ada yang bisa saya bantu dengan kereta api hari ini?`,
        `Hai ${userProfile?.name || 'User'}! Mau tanya jadwal, tiket, atau layanan KAI?`
      ]
    },
    {
      keywords: ['tiket saya', 'booking saya', 'pesanan saya', 'tampilkan tiket'],
      responses: [
        userBookings.length > 0 
          ? `📋 **${userBookings.length} Booking Anda:**\n\n${userBookings.slice(0,3).map((b, i) => `${i+1}. ${b.trainName || 'Kereta'} - ${b.route || b.origin + '→' + b.destination}`).join('\n')}\n\n${userBookings.length > 3 ? `+${userBookings.length - 3} booking lainnya` : ''}\n\nMau bantuan booking tertentu?`
          : 'Belum ada booking aktif. Mau saya bantu pesan tiket? 🎫'
      ]
    },
    {
      keywords: ['jadwal', 'jam', 'keberangkatan', 'schedule'],
      responses: [
        '📅 **Cek Jadwal Kereta:**\n\n📱 KAI Access App\n🌐 kai.id\n☎️ Call 121\n\nMau jadwal rute mana? Jakarta-Bandung? Jakarta-Surabaya?'
      ]
    },
    {
      keywords: ['tracking', 'posisi', 'lokasi', 'track'],
      responses: [
        activeOrder 
          ? `🗺️ **Tracking ${activeOrder.trainName}**\n📍 ${activeOrder.route}\n\nGunakan Live Map di dashboard atau KAI Access untuk tracking real-time!`
          : '📍 **Live Tracking Kereta:**\n\n🗺️ Dashboard Live Map\n📱 KAI Access App\nMasukkan nomor kereta untuk tracking!'
      ]
    },
    {
      keywords: ['cs', 'customer service', 'hubungi', 'kontak'],
      responses: [
        '📞 **Customer Service KAI:**\n\n**121** (24 jam)\n📧 halo@kai.id\n💬 Live Chat di KAI Access\n🏢 CS di setiap stasiun'
      ]
    }
  ];

  // Enhanced response finder
  const findBestResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    kaiQAData.forEach(qa => {
      const score = qa.keywords.reduce((acc, keyword) => {
        if (message.includes(keyword)) {
          return acc + 1;
        }
        return acc;
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    });

    if (bestMatch && bestScore > 0) {
      const responses = bestMatch.responses;
      const response = Array.isArray(responses) ? responses[Math.floor(Math.random() * responses.length)] : responses;
      return typeof response === 'function' ? response() : response;
    }

    // Fallback responses
    const fallbackResponses = [
      'Coba pilih dari quick suggestions di bawah atau tanyakan tentang:\n🎫 Tiket\n🚄 Jadwal\n📍 Tracking\n📞 Customer Service',
      'Untuk info lebih detail:\n📞 Call Center: **121**\n📱 KAI Access App\n🌐 kai.id'
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  // Send message function
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Handle specific actions
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('track') && activeOrder) {
      setTimeout(() => {
        const botResponse = `🗺️ **Tracking ${activeOrder.trainName}**\n\n📍 ${activeOrder.route}\n🕐 ${activeOrder.departure}\n\n✨ Buka halaman Tracking untuk live map!`;
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: botResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1200);
      return;
    }

    // Normal response processing
    setTimeout(() => {
      const botResponse = findBestResponse(message);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  // Send suggestion
  const sendSuggestion = (suggestion) => {
    sendMessage(suggestion.query);
  };

  // Handle input submit
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Handle open/close
  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen && onClose) onClose();
  };

  // Handle minimize/maximize
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize) onMinimize();
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleToggleOpen}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        title={isOpen ? "Close KAI Assistant" : "Open KAI Assistant"}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-white" />
        )}
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
            {userBookings.length > 0 ? userBookings.length : '!'}
          </div>
        )}
      </button>

      {/* Chat Window - LARGER SIZE */}
      {isOpen && (
        <div className={`fixed bottom-20 right-6 z-40 transition-all duration-300 ${
          isMinimized ? 'w-96 h-16' : 'w-96 h-[500px]'
        }`}>
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">KAI Assistant</h3>
                  <div className="text-xs text-blue-100 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{userProfile?.name || 'User'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMinimize}
                  className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-md transition-all duration-200"
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages - More space */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.type === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      }`}>
                        {message.type === 'user' ? (
                          userProfile?.name?.charAt(0).toUpperCase() || <User size={14} />
                        ) : (
                          <Bot size={14} />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`max-w-sm px-3 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-tr-md'
                          : 'bg-white text-gray-800 rounded-tl-md border border-gray-200'
                      }`}>
                        <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                        <div className={`text-xs mt-1 opacity-60 ${
                          message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center">
                        <Bot size={14} />
                      </div>
                      <div className="bg-white text-gray-800 px-3 py-2 rounded-lg rounded-tl-md border border-gray-200">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* MICRO Suggestions - Even Smaller */}
                {showSuggestions && (
                  <div className="border-t bg-white">
                    {/* User-specific micro suggestions */}
                    {getMicroUserSuggestions().length > 0 && (
                      <div className="px-3 py-1.5 border-b border-gray-100">
                        <div className="flex gap-1">
                          {getMicroUserSuggestions().map((suggestion, index) => (
                            <button
                              key={`user-${index}`}
                              onClick={() => sendSuggestion(suggestion)}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-all duration-200"
                            >
                              <span className="text-xs">{suggestion.icon}</span>
                              <span className="font-medium text-xs">{suggestion.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Micro suggestion pills */}
                    <div className="px-3 py-1.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-500">Quick:</span>
                        <button
                          onClick={() => setSuggestionsCollapsed(!suggestionsCollapsed)}
                          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          {suggestionsCollapsed ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                      </div>
                      
                      {!suggestionsCollapsed && (
                        <div className="flex flex-wrap gap-1">
                          {quickSuggestions.slice(0, 8).map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => sendSuggestion(suggestion)}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                            >
                              <span style={{ fontSize: '10px' }}>{suggestion.icon}</span>
                              <span className="font-medium" style={{ fontSize: '10px' }}>{suggestion.text}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-center mt-1.5">
                        <button
                          onClick={() => setShowSuggestions(false)}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                          style={{ fontSize: '10px' }}
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show suggestions button (when hidden) */}
                {!showSuggestions && (
                  <div className="px-3 py-1.5 border-t bg-gray-50">
                    <button
                      onClick={() => setShowSuggestions(true)}
                      className="w-full text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center gap-1"
                      style={{ fontSize: '10px' }}
                    >
                      <Zap size={10} />
                      Quick Help
                    </button>
                  </div>
                )}

                {/* User Context Info - Minimal */}
                {(userBookings.length > 0 || activeOrder) && messages.length <= 2 && (
                  <div className="px-3 py-1.5 border-t bg-blue-50">
                    <div className="text-xs text-blue-700 flex items-center justify-between" style={{ fontSize: '10px' }}>
                      <span>🎫 {userBookings.length} bookings</span>
                      {activeOrder && <span>🚄 Active</span>}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your question..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Press Enter to send • KAI Assistant
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default KAIChatbot;