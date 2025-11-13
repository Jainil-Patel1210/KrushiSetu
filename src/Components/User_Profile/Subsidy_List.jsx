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
  const subsidiesPerPage = 10; // ✅ Show 10 per page

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

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredSubsidies.length / subsidiesPerPage);
  const startIndex = (currentPage - 1) * subsidiesPerPage;
  const currentSubsidies = filteredSubsidies.slice(
    startIndex,
    startIndex + subsidiesPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top on change
    }
  };

  const formatDateRange = (start, end) => {
    const date = (d) => {
      const dateObj = new Date(d);
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    };
    if (start && end) return `${date(start)} to ${date(end)}`;
    if (start) return `${date(start)} to N/A`;
    if (end) return `N/A to ${date(end)}`;
    return "N/A";
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
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6 text-red-500 mt-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.29 3.86l-8.48 14.7A1 1 0 002.62 20h18.76a1 1 0 00.86-1.5l-8.48-14.64a1 1 0 00-1.72 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01"
              />
            </svg>
            <div className="flex-1">
              <p className="mb-4">{error}</p>
              <button
                onClick={fetchSubsidies}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Settings />
      <div className="w-full min-h-screen">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Subsidy Schemes
          </h1>

          <div className="mt-6 mb-6">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l3.817 3.817a1 1 0 01-1.414 1.414l-3.817-3.817A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search Subsidies..."
                value={searchSubsidy}
                onChange={(e) => {
                  setSearchSubsidy(e.target.value);
                  setCurrentPage(1); // reset to page 1 on new search
                }}
                className="w-full pl-10 pr-3 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
            </div>
          </div>

          {filteredSubsidies.length === 0 ? (
            <p>No subsidies found.</p>
          ) : (
            <>
              {/* ✅ Show only 10 subsidies per page */}
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
                      <p className="text-sm text-gray-600">
                        Maximum Amount - ₹
                        {parseFloat(subsidy.amount).toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Date of Application -{" "}
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

              {/* ✅ Pagination Controls */}
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`px-4 py-2 rounded-md border ${
                    currentPage === 1
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-white hover:bg-green-50 border-green-500"
                  }`}
                  disabled={currentPage === 1}
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
                        : "bg-white hover:bg-green-50 border-green-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-4 py-2 rounded-md border ${
                    currentPage === totalPages
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-white hover:bg-green-50 border-green-500"
                  }`}
                  disabled={currentPage === totalPages}
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
    