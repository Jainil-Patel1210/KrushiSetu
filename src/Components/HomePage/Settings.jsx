import React, { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa';
import MultiLanguage from './MultiLanguage';

function Settings() {
    const [settingIsOpen, setSettingIsOpen] = useState(false);

    useEffect(() => {
        // Load Google Translate script
        const script = document.createElement("script");
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        
        // Define the callback function
        window.googleTranslateElementInit = function() {
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'hi,gu,mr,pa,bn,ta,te,kn,ml,or,ur',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');
        };
        
        // Only add script if not already present
        if (!document.querySelector('script[src*="translate.google.com"]')) {
            document.body.appendChild(script);
        } else if (window.google && window.google.translate) {

            window.googleTranslateElementInit();
        }
        
        return () => {
            // Cleanup if needed
        };
    }, []);

    return (
        <>
            {/* Hidden Google Translate Element */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>

            <button 
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group" 
                onClick={() => setSettingIsOpen(!settingIsOpen)} 
                aria-label="Settings"
            >
                <FaCog className="text-2xl transition-transform duration-500 group-hover:rotate-90" />
            </button>

            {settingIsOpen && <MultiLanguage onClose={() => setSettingIsOpen(false)} />}
        </>
    )
}

export default Settings
