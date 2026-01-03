import React, { useState } from "react";
import {
  Search,
  Camera,
  MapPin,
  Star,
  Map as MapIcon,
  List,
} from "lucide-react";
import { destinations } from "../data/mockData";
import MapScreen from "./MapScreen";

export default function HomeScreen({ onSelectSpot }) {
  const [viewMode, setViewMode] = useState("list");

  return (
    <div className="pb-20 md:pb-8 max-w-7xl mx-auto w-full md:px-6">
      <div className="hidden md:block relative h-80 rounded-2xl overflow-hidden mb-8 shadow-lg mt-6">
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          className="w-full h-full object-cover"
          alt="Grobogan Landscape"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 to-transparent flex flex-col justify-center px-10">
          <h2 className="text-4xl font-bold text-white mb-2">
            Jelajahi Keajaiban Grobogan
          </h2>
          <p className="text-white/90 text-lg max-w-md">
            Temukan destinasi wisata alam dan sejarah budaya dengan teknologi
            Augmented Reality terkini.
          </p>
          <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg font-bold w-max hover:bg-green-700 transition shadow-lg">
            Mulai Petualangan
          </button>
        </div>
      </div>

      <div className="md:hidden p-4 bg-green-700 rounded-b-3xl shadow-md mb-4">
        <div className="flex justify-between items-center mb-4 text-white">
          <div>
            <p className="text-xs opacity-80">Selamat Datang,</p>
            <h2 className="font-bold text-lg">Explorer Grobogan</h2>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
            😎
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari destinasi..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none shadow-inner text-gray-800 bg-white"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      <div className="px-4 md:px-0 mb-6">
        <div className="flex md:justify-start gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {["Semua", "Wisata Alam", "Budaya", "Kuliner", "Sejarah"].map(
            (filter, idx) => (
              <span
                key={idx}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium cursor-pointer transition ${
                  idx === 0
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter}
              </span>
            )
          )}
        </div>
      </div>

      <div className="px-4 md:px-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {viewMode === "list" ? "Destinasi Populer" : "Peta Wisata"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
              className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
              {viewMode === "list" ? <MapIcon size={14} /> : <List size={14} />}
              {viewMode === "list" ? "Lihat Peta" : "Lihat Daftar"}
            </button>
            {viewMode === "list" && (
              <span className="text-sm text-green-600 font-semibold cursor-pointer hover:underline hidden md:inline">
                Lihat Semua
              </span>
            )}
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {destinations.map((spot) => (
              <div
                key={spot.id}
                onClick={() => onSelectSpot(spot)}
                className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 flex md:flex-col h-28 md:h-auto"
              >
                <div className="w-28 md:w-full md:h-48 relative shrink-0">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover"
                  />
                  {spot.hasAR && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg text-white">
                      <Camera size={16} />
                    </div>
                  )}
                </div>

                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800 text-sm md:text-lg line-clamp-1 group-hover:text-green-700 transition-colors">
                        {spot.name}
                      </h3>
                      <span className="hidden md:flex bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md font-bold items-center">
                        <Star size={12} className="mr-1 fill-current" />{" "}
                        {spot.rating}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">
                      {spot.type}
                    </p>
                    <p className="hidden md:block text-sm text-gray-600 line-clamp-2 mb-3">
                      {spot.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-gray-400 text-xs md:text-sm mt-1">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1 text-red-500" />
                      <span>{spot.distance || "2.4 km"}</span>
                    </div>
                    <span className="md:hidden flex items-center text-orange-500 font-bold">
                      <Star size={12} className="mr-0.5 fill-current" />{" "}
                      {spot.rating}
                    </span>
                    <span className="hidden md:block text-green-600 font-semibold">
                      Detail →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MapScreen onSelectSpot={onSelectSpot} />
        )}
      </div>

      <div className="md:hidden mt-6 mx-4 bg-linear-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white shadow-lg mb-6">
        <h3 className="font-bold text-lg">Lapar saat wisata?</h3>
        <p className="text-xs text-white/90 mb-3">
          Temukan UMKM kuliner terdekat.
        </p>
        <button className="bg-white text-orange-500 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
          Cek Sekarang
        </button>
      </div>
    </div>
  );
}
