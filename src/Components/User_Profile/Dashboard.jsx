// src/Components/User_Profile/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Settings from "../HomePage/Settings.jsx";

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const statusStyles = {
    Approved: "bg-green-100 text-green-800",
    "Under Review": "bg-sky-100 text-sky-800",
    Pending: "bg-amber-100 text-amber-800",
    "Payment done": "bg-emerald-100 text-emerald-800",
    Rejected: "bg-red-100 text-red-800",
  };

  function StatusBadge({ status }) {
    const cls = statusStyles[status] || "bg-gray-200 text-gray-800";
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${cls}`}
      >
        {status}
      </span>
    );
  }

  function ActionButton({ app }) {
    const subsidyId =
      app.subsidy?.id || app.subsidy_id || app.subsidy?.subsidy_id;

    const isPaid = app.status === "Payment done";

    return (
      <button
        className={`border rounded-md px-3 py-1 text-sm hover:bg-gray-50 flex items-center gap-1 ${
          isPaid
            ? "border-yellow-500 text-yellow-700"
            : "border-gray-300 text-gray-700"
        }`}
        onClick={() =>
          isPaid
            ? navigate(`/rate-review/${subsidyId}`)
            : navigate(`/viewdetails/${app.id}`)
        }
      >
        {isPaid ? "☆ Rate & Review" : "View Details"}
      </button>
    );
  }

  useEffect(() => {
    fetchAppliedSubsidies();
  }, []);

  async function fetchAppliedSubsidies() {
    try {
      const BACKEND = `${import.meta.env.VITE_BASE_URL || ""}`;
      const url = BACKEND ? `${BACKEND}/subsidy/apply/` : "/subsidy/apply/";

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access") || ""}`,
        },
        credentials: BACKEND ? "include" : "same-origin",
      });

      const text = await res.text();
      let data = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch (err) {
        console.error("Response was not valid JSON:", text);
        throw new Error("Response was not valid JSON");
      }

      if (!res.ok) {
        throw new Error(data?.detail || `Error ${res.status}`);
      }

      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  const totalSubsidies = applications.length;

  const totalDone = applications.filter(
    (app) => app.status === "Payment done"
  ).length;

  const totalAmountReceived = applications
    .filter((app) => app.status === "Payment done" && app.amount)
    .reduce((sum, app) => sum + Number(app.amount), 0);

  return (
    <>
      <Header />
      <Settings />

      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto py-6 p-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2 font-semibold">
            Welcome back! Here's an overview of your subsidies and applications
          </p>

          {/* ====== Cards ====== */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-xl p-6">
              <p className="text-gray-600 font-medium">Total Subsidies</p>
              <p className="text-green-700 text-3xl font-bold mt-2">
                {totalSubsidies}
              </p>
            </div>

            <div className="bg-white shadow-md rounded-xl p-6">
              <p className="text-gray-600 font-medium">Subsidies Done</p>
              <p className="text-emerald-700 text-3xl font-bold mt-2">
                {totalDone}
              </p>
            </div>

            <div className="bg-white shadow-md rounded-xl p-6">
              <p className="text-gray-600 font-medium">Total Amount Received</p>
              <p className="text-green-700 text-3xl font-bold mt-2">
                ₹{totalAmountReceived.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Only counted when status is "Payment done")
              </p>
            </div>
          </div>

          {/* ====== My Applications ====== */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h1 className="text-green-700 text-2xl font-bold mb-4">
              My Applications
            </h1>

            {loading ? (
              <p>Loading...</p>
            ) : applications.length === 0 ? (
              <p className="text-gray-600">
                You haven't applied for any subsidies yet.
              </p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-700">
                        <th className="px-4 py-3">Subsidy Name</th>
                        <th className="px-4 py-3">Application ID</th>
                        <th className="px-4 py-3">Date Applied</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {applications.map((app) => {
                        const subsidyId =
                          app.subsidy?.id ||
                          app.subsidy_id ||
                          app.subsidy?.subsidy_id;

                        return (
                          <tr key={app.id} className="border-t">
                            <td className="px-4 py-3">
                              {app.subsidy_name || app.subsidy_title || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {app.application_id}
                            </td>
                            <td className="px-4 py-3">
                              {(app.applied_on || app.submitted_at || "")
                                .toString()
                                .slice(0, 10)}
                            </td>
                            <td className="px-4 py-3">
                              {app.amount ? `₹${app.amount}` : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                className={`border rounded-md px-3 py-1 text-sm flex items-center gap-1 ${
                                  app.status === "Payment done"
                                    ? "border-yellow-500 text-yellow-700"
                                    : "border-gray-300 text-gray-700"
                                }`}
                                onClick={() =>
                                  app.status === "Payment done"
                                    ? navigate(`/rate-review/${subsidyId}`)
                                    : navigate(`/viewdetails/${app.id}`)
                                }
                              >
                                {app.status === "Payment done"
                                  ? "☆ Rate & Review"
                                  : "View Details"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {applications.map((app) => {
                    const subsidyId =
                      app.subsidy?.id ||
                      app.subsidy_id ||
                      app.subsidy?.subsidy_id;

                    return (
                      <div
                        key={app.id}
                        className="bg-gray-50 rounded-lg p-4 border"
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="font-bold">
                            {app.subsidy_name || app.subsidy_title || "—"}
                          </h3>
                          <StatusBadge status={app.status} />
                        </div>

                        <p className="text-sm text-gray-500">
                          {app.application_id}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-gray-600 text-sm">
                              Date Applied
                            </p>
                            <p className="font-semibold">
                              {(app.applied_on || app.submitted_at || "")
                                .toString()
                                .slice(0, 10)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Amount</p>
                            <p className="font-semibold text-green-700">
                              {app.amount ? `₹${app.amount}` : "—"}
                            </p>
                          </div>
                        </div>

                        <button
                          className={`mt-3 border rounded-md px-3 py-1 text-sm flex items-center gap-1 ${
                            app.status === "Payment done"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-gray-300 text-gray-700"
                          }`}
                          onClick={() =>
                            app.status === "Payment done"
                              ? navigate(`/rate-review/${subsidyId}`)
                              : navigate(`/viewdetails/${app.id}`)
                          }
                        >
                          {app.status === "Payment done"
                            ? "☆ Rate & Review"
                            : "View Details"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
