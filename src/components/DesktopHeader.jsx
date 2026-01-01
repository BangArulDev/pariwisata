import React from "react";
import { ShoppingBag } from "lucide-react";

export default function DesktopHeader({
  activeTab,
  setActiveTab,
  cartCount,
  goToProfile,
}) {
  return (
    <header className="hidden md:flex bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="cursor-pointer" onClick={() => setActiveTab("home")}>
            <h1 className="text-green-700 font-bold text-2xl tracking-wide flex items-center">
              GROBOGAN<span className="text-yellow-500">AR</span>KULTURA
            </h1>
          </div>
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("home")}
              className={`text-sm font-bold transition-colors ${
                activeTab === "home"
                  ? "text-green-700"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setActiveTab("market")}
              className={`text-sm font-bold transition-colors ${
                activeTab === "market"
                  ? "text-green-700"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              Pasar UMKM
            </button>
            <button
              onClick={() => setActiveTab("ar")}
              className={`text-sm font-bold transition-colors ${
                activeTab === "ar"
                  ? "text-green-700"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              Scan AR
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div
            className="relative cursor-pointer group"
            onClick={() => setActiveTab("market")}
          >
            <ShoppingBag
              className="text-gray-600 group-hover:text-green-700 transition-colors"
              size={24}
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={goToProfile}
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
              WS
            </div>
            <span className="text-sm font-medium text-gray-700">Wisatawan</span>
          </div>
        </div>
      </div>
    </header>
  );
}
