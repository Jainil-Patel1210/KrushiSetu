import React, { useState } from 'react'
import Header from '../User_Profile/Header'
import Settings from '../HomePage/Settings'
import { AiOutlineEye } from 'react-icons/ai';

const Dashboard = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');

    const data = [
        { srNo: 1, farmerName: "Rajesh Kumar", schemeName: "PM-KISAN Scheme", id: "APP2024001", date: "2024-01-15", status: "Approved" },
        { srNo: 2, farmerName: "Priya Singh", schemeName: "Soil Health Card Subsidy", id: "APP2024002", date: "2024-02-10", status: "Approved" },
        { srNo: 3, farmerName: "Amit Patel", schemeName: "Crop Insurance Premium", id: "APP2024003", date: "2024-03-05", status: "Under Review" },
        { srNo: 4, farmerName: "Sunita Verma", schemeName: "Drip Irrigation Subsidy", id: "APP2024004", date: "2024-03-12", status: "Pending" },
        { srNo: 5, farmerName: "Vikram Sharma", schemeName: "Organic Farming Subsidy", id: "APP2024005", date: "2024-03-18", status: "Approved" },
        { srNo: 6, farmerName: "Kavita Joshi", schemeName: "Solar Pump Subsidy", id: "APP2024006", date: "2024-03-20", status: "Pending" },
    ];

    // Count applications by status
    const statusCounts = {
        'Approved': data.filter(item => item.status === 'Approved').length,
        'Under Review': data.filter(item => item.status === 'Under Review').length,
        'Pending': data.filter(item => item.status === 'Pending').length,
    };

    // Filter data based on selected filter
    const filteredData = selectedFilter === 'All' 
        ? data 
        : data.filter(item => item.status === selectedFilter);

    const statusStyles = {
        Approved: "bg-green-100 text-green-800",
        "Under Review": "bg-sky-100 text-sky-800",
        Pending: "bg-amber-100 text-amber-800",
    };

    function StatusBadge({ status }) {
        const cls = statusStyles[status] || "bg-gray-100 text-gray-800";
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${cls}`}>
                {status}
            </span>
        );
    }

    function ViewButton() {
        return (
            <button className="border-2 border-green-500 text-green-600 rounded-full px-4 py-1 text-sm font-medium hover:bg-green-50 flex items-center gap-1 w-full sm:w-auto justify-center">
                <AiOutlineEye className="h-4 w-4" />
                <span>View</span>
            </button>
        );
    }

    const handleView = (row) => {
        console.log("Viewing application:", row);
    };

    return (
        <>
            <Header />
            <Settings />
            <div className="w-full bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        Application Dashboard
                    </h1>
                    <p className="text-[#77797C] font-semibold mt-2 text-sm sm:text-base lg:text-lg">
                        Review and Manage Farmer Subsidy Applications
                    </p>
                </div>

                {/* Farmer Subsidy Applications */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h1 className="text-green-700 text-xl sm:text-2xl font-bold mb-4">Farmer Subsidy Application</h1>

                        {/* Filter by Status */}
                        <div className="mb-6 bg-gray-50 rounded-lg p-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-gray-700 font-semibold text-sm sm:text-base">Filter by Status :</span>
                                
                                <button
                                    onClick={() => setSelectedFilter('All')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        selectedFilter === 'All'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    All
                                </button>

                                <button
                                    onClick={() => setSelectedFilter('Approved')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                                        selectedFilter === 'Approved'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    Approved
                                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                        {statusCounts['Approved']}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setSelectedFilter('Under Review')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                                        selectedFilter === 'Under Review'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    Under Review
                                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                        {statusCounts['Under Review']}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setSelectedFilter('Pending')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                                        selectedFilter === 'Pending'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    Pending
                                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                        {statusCounts['Pending']}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-left text-base lg:text-lg text-gray-700">
                                        <th className="px-4 py-3">Sr. No.</th>
                                        <th className="px-4 py-3">Farmer Name</th>
                                        <th className="px-4 py-3">Scheme Name</th>
                                        <th className="px-4 py-3">Application ID</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row) => (
                                        <tr key={row.id} className="border-t border-[#D8D8D8] font-semibold text-[#363636] text-base lg:text-lg">
                                            <td className="px-4 py-3">{row.srNo}</td>
                                            <td className="px-4 py-3">{row.farmerName}</td>
                                            <td className="px-4 py-3">{row.schemeName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{row.id}</td>
                                            <td className="px-4 py-3">{row.date}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <ViewButton />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/Tablet card view */}
                        <div className="lg:hidden space-y-4">
                            {filteredData.map((row) => (
                                <div key={row.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Sr. No. {row.srNo}</p>
                                            <h3 className="font-bold text-gray-800 text-base sm:text-lg">{row.farmerName}</h3>
                                            <p className="text-sm text-gray-700 mt-1">{row.schemeName}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">{row.id}</p>
                                        </div>
                                        <StatusBadge status={row.status} />
                                    </div>

                                    <div className="text-sm mb-3">
                                        <p className="text-gray-600 font-medium">Date</p>
                                        <p className="font-semibold text-gray-800">{row.date}</p>
                                    </div>

                                    <button
                                        onClick={() => handleView(row)}
                                        className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1 text-sm sm:text-base border-2 border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors w-full sm:w-auto"
                                    >
                                        <AiOutlineEye className="h-4 w-4" />
                                        <span className="hidden sm:inline">View</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard