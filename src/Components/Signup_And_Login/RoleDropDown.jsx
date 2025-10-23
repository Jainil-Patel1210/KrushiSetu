import React from 'react';

// Role Dropdown Component
function RoleDropdown({ role, isOpen, onClick, onSelect }) {
    return (
        <div className="relative w-full">
            <input
                className="w-full p-2 pr-12 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                type="text"
                placeholder="Role"
                value={role}
                onClick={onClick}
                readOnly
                required
            />
            <img
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 pb-2"
                src="/Dropdown_Logo.svg"
                alt="Dropdown"
                onClick={onClick}
            />
            {isOpen && (
                <div className="absolute left-0 right-0 bg-white border rounded shadow z-10">
                    <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Farmer')}>Farmer</p>
                    <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Officer')}>Officer</p>
                    <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Admin')}>Admin</p>
                    <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Subsidy Provider')}>Subsidy Provider</p>
                </div>
            )}
        </div>
    );
}

export default RoleDropdown;