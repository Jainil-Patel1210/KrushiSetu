import React, { useState } from 'react';
import './Signup.css';
import axios from "axios";
import api from './api';
import { GoogleOAuthProvider, GoogleLogin } from
    "@react-oauth/google";

// Role Dropdown Component
function RoleDropdown({ role, isOpen, onClick, onSelect }) {
    return (
        <div className="relative w-full">
            <input
                className="w-full p-2 pr-12 mb-3 rounded-md bg-white border"
                type="text"
                placeholder="Role"
                value={role}
                onClick={onClick}
                readOnly
                required
            />
            <img
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 pb-2"
                src="/Dropdown_Logo.svg"
                alt="Dropdown"
                onClick={onClick}
            />
            {isOpen && (
                <div className="absolute left-0 right-0 bg-white border rounded shadow z-10">
                    <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Farmer')}>Farmer</p>
                    <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Officer')}>Officer</p>
                    <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Admin')}>Admin</p>
                    <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Subsidy Provider')}>Subsidy Provider</p>
                </div>
            )}
        </div>
    );
}

// Social Login Component
function SocialLogin() {

    //Google login
    const handleGoogleLogin = async (credentialResponse) => {
        const token = credentialResponse.credential; // Google ID token

        try {
            // Send Google token to Django backend
            const res = await api.post("/auth/google/callback/", {
                token,
            });

            console.log("Backend response:", res.data);
            alert("Login successful! Check console for details.");

            // Save JWT tokens (for later authenticated requests)
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            alert("Login failed. Check console.");
        }
    };

    return (
        <div>
            <div className="flex items-center">
                <hr className="border-t-2 w-15 ml-4" />
                <p className="ml-4 mr-2">Or continue with</p>
                <hr className="border-t-2 w-17 ml-2" />
            </div>

            <div className="flex justify-around pt-2 pl-25 pr-25">
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <div className="border-0 bg-light w-10.5 h-9.5">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => console.log("Google Login Failed")}
                        />
                    </div>
                </GoogleOAuthProvider>
                <img className="w-9.5 h-9.5" src="/DigiLocker_Logo.png" alt="DigiLocker Logo" />
            </div>
        </div>
    );
}

