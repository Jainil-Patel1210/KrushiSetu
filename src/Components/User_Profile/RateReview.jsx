import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Settings from "../HomePage/Settings";

export default function RateReview() {
  const { id } = useParams(); // Subsidy ID
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = import.meta.env.VITE_BASE_URL || "";

  async function submitRating(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    try {
      const url = API_BASE
        ? `${API_BASE}/subsidies/${id}/rate/`
        : `/subsidies/${id}/rate/`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access") || ""}`
        },
        credentials: "include",
        body: JSON.stringify({ rating, review })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(data.message);
      setTimeout(() => navigate("/subsidy-list"), 1500);
    } catch (err) {
      console.error(err);
      setError("Network error");
    }
  }

  return (
    <>
      <Header />
      <Settings />

      <div className="w-full min-h-screen bg-gray-100 p-6 flex justify-center">
        <div className="bg-white shadow-md rounded-xl p-6 max-w-xl w-full">

          <h1 className="text-2xl font-bold text-green-700 mb-4">
            Rate & Review Subsidy
          </h1>

          {error && <p className="text-red-600 mb-2">{error}</p>}
          {success && <p className="text-green-600 mb-2">{success}</p>}

          <form onSubmit={submitRating}>
            {/* Rating Stars */}
            <label className="block font-semibold mb-2">Rating:</label>
            <div className="flex gap-2 text-3xl mb-4">
              {[1,2,3,4,5].map(num => (
                <span
                  key={num}
                  onClick={() => setRating(num)}
                  className={`cursor-pointer ${
                    num <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Review */}
            <label className="block font-semibold mb-2">Review (optional):</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              rows="4"
              placeholder="Write detailed feedback..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            ></textarea>

            {/* Submit */}
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
