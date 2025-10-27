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
    Aos.init({duration:2000});
  },[]);

  return (
    <>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center mt-5 " data-aos='fade-down' data-aos-delay='100'>Frequently Asked Questions</h1>
      <div className="space-y-4 max-w-3xl mx-auto font-semibold text-lg mb-6" data-aos='fade-up' data-aos-delay='100'>
        <div
          className="bg-[#D2EACF] flex justify-between items-center p-4 rounded-xl shadow-md cursor-pointer hover:bg-[#B2E0B2] custom-transition hover:transform hover:scale-102 hover:shadow-lg "
          onClick={() => toggleAnswer(0)}
        >
          <p className="text-gray-800">How can I apply for a subsidy?</p>
          <img
            src="./Dropdown_Logo.svg"
            className={`w-5 h-5 transition-transform ${answerno === 0 ? 'transform rotate-180' : ''}`}
            alt="Dropdown"
          />
        </div>
        {answerno === 0 && (
          <div className="bg-[#F0F9E8] p-4 rounded-md shadow-sm text-gray-700">
            To apply for a subsidy, you can visit our website and fill out the application form. Make sure to provide all the required documents and information.
          </div>
        )}

        <div
          className="bg-[#D2EACF] flex justify-between items-center p-4 rounded-xl shadow-md cursor-pointer hover:bg-[#B2E0B2] custom-transition hover:transform hover:scale-102 hover:shadow-lg"
          onClick={() => toggleAnswer(1)}
        >
          <p className="text-gray-800">What documents are required for subsidy application?</p>
          <img
            src="./Dropdown_Logo.svg"
            className={`w-5 h-5 transition-transform ${answerno === 1 ? 'transform rotate-180' : ''}`}
            alt="Dropdown"
          />
        </div>
        {answerno === 1 && (
          <div className="bg-[#F0F9E8] p-4 rounded-md shadow-sm text-gray-700">
            The required documents may vary depending on the subsidy program. Generally, you will need to provide identification proof, land ownership documents, and any other relevant certificates.
          </div>
        )}

        <div
          className="bg-[#D2EACF] flex justify-between items-center p-4 rounded-xl shadow-md cursor-pointer hover:bg-[#B2E0B2] custom-transition hover:transform hover:scale-102 hover:shadow-lg"
          onClick={() => toggleAnswer(2)}
        >
          <p className="text-gray-800">How long does it take to process a subsidy application?</p>
          <img
            src="./Dropdown_Logo.svg"
            className={`w-5 h-5 transition-transform ${answerno === 2 ? 'transform rotate-180' : ''}`}
            alt="Dropdown"
          />
        </div>
        {answerno === 2 && (
          <div className="bg-[#F0F9E8] p-4 rounded-md shadow-sm text-gray-700">
            The processing time for subsidy applications can vary depending on the program and the volume of applications. Typically, it may take anywhere from a few weeks to a couple of months.
          </div>
        )}

        <div
          className="bg-[#D2EACF] flex justify-between items-center p-4 rounded-xl shadow-md cursor-pointer hover:bg-[#B2E0B2] custom-transition hover:transform hover:scale-102 hover:shadow-lg"
          onClick={() => toggleAnswer(3)}
        >
          <p className="text-gray-800">Are there any eligibility criteria for farmers to apply for subsidies?</p>
          <img
            src="./Dropdown_Logo.svg"
            className={`w-5 h-5 transition-transform ${answerno === 3 ? 'transform rotate-180' : ''}`}
            alt="Dropdown"
          />
        </div>
        {answerno === 3 && (
          <div className="bg-[#F0F9E8] p-4 rounded-md shadow-sm text-gray-700">
            Yes, there are eligibility criteria that farmers must meet to apply for subsidies. These criteria may include factors such as land size, type of crops grown, and income level. Please refer to the specific subsidy program for detailed eligibility requirements.
          </div>
        )}
      </div>
    </>
  );
}

export default FAQ;
