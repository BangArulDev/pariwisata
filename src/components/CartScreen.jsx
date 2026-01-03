import React from "react";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartScreen({
  cart,
  onBack,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[60vh] text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Keranjang Kosong
        </h2>
        <p className="text-gray-500 mb-6 max-w-xs">
          Belum ada produk yang dipilih. Yuk, jelajahi pasar UMKM kami!
        </p>
        <button
          onClick={onBack}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
        >
          Belanja Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8 max-w-3xl mx-auto w-full px-4 md:px-6 animate-slideUp">
      <div className="flex items-center mb-6 pt-4">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Keranjang Belanja</h2>
      </div>

      <div className="space-y-4 mb-24">
        {cart.map((item) => (
          <div
            key={item.cartId}
            className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 line-clamp-1">
                  {item.name}
                </h3>
                <button
                  onClick={() => onRemove(item.cartId)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">{item.location}</p>

              <div className="flex justify-between items-end">
                <span className="font-bold text-green-700">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </span>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.cartId,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                    disabled={item.quantity <= 1}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-green-600 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold text-sm w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.cartId, item.quantity + 1)
                    }
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-green-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:static md:border-none md:shadow-none md:bg-transparent md:p-0">
        <div className="max-w-3xl mx-auto md:bg-white md:p-6 md:rounded-xl md:shadow-sm md:border md:border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Pembayaran</span>
            <span className="text-xl md:text-2xl font-bold text-green-700">
              Rp {total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-green-600 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all text-lg"
          >
            Checkout ({cart.length})
          </button>
        </div>
      </div>
    </div>
  );
}
