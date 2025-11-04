import React, { useRef, useState, useEffect } from "react";
import api from "./api";
import { Toaster, toast } from 'react-hot-toast';
import Header from './Header';
import Settings from '../HomePage/Settings.jsx';

import Data from './assets/data.json';

function Personal_info() {
    const fileInputRef = useRef(null);
    const panInputRef = useRef(null);
    const aadhaarInputRef = useRef(null);
    const photoInputRef = useRef(null);
    const [inputFileInfo, setInputFileInfo] = useState(null);
    const [panFileInfo, setPanFileInfo] = useState(null);
    const [aadhaarFileInfo, setAadhaarFileInfo] = useState(null);
    const [inputFileError, setInputFileError] = useState("");
    const [photoFileInfo, setPhotoFileInfo] = useState(null);

    const [aadhaarError, setAadhaarError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [ifscError, setIfscError] = useState('');
    const [fullNameError, setFullNameError] = useState('');

    const stateDistrictData = Array.isArray(Data)
        ? Data
        : Data && Data.states
            ? Data.states
            : [];


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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await api.get("/profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = response.data;
                


                // Populate file previews
                if (data.land_proof) {
                    setInputFileInfo({
                        name: data.land_proof.split("/").pop(),
                        preview: data.land_proof,
                    });


                }
                if (data.pan_card) {
                    setPanFileInfo({
                        name: data.pan_card.split("/").pop(),
                        preview: data.pan_card,
                    });
                }
                if (data.aadhaar_card) {
                  
                    setAadhaarFileInfo({
                        name: data.aadhaar_card.split("/").pop(),
                        preview: data.aadhaar_card,
                    });
                }
                if (data.photo) {
                    console.log("Hai photo par bata nhi raha");
                    setPhotoFileInfo({
                        name: data.photo.split("/").pop(),
                        preview: data.photo,
                    });
                }
                setFormData((prev) => ({
                    ...prev,
                    full_name: data.full_name || "",
                    email: data.email_address || "",
                    phone: data.mobile_number || "",
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

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateIFSC = (ifsc) => /^[A-Za-z]{4}0\d{6}$/.test(ifsc);
    const validateName = (name) => /^[A-Za-z\s]+$/.test(name);

    const handleSubmit = async () => {
        const btn = document.getElementById("submit_btn");
        btn.disabled = true;
        const token = localStorage.getItem("access");
        const data = new FormData();
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
            setTimeout('', 3000);
            btn.disabled = false;
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error('Failed to update Profile.')
            btn.disabled = false;
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            <Settings />
            {/* Main Section */}
            <div className="w-full max-w-5xl mx-auto px-8">
                <h1 className="font-extrabold text-3xl text-gray-900">Profile & Personal Details</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">
                    Manage your personal information, land details, and bank accounts. Keep your documents secure by uploading verified identity proofs.
                </p>

                {/* Personal Information Card */}
                <div className="bg-white rounded-2xl p-8 mt-6 shadow-lg ring-1 ring-gray-100">
                    <h2 className="text-green-700 font-semibold mb-6 text-xl">Personal Information</h2>

                    {/* Profile Image + Inputs */}
                    <div className="flex items-start gap-8 flex-wrap">
                        <div className="relative mr-6 ml-2">
                            <div
                                className="bg-gray-300 rounded-full w-28 h-28 flex items-center justify-center text-white font-semibold text-base shadow-md overflow-hidden cursor-pointer"
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

                                {photoFileInfo && photoFileInfo.preview ? (
                                    <img
                                        src={photoFileInfo.preview}
                                        alt="profile preview"
                                        className="w-full h-full object-cover"
                                    />
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


                        {/* Input Fields */}
                        <div className="flex flex-wrap gap-5 flex-1 ml-3">
                            <div className="flex flex-col w-80">
                                <label className="text-md font-semibold">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Full Name"
                                    value={formData.full_name}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                        handleInputChange(value, 'full_name')
                                        if (validateName(value)) setFullNameError('');
                                    }}
                                    onBlur={() => {
                                        if (formData.full_name && !validateName(formData.full_name)) {
                                            setFullNameError('Invalid full name.');
                                        } else {
                                            setFullNameError('');
                                        }
                                    }}
                                    className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300  focus:ring-2 focus:ring-green-600 focus:outline-none`}
                                />
                                {fullNameError && <div className="text-xs text-red-600 mt-1">{fullNameError}</div>}
                            </div>
                            <div className="flex flex-col w-80">
                                <label className="text-md font-semibold">Email Address</label>
                                <input
                                    type="text"
                                    placeholder="Enter Email Address"
                                    value={formData.email}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9a-zA-Z@._-]/g, '');
                                        handleInputChange(value, 'email');
                                        if (validateEmail(value)) setEmailError('');
                                    }}
                                    onBlur={() => {
                                        if (formData.email && !validateEmail(formData.email)) {
                                            setEmailError('Invalid email address.');
                                        } else {
                                            setEmailError('');
                                        }
                                    }}
                                    className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300  focus:ring-2 focus:ring-green-600 focus:outline-none`}
                                />
                                {emailError && <div className="text-xs text-red-600 mt-1">{emailError}</div>}

                            </div>
                            <div className="flex flex-col w-80 ">
                                <label className="text-md font-semibold">Phone Number</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="Enter Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
                                        handleInputChange(digits, 'phone');
                                        if (digits.length !== 10) setMobileError('');
                                    }}
                                    onBlur={() => {
                                        if (formData.phone && formData.phone.length !== 10) {
                                            setMobileError('Mobile number must be exactly 10 digits.');
                                        } else {
                                            setMobileError('');
                                        }
                                    }}
                                    className={`w-full h-12 rounded-md px-4 text-sm mt-1 border border-gray-300  focus:ring-2 focus:ring-green-600 focus:outline-none`}
                                />
                                {mobileError && <div className="text-xs text-red-600 mt-1">{mobileError}</div>}
                            </div>
                            <div className="flex flex-col w-80">
                                <label className="text-md font-semibold">Aadhaar Number</label>
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

                    {/* Location Fields */}
                    <div className="flex flex-wrap justify-between gap-6 mt-8">
                        <div className="flex flex-col flex-1 min-w-[180px]">
                            <label className="text-md font-semibold">State</label>
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
                            <label className="text-md font-semibold">District</label>
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
                            <label className="text-md font-semibold">Taluka</label>
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
                            <label className="text-md font-semibold">Village</label>
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

                    {/* Address Field */}
                    <div className="flex flex-col mt-6">
                        <label className="font-bold text-gray-800">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange(e.target.value, "address")}
                            maxLength={150}
                            placeholder="Enter Address"
                            className="w-full h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Land information */}
                <div className="bg-white rounded-2xl p-6 mt-6 shadow-lg ring-1 ring-gray-100">
                    <h2 className="text-green-700 font-semibold mb-6 text-xl">Land Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label className="text-md font-semibold">Land Size</label>
                            <input type="text" value={formData.land_size}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '');
                                    handleInputChange(digits, "land_size");
                                }} placeholder="Enter Land Size" className="h-12 border border-gray-300 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-md font-semibold">Unit</label>
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
                            <label className="text-md font-semibold">Soil Type</label>
                            <select
                                value={formData.soil_type}
                                onChange={(e) => handleInputChange(e.target.value, 'soil_type')}
                                className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none bg-white"
                            >
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
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700">Land Ownership Proof</label>
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

                            {inputFileInfo && (
                                <div className="mt-3 text-sm text-gray-500">
                                    {inputFileInfo.preview ? (
                                        <div className="flex items-center gap-3 justify-center">
                                            <img src={inputFileInfo.preview} alt={inputFileInfo.name} className="w-20 h-14 object-cover rounded" />
                                            <div>
                                                <div className="font-medium">{inputFileInfo.name}</div>
                                                <div className="text-xs">{(inputFileInfo.size / (1024 * 1024)).toFixed(1)} MB</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">{inputFileInfo.name}</div>
                                    )}
                                </div>
                            )}

                            {inputFileError && <div className="text-sm text-red-600 mt-2">{inputFileError}</div>}
                        </div>
                    </div>
                </div>

                {/* Bank & Identification */}
                <div className="bg-white rounded-2xl p-6 mt-6 shadow-lg ring-1 ring-gray-100 mb-8">
                    <h2 className="text-green-700 font-semibold mb-4 text-xl">Bank & Identification</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-md font-semibold">Bank Account Number</label>
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
                            <label className="text-md font-semibold">IFSC Code</label>
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
                        <label className="text-sm font-medium text-gray-700">Bank Name</label>
                        <input
                            type="text"
                            value={formData.bank_name}
                            onChange={(e) => handleInputChange(e.target.value, "bank_name")}
                            placeholder="Enter Bank Name"
                            className="w-full h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* PAN Card Upload */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">PAN Card</label>
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
                                </div>
                            </div>
                            {panFileInfo && panFileInfo.preview && (
                                <img src={panFileInfo.preview} alt={panFileInfo.name} className="mt-2 w-28 h-18 object-cover rounded" />
                            )}
                        </div>

                        {/* Aadhaar Card Upload */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Aadhaar Card</label>
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
                                </div>
                            </div>
                            {aadhaarFileInfo && aadhaarFileInfo.preview && (
                                <img src={aadhaarFileInfo.preview} alt={aadhaarFileInfo.name} className="mt-2 w-28 h-18 object-cover rounded" />
                            )}
                        </div>
                    </div>

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