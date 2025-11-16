import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Data from './assets/data.json';
import api from './api1';
import Cookies from 'js-cookie';
import Settings from '../HomePage/Settings.jsx';

export default function ApplySubsidy() {
  const navigate = useNavigate();
  const location = useLocation();
  const subsidyFromNav = location?.state?.subsidy || null;
  const subsidyTitle = subsidyFromNav?.title || null;

  // Wizard step and shared form state
  const [step, setStep] = useState(0); // 0: Personal, 1: Land, 2: Bank, 3: Documents
  const [form, setForm] = useState({
    fullName: '', mobile: '', email: '', aadhar: '',
    state: '', district: '', taluka: '', village: '', address: '',
    landArea: '', unit: '', soilType: '', ownership: '',
    bankName: '', bankAccount: '', ifsc: ''
  });
  const [errors, setErrors] = useState({});

  // location selects
  const [stateValue, setStateValue] = useState('');
  const [districtValue, setDistrictValue] = useState('');
  const [talukaValue, setTalukaValue] = useState('');
  const [villageValue, setVillageValue] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [soilTypeValue, setSoilTypeValue] = useState('');

  // Documents
  const [documents, setDocuments] = useState([]); // server-side uploaded documents
  const [pendingUploads, setPendingUploads] = useState([]); // staged locally
  const fileInputRef = useRef(null);

  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [docForm, setDocForm] = useState({ document_type: '', number: '', file: null, name: '' });
  const [docErrors, setDocErrors] = useState({ document_type: '', number: '', file: '' });
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // API endpoints (ensure trailing slash to avoid 301)
  const DOCUMENTS_URL = '/subsidy/documents/';
  const APPLY_URL = '/subsidy/apply/';

  // Master doc types — used for fallback/labels
  const DOC_TYPES = [
    { value: 'aadhar_card', label: 'Aadhaar' },
    { value: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque' },
    { value: 'land_records', label: 'Land documents/tenancy proof' },
    { value: 'pan_card', label: 'PAN Card' },
    { value: 'photo', label: 'Profile Photo' },
    { value: 'shg_membership', label: 'SHG membership' },
  ];

  // derive allowed values from subsidy
  const subsidyRequiredValues = React.useMemo(() => {
    const arr = subsidyFromNav?.documents_required || [];
    if (!Array.isArray(arr)) return [];
    return arr.map(item => (typeof item === 'string' ? item : (item.value || ''))).filter(Boolean);
  }, [subsidyFromNav]);

  const cleanedRequiredDocs = React.useMemo(() => {
    const raw = subsidyFromNav?.documents_required || [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map(item => {
        if (typeof item === "string") return item;
        if (item && item.value) return item.value;
        return null;
      })
      .filter(Boolean);
  }, [subsidyFromNav]);

  const uploadedTypes = new Set([
    ...documents.map(d => d.document_type),
    ...pendingUploads.map(p => p.document_type)
  ]);

  const remainingRequiredDocs = cleanedRequiredDocs.filter(req => !uploadedTypes.has(req));

  const [addModalTypes, setAddModalTypes] = useState(() => deriveTypesFromSubsidy(subsidyFromNav?.documents_required || null));

  function prettifyLabel(value) {
    if (!value) return 'Document';
    return value.replace(/[_\-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function deriveTypesFromSubsidy(required) {
    if (!required || !Array.isArray(required) || required.length === 0) return DOC_TYPES;
    return required.map(item => {
      if (typeof item === 'string') {
        const m = DOC_TYPES.find(d => d.value === item);
        return m || { value: item, label: prettifyLabel(item) };
      }
      if (item && item.value) return { value: item.value, label: item.label || prettifyLabel(item.value) };
      return null;
    }).filter(Boolean);
  }

  const update = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  // ---------- Validation functions ----------
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

  function validateCurrentStep() {
    const e = {};
    if (step === 0) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!/^[6-9]\d{9}$/.test(form.mobile || '')) e.mobile = 'Enter a valid 10-digit mobile number';
      if (!/\S+@\S+\.\S+/.test(form.email || '')) e.email = 'Enter a valid email';
      if (!/^\d{12}$/.test(form.aadhar || '')) e.aadhar = 'Aadhaar must be 12 digits';
      if (!form.state) e.state = 'Select state';
      if (!form.district) e.district = 'Select district';
      if (!form.taluka) e.taluka = 'Select taluka';
      if (!form.village) e.village = 'Select village';
      if (!form.address.trim()) e.address = 'Address required';
    } else if (step === 1) {
      if (!form.landArea) e.landArea = 'Enter land area';
      if (!form.unit) e.unit = 'Select unit';
      if (!form.soilType) e.soilType = 'Select soil type';
      if (!form.ownership) e.ownership = 'Select ownership type';
    } else if (step === 2) {
      if (!form.bankName) e.bankName = 'Enter bank name';
      if (!form.bankAccount) e.bankAccount = 'Enter account number';
      if (!form.ifsc) e.ifsc = 'Enter IFSC';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Document helpers
  const validateDocNumber = (num) => {
    if (!num) return 'Document number is required.';
    if (num.length > 40) return 'Too long';
    return '';
  };
  const validateDocFile = (file) => {
    if (!file) return 'Please select a file.';
    if (file.size > MAX_FILE_SIZE) return 'File must be less than 5MB.';
    return '';
  };
  const handleDocFileChange = () => {
    const file = fileInputRef.current?.files?.[0] || null;
    setDocForm(f => ({ ...f, file }));
    setDocErrors(e => ({ ...e, file: validateDocFile(file) }));
  };
  const resetDocForm = () => {
    setDocForm({ document_type: '', number: '', file: null, name: '' });
    setDocErrors({ document_type: '', number: '', file: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Fetch documents (server) but filter by subsidy required types
  const fetchDocuments = async () => {
    try {
      const resp = await api.get(DOCUMENTS_URL, { withCredentials: true });
      let docs = resp.data || [];
      if (Array.isArray(subsidyRequiredValues) && subsidyRequiredValues.length > 0) {
        docs = docs.filter(d => subsidyRequiredValues.includes(d.document_type));
      }
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents', err, err.response?.data);
      setDocuments([]);
    }
  };

  // Fetch profile and documents
  const fetchProfile = async () => {
    try {
      const tries = ['profile/profile/', '/profile/', 'profile/'];
      let profile = null;
      for (const endpoint of tries) {
        try {
          const res = await api.get(endpoint, { withCredentials: true });
          profile = res.data;
          break;
        } catch (err) { /* try next */ }
      }
      if (profile) {
        const populatedForm = {
          fullName: profile.full_name || '',
          mobile: profile.mobile_number.slice(-10) || '',
          email: profile.email_address || profile.email || '',
          aadhar: profile.aadhaar_number || profile.aadhaar || '',
          state: profile.state || '',
          district: profile.district || '',
          taluka: profile.taluka || '',
          village: profile.village || '',
          address: profile.address || '',
          landArea: profile.land_size != null ? String(profile.land_size) : '',
          unit: profile.unit || '',
          soilType: profile.soil_type || '',
          ownership: profile.ownership_type || '',
          bankName: profile.bank_name || '',
          bankAccount: profile.bank_account_number || '',
          ifsc: profile.ifsc_code || '',
        };
        setForm(populatedForm);
        if (populatedForm.state) setStateValue(populatedForm.state);
        if (populatedForm.district) setDistrictValue(populatedForm.district);
        if (populatedForm.taluka) setTalukaValue(populatedForm.taluka);
        if (populatedForm.village) setVillageValue(populatedForm.village);
        if (populatedForm.unit) setUnitValue(populatedForm.unit);
        if (populatedForm.soilType) setSoilTypeValue(populatedForm.soilType);

        // profile.documents -> normalize & filter
        if (Array.isArray(profile.documents) && profile.documents.length > 0) {
          let normalized = profile.documents.map(d => ({
            id: d.id,
            title: d.title || d.name || d.document_type || 'Document',
            document_number: d.document_number || d.number || '',
            uploaded_at: d.uploaded_at || d.created_at || new Date().toISOString(),
            file_url: d.file_url || d.file || d.url || '',
            document_type: d.document_type || '',
          }));
          if (Array.isArray(subsidyRequiredValues) && subsidyRequiredValues.length > 0) {
            normalized = normalized.filter(d => subsidyRequiredValues.includes(d.document_type));
          }
          setDocuments(normalized);
        } else {
          await fetchDocuments();
        }
      } else {
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
      await fetchDocuments();
    }
  };

  useEffect(() => {
    setAddModalTypes(deriveTypesFromSubsidy(subsidyFromNav?.documents_required || null));
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subsidyFromNav]);

  // merged docs for UI = pendingUploads first then server documents
  const mergedDocs = [...pendingUploads, ...documents];

  // missing required docs (by type) — used for banner
  const presentTypes = new Set(mergedDocs.map(d => d.document_type));
  const missingDocs = (subsidyFromNav?.documents_required || []).filter(r => !presentTypes.has((typeof r === 'string' ? r : (r.value || '')))).map(x => (typeof x === 'string' ? x : (x.label || x.value)));

  // ---------- Document actions ----------
  const handleView = (doc) => {
    if (doc.file) {
      // staged local file -> create blob URL
      if (!doc.file_url) {
        const url = URL.createObjectURL(doc.file);
        window.open(url, '_blank');
        return;
      }
    }
    if (!doc.file_url) return alert('No file uploaded for this document.');
    window.open(doc.file_url, '_blank');
  };

  const handleEdit = (doc) => {
    setCurrentDoc(doc);
    setDocForm({ name: doc.title || '', number: doc.document_number || '', file: null, document_type: doc.document_type || '' });
    setDocErrors({ document_type: '', number: '', file: '' });

    // If doc is pending (staged), remove it from pendingUploads temporarily — will be re-added on save
    if (doc.tempId) {
      setPendingUploads(prev => prev.filter(p => p.tempId !== doc.tempId));
      setCurrentDoc({ ...doc, isPending: true });
    }

    setShowEditModal(true);
  };

  const handleDelete = async (idOrTemp) => {
    // if tempId (starts with 'temp_') -> delete locally
    if (typeof idOrTemp === 'string' && idOrTemp.startsWith('temp_')) {
      setPendingUploads(prev => prev.filter(p => p.tempId !== idOrTemp));
      return;
    }
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setLoadingDocs(true);
    try {
      await api.delete(`${DOCUMENTS_URL}${idOrTemp}/`, { withCredentials: true });
      setDocuments(prev => prev.filter(doc => doc.id !== idOrTemp));
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error, error.response?.data);
      alert('Failed to delete document. Please try again.');
    } finally {
      setLoadingDocs(false);
    }
  };

  // Stage document locally instead of POSTing immediately
  const openAddModalForRequired = () => {
    const typesToShow = remainingRequiredDocs.map(req => {
      const match = DOC_TYPES.find(t => t.value === req);
      return match || { value: req, label: prettifyLabel(req) };
    });

    setAddModalTypes(typesToShow);
    setDocForm(f => ({
      ...f,
      document_type: typesToShow.length ? typesToShow[0].value : ""
    }));

    setShowAddDocModal(true);
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (uploadedTypes.has(docForm.document_type)) {
      alert("This document is already uploaded.");
      return;
    }
    const errs = {
      document_type: docForm.document_type ? '' : 'Select document type',
      number: validateDocNumber(docForm.number),
      file: validateDocFile(docForm.file),
    };
    setDocErrors(errs);
    if (errs.document_type || errs.number || errs.file) return;

    // Check allowed by subsidy
    if (subsidyRequiredValues.length > 0 && !subsidyRequiredValues.includes(docForm.document_type)) {
      alert('This document type is not required for this subsidy.');
      return;
    }

    const temp = {
      tempId: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      document_type: docForm.document_type,
      document_number: docForm.number.trim(),
      file: docForm.file,
      uploaded_at: new Date().toISOString(),
    };

    setPendingUploads(prev => [temp, ...prev]);
    resetDocForm();
    setShowAddDocModal(false);
  };

  // Update a staged doc or server doc
  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    const validation = { number: validateDocNumber(docForm.number), file: docForm.file ? validateDocFile(docForm.file) : '' };
    setDocErrors(validation);
    if (validation.number || validation.file) return;

    // If editing a staged doc (currentDoc.isPending)
    if (currentDoc?.isPending && currentDoc?.tempId) {
      const updated = {
        tempId: currentDoc.tempId,
        document_type: docForm.document_type || currentDoc.document_type,
        document_number: docForm.number,
        file: docForm.file || currentDoc.file,
        uploaded_at: new Date().toISOString(),
      };
      setPendingUploads(prev => [updated, ...prev]);
      setShowEditModal(false);
      resetDocForm();
      setCurrentDoc(null);
      return;
    }

    // Else update server document
    const uploadFormData = new FormData();
    uploadFormData.append('document_type', docForm.document_type || currentDoc.document_type);
    uploadFormData.append('document_number', docForm.number.trim());
    if (docForm.file) uploadFormData.append('file', docForm.file);

    setLoadingDocs(true);
    try {
      const response = await api.put(`${DOCUMENTS_URL}${currentDoc.id}/`, uploadFormData, {
        headers: { 'X-CSRFToken': Cookies.get('csrftoken') }, // do NOT set Content-Type
        withCredentials: true,
      });
      const respDoc = response.data;
      if (subsidyRequiredValues.length === 0 || subsidyRequiredValues.includes(respDoc.document_type)) {
        setDocuments(prev => prev.map(d => d.id === currentDoc.id ? respDoc : d));
      } else {
        setDocuments(prev => prev.filter(d => d.id !== currentDoc.id));
      }
      resetDocForm();
      setShowEditModal(false);
      setCurrentDoc(null);
      alert('Document updated successfully!');
    } catch (error) {
      console.error('Error updating document:', error, error.response?.data);
      alert('Failed to update document. Please try again.');
    } finally {
      setLoadingDocs(false);
    }
  };

  // ---------- Improved uploadPendingDocuments ----------
  // Upload all pending files in parallel using FormData and return created docs.
  async function uploadPendingDocuments() {
    if (!pendingUploads.length) return [];

    const uploadOne = async (p) => {
      const fd = new FormData();
      fd.append('file', p.file);
      fd.append('document_type', p.document_type || '');
      if (p.document_number) fd.append('document_number', p.document_number);

      try {
        const res = await api.post(DOCUMENTS_URL, fd, {
          headers: {
            // DO NOT set Content-Type — browser will set it including boundary
            'X-CSRFToken': Cookies.get('csrftoken'),
          },
          withCredentials: true,
        });
        return res.data;
      } catch (err) {
        const server = err?.response;
        console.error('upload error', { status: server?.status, data: server?.data, message: err.message });
        const pretty = server?.data?.detail || JSON.stringify(server?.data) || err.message;
        throw new Error(`Uploading ${p.document_type || 'document'} failed: ${pretty}`);
      }
    };

    // Option A: parallel upload (fail-fast)
    const created = await Promise.all(pendingUploads.map(p => uploadOne(p)));
    // append created to server documents
    setDocuments(prev => [...created, ...prev]);
    // clear pending uploads
    setPendingUploads([]);
    return created;
  }

  const handleSubmitApplication = async () => {
    const missing = {};
    if (!form.fullName?.trim()) missing.fullName = 'Full name required';
    if (!/^[6-9]\d{9}$/.test(form.mobile || '')) missing.mobile = 'Mobile invalid';
    if (!/\S+@\S+\.\S+/.test(form.email || '')) missing.email = 'Email invalid';
    if (!/^\d{12}$/.test(form.aadhar || '')) missing.aadhar = 'Aadhaar invalid';
    setErrors(missing);
    if (Object.keys(missing).length) {
      alert('Please fill missing fields in personal details.');
      setStep(0);
      return;
    }

    const mergedTypesBeforeUpload = new Set([...documents.map(d => d.document_type), ...pendingUploads.map(p => p.document_type)]);
    const stillMissing = (subsidyFromNav?.documents_required || []).filter(r => {
      const val = typeof r === 'string' ? r : (r.value || '');
      return !mergedTypesBeforeUpload.has(val);
    });
    if (stillMissing.length) {
      alert(`You must provide required documents before submitting: ${stillMissing.map(prettifyLabel).join(', ')}`);
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      let newlyCreatedDocs = [];
      if (pendingUploads.length) {
        newlyCreatedDocs = await uploadPendingDocuments();
      }

      const serverDocIds = [
        ...documents.filter(d => !d.tempId).map(d => d.id),
        ...newlyCreatedDocs.map(d => d.id),
      ];

      const payload = {
        subsidy: subsidyFromNav?.id || null,
        document_ids: serverDocIds,
        full_name: form.fullName,
        mobile: form.mobile,
        email: form.email,
        aadhaar: form.aadhar,
        address: form.address,
        state: form.state,
        district: form.district,
        taluka: form.taluka,
        village: form.village,
        land_area: form.landArea,
        land_unit: form.unit,
        soil_type: form.soilType,
        ownership: form.ownership,
        bank_name: form.bankName,
        account_number: form.bankAccount,
        ifsc: form.ifsc,
      };

      console.log('Submitting payload:', payload);

      await api.post(APPLY_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': Cookies.get('csrftoken'),
        },
        withCredentials: true,
      });

      navigate('/sidebar');
    } catch (err) {
      console.error('Submission failed', err, err.response?.data);
      const serverData = err?.response?.data;
      alert(serverData?.detail || JSON.stringify(serverData) || err.message || 'Submission failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (error) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`;

  function nextStep() { if (validateCurrentStep()) setStep(s => s + 1); }
  function prevStep() { setStep(s => Math.max(0, s - 1)); }

  return (
    <>
      <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex justify-center items-center p-2 sm:p-4 z-50 overflow-y-auto">
        <Settings />
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-5xl p-4 sm:p-6 md:p-8 relative my-auto">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-2 right-2 md:top-4 md:right-4 w-10 h-10 flex items-center justify-center text-gray-500 hover:rounded-full hover:bg-gray-200 transition-all duration-200 text-2xl font-bold hover:shadow-md z-10"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 mb-2 text-center leading-tight pt-0 px-12">{subsidyTitle ? `${subsidyTitle} Application Form` : 'Subsidy Application Form'}</h2>
          <p className="text-center text-xs sm:text-sm text-gray-600 mb-6 md:mb-8">Step {step + 1} of 4</p>
          <form className="space-y-8" onSubmit={e => e.preventDefault()}>
            {/* Step 0: Personal */}
            <div className={`${step === 0 ? '' : 'hidden'} w-full space-y-6`}>
              <h1 className='text-green-600 font-extrabold text-2xl md:text-3xl mb-6 pb-2 border-b-2 border-green-200'>Personal Information</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="fullName">Full Name</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all"
                  type="text" placeholder='Enter Full Name' id="fullName" name="fullName"
                  value={form.fullName}
                  onChange={(e) => { update('fullName', e.target.value); if (errors.fullName) validateField('fullName', e.target.value); }}
                  onBlur={(e) => validateField('fullName', e.target.value)} />
                {errors.fullName ? <div className="text-red-500 text-sm mt-1">{errors.fullName}</div> : null}
              </div>

              {/* Mobile */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="mobile">Mobile Number</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all"
                  type="text" placeholder='Enter Mobile Number' id="mobile" name="mobile"
                  value={form.mobile}
                  onChange={(e) => { update('mobile', e.target.value); if (errors.mobile) validateField('mobile', e.target.value); }}
                  onBlur={(e) => validateField('mobile', e.target.value)} />
                {errors.mobile ? <div className="text-red-500 text-sm mt-1">{errors.mobile}</div> : null}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all"
                  type="email" placeholder='Enter Email' id="email" name="email"
                  value={form.email}
                  onChange={(e) => { update('email', e.target.value); if (errors.email) validateField('email', e.target.value); }}
                  onBlur={(e) => validateField('email', e.target.value)} />
                {errors.email ? <div className="text-red-500 text-sm mt-1">{errors.email}</div> : null}
              </div>

              {/* Aadhaar */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="aadhar">Aadhar Number</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all"
                  type="text" placeholder='Enter Aadhar Number' id="aadhar" name="aadhar"
                  value={form.aadhar}
                  onChange={(e) => { update('aadhar', e.target.value); if (errors.aadhar) validateField('aadhar', e.target.value); }}
                  onBlur={(e) => validateField('aadhar', e.target.value)} />
                {errors.aadhar ? <div className="text-red-500 text-sm mt-1">{errors.aadhar}</div> : null}
              </div>

              </div>

              {/* State/District/Taluka/Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-gray-700 font-semibold mb-2">State</label>
                  <select value={stateValue} onChange={(e) => { setStateValue(e.target.value); setDistrictValue(''); setTalukaValue(''); setVillageValue(''); update('state', e.target.value); validateField('state', e.target.value); }}
                    className="h-12 border border-gray-300 rounded-lg px-4 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none bg-gray-50 transition-all">
                    <option value="">Select State</option>
                    {Array.isArray(Data) && Data.map((stateData, index) => (<option key={index} value={stateData.state}>{stateData.state}</option>))}
                  </select>
                  {errors.state ? <div className="text-red-500 text-sm mt-1">{errors.state}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-700 font-semibold mb-2">District</label>
                  <select value={districtValue} onChange={(e) => { setDistrictValue(e.target.value); setTalukaValue(''); setVillageValue(''); update('district', e.target.value); validateField('district', e.target.value); }}
                    className="h-12 border border-gray-300 rounded-lg px-4 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none bg-gray-50 transition-all">
                    <option value="">Select District</option>
                    {stateValue && Array.isArray(Data) && Data.find(s => s.state === stateValue)?.districts.map((districtData, index) => (<option key={index} value={districtData.district}>{districtData.district}</option>))}
                  </select>
                  {errors.district ? <div className="text-red-500 text-sm mt-1">{errors.district}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-700 font-semibold mb-2">Taluka</label>
                  <select value={talukaValue} onChange={(e) => { setTalukaValue(e.target.value); setVillageValue(''); update('taluka', e.target.value); validateField('taluka', e.target.value); }}
                    className="h-12 border border-gray-300 rounded-lg px-4 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none bg-gray-50 transition-all">
                    <option value="">Select Taluka</option>
                    {districtValue && stateValue && Data && Array.isArray(Data) && Data.find(s => s.state === stateValue)?.districts.find(d => d.district === districtValue)?.subDistricts.map((subDistrictData, index) => (<option key={index} value={subDistrictData.subDistrict}>{subDistrictData.subDistrict}</option>))}
                  </select>
                  {errors.taluka ? <div className="text-red-500 text-sm mt-1">{errors.taluka}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-700 font-semibold mb-2">Village</label>
                  <select value={villageValue} onChange={(e) => { setVillageValue(e.target.value); update('village', e.target.value); validateField('village', e.target.value); }}
                    className="h-12 border border-gray-300 rounded-lg px-4 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none bg-gray-50 transition-all">
                    <option value="">Select Village</option>
                    {talukaValue && districtValue && stateValue && Data && Array.isArray(Data) && Data.find(s => s.state === stateValue)?.districts.find(d => d.district === districtValue)?.subDistricts.find(sd => sd.subDistrict === talukaValue)?.villages.map((village, index) => (<option key={index} value={village}>{village}</option>))}
                  </select>
                  {errors.village ? <div className="text-red-500 text-sm mt-1">{errors.village}</div> : null}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="address">Address</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all"
                  type="text" placeholder='Enter Address' id="address" name="address"
                  value={form.address}
                  onChange={(e) => { update('address', e.target.value); if (errors.address) validateField('address', e.target.value); }}
                  onBlur={(e) => validateField('address', e.target.value)} />
                {errors.address ? <div className="text-red-500 text-sm mt-1">{errors.address}</div> : null}
              </div>
            </div>

            {/* Step 1: Land details */}
            <div className={`${step === 1 ? '' : 'hidden'} w-full space-y-6`}>
              <h1 className='text-green-600 font-extrabold text-3xl mb-6 pb-2 border-b-2 border-green-200'>Land Information</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="landArea">Land Area</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all" type="number" id="landArea" name="landArea" value={form.landArea} onChange={(e) => { update('landArea', e.target.value); if (errors.landArea) validateField('landArea', e.target.value); }} onBlur={(e) => validateField('landArea', e.target.value)} />
                {errors.landArea ? <div className="text-red-500 text-sm mt-1">{errors.landArea}</div> : null}
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="landAreaUnit">Unit</label>
                <select className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all" id="landAreaUnit" name="landAreaUnit" value={unitValue} onChange={(e) => { setUnitValue(e.target.value); update('unit', e.target.value); validateField('unit', e.target.value); }}>
                  <option value="">Select Unit</option>
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
                {errors.unit ? <div className="text-red-500 text-sm mt-1">{errors.unit}</div> : null}
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="soilType">Soil Type</label>
                <select className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all" id="soilType" name="soilType" value={soilTypeValue} onChange={(e) => { setSoilTypeValue(e.target.value); update('soilType', e.target.value); validateField('soilType', e.target.value); }}>
                  <option value="">Select Soil Type</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Black">Black</option>
                  <option value="Red & Yellow">Red & Yellow</option>
                  <option value="Laterite">Laterite</option>
                  <option value="Arid">Arid</option>
                  <option value="Forest & Mountain">Forest & Mountain</option>
                  <option value="Saline & Alkaline">Saline & Alkaline</option>
                  <option value="Peaty">Peaty</option>
                  <option value="Marshy">Marshy</option>
                </select>
                {errors.soilType ? <div className="text-red-500 text-sm mt-1">{errors.soilType}</div> : null}
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="ownership">Ownership</label>
                <select className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all" id="ownership" name="ownership" value={form.ownership} onChange={(e) => { update('ownership', e.target.value); validateField('ownership', e.target.value); }}>
                  <option value="">Select Ownership</option>
                  <option value="owned">Owned</option>
                  <option value="leased">Leased</option>
                </select>
                {errors.ownership ? <div className="text-red-500 text-sm mt-1">{errors.ownership}</div> : null}
              </div>
              </div>
            </div>

            {/* Step 2: Bank details */}
            <div className={`${step === 2 ? '' : 'hidden'} w-full space-y-6`}>
              <h1 className='text-green-600 font-extrabold text-3xl mb-6 pb-2 border-b-2 border-green-200'>Bank Details</h1>
              
              <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="bankName">Bank Name</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all" type="text" id="bankName" name="bankName" value={form.bankName} onChange={(e) => { update('bankName', e.target.value); if (errors.bankName) validateField('bankName', e.target.value); }} onBlur={(e) => validateField('bankName', e.target.value)} />
                {errors.bankName ? <div className="text-red-500 text-sm mt-1">{errors.bankName}</div> : null}
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="ifscCode">IFSC Code</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all" type="text" id="ifscCode" name="ifscCode" value={form.ifsc} onChange={(e) => { update('ifsc', e.target.value); if (errors.ifsc) validateField('ifsc', e.target.value); }} onBlur={(e) => validateField('ifsc', e.target.value)} />
                {errors.ifsc ? <div className="text-red-500 text-sm mt-1">{errors.ifsc}</div> : null}
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2" htmlFor="accountNumber">Account Number</label>
                <input className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none transition-all" type="text" id="accountNumber" name="accountNumber" value={form.bankAccount} onChange={(e) => { update('bankAccount', e.target.value); if (errors.bankAccount) validateField('bankAccount', e.target.value); }} onBlur={(e) => validateField('bankAccount', e.target.value)} />
                {errors.bankAccount ? <div className="text-red-500 text-sm mt-1">{errors.bankAccount}</div> : null}
              </div>
              </div>
            </div>

            {/* Step 3: Documents (SIMPLIFIED) */}
            <div className={`${step === 3 ? '' : 'hidden'} w-full space-y-6`}>
              <h1 className='text-green-600 font-extrabold text-3xl mb-6 pb-2 border-b-2 border-green-200'>Upload Documents</h1>

              {/* Missing documents banner */}
              {missingDocs.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <strong className="font-bold">Missing required documents:</strong> {missingDocs.map(prettifyLabel).join(', ')}
                </div>
              )}

              <div className="max-w-3xl w-full mt-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="min-h-[120px]">
                    {mergedDocs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No documents uploaded yet.</p>
                        <p className="text-gray-400 text-sm mt-2">Use the button below to upload documents required by this subsidy.</p>
                      </div>
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
                            {mergedDocs.map((doc, i) => (
                              <tr key={doc.id ?? doc.tempId} className="border-b hover:bg-gray-50">
                                <td className="py-2">{i + 1}.</td>
                                <td className="py-2">{doc.title || DOC_TYPES.find(d => d.value === doc.document_type)?.label || prettifyLabel(doc.document_type)}</td>
                                <td className="py-2">{doc.document_number || ''}</td>
                                <td className="py-2">{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ''}</td>
                                <td className="py-2">
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => handleView(doc)} className="px-2 py-1 border-2 border-green-600 text-green-600 rounded-md">View</button>
                                    <button type="button" onClick={() => handleEdit(doc)} className="px-2 py-1 border-2 border-blue-600 text-blue-600 rounded-md">Edit</button>
                                    <button type="button" onClick={() => handleDelete(doc.id ?? doc.tempId)} className="px-2 py-1 border-2 border-red-600 text-red-600 rounded-md">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="flex justify-center mt-4">
                      <button type="button" onClick={() => { resetDocForm(); openAddModalForRequired(); }} className="bg-green-600 text-white px-4 py-2 rounded-md">Add Documents</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Document Modal (staging only) */}
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
                          {addModalTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                        </select>
                        {docErrors.document_type && <p className="text-red-500 text-sm mt-1">{docErrors.document_type}</p>}
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Document Number</label>
                        <input type="text" value={docForm.number} onChange={e => { setDocForm(f => ({ ...f, number: e.target.value })); setDocErrors(prev => ({ ...prev, number: '' })); }} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., ABC1234567" />
                        {docErrors.number && <p className="text-red-500 text-sm mt-1">{docErrors.number}</p>}
                      </div>

                      <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Upload Document (Max 5MB)</label>
                        <input type="file" ref={fileInputRef} onChange={handleDocFileChange} className="w-full" accept=".pdf,.jpg,.jpeg,.png" />
                        {docForm.file && !docErrors.file && (<p className="text-sm text-green-600 mt-2">Selected: {docForm.file.name} ({(docForm.file.size / 1024 / 1024).toFixed(2)} MB)</p>)}
                        {docErrors.file && <p className="text-red-500 text-sm mt-1">{docErrors.file}</p>}
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={handleAddDocument} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md">Stage Document</button>
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
                        <input type="text" value={docForm.number} onChange={(e) => setDocForm(f => ({ ...f, number: e.target.value }))} className={inputClass(docErrors.number)} placeholder="e.g., ABC1234567" />
                        {docErrors.number && <p className="text-red-500 text-sm mt-1">{docErrors.number}</p>}
                      </div>

                      <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Upload New Document (Optional, Max 5MB)</label>
                        <input type="file" ref={fileInputRef} onChange={handleDocFileChange} className={inputClass(docErrors.file)} accept=".pdf,.jpg,.jpeg,.png" />
                        {docForm.file && !docErrors.file && (<p className="text-sm text-green-600 mt-2">Selected: {docForm.file.name} ({(docForm.file.size / 1024 / 1024).toFixed(2)} MB)</p>)}
                        {docErrors.file && <p className="text-red-500 text-sm mt-1">{docErrors.file}</p>}
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={handleUpdateDocument} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md">Save</button>
                        <button type="button" onClick={() => { resetDocForm(); setShowEditModal(false); setCurrentDoc(null); }} className="flex-1 px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
              {step > 0 ? (
                <button type="button" className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200" onClick={prevStep}>
                  ← Back
                </button>
              ) : <span />}
              {step < 3 ? (
                <button type="button" className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg" onClick={nextStep}>
                  Next →
                </button>
              ) : (
                <button type="button" disabled={isSubmitting} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmitApplication}>
                  {isSubmitting ? 'Submitting...' : '✓ Submit Application'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
