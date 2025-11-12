import React, { useState, useEffect } from 'react';
import Header from '../User_Profile/Header';
import Settings from '../HomePage/Settings';
import {
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineClose,
  AiOutlinePlus,
} from "react-icons/ai";
import { FaRupeeSign, FaCalendarAlt, FaFileAlt, FaClipboardList } from "react-icons/fa";
import {
  getMySubsidies,
  createSubsidy,
  updateSubsidy,
  deleteSubsidy
} from './api/subsidyApi';

// List of all possible document types
const DOC_TYPES = [
  { value: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque' },
  { value: 'scope_certificate', label: 'Scope Certificate of Organic Farming' },
  { value: 'annexure_copy', label: 'Copy of Annexure in Group Certification' },
  { value: 'residue_testing_receipt', label: 'Receipt of fee paid for residue testing' },
  { value: 'divyang_certificate', label: 'Copy of Divyang Certificate (if applicable)' },
  { value: 'joint_account_construction', label: "Joint Account Holder's Construction Letter" },
  { value: 'residue_testing_copy', label: 'Copy of residue testing' },
  { value: 'aadhar_card', label: 'Aadhar Card' },
  { value: 'land_records', label: 'Copy of 7/12 and 8-A' }
];

const Dashboard = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubsidy, setSelectedSubsidy] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    application_start_date: '',
    application_end_date: '',
    description: '',
    documents_required: []
  });
  const [customDocument, setCustomDocument] = useState('');
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch subsidies
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMySubsidies();
        setSubsidies(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching subsidies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-center py-10">Loading subsidies...</p>;

  const handleAddClick = () => {
    setFormData({
      title: '',
      amount: '',
      application_start_date: '',
      application_end_date: '',
      description: '',
      documents_required: []
    });
    setCustomDocument('');
    setShowAddModal(true);
  };

  const handleUpdateClick = (subsidy) => {
    setSelectedSubsidy(subsidy);
    setFormData({
      title: subsidy.title,
      amount: subsidy.amount,
      application_start_date: subsidy.application_start_date,
      application_end_date: subsidy.application_end_date,
      description: subsidy.description,
      documents_required: subsidy.documents_required || []
    });
    setCustomDocument('');
    setShowUpdateModal(true);
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setSelectedSubsidy(null);
    setFormData({
      title: '',
      amount: '',
      application_start_date: '',
      application_end_date: '',
      description: '',
      documents_required: []
    });
    setCustomDocument('');
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      title: '',
      amount: '',
      application_start_date: '',
      application_end_date: '',
      description: '',
      documents_required: []
    });
    setCustomDocument('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentSelect = (e) => {
    const selectedDoc = e.target.value;
    if (selectedDoc && !formData.documents_required.includes(selectedDoc)) {
      setFormData((prev) => ({
        ...prev,
        documents_required: [...prev.documents_required, selectedDoc]
      }));
    }
    e.target.value = '';
  };

  const handleAddCustomDocument = () => {
    if (customDocument.trim() && !formData.documents_required.includes(customDocument.trim())) {
      setFormData((prev) => ({
        ...prev,
        documents_required: [...prev.documents_required, customDocument.trim()]
      }));
      setCustomDocument('');
    }
  };

  const handleRemoveDocument = (docToRemove) => {
    setFormData((prev) => ({
      ...prev,
      documents_required: prev.documents_required.filter((doc) => doc !== docToRemove)
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount.replace(/[₹,]/g, "")) || 0,
        application_start_date: formData.application_start_date,
        application_end_date: formData.application_end_date,
        documents_required: formData.documents_required,
        eligibility: []
      };
      const updated = await updateSubsidy(selectedSubsidy.id, payload);
      setSubsidies((prev) =>
        prev.map((sub) => (sub.id === updated.id ? updated : sub))
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error updating subsidy:", error);
      alert("Failed to update subsidy!");
    }
  };

  const handleAddSubsidy = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount.replace(/[₹,]/g, "")) || 0,
        application_start_date: formData.application_start_date,
        application_end_date: formData.application_end_date,
        documents_required: formData.documents_required,
        eligibility: []
      };
      const newSubsidy = await createSubsidy(payload);
      setSubsidies([...subsidies, newSubsidy]);
      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding subsidy:", error.response?.data || error);
      alert("Failed to add subsidy!");
    }
  };

  const handleRemoveClick = (subsidy) => {
    setSelectedSubsidy(subsidy);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSubsidy(selectedSubsidy.id);
      setSubsidies(subsidies.filter((sub) => sub.id !== selectedSubsidy.id));
      setShowDeleteModal(false);
      setSelectedSubsidy(null);
    } catch (error) {
      console.error("Error deleting subsidy:", error);
      alert("Failed to delete subsidy!");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedSubsidy(null);
  };

  const getAvailableDocuments = () => {
    return DOC_TYPES.filter((doc) => !formData.documents_required.includes(doc.label));
  };

  return (
    <>
      <Header />
      <Settings />
      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Subsidy Management
              </h1>
              <p className="text-[#77797C] font-semibold mt-2 text-sm sm:text-base lg:text-lg">
                Add, Update and Manage Subsidy Schemes
              </p>
            </div>
            <button
              onClick={handleAddClick}
              className="mt-4 sm:mt-0 bg-[#009500] hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span className="text-xl font-bold">+</span>
              Add New Subsidy
            </button>
          </div>

          {/* Subsidy Cards */}
          <div className="space-y-4">
            {subsidies.map((subsidy) => (
              <div key={subsidy.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#006400]">
                    {subsidy.title}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateClick(subsidy)}
                      className="flex items-center gap-1 px-4 py-2 border-3 font-semibold border-[#009500] text-[#009500] rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <AiOutlineEdit className="text-xl" />
                      Update
                    </button>
                    <button
                      onClick={() => handleRemoveClick(subsidy)}
                      className="flex items-center gap-1 px-4 py-2 border-3 font-semibold border-[#E7000B] text-[#E7000B] rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <AiOutlineDelete className="text-xl" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <FaRupeeSign className="text-green-600 text-xl mt-1" />
                    <div>
                      <span className="font-semibold">Amount : </span>
                      <span>{subsidy.amount}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FaCalendarAlt className="text-green-600 text-xl mt-1" />
                    <div>
                      <span className="font-semibold">Start Date : </span>
                      <span>{subsidy.application_start_date}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FaCalendarAlt className="text-green-600 text-xl mt-1" />
                    <div>
                      <span className="font-semibold">End Date : </span>
                      <span>{subsidy.application_end_date}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FaFileAlt className="text-green-600 text-xl mt-1" />
                    <div>
                      <span className="font-semibold">Description :</span>
                      <p className="text-gray-700 mt-1">{subsidy.description}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FaClipboardList className="text-green-600 text-xl mt-1" />
                    <div>
                      <span className="font-semibold">Required Documents:</span>
                      <ul className="text-gray-700 mt-1 list-disc list-inside">
                        {subsidy.documents_required?.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Subsidy Modal */}
              {showAddModal && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                          <div className="flex justify-between items-center p-6 border-b">
                              <h2 className="text-2xl font-bold text-[#006400]">Add New Subsidy</h2>
                              <button 
                                  onClick={handleCloseAddModal}
                                  className="text-gray-500 hover:text-gray-700"
                              >
                                  <AiOutlineClose className="text-2xl" />
                              </button>
                          </div>
      
                          <div className="p-6 space-y-4">
                              <div>
                                  <label className="block font-semibold mb-2">Subsidy Name</label>
                                  <input 
                                      type="text"
                                      name="title"
                                      value={formData.title}
                                      onChange={handleInputChange}
                                      placeholder="Enter subsidy name"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">Amount</label>
                                  <input 
                                      type="text"
                                      name="amount"
                                      value={formData.amount}
                                      onChange={handleInputChange}
                                      placeholder="e.g., ₹10,000 or ₹5,000/year"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">Start Date</label>
                                  <input 
                                      type="date"
                                      name="application_start_date"
                                      value={formData.application_start_date}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">End Date</label>
                                  <input 
                                      type="date"
                                      name="application_end_date"
                                      value={formData.application_end_date}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">Description</label>
                                  <textarea 
                                      rows="4"
                                      name="description"
                                      value={formData.description}
                                      onChange={handleInputChange}
                                      placeholder="Enter subsidy description"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">Required Documents</label>
                                  <select
                                      onChange={handleDocumentSelect}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  >
                                      <option value="">-- Select Document --</option>
                                      {getAvailableDocuments().map(doc => (
                                          <option key={doc.value} value={doc.label}>{doc.label}</option>
                                      ))}
                                  </select>
      
                                  {/* Custom Document Input */}
                                  <div className="flex gap-2 mt-3">
                                      <input
                                          type="text"
                                          value={customDocument}
                                          onChange={(e) => setCustomDocument(e.target.value)}
                                          placeholder="Add custom document"
                                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomDocument())}
                                      />
                                      <button
                                          type="button"
                                          onClick={handleAddCustomDocument}
                                          className="px-4 py-2 bg-[#009500] text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                      >
                                          <AiOutlinePlus className="text-lg" />
                                          Add
                                      </button>
                                  </div>
      
                                  {/* Selected Documents */}
                                  {formData.documents_required.length > 0 && (
                                      <div className="mt-3 space-y-2">
                                          {formData.documents_required.map((doc, index) => (
                                              <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                                                  <span className="text-sm">{doc}</span>
                                                  <button
                                                      type="button"
                                                      onClick={() => handleRemoveDocument(doc)}
                                                      className="text-red-600 hover:text-red-800"
                                                  >
                                                      <AiOutlineClose />
                                                  </button>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
      
                              <div className="flex gap-3 pt-4">
                                  <button 
                                      onClick={handleAddSubsidy}
                                      className="flex-1 bg-[#009500] hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                  >
                                      Add Subsidy
                                  </button>
                                  <button 
                                      onClick={handleCloseAddModal}
                                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                                  >
                                      Cancel
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
      
              {/* Update Subsidy Modal */}
              {showUpdateModal && selectedSubsidy && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                          <div className="flex justify-between items-center p-6 border-b">
                              <h2 className="text-2xl font-bold text-[#006400]">Update Subsidy</h2>
                              <button 
                                  onClick={handleCloseModal}
                                  className="text-gray-500 hover:text-gray-700"
                              >
                                  <AiOutlineClose className="text-2xl" />
                              </button>
                          </div>
      
                          <div className="p-6 space-y-4">
                              <div>
                                  <label className="block font-semibold mb-2">Subsidy Name</label>
                                  <input 
                                      type="text"
                                      name="title"
                                      value={formData.title}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">Amount</label>
                                  <input 
                                      type="text"
                                      name="amount"
                                      value={formData.amount}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">Start Date</label>
                                  <input 
                                      type="date"
                                      name="application_start_date"
                                      value={formData.application_start_date}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">End Date</label>
                                  <input 
                                      type="date"
                                      name="application_end_date"
                                      value={formData.application_end_date}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">Description</label>
                                  <textarea 
                                      rows="4"
                                      name="description"
                                      value={formData.description}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                              </div>
      
                              <div>
                                  <label className="block font-semibold mb-2">Required Documents</label>
                                  <select
                                      onChange={handleDocumentSelect}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  >
                                      <option value="">-- Select Document --</option>
                                      {getAvailableDocuments().map(doc => (
                                          <option key={doc.value} value={doc.label}>{doc.label}</option>
                                      ))}
                                  </select>
      
                                  {/* Custom Document Input */}
                                  <div className="flex gap-2 mt-3">
                                      <input
                                          type="text"
                                          value={customDocument}
                                          onChange={(e) => setCustomDocument(e.target.value)}
                                          placeholder="Add custom document"
                                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomDocument())}
                                      />
                                      <button
                                          type="button"
                                          onClick={handleAddCustomDocument}
                                          className="px-4 py-2 bg-[#009500] text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                      >
                                          <AiOutlinePlus className="text-lg" />
                                          Add
                                      </button>
                                  </div>
      
                                  {/* Selected Documents */}
                                  {formData.documents_required.length > 0 && (
                                      <div className="mt-3 space-y-2">
                                          {formData.documents_required.map((doc, index) => (
                                              <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                                                  <span className="text-sm">{doc}</span>
                                                  <button
                                                      type="button"
                                                      onClick={() => handleRemoveDocument(doc)}
                                                      className="text-red-600 hover:text-red-800"
                                                  >
                                                      <AiOutlineClose />
                                                  </button>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
      
                              <div className="flex gap-3 pt-4">
                                  <button 
                                      onClick={handleSaveChanges}
                                      className="flex-1 bg-[#009500] hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                  >
                                      Save Changes
                                  </button>
                                  <button 
                                      onClick={handleCloseModal}
                                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                                  >
                                      Cancel
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
      
              {/* Delete Confirmation Modal */}
              {showDeleteModal && selectedSubsidy && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                          <div className="p-6">
                              <div className="flex items-center justify-center mb-4">
                                  <div className="bg-red-100 rounded-full p-3">
                                      <AiOutlineDelete className="text-4xl text-red-600" />
                                  </div>
                              </div>
                              <h2 className="text-2xl font-bold text-center mb-2">Remove Subsidy</h2>
                              <p className="text-gray-600 text-center mb-6">
                                  Are you sure you want to remove <span className="font-semibold text-gray-900">{selectedSubsidy.name}</span>? This action cannot be undone.
                              </p>
                              <div className="flex gap-3">
                                  <button 
                                      onClick={handleCancelDelete}
                                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                                  >
                                      Cancel
                                  </button>
                                  <button 
                                      onClick={handleConfirmDelete}
                                      className="flex-1 bg-[#E7000B] hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                  >
                                      Remove
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
    </>
  );
};

export default Dashboard;
