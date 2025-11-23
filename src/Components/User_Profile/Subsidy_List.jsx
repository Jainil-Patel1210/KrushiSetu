// src/Components/User_Profile/Subsidy_List.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Subsidy_detail from "./Subsidy_detail";
import Settings from "../HomePage/Settings.jsx";
import api from "./api1.js";

function Subsidy_List() {
  const [searchSubsidy, setSearchSubsidy] = useState("");
  const [subsidies, setSubsidies] = useState([]);
  const [selectedSubsidy, setSelectedSubsidy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const subsidiesPerPage = 10;

  const navigate = useNavigate();

  const fetchSubsidies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/subsidies/");
      setSubsidies(response.data);
    } catch (error) {
      console.error("Error fetching subsidies:", error);
      setError("Failed to load Subsidies. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubsidies();
  }, []);

  const filteredSubsidies = subsidies.filter((subsidy) =>
    subsidy.title.toLowerCase().includes(searchSubsidy.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSubsidies.length / subsidiesPerPage);
  const startIndex = (currentPage - 1) * subsidiesPerPage;
  const currentSubsidies = filteredSubsidies.slice(
    startIndex,
    startIndex + subsidiesPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatDateRange = (start, end) => {
    const fmt = (d) => {
      if (!d) return "N/A";
      const dateObj = new Date(d);
      return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    };
    return `${fmt(start)} to ${fmt(end)}`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading subsidies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 shadow-sm">
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchSubsidies}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Subsidy Schemes
          </h1>

          <div className="mt-6 mb-6">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <input
                type="text"
                placeholder="Search Subsidies..."
                value={searchSubsidy}
                onChange={(e) => {
                  setSearchSubsidy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-3 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
            </div>
          </div>

          {filteredSubsidies.length === 0 ? (
            <p>No subsidies found.</p>
          ) : (
            <>
              <div className="max-w-6xl">
                {currentSubsidies.map((subsidy, index) => (
                  <div
                    key={subsidy.id || index}
                    className="flex justify-between bg-white p-6 rounded-2xl shadow-lg mb-4"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-gray-600">
                        {subsidy.title}
                      </h2>

                      {/* ⭐ Rating + Review Count */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-500 text-lg">★</span>
                        <span className="font-semibold">
                          {subsidy.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-gray-600 text-sm">
                          ({subsidy.ratings_count || 0} reviews)
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        Maximum Amount: ₹
                        {parseFloat(subsidy.amount).toLocaleString("en-IN")}
                      </p>

                      <p className="text-sm text-gray-600">
                        Application Window:{" "}
                        {formatDateRange(
                          subsidy.application_start_date,
                          subsidy.application_end_date
                        )}
                      </p>
                    </div>

                    <div className="flex gap-3 items-center">
                      <button
                        className="bg-green-600 text-white px-3 py-2 text-sm rounded-md cursor-pointer"
                        onClick={() => setSelectedSubsidy(subsidy)}
                      >
                        View More
                      </button>

                      <button
                        className="bg-green-600 text-white px-3 py-2 text-sm rounded-md"
                        onClick={() =>
                          navigate(`/apply/${subsidy.id}`, { state: { subsidy } })
                        }
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md border bg-white hover:bg-green-50 disabled:bg-gray-200"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded-md border ${
                      currentPage === i + 1
                        ? "bg-green-600 text-white"
                        : "bg-white hover:bg-green-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md border bg-white hover:bg-green-50 disabled:bg-gray-200"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {selectedSubsidy && (
            <Subsidy_detail
              subsidy={selectedSubsidy}
              onClose={() => setSelectedSubsidy(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Subsidy_List;
