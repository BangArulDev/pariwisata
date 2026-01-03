import React, { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function CheckoutScreen({ cart, onBack, onConfrim }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    // Simulate API call
    // setTimeout(() => {
    onConfrim(formData);
    // }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[80vh] text-center animate-slideUp">
        <div className="bg-green-100 p-6 rounded-full mb-6 text-green-600 animate-bounce">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pesanan Berhasil!
        </h2>
        <p className="text-gray-500 mb-6 max-w-xs">
          Terima kasih telah berbelanja di UMKM Grobogan. Penjual akan segera
          menghubungi Anda.
        </p>
        <button
          disabled
          className="bg-gray-200 text-gray-500 px-6 py-2 rounded-lg font-bold cursor-not-allowed"
        >
          Kembali ke Beranda...
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8 max-w-2xl mx-auto w-full px-4 md:px-6 animate-slideUp">
      <div className="flex items-center mb-6 pt-4">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
          Ringkasan Pesanan
        </h3>
        <div className="space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item.cartId} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">
                Rp {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100">
          <span>Total</span>
          <span className="text-green-700">Rp {total.toLocaleString()}</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4"
      >
        <h3 className="font-bold text-lg mb-2 text-gray-800">Data Pemesan</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap
          </label>
          <input
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Masukkan nama anda"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor WhatsApp
          </label>
          <input
            required
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Contoh: 081234567890"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alamat Pengiriman
          </label>
          <textarea
            required
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
            placeholder="Alamat lengkap..."
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catatan (Opsional)
          </label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Pesan untuk penjual..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition-all mt-6"
        >
          Konfirmasi Pesanan
        </button>
      </form>
    </div>
  );
}
