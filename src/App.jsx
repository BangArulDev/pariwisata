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
import CartScreen from "./components/CartScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import HistoryScreen from "./components/HistoryScreen";
import EditProfileScreen from "./components/EditProfileScreen";
import MyReviewsScreen from "./components/MyReviewsScreen";
import TransactionDetailScreen from "./components/TransactionDetailScreen";
// Removed mock destinations import

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
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  // Initialize transactions state
  const [transactions, setTransactions] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const location = useLocation();

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setDestinations(data || []);
    } catch (e) {
      console.error("Error loading destinations:", e);
    }
  };

  useEffect(() => {
    // Only fetch transactions if user is logged in
    if (session) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          transaction_items (
            *,
            product:products (name, image_url)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map Supabase columns to App state structure
      const mappedTransactions = data.map((t) => ({
        id: t.id,
        date: t.created_at,
        status:
          t.status === "pending"
            ? "Menunggu"
            : t.status === "paid"
            ? "Dibayar"
            : "Selesai",
        total: t.total_amount,
        items: t.transaction_items.map((item) => ({
          name: item.product?.name || "Produk",
          quantity: item.quantity,
          price: item.price_at_purchase,
          image: item.product?.image_url,
        })),
        shipping_address: t.shipping_address,
        phone: t.shipping_phone,
      }));

      setTransactions(mappedTransactions);
    } catch (e) {
      console.error("Error loading transactions:", e);
    }
  };

  useEffect(() => {
    // Determine auth mode from URL or other logic if needed
    // This existing useEffect for session is fine, but we removed localStorage logic
  }, []);

  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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
    if (tab !== "profile") {
      setAuthMode("login");
    }
  };

  const handleAuthNavigation = (mode) => {
    setAuthMode(mode);
    setActiveTab("profile");
  };

  const handleCheckoutSuccess = async (orderData) => {
    if (!session) {
      alert("Silakan login untuk memesan.");
      setActiveTab("profile");
      return;
    }

    console.log("Processing Checkout with Data:", orderData); // DEBUG LOG

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      const { data, error } = await supabase.rpc("process_checkout", {
        p_user_id: session.user.id,
        p_total_amount: totalAmount,
        p_shipping_address: orderData.address,
        p_shipping_phone: orderData.phone,
        p_items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      });

      if (error) throw error;

      // Optimistic update
      // RPC returns { transaction_id: ..., status: ... }
      // We reconstruct the full object for local state
      const newOrder = {
        id: data.transaction_id,
        date: new Date().toISOString(),
        status: "Menunggu",
        total: totalAmount,
        items: [...cart],
        ...orderData,
      };

      setTransactions((prev) => [newOrder, ...prev]);
      setCart([]);
      setActiveTab("home");
      // Optional: Show success toast
    } catch (e) {
      console.error("Checkout error:", e);
      alert("Gagal memproses pesanan: " + e.message);
    }
  };

  // Keep handleScanSuccess
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
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, cartId: Date.now() }];
      }
    });

    try {
      // alert(`${product.name} berhasil ditambahkan ke keranjang!`);
      // Optional: Show toast notification instead of alert
    } catch (e) {
      console.warn(e);
    }
  };

  const updateQuantity = (cartId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const clearCart = (orderData) => {
    // This function is now a wrapper for handleCheckoutSuccess
    handleCheckoutSuccess(orderData);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const renderContent = () => {
    if (selectedTransaction) {
      return (
        <TransactionDetailScreen
          transaction={selectedTransaction}
          onBack={() => setSelectedTransaction(null)}
        />
      );
    }

    if (infoSpot) {
      return <InfoScreen spot={infoSpot} onBack={() => setInfoSpot(null)} />;
    }

    if (isScanning || activeTab === "ar") {
      return (
        <ARScannerScreen
          onBack={() => handleTabChange("home")}
          onScanSuccess={handleScanSuccess}
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
        return (
          <HomeScreen
            onSelectSpot={setSelectedSpot}
            destinations={destinations}
          />
        );
      case "market":
        return <MarketplaceScreen addToCart={addToCart} />;
      case "profile":
        return (
          <ProfileScreen
            session={session}
            onLogout={handleLogout}
            initialAuthMode={authMode}
            onViewHistory={() => setActiveTab("history")}
            onEditProfile={() => setActiveTab("edit-profile")}
            onViewReviews={() => setActiveTab("my-reviews")}
          />
        );
      case "edit-profile":
        return (
          <EditProfileScreen
            session={session}
            onBack={() => setActiveTab("profile")}
          />
        );
      case "my-reviews":
        return (
          <MyReviewsScreen
            session={session}
            onBack={() => setActiveTab("profile")}
          />
        );
      case "cart":
        return (
          <CartScreen
            cart={cart}
            onBack={() => handleTabChange("market")}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={() => setActiveTab("checkout")}
          />
        );
      case "checkout":
        return (
          <CheckoutScreen
            cart={cart}
            onBack={() => setActiveTab("cart")}
            onConfrim={clearCart}
          />
        );
      case "history":
        return (
          <HistoryScreen
            history={transactions}
            onBack={() => setActiveTab("profile")}
            onSelectTransaction={setSelectedTransaction}
          />
        );
      default:
        return <HomeScreen onSelectSpot={setSelectedSpot} />;
    }
  };

  // Hide main app UI if on admin routes
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <DesktopHeader
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        goToProfile={() => handleTabChange("profile")}
        goToCart={() => handleTabChange("cart")}
        session={session}
        goToLogin={() => handleAuthNavigation("login")}
        goToRegister={() => handleAuthNavigation("register")}
      />
      <main className="flex-1 w-full">{renderContent()}</main>
      {!isScanning &&
        !selectedSpot &&
        activeTab !== "cart" &&
        activeTab !== "checkout" && (
          <MobileNav activeTab={activeTab} setActiveTab={handleTabChange} />
        )}
      {/* Floating Cart Button for Mobile */}
      {!isScanning &&
        !selectedSpot &&
        activeTab === "market" &&
        cart.length > 0 && (
          <div className="md:hidden fixed bottom-20 right-4 z-50">
            <button
              onClick={() => handleTabChange("cart")}
              className="bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center relative animate-bounce"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          </div>
        )}
    </div>
  );
}
