import React from "react";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function TransactionDetailScreen({ transaction, onBack }) {
  if (!transaction) return null;

  return (
    <div className="pb-20 md:pb-8 max-w-2xl mx-auto w-full px-4 md:px-6 animate-slideUp">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 z-10 pt-4 pb-2">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="mr-3 p-2 bg-white shadow-sm hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Detail Transaksi</h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">ID Transaksi</p>
              <p className="font-mono text-xs font-bold text-gray-800 break-all">
                {transaction.id}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                transaction.status === "Selesai"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {transaction.status || "Berhasil"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-50 pt-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span>
                {new Date(transaction.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span>
                {new Date(transaction.date).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            <Package size={18} className="mr-2 text-green-600" />
            Info Pengiriman
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Alamat</p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {transaction.shipping_address || (
                    <span className="text-gray-400 italic">
                      Alamat tidak tersedia (Transaksi lama)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Nomor Telepon</p>
                <p className="text-sm text-gray-800">
                  {transaction.phone || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Item List */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Rincian Barang</h3>
          <div className="space-y-4">
            {transaction.items &&
              transaction.items.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                    {item.image ? (
                      <img
                        src={item.image}
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.quantity} x Rp {item.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      Rp {(item.quantity * item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
            <span className="font-bold text-gray-600">Total Pembayaran</span>
            <span className="font-bold text-lg text-green-700">
              Rp {transaction.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
