import React,{useState} from "react";
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();   
    const [isOpen, setIsOpen] = useState(false);

    const handleLoginClick = () => {
      navigate('/login'); // Navigate to /login route
    };

    const handleNavbarToggle = () =>{
      setIsOpen(!isOpen);
    }

    return (
    <>
      <div className="w-full bg-white text-black sticky top-0 z-50 shadow-md">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <img src='/Krushisetu_banner-removebg-preview.png' className='h-15 w-40 bg-transparent' />
          </div>
          
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              onClick={handleNavbarToggle}
            >
            <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              <div className="relative h-5 w-6">
                <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'top-2.5 rotate-45' : 'top-0 rotate-0'}`}/>
                <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'top-2.5 opacity-100'}`}/>
                <span className={`absolute left-0 block h-[2px] w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'top-2.5 -rotate-45' : 'top-5 rotate-0'}`}/>
              </div>
            </button>

            <div className="lg:flex space-x-6 hidden md:hidden">
              <button className="Navbar">Home</button>
              <button className="Navbar">Subsidy</button>
              <button className="Navbar">Guide</button>
              <button className="Navbar">News</button>
              <button className="Navbar">FAQ</button>
              <button className="Navbar">Contact Us</button>
              <button onClick={handleLoginClick} className="bg-green-600 hover:scale-105 text-white font-semibold text-xl text-center px-8 p-0.5 pb-1.5 rounded-full">Login</button>
            </div>

            {isOpen && (
              <div className="lg:hidden absolute top-16 right-0 bg-white w-2/4 shadow-md z-40">
                <button className="Navbar-mobile">Home</button>
                <button className="Navbar-mobile">Subsidy</button>
                <button className="Navbar-mobile">Guide</button>
                <button className="Navbar-mobile">News</button>
                <button className="Navbar-mobile">FAQ</button>
                <button className="Navbar-mobile">Contact Us</button>
                <button
                  onClick={handleLoginClick} // Navigate to login
                  className="Navbar-mobile mb-2 font-semibold">
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
