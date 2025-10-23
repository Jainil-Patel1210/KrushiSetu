import React, { useState, useRef } from 'react';
import Header from './Header';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { v4 as uuid } from 'uuid';

// Regex to validate document number format
const NUMBER_REGEX = /^[A-Za-z0-9_-]{1,20}$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

// List of all possible document types
const ALL_DOCUMENT_TYPES = [
    "Bank Passbook / Cancelled Cheque",
    "Scope Certificate of Organic Farming",
    "Copy of Annexure in Group Certification",
    "Receipt of fee paid for residue testing",
    "Copy of Divyang Certificate (if applicable)",
    "Joint Account Holder's Construction Letter",
    "Copy of residue testing",
    "Aadhar Card",
    "Copy of 7/12 and 8-A"
];

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [formData, setFormData] = useState({ name: '', number: '', file: null });
    const [errors, setErrors] = useState({ name: '', number: '', file: '' });

    const fileInputRef = useRef();
    const isBlurred = showAddModal || showEditModal;

    // Filter out documents that are already uploaded
    const getAvailableDocumentTypes = () => {
        const uploadedDocNames = documents.map(doc => doc.name);
        return ALL_DOCUMENT_TYPES.filter(docType => !uploadedDocNames.includes(docType));
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
        name: validateDocumentName(data.name),
        number: validateDocumentNumber(data.number),
        file: requireFile ? validateFileSize(data.file) : '',
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
        if (!doc.file) return alert('No file uploaded for this document.');
        const fileURL = URL.createObjectURL(doc.file);
        window.open(fileURL, '_blank');
        URL.revokeObjectURL(fileURL); // prevent memory leak
    };

    // Open edit modal with selected document data
    const handleEdit = (doc) => {
        setCurrentDoc(doc);
        setFormData({ name: doc.name, number: doc.number, file: doc.file });
        setErrors({ name: '', number: '', file: '' });
        setShowEditModal(true);
    };

    // Add new document to the list
    const handleAddDocument = (e) => {
        e.preventDefault();
        const validation = validateAll(formData, true);
        setErrors(validation);
        if (validation.name || validation.number || validation.file) return;

        const newDoc = {
            id: uuid(),
            name: formData.name.trim(),
            number: formData.number.trim(),
            date: new Date().toISOString().split('T')[0],
            file: formData.file,
        };

        setDocuments((prev) => [...prev, newDoc]);
        resetForm();
        setShowAddModal(false);
    };

    // Update existing document
    const handleUpdateDocument = (e) => {
        e.preventDefault();
        const validation = validateAll(formData, false);
        setErrors(validation);
        if (validation.name || validation.number || validation.file) return;

        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === currentDoc.id
                    ? { ...doc, name: formData.name.trim(), number: formData.number.trim(), file: formData.file || doc.file }
                    : doc
            )
        );
        resetForm();
        setShowEditModal(false);
    };

    // Delete document with confirmation
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        }
    };

    // Clear form and reset file input
    const resetForm = () => {
        setFormData({ name: '', number: '', file: null });
        setErrors({ name: '', number: '', file: '' });
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
                                                <td className="py-3 px-4">{doc.name}</td>
                                                <td className="py-3 px-4">{doc.number}</td>
                                                <td className="py-3 px-4">{doc.date}</td>
                                                <td className="py-3 px-4">
                                                    {/* Stack buttons vertically on mobile, horizontal on desktop */}
                                                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                                                        <button
                                                            onClick={() => handleView(doc)}
                                                            className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors w-full sm:w-auto"
                                                        >
                                                            <AiOutlineEye className="h-4 w-4" />
                                                            <span className="hidden sm:inline">View</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(doc)}
                                                            className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors w-full sm:w-auto"
                                                        >
                                                            <AiOutlineEdit className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors w-full sm:w-auto"
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

                        {/* Disable button when all documents are uploaded */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowAddModal(true);
                                }}
                                className="px-4 py-2 bg-[#009500] text-white text-lg rounded-md hover:bg-green-700 font-semibold transition-colors"
                                disabled={getAvailableDocumentTypes().length === 0}
                            >
                                Add Documents
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
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                >
                                    <option value="">-- Select Document --</option>
                                    {/* Show only documents that haven't been uploaded yet */}
                                    {getAvailableDocumentTypes().map((docType) => (
                                        <option key={docType} value={docType}>
                                            {docType}
                                        </option>
                                    ))}
                                </select>
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Document Number</label>
                                <input
                                    type="text"
                                    value={formData.number}
                                    onChange={(e) => handleInputChange('number', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                    placeholder="e.g., ABC1234567"
                                />
                                {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">Upload Document (Max 5MB)</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.file ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                    accept=".pdf,.jpg,.jpeg,.png"
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
                                    className="flex-1 px-4 py-2 bg-[#009500] text-white rounded-md hover:bg-green-700 font-semibold"
                                >
                                    Add Document
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setShowAddModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
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
                    submitLabel="Update Document"
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
}) => (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-green-700">{title}</h3>
            <form onSubmit={onSubmit}>
                {/* Document name is read-only in edit mode */}
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
                        className="flex-1 px-4 py-2 bg-[#009500] text-white rounded-md hover:bg-green-700 font-semibold"
                    >
                        {submitLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
);

export default Documents;