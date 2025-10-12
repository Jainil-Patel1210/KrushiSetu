import React from "react";
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate(); 

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to /login route
  };

  return (
  <>
    <div className="bg-white text-black sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
         <div className="flex items-center space-x-2">
          <img src='/Krushisetu_banner (1).jpg' className='h-12 w-12' />
          <div className="flex flex-col ">
            <h1 className="font-bold text-md text-center text-green-600">KRUSHISETU</h1>
            <p className="font-bold text-sm text-amber-950">PATH TO PROPERTY</p>
          </div>
        </div>
        
          <div className="md:flex space-x-6">
            <button className="hover:text-green-600 hover:scale-105 hover:underline px-3 py-1 font-semibold">Home</button>
            <button className="hover:text-green-600 hover:scale-105 hover:underline px-3 py-1 font-semibold">Subsidy</button>
            <button className="hover:text-green-600 hover:scale-105 hover:underline px-3 py-1 font-semibold">Guide</button>
            <button className="hover:text-green-600 hover:scale-105 hover:underline px-3 py-1 font-semibold">News</button>
            <button className="hover:text-green-600 hover:scale-105 hover:underline px-3 py-1 font-semibold">About Us</button>
            <button className="hover:text-green-600 hover:scale-105 hover:underline px-3 py-1 font-semibold">Contact Us</button>

            <button
              onClick={handleLoginClick} // Navigate to login
              className="bg-green-600 hover:scale-105 text-white font-semibold text-xl px-8 py-1 pb- my-2 rounded-full"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}

export default Navbar;
