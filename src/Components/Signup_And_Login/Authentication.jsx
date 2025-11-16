import React, { useState } from 'react';
import './Authentication.css'; // Your main CSS file
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import Settings from '../HomePage/Settings';
import { getRedirectPathForRole } from '../../utils/auth';

function Authentication() {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location?.state?.redirectTo || null;
    const [page, setPage] = useState('login'); // 'login' or 'signup'
    const [forgotPasswordActive, setForgotPasswordActive] = useState(false); // Controls visibility of ForgotPasswordFlow

    // Function to switch between login and signup, and reset states
    const handlePageSwitch = (targetPage) => {
        setPage(targetPage);
        setForgotPasswordActive(false);
    };

    // Callback for LoginPage to trigger navigation after successful login
    const handleLoginSuccess = () => {
        if (redirectTo) {
            navigate(redirectTo);
            return;
        }
        navigate('/sidebar');
    };

    // Callback for SignupPage to trigger switch to login page after successful signup
    const handleSignupSuccess = () => {
        handlePageSwitch('login');
    };

    // Callback for LoginPage or ForgotPasswordFlow to activate forgot password flow
    const handleForgotPasswordClick = () => {
        setForgotPasswordActive(true);
    };

    // Callback for ForgotPasswordFlow to go back to login page
    const handleBackToLoginFromForgot = () => {
        setForgotPasswordActive(false);
        setPage('login');
    };

    return (
        <>
            <Settings />
            <div className="signup-bg bg-green-300 h-screen flex flex-col">
                <div className="absolute top-5 left-5 flex items-center">
                    <FontAwesomeIcon icon={faArrowLeftLong} className="mr-2 text-green-600" />
                    <button className="bg-green-600 hover:scale-105 text-white font-semibold text-xl px-8 py-1 my-2 rounded-md"
                        onClick={() => navigate('/')}>Back</button>
                </div>
                <div className='flex items-center justify-center flex-1'>
                   <div className="bg-gray-50 w-full max-w-sm p-8 pb-4 rounded-lg shadow-lg">
                    <div className="bg-gray-500 p-1 rounded-md mb-4 flex justify-between items-center">
                        <button
                            className={`text-black font-bold w-[50%] ${(page === 'login' || forgotPasswordActive) ? 'bg-[#07843A] text-white rounded-md' : ''}`}
                            onClick={() => handlePageSwitch('login')}
                        >Login</button>
                        <button
                            className={`text-black font-bold w-[50%] ${page === 'signup' ? 'bg-[#07843A] text-white rounded-md' : ''}`}
                            onClick={() => handlePageSwitch('signup')}
                        >Sign Up</button>
                    </div>

                    {/* Conditional rendering based on top-level state */}
                    {forgotPasswordActive ? (
                        <ForgotPassword onBackToLogin={handleBackToLoginFromForgot} />
                    ) : page === 'login' ? (
                        <Login
                            onForgotPasswordClick={handleForgotPasswordClick}
                            onLoginSuccess={handleLoginSuccess}
                            redirectTo={redirectTo}
                        />
                    ) : ( // page === 'signup'
                        <Signup
                            onSignupSuccess={handleSignupSuccess}
                        />
                    )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Authentication;