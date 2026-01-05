import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Upload,
  User,
  Image as ImageIcon,
  DollarSign,
  Package,
  Info,
  Loader,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("wisata"); // wisata, produk, pesanan
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Generic form data
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const checkUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/admin/login");
      return;
    }

    // Check Role
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      setUserProfile(profile);
      setRole(profile.role);

      // Redirect regular users
      if (profile.role !== "admin" && profile.role !== "umkm") {
        alert("Akses ditolak. Halaman ini hanya untuk Admin dan Mitra UMKM.");
        navigate("/");
      }

      // If UMKM, default to produk tab
      if (profile.role === "umkm" && activeTab === "wisata") {
        setActiveTab("produk");
      }
    }
  }, [navigate, activeTab]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const fetchData = useCallback(async () => {
    if (!role) return;

    setLoading(true);
    try {
      let query;
      if (activeTab === "wisata") {
        query = supabase.from("destinations").select("*").order("id");
      } else if (activeTab === "produk") {
        query = supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        // Filter for UMKM using owner_id if available, fallback to seller_name for legacy
        if (role === "umkm") {
          // Prefer filtering by owner_id if your schema supports it now
          // For now, we mix both strategies or stick to what works.
          // We'll trust the RLS on the backend mainly, but for UI filtering:
          if (userProfile?.id) {
            query = query.eq("owner_id", userProfile.id);
          } else if (userProfile?.business_name) {
            query = query.eq("seller_name", userProfile.business_name);
          }
        }
      } else if (activeTab === "pesanan") {
        // Use new orders table if available, else transactions
        // For this step, we'll try to fetch 'orders' first.
        // If it fails (table doesn't exist yet properly populated), we might fall back?
        // Actually, let's stick to the existing 'transactions' table logic for NOW as requested in the specific 'Product Form' task,
        // but since I am refactoring, I should be careful.
        // User asked for "1. Struktur Form & Label ...", didn't explicitly safeguard the table switch yet in THIS request.
        // I will keep the 'transactions' logic for now to avoid breaking the view while focusing on the FORM.

        query = supabase
          .from("transactions")
          .select(
            `
            *,
            transaction_items (
              *,
              product:products (name, image_url, seller_name)
            )
          `
          )
          .order("created_at", { ascending: false });
      }

      const { data: result, error } = await query;
      if (error) throw error;

      // Client-side filter for orders if UMKM (legacy strategy until full backend switch)
      let finalData = result || [];
      if (role === "umkm" && activeTab === "pesanan") {
        finalData = finalData.filter((order) =>
          order.transaction_items.some(
            (item) => item.product?.seller_name === userProfile?.business_name
          )
        );
      }

      setData(finalData);
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      // Don't alert on fetch error to avoid spamming
    } finally {
      setLoading(false);
    }
  }, [activeTab, role, userProfile]);

  useEffect(() => {
    if (role) fetchData();
  }, [fetchData, role]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus item ini?")) return;

    try {
      const table = activeTab === "wisata" ? "destinations" : "products";
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Gagal menghapus item");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Try 'products' bucket, fallback to 'public' or error
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (uploadError) {
      // Try 'public' bucket if 'products' fails (just a fallback guess)
      // Or just throw
      throw uploadError;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Nama wajib diisi";

    if (activeTab === "produk") {
      if (!formData.price || formData.price <= 0)
        errors.price = "Harga harus angka positif";
      if (!formData.stock || formData.stock < 0)
        errors.stock = "Stok tidak boleh negatif";
      if (!formData.category) errors.category = "Kategori wajib dipilih";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);
    try {
      const table = activeTab === "wisata" ? "destinations" : "products";
      const payload = { ...formData };

      // Upload Image if new one selected
      if (imageFile) {
        try {
          const uploadedUrl = await uploadImage(imageFile);
          payload.image_url = uploadedUrl;
        } catch (uploadErr) {
          console.error("Upload failed:", uploadErr);
          alert(
            "Gagal upload gambar. Pastikan bucket 'products' ada di Supabase."
          );
          setUploading(false);
          return;
        }
      }

      // Ensure numeric values
      if (payload.rating) payload.rating = parseFloat(payload.rating);
      if (payload.price) payload.price = parseInt(payload.price);
      if (payload.stock) payload.stock = parseInt(payload.stock);

      // Auto-fill ownership
      if (role === "umkm" && userProfile) {
        payload.owner_id = userProfile.id;
        payload.seller_name = userProfile.business_name; // redundancy for safety
      }

      let error;
      if (editingItem) {
        const { error: err } = await supabase
          .from(table)
          .update(payload)
          .eq("id", editingItem.id);
        error = err;
      } else {
        const { error: err } = await supabase.from(table).insert([payload]);
        error = err;
      }

      if (error) throw error;

      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      setImageFile(null);
      setPreviewUrl(null);
      alert(
        editingItem ? "Data berhasil diperbarui!" : "Data berhasil ditambahkan!"
      );
      fetchData();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const openModal = (item = null) => {
    setFormErrors({});
    setEditingItem(item);
    setImageFile(null);
    if (activeTab === "wisata") {
      setFormData(
        item || {
          name: "",
          type: "",
          description: "",
          image_url: "",
          rating: 4.5,
          has_ar: false,
        }
      );
      setPreviewUrl(item?.image_url || null);
    } else if (activeTab === "produk") {
      setFormData(
        item || {
          name: "",
          description: "",
          price: 0,
          stock: 10,
          category: "Makanan",
          image_url: "",
          seller_name: role === "umkm" ? userProfile?.business_name : "",
          is_active: true,
        }
      );
      setPreviewUrl(item?.image_url || null);
    }
    setShowModal(true);
  };

  const renderTabs = () => (
    <div className="flex space-x-4 mb-8">
      {role !== "umkm" && (
        <button
          onClick={() => setActiveTab("wisata")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "wisata"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <MapPin size={20} /> Wisata
        </button>
      )}
      <button
        onClick={() => setActiveTab("produk")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
          activeTab === "produk"
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        <ShoppingBag size={20} /> Produk UMKM
      </button>
      <button
        onClick={() => setActiveTab("pesanan")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
          activeTab === "pesanan"
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        <ShoppingCart size={20} /> Pesanan
      </button>
    </div>
  );

  // ... (renderWisataTable same, renderProdukTable same, renderPesananList same?
  // Ideally we keep them. To save context space I'll re-include the render logic but condensed where possible or exact copy.)

  const renderWisataTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((spot) => (
            <tr key={spot.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={spot.image_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {spot.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {spot.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {spot.rating}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => openModal(spot)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(spot.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProdukTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    src={product.image_url || "https://via.placeholder.com/150"}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover mr-4"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.category}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>Price: Rp {product.price?.toLocaleString()}</div>
                <div>Stock: {product.stock}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.is_active ? (
                  <span className="flex items-center text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full w-fit">
                    <CheckCircle size={12} className="mr-1" /> Active
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded-full w-fit">
                    <XCircle size={12} className="mr-1" /> Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => openModal(product)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPesananList = () => (
    <div className="space-y-4">
      {data.map((order) => (
        <div
          key={order.id}
          className="bg-white border rounded-lg p-6 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">
                Order ID:{" "}
                <span className="font-mono text-gray-900">{order.id}</span>
              </p>
              <p className="text-sm text-gray-500">
                Date: {new Date(order.created_at).toLocaleString()}
              </p>
              <div className="mt-2">
                <span className="font-semibold text-gray-900">
                  {order.shipping_address}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600">
                Rp {order.total_amount?.toLocaleString()}
              </p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs font-bold rounded-full ${
                  order.status === "Selesai"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Dibayar"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
          {/* Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            {order.transaction_items?.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-sm mb-2 last:mb-0"
              >
                <span>
                  {item.product?.name} x {item.quantity}
                </span>
                <span className="text-gray-600">
                  Rp {item.price_at_purchase?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-4">
            {activeTab !== "pesanan" && (
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all"
              >
                <Plus size={20} /> Tambah{" "}
                {activeTab === "wisata" ? "Wisata" : "Produk"}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-md transition-all"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {renderTabs()}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === "wisata" ? (
            renderWisataTable()
          ) : activeTab === "produk" ? (
            renderProdukTable()
          ) : (
            <div className="p-6">{renderPesananList()}</div>
          )}
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingItem ? "Edit" : "Tambah"}{" "}
                {activeTab === "wisata" ? "Wisata" : "Produk"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Form Structure */}
              {activeTab === "produk" && (
                <>
                  {/* Group 1: Informasi Utama */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-1">
                      Informasi Utama
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Produk <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className={`block w-full border rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.name
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Contoh: Keripik Tempe Pedas"
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deskripsi
                        </label>
                        <textarea
                          value={formData.description || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows="4"
                          className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Jelaskan detail produk anda..."
                        />
                      </div>

                      {/* Image Upload */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Foto Produk
                        </label>

                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative">
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Maksimal 2MB. Format: JPG, PNG, WEBP.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group 2: Harga & Stok */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-1 mt-4">
                      Harga & Stok
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga (Rp) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                          </div>
                          <input
                            type="number"
                            value={formData.price || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="10000"
                          />
                        </div>
                        {formErrors.price && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.price}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stok <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                stock: Math.max(0, (prev.stock || 0) - 1),
                              }))
                            }
                            className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-100 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={formData.stock || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                stock: parseInt(e.target.value),
                              })
                            }
                            className="w-full text-center border-t border-b border-gray-300 p-2.5 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                stock: (prev.stock || 0) + 1,
                              }))
                            }
                            className="px-3 py-2 border border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                        {formErrors.stock && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.stock}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Group 3: Kategori & Lainnya */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-1 mt-4">
                      Pengaturan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category || "Makanan"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Makanan">Makanan</option>
                          <option value="Minuman">Minuman</option>
                          <option value="Kerajinan">Kerajinan</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Oleh-oleh">Oleh-oleh</option>
                          <option value="Batik">Batik</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Penjual
                        </label>
                        <input
                          type="text"
                          value={
                            role === "umkm"
                              ? userProfile?.business_name
                              : formData.seller_name || ""
                          }
                          readOnly={role === "umkm"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seller_name: e.target.value,
                            })
                          }
                          className={`block w-full border border-gray-300 rounded-lg p-2.5 ${
                            role === "umkm"
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }`}
                          placeholder="Nama Penjual"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="is_active"
                            type="checkbox"
                            checked={formData.is_active !== false}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                is_active: e.target.checked,
                              })
                            }
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="is_active"
                            className="font-medium text-gray-700"
                          >
                            Aktifkan Produk
                          </label>
                          <p className="text-gray-500 text-xs">
                            Produk akan tampil di katalog jika diaktifkan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Wisata Form Structure (Simplified/Existing) */}
              {activeTab === "wisata" && (
                <div className="space-y-4">
                  {/* Reuse existing inputs for Wisata roughly... */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Wisata
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipe
                    </label>
                    <input
                      type="text"
                      value={formData.type || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="mt-1 block w-full border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                      className="mt-1 block w-full border rounded-md p-2"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image_url || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className="mt-1 block w-full border rounded-md p-2"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Rating
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.rating || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, rating: e.target.value })
                        }
                        className="mt-1 block w-full border rounded-md p-2"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <input
                        type="checkbox"
                        checked={formData.has_ar || false}
                        onChange={(e) =>
                          setFormData({ ...formData, has_ar: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <label className="ml-2">Has AR?</label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-colors font-medium flex items-center"
                >
                  {uploading ? (
                    <Loader className="animate-spin mr-2" size={18} />
                  ) : null}
                  {uploading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
