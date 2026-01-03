import React, { useEffect, useState } from "react";
import { Search, MapPin, ShoppingBag, Loader } from "lucide-react";
import { supabase } from "../supabaseClient";
import * as ReviewComponents from "./ReviewComponents";

export default function MarketplaceScreen({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  };

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Close modal handler
  const closeModal = () => setSelectedProduct(null);

  return (
    <div className="pb-20 md:pb-8 max-w-7xl mx-auto w-full md:px-6 animate-slideUp">
      <div className="bg-white md:bg-transparent px-4 py-4 sticky top-0 md:static z-10 shadow-sm md:shadow-none border-b md:border-none border-gray-200">
        <div className="md:flex md:justify-between md:items-center md:mb-6">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-800">
              Pasar Rakyat Virtual
            </h2>
            <p className="text-xs md:text-base text-gray-500 mt-1">
              Dukung UMKM lokal Grobogan langsung dari pengrajinnya.
            </p>
          </div>
          <div className="mt-3 md:mt-0 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 outline-none w-64"
              />
              <Search
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex mt-3 gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            "Semua",
            "Makanan",
            "Kerajinan",
            "Fashion",
            "Oleh-oleh",
            "Batik",
          ].map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 md:bg-white md:border md:border-gray-200 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-green-600" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-0">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative h-40 md:h-56 overflow-hidden bg-gray-100">
                  <img
                    src={
                      product.image_url ||
                      "https://via.placeholder.com/300?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.stock < 5 && (
                    <div className="absolute top-2 left-2 bg-red-500/90 text-white backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold shadow-sm">
                      Stok Menipis
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <p className="text-[10px] text-gray-500 flex items-center mb-1">
                      <MapPin size={10} className="mr-1" />{" "}
                      {product.seller_name || "UMKM Grobogan"}
                    </p>
                    <h3 className="font-bold text-sm md:text-base text-gray-800 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-green-700 font-bold text-sm md:text-lg">
                        Rp {product.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {product.stock > 0 ? `Sisa ${product.stock}` : "Habis"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        product.stock > 0
                          ? addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image_url,
                            })
                          : alert("Stok habis!");
                      }}
                      className={`w-full border text-xs md:text-sm font-bold py-2 rounded-lg transition-all flex items-center justify-center active:scale-95 ${
                        product.stock > 0
                          ? "bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingBag size={14} className="mr-2" />
                      {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Product Detail Modal */}
          {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                    Detail Produk
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-0 scrollbar-hide">
                  {/* Image */}
                  <div className="h-64 md:h-80 bg-gray-100 relative">
                    <img
                      src={
                        selectedProduct.image_url ||
                        "https://via.placeholder.com/300?text=No+Image"
                      }
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedProduct.name}
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {selectedProduct.seller_name || "UMKM Grobogan"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-700">
                          Rp {selectedProduct.price.toLocaleString()}
                        </p>
                        <p
                          className={`text-xs font-bold ${
                            selectedProduct.stock > 0
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {selectedProduct.stock > 0
                            ? `Stok: ${selectedProduct.stock}`
                            : "Habis"}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8">
                      {selectedProduct.description ||
                        "Tidak ada deskripsi produk."}
                    </p>

                    <div className="mb-8">
                      <button
                        onClick={() => {
                          if (selectedProduct.stock > 0) {
                            addToCart({
                              id: selectedProduct.id,
                              name: selectedProduct.name,
                              price: selectedProduct.price,
                              image: selectedProduct.image_url,
                            });
                            closeModal();
                          } else {
                            alert("Stok habis!");
                          }
                        }}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center transition-transform active:scale-95 ${
                          selectedProduct.stock > 0
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingBag className="mr-2" />
                        {selectedProduct.stock > 0
                          ? "Beli Sekarang"
                          : "Stok Habis"}
                      </button>
                    </div>

                    {/* Reviews */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="font-bold text-gray-800 text-lg mb-4">
                        Ulasan Pembeli
                      </h3>
                      <div className="mb-6">
                        <ReviewComponents.ReviewForm
                          productId={selectedProduct.id}
                          onSaved={() => {
                            const event = new CustomEvent("review-updated");
                            window.dispatchEvent(event);
                          }}
                        />
                      </div>
                      <ReviewComponents.ReviewList
                        productId={selectedProduct.id}
                        refreshTrigger={window.location.href}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
