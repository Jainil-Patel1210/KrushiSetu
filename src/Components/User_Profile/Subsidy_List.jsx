import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Subsidy_detail from "./Subsidy_detail";
import Settings from "../HomePage/Settings.jsx";
import ReviewsModal from "./ReviewsModal";
import api from "./api1.js";
import Header from "./Header.jsx";
import Navbar from "../HomePage/Navbar.jsx";

function Subsidy_List({isHeaderVisible}) {
  const [searchSubsidy, setSearchSubsidy] = useState("");
  const [subsidies, setSubsidies] = useState([]);
  const [selectedSubsidy, setSelectedSubsidy] = useState(null);
  const [openReviews, setOpenReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // ======================================================
  // FIX: SAFE API FETCH
  // ======================================================
  const fetchSubsidies = async (page = 1) => {
  try {
    setLoading(true);

    const response = await api.get(`/api/subsidies/?page=${page}`);

    const data = response.data;

    // Case 1: paginated response
    if (Array.isArray(data.results)) {
      setSubsidies(data.results);
      setTotalPages(Math.ceil((data.count ?? data.results.length) / 10));
    }

    // Case 2: non-paginated response (plain list)
    else if (Array.isArray(data)) {
      setSubsidies(data);
      setTotalPages(1);
    }

    else {
      setSubsidies([]);
    }

  } catch (error) {
    console.error(error);
    setError("Failed to load Subsidies.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchSubsidies(currentPage);
  }, [currentPage]);

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      window.scrollTo(0, 0);
    }
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
      {isHeaderVisible && 
      <>
        <Header />
        <Settings />
      </>}
      {!isHeaderVisible && <Navbar />}
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
            {subsidies?.length > 0 ? (
              subsidies.map((subsidy) => (
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
              <div className="flex justify-center items-center gap-3 mt-6 ">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`md:px-4 md:py-2 px-2 py-2 rounded-md border ${
                    currentPage === 1
                      ? "hidden"
                      : "bg-white hover:bg-green-50 border-green-500"
                  }`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`md:px-3 md:py-1 px-1 py-1 rounded-md border ${
                      currentPage === i + 1
                        ? "bg-green-600 text-white"
                        : "bg-white hover:bg-green-50 border-green-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`md:px-4 md:py-2 px-2 py-2 rounded-md border ${
                    currentPage === totalPages
                      ? "hidden"
                      : "bg-white hover:bg-green-50 border-green-500"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          
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
    </>
  );
}

export default Subsidy_List;
