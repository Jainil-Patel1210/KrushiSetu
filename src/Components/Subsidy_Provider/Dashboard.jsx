import React, { useState } from 'react'
import Header from '../User_Profile/Header'
import Settings from '../HomePage/Settings'
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete, AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { FaRupeeSign, FaCalendarAlt, FaFileAlt, FaClipboardList } from "react-icons/fa";

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
    name: '',
    amount: '',
    startDate: '',
    endDate: '',
    description: '',
    requiredDocuments: []
  });
  const [customDocument, setCustomDocument] = useState('');

  const [subsidies, setSubsidies] = useState([
    {
      id: 1,
      name: 'PM-KISAN Scheme',
      amount: '₹6,000/year',
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      description: 'Income support to all landholding farmers\' families with ₹6,000 per year in three equal installments.',
      requiredDocuments: ['Aadhar Card', 'Bank Passbook / Cancelled Cheque', 'Copy of 7/12 and 8-A']
    },
    {
      id: 2,
      name: 'Soil Health Card Subsidy',
      amount: '₹10,000',
      startDate: '2024-03-01',
      endDate: '2025-08-31',
      description: 'Financial assistance for soil testing and health card generation to promote balanced use of fertilizers.',
      requiredDocuments: ['Copy of 7/12 and 8-A', 'Aadhar Card']
    },
    {
      id: 3,
      name: 'Solar Pump Subsidy',
      amount: '₹1,00,000',
      startDate: '2024-05-01',
      endDate: '2025-10-15',
      description: 'Government subsidy for installation of solar-powered water pumps to reduce electricity costs.',
      requiredDocuments: ['Copy of 7/12 and 8-A', 'Bank Passbook / Cancelled Cheque', 'Aadhar Card']
    }
  ]);

  const handleAddClick = () => {
    setFormData({
      name: '',
      amount: '',
      startDate: '',
      endDate: '',
      description: '',
      requiredDocuments: []
    });
    setCustomDocument('');
    setShowAddModal(true);
  }

  const handleUpdateClick = (subsidy) => {
    setSelectedSubsidy(subsidy);
    setFormData({
      name: subsidy.name,
      amount: subsidy.amount,
      startDate: subsidy.startDate,
      endDate: subsidy.endDate,
      description: subsidy.description,
      requiredDocuments: subsidy.requiredDocuments || []
    });
    setCustomDocument('');
    setShowUpdateModal(true);
  }

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setSelectedSubsidy(null);
    setFormData({
      name: '',
      amount: '',
      startDate: '',
      endDate: '',
      description: '',
      requiredDocuments: []
    });
    setCustomDocument('');
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      name: '',
      amount: '',
      startDate: '',
      endDate: '',
      description: '',
      requiredDocuments: []
    });
    setCustomDocument('');
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleDocumentSelect = (e) => {
    const selectedDoc = e.target.value;
    if (selectedDoc && !formData.requiredDocuments.includes(selectedDoc)) {
      setFormData(prev => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, selectedDoc]
      }));
    }
    e.target.value = '';
  }

  const handleAddCustomDocument = () => {
    if (customDocument.trim() && !formData.requiredDocuments.includes(customDocument.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, customDocument.trim()]
      }));
      setCustomDocument('');
    }
  }

  const handleRemoveDocument = (docToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter(doc => doc !== docToRemove)
    }));
  }

  const handleSaveChanges = () => {
    const updatedSubsidies = subsidies.map(subsidy => 
      subsidy.id === selectedSubsidy.id 
        ? { ...subsidy, ...formData }
        : subsidy
    );
    setSubsidies(updatedSubsidies);
    handleCloseModal();
  }

  const handleAddSubsidy = () => {
    const newSubsidy = {
      id: subsidies.length + 1,
      ...formData
    };
    setSubsidies([...subsidies, newSubsidy]);
    handleCloseAddModal();
  }

  const handleRemoveClick = (subsidy) => {
    setSelectedSubsidy(subsidy);
    setShowDeleteModal(true);
  }

  const handleConfirmDelete = () => {
    const updatedSubsidies = subsidies.filter(subsidy => subsidy.id !== selectedSubsidy.id);
    setSubsidies(updatedSubsidies);
    setShowDeleteModal(false);
    setSelectedSubsidy(null);
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedSubsidy(null);
  }

  const getAvailableDocuments = () => {
    return DOC_TYPES.filter(doc => !formData.requiredDocuments.includes(doc.label));
  }

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
                                    {subsidy.name}
                                </h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleUpdateClick(subsidy)}
                                        className="flex items-center gap-1 px-4 py-2 border-3 font-semibold border-[#009500] text-[#009500] rounded-lg hover:bg-green-50 transition-colors"
                                    >
                                        <AiOutlineEdit className='text-xl' />
                                        Update
                                    </button>
                                    <button 
                                        onClick={() => handleRemoveClick(subsidy)}
                                        className="flex items-center gap-1 px-4 py-2 border-3 font-semibold border-[#E7000B] text-[#E7000B] rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <AiOutlineDelete className='text-xl' />
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
                                        <span>{subsidy.startDate}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <FaCalendarAlt className="text-green-600 text-xl mt-1" />
                                    <div>
                                        <span className="font-semibold">End Date : </span>
                                        <span>{subsidy.endDate}</span>
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
                                            {subsidy.requiredDocuments?.map((doc, index) => (
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
                                name="name"
                                value={formData.name}
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
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">End Date</label>
                            <input 
                                type="date"
                                name="endDate"
                                value={formData.endDate}
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
                            {formData.requiredDocuments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {formData.requiredDocuments.map((doc, index) => (
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
                                name="name"
                                value={formData.name}
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
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">End Date</label>
                            <input 
                                type="date"
                                name="endDate"
                                value={formData.endDate}
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
                            {formData.requiredDocuments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {formData.requiredDocuments.map((doc, index) => (
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
  )
}

export default Dashboard