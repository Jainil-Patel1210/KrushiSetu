import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';
import Header from '../User_Profile/Header'
import Settings from '../HomePage/Settings'


const Grievance = () => {
  // Hardcoded demo data with different statuses
  const demoGrievances = [
    {
      id: 1,
      grievance_id: 'GRV-2024-001',
      farmer_name: 'Rajesh Kumar',
      farmer_phone: '+91 98765 43210',
      farmer_email: 'rajesh.kumar@example.com',
      subject: 'Subsidy Payment Delay',
      description: 'Applied for PM-KISAN subsidy 3 months ago, but payment not received yet. I have submitted all required documents and my application was approved, but the amount has not been credited to my bank account.',
      status: 'Pending',
      category: 'Subsidy',
      attachments: [
        { name: 'application_receipt.pdf', url: '#' },
        { name: 'bank_statement.pdf', url: '#' }
      ],
      created_at: '2024-08-15T10:30:00Z',
      updated_at: '2024-08-15T10:30:00Z'
    },
    {
      id: 2,
      grievance_id: 'GRV-2024-002',
      farmer_name: 'Priya Sharma',
      farmer_phone: '+91 87654 32109',
      farmer_email: 'priya.sharma@example.com',
      subject: 'Crop Insurance Claim Rejected',
      description: 'My crop insurance claim was rejected without proper explanation. Need clarification on the reason for rejection. The entire crop was damaged due to heavy rainfall but claim was denied.',
      status: 'Under Review',
      category: 'Insurance',
      attachments: [
        { name: 'crop_damage_photos.zip', url: '#' },
        { name: 'insurance_policy.pdf', url: '#' },
        { name: 'rejection_letter.pdf', url: '#' }
      ],
      created_at: '2024-09-20T14:45:00Z',
      updated_at: '2024-10-05T09:15:00Z'
    },
    {
      id: 3,
      grievance_id: 'GRV-2024-003',
      farmer_name: 'Amit Patel',
      farmer_phone: '+91 76543 21098',
      farmer_email: 'amit.patel@example.com',
      subject: 'Fertilizer Subsidy Issue',
      description: 'Not receiving full subsidy amount on fertilizer purchase as per scheme guidelines. According to the scheme, I should receive 50% subsidy but only received 30%.',
      status: 'Resolved',
      category: 'Subsidy',
      resolution: 'Issue resolved. Full subsidy amount has been credited to the farmer\'s account. The delay was due to a calculation error in the system which has been corrected.',
      attachments: [
        { name: 'fertilizer_bill.pdf', url: '#' }
      ],
      created_at: '2024-07-10T11:20:00Z',
      updated_at: '2024-08-01T16:30:00Z'
    },
    {
      id: 4,
      grievance_id: 'GRV-2024-004',
      farmer_name: 'Sunita Devi',
      farmer_phone: '+91 65432 10987',
      farmer_email: 'sunita.devi@example.com',
      subject: 'Land Record Correction',
      description: 'Land records showing incorrect area. Need correction for subsidy application. My actual land holding is 5 acres but records show only 3 acres.',
      status: 'Pending',
      category: 'Land Records',
      attachments: [
        { name: 'land_documents.pdf', url: '#' },
        { name: 'survey_report.pdf', url: '#' }
      ],
      created_at: '2024-10-25T08:15:00Z',
      updated_at: '2024-10-25T08:15:00Z'
    },
    {
      id: 5,
      grievance_id: 'GRV-2024-005',
      farmer_name: 'Vikram Singh',
      farmer_phone: '+91 54321 09876',
      farmer_email: 'vikram.singh@example.com',
      subject: 'Soil Health Card Not Received',
      description: 'Applied for soil health card 6 months ago but still not received. Need this urgently to apply for fertilizer subsidy scheme.',
      status: 'Under Review',
      category: 'Soil Health',
      attachments: [],
      created_at: '2024-09-05T13:00:00Z',
      updated_at: '2024-10-20T11:45:00Z'
    },
    {
      id: 6,
      grievance_id: 'GRV-2024-006',
      farmer_name: 'Meena Gupta',
      farmer_phone: '+91 43210 98765',
      farmer_email: 'meena.gupta@example.com',
      subject: 'Drip Irrigation Subsidy Approved',
      description: 'Thank you for resolving my drip irrigation subsidy application issue. The subsidy has been approved and amount credited successfully.',
      status: 'Resolved',
      category: 'Subsidy',
      resolution: 'Drip irrigation subsidy application processed successfully. Amount of ₹45,000 has been credited to the farmer\'s account.',
      attachments: [
        { name: 'approval_letter.pdf', url: '#' }
      ],
      created_at: '2024-08-01T09:30:00Z',
      updated_at: '2024-09-15T14:20:00Z'
    }
  ];

  const [grievances, setGrievances] = useState(demoGrievances);
  const [filteredGrievances, setFilteredGrievances] = useState(demoGrievances);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch grievances from backend (commented out for demo)
  useEffect(() => {
    // Uncomment below when backend is ready
    // fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';
      const response = await axios.get(`${BASE_URL}/support/api/grievances/`);
      setGrievances(response.data);
      setFilteredGrievances(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError('Failed to load grievances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter grievances by status
  useEffect(() => {
    let filtered = grievances;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(g => g.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Apply search filter
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
    const statusLower = status.toLowerCase();
    if (statusLower === 'resolved') return 'bg-green-100 text-green-700';
    if (statusLower === 'under review') return 'bg-blue-100 text-blue-700';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-700';
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
      
      // In production, this would be an API call
      const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';
      // await axios.patch(`${BASE_URL}/support/api/grievances/${selectedGrievance.id}/`, {
      //   status: newStatus,
      //   officer_response: responseText,
      //   updated_at: new Date().toISOString()
      // });

      // For demo: Update local state
      const updatedGrievances = grievances.map(g => 
        g.id === selectedGrievance.id 
          ? { 
              ...g, 
              status: newStatus,
              officer_response: responseText,
              updated_at: new Date().toISOString(),
              resolution: newStatus.toLowerCase() === 'resolved' ? responseText : g.resolution
            }
          : g
      );
      
      setGrievances(updatedGrievances);
      setFilteredGrievances(updatedGrievances.filter(g => {
        if (statusFilter !== 'all' && g.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
        if (searchTerm && !g.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !g.subject?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !g.grievance_id?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      }));

      alert('Grievance updated successfully! Farmer will be notified.');
      handleCloseModal();
    } catch (err) {
      console.error('Error updating grievance:', err);
      alert('Failed to update grievance. Please try again.');
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
      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Grievance Management
          </h1>
          <p className="text-[#77797C] font-semibold mt-2 text-sm sm:text-base lg:text-lg">
            Track and resolve farmer grievances
          </p>
        </div>

        {/* Farmer Grievances */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h1 className="text-green-700 text-xl sm:text-2xl font-bold mb-4">Farmer Grievances</h1>

            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search by Farmer Name, Subject, or Grievance ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter by Status */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-gray-700 font-semibold text-sm sm:text-base">Filter by Status :</span>
                
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setStatusFilter('resolved')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    statusFilter === 'resolved'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Resolved
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {getStatusCount('resolved')}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter('under review')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    statusFilter === 'under review'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Under Review
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {getStatusCount('under review')}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    statusFilter === 'pending'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Pending
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {getStatusCount('pending')}
                  </span>
                </button>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left text-base lg:text-lg text-gray-700">
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
                      <td colSpan="6" className="px-4 py-6 text-center text-red-600">{error}</td>
                    </tr>
                  ) : filteredGrievances.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No grievances found.</td>
                    </tr>
                  ) : (
                    filteredGrievances.map((grievance, index) => (
                      <tr key={grievance.id} className="border-t border-[#D8D8D8] font-semibold text-[#363636] text-base lg:text-lg">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{grievance.farmer_name || grievance.user?.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{grievance.grievance_id || `GRV${grievance.id}`}</td>
                        <td className="px-4 py-3">{grievance.subject}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${getStatusBadgeClass(grievance.status)}`}>
                            {grievance.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewDetails(grievance)}
                            className="border-2 border-green-500 text-green-600 rounded-full px-4 py-1 text-sm font-medium hover:bg-green-50 flex items-center gap-1 w-full sm:w-auto justify-center"
                          >
                            <FaEye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet card view */}
            <div className="lg:hidden space-y-4">
              {error ? (
                <div className="p-6 text-center text-red-600">{error}</div>
              ) : filteredGrievances.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No grievances found.</div>
              ) : (
                filteredGrievances.map((grievance, index) => (
                  <div key={grievance.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Sr. No. {index + 1}</p>
                        <h3 className="font-bold text-gray-800 text-base sm:text-lg">{grievance.farmer_name || grievance.user?.full_name || 'N/A'}</h3>
                        <p className="text-sm text-gray-700 mt-1">{grievance.subject}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{grievance.grievance_id || `GRV${grievance.id}`}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${getStatusBadgeClass(grievance.status)}`}>
                        {grievance.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleViewDetails(grievance)}
                      className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors w-full sm:w-auto"
                    >
                      <FaEye className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grievance Detail Modal */}
      {showModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Grievance Details</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedGrievance.grievance_id}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-4">
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(selectedGrievance.status)}`}>
                  {selectedGrievance.status}
                </span>
                {selectedGrievance.category && (
                  <span className="inline-flex px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {selectedGrievance.category}
                  </span>
                )}
              </div>

              {/* Farmer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Farmer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedGrievance.farmer_name}</p>
                  </div>
                  {selectedGrievance.farmer_phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedGrievance.farmer_phone}</p>
                    </div>
                  )}
                  {selectedGrievance.farmer_email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedGrievance.farmer_email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Grievance ID</p>
                    <p className="font-medium text-gray-900">{selectedGrievance.grievance_id}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subject</h3>
                <p className="text-gray-700">{selectedGrievance.subject}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedGrievance.description}</p>
              </div>

              {/* Attachments */}
              {selectedGrievance.attachments && selectedGrievance.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedGrievance.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="flex-1 text-gray-700 font-medium">{attachment.name}</span>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution (if resolved) */}
              {selectedGrievance.resolution && (
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Resolution</h3>
                  <p className="text-green-800 leading-relaxed">{selectedGrievance.resolution}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedGrievance.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedGrievance.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Previous Officer Response (if exists) */}
              {selectedGrievance.officer_response && (
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Previous Officer Response</h3>
                  <p className="text-blue-800 leading-relaxed">{selectedGrievance.officer_response}</p>
                </div>
              )}

              {/* Officer Action Section - Only show if not resolved */}
              {selectedGrievance.status.toLowerCase() !== 'resolved' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Update Grievance Status</h3>
                  
                  {/* Status Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Change Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Response Text Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response to Farmer *
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response to the farmer here. This will be sent to the farmer via email/SMS."
                      rows="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      The farmer will receive this response along with the updated status.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end gap-4">
              <button
                onClick={handleCloseModal}
                disabled={updating}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
              {selectedGrievance.status.toLowerCase() !== 'resolved' && (
                <button
                  onClick={handleUpdateGrievance}
                  disabled={updating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update & Send Response'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Grievance;
