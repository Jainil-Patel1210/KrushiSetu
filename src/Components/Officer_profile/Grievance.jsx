import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';
import Header from '../User_Profile/Header';
import Settings from '../HomePage/Settings';
import api from '../User_Profile/api1';

const Grievance = () => {
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]); 
  const [statusFilter, setStatusFilter] = useState('all');
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

      console.log(response.data);

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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(g => g.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.grievance_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGrievances(filtered);
  }, [statusFilter, searchTerm, grievances]);

  const getStatusBadgeClass = (status) => {
    const s = status.toLowerCase();
    if (s === 'approved') return 'bg-green-100 text-green-700';
    if (s === 'under review') return 'bg-blue-100 text-blue-700';
    if (s === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusCount = (status) => {
    if (status === 'all') return grievances.length;
    return grievances.filter(g => g.status.toLowerCase() === status.toLowerCase()).length;
  };

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
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold">Grievance Management</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Track and resolve farmer grievances
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-green-700 text-2xl font-bold mb-4">Farmer Grievances</h1>

            {/* SEARCH */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border rounded-lg"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            {/* STATUS FILTER */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 flex flex-wrap gap-3">
              <span className="font-semibold text-gray-700">Filter by Status :</span>

              {["all", "approved", "under review", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    statusFilter === s
                      ? "bg-green-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* TABLE */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-3">Sr. No.</th>
                    <th className="px-4 py-3">Farmer Name</th>
                    <th className="px-4 py-3">Grievance ID</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">View</th>
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
                          <span className={`px-2 py-1 rounded-lg text-sm ${getStatusBadgeClass(g.status)}`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewDetails(g)}
                            className="border px-4 py-1 rounded-full text-green-600"
                          >
                            <FaEye />
                          </button>
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

                  <span className={`mt-2 inline-block px-2 py-1 rounded-lg ${getStatusBadgeClass(g.status)}`}>
                    {g.status}
                  </span>

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
                  className="w-full mt-2 p-2 border rounded"
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
