import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { v4 as uuid } from 'uuid';
import Settings from '../HomePage/Settings.jsx';
import api from './api';
import axios from 'axios';
import Cookies from 'js-cookie';

// Regex to validate document number format
const NUMBER_REGEX = /^[A-Za-z0-9_-]{1,20}$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

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

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [formData, setFormData] = useState({ name: '', number: '', file: null, document_type: '' });
    const [errors, setErrors] = useState({ name: '', number: '', file: '', document_type: '' });
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef();
    const isBlurred = showAddModal || showEditModal;

    const API_URL = '/photo/api/documents/';

    // Create axios instance for API calls
    const apiClient = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true,
    });

    // Fetch documents on component mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            console.log('=== DEBUG: Fetching Documents ===');
            console.log('API URL:', API_URL);
            console.log('Base URL:', import.meta.env.VITE_BASE_URL);
            console.log('All Cookies:', document.cookie);
            
            const response = await api.get(API_URL);
            console.log('Success! Documents:', response.data);
            setDocuments(response.data);
        } catch (error) {
            console.error('=== ERROR DETAILS ===');
            console.error('Status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            console.error('Request headers:', error.config?.headers);
            
            if (error.response?.status === 401) {
                alert('Please log in to view documents.');
                window.location.href = '/login';
            } else {
                alert('Failed to load documents. Please try again.');
            }
        }
    };

    // Filter out documents that are already uploaded
    const getAvailableDocumentTypes = () => {
        const uploadedDocNames = documents.map(doc => doc.title);
        return DOC_TYPES.filter(docType => !uploadedDocNames.includes(docType.label));
    };

    // Check if document name is selected
    const validateDocumentName = (name) => {
        if (!name) return 'Document name is required.';
        return '';
    };

    // Validate document number format
    const validateDocumentNumber = (number) => {
        if (!number) return 'Document number is required.';
        if (!NUMBER_REGEX.test(number))
            return 'Document number must be 1–20 characters and alphanumeric.';
        return '';
    };

    // Check file size doesn't exceed 5MB
    const validateFileSize = (file) => {
        if (!file) return 'Please select a file to upload.';
        if (file.size > MAX_FILE_SIZE) return 'File size must be less than 5MB.';
        return '';
    };

    // Run all validations at once
    const validateAll = (data, requireFile = true) => ({
        number: validateDocumentNumber(data.number),
        file: requireFile ? validateFileSize(data.file) : '',
        document_type: data.document_type ? '' : 'Document type is required.',
    });

    // Update form field and validate it immediately
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({
            ...prev,
            [field]:
                field === 'name'
                    ? validateDocumentName(value)
                    : field === 'number'
                        ? validateDocumentNumber(value)
                        : '',
        }));
    };

    // Handle file selection and validation
    const handleFileChange = () => {
        const file = fileInputRef.current.files[0];
        const fileError = file ? validateFileSize(file) : 'Please select a file.';
        setErrors((prev) => ({ ...prev, file: fileError }));
        setFormData((prev) => ({ ...prev, file: fileError ? null : file }));
    };

    // Open document in new tab
    const handleView = (doc) => {
        if (!doc.file_url) return alert('No file uploaded for this document.');
        window.open(doc.file_url, '_blank');
    };

    // Open edit modal with selected document data
    const handleEdit = (doc) => {
        setCurrentDoc(doc);
        setFormData({ name: doc.title, number: doc.document_number, file: null, document_type: doc.document_type });
        setErrors({ name: '', number: '', file: '', document_type: '' });
        setShowEditModal(true);
    };

    // Add new document to the list
    const handleAddDocument = async (e) => {
        e.preventDefault();
        const validation = validateAll(formData, true);
        setErrors(validation);
        if (validation.name || validation.number || validation.file || validation.document_type) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.file);
        uploadFormData.append('document_type', formData.document_type);
        uploadFormData.append('document_number', formData.number.trim());

        setLoading(true);

        try {
            const response = await api.post(API_URL, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRFToken': Cookies.get('csrftoken'),
                },
            });

            setDocuments([response.data, ...documents]);
            resetForm();
            setShowAddModal(false);
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error);
            alert(error.response?.data?.error || 'Failed to upload document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Update existing document
    const handleUpdateDocument = async (e) => {
        e.preventDefault();
        const validation = validateAll(formData, false);
        setErrors(validation);
        if (validation.name || validation.number || validation.file || validation.document_type) return;

        const uploadFormData = new FormData();
        uploadFormData.append('document_type', formData.document_type);
        uploadFormData.append('document_number', formData.number.trim());
        if (formData.file) {
            uploadFormData.append('file', formData.file);
        }

        setLoading(true);

        try {
            const response = await api.put(`${API_URL}${currentDoc.id}/`, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setDocuments((prev) =>
                prev.map((doc) =>
                    doc.id === currentDoc.id ? response.data : doc
                )
            );
            resetForm();
            setShowEditModal(false);
            alert('Document updated successfully!');
        } catch (error) {
            console.error('Error updating document:', error);
            alert('Failed to update document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Delete document with confirmation
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        setLoading(true);

        try {
            await api.delete(`${API_URL}${id}/`);
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
            alert('Document deleted successfully!');
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Clear form and reset file input
    const resetForm = () => {
        setFormData({ name: '', number: '', file: null, document_type: '' });
        setErrors({ name: '', number: '', file: '', document_type: '' });
        setCurrentDoc(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Reusable input styling based on error state
    const inputClass = (error) =>
        `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-green-500'
        }`;

    return (
        <>
            {/* Blur background when modal is open */}
            <div className={isBlurred ? 'blur-sm' : ''}>
                <Header />
            </div>
            <Settings />
            <div className={`w-full bg-gray-100 min-h-screen ${isBlurred ? 'blur-sm' : ''}`}>
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-10">
                    <h1 className="text-3xl font-bold">Documents</h1>
                    <p className="text-[#77797C] font-semibold mt-2 text-base">
                        Manage and view all your uploaded documents
                    </p>

                    <div className="bg-white rounded-lg shadow-md mt-6 p-6">
                        <h2 className="text-2xl font-bold text-[#15681A] mb-6">Uploaded Documents</h2>

                        <div className="overflow-x-auto">
                            {documents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No documents uploaded yet.</p>
                                    <p className="text-sm mt-2">Click "Add Documents" to upload your first document.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 bg-[#F1F2F3] border-gray-200">
                                            <th className="text-left py-3 px-4 text-lg font-bold text-gray-700">Sr. No.</th>
                                            <th className="text-left py-3 px-4 text-lg font-bold text-gray-700">Name</th>
                                            <th className="text-left py-3 px-4 text-lg font-bold text-gray-700">Number</th>
                                            <th className="text-left py-3 px-4 text-lg font-bold text-gray-700">Date</th>
                                            <th className="text-center py-3 px-4 text-lg font-bold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc, index) => (
                                            <tr key={doc.id} className="border-b font-semibold text-base border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">{index + 1}.</td>
                                                <td className="py-3 px-4">{doc.title}</td>
                                                <td className="py-3 px-4">{doc.document_number}</td>
                                                <td className="py-3 px-4">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                                                        <button
                                                            onClick={() => handleView(doc)}
                                                            className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors w-full sm:w-auto"
                                                            disabled={loading}
                                                        >
                                                            <AiOutlineEye className="h-4 w-4" />
                                                            <span className="hidden sm:inline">View</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(doc)}
                                                            className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors w-full sm:w-auto"
                                                            disabled={loading}
                                                        >
                                                            <AiOutlineEdit className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors w-full sm:w-auto"
                                                            disabled={loading}
                                                        >
                                                            <AiOutlineDelete className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowAddModal(true);
                                }}
                                className="px-4 py-2 bg-[#009500] text-white text-lg rounded-md hover:bg-green-700 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={getAvailableDocumentTypes().length === 0 || loading}
                            >
                                {loading ? 'Processing...' : 'Add Documents'}
                            </button>
                        </div>
                        {getAvailableDocumentTypes().length === 0 && (
                            <p className="text-center text-gray-500 mt-2 text-sm">All document types have been uploaded</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Document Modal */}
            {showAddModal && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4 text-green-700">Add New Document</h3>
                        <form onSubmit={handleAddDocument}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Select Document Type</label>
                                <select
                                    name="document_type"
                                    value={formData.document_type}
                                    onChange={e => setFormData(f => ({ ...f, document_type: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                        errors.document_type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                    }`}
                                    disabled={loading}
                                >
                                    <option value="">-- Select Document --</option>
                                    {getAvailableDocumentTypes().map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                                {errors.document_type && <p className="text-red-500 text-sm mt-1">{errors.document_type}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Document Number</label>
                                <input
                                    type="text"
                                    value={formData.number}
                                    onChange={(e) => handleInputChange('number', e.target.value)}
                                    className={inputClass(errors.number)}
                                    placeholder="e.g., ABC1234567"
                                    disabled={loading}
                                />
                                {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">Upload Document (Max 5MB)</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className={inputClass(errors.file)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    disabled={loading}
                                />
                                {formData.file && !errors.file && (
                                    <p className="text-sm text-green-600 mt-2">
                                        Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                                {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#009500] text-white rounded-md hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Uploading...' : 'Add Document'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setShowAddModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Document Modal */}
            {showEditModal && (
                <Modal
                    title="Edit Document"
                    formData={formData}
                    errors={errors}
                    inputClass={inputClass}
                    fileInputRef={fileInputRef}
                    handleInputChange={handleInputChange}
                    handleFileChange={handleFileChange}
                    onSubmit={handleUpdateDocument}
                    onCancel={() => {
                        resetForm();
                        setShowEditModal(false);
                    }}
                    submitLabel={loading ? 'Updating...' : 'Update Document'}
                    loading={loading}
                />
            )}
        </>
    );
};

// Separate modal component for editing documents
const Modal = ({
    title,
    formData,
    errors,
    inputClass,
    fileInputRef,
    handleInputChange,
    handleFileChange,
    onSubmit,
    onCancel,
    submitLabel,
    loading
}) => (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-green-700">{title}</h3>
            <form onSubmit={onSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Document Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Document Number</label>
                    <input
                        type="text"
                        value={formData.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        className={inputClass(errors.number)}
                        placeholder="e.g., ABC1234567"
                        disabled={loading}
                    />
                    {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Upload New Document (Optional, Max 5MB)</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className={inputClass(errors.file)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={loading}
                    />
                    {formData.file && !errors.file && (
                        <p className="text-sm text-green-600 mt-2">
                            Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                    {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-[#009500] text-white rounded-md hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {submitLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
);

export default Documents;