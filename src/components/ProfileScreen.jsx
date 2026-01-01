import React from "react";
import { ShoppingBag, Star, Navigation, Info, User, Menu } from "lucide-react";

export default function ProfileScreen() {
  return (
    <div className="pb-20 md:pb-8 max-w-4xl mx-auto w-full md:px-6 md:py-10 animate-slideUp">
      <div className="p-4 md:p-0">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 md:flex md:items-center md:gap-8 mb-6">
          <div className="flex items-center space-x-4 md:block md:text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-inner border-4 border-white mx-auto">
              😎
            </div>
            <div className="md:mt-4">
              <h2 className="font-bold text-lg md:text-2xl text-gray-900">
                Wisatawan Setia
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Bergabung sejak 2025
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:flex-1 md:border-l md:border-gray-100 md:pl-8">
            <div className="bg-linear-to-r from-green-600 to-green-500 rounded-xl p-4 text-white relative overflow-hidden shadow-lg">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-xs opacity-80 mb-1">Level Keanggotaan</p>
                  <h3 className="font-bold text-lg">Penjelajah Budaya</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">240</p>
                  <p className="text-[10px]">Poin Terkumpul</p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full"></div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <p className="text-gray-400 text-xs">Transaksi</p>
                <p className="font-bold text-gray-800">12</p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <p className="text-gray-400 text-xs">Ulasan</p>
                <p className="font-bold text-gray-800">5</p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <p className="text-gray-400 text-xs">Disimpan</p>
                <p className="font-bold text-gray-800">8</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: ShoppingBag, label: "Riwayat Transaksi" },
            { icon: Star, label: "Ulasan Saya" },
            { icon: Navigation, label: "Rute Tersimpan" },
            { icon: Info, label: "Bantuan & Dukungan" },
            { icon: User, label: "Edit Profil" },
            { icon: Menu, label: "Pengaturan" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 hover:border-green-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gray-50 p-2.5 rounded-lg text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                  <item.icon size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                  {item.label}
                </span>
              </div>
              <div className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all">
                →
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center border-t border-gray-200 pt-6">
          <h1 className="text-green-700 font-bold text-lg tracking-wide opacity-50">
            GROBOGAN<span className="text-yellow-500">AR</span>KULTURA
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            Versi 1.2.0 (Web Beta) • PKM-KI 2025
          </p>
        </div>
      </div>
    </div>
  );
}
