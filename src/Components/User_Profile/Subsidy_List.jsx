import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Subsidy_detail from "./Subsidy_detail";
import Settings from "../HomePage/Settings.jsx";
import ReviewsModal from "./ReviewsModal";
import api from "./api1.js";

function Subsidy_List() {
  const [searchSubsidy, setSearchSubsidy] = useState("");
  const [subsidies, setSubsidies] = useState([]);        // current page items (server-paginated)
  const [allSubsidies, setAllSubsidies] = useState([]);  // all items (client-side fallback)
  const [isServerPaginated, setIsServerPaginated] = useState(false);
  const [selectedSubsidy, setSelectedSubsidy] = useState(null);
  const [openReviews, setOpenReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  // ======================================================
  // FIX: SAFE API FETCH with client-side pagination fallback
  // ======================================================
  const fetchSubsidies = async (page = 1) => {
  try {
    setLoading(true);

    const response = await api.get(`/api/subsidies/?page=${page}`);

    const data = response.data;

    // Case 1: paginated response from backend
    if (data && Array.isArray(data.results) && typeof data.count === 'number') {
      setSubsidies(data.results);
      setAllSubsidies([]);
      setIsServerPaginated(true);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
    }

    // Case 2: non-paginated response (plain list) → use client-side pagination
    else if (Array.isArray(data.results)) {
      // has results but no count — treat as client-side
      setAllSubsidies(data.results);
      setIsServerPaginated(false);
      setTotalPages(Math.ceil(data.results.length / PAGE_SIZE));
    }

    else if (Array.isArray(data)) {
      setAllSubsidies(data);
      setIsServerPaginated(false);
      setTotalPages(Math.ceil(data.length / PAGE_SIZE));
    }

    else {
      setSubsidies([]);
      setAllSubsidies([]);
    }

  } catch (error) {
    console.error(error);
    setError("Failed to load Subsidies.");
  } finally {
    setLoading(false);
  }
};

  // For client-side pagination: compute the displayed subsidies
  const displayedSubsidies = (() => {
    // Apply search filter
    const source = isServerPaginated ? subsidies : allSubsidies;
    const filtered = searchSubsidy.trim()
      ? source.filter(s =>
          (s.title || '').toLowerCase().includes(searchSubsidy.toLowerCase()) ||
          (s.description || '').toLowerCase().includes(searchSubsidy.toLowerCase())
        )
      : source;

    if (isServerPaginated) {
      // Server already paginated, just return filtered results
      return filtered;
    }

    // Client-side pagination
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  })();

  // Recalculate totalPages when search changes (client-side mode)
  useEffect(() => {
    if (!isServerPaginated) {
      const filtered = searchSubsidy.trim()
        ? allSubsidies.filter(s =>
            (s.title || '').toLowerCase().includes(searchSubsidy.toLowerCase()) ||
            (s.description || '').toLowerCase().includes(searchSubsidy.toLowerCase())
          )
        : allSubsidies;
      setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
    }
  }, [searchSubsidy, allSubsidies, isServerPaginated]);

  // Fetch on page change (only needed for server-side pagination)
  useEffect(() => {
    if (isServerPaginated || currentPage === 1) {
      fetchSubsidies(currentPage);
    }
  }, [currentPage]);

  // Fetch on mount
  useEffect(() => {
    fetchSubsidies(1);
  }, []);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchSubsidy]);

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      window.scrollTo(0, 0);
    }
  };

  // Generate page numbers to display (show only nearby pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const formatDateRange = (start, end) => {
    const fmt = (d) => {
      if (!d) return "N/A";
      const date = new Date(d);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };
    return `${fmt(start)} to ${fmt(end)}`;
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <p>Loading subsidies...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-600">
        <p>{error}</p>
      </div>
    );

  return (
    <>
      <div className="w-full min-h-screen">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold">Subsidy Schemes</h1>

          <div className="mt-6">
            <input
              type="text"
              placeholder="Search Subsidies..."
              value={searchSubsidy}
              onChange={(e) => setSearchSubsidy(e.target.value)}
              className="w-full sm:w-1/2 lg:w-1/3 border px-3 py-2 rounded-md"
            />
          </div>

          <div className="mt-6">
            {/* ======================================================
               FIX: SAFE MAP WITH FALLBACK
            ====================================================== */}
            {displayedSubsidies?.length > 0 ? (
              displayedSubsidies.map((subsidy) => (
                <div
                  key={subsidy.id}
                  className="bg-white p-6 rounded-xl shadow-md mb-4 flex justify-between"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700">
                      {subsidy.title}
                    </h2>

                    {/* ⭐ Rating + Reviews */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-500 text-lg">★</span>
                      <span className="font-semibold">
                        {subsidy.rating?.toFixed(1) || "0.0"}
                      </span>

                      <button
                        onClick={() => setOpenReviews(subsidy.id)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        ({subsidy.ratings_count || 0} reviews)
                      </button>
                    </div>

                    <p className="text-gray-600 mt-2">
                      Maximum Amount: ₹
                      {parseFloat(subsidy.amount).toLocaleString("en-IN")}
                    </p>

                    <p className="text-gray-600">
                      Application Window:{" "}
                      {formatDateRange(
                        subsidy.application_start_date,
                        subsidy.application_end_date
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      className="bg-green-600 text-white px-3 py-2 rounded-md"
                      onClick={() => setSelectedSubsidy(subsidy)}
                    >
                      View More
                    </button>

                    <button
                      className="bg-green-600 text-white px-3 py-2 rounded-md"
                      onClick={() =>
                        navigate(`/apply/${subsidy.id}`, {
                          state: { subsidy },
                        })
                      }
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">
                No subsidies found.
              </p>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
              </p>
              
              <div className="flex justify-center items-center gap-2 flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md border transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {getPageNumbers().map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePageChange(num)}
                      className={`px-3 py-2 rounded-md border transition ${
                        currentPage === num
                          ? "bg-green-600 text-white border-green-600 font-semibold"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md border transition ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* MODALS */}
          {selectedSubsidy && (
            <Subsidy_detail
              subsidy={selectedSubsidy}
              onClose={() => setSelectedSubsidy(null)}
            />
          )}

          {openReviews && (
            <ReviewsModal
              subsidyId={openReviews}
              onClose={() => setOpenReviews(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Subsidy_List;
