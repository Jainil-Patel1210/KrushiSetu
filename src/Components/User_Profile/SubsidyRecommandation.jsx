import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from './api1';
import { FaSeedling, FaRupeeSign, FaLightbulb } from 'react-icons/fa';
import Header from './Header';
import stateDistrictData from './assets/data.json';
import Settings from '../HomePage/Settings.jsx';

function RecommendSubsidy() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [error, setError] = useState(null);
    const [availableDistricts, setAvailableDistricts] = useState([]);

    const [formData, setFormData] = useState({
        income: '',
        farmer_type: '',
        land_size: '',
        crop_type: '',
        season: '',
        soil_type: '',
        water_sources: '',
        state: '',
        district: '',
        rainfall_region: '',
        temperature_zone: '',
        past_subsidies: ''
    });

    const farmerTypes = ['Small Farmer', 'Marginal Farmer', 'Medium Farmer', 'Large Farmer'];
    const seasons = ['Kharif', 'Rabi', 'Zaid', 'Year-round'];
    const soilTypes = ['Alluvial', 'Black/Regur', 'Red', 'Laterite', 'Desert', 'Mountain', 'Loamy'];
    const waterSources = ['Canal', 'Borewell', 'Pond', 'River', 'Rainwater', 'Drip Irrigation'];
    const rainfallRegions = ['High rainfall', 'Moderate rainfall', 'Low rainfall', 'Semi-arid', 'Arid'];
    const temperatureZones = ['Tropical', 'Sub-tropical', 'Temperate', 'Cold', 'Moderate'];

    // Update available districts when state changes
    useEffect(() => {
        if (formData.state) {
            const selectedState = stateDistrictData.find(s => s.state === formData.state);
            if (selectedState) {
                setAvailableDistricts(selectedState.districts.map(d => d.district));
            }
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.state]);

    // Prefill form from user profile if available (best-effort)
    useEffect(() => {
        const fetchProfileAndPrefill = async () => {
            try {
                const tries = ['profile/profile/', '/profile/', 'profile/'];
                let profile = null;
                for (const endpoint of tries) {
                    try {
                        const res = await api.get(endpoint, { withCredentials: true });
                        if (res && res.data) {
                            profile = res.data;
                            break;
                        }
                    } catch (e) {
                        
                    }
                }

                if (!profile) return;

               
                setFormData(prev => ({
                    ...prev,
                    income: prev.income || (profile.income != null ? String(profile.income) : prev.income),
                    farmer_type: prev.farmer_type || profile.farmer_type || profile.ownership_type || prev.farmer_type,
                    land_size: prev.land_size || (profile.land_size != null ? String(profile.land_size) : prev.land_size),
                    crop_type: prev.crop_type || profile.crop_type || prev.crop || prev.crop_type,
                    season: prev.season || profile.season || prev.season,
                    soil_type: prev.soil_type || profile.soil_type || prev.soil_type,
                    water_sources: prev.water_sources || (Array.isArray(profile.water_sources) ? profile.water_sources[0] : profile.water_sources) || prev.water_sources,
                    state: prev.state || profile.state || prev.state,
                    district: prev.district || profile.district || prev.district,
                    rainfall_region: prev.rainfall_region || profile.rainfall_region || prev.rainfall_region,
                    temperature_zone: prev.temperature_zone || profile.temperature_zone || prev.temperature_zone,
                    past_subsidies: prev.past_subsidies || (Array.isArray(profile.past_subsidies) ? profile.past_subsidies.join(', ') : profile.past_subsidies || prev.past_subsidies)
                }));
            } catch (err) {
                console.warn('Could not prefill subsidy form from profile:', err);
            }
        };

        fetchProfileAndPrefill();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // If state changes, reset district
        if (name === 'state') {
            setFormData(prev => ({
                ...prev,
                state: value,
                district: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log('Current form data:', formData);

        // Validate all required fields before submitting
        const requiredFields = ['income', 'farmer_type', 'land_size', 'crop_type', 'state'];
        const missingFields = requiredFields.filter(field => {
            const value = formData[field];
            const isEmpty = !value || value.toString().trim() === '';
            if (isEmpty) {
                console.log(`Field ${field} is empty:`, value);
            }
            return isEmpty;
        });
        
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            setError(`Missing required fields: ${missingFields.join(', ')}`);
            setLoading(false);
            return;
        }

        console.log('Submitting form data:', formData);

        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
            
            // Prepare data in correct format
            const requestData = {
                farmer_profile: {
                    income: parseInt(formData.income) || 0,
                    farmer_type: formData.farmer_type || '',
                    land_size: parseFloat(formData.land_size) || 0,
                    crop_type: formData.crop_type || '',
                    season: formData.season || 'N/A',
                    soil_type: formData.soil_type || 'N/A',
                    water_sources: formData.water_sources ? [formData.water_sources] : [],
                    state: formData.state || '',
                    district: formData.district || 'N/A',
                    rainfall_region: formData.rainfall_region || 'N/A',
                    temperature_zone: formData.temperature_zone || 'N/A',
                    past_subsidies: formData.past_subsidies ? formData.past_subsidies.split(',').map(s => s.trim()).filter(s => s) : []
                }
            };
            
            console.log('Sending request:', requestData);
            
            const response = await axios.post(`${BASE_URL}/api/subsidy-recommendations/recommend/`, requestData, {
                withCredentials: true
            });
            
            if (response.data.success) {
                setRecommendations(response.data);
                setStep(3); // Move to results page
            } else {
                setError(response.data.error || 'Failed to get recommendations');
            }
        } catch (err) {
            console.error('Error:', err);
            console.error('Error response:', err.response);
            console.error('Form data sent:', formData);
            
            let errorMessage = 'Unable to connect to recommendation service.';
            
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.status === 400) {
                errorMessage = 'Bad Request: Please check that all required fields are filled correctly.';
            } else if (err.response?.status === 503) {
                errorMessage = 'Service unavailable. Please ensure the backend server is running and API key is configured.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            // Validate step 1 fields
            if (!formData.income || !formData.farmer_type || !formData.land_size) {
                setError('Please fill all required fields in this section');
                return;
            }
        } else if (step === 2) {
            // Validate step 2 fields
            if (!formData.crop_type || !formData.state || !formData.district) {
                setError('Please fill all required fields in this section');
                return;
            }
        }
        setError(null);
        setStep(step + 1);
    };

    const prevStep = () => {
        setError(null);
        setStep(step - 1);
    };

    const resetForm = () => {
        setFormData({
            income: '',
            farmer_type: '',
            land_size: '',
            crop_type: '',
            season: '',
            soil_type: '',
            water_sources: '',
            state: '',
            district: '',
            rainfall_region: '',
            temperature_zone: '',
            past_subsidies: ''
        });
        setRecommendations(null);
        setError(null);
        setStep(1);
    };

    // Step 1: Basic Information
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <FaRupeeSign className="text-5xl text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                <p className="text-gray-600 mt-2">Tell us about your farm and income</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Annual Income (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="income"
                        value={formData.income}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        placeholder="e.g., 100000"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Farmer Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="farmer_type"
                        value={formData.farmer_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                    >
                        <option value="">Select type</option>
                        {farmerTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Land Size (acres) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        name="land_size"
                        value={formData.land_size}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        placeholder="e.g., 2.5"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Past Subsidies Used
                    </label>
                    <input
                        type="text"
                        name="past_subsidies"
                        value={formData.past_subsidies}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        placeholder="e.g., PM-KISAN, Soil Health Card"
                    />
                </div>
            </div>

            <div className="flex justify-end mt-8">
                <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                    Next Step →
                </button>
            </div>
        </div>
    );

    // Step 2: Agricultural Details
    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <FaSeedling className="text-5xl text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Agricultural Details</h2>
                <p className="text-gray-600 mt-2">Information about your crops and land</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Primary Crop Type <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="crop_type"
                        value={formData.crop_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        placeholder="e.g., Wheat, Rice, Cotton"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Season
                    </label>
                    <select
                        name="season"
                        value={formData.season}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        <option value="">Select season</option>
                        {seasons.map(season => (
                            <option key={season} value={season}>{season}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Soil Type
                    </label>
                    <select
                        name="soil_type"
                        value={formData.soil_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        <option value="">Select soil type</option>
                        {soilTypes.map(soil => (
                            <option key={soil} value={soil}>{soil}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Water Sources
                    </label>
                    <select
                        name="water_sources"
                        value={formData.water_sources}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        <option value="">Select water source</option>
                        {waterSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                    >
                        <option value="">Select state</option>
                        {stateDistrictData.map(stateObj => (
                            <option key={stateObj.state} value={stateObj.state}>
                                {stateObj.state}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        District <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                        disabled={!formData.state}
                    >
                        <option value="">
                            {formData.state ? 'Select district' : 'Select state first'}
                        </option>
                        {availableDistricts.map(district => (
                            <option key={district} value={district}>
                                {district}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rainfall Region
                    </label>
                    <select
                        name="rainfall_region"
                        value={formData.rainfall_region}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        <option value="">Select rainfall region</option>
                        {rainfallRegions.map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Temperature Zone
                    </label>
                    <select
                        name="temperature_zone"
                        value={formData.temperature_zone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        <option value="">Select temperature zone</option>
                        {temperatureZones.map(zone => (
                            <option key={zone} value={zone}>{zone}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <button
                    type="button"
                    onClick={prevStep}
                    className="md:px-8 md:py-3 px-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                    ← Previous
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="md:px-8 md:py-3 px-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
                >
                    {loading ? 'Analyzing...' : 'Get Recommendations'}
                </button>
            </div>
        </div>
    );

    // Step 3: Results
    const renderResults = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <FaLightbulb className="text-5xl text-yellow-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-gray-800">Your Personalized Recommendations</h2>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <FaLightbulb className="mr-2 text-green-600" />
                    Summary
                </h3>
                <p className="text-gray-700 leading-relaxed">{recommendations.summary}</p>
                <p className="text-sm text-gray-600 mt-4">
                    Found {recommendations.total_found} eligible subsidies. Showing top {recommendations.recommendations.length} matches.
                </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-6">
                {recommendations.recommendations.map((rec, index) => (
                    <div key={rec.subsidy_id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="bg-green-100 text-green-800 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">
                                    #{rec.rank}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{rec.title}</h3>
                                    <div className="flex items-center mt-2">
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                            {rec.relevance_score}% Match
                                        </span>
                                        <span className="ml-3 text-gray-600">₹{parseFloat(rec.amount).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4">{rec.description}</p>

                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Why Recommended:</h4>
                            <p className="text-gray-700">{rec.why_recommended}</p>
                        </div>

                        {rec.key_benefits && rec.key_benefits.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-800 mb-2">Key Benefits:</h4>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {rec.key_benefits.map((benefit, i) => (
                                        <li key={i}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {rec.application_dates.start && rec.application_dates.end && (
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold">Application Period:</span> {rec.application_dates.start} to {rec.application_dates.end}
                            </div>
                        )}

                        <button 
                            onClick={() => {
                                // Format subsidy data for ApplySubsidy component
                                const subsidyData = {
                                    id: rec.subsidy_id,
                                    title: rec.title,
                                    description: rec.description,
                                    amount: rec.amount,
                                    documents_required: rec.documents_required || [],
                                    application_start_date: rec.application_dates?.start,
                                    application_end_date: rec.application_dates?.end
                                };
                                navigate(`/apply/${rec.subsidy_id}`, { state: { subsidy: subsidyData } });
                            }}
                            className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            Apply Now
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={resetForm}
                    className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                    Start New Search
                </button>
            </div>
        </div>
    );

    return (
        <>
        <Header />
        <Settings />
        <div className="min-h-screen py-12 px-4 bg-gray-100">
            <div className=" mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="md:text-4xl text-2xl font-bold text-gray-800 mb-3">
                        AI-Powered Subsidy Recommendations
                    </h1>
                    <p className="text-gray-600 md:text-lg text-md ">
                        Get personalized subsidy suggestions based on your farm profile
                    </p>
                </div>

                {/* Progress Indicator */}
                {step < 3 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-center">
                            <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`hidden md:flex md:w-10 md:h-10 md:rounded-full items-center justify-center ${step >= 1 ? 'md:bg-green-600 text-white' : 'md:bg-gray-300'}`}>
                                    1
                                </div>
                                <span className="md:ml-2 font-medium md:font-semibold">Basic Info</span>
                            </div>
                            <div className={`w-12 md:w-24 h-1 mx-1 md:mx-4 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                            <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`hidden md:flex md:w-10 md:h-10 md:rounded-full items-center justify-center ${step >= 2 ? 'md:bg-green-600 text-white' : 'md:bg-gray-300'}`}>
                                    2
                                </div>
                                <span className="md:ml-2 font-medium md:font-semibold">Farm Details</span>
                            </div>
                            <div className={`w-12 md:w-24 h-1 mx-1 md:mx-4 ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                            <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`hidden md:flex md:w-10 md:h-10 md:rounded-full items-center justify-center ${step >= 3 ? 'md:bg-green-600 text-white' : 'md:bg-gray-300'}`}>
                                    3
                                </div>
                                <span className="md:ml-2 font-medium md:font-semibold">Results</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        <p className="font-semibold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && recommendations && renderResults()}
                </div>
            </div>
        </div>
        </>
    );
}

export default RecommendSubsidy;
