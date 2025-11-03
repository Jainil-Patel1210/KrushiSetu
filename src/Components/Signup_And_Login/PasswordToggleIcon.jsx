import React from 'react';

// Common Password Visibility Toggle Icon
function PasswordToggleIcon({ visible, onClick }) {
    return (
        <span className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer' onClick={onClick} tabIndex={0} role="button" aria-label="Toggle password visibility">
            {!visible ? (
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <path d="M177.5,67.4a9.75,9.75,0,0,0-14-1.5c-10.5,8.5-20,14.5-29.5,17.5-9.5,3.5-20.5,5-34,5s-24.5-1.5-34-5-19-9-29.5-17.5c-4.5-3.5-10.5-3-14,1.5s-3,10.5,1.5,14A132.06,132.06,0,0,0,45,95.9l-8.5,14.5c-2.5,5-1,11,3.5,13.5,5,2.5,11,1,13.5-3.5L63,103.9a112.84,112.84,0,0,0,27,4.5v18a10,10,0,0,0,20,0v-18a106.6,106.6,0,0,0,29-5.5l10,17.5a9.86,9.86,0,0,0,17-10l-9-15.5a111.22,111.22,0,0,0,19-13.5C180.5,77.9,181,71.9,177.5,67.4Z" />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 32 32">
                    <circle cx="16" cy="18" fill="none" r="3" stroke="#000" strokeWidth="2" />
                    <path d="M31,18c0,0-6-9-15-9S1,18,1,18s6,9,15,9S31,18,31,18z" fill="none" stroke="#000" strokeWidth="2" />
                    <line x1="16" x2="16" y1="6" y2="2" stroke="#000" strokeWidth="2" />
                    <line x1="7" x2="4" y1="9" y2="6" stroke="#000" strokeWidth="2" />
                    <line x1="25" x2="28" y1="9" y2="6" stroke="#000" strokeWidth="2" />
                </svg>
            )}
        </span>
    );
}

export default PasswordToggleIcon;