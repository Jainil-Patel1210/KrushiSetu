// src/Subsidy_Provider/Report.jsx
// Report component for Subsidy Provider
// Built for: Desai Rudra
// Features:
// - fetch provider subsidies + applications (with token refresh)
// - show applications table (desktop) and mobile cards
// - show only date (YYYY-MM-DD) in Applied On column
// - includes Account Number and IFSC Code columns
// - download Excel export (includes Account Number & IFSC)
// - "Mark Payment Done" action for Approved -> Payment done (calls backend endpoint)
// - robust normalization of backend fields (tries many common keys)

import React, { useEffect, useState } from "react";
import Header from "../User_Profile/Header";
import Settings from "../HomePage/Settings";
import * as XLSX from "xlsx";

const SAMPLE_APPLICATIONS = [
  { id: 1, farmerName: "Rajesh Kumar", subsidyName: "Organic Farming Subsidy", applicationId: "APP2024001", date: "2024-01-15", status: "Approved", amount: "10000", accountNumber: "1234567890", ifscCode: "SBIN0001234" },
  { id: 2, farmerName: "Priya Singh", subsidyName: "Drip Irrigation Subsidy", applicationId: "APP2024002", date: "2024-02-10", status: "Approved", amount: "5000", accountNumber: "9876543210", ifscCode: "HDFC0005678" },
  { id: 3, farmerName: "Amit Patel", subsidyName: "Crop Insurance Premium", applicationId: "APP2024003", date: "2024-03-05", status: "Under Review", amount: "2500", accountNumber: "—", ifscCode: "—" },
  { id: 4, farmerName: "Sunita Verma", subsidyName: "Drip Irrigation Subsidy", applicationId: "APP2024004", date: "2024-03-12", status: "Pending", amount: "5000", accountNumber: "—", ifscCode: "—" },
  { id: 5, farmerName: "Vikram Sharma", subsidyName: "Organic Farming Subsidy", applicationId: "APP2024005", date: "2024-03-18", status: "Approved", amount: "12000", accountNumber: "111122223333", ifscCode: "PNB0001112" },
];

const STATUS_STYLES = {
  Approved: "bg-green-100 text-green-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
  "Payment done": "bg-gray-100 text-gray-700",
};

