import React from "react";
import { useNavigate } from 'react-router-dom';
import './Homepage.css'

function Navbar() {
  const navigate = useNavigate(); 

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to /login route
  };

  return (
    <div className="bg-white text-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div>
            <img src="/navbar_logo_svg.svg" alt="logo" className="w-40 h-15" />
          </div>

          <div className="hidden md:flex space-x-6">
            <button className="hover:text-green-700 px-3 py-1 font-semibold">Home</button>
            <button className="hover:text-green-700 px-3 py-1 font-semibold">Subsidy</button>
            <button className="hover:text-green-700 px-3 py-1 font-semibold">Guide</button>
            <button className="hover:text-green-700 px-3 py-1 font-semibold">News</button>
            <button className="hover:text-green-700 px-3 py-1 font-semibold">About Us</button>
            <button className="hover:text-green-700 px-3 py-1 font-semibold">Contact Us</button>

            <button
              onClick={handleLoginClick} // Navigate to login
              className="bg-green-600 text-white font-semibold text-xl px-8 py-1 pb- my-2 rounded-full"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
