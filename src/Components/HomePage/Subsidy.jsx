import React from "react";

const Subsidy = () => {
  const subsidyData = [
    {
      id: 1,
      title: "Mukhyamantri Kisan Sahay Yojana",
      description:
        "For farmers who face crop loss due to natural calamities like heavy rainfall, unseasonal rainfall, drought.",
      amount: "Up to ₹25,000/hectare",
    },
    {
      id:2 ,
      title: "PM-KUSUM Solar Pump (Gujarat)",
      description:
        "For farmers who face crop loss due to natural calamities like heavy rainfall, unseasonal rainfall, drought.",
      amount: "Up to ₹22,500/hectare",
    },
    {
      id: 3,
      title: "AGR-50 Tractor Subsidy Scheme",
      description:
        "For farmers who face crop loss due to natural calamities like heavy rainfall, unseasonal rainfall, drought.",
      amount: "Up to ₹1,00,000 subsidy",
    },
  ];
  return (
    <>
      <div className="min-h-screen w-full bg-[#F3FFF1] mt-4">
        
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              Popular Subsidies{" "}
            </h2>
            <p className="text-[#3C3838] max-w-2xl font mx-auto">
              Discover a comprehensive range of subsidies tailored to meet your
              needs. From strategic consultancy to hands-on implementation.
            </p>
          </div>

          <div className="justify-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pr-4 px-16 mx-5 ml-5" >
            {subsidyData.map((subsidy) => (
              <div
                key={subsidy.id}
                className="bg-[#C3FFC8] border border-green-200 rounded-xl p-6 h-83 w-80 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-2xl text-center font-bold text-gray-800 mb-8">
                  {subsidy.title}
                </h3>
                <p className="text-l text-black  flex-grow">
                  {subsidy.description}
                </p>
                <p className="text-center text-2xl font-semibold text-[#2E2E2E] mb-6">
                  {subsidy.amount}
                </p>
                <button className="w-28 bg-[#477E60] text-white text-l font-bold py-1 rounded-lg hover:bg-green-700 transition-colors duration-300 mt-auto self-center">
                  Apply
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
          <button className="bg-[#1B7A43] text-xl  mb-6 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-800 transition-colors duration-300">
            Explore More
          </button>
        </div>
      
      </div>
    </>
  );
};

export default Subsidy;