const readLocalToken = (keys = ["access", "access_token", "accessToken"]) => {
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
  const [busyAppIds, setBusyAppIds] = useState([]);

  const API_BASE = import.meta.env.VITE_BASE_URL || "";

  const SUBSIDIES_ENDPOINTS = [
    API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/my/` : "/api/subsidy_provider/subsidies/my/",
    API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/` : "/api/subsidy_provider/subsidies/",
    API_BASE ? `${API_BASE}/api/subsidies/my_subsidies/` : "/api/subsidies/my_subsidies/",
    API_BASE ? `${API_BASE}/subsidies/my_subsidies/` : "/subsidies/my_subsidies/",
  ];

  useEffect(() => {
    fetchProviderSubsAndApps();
    // eslint-disable-next-line
  }, []);

  async function fetchWithAutoRefresh(url, options = {}, triedRefresh = false) {
    const accessToken = readLocalToken();
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
    const res = await fetch(url, { ...options, headers, credentials: "include" });

    if (res.status === 401 && !triedRefresh) {
      const refreshToken = readLocalToken(["refresh", "refresh_token", "refreshToken"]);
      if (refreshToken) {
        try {
          const refreshUrl = API_BASE ? `${API_BASE}/api/token/refresh/` : "/api/token/refresh/";
          const r = await fetch(refreshUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
            credentials: "include",
          });
          if (r.ok) {
            const jd = await r.json();
            if (jd.access) {
              localStorage.setItem("access", jd.access);
              return fetchWithAutoRefresh(url, options, true);
            }
          } else {
            console.warn("Refresh failed", await r.text());
          }
        } catch (err) {
          console.error("Refresh error", err);
        }
      }
    }
    return res;
  }

  // normalize one application object
  function normalizeApplication(a, idx = 0, subsidyObj = null) {
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

    // account and ifsc — try many common keys
    const accountNumber = a.account_number || a.bank_account || a.accountNo || a.account || a.beneficiary_account || a.bank_account_number || a.account_number_masked || a.accountNumber || "—";
    const ifscCode = a.ifsc || a.ifsc_code || a.ifsc_code_masked || a.bank_ifsc || a.ifscode || a.ifscCode || "—";

    return {
      id: a.id ?? idx,
      farmerName,
      subsidyName,
      applicationId,
      date,
      status,
      amount,
      accountNumber,
      ifscCode,
      raw: a
    };
  }

  // Build candidate application endpoint templates for a subsidy id
  function applicationsEndpointForId(id) {
    const list = [
      API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/${id}/applications/` : `/api/subsidy_provider/subsidies/${id}/applications/`,
      API_BASE ? `${API_BASE}/api/subsidies/${id}/applications/` : `/api/subsidies/${id}/applications/`,
      API_BASE ? `${API_BASE}/subsidies/${id}/applications/` : `/subsidies/${id}/applications/`,
      API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/${id}/applications` : `/api/subsidy_provider/subsidies/${id}/applications`,
    ];
    return list;
  }

  async function fetchProviderSubsAndApps() {
    setLoading(true);
    setErrorMsg("");
    setApplications([]);

    let foundSubs = null;

    for (const url of SUBSIDIES_ENDPOINTS) {
      try {
        const res = await fetchWithAutoRefresh(url, { method: "GET" });
        const text = await res.text();
        if (!res.ok) continue;
        let data;
        try { data = text ? JSON.parse(text) : []; } catch (e) { continue; }
        const arr = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : null);
        if (!arr) continue;
        foundSubs = arr;
        break;
      } catch (err) {
        console.error("[Report] subsidies endpoint error", url, err);
      }
    }

    // fallback endpoints that might directly return applications
    if (!foundSubs) {
      const fallbackAppsEndpoints = [
        API_BASE ? `${API_BASE}/api/subsidy_provider/subsidies/my/applications/` : "/api/subsidy_provider/subsidies/my/applications/",
        API_BASE ? `${API_BASE}/api/subsidy/apply/` : "/api/subsidy/apply/",
        API_BASE ? `${API_BASE}/subsidy/apply/` : "/subsidy/apply/",
        API_BASE ? `${API_BASE}/api/subsidies/my_applications/` : "/api/subsidies/my_applications/",
      ];
      for (const u of fallbackAppsEndpoints) {
        try {
          const res = await fetchWithAutoRefresh(u, { method: "GET" });
          const text = await res.text();
          if (!res.ok) continue;
          let data;
          try { data = text ? JSON.parse(text) : []; } catch (e) { continue; }
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
    }

    if (Array.isArray(foundSubs) && foundSubs.length > 0) {
      const promises = foundSubs.map(async (sub) => {
        const subsidyId = sub.id ?? sub.pk ?? sub.subsidy_id;
        const candidates = applicationsEndpointForId(subsidyId);
        for (const ep of candidates) {
          try {
            const r = await fetchWithAutoRefresh(ep, { method: "GET" });
            const txt = await r.text();
            if (!r.ok) continue;
            let d;
            try { d = txt ? JSON.parse(txt) : []; } catch (e) { continue; }
            const items = Array.isArray(d) ? d : (Array.isArray(d.results) ? d.results : null);
            if (!items) continue;
            const normalizedApps = items.map((a, idx) => normalizeApplication(a, idx, sub));
            return normalizedApps;
          } catch (err) {
            continue;
          }
        }
        return [];
      });

      const settled = await Promise.allSettled(promises);
      const combined = [];
      for (const s of settled) {
        if (s.status === "fulfilled" && Array.isArray(s.value)) {
          combined.push(...s.value);
        }
      }

      if (combined.length > 0) {
        combined.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        setApplications(combined);
        setLoading(false);
        return;
      }
    }

    setApplications(SAMPLE_APPLICATIONS);
    setErrorMsg("Unable to fetch provider subsidies/applications from backend — showing sample data. Check console for more info.");
    setLoading(false);
  }

  function sanitizeInput(input) {
    return input.replace(/[^a-zA-Z0-9\s-]/g, "");
  }
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

  const totalApplications = displayApps.length;
  const approved = displayApps.filter((app) => (app.status || "").toLowerCase() === "approved").length;
  const underReview = displayApps.filter((app) => (app.status || "").toLowerCase() === "under review").length;
  const pending = displayApps.filter((app) => (app.status || "").toLowerCase() === "pending").length;
  const rejected = displayApps.filter((app) => (app.status || "").toLowerCase() === "rejected").length;

  const getStatusColor = (status) => STATUS_STYLES[status] || "bg-gray-100 text-gray-700";

  function downloadExcel() {
    if (!applications || applications.length === 0) {
      alert("No application data available to download.");
      return;
    }

    const excelData = applications.map((app, index) => ({
      "Sr No.": index + 1,
      "Farmer Name": app.farmerName,
      "Subsidy Name": app.subsidyName,
      "Application ID": app.applicationId,
      "Applied On": app.date,
      "Status": app.status,
      "Amount": app.amount,
      "Account Number": app.accountNumber || "—",
      "IFSC Code": app.ifscCode || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, "Subsidy_Applications_Report.xlsx");
  }

  async function markPaymentDoneRequest(applicationId) {
    const url = API_BASE ? `${API_BASE}/subsidy/applications/${applicationId}/mark_payment_done/` : `/api/applications/${applicationId}/mark_payment_done/`;
    const access = readLocalToken();
    const headers = {
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {})
    };
    const res = await fetch(url, { method: "POST", headers, credentials: "include" });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || `Failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  async function handleMarkPaymentDone(appId) {
  if (!window.confirm("Mark this application as 'Payment done'? This is irreversible.")) return;

  // mark busy
  setBusyAppIds((s) => [...s, appId]);

  // optimistic update: force status locally so row never disappears
  let previousApps = [];
  setApplications((prev) => {
    previousApps = prev;
    return prev.map((a) =>
      String(a.id) === String(appId) ? { ...a, status: "Payment done" } : a
    );
  });

  try {
    // call backend (we don't strictly rely on its returned object)
    await markPaymentDoneRequest(appId);

    // success: keep optimistic change (optionally merge backend response if it has useful fields)
    // let backendData = await markPaymentDoneRequest(appId);
    // if you want to merge: setApplications(prev => prev.map(a => a.id===appId? normalizeApplication(backendData): a));
  } catch (err) {
    // revert to previous apps state on error
    setApplications(previousApps);
    console.error("Mark payment failed", err);
    alert("Error: " + (err.message || "Failed to mark payment"));
  } finally {
    // unmark busy
    setBusyAppIds((s) => s.filter((x) => x !== appId));
  }
}


  return (
    <>
      <Header />
      <Settings />

      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Application Reports</h1>
              <p className="text-[#77797C] font-semibold mt-1 sm:mt-2 text-xs sm:text-sm md:text-base lg:text-lg">
                View and Analyze Subsidy Scheme Applications
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <button onClick={downloadExcel} className="bg-[#009500] text-white px-3 py-2 rounded-md text-sm hover:bg-green-700">
                Download Excel Report
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Subsidy, Farmer Name, Application ID, Status or Date..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 pr-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                {searchQuery && (
                  <button type="button" onClick={handleClearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                )}
              </div>
              <button type="submit" className="bg-[#009500] text-xs sm:text-sm md:text-base text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition whitespace-nowrap">
                Search
              </button>
            </form>

            {errorMsg && <div className="mb-3 text-sm text-red-600">{errorMsg}</div>}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-2">
                <p className="text-gray-600 text-xs font-semibold mb-1">Total Applications</p>
                <p className="text-lg font-bold">{totalApplications}</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2">
                <p className="text-gray-600 text-xs font-semibold mb-1">Approved</p>
                <p className="text-lg font-bold text-green-700">{approved} <span className="text-xs">({totalApplications>0?((approved/totalApplications)*100).toFixed(1):0}%)</span></p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2">
                <p className="text-gray-600 text-xs font-semibold mb-1">Under Review</p>
                <p className="text-lg font-bold text-blue-700">{underReview} <span className="text-xs">({totalApplications>0?((underReview/totalApplications)*100).toFixed(1):0}%)</span></p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2">
                <p className="text-gray-600 text-xs font-semibold mb-1">Pending</p>
                <p className="text-lg font-bold text-yellow-700">{pending} <span className="text-xs">({totalApplications>0?((pending/totalApplications)*100).toFixed(1):0}%)</span></p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2">
                <p className="text-gray-600 text-xs font-semibold mb-1">Rejected</p>
                <p className="text-lg font-bold text-red-700">{rejected} <span className="text-xs">({totalApplications>0?((rejected/totalApplications)*100).toFixed(1):0}%)</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <h2 className="text-lg font-bold text-green-700 mb-3">Subsidy Applications</h2>

            {loading ? (
              <div className="py-8 text-center">Loading applications...</div>
            ) : displayApps.length === 0 ? (
              <div className="text-center py-6">
                <p className="mt-3 text-sm text-gray-500">No applications found matching your search.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr className="text-left font-bold text-gray-700">
                        <th className="px-3 py-3">Sr. No.</th>
                        <th className="px-3 py-3">Farmer Name</th>
                        <th className="px-3 py-3">Subsidy Name</th>
                        <th className="px-3 py-3">Application ID</th>
                        <th className="px-3 py-3">Applied On</th>
                        <th className="px-3 py-3">Account Number</th>
                        <th className="px-3 py-3">IFSC Code</th>
                        <th className="px-3 py-3">Status / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayApps.map((app, index) => (
                        <tr key={app.id ?? index} className="hover:bg-gray-50">
                          <td className="px-3 py-3 text-sm">{index + 1}</td>
                          <td className="px-3 py-3 text-sm font-medium">{app.farmerName}</td>
                          <td className="px-3 py-3 text-sm">{app.subsidyName}</td>
                          <td className="px-3 py-3 text-sm">{app.applicationId}</td>
                          <td className="px-3 py-3 text-sm">{app.date}</td>
                          <td className="px-3 py-3 text-sm">{app.accountNumber || "—"}</td>
                          <td className="px-3 py-3 text-sm">{app.ifscCode || "—"}</td>
                          <td className="px-3 py-3">
                            {String(app.status || "").toLowerCase() === "approved" ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                  {app.status}
                                </span>
                                <button
                                  onClick={() => handleMarkPaymentDone(app.id)}
                                  disabled={busyAppIds.includes(app.id)}
                                  className="ml-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-2 py-1 rounded"
                                  title="Mark as Payment done"
                                >
                                  {busyAppIds.includes(app.id) ? "Processing..." : "Mark Payment Done"}
                                </button>
                              </div>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view */}
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
                          <span className="font-medium">Applied On:</span>
                          <span>{app.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Account No.:</span>
                          <span>{app.accountNumber || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">IFSC:</span>
                          <span>{app.ifscCode || "—"}</span>
                        </div>
                      </div>

                      {String(app.status || "").toLowerCase() === "approved" && (
                        <div className="mt-2">
                          <button
                            onClick={() => handleMarkPaymentDone(app.id)}
                            disabled={busyAppIds.includes(app.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded"
                          >
                            {busyAppIds.includes(app.id) ? "Processing..." : "Mark Payment Done"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
