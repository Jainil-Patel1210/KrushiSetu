import React,{useEffect} from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import { use } from "react";

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
    useEffect(()=>{
    Aos.init({duration:2000});
  },[]),
  
    <>
      <div className="bg-[#F3FFF1] pt-4">
          <div className="text-center mb-12" data-aos="fade-down" data-aos-delay="100">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              Popular Subsidies{" "}
            </h2>
            <p className="text-[#3C3838] max-w-2xl font mx-auto text-center">
              Discover a comprehensive range of subsidies tailored to meet your
              needs. From strategic consultancy to hands-on implementation.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-2 md:flex md:flex-row md:justify-around md:gap-3" data-aos="fade-up" data-aos-delay="100">
            {subsidyData.map((subsidy, index) => (
              <div
                key={subsidy.id}
                className={`bg-[#C3FFC8] border border-green-200 rounded-xl p-6 h-83 w-80 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300 
                  ${index > 0 ? 'hidden sm:block md:block md:justify-around md:gap-3' : ''} 
                  ${index > 1 ? 'sm:hidden md:block md:justify-around md:gap-3' : ''}`}
              >
                <h3 className="text-2xl text-center font-bold text-gray-800 mb-8">
                  {subsidy.title}
                </h3>
                <p className="text-l text-black  flex-grow">
                  {subsidy.description}
                </p>
                <p className="text-center text-2xl font-semibold text-[#2E2E2E] mb-8 mt-5">
                  {subsidy.amount}
                </p>
                <button className="w-28 bg-[#477E60] text-white font-bold py-1 rounded-lg hover:bg-green-700 transition-colors duration-300 mt-auto self-center">
                  Apply
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-8" data-aos="fade-up" >
          <button className="bg-green-600 text-xl pl-5 pr-5 pt-2 pb-2 mb-4  text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors duration-300">
            Explore More
          </button>
        </div>
      
      </div>
    </>
  );
};

export default Subsidy;
