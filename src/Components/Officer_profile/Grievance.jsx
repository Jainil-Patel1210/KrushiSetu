import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';
import Header from '../User_Profile/Header';
import Settings from '../HomePage/Settings';
import api from '../User_Profile/api1';

const Grievance = () => {
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access");
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

      const response = await api.get("/support/grievances/my-assigned/", {
                    headers: { Authorization: `Bearer ${token}` },
                  });

      const formatted = response.data.map((g) => ({
        id: g.id,
        grievance_id: g.grievance_id,
        farmer_name: g.farmer_name || "Unknown Farmer",
        farmer_phone: g.user?.phone || "",
        farmer_email: g.user?.email || "",
        subject: g.subject,
        description: g.description,
        status: g.status,
        attachments: g.attachment_url
          ? [{ name: "attachment", url: g.attachment_url }]
          : [],
        created_at: g.created_at,
        updated_at: g.updated_at,
        officer_response: g.officer_remark || "",
      }));

      setGrievances(formatted);
      setFilteredGrievances(formatted);
      setError(null);
    } catch (err) {
      console.error("Error fetching grievances:", err);
      setError("Failed to load grievances assigned to you.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = grievances;
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(g => deriveStatusKey(g.status) === selectedFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.grievance_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredGrievances(filtered);
  }, [selectedFilter, searchTerm, grievances]);

  // Dashboard-style status logic
  const STATUS_LABELS = {
    approved: 'Approved',
    'under review': 'Under Review',
    rejected: 'Rejected',
    submitted: 'Pending',
    resolved: 'Resolved',
  };

  const STATUS_BUTTONS = [
    { key: 'all', label: 'All' },
    { key: 'approved', label: STATUS_LABELS.approved },
    { key: 'under review', label: STATUS_LABELS['under review'] },
    { key: 'resolved', label: STATUS_LABELS.resolved },
    { key: 'rejected', label: STATUS_LABELS.rejected, hideWhenZero: true },
  ];

  const deriveStatusKey = (rawStatus) => {
    const normalized = (rawStatus || '').toLowerCase();
    if (STATUS_LABELS[normalized]) {
      return normalized;
    }
    return 'submitted';
  };

  const deriveStatusLabel = (statusKey) => STATUS_LABELS[statusKey] || STATUS_LABELS.submitted;

  const statusCounts = React.useMemo(() => {
    const counts = {
      approved: 0,
      'under review': 0,
      resolved: 0,
      submitted: 0,
      rejected: 0,
    };
    grievances.forEach((item) => {
      const key = deriveStatusKey(item.status);
      if (counts[key] !== undefined) {
        counts[key] += 1;
      } else {
        counts.submitted += 1;
      }
    });
    return counts;
  }, [grievances]);

  const statusStyles = {
    Approved: 'bg-green-100 text-green-800',
    'Under Review': 'bg-sky-100 text-sky-800',
    Pending: 'bg-amber-100 text-amber-800',
    Rejected: 'bg-red-100 text-red-700',
    Resolved: 'bg-green-100 text-green-700',
  };

  function StatusBadge({ status }) {
    const cls = statusStyles[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${cls}`}>
        {status}
      </span>
    );
  }

  const handleViewDetails = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status);
    setResponseText('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGrievance(null);
    setResponseText('');
    setNewStatus('');
  };

  const handleUpdateGrievance = async () => {
    if (!responseText.trim()) {
      alert('Please provide a response to the farmer.');
      return;
    }

    try {
      setUpdating(true);

      const token = localStorage.getItem("access");

      await api.patch(
        `/support/grievances/${selectedGrievance.id}/officer-update/`,
        {
          status: newStatus,
          remark: responseText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      const updated = grievances.map((g) =>
        g.id === selectedGrievance.id
          ? {
              ...g,
              status: newStatus,
              officer_response: responseText,
              updated_at: new Date().toISOString(),
              resolution: newStatus.toLowerCase() === 'resolved' ? responseText : null
            }
          : g
      );

      setGrievances(updated);
      setFilteredGrievances(updated);

      alert("Grievance updated successfully!");
      handleCloseModal();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update grievance.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading grievances...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Settings />

      {/* MAIN PAGE */}
      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 pb-2 px-6">
          <h1 className="text-2xl md:text-3xl font-bold">Grievance Management</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Track and resolve farmer grievances
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-green-700 text-xl font-semibold mb-4">Farmer Grievances</h1>

            {/* SEARCH */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            {/* STATUS FILTER (Dashboard style) */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base w-full sm:w-auto mb-2 sm:mb-0">Filter by Status :</span>
                {STATUS_BUTTONS.map((button) => {
                  if (button.hideWhenZero && !statusCounts[button.key]) {
                    return null;
                  }
                  return (
                    <button
                      key={button.key}
                      onClick={() => setSelectedFilter(button.key)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 ${
                        selectedFilter === button.key
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {button.label}
                      {button.key !== 'all' && (
                        <span className="bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                          {statusCounts[button.key] || 0}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TABLE */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-3 text-left">Sr. No.</th>
                    <th className="px-4 py-3 text-left">Farmer Name</th>
                    <th className="px-4 py-3 text-left">Grievance ID</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">View</th>
                  </tr>
                </thead>

                <tbody>
                  {error ? (
                    <tr>
                      <td colSpan="6" className="text-center text-red-600 py-6">
                        {error}
                      </td>
                    </tr>
                  ) : filteredGrievances.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6">
                        No grievances found.
                      </td>
                    </tr>
                  ) : (
                    filteredGrievances.map((g, index) => (
                      <tr key={g.id} className="border-t">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{g.farmer_name}</td>
                        <td className="px-4 py-3">{g.grievance_id}</td>
                        <td className="px-4 py-3">{g.subject}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={deriveStatusLabel(deriveStatusKey(g.status))} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center">
                            <button
                              onClick={() => handleViewDetails(g)}
                              className="border border-green-500 px-3 py-1 rounded-full text-green-600 flex items-center justify-center hover:bg-green-50 transition"
                            >
                              <FaEye size={16} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="lg:hidden space-y-4">
              {filteredGrievances.map((g, index) => (
                <div key={g.id} className="p-4 border rounded-lg bg-white">
                  <p className="font-bold">{g.farmer_name}</p>
                  <p className="text-sm">{g.subject}</p>
                  <p className="text-xs text-gray-500">{g.grievance_id}</p>

                  <StatusBadge status={deriveStatusLabel(deriveStatusKey(g.status))} />

                  <button
                    onClick={() => handleViewDetails(g)}
                    className="w-full mt-3 border px-4 py-1 rounded-full text-green-600"
                  >
                    <FaEye /> View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6">

            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-2xl font-bold">Grievance Details</h2>
              <button onClick={handleCloseModal} className="text-2xl">×</button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-gray-600">Farmer</p>
                <p className="font-bold">{selectedGrievance.farmer_name}</p>
              </div>

              <div>
                <p className="text-gray-600">Subject</p>
                <p>{selectedGrievance.subject}</p>
              </div>

              <div>
                <p className="text-gray-600">Description</p>
                <p>{selectedGrievance.description}</p>
              </div>

              {selectedGrievance.attachments.length > 0 && (
                <div>
                  <p className="text-gray-600">Attachment</p>
                  <a
                    href={selectedGrievance.attachments[0].url}
                    target="_blank"
                    className="text-green-600 underline"
                  >
                    Download
                  </a>
                </div>
              )}

              {/* Officer Response */}
              {selectedGrievance.officer_response && (
                <div className="bg-blue-50 p-3 border-l-4 border-blue-600 rounded">
                  <h3 className="font-semibold">Previous Officer Remark</h3>
                  <p>{selectedGrievance.officer_response}</p>
                </div>
              )}

              {/* Update section */}
              <div className="bg-yellow-50 p-4 rounded border">
                <h3 className="font-semibold">Update Status</h3>

                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full mt-2 p-2 border rounded border-gray-300"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full mt-3 p-2 border rounded"
                  rows="4"
                  placeholder="Add officer remark..."
                />

                <button
                  onClick={handleUpdateGrievance}
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update & Send Response"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Grievance;
