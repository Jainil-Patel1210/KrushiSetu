import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Data from './assets/data.json';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import api from './api1';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function ApplySubsidy() {


    const [stateValue,setStateValue]=useState('');
    const [districtValue,setDistrictValue]=useState('');
    const [talukaValue,setTalukaValue]=useState('');
    const [villageValue,setVillageValue]=useState('');
    const [unitValue,setUnitValue]=useState('');
    const [soilTypeValue,setSoilTypeValue]=useState('');

    // Wizard step and shared form state
    const [step, setStep] = useState(0); // 0: Personal, 1: Land, 2: Bank
    const [form, setForm] = useState({
        fullName: '', mobile: '', email: '', aadhar: '',
        state: '', district: '', taluka: '', village: '', address: '',
        landArea: '', unit: '', soilType: '', ownership: '',
        bankName: '', bankAccount: '', ifsc: ''
    });
    const [errors, setErrors] = useState({});
    const location = useLocation();
    const subsidyFromNav = location?.state?.subsidy || null;
    const subsidyTitle = subsidyFromNav?.title || null;
    // Documents widget state (local, UI-only; can be wired to API later)
    const DOC_TYPES = [
        { value: 'aadhar_card', label: 'Aadhar Card' },
        { value: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque' },
        { value: 'land_records', label: 'Copy of 7/12 and 8-A' },
    ];
    const [documents, setDocuments] = useState([]);
    const [showAddDocModal, setShowAddDocModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentDoc, setCurrentDoc] = useState(null);
    const fileInputRef = useRef(null);
    const [docForm, setDocForm] = useState({ document_type: '', number: '', file: null, name: '' });
    const [docErrors, setDocErrors] = useState({ document_type: '', number: '', file: '' });
    const [loadingDocs, setLoadingDocs] = useState(false);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const API_URL = '/photo/api/documents/';

    const update = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

    // Field-level validation for inline errors
    const validateField = (name, value) => {
        let msg = '';
        switch (name) {
            case 'fullName':
                if (!value?.trim()) msg = 'Full name is required';
                break;
            case 'mobile':
                if (!/^[6-9]\d{9}$/.test(value || '')) msg = 'Enter a valid 10-digit mobile number';
                break;
            case 'email':
                if (!/\S+@\S+\.\S+/.test(value || '')) msg = 'Enter a valid email';
                break;
            case 'aadhar':
                if (!/^\d{12}$/.test(value || '')) msg = 'Aadhaar must be 12 digits';
                break;
            case 'state':
                if (!value) msg = 'Select state';
                break;
            case 'district':
                if (!value) msg = 'Select district';
                break;
            case 'taluka':
                if (!value) msg = 'Select taluka';
                break;
            case 'village':
                if (!value) msg = 'Select village';
                break;
            case 'address':
                if (!value?.trim()) msg = 'Address is required';
                break;
            case 'landArea':
                if (!value) msg = 'Enter land area';
                break;
            case 'unit':
                if (!value) msg = 'Select unit';
                break;
            case 'soilType':
                if (!value) msg = 'Select soil type';
                break;
            case 'ownership':
                if (!value) msg = 'Select ownership type';
                break;
            case 'bankName':
                if (!value) msg = 'Enter bank name';
                break;
            case 'bankAccount':
                if (!value) msg = 'Enter account number';
                break;
            case 'ifsc':
                if (!value) msg = 'Enter IFSC';
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: msg }));
    };

    function validateCurrentStep(){
        const e = {};
        if (step === 0){
            if (!form.fullName.trim()) e.fullName = 'Full name is required';
            if (!/^[6-9]\d{9}$/.test(form.mobile || '')) e.mobile = 'Enter a valid 10-digit mobile number';
            if (!/\S+@\S+\.\S+/.test(form.email || '')) e.email = 'Enter a valid email';
            if (!/^\d{12}$/.test(form.aadhar || '')) e.aadhar = 'Aadhaar must be 12 digits';
            if (!form.state) e.state = 'Select state';
            if (!form.district) e.district = 'Select district';
            if (!form.taluka) e.taluka = 'Select taluka';
            if (!form.village) e.village = 'Select village';
            if (!form.address.trim()) e.address = 'Address required';
        } else if (step === 1){
            if (!form.landArea) e.landArea = 'Enter land area';
            if (!form.unit) e.unit = 'Select unit';
            if (!form.soilType) e.soilType = 'Select soil type';
            if (!form.ownership) e.ownership = 'Select ownership type';
        } else if (step === 2){
            if (!form.bankName) e.bankName = 'Enter bank name';
            if (!form.bankAccount) e.bankAccount = 'Enter account number';
            if (!form.ifsc) e.ifsc = 'Enter IFSC';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    const handleView = (doc) => {
        if (!doc.file_url) return alert('No file uploaded for this document.');
        window.open(doc.file_url, '_blank');
    }

    const handleEdit = (doc) => {
        setCurrentDoc(doc);
        setDocForm({ name: doc.title, number: doc.document_number, file: null, document_type: doc.document_type });
        setDocErrors({ document_type: '', number: '', file: '' });
        setShowEditModal(true);
    }

    const handleUpdateDocument = async (e) => {
        e.preventDefault();
        const validation = { number: validateDocNumber(docForm.number), file: docForm.file ? validateDocFile(docForm.file) : '' };
        setDocErrors(validation);
        if (validation.number || validation.file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('document_type', docForm.document_type || currentDoc.document_type);
        uploadFormData.append('document_number', docForm.number.trim());
        if (docForm.file) uploadFormData.append('file', docForm.file);

        setLoadingDocs(true);
        try {
            const response = await api.put(`${API_URL}${currentDoc.id}/`, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setDocuments((prev) => prev.map((d) => (d.id === currentDoc.id ? response.data : d)));
            resetDocForm();
            setShowEditModal(false);
            alert('Document updated successfully!');
        } catch (error) {
            console.error('Error updating document:', error);
            alert('Failed to update document. Please try again.');
        } finally {
            setLoadingDocs(false);
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        setLoadingDocs(true);
        try {
            await api.delete(`${API_URL}${id}/`);
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
            alert('Document deleted successfully!');
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document. Please try again.');
        } finally {
            setLoadingDocs(false);
        }
    }

    function nextStep(){ if (validateCurrentStep()) setStep(s=>s+1); }
    function prevStep(){ setStep(s=>Math.max(0, s-1)); }

    // Documents widget helpers
    const getAvailableDocumentTypes = () => {
        const uploadedDocNames = documents.map(doc => doc.title);
        return DOC_TYPES.filter(docType => !uploadedDocNames.includes(docType.label));
    }

    const validateDocNumber = (num) => {
        if (!num) return 'Document number is required.';
        if (num.length > 40) return 'Too long';
        return '';
    }

    const validateDocFile = (file) => {
        if (!file) return 'Please select a file.';
        if (file.size > MAX_FILE_SIZE) return 'File must be less than 5MB.';
        return '';
    }

    const handleDocFileChange = () => {
        const file = fileInputRef.current?.files?.[0] || null;
        setDocForm(f => ({ ...f, file }));
        setDocErrors(e => ({ ...e, file: validateDocFile(file) }));
    }

    const resetDocForm = () => {
        setDocForm({ document_type: '', number: '', file: null });
        setDocErrors({ document_type: '', number: '', file: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
    const fetchDocuments = async () => {
        try {
            const resp = await api.get(API_URL);
            setDocuments(resp.data);
        } catch (err) {
            console.error('Failed to fetch documents', err);
        }
    }

    useEffect(() => {
        fetchDocuments();
    }, []);

    const inputClass = (error) =>
        `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-green-500'
        }`;

    const handleAddDocument = async (e) => {
        e.preventDefault();
        const errs = {
            document_type: docForm.document_type ? '' : 'Select document type',
            number: validateDocNumber(docForm.number),
            file: validateDocFile(docForm.file),
        };
        setDocErrors(errs);
        if (errs.document_type || errs.number || errs.file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', docForm.file);
        uploadFormData.append('document_type', docForm.document_type);
        uploadFormData.append('document_number', docForm.number.trim());

        setLoadingDocs(true);
        try {
            const response = await api.post(API_URL, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRFToken': Cookies.get('csrftoken'),
                },
            });
            setDocuments([response.data, ...documents]);
            resetDocForm();
            setShowAddDocModal(false);
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error);
            alert(error.response?.data?.error || 'Failed to upload document. Please try again.');
        } finally {
            setLoadingDocs(false);
        }
    }




    return (

        <>
            <Header />


            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-6">

                <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-3xl">
                    <h2 className="text-2xl font-bold mb-2 text-center">{subsidyTitle ? `${subsidyTitle} Application Form` : 'Subsidy Application Form'}</h2>
                    <p className="text-center text-sm text-gray-600 mb-4">Step {step + 1} of 4</p>
                    <form className="flex items-start gap-x-20 gap-y-auto flex-wrap space-y-6 mx-auto">
                        <div className={`${step === 0 ? '' : 'hidden'} w-full flex flex-wrap gap-x-20 gap-y-4`}>


                            <h1 className='w-full text-green-600 font-extrabold text-2xl mb-2'>Personal Information</h1>
                            
                            {/* Full Name */}
                            <div className="flex flex-col">
                                <label className="text-black font-semibold mb-2" htmlFor="fullName">Full Name</label>
                                <input 
                                    className="bg-gray-100 border border-gray-300 rounded-lg p-2 w-52 focus:ring-2 focus:ring-green-600 focus:outline-none" 
                                    type="text" 
                                    placeholder='Enter Full Name'
                                    id="fullName" 
                                    name="fullName" 
                                    value={form.fullName} 
                                    onChange={(e)=>{ 
                                            update('fullName', e.target.value); 
                                            if (errors.fullName) validateField('fullName', e.target.value); 
                                        }
                                    } 
                                    onBlur={(e)=>validateField('fullName', e.target.value)} />
                                {errors.fullName ? <div className="text-red-500 text-sm mt-1">{errors.fullName}</div> : null}
                            </div>

                            {/* Mobile Number */}
                            <div className="flex flex-col">
                                <label className="text-black font-semibold mb-2" htmlFor="mobile">Mobile Number</label>
                                <input 
                                className="bg-gray-100 border border-gray-300 rounded-lg p-2 w-52 focus:ring-2 focus:ring-green-600 focus:outline-none" 
                                type="text" 
                                placeholder='Enter Mobile Number'
                                id="mobile" 
                                name="mobile" 
                                value={form.mobile} 
                                onChange={(e)=>{ 
                                    update('mobile', e.target.value); 
                                    if (errors.mobile) validateField('mobile', e.target.value); 
                                }} 
                                onBlur={(e)=>validateField('mobile', e.target.value)} />
                                {errors.mobile ? <div className="text-red-500 text-sm mt-1">{errors.mobile}</div> : null}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <label className="text-black font-semibold mb-2" htmlFor="email">Email</label>
                                <input 
                                    className="bg-gray-100 border border-gray-300 rounded-lg p-2 w-52 focus:ring-2 focus:ring-green-600 focus:outline-none" 
                                    type="email" 
                                    placeholder='Enter Email'
                                    id="email" 
                                    name="email" 
                                    value={form.email} 
                                    onChange={(e)=>{ 
                                        update('email', e.target.value); 
                                        if (errors.email) validateField('email', e.target.value); 
                                    }} 
                                    onBlur={(e)=>validateField('email', e.target.value)} />
                                {errors.email ? <div className="text-red-500 text-sm mt-1">{errors.email}</div> : null}
                            </div>
                                
                            {/* Aadhar Number */}
                            <div className="flex flex-col">
                                <label className="text-black font-semibold mb-2" htmlFor="aadhar">Aadhar Number</label>
                                <input 
                                    className="bg-gray-100 border border-gray-300 rounded-lg p-2 w-52 focus:ring-2 focus:ring-green-600 focus:outline-none" 
                                    type="text" 
                                    placeholder='Enter Aadhar Number'
                                    id="aadhar" 
                                    name="aadhar" 
                                    value={form.aadhar} 
                                    onChange={(e)=>{ 
                                        update('aadhar', e.target.value);
                                        if (errors.aadhar) validateField('aadhar', e.target.value); 
                                    }} 
                                    onBlur={(e)=>validateField('aadhar', e.target.value)} />
                                {errors.aadhar ? <div className="text-red-500 text-sm mt-1">{errors.aadhar}</div> : null}
                            </div>


                            
                            {/* State */}
                            <div className="flex flex-wrap justify-between gap-6 mt-3 lg:mt-8">
                                <div className="flex flex-col flex-1 min-w-[180px]">
                                    <label className="text-md font-semibold">State</label>
                                    <select 
                                        value={stateValue} 
                                        onChange={(e) => {
                                        setStateValue(e.target.value);
                                        setDistrictValue(''); 
                                        setTalukaValue('');
                                        setVillageValue('');
                                        update('state', e.target.value);
                                        validateField('state', e.target.value);
                                    }}
                                    className="h-12 w-35 border border-gray-300 rounded-lg px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                    >
                                        <option value="">Select State</option>
                                        {Array.isArray(Data) && Data.map((stateData, index) => (
                                            <option key={index} value={stateData.state}>
                                                {stateData.state}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.state ? <div className="text-red-500 text-sm mt-1">{errors.state}</div> : null}
                                </div>

                                {/* District - tailwind-only responsive width (2 columns on sm+, 1 on mobile) */}
                                <div className="flex flex-col basis-full sm:basis-[calc(50%-12px)] grow-0 min-w-[180px]">
                                    <label className="text-md font-semibold">District</label>
                                    <select 
                                        value={districtValue} 
                                        onChange={(e) => {
                                            setDistrictValue(e.target.value);
                                            setTalukaValue('');
                                            setVillageValue('');
                                            update('district', e.target.value);
                                            validateField('district', e.target.value);
                                        }} 
                                        className="h-12 w-35 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                    >
                                        <option value="">Select District</option>
                                        {stateValue && Array.isArray(Data) && Data.find(s => s.state === stateValue)?.districts.map((districtData, index) => (
                                            <option key={index} value={districtData.district}>
                                                {districtData.district}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.district ? <div className="text-red-500 text-sm mt-1">{errors.district}</div> : null}
                                </div>
                                <div className="flex flex-col flex-1 min-w-[180px]">
                                    <label className="text-md font-semibold">Taluka</label>
                                    <select 
                                        value={talukaValue} 
                                        onChange={(e) => {
                                            setTalukaValue(e.target.value);
                                            setVillageValue('');
                                            update('taluka', e.target.value);
                                            validateField('taluka', e.target.value);
                                    }} 
                                    className="h-12 w-35 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                    >
                                    <option value="">Select Taluka</option>
                                    {districtValue && stateValue && Data && Array.isArray(Data) && Data.find(s => s.state === stateValue)?.districts.find(d => d.district === districtValue)?.subDistricts.map((subDistrictData, index) => (
                                        <option key={index} value={subDistrictData.subDistrict}>
                                        {subDistrictData.subDistrict}
                                        </option>
                                    ))}
                                    </select>
                                    {errors.taluka ? <div className="text-red-500 text-sm mt-1">{errors.taluka}</div> : null}
                                </div>
                                <div className="flex flex-col flex-1 min-w-[180px]">
                                    <label className="text-md font-semibold">Village</label>
                                    <select 
                                        value={villageValue} 
                                        onChange={(e) => { setVillageValue(e.target.value); update('village', e.target.value); validateField('village', e.target.value); }} 
                                        className="h-12 w-35 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                    >
                                    <option value="">Select Village</option>
                                    {talukaValue && districtValue && stateValue && Data && Array.isArray(Data) && Data.find(s => s.state === stateValue)
                                        ?.districts.find(d => d.district === districtValue)?.subDistricts.find(sd => sd.subDistrict === talukaValue)?.villages.map((village, index) => (
                                        <option key={index} value={village}>{village}</option>
                                    ))}
                                    </select>
                                    {errors.village ? <div className="text-red-500 text-sm mt-1">{errors.village}</div> : null}
                                </div>
                            </div>
                            
                            {/* Address */}
                            <div className="flex flex-col w-full mr-8">
                                <label className="text-black font-semibold mb-2" htmlFor="address">Address</label>
                                <input 
                                    className="bg-gray-100 border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-600 focus:outline-none" 
                                    type="text" 
                                    placeholder='Enter Address'
                                    id="address" 
                                    name="address" 
                                    value={form.address} 
                                    onChange={(e)=>{ 
                                        update('address', e.target.value); 
                                        if (errors.address) validateField('address', e.target.value); 
                                        }} 
                                        onBlur={(e)=>validateField('address', e.target.value)} />
                                {errors.address ? <div className="text-red-500 text-sm mt-1">{errors.address}</div> : null}
                        </div>

                        {/* end of step 0 wrapper */}
                        </div>

                        {/* Step 1: Land details */}
                        <div className={`${step === 1 ? '' : 'hidden'} w-full flex flex-wrap gap-6`}>
                        
                            <h1 className='w-full text-green-600 font-extrabold text-2xl mb-2'>Land Information</h1>

                        
                        <div className="flex flex-col">
                            <label className="text-black font-semibold mb-2" htmlFor="landArea">Land Area (in acres)</label>
                            <input className="border border-gray-300 rounded-lg p-2 w-52" type="number" id="landArea" name="landArea" value={form.landArea} onChange={(e)=>{ update('landArea', e.target.value); if (errors.landArea) validateField('landArea', e.target.value); }} onBlur={(e)=>validateField('landArea', e.target.value)} />
                            {errors.landArea ? <div className="text-red-500 text-sm mt-1">{errors.landArea}</div> : null}
                        </div>

                        {/* Unit with dropdown - Acres, Hectares */}

                        <div className="flex flex-col">
                            <label className="text-black font-semibold mb-2" htmlFor="landAreaUnit">Land Area Unit</label>
                            <select className="border border-gray-300 rounded-lg p-2 w-52" id="landAreaUnit" name="landAreaUnit" value={unitValue} onChange={(e)=>{ setUnitValue(e.target.value); update('unit', e.target.value); validateField('unit', e.target.value); }}>
                                <option value="">Select Unit</option>
                                <option value="acres">Acres</option>
                                <option value="hectares">Hectares</option>
                            </select>
                            {errors.unit ? <div className="text-red-500 text-sm mt-1">{errors.unit}</div> : null}
                        </div>
                        
                        {/* Soil Type as dropdown */}

                        <div className="flex flex-col">
                            <label className="text-black font-semibold mb-2" htmlFor="soilType">Soil Type</label>
                            <select className="border border-gray-300 rounded-lg p-2 w-52" id="soilType" name="soilType" value={soilTypeValue} onChange={(e)=>{ setSoilTypeValue(e.target.value); update('soilType', e.target.value); validateField('soilType', e.target.value); }}>
                                <option value="">Select Soil Type</option>
                                <option value="alluvial">Alluvial</option>
                                <option value="black">Black</option>
                                <option value="red & yellow">Red & Yellow</option>
                                <option value="laterite">Laterite</option>
                                <option value="arid">Arid</option>
                                <option value="Forest & Mountain">Forest & Mountain</option>
                                <option value="saline & alkaline">Saline & Alkaline</option>
                                <option value="peaty">Peaty</option>
                                <option value="marshy">Marshy</option>
                            </select>
                            {errors.soilType ? <div className="text-red-500 text-sm mt-1">{errors.soilType}</div> : null}
                        </div>

                        {/* Ownership Type */}
                        <div className="flex flex-col">
                            <label className="text-black font-semibold mb-2" htmlFor="ownership">Ownership Type</label>
                            <select className="border border-gray-300 rounded-lg p-2 w-52" id="ownership" name="ownership" value={form.ownership} onChange={(e)=>{ update('ownership', e.target.value); validateField('ownership', e.target.value); }}>
                                <option value="">Select Ownership</option>
                                <option value="owned">Owned</option>
                                <option value="leased">Leased</option>
                            </select>
                            {errors.ownership ? <div className="text-red-500 text-sm mt-1">{errors.ownership}</div> : null}
                        </div>
                        </div>

                        {/* Step 2: Bank details */}
                        <div className={`${step === 2 ? '' : 'hidden'} w-full flex flex-col gap-4`}>
                            <h1 className='w-full text-green-600 font-extrabold text-2xl mb-2'>Bank Details</h1>
                            <div className="flex flex-col w-full mr-8">
                                <label className="text-black font-semibold mb-2" htmlFor="bankName">Bank Name</label>
                                <input className="border border-gray-300 rounded-lg p-2 w-full" type="text" id="bankName" name="bankName" value={form.bankName} onChange={(e)=>{ update('bankName', e.target.value); if (errors.bankName) validateField('bankName', e.target.value); }} onBlur={(e)=>validateField('bankName', e.target.value)} />
                                {errors.bankName ? <div className="text-red-500 text-sm mt-1">{errors.bankName}</div> : null}
                            </div>

                            <div className="flex flex-col w-full mr-8">
                                <label className="text-black font-semibold mb-2" htmlFor="ifscCode">IFSC Code</label>
                                <input className="border border-gray-300 rounded-lg p-2 w-full" type="text" id="ifscCode" name="ifscCode" value={form.ifsc} onChange={(e)=>{ update('ifsc', e.target.value); if (errors.ifsc) validateField('ifsc', e.target.value); }} onBlur={(e)=>validateField('ifsc', e.target.value)} />
                                {errors.ifsc ? <div className="text-red-500 text-sm mt-1">{errors.ifsc}</div> : null}
                            </div>

                            <div className="flex flex-col w-full mr-8">
                                <label className="text-black font-semibold mb-2" htmlFor="accountNumber">Account Number</label>
                                <input className="border border-gray-300 rounded-lg p-2 w-full" type="text" id="accountNumber" name="accountNumber" value={form.bankAccount} onChange={(e)=>{ update('bankAccount', e.target.value); if (errors.bankAccount) validateField('bankAccount', e.target.value); }} onBlur={(e)=>validateField('bankAccount', e.target.value)} />
                                {errors.bankAccount ? <div className="text-red-500 text-sm mt-1">{errors.bankAccount}</div> : null}
                            </div>
                        </div>
                        {/* Step 3: Documents */}
                        <div className={`${step === 3 ? '' : 'hidden'} w-full flex flex-col gap-4`}>
                            <h1 className='w-full text-green-600 font-extrabold text-2xl mb-2'>Upload Documents</h1>

                            <div className="max-w-3xl w-full mt-2">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-2xl font-bold text-green-700 mb-4">Uploaded Documents</h2>
                                    <div className="min-h-[120px] flex flex-col items-center justify-center">
                                        {documents.length === 0 ? (
                                            <>
                                                <p className="text-gray-500 text-lg">No documents uploaded yet.</p>
                                                <p className="text-gray-400 text-sm mt-2">Click "Add Documents" to upload your first document.</p>
                                                <button type="button" onClick={() => { resetDocForm(); setShowAddDocModal(true); }} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md">Add Documents</button>
                                            </>
                                        ) : (
                                            <div className="w-full">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b bg-gray-100">
                                                            <th className="py-2 text-left">Sr.</th>
                                                            <th className="py-2 text-left">Name</th>
                                                            <th className="py-2 text-left">Number</th>
                                                            <th className="py-2 text-left">Date</th>
                                                            <th className="py-2 text-left">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {documents.map((doc, i) => (
                                                            <tr key={doc.id} className="border-b hover:bg-gray-50">
                                                                <td className="py-2">{i+1}.</td>
                                                                <td className="py-2">{doc.title}</td>
                                                                <td className="py-2">{doc.document_number}</td>
                                                                <td className="py-2">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                                                                <td className="py-2">
                                                                                    <div className="flex gap-2">
                                                                                        <button type="button" onClick={() => handleView(doc)} className="px-2 py-1 border-2 border-green-600 text-green-600 rounded-md">View</button>
                                                                                        <button type="button" onClick={() => handleEdit(doc)} className="px-2 py-1 border-2 border-blue-600 text-blue-600 rounded-md">Edit</button>
                                                                                        <button type="button" onClick={() => handleDelete(doc.id)} className="px-2 py-1 border-2 border-red-600 text-red-600 rounded-md">Delete</button>
                                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="flex justify-center mt-4">
                                                    <button type="button" onClick={() => { resetDocForm(); setShowAddDocModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-md">Add Documents</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Add Document Modal */}
                            {showAddDocModal && (
                                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                        <h3 className="text-2xl font-bold mb-4 text-green-700">Add New Document</h3>
                                        <div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Select Document Type</label>
                                                <select
                                                    name="document_type"
                                                    value={docForm.document_type}
                                                    onChange={e => setDocForm(f => ({ ...f, document_type: e.target.value }))}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${docErrors.document_type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                                                >
                                                    <option value="">-- Select Document --</option>
                                                    {getAvailableDocumentTypes().map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                                {docErrors.document_type && <p className="text-red-500 text-sm mt-1">{docErrors.document_type}</p>}
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Document Number</label>
                                                <input type="text" value={docForm.number} onChange={e => { setDocForm(f=>({ ...f, number: e.target.value })); setDocErrors(prev=>({ ...prev, number: '' })); }} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., ABC1234567" />
                                                {docErrors.number && <p className="text-red-500 text-sm mt-1">{docErrors.number}</p>}
                                            </div>

                                            <div className="mb-6">
                                                <label className="block text-gray-700 font-semibold mb-2">Upload Document (Max 5MB)</label>
                                                <input type="file" ref={fileInputRef} onChange={handleDocFileChange} className="w-full" accept=".pdf,.jpg,.jpeg,.png" />
                                                {docForm.file && !docErrors.file && (
                                                    <p className="text-sm text-green-600 mt-2">Selected: {docForm.file.name} ({(docForm.file.size / 1024 / 1024).toFixed(2)} MB)</p>
                                                )}
                                                {docErrors.file && <p className="text-red-500 text-sm mt-1">{docErrors.file}</p>}
                                            </div>

                                            <div className="flex gap-3">
                                                <button type="button" onClick={handleAddDocument} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md">Add Document</button>
                                                <button type="button" onClick={() => { resetDocForm(); setShowAddDocModal(false); }} className="flex-1 px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Edit Document Modal */}
                            {showEditModal && (
                                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                        <h3 className="text-2xl font-bold mb-4 text-green-700">Edit Document</h3>
                                        <div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Document Name</label>
                                                <input type="text" value={docForm.name || ''} readOnly disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed" />
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Document Number</label>
                                                <input type="text" value={docForm.number} onChange={(e) => setDocForm(f=>({ ...f, number: e.target.value }))} className={inputClass(docErrors.number)} placeholder="e.g., ABC1234567" />
                                                {docErrors.number && <p className="text-red-500 text-sm mt-1">{docErrors.number}</p>}
                                            </div>

                                            <div className="mb-6">
                                                <label className="block text-gray-700 font-semibold mb-2">Upload New Document (Optional, Max 5MB)</label>
                                                <input type="file" ref={fileInputRef} onChange={handleDocFileChange} className={inputClass(docErrors.file)} accept=".pdf,.jpg,.jpeg,.png" />
                                                {docForm.file && !docErrors.file && (
                                                    <p className="text-sm text-green-600 mt-2">Selected: {docForm.file.name} ({(docForm.file.size / 1024 / 1024).toFixed(2)} MB)</p>
                                                )}
                                                {docErrors.file && <p className="text-red-500 text-sm mt-1">{docErrors.file}</p>}
                                            </div>

                                            <div className="flex gap-3">
                                                <button type="button" onClick={handleUpdateDocument} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md">Update Document</button>
                                                <button type="button" onClick={() => { resetDocForm(); setShowEditModal(false); }} className="flex-1 px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="w-full"></div>
                        <div className="flex justify-between mt-4 w-full">
                            {step > 0 ? (
                                <button type="button" className="border px-4 py-2 rounded" onClick={prevStep}>Back</button>
                            ) : <span />}
                            {step < 3 ? (
                                <button type="button" className="bg-green-600 text-white rounded-lg px-4 py-2" onClick={nextStep}>Next</button>
                            ) : (
                                <button type="button" className="bg-green-600 text-white rounded-lg px-4 py-2" onClick={()=>{ if (validateCurrentStep()) { alert('Demo submit. Hook API next.'); } }}>Submit</button>
                            )}
                        </div>

                    </form>
                </div>

            </div>
        </>
  );
}