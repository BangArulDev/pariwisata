import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import DesktopHeader from "./components/DesktopHeader";
import MobileNav from "./components/MobileNav";
import HomeScreen from "./components/HomeScreen";
import SpotDetail from "./components/SpotDetail";
import ARScannerScreen from "./components/ARScannerScreen";
import MarketplaceScreen from "./components/MarketplaceScreen";
import ProfileScreen from "./components/ProfileScreen";
import InfoScreen from "./components/InfoScreen";
import { destinations } from "./data/mockData";

// Admin Components
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

// Main App Component wrapped in Router
export default function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [cart, setCart] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [arFound, setArFound] = useState(false);
  const [infoSpot, setInfoSpot] = useState(null);
  const location = useLocation();

  useEffect(() => {
    console.log("Supabase Client:", supabase);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes scan { 0% { left:0 } 50% { left:100% } 100% { left:0 } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      .animate-scan { animation: scan 2s infinite linear; }
      .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedSpot(null);
    setInfoSpot(null);
    if (tab === "ar") {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (scannedData) => {
    console.log("Diterima di App.jsx:", scannedData);
    // Contoh data: "grobogan-app://spot/4"
    const prefix = "grobogan-app://spot/";
    if (scannedData && scannedData.startsWith(prefix)) {
      const spotId = parseInt(scannedData.substring(prefix.length), 10);
      const foundSpot = destinations.find((d) => d.id === spotId);

      if (foundSpot) {
        // Hentikan pemindaian dan reset state AR
        setIsScanning(false);
        setArFound(false);

        // Langsung tampilkan detail spot yang dipindai
        setSelectedSpot(foundSpot);
        setActiveTab("home"); // Pindah ke tab home agar kontennya dirender
      } else {
        alert(`Spot dengan ID ${spotId} tidak ditemukan.`);
      }
    } else {
      alert("QR Code tidak valid untuk aplikasi ini.");
    }
  };

  const addToCart = (product) => {
    setCart((c) => [...c, product]);
    try {
      alert(`${product.name} berhasil ditambahkan ke keranjang!`);
    } catch (e) {
      console.warn(e);
    }
  };

  const renderContent = () => {
    if (infoSpot) {
      return <InfoScreen spot={infoSpot} onBack={() => setInfoSpot(null)} />;
    }

    if (isScanning || activeTab === "ar") {
      return (
        <ARScannerScreen
          onBack={() => handleTabChange("home")}
          onScanSuccess={handleScanSuccess}
          // Props di bawah ini mungkin tidak lagi diperlukan sepenuhnya jika logika dihandle di App.jsx
          isScanning={isScanning}
          setIsScanning={setIsScanning}
          arFound={arFound}
          setArFound={setArFound}
        />
      );
    }

    if (selectedSpot) {
      return (
        <SpotDetail
          spot={selectedSpot}
          onBack={() => setSelectedSpot(null)}
          onAr={() => {
            setSelectedSpot(null);
            handleTabChange("ar");
          }}
          addToCart={addToCart}
          onShowQr={() => setInfoSpot(selectedSpot)}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return <HomeScreen onSelectSpot={setSelectedSpot} />;
      case "market":
        return <MarketplaceScreen addToCart={addToCart} />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onSelectSpot={setSelectedSpot} />;
    }
  };

  // Hide main app UI if on admin routes (handled by Router above, but good for safety)
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <DesktopHeader
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={cart.length}
        goToProfile={() => handleTabChange("profile")}
      />
      <main className="flex-1 w-full">{renderContent()}</main>
      {!isScanning && !selectedSpot && (
        <MobileNav activeTab={activeTab} setActiveTab={handleTabChange} />
      )}
    </div>
  );
}
