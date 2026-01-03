import React from "react";
import {
  ArrowRight,
  Camera,
  ShoppingBag,
  MapPin,
  Navigation,
  QrCode,
  Star,
} from "lucide-react";
import { products } from "../data/mockData";
import { ReviewList, ReviewForm } from "./ReviewComponents";

export default function SpotDetail({
  spot,
  onBack,
  onAr,
  addToCart,
  onShowQr,
}) {
  return (
    <div className="bg-white min-h-screen pb-20 md:pb-0 animate-slideUp">
      <div className="md:max-w-6xl md:mx-auto md:py-8 md:px-6 md:grid md:grid-cols-2 md:gap-10">
        <div className="relative h-72 md:h-[500px] w-full md:rounded-3xl md:overflow-hidden md:shadow-xl">
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onBack}
            className="absolute top-4 left-4 bg-white/80 p-2 rounded-full backdrop-blur-sm shadow-sm hover:bg-white z-10 transition md:hidden"
          >
            <ArrowRight className="rotate-180 text-gray-800" size={24} />
          </button>
          <button
            onClick={onBack}
            className="hidden md:flex absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm items-center shadow-md transition"
          >
            ← Kembali
          </button>
        </div>

        <div className="px-5 -mt-8 md:mt-0 relative z-10 md:flex md:flex-col md:justify-center">
          <div className="bg-white rounded-t-3xl md:rounded-none p-6 md:p-0 shadow-sm md:shadow-none border-b md:border-none border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">
                    {spot.type}
                  </span>
                  <div className="flex items-center text-orange-500 text-xs font-bold">
                    <span className="mr-1">★</span> {spot.rating} (120 Ulasan)
                  </div>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
                  {spot.name}
                </h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin size={16} className="mr-1 text-red-500" /> Grobogan,
                  Jawa Tengah
                </p>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-xl text-center shrink-0 border border-green-100">
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  Tiket
                </p>
                <p className="font-bold text-green-700 text-lg">Rp 10k</p>
              </div>
            </div>

            <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">
              {spot.description} Rasakan pengalaman tak terlupakan dengan
              suasana yang autentik. Fasilitas lengkap tersedia termasuk area
              parkir, mushola, dan warung makan lokal.
            </p>

            {spot.hasAR && (
              <div
                className="bg-indigo-600 rounded-xl p-5 md:p-6 mb-8 flex items-center justify-between shadow-lg text-white relative overflow-hidden group cursor-pointer"
                onClick={onAr}
              >
                <div className="relative z-10">
                  <h4 className="font-bold text-lg mb-1">Mode AR Tersedia!</h4>
                  <p className="text-xs md:text-sm text-indigo-100 max-w-[200px]">
                    Pindai lokasi ini untuk melihat rekonstruksi sejarah kuno
                    secara nyata.
                  </p>
                </div>
                <div className="bg-white text-indigo-600 p-3 md:p-4 rounded-full shadow-md group-hover:scale-110 transition-transform animate-pulse">
                  <Camera size={24} />
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                <ShoppingBag size={20} className="mr-2 text-green-600" /> UMKM
                Terdekat (Hyperlocal)
              </h3>
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="min-w-40 md:min-w-[180px] bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="h-28 rounded-lg overflow-hidden mb-3 bg-gray-100">
                      <img
                        src={prod.image}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-sm font-bold truncate text-gray-800 mb-1">
                      {prod.name}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mb-2 flex items-center">
                      <MapPin size={10} className="mr-1" />
                      {prod.location}
                    </p>
                    <div className="mt-auto flex justify-between items-center">
                      <p className="text-sm text-green-700 font-bold">
                        Rp {prod.price / 1000}rb
                      </p>
                      <button
                        onClick={() => addToCart(prod)}
                        className="bg-green-100 text-green-700 p-1.5 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onShowQr}
                className="w-1/3 bg-yellow-500 text-white font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center text-sm hover:bg-yellow-600 transition"
              >
                <QrCode size={18} className="mr-2" />
                Kode QR
              </button>
              <button className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center text-sm hover:bg-gray-800 transition">
                <Navigation size={18} className="mr-2" /> Petunjuk Arah
              </button>
              <button className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center text-sm hover:bg-green-700 transition md:hidden">
                Beli Tiket
              </button>
            </div>

            {/* Ulasan Section */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center">
                <Star
                  size={20}
                  className="mr-2 text-yellow-500 fill-yellow-500"
                />
                Ulasan Pengunjung
              </h3>

              <div className="mb-8">
                <ReviewForm
                  destinationId={spot.id}
                  onSaved={() => {
                    // Trigger refresh if needed, usually simple refresh prop pattern
                    // For now simplicity, we might force update or pass callback
                    const event = new CustomEvent("review-updated");
                    window.dispatchEvent(event);
                  }}
                />
              </div>

              <ReviewList
                destinationId={spot.id}
                refreshTrigger={window.location.href} // Minimal trigger hack or use custom state
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
