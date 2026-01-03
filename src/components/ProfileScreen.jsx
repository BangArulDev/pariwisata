import React from "react";
import {
  ShoppingBag,
  Star,
  Navigation,
  Info,
  User,
  Menu,
  LogOut,
  Loader,
  Wallet,
} from "lucide-react";
import LoginScreen from "./LoginScreen";
import { supabase } from "../supabaseClient";

export default function ProfileScreen({
  session,
  onLogout,
  initialAuthMode = "login",
  onViewHistory,
  onEditProfile,
  onViewReviews,
}) {
  const [profile, setProfile] = React.useState(null);
  const user = session?.user;

  React.useEffect(() => {
    if (!user) return;

    async function getProfile() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data);
        }
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }
    getProfile();
  }, [user?.id]);

  if (!session) {
    return <LoginScreen initialMode={initialAuthMode} />;
  }

  const menuItems = [
    {
      icon: ShoppingBag,
      label: "Riwayat Transaksi",
      action: onViewHistory,
    },
    { icon: Star, label: "Ulasan Saya", action: onViewReviews },
    { icon: Navigation, label: "Rute Tersimpan" },
    { icon: Info, label: "Bantuan & Dukungan" },
    {
      icon: User,
      label: "Edit Profil",
      action: onEditProfile,
    },
    { icon: Menu, label: "Pengaturan" },
  ];

  return (
    <div className="pb-20 md:pb-8 max-w-4xl mx-auto w-full md:px-6 md:py-10 animate-slideUp">
      <div className="p-4 md:p-0">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 md:flex md:items-center md:gap-8 mb-6 relative">
          <div className="flex items-center space-x-4 md:block md:text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-inner border-4 border-white mx-auto text-green-700 overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : profile?.full_name ? (
                profile.full_name[0].toUpperCase()
              ) : user.email ? (
                user.email[0].toUpperCase()
              ) : (
                "U"
              )}
            </div>
            <div className="md:mt-4">
              <h2 className="font-bold text-lg md:text-2xl text-gray-900 line-clamp-1">
                {profile?.full_name ||
                  user.user_metadata?.full_name ||
                  user.email?.split("@")[0] ||
                  "Pengguna"}
              </h2>
              <p className="text-xs md:text-sm text-gray-500">{user.email}</p>
              {profile?.role === "admin" && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">
                  ADMIN
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:flex-1 md:border-l md:border-gray-100 md:pl-8">
            <div className="bg-linear-to-r from-green-600 to-green-500 rounded-xl p-4 text-white relative overflow-hidden shadow-lg mb-4">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-xs opacity-80 mb-1">Level Keanggotaan</p>
                  <h3 className="font-bold text-lg">Penjelajah Budaya</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-[10px]">Poin Terkumpul</p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full"></div>
            </div>

            <button
              onClick={onLogout}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Keluar Aplikasi
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
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
