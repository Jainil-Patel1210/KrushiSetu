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
                <button className="border border-green-500 text-green-600 rounded-md px-3 py-1 text-sm hover:bg-green-50">
                    ☆ Rate & Review
                </button>
            );
        }
        return (
            <button className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm hover:bg-gray-50">
                View Details
            </button>
        );
    }

    const subsidies = [
  {
    title: "Solar Pump Subsidy",
    amount: "₹50,000",
    deadline: "30 Apr, 2024",
    description:
      "Financial assistance for installing solar-powered irrigation pump to reduce electricity costs.",
    documents: ["Land ownership proof", "Electricity Bill", "Bank passbook"],
  },
  {
    title: "Micro Irrigation Scheme",
    amount: "₹25,000",
    deadline: "15 May, 2024",
    description:
      "Support for installing micro-irrigation systems including drip and sprinkler systems.",
    documents: ["Aadhaar card", "Land records", "Previous water bills"],
  },
  {
    title: "Seed Distribution Program",
    amount: "₹3,000",
    deadline: "10 Jun, 2024",
    description:
      "Free distribution of quality seeds for seasonal crops to improve yield and productivity.",
    documents: ["Farmer ID", "Land documents", "Bank account details"],
  },
];

    return (
        <>
            <Header />
            <Settings />
            {/* Main Section */}
            <div className="w-full bg-gray-100 min-h-screen">
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                        Dashboard
                    </h1>
                    <p className="text-[#77797C] font-semibold mt-2 text-sm sm:text-base md:text-lg">
                        Welcome back! Here's an overview of your subsidies and applications
                    </p>

                    {/* Cards Section */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="bg-white shadow-md rounded-xl p-5 sm:p-6">
                            <p className="text-gray-600 font-medium text-base sm:text-lg">
                                Total Subsidies
                            </p>
                            <p className="text-green-700 text-2xl sm:text-3xl font-bold mt-2">
                                5
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-xl p-5 sm:p-6">
                            <p className="text-gray-600 font-medium text-base sm:text-lg">
                                Total Approved
                            </p>
                            <p className="text-green-700 text-2xl sm:text-3xl font-bold mt-2">
                                3
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-xl p-5 sm:p-6">
                            <p className="text-gray-600 font-medium text-base sm:text-lg">
                                Total Amount Received
                            </p>
                            <p className="text-green-700 text-2xl sm:text-3xl font-bold mt-2">
                                ₹13,500
                            </p>
                        </div>
                    </div>
                </div>

                {/* My Application */}
                <div className="max-w-6xl ml-10 mx-auto p-6 bg-white rounded-lg shadow-sm">
                    <h1 className="text-green-700 text-2xl px-4 font-bold">My Applications</h1>


                    {/* Desktop table */}
                    <div className="hidden md:block mt-7">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-left text-lg text-gray-700">
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
                                    <tr key={row.id} className="border-t border-[#D8D8D8] font-semibold text-[#363636] text-lg">
                                        <td className="px-4 py-1">{row.name}</td>
                                        <td className="px-4 py-1 text-sm text-gray-600">{row.id}</td>
                                        <td className="px-4 py-1">{row.date}</td>
                                        <td className="px-4 py-1">{row.amount}</td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.status === "Approved" ? <ActionButton type="rate" /> : <ActionButton type="view" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-6 px-10">
                    <h2 className="text-2xl font-bold text-[#15681A] mb-6">
                        New Subsidies Available
                    </h2>

                    <div className="grid gap-16 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 max-w-6xl ">
                        {subsidies.map((item) => (
                            <div
                                key={item.title}
                                className="bg-white rounded-lg shadow-sm p-5 flex flex-col justify-between "
                            >
                                {/* top row */}
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {item.title}
                                    </h3>
                                    <span className="bg-[#009500] text-white text-sm font-semibold px-3 ml-3 rounded-sm">
                                        New
                                    </span>
                                </div>

                                {/* amount + deadline */}
                                <div className="mt-2 text-sm font-semibold">
                                    <p className="text-[#009500] font-semibold">
                                        Up to {item.amount}
                                    </p>
                                    <p className="text-gray-600">Apply By: {item.deadline}</p>
                                </div>

                                {/* description */}
                                <p className="text-gray-700 text-sm mt-3 font-semibold">{item.description}</p>

                                <hr className="my-3" />

                                {/* documents */}
                                <p className="text-sm text-gray-600 font-semibold">
                                    <span className="font-medium">Documents Required:</span>{" "}
                                    {item.documents.join(", ")}
                                </p>

                                {/* button */}
                                <button className="mt-4 bg-[#009500] text-white text-lg font-medium py-1 rounded-md hover:bg-green-700 transition">
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