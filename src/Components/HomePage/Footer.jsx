import React from "react";

function Footer() {
  return (
    <>
      <div id="contact" className=" bg-[#F5F5DC] text-black flex md:flex-row flex-col pt-5 justify-around pb-3">
        <div className="md:max-w-[40%] px-7 md:px-0"> 
           <img src="/Krushisetu_banner-removebg-preview.png" alt="Krushisetu Logo" className="w-48 h-auto mb-4 object-contain"/>
            <p className="text-gray-700 leading-relaxed mb-4">Krushisetu connects farmers with schemes, subsidies, and resources to help them grow and manage their farms.</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-semibold text-gray-700">Follow us:</span>
              <a href="https://github.com/Jainil-Patel1210/KrushiSetu.git" target="_blank" rel="noopener noreferrer" 
                  className="hover:scale-110 transition-all duration-300 inline-flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
              </a>
            </div>
        </div>

        <div className="w-full md:w-auto px-7 md:px-0">
          <h3 className="text-lg font-semibold mb-2 mt-2">Useful Links</h3>
            <ul className="space-y-1 text-sm">
              <li><div className="hover:text-[#1B7A43] transition-colors">Privacy & Policy</div></li>
              <li><div className="hover:text-[#1B7A43] transition-colors">Terms & Conditions</div></li>
            </ul>
        </div>
        <div className="w-full md:w-auto px-7 md:px-0">
          <h3 className="text-lg font-semibold mb-2 mt-2">Contact</h3>
            <p className="flex mb-1"><img src="./Location.svg" className="w-5 h-5 pt-1"/>Gandhinagar, Gujarat</p>
            <p className="flex mb-1"><img src="./Call.svg" className="w-5 h-5 pt-1"/><a href="tel:1800-1800-586" className="hover:text-green-800 transition-colors">1800-1800-586</a></p>
            <p className="flex"><img src="./Gmail.svg" className="w-5 h-5 mr-1 pt-1.5"/><a href="mailto:info@krushisetu.com" className="hover:text-green-800 transition-colors">info@krushisetu.com</a></p>
        </div>
      </div>
      <div className="text-center py-1 bg-[#F5F5DC]">
        <p>&copy; {new Date().getFullYear()} Krushisetu. All rights reserved.</p>
      </div>
    </>
  );
}

export default Footer;