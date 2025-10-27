import React from "react";

function Footer() {
  return (
    <>
      <div className=" bg-[#F5F5DC] text-black flex pt-6 justify-around pb-3">
        <div className="max-w-[40%]"> 
           <img src="/Krushisetu_banner-removebg-preview.png" alt="Krushisetu Logo" className="w-30 h-12 mb-2 bg-white"/>
            <p className="text-l leading-relaxed">Krushisetu connects farmers with schemes, subsidies, and resources to help them grow and manage their farms.</p>
            <div className="flex mt-2">
              <a href="#"><img src="/Facebook_Logo (2).svg" alt="Facebook Logo" className="mr-4 h-6 w-6" /></a>
              <a href="#"><img src="/Instagram_Logo.svg" alt="Instagram Logo" className="mr-4 h-7 w-7" /></a>
              <a href="#"><img src="/youtube_logo.svg" alt="Youtube Logo" className="mr-2 h-8 w-8" /></a>
            </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Useful Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-800 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-green-800 transition-colors">Privacy & Policy</a></li>
              <li><a href="#" className="hover:text-green-800 transition-colors">Terms & Conditions</a></li>
            </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <p className="flex items-center mb-1"><img src="./Location.svg" className="w-5 h-5"/>Gandhinagar, Gujarat</p>
            <p className="flex items-center mb-1"><img src="./Call.svg" className="w-5 h-5"/><a href="tel:1800-1800-586" className="hover:text-green-800 transition-colors">1800-1800-586</a></p>
            <p className="flex items-center"><img src="./Gmail.svg" className="w-4 h-4 mr-1"/><a href="mailto:info@krushisetu.com" className="hover:text-green-800 transition-colors">info@krushisetu.com</a></p>
        </div>
      </div>
      <div className="text-center py-2 bg-[#F5F5DC]">
        <p>&copy; {new Date().getFullYear()} Krushisetu. All rights reserved.</p>
      </div>
    </>
  );
}

export default Footer;