function Signup() {
    const [page, setPage] = useState('login');
    const [role, setRole] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [signupMethod, setSignupMethod] = useState('email');
    const [showOtpForm, setShowOtpForm] = useState(false);

    // Signup states
    const [signupFullName, setSignupFullName] = useState('');
    const [signupAadhaar, setSignupAadhaar] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupMobile, setSignupMobile] = useState('');
    const [signupOtp, setSignupOtp] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupEmailError, setSignupEmailError] = useState('');
    const [signupPasswordError, setSignupPasswordError] = useState('');

    // Login with OTP states
    const [loginWithOtp, setLoginWithOtp] = useState(false);
    const [showLoginOtpForm, setShowLoginOtpForm] = useState(false);
    const [userId, setUserId] = useState('');

    // Login form states
    const [loginMobileOrEmail, setLoginMobileOrEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginMobile, setLoginMobile] = useState('');
    const [loginOtp, setLoginOtp] = useState('');
    const [loginEmailError, setLoginEmailError] = useState('');

    // Forgot password multi-step states
    const [forgotPassword, setForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: new password
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [forgotPasswordError, setForgotPasswordError] = useState('');

    // Reset all form states
    const handlePageSwitch = (page) => {
        setPage(page);
        setSignupMethod('email');
        setShowOtpForm(false);
        setSignupFullName('');
        setSignupAadhaar('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setSignupMobile('');
        setSignupOtp('');
        setSignupEmail('');
        setSignupEmailError('');
        setSignupPasswordError('');
        setLoginWithOtp(false);
        setShowLoginOtpForm(false);
        setLoginMobileOrEmail('');
        setLoginPassword('');
        setLoginMobile('');
        setLoginOtp('');
        setLoginEmailError('');
        setRole('');
        setForgotPassword(false);
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotPasswordError('');
        setIsOpen(false);
    };

    // Role dropdown handlers
    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setIsOpen(false);
    };
    const handleClick = () => setIsOpen(!isOpen);

    // Signup method switch
    const handleSignupMethodSwitch = () => {
        setSignupMethod(signupMethod === 'email' ? 'otp' : 'email');
        setShowOtpForm(false);
        setSignupFullName('');
        setSignupAadhaar('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setSignupMobile('');
        setSignupOtp('');
        setSignupEmail('');
        setSignupEmailError('');
        setSignupPasswordError('');
    };

    // Email validation
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Signup OTP handlers
    const handleMobileSubmit = (e) => {
        e.preventDefault();
        if (signupMobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }
        setShowOtpForm(true);
        setSignupMobile('');
    };
    const handleOtpSubmit = (e) => {
        e.preventDefault();
        alert("Account created successfully!");
        handlePageSwitch('login');
    };

    // Login with OTP handlers
    const handleLoginOtpSwitch = () => {
        setLoginWithOtp(!loginWithOtp);
        setShowLoginOtpForm(false);
        setLoginMobile('');
        setLoginOtp('');
        setLoginMobileOrEmail('');
        setLoginPassword('');
        setLoginEmailError('');
    };

    const handleLoginMobileSubmit = async (e) => {
        e.preventDefault();
        if (loginMobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }
        try {
            console.log(loginMobile)
            const response = await api.post("/login/", {
                mobile_number: loginMobile,
                role: role,
            });
            console.log(response.data.user_id)
            setUserId(response.data.user_id); // save user_id for OTP step
            alert("OTP sent to your mobile!");
            setShowLoginOtpForm(true);
            setLoginMobile('');
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
            setShowLoginOtpForm(false);
            setLoginWithOtp(false);
            setLoginMobile('');
            setLoginOtp('');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "OTP verification failed");
        }
    };

    // Login form submit
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

            setLoginEmailError("");
            alert("Logged in successfully!");
            setLoginMobileOrEmail("");
            setLoginPassword("");
        } catch (error) {
            console.error("Login failed: ", error.response ? error.response.data : error.message);
            alert("Login failed!");
        }
    };

    // Signup email validation
    const handleSignupEmailChange = (e) => {
        setSignupEmail(e.target.value);
        if (e.target.value && !validateEmail(e.target.value)) {
            setSignupEmailError('Enter a valid email address.');
        } else {
            setSignupEmailError('');
        }
    };

    // Signup password match validation
    const handleSignupPasswordChange = (e) => {
        setSignupPassword(e.target.value);
        if (signupConfirmPassword && e.target.value !== signupConfirmPassword) {
            setSignupPasswordError('Passwords do not match.');
        } else {
            setSignupPasswordError('');
        }
    };
    const handleSignupConfirmPasswordChange = (e) => {
        setSignupConfirmPassword(e.target.value);
        if (signupPassword && e.target.value !== signupPassword) {
            setSignupPasswordError('Passwords do not match.');
        } else {
            setSignupPasswordError('');
        }
    };

    // Signup email form submit
    const handleSignupEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            if (signupPassword !== signupConfirmPassword) {
                setSignupPasswordError('Passwords do not match.');
                return;
            } else {
                const response = await axios.post("http://127.0.0.1:8000/api/signup/", {
                    full_name: signupFullName,
                    email_address: signupEmail,
                    mobile_number: signupAadhaar,
                    password: signupPassword,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                setSignupPasswordError('');
                alert("Account created successfully!");
                handlePageSwitch('login');
            }
        } catch (error) {
            console.error("Register failed: ", error.response ? error.response.data : error.message);
            alert("Register failed!");
        }
    };

    // Forgot password handlers
    const handleForgotPasswordClick = () => {
        setForgotPassword(true);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setOtpSent(false);
        setOtpVerified(false);
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotPasswordError('');
    };

    // Step 1: Send OTP to email
    const handleForgotSendOtp = async (e) => {
        e.preventDefault();
        if (!forgotEmail || !validateEmail(forgotEmail)) {
            setForgotPasswordError('Enter a valid email address.');
            return;
        }
        setForgotPasswordError('');
        try {
            const response = await api.post("/forgot-password/", {
                email: forgotEmail,
            });
            setOtpSent(true);
            setForgotStep(2);
            alert('OTP sent to your email!');
        }
        catch (err) {
            console.error(err);
            setForgotPasswordError(
                err.response?.data?.error || 'Failed to send OTP. Please try again.'
            );
        }
    };

    // Step 2: Verify OTP
    const handleForgotVerifyOtp = async (e) => {
        e.preventDefault();
        if (!forgotOtp) {
            setForgotPasswordError('Enter the OTP sent to your email.');
            return;
        }
        setForgotPasswordError('');

        try {
            const response = await api.post("/forgot-password/verify-otp/", {
                email: forgotEmail,
                otp: forgotOtp,
            });
            setOtpVerified(true);
            setForgotStep(3);
            alert('OTP verified. You can now reset your password.');
        } catch (err) {
            console.error(err);
            setForgotPasswordError(
                err.response?.data?.error || 'Invalid OTP. Please try again.'
            );
        }
    };

    // Step 3: Set new password
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmNewPassword) {
            setForgotPasswordError('Please fill both fields.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setForgotPasswordError('Passwords do not match.');
            return;
        }
        setForgotPasswordError('');
        try {
            const response = await api.post("/forgot-password/reset-password/", {
                email: forgotEmail,
                new_password: newPassword,
            });

            alert('Password reset successfully!');
            handlePageSwitch('login');
        } catch (err) {
            console.error(err);
            setForgotPasswordError(
                err.response?.data?.error || 'Password reset failed.'
            );
        }
    };

    return (
        <div className="signup-bg bg-green-300 h-screen flex items-center justify-center">
            <div className="bg-gray-50 w-full max-w-sm p-8 pb-4 rounded-lg">
                <div className="bg-gray-500 p-1 rounded-md mb-4 flex justify-between items-center">
                    <button
                        className={`text-black font-bold w-[50%] ${((page === 'login') || forgotPassword) ? 'bg-[#07843A] text-white rounded-md' : ''}`}
                        onClick={() => handlePageSwitch('login')}
                    >Login</button>
                    <button
                        className={`text-black font-bold w-[50%] ${page === 'signup' ? 'bg-[#07843A] text-white rounded-md' : ''}`}
                        onClick={() => handlePageSwitch('signup')}
                    >Sign Up</button>
                </div>

                {/* Forgot Password Page - Multi-step */}
                {forgotPassword && (
                    <div>
                        <p className="text-black text-center text-xl font-bold mb-4">Forgot Password</p>
                        {forgotStep === 1 && (
                            <form onSubmit={handleForgotSendOtp}>
                                <input
                                    className="w-full p-2 mb-3 rounded-md bg-white border"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={forgotEmail}
                                    onChange={e => setForgotEmail(e.target.value)}
                                    required
                                />
                                {forgotPasswordError && <p className="text-red-600 text-xs mb-2">{forgotPasswordError}</p>}
                                <div className="flex items-center justify-center pt-2">
                                    <button
                                        className="text-black font-bold p-2 mb-3 w-50 rounded-md bg-green-700 hover:bg-green-800 transition duration-200"
                                        type="submit"
                                    >
                                        Send OTP
                                    </button>
                                </div>
                                <div className="text-center">
                                    <span
                                        className="text-green-700 cursor-pointer hover:underline"
                                        onClick={() => setForgotPassword(false)}
                                    >
                                        Back to Login
                                    </span>
                                </div>
                            </form>
                        )}
                        {forgotStep === 2 && (
                            <form onSubmit={handleForgotVerifyOtp}>
                                <input
                                    className="w-full p-2 mb-3 rounded-md bg-white border"
                                    type="text"
                                    placeholder="Enter OTP sent to your email"
                                    value={forgotOtp}
                                    onChange={e => setForgotOtp(e.target.value)}
                                    required
                                />
                                {forgotPasswordError && <p className="text-red-600 text-xs mb-2">{forgotPasswordError}</p>}
                                <div className="flex items-center justify-center pt-2">
                                    <button
                                        className="text-black font-bold p-2 mb-3 w-50 rounded-md bg-green-700 hover:bg-green-800 transition duration-200"
                                        type="submit"
                                    >
                                        Verify OTP
                                    </button>
                                </div>
                                <div className="text-center">
                                    <span
                                        className="text-green-700 cursor-pointer hover:underline"
                                        onClick={() => { setForgotStep(1); setForgotOtp(''); setForgotPasswordError(''); }}
                                    >
                                        Back to Email
                                    </span>
                                </div>
                            </form>
                        )}
                        {forgotStep === 3 && (
                            <form onSubmit={handleForgotPasswordSubmit}>
                                <input
                                    className="w-full p-2 mb-3 rounded-md bg-white border"
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                                <input
                                    className="w-full p-2 mb-3 rounded-md bg-white border"
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmNewPassword}
                                    onChange={e => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                                {forgotPasswordError && <p className="text-red-600 text-xs mb-2">{forgotPasswordError}</p>}
                                <div className="flex items-center justify-center pt-2">
                                    <button
                                        className="text-black font-bold p-2 mb-3 w-50 rounded-md bg-green-700 hover:bg-green-800 transition duration-200"
                                        type="submit"
                                    >
                                        Reset Password
                                    </button>
                                </div>
                                <div className="text-center">
                                    <span
                                        className="text-green-700 cursor-pointer hover:underline"
                                        onClick={() => { setForgotStep(1); setForgotEmail(''); setForgotOtp(''); setNewPassword(''); setConfirmNewPassword(''); setForgotPasswordError(''); }}
                                    >
                                        Back to Email
                                    </span>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Login Page */}
                {page === 'login' && !forgotPassword && (
                    <div>
                        <p className="text-black text-center text-xl font-bold mb-2">Welcome back!</p>
                        {!loginWithOtp ? (
                            <form onSubmit={handleLoginSubmit}>
                                <input
                                    className="w-full p-2 mb-3 rounded-md bg-white border"
                                    type="text"
                                    placeholder="Email"
                                    value={loginMobileOrEmail}
                                    onChange={e => setLoginMobileOrEmail(e.target.value.replace(/[^0-9a-zA-Z@._-]/g, ''))}
                                    required
                                />
                                {loginEmailError && <p className="text-red-600 text-xs mb-1">{loginEmailError}</p>}
                                <input
                                    className="w-full p-2 mb-3 rounded-md bg-white border"
                                    type="password"
                                    placeholder="Password"
                                    value={loginPassword}
                                    onChange={e => setLoginPassword(e.target.value)}
                                    required
                                />
                                <RoleDropdown
                                    role={role}
                                    isOpen={isOpen}
                                    onClick={handleClick}
                                    onSelect={handleRoleSelect}
                                />
                                <div className='flex justify-between text-green-700 font-semibold mb-2'>
                                    <span
                                        className="cursor-pointer hover:underline"
                                        onClick={handleForgotPasswordClick}
                                    >
                                        Forgot Password?
                                    </span>
                                    <span className="cursor-pointer hover:underline" onClick={handleLoginOtpSwitch}>
                                        {loginWithOtp ? 'Login with Password' : 'Login with OTP'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center pt-2">
                                    <input
                                        className={`text-black font-bold p-2 mb-3 w-50 rounded-md ${role ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200`}
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
                                    <input
                                        className="w-full p-2 mb-3 rounded-md bg-white border"
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={loginMobile}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setLoginMobile(val);
                                        }}
                                        maxLength={10}
                                        required
                                    />
                                ) : (
                                    <input
                                        className="w-full p-2 mb-3 rounded-md bg-white border"
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
                                        onClick={handleForgotPasswordClick}
                                    >
                                        Forgot Password?
                                    </span>
                                    <span className="cursor-pointer hover:underline" onClick={handleLoginOtpSwitch}>
                                        {loginWithOtp ? 'Login with Password' : 'Login with OTP'}
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
                )}

                {/* Signup Page */}
                {page === 'signup' && (
                    <div>
                        <p className="text-black text-center text-xl font-bold mb-0.5">Create Your Account</p>
                        {signupMethod === 'email' ? (
                            <form onSubmit={handleSignupEmailSubmit}>
                                <div className="p-2">
                                    <input className="w-full p-1.5 mb-3 rounded-md bg-white border" type="text" placeholder="Full Name" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} required />
                                    <input className="w-full p-1.5 mb-3 rounded-md bg-white border" type="text" placeholder="Mobile Number" value={signupAadhaar} onChange={e => setSignupAadhaar(e.target.value)} />
                                    <input
                                        className="w-full p-1.5 mb-1 rounded-md bg-white border"
                                        type="email"
                                        placeholder="Email"
                                        value={signupEmail}
                                        onChange={handleSignupEmailChange}
                                        required
                                    />
                                    {signupEmailError && <p className="text-red-600 text-xs mb-2">{signupEmailError}</p>}
                                    <input className="w-full p-1.5 mb-3 rounded-md bg-white border" type="password" placeholder="Password" value={signupPassword} onChange={handleSignupPasswordChange} required />
                                    <input className="w-full p-1.5 rounded-md bg-white border" type="password" placeholder="Confirm Password" value={signupConfirmPassword} onChange={handleSignupConfirmPasswordChange} required />
                                    {signupPasswordError && <p className="text-red-600 text-xs mb-2">{signupPasswordError}</p>}
                                </div>
                                <p onClick={handleSignupMethodSwitch} className="cursor-pointer hover:underline text-green-700 font-semibold mb-2 text-right mr-3">
                                    {signupMethod === 'email' ? 'Login with OTP' : 'Login with Email'}
                                </p>
                                <div className="flex items-center space-x-2 pl-4 mb-2">
                                    <input type="checkbox" id="agree" className="h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-500" required />
                                    <label htmlFor="agree" className="text-black">I agree to the <span className='text-green-700'>Terms & Conditions</span></label>
                                </div>
                                <div className="flex items-center justify-center pt-2">
                                    <button
                                        className={`text-black font-bold p-2 mb-3 w-50 rounded-md ${(signupEmail && !signupEmailError && signupPassword && signupConfirmPassword && !signupPasswordError) ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200`}
                                        type="submit"
                                        disabled={!(signupEmail && !signupEmailError && signupPassword && signupConfirmPassword && !signupPasswordError)}
                                    >
                                        Create Account
                                    </button>
                                </div>
                                <SocialLogin />
                            </form>
                        ) : (
                            <form onSubmit={showOtpForm ? handleOtpSubmit : handleMobileSubmit}>
                                <div className="p-2">
                                    <input className="w-full p-1.5 mb-3 rounded-md bg-white border" type="text" placeholder="Full Name" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} required />
                                    <input className="w-full p-1.5 mb-3 rounded-md bg-white border" type="text" placeholder="Aadhaar Number (Optional)" value={signupAadhaar} onChange={e => setSignupAadhaar(e.target.value)} />
                                    {!showOtpForm ? (
                                        <input
                                            className="w-full p-1.5 mb-3 rounded-md bg-white border"
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={signupMobile}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setSignupMobile(val);
                                            }}
                                            maxLength={10}
                                            required
                                        />
                                    ) : (
                                        <input
                                            className="w-full p-1.5 mb-3 rounded-md bg-white border"
                                            type="text"
                                            placeholder="Enter OTP"
                                            value={signupOtp}
                                            onChange={e => setSignupOtp(e.target.value)}
                                            required
                                        />
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 pl-4 mb-2">
                                    <input type="checkbox" id="agree" className="h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-500" required />
                                    <label htmlFor="agree" className="text-black">I agree to the <span className='text-green-700'>Terms & Conditions</span></label>
                                </div>
                                <p onClick={handleSignupMethodSwitch} className="cursor-pointer hover:underline text-green-700 font-semibold mb-2 text-right mr-3">
                                    {signupMethod === 'email' ? 'Login with OTP' : 'Login with Email'}
                                </p>
                                <div className="flex items-center justify-center pt-2">
                                    <button
                                        className={`text-black font-bold p-2 mb-3 w-50 rounded-md ${!showOtpForm ? (signupMobile.length === 10 ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed') : 'bg-green-700 hover:bg-green-800'} transition duration-200`}
                                        type="submit"
                                        disabled={!showOtpForm && signupMobile.length !== 10}
                                    >
                                        {showOtpForm ? 'Verify OTP & Create Account' : 'Create Account'}
                                    </button>
                                </div>
                                <SocialLogin />
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Signup;