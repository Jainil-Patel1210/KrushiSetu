import React, { useState } from 'react';
import Header from './Header';
import Data from './assets/data.json';

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

    function nextStep(){ if (validateCurrentStep()) setStep(s=>s+1); }
    function prevStep(){ setStep(s=>Math.max(0, s-1)); }




    return (

        <>
            <Header />

            
            <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">

                <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-3xl">
                    <h2 className="text-2xl font-bold mb-2 text-center">Subsidy Application Form</h2>
                    <p className="text-center text-sm text-gray-600 mb-4">Step {step + 1} of 3</p>
                    <form className="flex items-start gap-x-20 gap-y-auto flex-wrap space-y-6 mx-auto">
                        <div className={`${step === 0 ? '' : 'hidden'} w-full flex flex-wrap gap-x-20 gap-y-4`}>

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

                        <div className="w-full"></div>
                        <div className="flex justify-between mt-4 w-full">
                            {step > 0 ? (
                                <button type="button" className="border px-4 py-2 rounded" onClick={prevStep}>Back</button>
                            ) : <span />}
                            {step < 2 ? (
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