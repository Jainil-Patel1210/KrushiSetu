import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Settings from "./Settings";
import api from "../User_Profile/api1";
import { formatDate } from "../../utils/auth";

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch specific article
  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await api.get(`/news/articles/${id}/`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      setArticle(res.data);
    } catch (err) {
      console.error("Error fetching article:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F3FFF1] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Article Not Found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="bg-[#1B7A43] text-white px-6 py-3 rounded-lg hover:bg-[#145a32] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Settings />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* TAG (Category / Topic / Badge) */}
        {article.tag && (
          <div className="mb-4">
            <span className="inline-block bg-[#1B7A43] text-white px-4 py-1 rounded-full text-sm font-semibold">
              {article.tag}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>

        {/* Date & Provider */}
        <div className="flex items-center gap-6 text-gray-600 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span>{formatDate(article.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">By:</span>
            <span>{article.provider_name}</span>
          </div>
        </div>

        {/* Article Content Box */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">

          {/* Featured Image */}
          {article.image && (
            <div className="w-full rounded-lg overflow-hidden shadow-lg mb-6">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-72 object-cover"
              />
            </div>
          )}

          {/* Full Description */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {article.description}
            </p>
          </div>

        </div>

        {/* Back Button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-[#1B7A43] text-white px-8 py-3 rounded-lg hover:bg-[#145a32] transition-all duration-300 font-semibold"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}

export default NewsDetail;
