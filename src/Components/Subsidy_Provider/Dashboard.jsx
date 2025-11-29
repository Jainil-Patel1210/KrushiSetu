import React, { useState, useEffect } from "react";
import Header from "../User_Profile/Header";
import Settings from "../HomePage/Settings";
import { PlusCircle, Pencil, Trash2, XCircle, CalendarCheck, FileText, ListChecks } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { getMySubsidies, createSubsidy, updateSubsidy, deleteSubsidy } from "./api/subsidyApi";
import { Toaster, toast } from "react-hot-toast";

// List of all possible document types
const DOC_TYPES = [
  { value: "bank_passbook", label: "Bank Passbook / Cancelled Cheque" },
  { value: "scope_certificate", label: "Scope Certificate of Organic Farming" },
  { value: "annexure_copy", label: "Copy of Annexure in Group Certification" },
  { value: "residue_testing_receipt", label: "Receipt of fee paid for residue testing" },
  { value: "divyang_certificate", label: "Copy of Divyang Certificate (if applicable)" },
  { value: "joint_account_construction", label: "Joint Account Holder's Construction Letter" },
  { value: "residue_testing_copy", label: "Copy of residue testing" },
  { value: "aadhar_card", label: "Aadhar Card" },
  { value: "land_records", label: "Copy of 7/12 and 8-A" },
];

