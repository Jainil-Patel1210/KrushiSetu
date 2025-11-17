import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Data from './assets/data.json';
import api from './api1';
import Cookies from 'js-cookie';

export default function ApplySubsidy() {
  const navigate = useNavigate();
  const location = useLocation();
  const subsidyFromNav = location?.state?.subsidy || null;
  const subsidyTitle = subsidyFromNav?.title || null;

  // Wizard step and shared form state
  const [step, setStep] = useState(0);
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
  const [documents, setDocuments] = useState([]);
  const [pendingUploads, setPendingUploads] = useState([]);
  const fileInputRef = useRef(null);

  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [docForm, setDocForm] = useState({ document_type: '', number: '', file: null, name: '' });
  const [docErrors, setDocErrors] = useState({ document_type: '', number: '', file: '' });
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const DOCUMENTS_URL = '/subsidy/documents/';
  const APPLY_URL = '/subsidy/apply/';

  const DOC_TYPES = [
    { value: 'aadhar_card', label: 'Aadhaar' },
    { value: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque' },
    { value: 'land_records', label: 'Land documents/tenancy proof' },
    { value: 'pan_card', label: 'PAN Card' },
    { value: 'photo', label: 'Profile Photo' },
    { value: 'shg_membership', label: 'SHG membership' },
  ];

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

  const mergedDocs = [...pendingUploads, ...documents];

  const presentTypes = new Set(mergedDocs.map(d => d.document_type));
  const missingDocs = (subsidyFromNav?.documents_required || []).filter(r => !presentTypes.has((typeof r === 'string' ? r : (r.value || '')))).map(x => (typeof x === 'string' ? x : (x.label || x.value)));

  const handleView = (doc) => {
    if (doc.file) {
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

    if (doc.tempId) {
      setPendingUploads(prev => prev.filter(p => p.tempId !== doc.tempId));
      setCurrentDoc({ ...doc, isPending: true });
    }

    setShowEditModal(true);
  };

  const handleDelete = async (idOrTemp) => {
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

  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    const validation = { number: validateDocNumber(docForm.number), file: docForm.file ? validateDocFile(docForm.file) : '' };
    setDocErrors(validation);
    if (validation.number || validation.file) return;

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

    const uploadFormData = new FormData();
    uploadFormData.append('document_type', docForm.document_type || currentDoc.document_type);
    uploadFormData.append('document_number', docForm.number.trim());
    if (docForm.file) uploadFormData.append('file', docForm.file);

    setLoadingDocs(true);
    try {
      const response = await api.put(`${DOCUMENTS_URL}${currentDoc.id}/`, uploadFormData, {
        headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
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

    const created = await Promise.all(pendingUploads.map(p => uploadOne(p)));
    setDocuments(prev => [...created, ...prev]);
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

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? All unsaved changes will be lost.')) {
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 relative">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-lg px-8 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-green-600">
              {subsidyTitle ? `${subsidyTitle} Application` : 'Subsidy Application'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Step {step + 1} of 4</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form onSubmit={e => e.preventDefault()}>
            {/* Step 0: Personal */}
            <div className={`${step === 0 ? '' : 'hidden'} w-full`}>
              <h1 className='text-green-600 font-bold text-xl mb-6'>Personal Information</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="fullName">Full Name</label>
                  <input className={inputClass(errors.fullName)}
                    type="text" placeholder='Enter Full Name' id="fullName" name="fullName"
                    value={form.fullName}
                    onChange={(e) => { update('fullName', e.target.value); if (errors.fullName) validateField('fullName', e.target.value); }}
                    onBlur={(e) => validateField('fullName', e.target.value)} />
                  {errors.fullName ? <div className="text-red-500 text-sm mt-1">{errors.fullName}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="mobile">Mobile Number</label>
                  <input className={inputClass(errors.mobile)}
                    type="text" placeholder='Enter Mobile Number' id="mobile" name="mobile"
                    value={form.mobile}
                    onChange={(e) => { update('mobile', e.target.value); if (errors.mobile) validateField('mobile', e.target.value); }}
                    onBlur={(e) => validateField('mobile', e.target.value)} />
                  {errors.mobile ? <div className="text-red-500 text-sm mt-1">{errors.mobile}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="email">Email</label>
                  <input className={inputClass(errors.email)}
                    type="email" placeholder='Enter Email' id="email" name="email"
                    value={form.email}
                    onChange={(e) => { update('email', e.target.value); if (errors.email) validateField('email', e.target.value); }}
                    onBlur={(e) => validateField('email', e.target.value)} />
                  {errors.email ? <div className="text-red-500 text-sm mt-1">{errors.email}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="aadhar">Aadhar Number</label>
                  <input className={inputClass(errors.aadhar)}
                    type="text" placeholder='Enter Aadhar Number' id="aadhar" name="aadhar"
                    value={form.aadhar}
                    onChange={(e) => { update('aadhar', e.target.value); if (errors.aadhar) validateField('aadhar', e.target.value); }}
                    onBlur={(e) => validateField('aadhar', e.target.value)} />
                  {errors.aadhar ? <div className="text-red-500 text-sm mt-1">{errors.aadhar}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2">State</label>
                  <select value={stateValue} onChange={(e) => { setStateValue(e.target.value); setDistrictValue(''); setTalukaValue(''); setVillageValue(''); update('state', e.target.value); validateField('state', e.target.value); }}
                    className={inputClass(errors.state)}>
                    <option value="">Select State</option>
                    {Array.isArray(Data) && Data.map((stateData, index) => (<option key={index} value={stateData.state}>{stateData.state}</option>))}
                  </select>
                  {errors.state ? <div className="text-red-500 text-sm mt-1">{errors.state}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2">District</label>
                  <select value={districtValue} onChange={(e) => { setDistrictValue(e.target.value); setTalukaValue(''); setVillageValue(''); update('district', e.target.value); validateField('district', e.target.value); }}
                    className={inputClass(errors.district)}>
                    <option value="">Select District</option>
                    {stateValue && Array.isArray(Data) && Data.find(s => s.state === stateValue)?.districts.map((districtData, index) => (<option key={index} value={districtData.district}>{districtData.district}</option>))}
                  </select>
                  {errors.district ? <div className="text-red-500 text-sm mt-1">{errors.district}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2">Taluka</label>
                  <select value={talukaValue} onChange={(e) => { setTalukaValue(e.target.value); setVillageValue(''); update('taluka', e.target.value); validateField('taluka', e.target.value); }}
                    className={inputClass(errors.taluka)}>
                    <option value="">Select Taluka</option>
                    {districtValue && stateValue && Data && Array.isArray(Data) && Data.find(s => s.state === stateValue)?.districts.find(d => d.district === districtValue)?.subDistricts.map((subDistrictData, index) => (<option key={index} value={subDistrictData.subDistrict}>{subDistrictData.subDistrict}</option>))}
                  </select>
                  {errors.taluka ? <div className="text-red-500 text-sm mt-1">{errors.taluka}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2">Village</label>
                  <select value={villageValue} onChange={(e) => { setVillageValue(e.target.value); update('village', e.target.value); validateField('village', e.target.value); }}
                    className={inputClass(errors.village)}>
                    <option value="">Select Village</option>
                    {talukaValue && districtValue && stateValue && Data && Array.isArray(Data) && Data.find(s => s.state === stateValue)?.districts.find(d => d.district === districtValue)?.subDistricts.find(sd => sd.subDistrict === talukaValue)?.villages.map((village, index) => (<option key={index} value={village}>{village}</option>))}
                  </select>
                  {errors.village ? <div className="text-red-500 text-sm mt-1">{errors.village}</div> : null}
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-black font-semibold mb-2" htmlFor="address">Address</label>
                  <input className={inputClass(errors.address)}
                    type="text" placeholder='Enter Address' id="address" name="address"
                    value={form.address}
                    onChange={(e) => { update('address', e.target.value); if (errors.address) validateField('address', e.target.value); }}
                    onBlur={(e) => validateField('address', e.target.value)} />
                  {errors.address ? <div className="text-red-500 text-sm mt-1">{errors.address}</div> : null}
                </div>
              </div>
            </div>

            {/* Step 1: Land details */}
            <div className={`${step === 1 ? '' : 'hidden'} w-full`}>
              <h1 className='text-green-600 font-bold text-xl mb-6'>Land Information</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="landArea">Land Area</label>
                  <input className={inputClass(errors.landArea)} type="number" id="landArea" name="landArea" placeholder="Enter land area" value={form.landArea} onChange={(e) => { update('landArea', e.target.value); if (errors.landArea) validateField('landArea', e.target.value); }} onBlur={(e) => validateField('landArea', e.target.value)} />
                  {errors.landArea ? <div className="text-red-500 text-sm mt-1">{errors.landArea}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="landAreaUnit">Land Area Unit</label>
                  <select className={inputClass(errors.unit)} id="landAreaUnit" name="landAreaUnit" value={unitValue} onChange={(e) => { setUnitValue(e.target.value); update('unit', e.target.value); validateField('unit', e.target.value); }}>
                    <option value="">Select Unit</option>
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                  {errors.unit ? <div className="text-red-500 text-sm mt-1">{errors.unit}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="soilType">Soil Type</label>
                  <select className={inputClass(errors.soilType)} id="soilType" name="soilType" value={soilTypeValue} onChange={(e) => { setSoilTypeValue(e.target.value); update('soilType', e.target.value); validateField('soilType', e.target.value); }}>
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
                  <label className="text-black font-semibold mb-2" htmlFor="ownership">Ownership Type</label>
                  <select className={inputClass(errors.ownership)} id="ownership" name="ownership" value={form.ownership} onChange={(e) => { update('ownership', e.target.value); validateField('ownership', e.target.value); }}>
                    <option value="">Select Ownership</option>
                    <option value="owned">Owned</option>
                    <option value="leased">Leased</option>
                  </select>
                  {errors.ownership ? <div className="text-red-500 text-sm mt-1">{errors.ownership}</div> : null}
                </div>
              </div>
            </div>

            {/* Step 2: Bank details */}
            <div className={`${step === 2 ? '' : 'hidden'} w-full`}>
              <h1 className='text-green-600 font-bold text-xl mb-6'>Bank Details</h1>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="bankName">Bank Name</label>
                  <input className={inputClass(errors.bankName)} type="text" id="bankName" name="bankName" placeholder="Enter bank name" value={form.bankName} onChange={(e) => { update('bankName', e.target.value); if (errors.bankName) validateField('bankName', e.target.value); }} onBlur={(e) => validateField('bankName', e.target.value)} />
                  {errors.bankName ? <div className="text-red-500 text-sm mt-1">{errors.bankName}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="ifscCode">IFSC Code</label>
                  <input className={inputClass(errors.ifsc)} type="text" id="ifscCode" name="ifscCode" placeholder="Enter IFSC code" value={form.ifsc} onChange={(e) => { update('ifsc', e.target.value); if (errors.ifsc) validateField('ifsc', e.target.value); }} onBlur={(e) => validateField('ifsc', e.target.value)} />
                  {errors.ifsc ? <div className="text-red-500 text-sm mt-1">{errors.ifsc}</div> : null}
                </div>

                <div className="flex flex-col">
                  <label className="text-black font-semibold mb-2" htmlFor="accountNumber">Account Number</label>
                  <input className={inputClass(errors.bankAccount)} type="text" id="accountNumber" name="accountNumber" placeholder="Enter account number" value={form.bankAccount} onChange={(e) => { update('bankAccount', e.target.value); if (errors.bankAccount) validateField('bankAccount', e.target.value); }} onBlur={(e) => validateField('bankAccount', e.target.value)} />
                  {errors.bankAccount ? <div className="text-red-500 text-sm mt-1">{errors.bankAccount}</div> : null}
                </div>
              </div>
            </div>

            {/* Step 3: Documents */}
            <div className={`${step === 3 ? '' : 'hidden'} w-full`}>
              <h1 className='text-green-600 font-bold text-xl mb-6'>Upload Documents</h1>

              {missingDocs.length > 0 && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                  <strong>Missing required documents:</strong> {missingDocs.map(prettifyLabel).join(', ')}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                {mergedDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No documents uploaded yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Use the button below to upload required documents.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-100">
                          <th className="py-2 px-4 text-left">Sr.</th>
                          <th className="py-2 px-4 text-left">Name</th>
                          <th className="py-2 px-4 text-left">Number</th>
                          <th className="py-2 px-4 text-left">Date</th>
                          <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mergedDocs.map((doc, i) => (
                          <tr key={doc.id ?? doc.tempId} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{i + 1}.</td>
                            <td className="py-2 px-4">{doc.title || DOC_TYPES.find(d => d.value === doc.document_type)?.label || prettifyLabel(doc.document_type)}</td>
                            <td className="py-2 px-4">{doc.document_number || ''}</td>
                            <td className="py-2 px-4">{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ''}</td>
                            <td className="py-2 px-4">
                              <div className="flex gap-2">
                                <button type="button" onClick={() => handleView(doc)} className="px-2 py-1 text-sm border border-green-600 text-green-600 rounded hover:bg-green-50">View</button>
                                <button type="button" onClick={() => handleEdit(doc)} className="px-2 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50">Edit</button>
                                <button type="button" onClick={() => handleDelete(doc.id ?? doc.tempId)} className="px-2 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-50">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-center mt-6">
                  <button type="button" onClick={() => { resetDocForm(); openAddModalForRequired(); }} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Add Documents</button>
                </div>
              </div>

              {/* Add Document Modal */}
              {showAddDocModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-2xl font-bold mb-4 text-green-700">Add New Document</h3>
                    <div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Select Document Type</label>
                        <select name="document_type" value={docForm.document_type} onChange={e => setDocForm(f => ({ ...f, document_type: e.target.value }))} className={inputClass(docErrors.document_type)}>
                          <option value="">-- Select Document --</option>
                          {addModalTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                        </select>
                        {docErrors.document_type && <p className="text-red-500 text-sm mt-1">{docErrors.document_type}</p>}
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Document Number</label>
                        <input type="text" value={docForm.number} onChange={e => { setDocForm(f => ({ ...f, number: e.target.value })); setDocErrors(prev => ({ ...prev, number: '' })); }} className={inputClass(docErrors.number)} placeholder="e.g., ABC1234567" />
                        {docErrors.number && <p className="text-red-500 text-sm mt-1">{docErrors.number}</p>}
                      </div>

                      <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Upload Document (Max 5MB)</label>
                        <input type="file" ref={fileInputRef} onChange={handleDocFileChange} className="w-full" accept=".pdf,.jpg,.jpeg,.png" />
                        {docForm.file && !docErrors.file && (<p className="text-sm text-green-600 mt-2">Selected: {docForm.file.name} ({(docForm.file.size / 1024 / 1024).toFixed(2)} MB)</p>)}
                        {docErrors.file && <p className="text-red-500 text-sm mt-1">{docErrors.file}</p>}
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={handleAddDocument} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Stage Document</button>
                        <button type="button" onClick={() => { resetDocForm(); setShowAddDocModal(false); }} className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Document Modal */}
              {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                        <button type="button" onClick={handleUpdateDocument} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save</button>
                        <button type="button" onClick={() => { resetDocForm(); setShowEditModal(false); setCurrentDoc(null); }} className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer with Navigation Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg px-8 py-4 flex justify-between items-center">
          {step > 0 ? (
            <button type="button" className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={prevStep}>Back</button>
          ) : <span />}
          {step < 3 ? (
            <button type="button" className="bg-green-600 text-white rounded-md px-6 py-2 hover:bg-green-700" onClick={nextStep}>Next</button>
          ) : (
            <button type="button" disabled={isSubmitting} className="bg-green-600 text-white rounded-md px-6 py-2 hover:bg-green-700 disabled:bg-gray-400" onClick={handleSubmitApplication}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
