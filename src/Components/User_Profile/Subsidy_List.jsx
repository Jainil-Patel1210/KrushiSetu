import React, { useState } from "react";
import Header from "./Header";

function Subsidy_List() {

    const [searchTerm, setSearchTerm] = useState("");
    const subsidies = [
    {
      title: "NFSM - Nutri cereal - Bajra",
      amount: "₹15,000",
      applicationDate: "18/06/2025 to 31/12/2025",
    },
    {
      title: "PM-KUSUM - Solar Pump Subsidy",
      amount: "₹30,000",
      applicationDate: "18/06/2025 to 31/12/2025",
    },
    {
      title: "PMFBY - Crop Insurance Scheme",
      amount: "₹20,000",
      applicationDate: "18/06/2025 to 31/12/2025",
    },
    {
      title: "RKVY - Farm Mechanization",
      amount: "₹25,000",
      applicationDate: "18/06/2025 to 31/12/2025",
    },
    {
      title: "MIDH - Horticulture Development",
      amount: "₹18,000",
      applicationDate: "18/06/2025 to 31/12/2025",
    },
    {
      title: "PM-FME - Food Processing Support",
      amount: "₹40,000",
      applicationDate: "18/06/2025 to 31/12/2025",
    },
    ];

    const filteredSubsidies = subsidies.filter((subsidy) =>
        subsidy.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Header />
            <div className="w-full bg-gray-100 min-h-screen">
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Subsidy Schemes</h1>
                    
                    {/* Search Bar */}
                    <div className="mt-6 mb-6">
                        <input
                            type="text"
                            placeholder="Search Subsidies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-1/2 lg:w-1/3 p-3 border rounded-md"
                        />
                    </div>

                    <div className= "max-w-6xl">
                        {filteredSubsidies.length === 0 ? (
                            <p>No subsidies found.</p>
                        ) : (
                            filteredSubsidies.map((subsidy, index) => (
                                <div key={index} className="flex justify-between bg-white p-6 rounded-2xl shadow-md mb-4">
                                    <div> 
                                        <h2 className="text-xl font-semibold text-gray-600">{subsidy.title}</h2>
                                        <p className="text-sm text-gray-600">Maximum Amount - {subsidy.amount}</p>
                                        <p className="text-sm text-gray-600">Date of Application - {subsidy.applicationDate}</p>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <button className="bg-green-600 text-white px-3 py-1.5 text-sm rounded-md">View More</button>
                                        <button className="bg-green-600 text-white px-3 py-1.5 text-sm rounded-md">Apply</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Subsidy_List;
