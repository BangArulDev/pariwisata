import React from "react";
import { Search, MapPin, ShoppingBag } from "lucide-react";
import { products } from "../data/mockData";

export default function MarketplaceScreen({ addToCart }) {
  return (
    <div className="pb-20 md:pb-8 max-w-7xl mx-auto w-full md:px-6 animate-slideUp">
      <div className="bg-white md:bg-transparent px-4 py-4 sticky top-0 md:static z-10 shadow-sm md:shadow-none border-b md:border-none border-gray-200">
        <div className="md:flex md:justify-between md:items-center md:mb-6">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-800">Pasar Rakyat Virtual</h2>
            <p className="text-xs md:text-base text-gray-500 mt-1">Dukung UMKM lokal Grobogan langsung dari pengrajinnya.</p>
          </div>
          <div className="mt-3 md:mt-0 hidden md:block">
            <div className="relative">
              <input type="text" placeholder="Cari produk..." className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 outline-none w-64" />
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex mt-3 gap-2 overflow-x-auto scrollbar-hide pb-1">
          {["Semua","Makanan","Kerajinan","Fashion","Oleh-oleh","Batik"].map((cat, idx) => (
            <button key={idx} className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${idx===0?"bg-green-600 text-white shadow-md":"bg-gray-100 md:bg-white md:border md:border-gray-200 text-gray-600 hover:bg-gray-200"}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-0">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative h-40 md:h-56 overflow-hidden bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-700 shadow-sm">Terlaris</div>
            </div>
            <div className="p-3 md:p-4 flex-1 flex flex-col">
              <div className="mb-2">
                <p className="text-[10px] text-gray-500 flex items-center mb-1"><MapPin size={10} className="mr-1" /> {product.location}</p>
                <h3 className="font-bold text-sm md:text-base text-gray-800 line-clamp-2 group-hover:text-green-700 transition-colors">{product.name}</h3>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-green-700 font-bold text-sm md:text-lg">Rp {product.price.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{product.sold} terjual</span>
                </div>
                <button onClick={() => addToCart(product)} className="w-full bg-white text-green-600 border border-green-600 hover:bg-green-600 hover:text-white text-xs md:text-sm font-bold py-2 rounded-lg transition-all flex items-center justify-center active:scale-95"><ShoppingBag size={14} className="mr-2" /> Tambah ke Keranjang</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
