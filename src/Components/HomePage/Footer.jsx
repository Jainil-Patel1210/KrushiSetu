import React from "react";

function Footer() {
  return (
    <div className="bg-[#F5F5DC] text-black">
      <div className="container mx-auto h-50 px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          <div className="lg:col-span-1 ml-10">
            <img
              src="/footer_logo_svg.svg"
              alt="Krushisetu Logo"
              className="h-10 w-20 mb-4"
            />
            <p className="text-l leading-relaxed">
              Krushisetu connects farmers with schemes, subsidies, and resources
              to help them grow and manage their farms.
            </p>
          </div>

          {/* Useful Links*/}
          <div className="ml-40">
            <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-800 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-800 transition-colors">
                  Privacy & Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-800 transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
             {/* Contact */}

            <div className="ml-20">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic space-y-2 text-sm">
              <p>Address: Gandhinagar, Gujarat</p>
              <p>Phone: <a href="tel:1800-1800-586" className="hover:text-green-800 transition-colors">1800-1800-586</a></p>
              <p>Email: <a href="mailto:info@krushisetu.com" className="hover:text-green-800 transition-colors">info@krushisetu.com</a></p>
            </address>
          </div>

            {/* Follow Us */}
             <div className="ml-30"> 
                <h3 className="text-lg font-semibold mb-4">Follow Us On</h3>
                <ul className="space-y-3">
                <li>
                    <a href="#" className="flex items-center hover:text-green-800 transition-colors h-5 w-5">
                     <img src="/Facebook_Logo.svg"></img> Facebook
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center hover:text-green-800 transition-colors h-5 w-5">
                      <img src="./Instagram_Logo.svg"></img>Instagram
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center hover:text-green-800 transition-colors h-5 w-5">
                     <img src="./youtube_logo.svg"></img> Youtube
                    </a>
                </li>
                </ul>
          </div>
          
        </div>
        </div>  
      </div>
    
  );
}

export default Footer;
