import React,{useRef,useState} from 'react';

function Personal_info() {
    const fileInputRef = useRef(null);
    const panInputRef = useRef(null);
    const aadhaarInputRef = useRef(null);
    const [inputFileInfo,setInputFileInfo]=useState(null);
    const [inputFileError,setInputFileError]=useState('');
    const [panFileInfo,setPanFileInfo]=useState(null);
    const [aadhaarFileInfo,setAadhaarFileInfo]=useState(null);

    const MAX_FILE_SIZE=5*1024*1024; //5MB file limit
    const Accepted_inputFile_Type = ['application/pdf','image/jpeg','image/png','image/jpg'];

    function handleInputFileSelection(file,type){
        setInputFileError('');

        if(file.size>MAX_FILE_SIZE){
            setInputFileError('File is too large.');
            return;
        }

        if(!Accepted_inputFile_Type.includes(file.type)){
            setInputFileError('Invalid file type. Please select a PDF or image file.');
            return;
        }

        if(type==='landOwnershipProof'){
            setInputFileInfo({
                name: file.name,
                size: file.size,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            });
        }else if(type === 'panCard'){
            setPanFileInfo({
                name: file.name,
                size: file.size,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            });
        }else if(type === 'aadhaarCard'){
            setAadhaarFileInfo({
                name: file.name,
                size: file.size,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            });
        }
    }

    const handleInputFileUpload=(e,type)=>{
        const file=e.target.files[0];
        if(file)handleInputFileSelection(file,type);
    };


    const onDragOver = (e) => {
        e.preventDefault();
    }

    const onDrop = (e,type) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleInputFileSelection(file,type);
    }

    return (
        <>
            {/* Header Section */}
            <div className="flex justify-between mt-4 px-8">
                <div></div>
                <div className="flex gap-2 items-center">
                    <img src="./Notification.svg" alt="Notification" />
                    <img src="./Account.svg" alt="Account" className="w-7 h-7" />
                </div>
            </div>

            <hr role="separator" className="my-4 border-t border-gray-300" />

            {/* Main Section */}
            <div className="w-full max-w-5xl mx-auto px-8">
                <h1 className="font-extrabold text-3xl text-gray-900">Profile & Personal Details</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">Manage your personal information, land details, and bank accounts. Keep your documents secure by uploading verified identity proofs.</p>

                {/* Personal Information Card */}
                <div className="bg-white rounded-2xl p-8 mt-6 shadow-lg ring-1 ring-gray-100">
                    <h2 className="text-green-700 font-semibold mb-6 text-xl">Personal Information</h2>

                    {/* Profile Image + Inputs */}
                    <div className="flex items-start gap-8 flex-wrap">
                        <div className="relative mr-6 ml-2">
                            <div className="bg-gray-300 rounded-full w-28 h-28 flex items-center justify-center text-white font-semibold text-base shadow-md overflow-hidden">
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">Click to upload photo</p>
                        </div>

                        {/* Input Fields */}
                        <div className="flex flex-wrap gap-5 flex-1 lg:ml-3">
                            <div className="flex flex-col w-80">
                                <label className="text-md font-semibold">Full Name</label>
                                <input type="text" placeholder="Enter Full Name" className="w-full h-12 border border-gray-200 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none "/>
                            </div>
                            <div className="flex flex-col w-80">
                                <label className="text-md font-semibold">Email Address</label>
                                <input type="email" placeholder="Enter Email Address" className="w-full h-12 border border-gray-200 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                            </div>
                            <div className="flex flex-col w-80 ">
                                <label className="text-md font-semibold">Phone Number</label>
                                <input type="tel" placeholder="Enter Phone Number" className="w-full h-12 border border-gray-200 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                            </div>
                            <div className="flex flex-col w-80">
                                <label className="text-md font-semibold">Aadhaar Number</label>
                                <input type="text" placeholder="Enter Aadhaar Number" className="w-full h-12 border border-gray-200 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                            </div>
                        </div>
                    </div>

                    {/* Location Fields */}
                    <div className="flex flex-wrap justify-between gap-6 mt-3 lg:mt-8">
                        <div className="flex flex-col flex-1 min-w-[180px]">
                            <label className="text-md font-semibold">State</label>
                            <input type="text" placeholder="Enter State" className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                        <div className="flex flex-col flex-1 min-w-[180px]">
                            <label className="text-md font-semibold">District</label>
                            <input type="text" placeholder="Enter District" className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                        <div className="flex flex-col flex-1 min-w-[180px]">
                            <label className="text-md font-semibold">Taluka</label>
                            <input type="text" placeholder="Enter Taluka" className="h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                        <div className="flex flex-col flex-1 min-w-[180px]">
                            <label className="text-md font-semibold">Village</label>
                            <input type="text" placeholder="Enter Village" className="h-12 border border-gray-300 rounded-md px-4  text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                    </div>

                    {/* Address Field */}
                    <div className="flex flex-col mt-6">
                        <label className="text-md font-semibold">Address</label>
                        <input type="text" placeholder="Enter Address" className="w-full h-12 border border-gray-300 rounded-md px-4 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                    </div>
                </div>

                {/* Land information */}
                <div className="bg-white rounded-2xl p-6 mt-6 shadow-lg ring-1 ring-gray-100">
                    <h2 className="text-green-700 font-semibold mb-6 text-xl">Land Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <label className="text-md font-semibold">Land Size</label>
                            <input type="text" placeholder="Enter Land Size" className="h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-md font-semibold">Unit</label>
                            <input type="text" placeholder="Unit" className="h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-md font-semibold">Soil Type</label>
                            <input type="text" placeholder="Enter Soil Type" className="h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-md font-semibold">Ownership Type</label>
                            <input type="text" placeholder="Enter Ownership Type" className="h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                    </div>
                    <div className='mt-4'>
                        <label className="text-md font-semibold">Land Ownership Proof</label>
                    </div>

                    <div>
                        <div className={`border-2 border-dashed p-6 mt-3 text-center cursor-pointer rounded-lg transition-all duration-200 ${inputFileError ? 'border-red-600 bg-red-50' : 'border-green-600 bg-gray-50'}`}
                        onClick={()=> fileInputRef.current?.click()}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, 'landOwnershipProof')}>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleInputFileUpload(e, 'landOwnershipProof')} />
                        <div className='flex flex-col items-center text-gray-600'> 
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l3-3m-3 3L9 10" />
                                <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            </svg>
                            <div className='mt-2'>
                                <div className='font-medium'>Click to upload or drag & drop</div>
                                <div className='text-xs'>PDF or Image (Max 5MB)</div>
                            </div>
                        </div>
                        
                        {inputFileInfo && (
                            <div className='mt-3 text-sm text-gray-500'>
                                {inputFileInfo.preview ? (
                                    <div className='flex items-center gap-3 justify-center'>
                                        <img src={inputFileInfo.preview} alt={inputFileInfo.name} className='w-20 h-14 object-cover rounded' />
                                        <div>
                                            <div className='font-medium'>{inputFileInfo.name}</div>
                                            <div className='text-xs text-gray-500'>{(inputFileInfo.size / (1024*1024)).toFixed(1)} MB</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='text-center'>{inputFileInfo.name}</div>
                                )}
                            </div>
                        )}

                        {inputFileError && <div className="text-sm text-red-600 mt-2">{inputFileError}</div>}
                        </div>
                    </div>
                </div>

                {/* Bank details */}
                <div className="bg-white rounded-2xl p-6 mt-6 shadow-lg ring-1 ring-gray-100 mb-8">
                    <h2 className="text-green-700 font-semibold mb-4 text-xl">Bank & Identification</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-md font-semibold">Bank Account Number</label>
                            <input type="text" placeholder="Enter Account Number" className="w-full h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none "/>
                        </div>
                        <div>
                            <label className="text-md font-semibold">IFSC Code</label>
                            <input type="text" placeholder="Enter IFSC Code" className="w-full h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                        </div>
                    </div>
                    <div className="flex flex-col mt-4">
                        <label className="text-md font-semibold">Bank Name</label>
                        <input type="text" placeholder="Enter Bank Name" className="w-full h-12 border border-gray-200 rounded-md px-3 text-sm mt-1 focus:ring-2 focus:ring-green-600 focus:outline-none"/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="flex flex-col">
                            <label className="text-md font-semibold">PAN Card</label>
                            <div className={`border-2 border-dashed p-3 rounded-md mt-1 ${inputFileError ? 'border-red-600 bg-red-50' : 'border-green-600 bg-gray-50'}`} onClick={() => panInputRef.current?.click()}  onDragOver={onDragOver}
                             onDrop={(e) => onDrop(e, 'panCard')}>
                                <input type="file" ref={panInputRef} className="hidden" onChange={(e) => handleInputFileUpload(e, 'pan')} accept=".pdf,image/*" />
                                <div className="flex items-center gap-3 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l3-3m-3 3L9 10" />
                                        <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    </svg>
                                    <span className="text-sm">Click to upload PAN (PDF / Image)</span>
                                </div>
                            </div>
                            {inputFileError && <div className="text-xs text-red-600 mt-1">{inputFileError}</div>}
                            {panFileInfo && panFileInfo.preview && <img src={panFileInfo.preview} alt={panFileInfo.name} className="mt-2 w-28 h-18 object-cover rounded" />}
                        </div>

                        <div className="flex flex-col">
                            <label className="text-md font-semibold">Aadhaar Card</label>
                            <div className={`border-2 border-dashed p-3 rounded-md mt-1 ${inputFileError ? 'border-red-600 bg-red-50' : 'border-green-600 bg-gray-50'}`} onClick={() => aadhaarInputRef.current?.click()}  onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, 'aadhaarCard')}>
                                <input type="file" ref={aadhaarInputRef} className="hidden" onChange={(e) => handleInputFileUpload(e, 'aadhaar')} accept=".pdf,image/*" />
                                <div className="flex items-center gap-3 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l3-3m-3 3L9 10" />
                                        <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    </svg>
                                    <span className="text-sm">Click to upload Aadhaar (PDF / Image)</span>
                                </div>
                            </div>
                            {inputFileError && <div className="text-xs text-red-600 mt-1">{inputFileError}</div>}
                            {aadhaarFileInfo && aadhaarFileInfo.preview && <img src={aadhaarFileInfo.preview} alt={aadhaarFileInfo.name} className="mt-2 w-28 h-18 object-cover rounded" />}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button className="px-5 py-2 rounded-md bg-white border border-gray-200 text-gray-700">Cancel</button>
                        <button className="px-5 py-2 rounded-md bg-green-600 text-white shadow hover:bg-green-700">Save Changes</button>
                    </div>
                </div>
            </div>
            
        </>
    );
}

export default Personal_info;
