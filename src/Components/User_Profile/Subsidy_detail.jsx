import React from 'react';
import { useNavigate } from 'react-router-dom';
import Settings from '../HomePage/Settings.jsx';

function Subsidy_detail({ subsidy, onClose }) {
    const navigate = useNavigate();
    if (!subsidy) return null;

    const formatDateRange = (start) => {
        const date = (d) => {
            const dateObj = new Date(d);
            const day = dateObj.getDate();
            const month = dateObj.getMonth() + 1;
            const year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        };
        if (start) return `${date(start)}`;
        return "N/A";
    };

    return (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex justify-center items-start p-4 z-50 overflow-y-auto">
            <Settings />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 relative my-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-500 hover:rounded-full hover:bg-gray-200 transition-all duration-200 text-2xl font-bold hover:shadow-md"
                    aria-label="Close"
                >
                    &times;
                </button>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center leading-tight">
                    {subsidy.title}
                </h1>

                <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-gray-200">
                    <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"></path></svg>
                        Overview
                    </h2>
                    <p className="text-gray-700 mb-4">{subsidy.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 border-t border-gray-200 pt-4 mt-4">
                        <div><span className="font-bold text-gray-800">Start Date:</span> {formatDateRange(subsidy.application_start_date)}</div>
                        <div><span className="font-bold text-gray-800">End Date:</span> {formatDateRange(subsidy.application_end_date)}</div>
                        <div><span className="font-bold text-gray-800">Total Subsidy:</span> ₹{parseFloat(subsidy.amount).toLocaleString('en-IN')}</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-gray-200">
                    <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Eligibility Criteria
                    </h2>
                    <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                        {subsidy.eligibility && subsidy.eligibility.length > 0 ? (
                            subsidy.eligibility.map((criteria, index) => (
                                <li key={index}>{criteria}</li>
                            ))
                        ) : (
                            <li className="text-gray-500">No specific eligibility criteria provided.</li>
                        )}
                    </ol>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                    <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Required Documents
                    </h2>
                    <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                        {subsidy.documents_required && subsidy.documents_required.length > 0 ? (
                            subsidy.documents_required.map((doc, index) => (
                                <li key={index}>{doc}</li>
                            ))
                        ) : (
                            <li className="text-gray-500">No specific documents required.</li>
                        )}
                    </ol>
                </div>
                <div className="flex justify-center mt-8">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        type="button"
                        onClick={() => navigate(`/apply/${subsidy.id}`, { state: { subsidy } })}
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Subsidy_detail;