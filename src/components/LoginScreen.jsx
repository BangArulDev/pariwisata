import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { User, Mail, Lock, Store, ArrowRight, Briefcase } from "lucide-react";

export default function LoginScreen({ onLoginSuccess, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [userType, setUserType] = useState("user"); // "user" or "umkm"

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState(""); // For UMKM

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onLoginSuccess) onLoginSuccess(data.session);
      } else {
        // REGISTER
        const metaData = {
          full_name: name,
          phone: phone,
          role: userType, // 'user' or 'umkm'
        };

        if (userType === "umkm") {
          metaData.business_name = businessName;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metaData,
          },
        });

        if (error) throw error;
        setMessage(
          "Registrasi berhasil! Silakan cek email Anda untuk verifikasi (jika diaktifkan) atau langsung login."
        );

        // Auto-login only if session is returned immediately
        if (data.session) {
          if (onLoginSuccess) onLoginSuccess(data.session);
        } else {
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 md:pb-8 w-full max-w-md mx-auto px-6 py-10 animate-slideUp">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Type Switcher */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => {
              setUserType("user");
              setError(null);
            }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              userType === "user"
                ? "bg-green-50 text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <User size={18} />
            Pengguna
          </button>
          <button
            onClick={() => {
              setUserType("umkm");
              setError(null);
            }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              userType === "umkm"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Store size={18} />
            Mitra UMKM
          </button>
        </div>

        <div className="p-8 text-center bg-gray-50/50 border-b border-gray-100">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border-4 border-white shadow-sm ${
              userType === "user"
                ? "bg-green-100 text-green-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {userType === "user" ? <User size={32} /> : <Briefcase size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin
              ? `Masuk sebagai ${userType === "user" ? "Pengguna" : "Mitra"}`
              : `Daftar sebagai ${
                  userType === "user" ? "Pengguna" : "Mitra UMKM"
                }`}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin
              ? "Masuk untuk mengakses akun Anda"
              : userType === "user"
              ? "Jelajahi wisata Grobogan dengan lebih mudah"
              : "Pasarkan produk lokal Anda ke wisatawan"}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-start">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-start">
              <span className="mr-2">✅</span> {message}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                      placeholder={
                        userType === "user" ? "Nama Anda" : "Nama Pemilik"
                      }
                    />
                  </div>
                </div>

                {userType === "umkm" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                      Nama Usaha (Brand)
                    </label>
                    <div className="relative">
                      <Store
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Contoh: Keripik Tempe Mbah Joyo"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                      placeholder="081234567890"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none transition-all ${
                    userType === "user"
                      ? "focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none transition-all ${
                    userType === "user"
                      ? "focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center mt-6 text-white ${
                userType === "user"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {isLogin ? "Masuk Sekarang" : "Daftar Akun"}
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setMessage(null);
                }}
                className={`font-bold hover:underline ${
                  userType === "user" ? "text-green-600" : "text-blue-600"
                }`}
              >
                {isLogin ? "Daftar disini" : "Login disini"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
