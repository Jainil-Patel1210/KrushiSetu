import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Subsidy_detail from "./Subsidy_detail";
import ReviewsModal from "./ReviewsModal";
import api from "./api1.js";

function Subsidy_List() {
  const [searchSubsidy, setSearchSubsidy] = useState("");
  const [subsidies, setSubsidies] = useState([]);
  const [selectedSubsidy, setSelectedSubsidy] = useState(null);
  const [openReviews, setOpenReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const PAGE_SIZE = 10;

  const matchesSearch = (subsidy, term) => {
    if (!term) return true;

    const haystack = [
      subsidy.title,
      subsidy.description,
      subsidy.eligibility,
      subsidy.documents_required,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(term.toLowerCase());
  };

  const fetchAllSubsidies = async () => {
    try {
      setLoading(true);

      const firstResponse = await api.get(`/api/subsidies/?page=1&page_size=50`);
      const firstData = firstResponse.data;

      const firstPageItems = Array.isArray(firstData?.results)
        ? firstData.results
        : Array.isArray(firstData)
          ? firstData
          : [];

      const totalCount = firstData?.count ?? firstPageItems.length;
      const pageSize = firstData?.results ? 50 : firstPageItems.length || PAGE_SIZE;
      const remainingPages = Math.max(Math.ceil(totalCount / pageSize) - 1, 0);

      if (remainingPages === 0) {
        setSubsidies(firstPageItems);
        return;
      }

      const nextPageRequests = [];
      for (let page = 2; page <= remainingPages + 1; page += 1) {
        nextPageRequests.push(api.get(`/api/subsidies/?page=${page}&page_size=${pageSize}`));
      }

      const nextResponses = await Promise.all(nextPageRequests);
      const nextItems = nextResponses.flatMap((response) => {
        const data = response.data;
        if (Array.isArray(data?.results)) return data.results;
        if (Array.isArray(data)) return data;
        return [];
      });

      const allItems = [...firstPageItems, ...nextItems];
      setSubsidies(allItems);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Failed to load Subsidies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSubsidies();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchSubsidy]);

  const handlePageChange = (num) => {
    if (num >= 1 && num <= filteredTotalPages) {
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

  const filteredSubsidies = subsidies.filter((subsidy) =>
    matchesSearch(subsidy, searchSubsidy.trim())
  );

  const filteredTotalPages = Math.max(
    Math.ceil(filteredSubsidies.length / PAGE_SIZE),
    1
  );

  const paginatedSubsidies = filteredSubsidies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage > filteredTotalPages) {
      setCurrentPage(filteredTotalPages);
    }
  }, [currentPage, filteredTotalPages]);

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
              placeholder="Search subsidies by keyword..."
              value={searchSubsidy}
              onChange={(e) => setSearchSubsidy(e.target.value)}
              className="w-full sm:w-1/2 lg:w-1/3 border px-3 py-2 rounded-md"
            />
          </div>

          <div className="mt-6">
            {/* ======================================================
               FIX: SAFE MAP WITH FALLBACK
            ====================================================== */}
            {paginatedSubsidies?.length > 0 ? (
              paginatedSubsidies.map((subsidy) => (
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
          <div className="flex justify-center gap-3 mt-6">
            {[...Array(filteredTotalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
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
      </div>
    </>
  );
}

export default Subsidy_List;
