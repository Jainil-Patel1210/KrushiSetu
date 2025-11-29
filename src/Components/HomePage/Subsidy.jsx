import React,{useEffect} from "react";
import { useNavigate } from "react-router-dom";
import Aos from "aos";
import "aos/dist/aos.css";


const Subsidy = () => {
  const navigate = useNavigate();
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

  useEffect(()=>{
    Aos.init({duration:1000});
  },[]);
  
  const handleApplyClick = (subsidy) => {
    const token = localStorage.getItem('access');
    if (token) {
      navigate(`/apply/${subsidy.id}`, { state: { subsidy } });
    } else {
      navigate('/login', { state: { redirectTo: `/apply/${subsidy.id}` } });
    }
  };
  
  const background = false;

  return (
    <>
      <div id="subsidy" className="bg-[#F3FFF1] pt-4 pb-8">
          <div className="text-center mb-12" data-aos="fade-up" data-aos-delay="100">
            <h2 className="text-4xl font-bold text-gray-800 mb-3 pt-2">Popular Subsidies{" "}</h2>
            <p className="text-[#3C3838] max-w-2xl font-lg mt-1 mx-auto text-center">
              Discover a comprehensive range of subsidies tailored to meet your
              needs. From strategic consultancy to hands-on implementation.
            </p>
          </div>

          <div className="flex flex-col items-center flex-wrap gap-6 md:flex md:flex-row md:justify-around md:gap-3 mb-8" data-aos="fade-up" data-aos-delay="100">
            {subsidyData.map((subsidy, index) => (
              <div
                key={subsidy.id}
                className={`bg-[#C3FFC8] border border-green-200 rounded-xl p-6 h-auto min-h-[350px] w-80 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300 
                  ${index > 1 ? 'hidden lg:flex' : ''}`}
              >
              <h3 className="text-2xl text-center font-bold text-gray-800 mb-4">{subsidy.title}</h3>
              <p className="text-base text-black flex-grow mb-4">{subsidy.description}</p>
              <p className="text-center text-2xl font-semibold text-[#2E2E2E] mb-4">{subsidy.amount}</p>
              <button
                className="w-32 bg-[#477E60] text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 mt-auto self-center"
                onClick={() => handleApplyClick(subsidy)}
              >
                Apply
              </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 pt-4" data-aos="fade-up">
           <button 
            className="bg-green-600 text-xl px-8 py-3 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md" 
            onClick={() => {
              navigate('/subsidy-list', { state: { from: 'home_page', isHeaderVisible: false } });
            }}
          >
            Explore More
          </button>
          </div>
      </div>
    </>
  );
};

export default Subsidy;
