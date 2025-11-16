// src/Subsidy_Provider/Report.jsx
import React, { useEffect, useState } from "react";
import Header from "../User_Profile/Header";     // adjust path if needed
import Settings from "../HomePage/Settings";    // adjust path if needed
import * as XLSX from "xlsx";
// --- FALLBACK SAMPLE DATA (used if backend calls fail) ---
const SAMPLE_APPLICATIONS = [
  { id: 1, farmerName: "Rajesh Kumar", subsidyName: "Organic Farming Subsidy", applicationId: "APP2024001", date: "2024-01-15", status: "Approved", amount: "10000" },
  { id: 2, farmerName: "Priya Singh", subsidyName: "Drip Irrigation Subsidy", applicationId: "APP2024002", date: "2024-02-10", status: "Approved", amount: "5000" },
  { id: 3, farmerName: "Amit Patel", subsidyName: "Crop Insurance Premium", applicationId: "APP2024003", date: "2024-03-05", status: "Under Review", amount: "2500" },
  { id: 4, farmerName: "Sunita Verma", subsidyName: "Drip Irrigation Subsidy", applicationId: "APP2024004", date: "2024-03-12", status: "Pending", amount: "5000" },
  { id: 5, farmerName: "Vikram Sharma", subsidyName: "Organic Farming Subsidy", applicationId: "APP2024005", date: "2024-03-18", status: "Approved", amount: "12000" },
  { id: 6, farmerName: "Kavita Joshi", subsidyName: "Solar Pump Subsidy", applicationId: "APP2024006", date: "2024-03-20", status: "Pending", amount: "8000" }
];

// --- Status UI styles ---
const STATUS_STYLES = {
  Approved: "bg-green-100 text-green-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
};

// Helper: read token from localStorage using several possible keys
const readLocalToken = (keys) => {
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
};

