import React, { useRef, useState, useEffect } from "react";
import api from "./api";
import { Toaster, toast } from 'react-hot-toast';
import Header from './Header';
import Settings from '../HomePage/Settings.jsx';
import Data from './assets/data.json';

function Personal_info() {

    // Refs for file inputs
    const fileInputRef = useRef(null);
    const panInputRef = useRef(null);
    const aadhaarInputRef = useRef(null);
    const photoInputRef = useRef(null);

    // State for file previews
    const [inputFileInfo, setInputFileInfo] = useState(null);
    const [panFileInfo, setPanFileInfo] = useState(null);
    const [aadhaarFileInfo, setAadhaarFileInfo] = useState(null);
    const [photoFileInfo, setPhotoFileInfo] = useState(null);

    // State for file errors
    const [inputFileError, setInputFileError] = useState("");
    const [aadhaarError, setAadhaarError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [ifscError, setIfscError] = useState('');
    const [fullNameError, setFullNameError] = useState('');

    // File upload limits
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB file limit
    const Accepted_inputFile_Type = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        aadhaar_number: "",
        state: "",
        unit: "",
        district: "",
        taluka: "",
        village: "",
        address: "",
        land_size: "",
        soil_type: "",
        ownership_type: "",
        bank_account_number: "",
        ifsc_code: "",
        bank_name: "",
        photo: null,
        pan_card: null,
        aadhaar_card: null,
        land_proof: null,
    });

    // Soil type options
    const soil_type_data = [
        "Alluvial",
        "Black",
        "Red & Yellow",
        "Laterite",
        "Arid",
        "Forest & Mountain",
        "Saline & Alkaline",
        "Peaty",
        "Marshy"
    ]

    // Render file preview
    const renderFilePreview = (fileInfo) => {
        if (!fileInfo) return null;

        // Determine what preview to show
        let previewSrc = null;
        if (fileInfo.preview) previewSrc = fileInfo.preview;
        else if (fileInfo.url) previewSrc = fileInfo.url;

        return (
            <div className="flex items-center gap-3 justify-center mt-3">
                {previewSrc ? (
                    <img
                        src={previewSrc}
                        alt={fileInfo.name || "preview"}
                        className="w-20 h-14 object-cover rounded"
                    />
                ) : (
                    <div className="text-xs">{fileInfo.name}</div>
                )}
                {fileInfo.size && (
                    <div className="text-xs">
                        {(fileInfo.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                )}
            </div>
        );  
    };

    // Fetch profile data 
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await api.get("/profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = response.data;
                console.log("Fetched profile data:", data);

                const createFilePreview = (fileOrUrl) => {
                    if (!fileOrUrl) return null;

                    if (typeof fileOrUrl === "string") {
                        // Could be full URL or just a file name
                        const isUrl = fileOrUrl.startsWith("http") || fileOrUrl.includes("://");
                        return {
                            name: fileOrUrl.split("/").pop(),
                            url: isUrl ? fileOrUrl : null,
                            preview: isUrl ? fileOrUrl : null,
                            size: null,
                        };
                    }

                    // Local File object
                    return {
                        name: fileOrUrl.name,
                        preview: fileOrUrl.type.startsWith("image/") ? URL.createObjectURL(fileOrUrl) : null,
                        size: fileOrUrl.size,
                    };
                };


                setInputFileInfo(createFilePreview(data.land_proof_url));
                setPanFileInfo(createFilePreview(data.pan_card_url));
                setAadhaarFileInfo(createFilePreview(data.aadhaar_card_url));
                setPhotoFileInfo(createFilePreview(data.photo_url));

                const phone = data.mobile_number.slice(-10); // Get last 10 digits

                setFormData(prev => ({
                    ...prev,
                    full_name: data.full_name || "",
                    email: data.email_address || "",
                    phone: phone || "",
                    aadhaar_number: data.aadhaar_number || "",
                    state: data.state || "",
                    district: data.district || "",
                    taluka: data.taluka || "",
                    village: data.village || "",
                    address: data.address || "",
                    land_size: data.land_size || "",
                    unit: data.unit || "",
                    soil_type: data.soil_type || "",  
                    ownership_type: data.ownership_type || "",
                    bank_account_number: data.bank_account_number || "",
                    ifsc_code: data.ifsc_code || "",
                    bank_name: data.bank_name || "",
                }));
            } catch (err) {
                console.error("Error fetching profile:", err);
                toast.error("Failed to fetch profile.");
            }
        };

        fetchProfile();
    }, []);


    const handleInputChange = (value, fieldName) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
    };

    const handleInputFileSelection = (file, type) => {
        setInputFileError("");

        if (file.size > MAX_FILE_SIZE) {
            setInputFileError("File is too large.");
            return;
        }

        if (!Accepted_inputFile_Type.includes(file.type)) {
            setInputFileError("Invalid file type. Please select a PDF or image file.");
            return;
        }

        const previewObj = {
            name: file.name,
            size: file.size,
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        };

        if (type === "land_proof") setInputFileInfo(previewObj);
        else if (type === "pan_card") setPanFileInfo(previewObj);
        else if (type === "aadhaar_card") setAadhaarFileInfo(previewObj);
        else if (type === "photo") setPhotoFileInfo(previewObj);
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, [fieldName]: file }));
            handleInputFileSelection(file, fieldName);
        }
    };

    const handleInputFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, [type]: file }));
            handleInputFileSelection(file, type);
            setPhotoFileInfo({ file, preview });
        }
    };


    const onDragOver = (e) => {
        e.preventDefault();
    }

    const onDrop = (e, type) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleInputFileSelection(file, type);
    }

    const validateIFSC = (ifsc) => /^[A-Za-z]{4}0\d{6}$/.test(ifsc);

    const handleSubmit = async () => {
        const btn = document.getElementById("submit_btn");
        btn.disabled = true;
        const token = localStorage.getItem("access");
        const data = new FormData();
        console.log("Submitting form data:", formData);
        Object.keys(formData).forEach((key) => {
            if (formData[key]) data.append(key, formData[key]);
        });

        try {
            await api.put("/profile/", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Profile updated successfully!");
            btn.disabled = false;
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error('Failed to update Profile.');
            btn.disabled = false;
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            <Settings />

            <div className="w-full lg:max-w-5xl md:max-w-4xl mx-auto px-8 mt-8">
                <h1 className="font-extrabold text-3xl text-gray-900">Profile & Personal Details</h1>
                <p className="text-gray-600 mt-2 lg:max-w-2xl md:max-w-xl">
                    Manage your personal information, land details, and bank accounts. Keep your documents secure by uploading verified identity proofs.
                </p>

                {/* -------------------------------------------------------Personal Information---------------------------------------------- */}
                <div className=" bg-white rounded-2xl p-8 mt-6 shadow-lg ring-1 ring-gray-100">
                    <h2 className="text-green-700 font-semibold mb-6 text-xl">Personal Information</h2>
                        <div className="flex flex-col sm:flex-col md:flex-row items-start gap-8 flex-wrap">
                            {/* ------------------Photo Upload------------------ */}
                            <div className="relative md:mr-6 md:ml-2 mx-auto ">
                                <div className="bg-gray-300 rounded-full w-28 h-28 flex items-center justify-center text-white font-semibold text-base shadow-md overflow-hidden cursor-pointer"
                                    onClick={() => photoInputRef.current?.click()}
                                    onDragOver={(e) => {
                                    e.preventDefault(); // needed for drop to work
                                    onDragOver(e);
                                    }}
                                    onDrop={(e) => onDrop(e, 'photo')}
                                >
                                    <input
                                        type="file"
                                        ref={photoInputRef}
                                        className="hidden"
                                        onChange={(e) => handleInputFileUpload(e, 'photo')}
                                    />
                                    {photoFileInfo ? (
                                        photoFileInfo.preview ? (
                                            <img
                                                src={photoFileInfo.preview}
                                                alt={photoFileInfo.name || "profile preview"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src="./Camero.jpg"
                                                alt="default profile"
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                    ) : (
                                        <img
                                            src="./Camero.jpg"
                                            alt="default profile"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Click to upload photo
                                </p>
                            </div>

                            <div className="flex flex-wrap md:flex-row sm:flex-col gap-5 flex-1 ml-3">
                                <div className="flex flex-col lg:w-80 sm:w-75">
                                    <label className="text-md font-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Full Name"
                                        value={formData.full_name}
                                        disabled
                                        className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300 bg-gray-50 cursor-not-allowed`}
                                    />
                                </div>
                                <div className="flex flex-col lg:w-80 sm:w-75">
                                    <label className="text-md font-semibold">Email Address</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Email Address"
                                        value={formData.email}
                                        disabled
                                        className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300 bg-gray-50 cursor-not-allowed`}
                                    />
                                </div>
                                <div className="flex flex-col lg:w-80 sm:w-75">
                                    <label className="text-md font-semibold">Phone Number</label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="Enter Phone Number"
                                        value={formData.phone}
                                        disabled
                                        className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300 bg-gray-50 cursor-not-allowed`}
                                    />
                                </div>
                                <div className="flex flex-col lg:w-80 sm:w-75">
                                    <label className="text-md font-semibold">Aadhaar Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Enter Aadhaar Number"
                                        value={formData.aadhaar_number}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            handleInputChange(digits, 'aadhaar_number');
                                            if (digits.length === 12) setAadhaarError('');
                                        }}
                                        onBlur={() => {
                                            if (formData.aadhaar_number && formData.aadhaar_number.length !== 12) {
                                                setAadhaarError('Aadhaar number must be exactly 12 digits.');
                                            } else {
                                                setAadhaarError('');
                                            }
                                        }}
                                        className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300 focus:ring-2 focus:ring-green-600 focus:outline-none`}
                                    />
                                    {aadhaarError && <div className="text-xs text-red-600 mt-1">{aadhaarError}</div>}
                                </div>
                            </div>
                        </div>

                        {/* ------------------Address Information------------------ */}
                        <div className="flex flex-wrap justify-between gap-6 mt-8">
                            <div className="flex flex-col flex-1 lg:min-w-[180px] sm:min-w-[150px]">
                                <label className="text-md font-semibold">State <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.state}
                                    onChange={(e) => {
                                        handleInputChange(e.target.value, 'state');
                                    }}
                                    className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white">
                                    <option value="">Select State</option>
                                    {Data && Data.map((stateData, index) => (
                                        <option key={index} value={stateData.state}>
                                            {stateData.state}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col flex-1 min-w-[180px]">
                                <label className="text-md font-semibold">District <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.district}
                                    onChange={(e) => {
                                        handleInputChange(e.target.value, 'district');
                                    }}
                                    className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                    >
                                    <option value="">Select District</option>
                                    {formData.state && Data && Array.isArray(Data) && Data.find(s => s.state === formData.state)?.districts.map((districtData, index) => (
                                        <option key={index} value={districtData.district}>{districtData.district}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col flex-1 min-w-[180px]">
                                <label className="text-md font-semibold">Taluka <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.taluka}
                                    onChange={(e) => {
                                        handleInputChange(e.target.value, 'taluka');
                                    }}
                                    className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                >
                                    <option value="">Select Taluka</option>
                                    {formData.district && formData.state && Data && Array.isArray(Data) && Data.find(s => s.state === formData.state)?.districts.find(d => d.district === formData.district)?.subDistricts.map((subDistrictData, index) => (
                                        <option key={index} value={subDistrictData.subDistrict}>
                                            {subDistrictData.subDistrict}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col flex-1 min-w-[180px]">
                                <label className="text-md font-semibold">Village <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.village}
                                    onChange={(e) =>
                                        handleInputChange(e.target.value, 'village')
                                    }
                                    className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                >
                                    <option value="">Select Village</option>
                                    {formData.taluka && formData.district && formData.state && Data && Array.isArray(Data) && Data.find(s => s.state === formData.state)
                                        ?.districts.find(d => d.district === formData.district)?.subDistricts.find(sd => sd.subDistrict === formData.taluka)?.villages.map((village, index) => (
                                            <option key={index} value={village}>{village}</option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col mt-6">
                            <label className="font-semibold">Address <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => handleInputChange(e.target.value, "address")}
                                maxLength={150}
                                placeholder="Enter Address"
                                className="md:w-full h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* -------------------------------------------------------Land Information---------------------------------------------- */}
                    <div className="bg-white rounded-2xl p-6 mt-6 shadow-lg ring-1 ring-gray-100">
                        <h2 className="text-green-700 font-semibold mb-6 text-xl">Land Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label className="text-md font-semibold">Land Size <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.land_size}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/[^0-9.]/g, '');
                                        handleInputChange(digits, "land_size");
                                    }} placeholder="Enter Land Size" className="h-12 border border-gray-300 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-md font-semibold">Unit <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange(e.target.value, 'unit')}
                                    className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                >
                                    <option value="">Select Unit</option>
                                    <option value="hectares">Hectares</option>
                                    <option value="acres">Acres</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-md font-semibold">Soil Type <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.soil_type}
                                    onChange={(e) => handleInputChange(e.target.value, 'soil_type')}
                                    className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                                >
                                    <option value="">Select Soil Type</option>
                                    {soil_type_data.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="text-sm font-semibold">Land Ownership Proof <span className="text-red-500">*</span></label>
                        </div>
                        <div>
                            <div
                                className={`border-2 border-dashed p-6 mt-3 text-center cursor-pointer rounded-lg transition-all duration-200 ${inputFileError ? "border-red-600 bg-red-50" : "border-gray-200 bg-gray-50"
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, "land_proof")}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, "land_proof")}
                                />
                                <div className="flex flex-col items-center text-gray-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-12 h-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l3-3m-3 3L9 10" />
                                        <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    </svg>
                                    <div className="mt-2">
                                        <div className="font-medium">Click to upload or drag & drop</div>
                                        <div className="text-xs">PDF or Image (Max 5MB)</div>
                                    </div>
                                </div>

                                {renderFilePreview(inputFileInfo)}
                                {inputFileError && <div className="text-sm text-red-600 mt-2">{inputFileError}</div>}
                            </div>
                        </div>
                    </div>

                    {/* -------------------------------------------------------Bank & Identification---------------------------------------------- */}
                    <div className="bg-white rounded-2xl p-6 mt-6 shadow-lg ring-1 ring-gray-100 mb-8">
                        <h2 className="text-green-700 font-semibold mb-4 text-xl">Bank & Identification</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-md font-semibold">Bank Account Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Enter Account Number"
                                    value={formData.bank_account_number}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '');
                                        handleInputChange(digits, 'bank_account_number')
                                    }}
                                    className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300 focus:ring-2 focus:ring-green-600 focus:outline-none`}
                                />
                            </div>
                            <div>
                                <label className="text-md font-semibold">IFSC Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Enter IFSC Code"
                                    value={formData.ifsc_code}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 11);
                                        handleInputChange(digits, 'ifsc_code');
                                        if (validateIFSC(digits)) setIfscError('');
                                    }}
                                    onBlur={() => {
                                        if (formData.ifsc_code && !validateIFSC(formData.ifsc_code)) {
                                            setIfscError('IFSC code must be exactly 11 characters.');
                                        } else {
                                            setIfscError('');
                                        }
                                    }}
                                    className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300 focus:ring-2 focus:ring-green-600 focus:outline-none`}
                                />
                                {ifscError && <div className="text-xs text-red-600 mt-1">{ifscError}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col mt-4">
                            <label className="text-sm font-semibold">Bank Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.bank_name}
                                onChange={(e) => handleInputChange(e.target.value, "bank_name")}
                                placeholder="Enter Bank Name"
                                className="w-full h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-semibold">PAN Card <span className="text-red-500">*</span></label>
                                <div
                                    className={`border-2 border-dashed p-3 rounded-md mt-1 ${inputFileError ? "border-red-600 bg-red-50" : "border-gray-200 bg-gray-50"
                                        }`}
                                    onClick={() => panInputRef.current?.click()}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, "pan_card")}
                                >
                                    <input
                                        type="file"
                                        ref={panInputRef}
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, "pan_card")}
                                        accept=".pdf,image/*"
                                    />
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l3-3m-3 3L9 10" />
                                            <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        </svg>
                                        <span className="text-sm">Click to upload PAN (PDF / Image)</span>
                                        {renderFilePreview(panFileInfo)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-semibold">Aadhaar Card <span className="text-red-500">*</span></label>
                                <div
                                    className={`border-2 border-dashed p-3 rounded-md mt-1 ${inputFileError ? "border-red-600 bg-red-50" : "border-gray-200 bg-gray-50"
                                        }`}
                                    onClick={() => aadhaarInputRef.current?.click()}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, "aadhaar_card")}
                                >
                                    <input
                                        type="file"
                                        ref={aadhaarInputRef}
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, "aadhaar_card")}
                                        accept=".pdf,image/*"
                                    />
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l3-3m-3 3L9 10" />
                                            <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        </svg>
                                        <span className="text-sm">Click to upload Aadhaar (PDF / Image)</span>
                                        {renderFilePreview(aadhaarFileInfo)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* -------------------------------------------------------Submit & Clear---------------------------------------------- */}
                        <div className="flex gap-3 justify-end mt-6">
                            <button className="px-5 py-2 rounded-md bg-white border border-gray-200 text-gray-700">Cancel</button>
                            <button
                                className="px-5 py-2 rounded-md bg-green-600 text-white shadow hover:bg-green-700"
                                id="submit_btn"
                                onClick={handleSubmit}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
        </>
    );
}

export default Personal_info;