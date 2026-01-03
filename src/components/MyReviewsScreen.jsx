import React, { useEffect, useState } from "react";
import { ArrowLeft, Star, Trash2, MapPin, ShoppingBag } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function MyReviewsScreen({ session, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyReviews();
    }
  }, [session]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          *,
          product:products (id, name, image_url),
          destination:destinations (id, name, image)
        `
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error("Error fetching my reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;

      // Remove from local state
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20 md:pb-8 animate-slideUp">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-gray-100 flex items-center shadow-sm">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Ulasan Saya</h1>
      </div>

      <div className="p-4 md:max-w-2xl md:mx-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-400">
            Memuat ulasan...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-gray-400" size={32} />
            </div>
            <h3 className="text-gray-800 font-bold mb-1">Belum Ada Ulasan</h3>
            <p className="text-gray-500 text-sm">
              Anda belum memberikan ulasan untuk destinasi atau produk apapun.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              // Determine target (Product or Destination)
              const target = review.product || review.destination;
              const isProduct = !!review.product;

              if (!target) return null; // Skip if relation missing

              return (
                <div
                  key={review.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      <img
                        src={isProduct ? target.image_url : target.image}
                        alt={target.name}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/150")
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] items-center flex text-gray-500 mb-1">
                            {isProduct ? (
                              <ShoppingBag size={10} className="mr-1" />
                            ) : (
                              <MapPin size={10} className="mr-1" />
                            )}
                            {isProduct ? "Produk" : "Destinasi"}
                          </p>
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                            {target.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center my-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-1 italic">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