export default function Report() {
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // API base - set via Vite env or proxy. If blank uses relative endpoints.
  const API_BASE = import.meta.env.VITE_BASE_URL || ""; // e.g. "http://127.0.0.1:8000"

  // likely endpoints to fetch subsidies created by current provider
  const SUBSIDIES_ENDPOINTS = [
    API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/my/` : "/api/subsidy_provider/subsidies/my/",
    API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/` : "/api/subsidy_provider/subsidies/",
    API_BASE ? `${API_BASE}/api/subsidies/my_subsidies/` : "/api/subsidies/my_subsidies/",
    API_BASE ? `${API_BASE}/subsidies/my_subsidies/` : "/subsidies/my_subsidies/",
  ];

  useEffect(() => {
    fetchProviderSubsAndApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- fetch + auto refresh helper ---
  async function fetchWithAutoRefresh(url, options = {}, triedRefresh = false) {
    const accessToken = readLocalToken(["access", "access_token", "accessToken"]);
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const res = await fetch(url, { ...options, headers, credentials: "include" });

    // if unauthorized and refresh token exists and we haven't tried refresh yet
    if (res.status === 401 && !triedRefresh) {
      const refreshToken = readLocalToken(["refresh", "refresh_token", "refreshToken"]);
      if (refreshToken) {
        try {
          const refreshUrl = API_BASE ? `${API_BASE}/api/token/refresh/` : "/api/token/refresh/";
          const r = await fetch(refreshUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
            credentials: "include"
          });
          if (r.ok) {
            const jd = await r.json();
            if (jd.access) {
              localStorage.setItem("access", jd.access);
              // retry original request once
              return fetchWithAutoRefresh(url, options, true);
            }
          } else {
            console.warn("Refresh failed", await r.text());
            throw new Error("Refresh failed");
          }
        } catch (err) {
          throw err;
        }
      }
    }

    return res;
  }
  function downloadExcel() {
  if (!applications || applications.length === 0) {
    alert("No application data available to download.");
    return;
  }

  // Convert the UI application objects into a simple worksheet table
  const excelData = applications.map((app, index) => ({
    "Sr No.": index + 1,
    "Farmer Name": app.farmerName,
    "Subsidy Name": app.subsidyName,
    "Application ID": app.applicationId,
    "Date": app.date,
    "Status": app.status,
    "Amount": app.amount,
  }));

  // Create worksheet + workbook
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  // Download file
  XLSX.writeFile(workbook, "Subsidy_Applications_Report.xlsx");
}

  // Build candidate application endpoint templates for a subsidy id
  function applicationsEndpointForId(id) {
    // Try common patterns, backend may vary. Adjust or reorder to match your actual urls.
    const list = [
      API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/${id}/applications/` : `/api/subsidy_provider/subsidies/${id}/applications/`,
      API_BASE ? `${API_BASE}/api/subsidies/${id}/applications/` : `/api/subsidies/${id}/applications/`,
      API_BASE ? `${API_BASE}/subsidies/${id}/applications/` : `/subsidies/${id}/applications/`,
      API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/${id}/applications` : `/api/subsidy_provider/subsidies/${id}/applications`,
    ];
    return list;
  }

  // Fetch subsidies created by current provider and then fetch applications for each subsidy
  async function fetchProviderSubsAndApps() {
    setLoading(true);
    setErrorMsg("");
    setApplications([]);

    let foundSubs = null;
    // 1) Find subsidies created by current user
    for (const url of SUBSIDIES_ENDPOINTS) {
      try {
        const res = await fetchWithAutoRefresh(url, { method: "GET" });
        const text = await res.text();
        if (!res.ok) {
          console.debug("[Report] subsidies endpoint returned", res.status, url);
          continue;
        }
        let data;
        try { data = text ? JSON.parse(text) : []; } catch (e) { console.warn("subsidies parse fail", e); continue; }

        // Normalize if paginated
        const arr = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : null);
        if (!arr) continue;

        foundSubs = arr;
        break;
      } catch (err) {
        console.error("[Report] subsidies endpoint error", url, err);
      }
    }

    // If no subsidies found, try one-shot endpoints that might return applications directly
    if (!foundSubs) {
      // try older endpoints that return applications list directly
      const fallbackAppsEndpoints = [
        API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/my/applications/` : "/api/subsidy_provider/subsidies/my/applications/",
        API_BASE ? `${API_BASE}/api/subsidy/apply/` : "/api/subsidy/apply/",
        API_BASE ? `${API_BASE}/subsidy/apply/` : "/subsidy/apply/",
        API_BASE ? `${API_BASE}/api/subsidies/my_applications/` : "/api/subsidies/my_applications/",
        "/api/subsidy_provider/subsidies/my/" // already attempted but harmless
      ];
      for (const u of fallbackAppsEndpoints) {
        try {
          const res = await fetchWithAutoRefresh(u, { method: "GET" });
          const text = await res.text();
          if (!res.ok) {
            console.debug("[Report] fallback apps endpoint returned", res.status, u);
            continue;
          }
          let data;
          try { data = text ? JSON.parse(text) : []; } catch (e) { continue; }

          // If this returns an array of application-like objects, normalize and show
          if (Array.isArray(data)) {
            const normalized = data.map((a, idx) => normalizeApplication(a, idx));
            setApplications(normalized);
            setLoading(false);
            return;
          }
          if (data && data.results && Array.isArray(data.results)) {
            const normalized = data.results.map((a, idx) => normalizeApplication(a, idx));
            setApplications(normalized);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("[Report] fallback attempt failed", u, err);
        }
      }
      // No fallback apps -> continue to sample fallback later
    }

    // If we do have subsidies, fetch applications for each subsidy
    if (Array.isArray(foundSubs) && foundSubs.length > 0) {
      // For each subsidy try the candidate application endpoints and pick first successful
      const promises = foundSubs.map(async (sub) => {
        const subsidyId = sub.id ?? sub.pk ?? sub.subsidy_id;
        // find an applications endpoint that works for this subsidy
        const candidates = applicationsEndpointForId(subsidyId);
        for (const ep of candidates) {
          try {
            const r = await fetchWithAutoRefresh(ep, { method: "GET" });
            const txt = await r.text();
            if (!r.ok) {
              // try next candidate
              continue;
            }
            let d;
            try { d = txt ? JSON.parse(txt) : []; } catch (e) { continue; }
            // get array (if paginated)
            const items = Array.isArray(d) ? d : (Array.isArray(d.results) ? d.results : null);
            if (!items) continue;
            // Normalize each application and attach subsidy info
            const normalizedApps = items.map((a, idx) => normalizeApplication(a, idx, sub));
            return normalizedApps;
          } catch (err) {
            // try next ep
            continue;
          }
        }
        // no applications endpoint worked for this subsidy -> return empty
        return [];
      });

      // Wait for all application lists
      const settled = await Promise.allSettled(promises);
      const combined = [];
      for (const s of settled) {
        if (s.status === "fulfilled" && Array.isArray(s.value)) {
          combined.push(...s.value);
        }
      }

      // If we found some applications, set them
      if (combined.length > 0) {
        // optional: sort by date descending if date present
        combined.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        setApplications(combined);
        setLoading(false);
        return;
      }
    }

    // fallback to sample data
    setApplications(SAMPLE_APPLICATIONS);
    setErrorMsg("Unable to fetch provider subsidies/applications from backend — showing sample data. Check console for more info.");
    setLoading(false);
  }

  // normalize one application object to ui-friendly row
  function normalizeApplication(a, idx = 0, subsidyObj = null) {
    // a could be application or subsidy depending on endpoint
    const farmerName =
      a.full_name ||
      a.farmer_name ||
      (a.user && (a.user.full_name || a.user.username || a.user.email)) ||
      a.user_name ||
      a.applicant_name ||
      a.applicant?.full_name ||
      "—";

    const subsidyName =
      a.subsidy_name ||
      (a.subsidy && (a.subsidy.title || a.subsidy.name)) ||
      (subsidyObj && (subsidyObj.title || subsidyObj.name)) ||
      a.scheme_title ||
      "—";

    const applicationId = a.application_id || a.id || a.pk || `APP${idx + 1}`;

    const rawDate = a.submitted_at || a.applied_on || a.created_at || a.date || (a.raw && a.raw.created_at) || "";
    const date = rawDate ? String(rawDate).slice(0, 10) : "—";

    const status = a.status || a.application_status || "Pending";
    const amount = a.amount ?? (a.subsidy && a.subsidy.amount) ?? (subsidyObj && subsidyObj.amount) ?? "—";

    return {
      id: a.id ?? idx,
      farmerName,
      subsidyName,
      applicationId,
      date,
      status,
      amount,
      raw: a
    };
  }

  // --- Search handlers & UI helpers (kept same) ---
  const sanitizeInput = (input) => input.replace(/[^a-zA-Z0-9\s-]/g, "");
  const handleSearchChange = (e) => setSearchQuery(sanitizeInput(e.target.value));
  const handleSearch = (e) => { e.preventDefault(); };
  const handleClearSearch = () => setSearchQuery("");

  const filteredApplications = applications.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (app.subsidyName || "").toLowerCase().includes(q) ||
      (app.farmerName || "").toLowerCase().includes(q) ||
      (app.applicationId || "").toLowerCase().includes(q) ||
      (app.status || "").toLowerCase().includes(q)
    );
  });

  const displayApps = searchQuery ? filteredApplications : applications;

  // stats
  const totalApplications = displayApps.length;
  const approved = displayApps.filter((app) => app.status === "Approved").length;
  const underReview = displayApps.filter((app) => app.status === "Under Review").length;
  const pending = displayApps.filter((app) => app.status === "Pending").length;
  const rejected = displayApps.filter((app) => app.status === "Rejected").length;

  const getStatusColor = (status) => STATUS_STYLES[status] || "bg-gray-100 text-gray-700";

  return (
    <>
      <Header />
      <Settings />

      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-10">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Application Reports</h1>
              <p className="text-[#77797C] font-semibold mt-1 sm:mt-2 text-xs sm:text-sm md:text-base lg:text-lg">
                View and Analyze Subsidy Scheme Applications with Detailed Reports
              </p>
            </div>
          </div>

          {/* Search and Statistics Section */}
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Subsidy, Farmer Name, Application ID or Status..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-10 pr-9 sm:pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <svg className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button type="button" onClick={handleClearSearch} className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button type="submit" className="bg-[#009500] text-xs sm:text-sm md:text-base text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition whitespace-nowrap flex items-center justify-center gap-2">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </form>

            {errorMsg && <div className="mb-3 text-sm text-red-600">{errorMsg}</div>}

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Total Applications</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalApplications}</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Approved</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">{approved} <span className="text-xs">({totalApplications > 0 ? ((approved/totalApplications)*100).toFixed(1) : 0}%)</span></p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Under Review</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">{underReview} <span className="text-xs">({totalApplications > 0 ? ((underReview/totalApplications)*100).toFixed(1) : 0}%)</span></p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Pending</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-700">{pending} <span className="text-xs">({totalApplications > 0 ? ((pending/totalApplications)*100).toFixed(1) : 0}%)</span></p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Rejected</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700">{rejected} <span className="text-xs">({totalApplications > 0 ? ((rejected/totalApplications)*100).toFixed(1) : 0}%)</span></p>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 mb-3 sm:mb-4">Subsidy Applications</h2>

            {loading ? (
              <div className="py-8 text-center">Loading applications...</div>
            ) : displayApps.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500">No applications found matching your search.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr className="text-left text-base md:text-lg lg:text-lg font-bold text-gray-700">
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Sr. No.</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Farmer Name</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Subsidy Name</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Application ID</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Date</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayApps.map((app, index) => (
                        <tr key={app.id ?? index} className="hover:bg-gray-50">
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base">{index + 1}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base font-medium">{app.farmerName}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base">{app.subsidyName}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base">{app.applicationId}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base">{app.date}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3">
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {displayApps.map((app, index) => (
                    <div key={app.id ?? index} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                          <h3 className="font-semibold text-sm">{app.farmerName}</h3>
                          <p className="text-xs text-gray-600 mt-1">{app.subsidyName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Application ID:</span>
                          <span>{app.applicationId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>{app.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* View Report Button */}
            {displayApps.length > 0 && (
                <div className="flex justify-center mt-4 sm:mt-6">
    <button
      onClick={downloadExcel}
      className="bg-[#009500] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 transition flex items-center gap-2"
    >
      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download Excel Report
    </button>
  </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