const Dashboard = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubsidy, setSelectedSubsidy] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    application_start_date: "",
    application_end_date: "",
    description: "",
    documents_required: [],
  });
  const [customDocument, setCustomDocument] = useState("");
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subsidyNameError, setSubsidyNameError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [dateError, setDateError] = useState("");
  const [descriptionError, setDescriptionError] = useState(""); // Error state for description

  // Fetch subsidies
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMySubsidies();
        setSubsidies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching subsidies:", error);
        toast.error("Failed to load subsidies");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lock body scroll while any modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    if (showAddModal || showUpdateModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [showAddModal, showUpdateModal, showDeleteModal]);

  if (loading)
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );

  const handleAddClick = () => {
    setFormData({
      title: "",
      amount: "",
      application_start_date: "",
      application_end_date: "",
      description: "",
      documents_required: [],
    });
    setCustomDocument("");
    setShowAddModal(true);
  };

  const handleUpdateClick = (subsidy) => {
    setSelectedSubsidy(subsidy);
    setFormData({
      title: subsidy.title || "",
      amount: subsidy.amount || "",
      application_start_date: subsidy.application_start_date || "",
      application_end_date: subsidy.application_end_date || "",
      description: subsidy.description || "",
      documents_required: subsidy.documents_required || [],
    });
    setCustomDocument("");
    setShowUpdateModal(true);
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setSelectedSubsidy(null);
    setFormData({
      title: "",
      amount: "",
      application_start_date: "",
      application_end_date: "",
      description: "",
      documents_required: [],
    });
    setCustomDocument("");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      title: "",
      amount: "",
      application_start_date: "",
      application_end_date: "",
      description: "",
      documents_required: [],
    });
    setCustomDocument("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;

    // Validate Subsidy Name
    if (!formData.title.trim()) {
      setSubsidyNameError("Subsidy name is required");
      isValid = false;
    } else {
      setSubsidyNameError("");
    }

    // Validate Amount
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      setAmountError("Amount is required and must be a positive number");
      isValid = false;
    } else {
      setAmountError("");
    }

    // Validate Dates
    if (!formData.application_start_date) {
      setDateError("Start date is required");
      isValid = false;
    } else if (!formData.application_end_date) {
      setDateError("End date is required");
      isValid = false;
    } else if (new Date(formData.application_start_date) > new Date(formData.application_end_date)) {
      setDateError("Start date cannot be after end date");
      isValid = false;
    } else {
      setDateError("");
    }

    // Validate Description
    if (!formData.description.trim()) {
      setDescriptionError("Description is required");
      isValid = false;
    } else {
      setDescriptionError("");
    }

    return isValid;
  };

  const handleSaveChanges = async () => {
    if (!selectedSubsidy) return;
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(String(formData.amount).replace(/[₹,]/g, "")) || 0,
        application_start_date: formData.application_start_date,
        application_end_date: formData.application_end_date,
        documents_required: formData.documents_required,
        eligibility: [],
      };
      const updated = await updateSubsidy(selectedSubsidy.id, payload);
      setSubsidies((prev) => prev.map((sub) => (sub.id === updated.id ? updated : sub)));
      toast.success("Subsidy successfully updated.");
      handleCloseModal();
    } catch (error) {
      console.error("Error updating subsidy:", error);
      toast.error("Failed to update subsidy!");
    }
  };

  const handleAddSubsidy = async () => {
    if(!validateForm()) {
      return;
    }
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(String(formData.amount).replace(/[₹,]/g, "")) || 0,
        application_start_date: formData.application_start_date,
        application_end_date: formData.application_end_date,
        documents_required: formData.documents_required,
        eligibility: [],
      };
      const newSubsidy = await createSubsidy(payload);
      setSubsidies((prev) => [...prev, newSubsidy]);
      toast.success("Subsidy added successfully");
      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding subsidy:", error);
      toast.error("Failed to add subsidy!");
    }
  };

  const handleDocumentSelect = (e) => {
    const selectedDoc = e.target.value;
    if (selectedDoc && !formData.documents_required.includes(selectedDoc)) {
      setFormData((prev) => ({
        ...prev,
        documents_required: [...prev.documents_required, selectedDoc],
      }));
    }
    e.target.value = "";
  };

  const handleAddCustomDocument = () => {
    if (customDocument.trim() && !formData.documents_required.includes(customDocument.trim())) {
      setFormData((prev) => ({
        ...prev,
        documents_required: [...prev.documents_required, customDocument.trim()],
      }));
      setCustomDocument("");
    }
  };

  const handleRemoveDocument = (docToRemove) => {
    setFormData((prev) => ({
      ...prev,
      documents_required: prev.documents_required.filter((doc) => doc !== docToRemove),
    }));
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <Settings />
      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Subsidy Management</h1>
              <p className="text-[#77797C] font-semibold mt-2 text-sm sm:text-base lg:text-lg">
                Add, Update and Manage Subsidy Schemes
              </p>
            </div>

            <button
              onClick={handleAddClick}
              className="mt-4 sm:mt-0 bg-[#009500] hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              aria-label="Add new subsidy"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-semibold">Add New Subsidy</span>
            </button>
          </div>

          {/* Empty state if no subsidies */}
          {(!subsidies || subsidies.length === 0) ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center mt-10">
              <p className="text-gray-500 text-lg">No subsidies available. Click "Add New Subsidy" to create one.</p>
            </div>
          ) : null}

          {/* Add New Subsidy Form */}
          {showAddModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-2xl font-bold text-[#006400]">Add New Subsidy</h2>
                  <button onClick={handleCloseAddModal} className="text-gray-500 hover:text-gray-700 text-3xl" aria-label="Close add subsidy">
                    &times;
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Subsidy Name Field */}
                  <div>
                    <label className="block font-semibold mb-2">Subsidy Name</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={(e) => {
                        handleInputChange(e);
                        const value = e.target.value;
                        if (value.trim() === "") setSubsidyNameError("Subsidy name is required");
                        else setSubsidyNameError("");
                      }}
                      placeholder="Enter subsidy name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    {subsidyNameError && <p className="text-red-600 text-sm mt-1">{subsidyNameError}</p>}
                  </div>

                  {/* Amount Field */}
                  <div>
                    <label className="block font-semibold mb-2">Amount</label>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={(e) => {
                        let value = e.target.value;
                        value = value.replace(/[^0-9]/g, "");
                        handleInputChange({ target: { name: "amount", value } });
                        if (value.trim() === "") setAmountError("Amount is required");
                        else setAmountError("");
                      }}
                      placeholder="Enter amount (numbers only)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    {amountError && <p className="text-red-600 text-sm mt-1">{amountError}</p>}
                  </div>

                  {/* Start Date Field */}
                  <div>
                    <label className="block font-semibold mb-2">Start Date</label>
                    <input
                      type="date"
                      name="application_start_date"
                      value={formData.application_start_date}
                      onChange={(e) => {
                        handleInputChange(e);
                        const startDate = e.target.value;
                        const endDate = formData.application_end_date;

                        if (endDate && startDate > endDate) {
                          setDateError("Start date cannot be after End date");
                        } else {
                          setDateError("");
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>

                  {/* End Date Field */}
                  <div>
                    <label className="block font-semibold mb-2">End Date</label>
                    <input
                      type="date"
                      name="application_end_date"
                      value={formData.application_end_date}
                      onChange={(e) => {
                        handleInputChange(e);
                        const endDate = e.target.value;
                        const startDate = formData.application_start_date;

                        if (startDate && endDate < startDate) {
                          setDateError("End date cannot be before Start date");
                        } else {
                          setDateError("");
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  {dateError && <p className="text-red-600 text-sm mt-1">{dateError}</p>}

                  {/* Description Field */}
                  <div>
                    <label className="block font-semibold mb-2">Description</label>
                    <textarea
                      rows="4"
                      name="description"
                      value={formData.description}
                      onChange={(e) => {
                        handleInputChange(e);
                        const value = e.target.value;
                        if (value.trim() === "") setDescriptionError("Description is required");
                        else setDescriptionError("");
                      }}
                      placeholder="Enter subsidy description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    {descriptionError && <p className="text-red-600 text-sm mt-1">{descriptionError}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Required Documents</label>
                    <select
                      onChange={handleDocumentSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">-- Select Document --</option>
                      {DOC_TYPES.map((doc) => (
                        <option key={doc.value} value={doc.label}>
                          {doc.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Document Input */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={customDocument}
                      onChange={(e) => setCustomDocument(e.target.value)}
                      placeholder="Add custom document"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomDocument())}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDocument}
                      className="px-4 py-2 bg-[#009500] text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Selected Documents */}
                  {formData.documents_required.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.documents_required.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                          <span className="text-sm">{doc}</span>
                          <button type="button" onClick={() => handleRemoveDocument(doc)} className="text-red-600 hover:text-red-800" aria-label={`Remove ${doc}`}>
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

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
        </div>
      </div>
    </>
  );
};

export default Dashboard;
