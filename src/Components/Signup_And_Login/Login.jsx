import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleDropdown from './RoleDropDown';
import SocialLogin from './SocialLogin';
import PasswordToggleIcon from './PasswordToggleIcon';
import api from './api';

function Login({ onForgotPasswordClick, onLoginSuccess }) {
    const navigate = useNavigate();
    const [loginWithOtp, setLoginWithOtp] = useState(false);
    const [showLoginOtpForm, setShowLoginOtpForm] = useState(false);
    const [userId, setUserId] = useState(''); 

    // Login form states
    const [loginMobileOrEmail, setLoginMobileOrEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginMobile, setLoginMobile] = useState('');
    const [loginOtp, setLoginOtp] = useState('');
    const [loginEmailError, setLoginEmailError] = useState('');
    const [loginMobileError, setLoginMobileError] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Role selection states
    const [role, setRole] = useState('');
    const [isOpen, setIsOpen] = useState(false); 

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setIsOpen(false);
    };

    const handleClick = () => setIsOpen(!isOpen);

    // Login with OTP handlers
    const handleLoginOtpSwitch = () => {
        setLoginWithOtp(!loginWithOtp);
        setShowLoginOtpForm(false);
        setLoginMobile('');
        setLoginOtp('');
        setLoginMobileOrEmail('');
        setLoginPassword('');
        setLoginEmailError('');
        setLoginMobileError('');
    };

    const handleLoginMobileSubmit = async (e) => {
        e.preventDefault();
        if (loginMobile.length !== 10) {
            setLoginMobileError('Please enter a valid 10-digit mobile number.');
            return;
        }
        if (!role) {
            alert("Please select a role.");
            return;
        }
        setLoginMobileError('');
        try {
            const response = await api.post("/login/", {
                mobile_number: loginMobile,
                role: role,
            });
            setUserId(response.data.user_id); // save user_id for OTP step
            alert("OTP sent to your mobile!");
            setShowLoginOtpForm(true);
        } catch (error) {
            console.error("Login failed: ", error.response ? error.response.data : error.message);
            alert("Login failed!");
        }
    };

    const handleLoginOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/verify-otp/", {
                user_id: userId,
                otp: loginOtp,
            });
            alert(response.data.message);
            alert("Logged in successfully!");
            // Reset states after successful login
            setShowLoginOtpForm(false);
            setLoginWithOtp(false);
            setLoginMobile('');
            setLoginOtp('');
            setRole('');
            onLoginSuccess(); // Notify parent of successful login (e.g., to redirect)
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "OTP verification failed");
        }
    };

    const handleLoginEmailChange = (e) => {
        const value = e.target.value.replace(/[^0-9a-zA-Z@._-]/g, '');
        setLoginMobileOrEmail(value);
        if (value && !validateEmail(value)) {
            setLoginEmailError('Enter a valid email address.');
        } else {
            setLoginEmailError('');
        }
    };

    const handleLoginPasswordChange = (e) => {
        setLoginPassword(e.target.value);
    };

    const handleLoginMobileChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setLoginMobile(val);
        if (val.length !== 10 && val.length > 0) {
            setLoginMobileError('Mobile number must be exactly 10 digits.');
        } else {
            setLoginMobileError('');
        }
    };

    // Login form submit (Email/Password)
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!role) {
                alert("Please select a role.");
                return;
            }

            if (/^\d{10}$/.test(loginMobileOrEmail)) {
                // valid mobile
            } else if (validateEmail(loginMobileOrEmail)) {
                // valid email
            } else {
                setLoginEmailError("Enter a valid 10-digit mobile number or email.");
                return;
            }

            const response = await api.post("/token/", {
                email_address: loginMobileOrEmail,
                password: loginPassword,
                role: role,
            });

            // Save JWT tokens (for later authenticated requests)
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            
            setLoginEmailError("");
            alert("Logged in successfully!");
            // Reset states after successful login
            setLoginMobileOrEmail("");
            setLoginPassword("");
            setRole('');
            onLoginSuccess(); // Notify parent of successful login (e.g., to redirect)
        } catch (error) {
            console.error("Login failed: ", error.response ? error.response.data : error.message);
            alert("Login failed! " + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div>
            <p className="text-black text-center text-xl font-bold mb-2">Welcome back!</p>
            {!loginWithOtp ? (
                <form onSubmit={handleLoginSubmit}>
                    <input
                        className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                        type="text"
                        placeholder="Email"
                        value={loginMobileOrEmail}
                        onChange={handleLoginEmailChange}
                        required
                    />
                    {loginEmailError && <p className="text-red-600 text-xs mb-1">{loginEmailError}</p>}
                    <div className="relative">
                        <input
                            className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="Password"
                            value={loginPassword}
                            onChange={handleLoginPasswordChange}
                            required
                        />
                        <PasswordToggleIcon visible={showLoginPassword} onClick={() => setShowLoginPassword((prev) => !prev)} />
                    </div>
                    <RoleDropdown
                        role={role}
                        isOpen={isOpen}
                        onClick={handleClick}
                        onSelect={handleRoleSelect}
                    />
                    <div className='flex justify-between text-green-700 font-semibold mb-2'>
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={onForgotPasswordClick}
                        >
                            Forgot Password?
                        </span>
                        <span className="cursor-pointer hover:underline" onClick={handleLoginOtpSwitch}>
                            Login with Mobile
                        </span>
                    </div>
                    <div className="flex items-center justify-center pt-2">
                        <input
                            className={`text-black font-bold p-2 mb-3 w-50 rounded-md  ${role ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200`}
                            type="submit"
                            value="Log In"
                            disabled={!role}
                        />
                    </div>
                    <SocialLogin />
                </form>
            ) : (
                <form onSubmit={showLoginOtpForm ? handleLoginOtpSubmit : handleLoginMobileSubmit}>
                    {!showLoginOtpForm ? (
                        <>
                            <input
                                className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 "
                                type="tel"
                                placeholder="Mobile Number"
                                value={loginMobile}
                                onChange={handleLoginMobileChange}
                                maxLength={10}
                                required
                            />
                            {loginMobileError && <p className="text-red-600 text-xs mb-1">{loginMobileError}</p>}
                        </>
                    ) : (
                        <input
                            className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 "
                            type="text"
                            placeholder="Enter OTP"
                            value={loginOtp}
                            onChange={e => setLoginOtp(e.target.value)}
                            required
                        />
                    )}
                    <RoleDropdown
                        role={role}
                        isOpen={isOpen}
                        onClick={handleClick}
                        onSelect={handleRoleSelect}
                    />
                    <div className='flex justify-between text-green-700 font-semibold mb-2'>
                        <span
                            className="cursor-pointer hover:underline "
                            onClick={onForgotPasswordClick}
                        >
                            Forgot Password?
                        </span>
                        <span className="cursor-pointer hover:underline" onClick={handleLoginOtpSwitch}>
                            Login with Email
                        </span>
                    </div>
                    <div className="flex items-center justify-center pt-2">
                        <button
                            className={`text-black font-bold p-2 mb-3 w-50 rounded-md ${role ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200`}
                            type="submit"
                            disabled={!role}
                        >
                            {showLoginOtpForm ? 'Verify OTP & Login' : 'Send OTP'}
                        </button>
                    </div>
                    <SocialLogin />
                </form>
            )}
        </div>
    );
}

export default Login;