import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, QrCode } from "lucide-react";

const InfoScreen = ({ spot, onBack }) => {
  if (!spot) return null;

  // Membuat data untuk QR Code, contoh: "grobogan-app://spot/4"
  const qrValue = `grobogan-app://spot/${spot.id}`;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center animate-slideUp">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 m-4 relative">
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <QrCode size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Kode QR Lokasi</h2>
        </div>

        <p className="text-center text-gray-600 mb-2 text-sm">
          Pindai kode ini di aplikasi untuk membuka detail tentang:
        </p>
        <p className="text-center font-bold text-lg text-gray-900 mb-5">
          {spot.name}
        </p>

        <div className="flex justify-center p-4 bg-gray-100 rounded-xl border border-gray-200">
          <QRCode
            value={qrValue}
            size={256}
            level={"H"}
            includeMargin={true}
            imageSettings={{
              src: "/vite.svg", // Anda bisa ganti dengan logo aplikasi
              x: undefined,
              y: undefined,
              height: 48,
              width: 48,
              excavate: true,
            }}
          />
        </div>

        <p className="text-center text-gray-500 mt-4 text-xs">ID: {qrValue}</p>
      </div>
    </div>
  );
};

export default InfoScreen;
