import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from './Navbar';
import Footer from './Footer';
import Settings from './Settings';
import Subsidy_List from '../User_Profile/Subsidy_List';

function LearnMore() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <Settings />

      <div className="bg-[#1B7A43] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to <span className="text-white drop-shadow-lg">KrushiSetu</span>
            </h1>
            <p className="text-md text-white/90 max-w-3xl mx-auto">
              Your trusted partner in agricultural growth - connecting farmers with government subsidies, 
              resources, and opportunities to enhance farming practices and income.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-[#F3FFF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12" data-aos="fade-up">
            What We Do
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#C3FFC8] rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow" data-aos="fade-up" data-aos-delay="100">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-[#1B7A43]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  <path d="M11 9h2v2h-2zm0 4h2v6h-2z" opacity="0.3"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Subsidy Information</h3>
              <p className="text-gray-700">
                Access comprehensive information about agricultural subsidies, eligibility criteria, 
                and application processes - all in one place.
              </p>
            </div>
            <div className="text-center p-6 bg-[#C3FFC8] rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow" data-aos="fade-up" data-aos-delay="200">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-[#1B7A43]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Easy Application</h3>
              <p className="text-gray-700">
                Simplified online application process with step-by-step guidance and document 
                management to make subsidy applications hassle-free.
              </p>
            </div>
            <div className="text-center p-6 bg-[#C3FFC8] rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow" data-aos="fade-up" data-aos-delay="300">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-[#1B7A43]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Track Applications</h3>
              <p className="text-gray-700">
                Monitor your subsidy applications in real-time, receive updates, and manage 
                all your applications from a single dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12" data-aos="fade-up">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center" data-aos="zoom-in" data-aos-delay="100">
              <div className="bg-[#1B7A43] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Register</h3>
              <p className="text-gray-600">
                Create your account with basic information and farmer details
              </p>
            </div>
            <div className="text-center" data-aos="zoom-in" data-aos-delay="200">
              <div className="bg-[#1B7A43] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Explore</h3>
              <p className="text-gray-600">
                Browse available subsidies tailored to your farming needs
              </p>
            </div>
            <div className="text-center" data-aos="zoom-in" data-aos-delay="300">
              <div className="bg-[#1B7A43] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Apply</h3>
              <p className="text-gray-600">
                Submit applications online with required documents
              </p>
            </div>
            <div className="text-center" data-aos="zoom-in" data-aos-delay="400">
              <div className="bg-[#1B7A43] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Track</h3>
              <p className="text-gray-600">
                Monitor your application status and receive updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="py-16 bg-[#F3FFF1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12" data-aos="fade-up">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start" data-aos="fade-right">
              <div className="mr-4 flex-shrink-0">
                <svg className="w-12 h-12 text-[#1B7A43]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm7.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM8 15h8v2H8v-2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI-Powered Subsidy Recommendations</h3>
                <p className="text-gray-700">
                  Get intelligent subsidy recommendations using AI based on your farm profile, location, crop type, land size, and farming practices
                </p>
              </div>
            </div>
            <div className="flex items-start" data-aos="fade-left">
              <div className="mr-4 flex-shrink-0">
                <svg className="w-12 h-12 text-[#1B7A43]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Multi-Language Support</h3>
                <p className="text-gray-700">
                  Access the platform in 11+ regional Indian languages including Hindi, Gujarati, Marathi, Tamil, Telugu, Kannada, and more
                </p>
              </div>
            </div>
            <div className="flex items-start" data-aos="fade-right">
              <div className="mr-4 flex-shrink-0">
                <svg className="w-12 h-12 text-[#1B7A43]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Application Tracking</h3>
                <p className="text-gray-700">
                  Monitor your subsidy applications in real-time with status updates and notifications
                </p>
              </div>
            </div>
            <div className="flex items-start" data-aos="fade-left">
              <div className="mr-4 flex-shrink-0">
                <svg className="w-12 h-12 text-[#1B7A43]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zm-9-4h2v2h-2zm0-6h2v4h-2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Grievance Resolution System</h3>
                <p className="text-gray-700">
                  Raise and track grievances with our dedicated support system for quick resolution of your issues
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="zoom-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-md text-gray-700 mb-8">
            Join thousands of farmers who are already benefiting from government subsidies through KrushiSetu
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#1B7A43] text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-[#145a32] hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Register Now
            </button>
            <button 
              onClick={() => navigate('/subsidy-list')}
              className="bg-white text-[#1B7A43] border-2 border-[#1B7A43] font-bold text-lg px-10 py-4 rounded-full hover:bg-[#F3FFF1] hover:scale-105 transition-all duration-300"
            >
              Browse Subsidies
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LearnMore;
