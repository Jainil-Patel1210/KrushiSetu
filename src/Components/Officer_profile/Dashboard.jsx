import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../User_Profile/Header';
import Settings from '../HomePage/Settings';
import { AiOutlineEye, AiOutlineClose } from 'react-icons/ai';
import api from '../User_Profile/api1';

const STATUS_LABELS = {
  approved: 'Approved',
  under_review: 'Under Review',
  rejected: 'Rejected',
  submitted: 'Pending',
};

const DOCUMENT_STATUS_LABELS = {
  verified: 'Verified',
  rejected: 'Rejected',
  pending: 'Pending',
};

const STATUS_BUTTONS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: STATUS_LABELS.approved },
  { key: 'under_review', label: STATUS_LABELS.under_review },
  { key: 'submitted', label: STATUS_LABELS.submitted },
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

const deriveDocumentStatusLabel = (rawStatus) => {
  const normalized = (rawStatus || '').toLowerCase();
  return DOCUMENT_STATUS_LABELS[normalized] || DOCUMENT_STATUS_LABELS.pending;
};

const Dashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('submitted');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [officerNote, setOfficerNote] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/subsidy/officer/dashboard/');
      setApplications(response.data);
    } catch (err) {
      console.error('Failed to fetch subsidy applications', err);
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Unable to load applications.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerifyDocuments = async (verified) => {
    try {
      setProcessingAction(true);
      await api.post(
        `/subsidy/officer/applications/${selectedApplication.id}/documents/verify/`,
        { verified }
      );
      await loadApplicationDetail(selectedApplication.id);
    } catch (err) {
      setDetailError("Failed to update document status.");
    } finally {
      setProcessingAction(false);
    }
  };


  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setOfficerNote('');
    setDetailError(null);
  };

  const loadApplicationDetail = useCallback(async (applicationId) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      const [detailResponse, documentsResponse] = await Promise.all([
        api.get(`/subsidy/officer/applications/${applicationId}/`),
        api.get(`/subsidy/officer/applications/${applicationId}/documents/`),
      ]);

      setSelectedApplication({
        ...detailResponse.data,
        documents: documentsResponse.data,
      });
      setOfficerNote(detailResponse.data.officer_note || '');
    } catch (err) {
      console.error('Failed to load application details', err);
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Unable to load application details.';
      setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleView = (row) => {
    setShowModal(true);
    loadApplicationDetail(row.id);
  };

  const handleAction = async (statusValue, extra = {}) => { 
    if (!selectedApplication) return;
    setProcessingAction(true);
    setDetailError(null);
    try {
      const { data } = await api.post(
        `/subsidy/officer/applications/${selectedApplication.id}/review/`,
        {
          status: statusValue,
          officer_comment: officerNote || '',
          ...extra,
        }
      );


      await fetchApplications();
      await loadApplicationDetail(selectedApplication.id);
      if (data?.status) {
        const statusKey = deriveStatusKey(data.status);
        setSelectedFilter(statusKey);
      }
    } catch (err) {
      console.error(`Failed to ${endpoint}`, err);
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        `Unable to ${endpoint.replace(/-/g, ' ')}.`;
      setDetailError(message);
    } finally {
      setProcessingAction(false);
    }
  };

    const handleApprove = () =>
      handleAction("Approved");

    const handleReject = () =>
      handleAction("Rejected");

    const handleMarkUnderReview = () =>
      handleAction("Under Review");


  const normalizedApplications = useMemo(() => {
    return applications.map((app, index) => {
      const statusKey = deriveStatusKey(app.status || app.status_display);
      return {
        srNo: index + 1,
        id: app.id,
        applicationId: `APP-${app.id}`,
        farmerName: app.full_name || app.user_name || 'N/A',
        schemeName: app.subsidy_name || app.subsidy_title || 'N/A',

        statusKey,
        statusLabel: deriveStatusLabel(statusKey),
        submittedAt: app.submitted_at,
      };
    });
  }, [applications]);

  const statusCounts = useMemo(() => {
    const counts = {
      approved: 0,
      under_review: 0,
      submitted: 0,
      rejected: 0,
    };
    normalizedApplications.forEach((item) => {
      if (counts[item.statusKey] !== undefined) {
        counts[item.statusKey] += 1;
      } else {
        counts.submitted += 1;
      }
    });
    return counts;
  }, [normalizedApplications]);

  const filteredData = useMemo(() => {
    if (selectedFilter === 'all') return normalizedApplications;
    return normalizedApplications.filter((item) => item.statusKey === selectedFilter);
  }, [normalizedApplications, selectedFilter]);

  const statusStyles = {
    Approved: 'bg-green-100 text-green-800',
    'Under Review': 'bg-sky-100 text-sky-800',
    Pending: 'bg-amber-100 text-amber-800',
    Rejected: 'bg-red-100 text-red-700',
  };

  function StatusBadge({ status }) {
    const cls = statusStyles[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${cls}`}>
        {status}
      </span>
    );
  }

  function ViewButton({ onClick }) {
    return (
      <button
        onClick={onClick}
        className="border-2 border-green-500 text-green-600 rounded-full px-4 py-1 text-sm font-medium hover:bg-green-50 flex items-center gap-1 w-full sm:w-auto justify-center"
      >
        <AiOutlineEye className="h-4 w-4" />
        <span>View</span>
      </button>
    );
  }

  return (
    <>
      <Header />
      <Settings />
      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Application Dashboard</h1>
          <p className="text-[#77797C] font-semibold mt-2 text-sm sm:text-base lg:text-lg">
            Review and Manage Farmer Subsidy Applications
          </p>
        </div>

        {loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center text-gray-600">
              Loading applications…
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="bg-red-100 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h1 className="text-green-700 text-xl sm:text-2xl font-bold mb-4">Farmer Subsidy Application</h1>

            <div className="mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
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

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left text-base lg:text-lg text-gray-700">
                    <th className="px-4 py-3">Sr. No.</th>
                    <th className="px-4 py-3">Farmer Name</th>
                    <th className="px-4 py-3">Scheme Name</th>
                    <th className="px-4 py-3">Application ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                        No applications found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row) => (
                      <tr key={row.id} className="border-t border-[#D8D8D8] font-semibold text-[#363636] text-base lg:text-lg">
                        <td className="px-4 py-3">{row.srNo}</td>
                        <td className="px-4 py-3">{row.farmerName}</td>
                        <td className="px-4 py-3">{row.schemeName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.applicationId}</td>
                        <td className="px-4 py-3">
                          {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.statusLabel} />
                        </td>
                        <td className="px-4 py-3">
                          <ViewButton onClick={() => handleView(row)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {filteredData.length === 0 ? (
                <div className="p-6 text-center text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                  No applications found.
                </div>
              ) : (
                filteredData.map((row) => (
                  <div key={row.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Sr. No. {row.srNo}</p>
                        <h3 className="font-bold text-gray-800 text-base sm:text-lg">{row.farmerName}</h3>
                        <p className="text-sm text-gray-700 mt-1">{row.schemeName}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{row.applicationId}</p>
                      </div>
                      <StatusBadge status={row.statusLabel} />
                    </div>

                    <div className="text-sm mb-3">
                      <p className="text-gray-600 font-medium">Submitted</p>
                      <p className="font-semibold text-gray-800">
                        {row.submittedAt
                          ? new Date(row.submittedAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleView(row)}
                      className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors w-full sm:w-auto"
                    >
                      <AiOutlineEye className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-height-[90vh] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Application Details</h2>
                {selectedApplication && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                    #{selectedApplication.id} • {selectedApplication.subsidy_title}
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl flex-shrink-0"
                aria-label="Close"
              >
                <AiOutlineClose />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-6 text-center text-gray-600">Loading details…</div>
            ) : detailError ? (
              <div className="p-6">
                <div className="bg-red-100 border border-red-200 text-red-700 rounded-lg p-4">
                  {detailError}
                </div>
              </div>
            ) : selectedApplication ? (
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-3 items-center">
                  <StatusBadge status={deriveStatusLabel(deriveStatusKey(selectedApplication.status))} />
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700">
                    Documents: {deriveDocumentStatusLabel(selectedApplication.document_status)}
                  </span>
                  {selectedApplication.assigned_officer_name && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                      Assigned to: {selectedApplication.assigned_officer_name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicant</h3>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedApplication.applicant_name}</p>
                    <p className="text-sm text-gray-600 mt-2">Email</p>
                    <p className="font-medium text-gray-900">{selectedApplication.applicant_email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Subsidy</h3>
                    <p className="text-sm text-gray-600">Scheme</p>
                    <p className="font-medium text-gray-900">{selectedApplication.subsidy_title}</p>
                    <p className="text-sm text-gray-600 mt-2">Submitted</p>
                    <p className="font-medium text-gray-900">
                      {selectedApplication.submitted_at
                        ? new Date(selectedApplication.submitted_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>

                {selectedApplication.application_note && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Farmer Note</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedApplication.application_note}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedApplication.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-lg p-3 bg-gray-50"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{doc.document_type}</p>
                            <p className="text-sm text-gray-600">
                              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-3 items-center">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedApplication.document_status === "Verified"
                                  ? "bg-green-100 text-green-700"
                                  : selectedApplication.document_status === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {selectedApplication.document_status || "Pending"}
                            </span>

                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 text-sm font-semibold"
                              >
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 italic">No documents uploaded.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Officer Notes</label>
                  <textarea
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    rows={4}
                    placeholder="Add remarks for the applicant…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {detailError && (
                  <div className="bg-red-100 border border-red-200 text-red-700 rounded-lg p-3">{detailError}</div>
                )}

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 justify-end pt-4 border-t">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 order-last sm:order-first"
                    disabled={processingAction}
                  >
                    Close
                  </button>
                  {selectedApplication.status === 'submitted' && (
                    <button
                      onClick={handleMarkUnderReview}
                      disabled={processingAction}
                      className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                    >
                      Mark Under Review
                    </button>
                  )}
                  {selectedApplication.document_status !== 'verified' && (
                    <>
                      <button
                        onClick={() => handleVerifyDocuments(true)}
                        disabled={processingAction}
                        className="px-3 sm:px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 text-sm sm:text-base"
                      >
                        Mark Documents Verified
                      </button>
                      <button
                        onClick={() => handleVerifyDocuments(false)}
                        disabled={processingAction}
                        className="px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 text-sm sm:text-base"
                      >
                        Flag Documents
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleApprove}
                    disabled={processingAction}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processingAction}
                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
