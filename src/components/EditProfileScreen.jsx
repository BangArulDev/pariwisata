import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Phone, Save, Loader } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function EditProfileScreen({ session, onBack }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    avatarUrl: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session?.user) {
      const getProfile = async () => {
        try {
          setLoading(true);
          const { user } = session;

          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          if (data) {
            setFormData({
              fullName: data.full_name || "",
              phone: data.phone || "",
              avatarUrl: data.avatar_url || "",
            });
          }
        } catch (error) {
          console.warn("Error fetching profile:", error.message);
        } finally {
          setLoading(false);
        }
      };
      getProfile();
    }
  }, [session]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setAvatarFile(null);
      return;
    }
    const file = e.target.files[0];
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    try {
      setUploading(true);
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      let avatarUrl = formData.avatarUrl;

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const updates = {
        id: session.user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      // Optional: Update Auth Metadata for consistency (though we rely on profiles table now)
      // await supabase.auth.updateUser({
      //   data: { full_name: formData.fullName, phone: formData.phone, avatar_url: avatarUrl }
      // });

      setFormData((prev) => ({ ...prev, avatarUrl }));
      setAvatarFile(null); // Reset file input
      setMessage("Profil berhasil diperbarui!");
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setError("Gagal menyimpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 md:pb-8 max-w-2xl mx-auto w-full px-4 md:px-6 animate-slideUp">
      <div className="flex items-center mb-6 pt-4">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Edit Profil</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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

        <div className="mb-6 flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl text-green-700 overflow-hidden border-4 border-white shadow-sm">
              {previewUrl || formData.avatarUrl ? (
                <img
                  src={previewUrl || formData.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                session?.user?.email?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 shadow-lg group-hover:scale-110 transition-transform">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading || uploading}
              />
              <div className="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Klik ikon kamera untuk ubah foto
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                placeholder="Nama Lengkap Anda"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
              Nomor Telepon
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                placeholder="08123456789"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading || uploading ? (
              <>
                <Loader size={20} className="animate-spin mr-2" />
                {uploading ? "Mengupload..." : "Menyimpan..."}
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Simpan Perubahan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
