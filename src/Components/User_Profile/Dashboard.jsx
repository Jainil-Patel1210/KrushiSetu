import React from "react";
import Header from "./Header.jsx";
import Settings from "../HomePage/Settings.jsx";

const Dashboard = () => {
    const data = [
        { name: "PM - KISAN Scheme", id: "APP2024001", date: "2024-01-15", amount: "₹6,000", status: "Approved" },
        { name: "Soil Health Card Subsidy", id: "APP2024002", date: "2024-02-10", amount: "₹2,500", status: "Approved" },
        { name: "Crop Insurance Premium", id: "APP2024003", date: "2024-03-05", amount: "₹8,000", status: "Pending" },
        { name: "Drip Irrigation Subsidy", id: "APP2024004", date: "2024-03-12", amount: "₹15,000", status: "Under Review" },
        { name: "Organic Farming Subsidy", id: "APP2024005", date: "2024-03-18", amount: "₹5,000", status: "Approved" },
    ];

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

    function ActionButton({ type }) {
        if (type === "rate") {
            return (
                <button className="border border-green-500 text-green-600 rounded-md px-3 py-1 text-sm hover:bg-green-50 w-full sm:w-auto">
                    ☆ Rate & Review
                </button>
            );
        }
        return (
            <button className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm hover:bg-gray-50 w-full sm:w-auto">
                View Details
            </button>
        );
    }

    const subsidies = [
        {
            title: "Solar Pump Subsidy",
            amount: "₹50,000",
            deadline: "30 Apr, 2024",
            description: "Financial assistance for installing solar-powered irrigation pump to reduce electricity costs.",
            documents: ["Land ownership proof", "Electricity Bill", "Bank passbook"],
        },
        {
            title: "Micro Irrigation Scheme",
            amount: "₹25,000",
            deadline: "15 May, 2024",
            description: "Support for installing micro-irrigation systems including drip and sprinkler systems.",
            documents: ["Aadhaar card", "Land records", "Previous water bills"],
        },
        {
            title: "Seed Distribution Program",
            amount: "₹3,000",
            deadline: "10 Jun, 2024",
            description: "Free distribution of quality seeds for seasonal crops to improve yield and productivity.",
            documents: ["Farmer ID", "Land documents", "Bank account details"],
        },
    ];

    return (
        <>
            <Header />
            <Settings />
            {/* Main Section */}
            <div className="w-full bg-gray-100 min-h-screen">
                <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        Dashboard
                    </h1>
                    <p className="text-[#77797C] font-semibold mt-2 text-sm sm:text-base lg:text-lg">
                        Welcome back! Here's an overview of your subsidies and applications
                    </p>

                    {/* Cards Section */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        <div className="bg-white shadow-md rounded-xl p-5 sm:p-6">
                            <p className="text-gray-600 font-medium text-sm sm:text-base lg:text-lg">
                                Total Subsidies
                            </p>
                            <p className="text-green-700 text-2xl sm:text-3xl font-bold mt-2">
                                5
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-xl p-5 sm:p-6">
                            <p className="text-gray-600 font-medium text-sm sm:text-base lg:text-lg">
                                Total Approved
                            </p>
                            <p className="text-green-700 text-2xl sm:text-3xl font-bold mt-2">
                                3
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-xl p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
                            <p className="text-gray-600 font-medium text-sm sm:text-base lg:text-lg">
                                Total Amount Received
                            </p>
                            <p className="text-green-700 text-2xl sm:text-3xl font-bold mt-2">
                                ₹13,500
                            </p>
                        </div>
                    </div>
                </div>

                {/* My Application */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h1 className="text-green-700 text-xl sm:text-2xl font-bold mb-4">My Applications</h1>

                        {/* Desktop table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-left text-base lg:text-lg text-gray-700">
                                        <th className="px-4 py-3">Subsidy Name</th>
                                        <th className="px-4 py-3">Application ID</th>
                                        <th className="px-4 py-3">Date Applied</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row) => (
                                        <tr key={row.id} className="border-t border-[#D8D8D8] font-semibold text-[#363636] text-base lg:text-lg">
                                            <td className="px-4 py-3">{row.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{row.id}</td>
                                            <td className="px-4 py-3">{row.date}</td>
                                            <td className="px-4 py-3">{row.amount}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.status === "Approved" ? <ActionButton type="rate" /> : <ActionButton type="view" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/Tablet card view */}
                        <div className="lg:hidden space-y-4">
                            {data.map((row) => (
                                <div key={row.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-base sm:text-lg">{row.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">{row.id}</p>
                                        </div>
                                        <StatusBadge status={row.status} />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div>
                                            <p className="text-gray-600 font-medium">Date Applied</p>
                                            <p className="font-semibold text-gray-800">{row.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-medium">Amount</p>
                                            <p className="font-semibold text-green-700">{row.amount}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                        {row.status === "Approved" ? <ActionButton type="rate" /> : <ActionButton type="view" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* New Subsidies Available */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#15681A] mb-4 sm:mb-6">
                        New Subsidies Available
                    </h2>

                    <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {subsidies.map((item) => (
                            <div
                                key={item.title}
                                className="bg-white rounded-lg shadow-sm p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                            >
                                {/* top row */}
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex-1">
                                        {item.title}
                                    </h3>
                                    <span className="bg-[#009500] text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-sm whitespace-nowrap">
                                        New
                                    </span>
                                </div>

                                {/* amount + deadline */}
                                <div className="mt-2 sm:mt-3 text-sm font-semibold">
                                    <p className="text-[#009500] font-semibold text-base sm:text-lg">
                                        Up to {item.amount}
                                    </p>
                                    <p className="text-gray-600 text-sm">Apply By: {item.deadline}</p>
                                </div>

                                {/* description */}
                                <p className="text-gray-700 text-sm mt-3 font-medium leading-relaxed">
                                    {item.description}
                                </p>

                                <hr className="my-3 sm:my-4" />

                                {/* documents */}
                                <div className="text-sm text-gray-600 font-medium">
                                    <p className="font-semibold mb-1">Documents Required:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                                        {item.documents.map((doc, idx) => (
                                            <li key={idx}>{doc}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* button */}
                                <button className="mt-4 bg-[#009500] text-white text-base sm:text-lg font-medium py-2 rounded-md hover:bg-green-700 transition w-full">
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;