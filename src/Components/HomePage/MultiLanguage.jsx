import React, { useEffect, useRef } from 'react';
import { FaLanguage, FaGlobe } from 'react-icons/fa';

function MultiLanguage({ onClose }) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिंदी (Hindi)' },
        { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
        { code: 'mr', name: 'मराठी (Marathi)' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
        { code: 'bn', name: 'বাংলা (Bengali)' },
        { code: 'ta', name: 'தமிழ் (Tamil)' },
        { code: 'te', name: 'తెలుగు (Telugu)' },
        { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
        { code: 'ml', name: 'മലയാളം (Malayalam)' },
        { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
        { code: 'ur', name: 'اردو (Urdu)' }
    ];

    const changeLanguage = (langCode) => {
        // Set the Google Translate cookie
        const cookieValue = `/en/${langCode}`;
        
        // Clear all existing Google Translate cookies
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
        
        // Set new cookie
        document.cookie = `googtrans=${cookieValue}; path=/`;
        // document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
        
        // Close modal and reload
        onClose();
        window.location.reload();
    };

    return (
        <div ref={dropdownRef} className="fixed bottom-20 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 animate-slideUp">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <FaLanguage className="text-xl" />
                <h3 className="font-semibold">Select Language</h3>
            </div>
                <FaGlobe className="text-lg opacity-80" />
        </div>

        {/* Language List */}
        <div className="max-h-96 overflow-y-auto p-2">
            {languages.map((lang) => (
                <button key={lang.code} className="w-full flex items-center px-4 py-3 hover:bg-green-50 rounded-lg transition-colors duration-200 group" onClick={() => changeLanguage(lang.code)}>
                    <span className="text-gray-700 group-hover:text-green-600 font-medium">{lang.name}</span>
                </button>
            ))}
        </div>
        </div>
    )
}

export default MultiLanguage
