import React, { useEffect, useRef, useState } from "react";
import { X, Play, CameraOff, RefreshCw } from "lucide-react";

// --- PANDUAN UNTUK LOCALHOST (Komputer Anda) ---
// 1. Buka terminal dan jalankan: npm install qr-scanner
// 2. Uncomment baris import di bawah ini:
import QrScanner from "qr-scanner";

const ARScannerScreen = ({ onBack, onScanSuccess, arContent }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [arFound, setArFound] = useState(false); // State internal

  // Fungsi untuk memulai Kamera
  const startCameraOnly = async () => {
    setCameraError(null);
    try {
      // Menggunakan API browser bawaan (Tanpa Library Tambahan)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // --- LOGIKA QR SCANNER ---
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            if (result?.data && !arFound) {
              console.log("QR Code Terdeteksi:", result.data);
              scannerRef.current?.stop();
              setArFound(true); // Tampilkan UI Sukses internal
              if (onScanSuccess) {
                // Kirim data ke parent (App.jsx)
                onScanSuccess(result.data);
              }
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: "environment",
          }
        );
        await scannerRef.current.start();
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      setCameraError(
        "Gagal mengakses kamera. Pastikan izin diberikan atau coba di HP."
      );
    }
  };

  useEffect(() => {
    if (!arFound) {
      startCameraOnly();
    }

    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, [arFound]); // Hanya bergantung pada state internal arFound

  const handleRetry = () => {
    setCameraError(null);
    startCameraOnly();
  };

  return (
    <div className="fixed inset-0 z-100 bg-gray-900 flex flex-col items-center justify-center">
      <button
        onClick={onBack}
        className="absolute top-6 right-6 z-20 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="relative w-full h-full md:max-w-4xl md:h-[80vh] md:rounded-3xl overflow-hidden bg-black shadow-2xl">
        {/* AREA VIDEO */}
        {!arFound ? (
          cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center z-30">
              <div className="bg-red-500/20 p-4 rounded-full mb-4">
                <CameraOff size={48} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Kamera Bermasalah</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                {cameraError}
              </p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition"
              >
                <RefreshCw size={16} /> Coba Lagi
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
              autoPlay
              style={{ transform: "scaleX(-1)" }}
            />
          )
        ) : (
          // HASIL SNAPSHOT (Gambar Beku)
          <img
            src="https://images.unsplash.com/photo-1599579087611-17f453946ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            className="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm"
            alt="Scanned Background"
          />
        )}

        {/* UI OVERLAY */}
        {!cameraError && (
          <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl text-white text-center border border-white/10 max-w-xs mx-auto mt-4">
              <h2 className="text-base font-bold">Pemindai E-Kultura</h2>
              <p className="text-xs text-gray-200 mt-1">
                Arahkan kamera ke Marker/QR Code
              </p>
            </div>

            {/* Kotak Pembidik */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 flex items-center justify-center">
              {/* Single top edge line as QR guide */}
              <div className="absolute top-0 left-4 right-4 h-0.5 bg-white/30"></div>
            </div>

            {/* POP-UP HASIL (Muncul Otomatis via Simulasi atau Scan Asli) */}
            {arFound && (
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl animate-slideUp border-t-4 border-yellow-500 max-w-md mx-auto w-full mb-10 md:mb-0 pointer-events-auto">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl text-gray-800">
                    {arContent?.title || "Objek Terdeteksi"}
                  </h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full border border-yellow-200">
                    Berhasil
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {arContent?.description || "Konten AR berhasil dimuat."}
                </p>

                <div className="h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1583096114844-065dc6726a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500"
                    alt="Model Preview"
                  />
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center animate-bounce shadow-lg mb-2">
                      <span className="text-2xl">💃</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                      Model 3D Tayub
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center shadow-md transition-colors">
                    <Play size={16} className="mr-2" /> Putar Audio
                  </button>
                  <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 rounded-xl shadow-md transition-colors">
                    Info Detail
                  </button>
                </div>
              </div>
            )}

            {!arFound && (
              <div className="text-center text-white text-sm animate-pulse bg-black/40 px-4 py-2 rounded-full mx-auto w-max backdrop-blur-sm mb-10 md:mb-4">
                Arahkan kamera ke Marker
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ARScannerScreen;
