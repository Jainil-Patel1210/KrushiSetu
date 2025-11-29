import React, { useEffect, useState } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css';
import './FAQ.css'

function FAQ() {
  const [answerno, setAnswerno] = useState(null);

  const toggleAnswer = (index) => {
    if (answerno === index) {
      setAnswerno(null); // Answer is already open, close it
    } else {
      setAnswerno(index);
    }
  };
  
  useEffect(()=>{
    Aos.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    });
  },[]);

  return (
    <>
      <div id="faq">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center mt-5" data-aos='fade-up'>Frequently Asked Questions</h1>
      <div className="space-y-4 max-w-3xl mx-auto font-semibold text-lg mb-6 md:p-auto p-2">
        <div className="FAQ-box transition-all duration-300 ease-in-out hover:shadow-lg" onClick={() => toggleAnswer(0)} data-aos='fade-up' data-aos-delay='0'>
          <p className="text-gray-800">How can I apply for a subsidy?</p>
          <img src="./Dropdown_Logo.svg" className={`w-5 h-5 transition-transform duration-300 ease-in-out ${answerno === 0 ? 'transform rotate-180' : ''}`} alt="Dropdown"/>
        </div>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${answerno === 0 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#F0F9E8] p-4 rounded-md shadow-sm text-gray-700 text-sm">
            To apply for a subsidy, you can visit our website and fill out the application form. Make sure to provide all the required documents and information.
          </div>
        </div>

        <div className="FAQ-box transition-all duration-300 ease-in-out hover:shadow-lg" onClick={() => toggleAnswer(1)} data-aos='fade-up' data-aos-delay='100'>
          <p className="text-gray-800">What documents are required for subsidy application?</p>
          <img src="./Dropdown_Logo.svg" className={`w-5 h-5 transition-transform duration-300 ease-in-out ${answerno === 1 ? 'transform rotate-180' : ''}`} alt="Dropdown"/>
        </div>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${answerno === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#F0F9E8] p-4 rounded-md shadow-sm text-gray-700 text-sm">
            The required documents may vary depending on the subsidy program. Generally, you will need to provide identification proof, land ownership documents, and any other relevant certificates.
          </div>
        </div>

        <div className="FAQ-box transition-all duration-300 ease-in-out hover:shadow-lg" onClick={() => toggleAnswer(2)} data-aos='fade-up' data-aos-delay='200'>
          <p className="text-gray-800">How long does it take to process a subsidy application?</p>
          <img src="./Dropdown_Logo.svg" className={`w-5 h-5 transition-transform duration-300 ease-in-out ${answerno === 2 ? 'transform rotate-180' : ''}`} alt="Dropdown"/>
        </div>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${answerno === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#F0F9E8] p-4 rounded-md shadow-sm text-gray-700 text-sm">
            The processing time for subsidy applications can vary depending on the program and the volume of applications. Typically, it may take anywhere from a few weeks to a couple of months.
          </div>
        </div>

        <div className="FAQ-box transition-all duration-300 ease-in-out hover:shadow-lg" onClick={() => toggleAnswer(3)} data-aos='fade-up' data-aos-delay='300'>
          <p className="text-gray-800">Are there any eligibility criteria for farmers to apply for subsidies?</p>
          <img src="./Dropdown_Logo.svg" className={`w-5 h-5 transition-transform duration-300 ease-in-out ${answerno === 3 ? 'transform rotate-180' : ''}`} alt="Dropdown" />
        </div>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${answerno === 3 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#F0F9E8] p-4 rounded-md shadow-sm text-gray-700 text-sm">
            Yes, there are eligibility criteria that farmers must meet to apply for subsidies. These criteria may include factors such as land size, type of crops grown, and income level. Please refer to the specific subsidy program for detailed eligibility requirements.
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default FAQ;
