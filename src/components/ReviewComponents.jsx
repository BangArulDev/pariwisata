import React, { useState, useEffect } from "react";
import { Star, Send, User, Trash2 } from "lucide-react";
import { supabase } from "../supabaseClient";

export function ReviewList({ productId, destinationId, refreshTrigger }) {
  const [reviews, setReviews] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [productId, destinationId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      } else if (destinationId) {
        query = query.eq("destination_id", destinationId);
      }

      const { data: reviewsData, error } = await query;
      if (error) throw error;

      setReviews(reviewsData || []);

      // Fetch profiles for these reviews
      if (reviewsData?.length > 0) {
        const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const profileMap = {};
        profilesData?.forEach((p) => {
          profileMap[p.id] = p;
        });
        setProfiles(profileMap);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Hapus ulasan ini?")) return;
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      if (error) throw error;
      fetchReviews();
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="text-center py-4 text-gray-400 text-sm">
        Memuat ulasan...
      </div>
    );

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-500 text-sm">
          Belum ada ulasan. Jadilah yang pertama!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const profile = profiles[review.user_id];
        const isOwner = session?.user?.id === review.user_id;

        return (
          <div
            key={review.id}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Ava"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs font-bold">
                      {profile?.full_name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {profile?.full_name || "Pengguna"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(review.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="mt-2 flex items-center text-yellow-400 text-xs mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < review.rating ? "currentColor" : "none"}
                  className={
                    i < review.rating ? "text-yellow-400" : "text-gray-300"
                  }
                />
              ))}
            </div>

            {review.comment && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ReviewForm({ productId, destinationId, onSaved }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Pilih bintang rating!");
    if (!session) return alert("Silakan login untuk memberi ulasan.");

    setLoading(true);
    try {
      const payload = {
        user_id: session.user.id,
        rating,
        comment,
        product_id: productId || null,
        destination_id: destinationId || null,
      };

      const { error } = await supabase.from("reviews").insert(payload);
      if (error) throw error;

      setRating(0);
      setComment("");
      if (onSaved) onSaved();
    } catch (err) {
      alert("Gagal mengirim ulasan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
        <p className="text-gray-500 text-sm">Login untuk meniggalkan ulasan.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6"
    >
      <h3 className="font-bold text-gray-800 mb-3 text-sm">Tulis Ulasan</h3>

      <div className="flex space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              size={24}
              className={`${
                star <= (hoverRating || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Bagikan pengalaman Anda di sini..."
        className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all resize-none h-24 mb-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white text-sm font-bold py-2.5 px-6 rounded-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center float-right disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          "Mengirim..."
        ) : (
          <>
            <Send size={14} className="mr-2" />
            Kirim Ulasan
          </>
        )}
      </button>
      <div className="clear-both"></div>
    </form>
  );
}
