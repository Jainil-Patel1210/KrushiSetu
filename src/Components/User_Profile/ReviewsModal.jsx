import React, { useEffect, useState } from "react";
import api from "./api1";

export default function ReviewsModal({ subsidyId, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchReviews() {
    try {
      const res = await api.get(`/api/subsidies/${subsidyId}/ratings/`);
      setReviews(res.data);
    } catch (e) {
      console.error("Error loading reviews:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
        <button
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">Reviews</h2>

        {loading ? (
          <p>Loading...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="border p-3 rounded-lg bg-gray-50 shadow-sm"
              >
                <div className="flex justify-between">
                  <p className="font-semibold">{r.user_name}</p>
                  <p className="text-yellow-500">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </p>
                </div>
                <p className="text-gray-700 mt-1">{r.review || "No comment"}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
