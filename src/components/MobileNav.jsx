import React from "react";
import { Map, Camera, ShoppingBag, User, LogIn } from "lucide-react";

const NavItem = ({ icon: Icon, label, id, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
      activeTab === id ? "text-green-600" : "text-gray-400"
    }`}
  >
    <Icon
      size={24}
      className={activeTab === id ? "stroke-2" : "stroke-[1.5]"}
    />
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

export default function MobileNav({ activeTab, setActiveTab, session }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 h-16 flex justify-around items-center px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavItem
        icon={Map}
        label="Peta"
        id="home"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <NavItem
        icon={Camera}
        label="Scan AR"
        id="ar"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <NavItem
        icon={ShoppingBag}
        label="UMKM"
        id="market"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {session ? (
        <NavItem
          icon={User}
          label="Profil"
          id="profile"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <NavItem
          icon={LogIn}
          label="Masuk"
          id="profile"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}
