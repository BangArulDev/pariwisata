import React from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function HistoryScreen({
  history,
  onBack,
  onSelectTransaction,
}) {
  if (!history || history.length === 0) {
    return (
      <div className="pb-20 md:pb-8 max-w-2xl mx-auto w-full px-4 md:px-6 animate-slideUp">
        <div className="flex items-center mb-6 pt-4">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            Riwayat Transaksi
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <ShoppingBag size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            Belum ada transaksi
          </h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Anda belum melakukan pembelian apa pun. Mulai belanja oleh-oleh khas
            Grobogan sekarang!
          </p>
        </div>
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
        <h2 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h2>
      </div>

      <div className="space-y-4">
        {history
          .slice()
          .reverse()
          .map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectTransaction && onSelectTransaction(order)}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>
                    {new Date(order.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="mx-1">•</span>
                  <Clock size={14} />
                  <span>
                    {new Date(order.date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                    order.status === "Selesai"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status || "Berhasil"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items && order.items.length > 0 ? (
                  <>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 items-center text-sm border-b border-gray-50 last:border-0 py-2"
                      >
                        {/* Image if available */}
                        {item.image && (
                          <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0">
                            <img
                              src={item.image}
                              className="w-full h-full object-cover"
                              alt={item.name}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="text-gray-700 font-medium line-clamp-1">
                            {item.name}
                          </span>
                          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                            <span>
                              {item.quantity} x Rp{" "}
                              {item.price?.toLocaleString()}
                            </span>
                            <span className="font-semibold text-gray-500">
                              Rp {(item.quantity * item.price).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-400 italic">
                        ...dan {order.items.length - 3} item lainnya
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Detail item tidak tersedia (Hanya tersimpan di struk fisik)
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-xs text-gray-400">Total Belanja</p>
                  <p className="text-green-700 font-bold text-lg">
                    Rp {order.total.toLocaleString()}
                  </p>
                </div>
                <div className="text-green-600">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
