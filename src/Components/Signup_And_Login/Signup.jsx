import React, { useState } from 'react';
import './Signup.css';
import axios from "axios";
import api from './api';
import { GoogleOAuthProvider, GoogleLogin } from
    "@react-oauth/google";
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

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
    const navigate = useNavigate();

    //Google login
    const handleGoogleLogin = async (credentialResponse) => {
        const token = credentialResponse.credential; // Google ID token

        try {
            // Send Google token to Django backend
            const res = await api.post("/auth/google/callback/", {
                token,
            });

            toast.success("Logged in successfully!");


            // Save JWT tokens (for later authenticated requests)
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);

            // redirect to sidebar after successful login
            setTimeout(() => {
                navigate('/sidebar');
            }, 3000);

        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            toast.error("Login failed!");
        }
    };

    return (
        <div>
            <div className="flex items-center">
                <hr className="border-t-2 w-15 ml-4" />
                <p className="ml-4 mr-2">Or continue with</p>
                <hr className="border-t-2 w-17 ml-2" />
            </div>

            <div className="flex justify-center items-center pt-2">
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <div >
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => console.log("Google Login Failed")}
                        />
                    </div>
                </GoogleOAuthProvider>
                {/* <img className="w-9.5 h-9.5" src="/DigiLocker_Logo.png" alt="DigiLocker Logo" /> */}
            </div>
        </div>
    );
}

// Common Password Visibility Toggle Icon
function PasswordToggleIcon({ visible, onClick }) {
    return (
        <span className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer' onClick={onClick} tabIndex={0} role="button" aria-label="Toggle password visibility">
            {!visible ? (
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <path d="M177.5,67.4a9.75,9.75,0,0,0-14-1.5c-10.5,8.5-20,14.5-29.5,17.5-9.5,3.5-20.5,5-34,5s-24.5-1.5-34-5-19-9-29.5-17.5c-4.5-3.5-10.5-3-14,1.5s-3,10.5,1.5,14A132.06,132.06,0,0,0,45,95.9l-8.5,14.5c-2.5,5-1,11,3.5,13.5,5,2.5,11,1,13.5-3.5L63,103.9a112.84,112.84,0,0,0,27,4.5v18a10,10,0,0,0,20,0v-18a106.6,106.6,0,0,0,29-5.5l10,17.5a9.86,9.86,0,0,0,17-10l-9-15.5a111.22,111.22,0,0,0,19-13.5C180.5,77.9,181,71.9,177.5,67.4Z" />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 32 32">
                    <circle cx="16" cy="18" fill="none" r="3" stroke="#000" strokeWidth="2" />
                    <path d="M31,18c0,0-6-9-15-9S1,18,1,18s6,9,15,9S31,18,31,18z" fill="none" stroke="#000" strokeWidth="2" />
                    <line x1="16" x2="16" y1="6" y2="2" stroke="#000" strokeWidth="2" />
                    <line x1="7" x2="4" y1="9" y2="6" stroke="#000" strokeWidth="2" />
                    <line x1="25" x2="28" y1="9" y2="6" stroke="#000" strokeWidth="2" />
                </svg>
            )}
        </span>
    );
}

function Signup() {
    const navigate = useNavigate();
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
    const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
    const [showForgotConfirmNewPassword, setShowForgotConfirmNewPassword] = useState(false);
    // Forgot password restrictions

    const passwordRestriction = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    const handleForgotNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        if (value && !passwordRestriction.test(value)) {
            setForgotPasswordError('Password must be at least 8 characters, include 1 letter, 1 digit, and 1 special character.');
        } else if (confirmNewPassword && value !== confirmNewPassword) {
            setForgotPasswordError('Passwords do not match.');
        } else {
            setForgotPasswordError('');
        }
    };

    const handleForgotConfirmNewPasswordChange = (e) => {
        setConfirmNewPassword(e.target.value);
        if (newPassword && e.target.value !== newPassword) {
            setForgotPasswordError('Passwords do not match.');
        } else if (e.target.value && !passwordRestriction.test(newPassword)) {
            setForgotPasswordError('Password must be at least 8 characters, include 1 letter, 1 digit, and 1 special character.');
        } else {
            setForgotPasswordError('');
        }
    };
    const [page, setPage] = useState('login');
    const [role, setRole] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [signupMethod, setSignupMethod] = useState('email');

    // Signup states
    const [signupFullName, setSignupFullName] = useState('');
    const [signupFullNameError, setSignupFullNameError] = useState('');
    const [signupAadhaar, setSignupAadhaar] = useState('');
    const [signupAadhaarError, setSignupAadhaarError] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupMobile, setSignupMobile] = useState('');
    const [signupOtp, setSignupOtp] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupEmailError, setSignupEmailError] = useState('');
    const [signupPasswordError, setSignupPasswordError] = useState('');
    const [remember, setRemember] = useState(false);
    const handleRememberChange = (e) => {
        setRemember(e.target.checked);
    };

    // Login with OTP states
    const [loginWithOtp, setLoginWithOtp] = useState(false);
    const [showLoginOtpForm, setShowLoginOtpForm] = useState(false);
    const [userId, setUserId] = useState('');

    // Login form states
    const [loginMobileOrEmail, setLoginMobileOrEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginMobile, setLoginMobile] = useState('');
    const [loginMobileError, setLoginMobileError] = useState('');
    const [loginOtp, setLoginOtp] = useState('');
    const [loginEmailError, setLoginEmailError] = useState('');
    // Login input restrictions
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
    const [showOtpForm, setShowOtpForm] = useState(false);

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

    // Email validation
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        console.log("1");
        e.preventDefault();
        const btn = document.getElementById("btn1");
        btn.disabled = true;
        if (loginMobile.length !== 10) {
            toast('Please enter a valid 10-digit mobile number.');
            btn.disabled = false;
            return;
        }
        try {
            console.log(loginMobile)
            const response = await api.post("/login/", {
                mobile_number: loginMobile,
                role: role,
                remember: remember,
            });
            console.log(response.data.user_id)
            setUserId(response.data.user_id); // save user_id for OTP step
            toast("OTP sent to your mobile!");
            setShowLoginOtpForm(true);
            setLoginMobile('');
            btn.disabled = false;
        } catch (error) {
            console.error("Login failed: ", error.response ? error.response.data : error.message);
            toast.error("Login failed!");
            btn.disabled = false;
        }

    };

    const handleLoginOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/verify-otp/", {
                user_id: userId,
                otp: loginOtp,
                remember: remember,
            });
            toast.success("Logged in successfully!");
            setShowLoginOtpForm(false);
            setLoginWithOtp(false);
            setLoginMobile('');
            setLoginOtp('');
            // navigate to sidebar after successful OTP login
            setTimeout(() => {
                navigate('/sidebar');
            }, 1200);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "OTP verification failed");
        }
    };

    // Login form submit
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn6");
        btn.disabled = true;
        try {
            if (!role) {
                toast("Please select a role.");
                btn.disabled = false;
                return;
            }

            if (/^\d{10}$/.test(loginMobileOrEmail)) {
                // valid mobile
            } else if (validateEmail(loginMobileOrEmail)) {
                // valid email
            } else {
                btn.disabled = false;
                setLoginEmailError("Enter a valid 10-digit mobile number or email.");
                return;
            }
            console.log(role);

            const response = await api.post("/token/", {
                email_address: loginMobileOrEmail,
                password: loginPassword,
                role: role,
                remember: remember,
            });

            setLoginEmailError("");
            toast.success("Logged in successfully!");
            setLoginMobileOrEmail("");
            setLoginPassword("");
            // navigate to sidebar after successful login
            setTimeout(() => {
                navigate('/sidebar');
            }, 3000);
            btn.disabled = false;
        } catch (error) {
            console.error("Login failed: ", error.response ? error.response.data : error.message);
            toast.error("Login failed!");
            btn.disabled = false;
        }
    };



    // Name validation
    const nameRestriction = /^[A-Za-z\s]+$/;
    const handleSignupFullNameChange = (e) => {
        const value = e.target.value;
        if (!nameRestriction.test(value) && value !== "") {
            setSignupFullNameError("Name can only contain alphabets and spaces.");
        } else {
            setSignupFullNameError("");
        }
        setSignupFullName(value.replace(/[^A-Za-z\s]/g, ""));
    };

    // Mobile validation
    const handleSignupAadhaarChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
        setSignupAadhaar(value);
        if (value.length !== 10 && value.length > 0) {
            setSignupAadhaarError("Mobile number must be exactly 10 digits.");
        } else {
            setSignupAadhaarError("");
        }
    };

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
        const value = e.target.value;
        setSignupPassword(value);
        if (!passwordRestriction.test(value)) {
            setSignupPasswordError('Password must be at least 8 characters, include 1 letter, 1 digit, and 1 special character.');
        } else if (signupConfirmPassword && value !== signupConfirmPassword) {
            setSignupPasswordError('Passwords do not match.');
        } else {
            setSignupPasswordError('');
        }
    };

    const handleSignupConfirmPasswordChange = (e) => {
        setSignupConfirmPassword(e.target.value);
        if (signupPassword && e.target.value !== signupPassword) {
            setSignupPasswordError('Passwords do not match.');
        } else if (!passwordRestriction.test(signupPassword)) {
            setSignupPasswordError('Password must be at least 8 characters, include 1 letter, 1 digit, and 1 special character.');
        } else {
            setSignupPasswordError('');
        }
    };

    // Signup email form submit
    const handleSignupEmailSubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn5");
        btn.disabled = true;
        try {
            if (signupPassword !== signupConfirmPassword) {
                setSignupPasswordError('Passwords do not match.');
                return;
                btn.disabled = false;
            }
            const response = await api.post("/signup/", {
                full_name: signupFullName,
                email_address: signupEmail,
                mobile_number: signupAadhaar,
                password: signupPassword,
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            // Only proceed if response is successful
            if (response.status === 201 || response.status === 200) {
                setSignupPasswordError('');
                toast.success("Account created successfully!");
                setTimeout(() => {
                    handlePageSwitch('login');
                }, 1200);
                btn.disabled = false;
            } else {
                // If API returns error but no exception is thrown
                toast.error("Register failed! " + (response.data?.detail || 'Unknown error.'));
                btn.disabled = false;
            }
        } catch (error) {
            // Only show error if an actual error occurs
            console.error("Register failed: ", error.response ? error.response.data : error.message);
            toast.error("Register failed! " + (error.response?.data?.detail || error.message));
            btn.disabled = false;
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
        const btn = document.getElementById("btn3");
        btn.disabled = true;
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
            toast('OTP sent to your email!');
            btn.disabled = false;
        }
        catch (err) {
            console.error(err);
            setForgotPasswordError(
                err.response?.data?.error || 'Failed to send OTP. Please try again.'
            );
            btn.disabled = false;
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
        const btn = document.getElementById("btn2");
        btn.disabled = true;
        try {
            const response = await api.post("/forgot-password/verify-otp/", {
                email: forgotEmail,
                otp: forgotOtp,
            });
            setOtpVerified(true);
            setForgotStep(3);
            toast.success('OTP verified. You can now reset your password.');
            setTimeout('', 1200);
            btn.disabled = false;
        } catch (err) {
            console.error(err);
            setForgotPasswordError(
                err.response?.data?.error || 'Invalid OTP. Please try again.'
            );
            btn.disabled = false;
        }
    };

    // Step 3: Set new password
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn4");
        btn.disabled = true;
        if (!newPassword || !confirmNewPassword) {
            setForgotPasswordError('Please fill both fields.');
            return;
            btn.disabled = false;
        }
        if (newPassword !== confirmNewPassword) {
            setForgotPasswordError('Passwords do not match.');
            return;
            btn.disabled = false;
        }
        setForgotPasswordError('');
        try {
            const response = await api.post("/forgot-password/reset-password/", {
                email: forgotEmail,
                new_password: newPassword,
            });

            toast.success('Password reset successfully!');
            setTimeout(() => {
                handlePageSwitch('login');
            }, 1200);
            btn.disabled = false;

        } catch (err) {
            console.error(err);
            setForgotPasswordError(
                err.response?.data?.error || 'Password reset failed.'
            );
            btn.disabled = false;
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
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
                                            id="btn3"
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
                                            id="btn2"
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
                                    <div className="relative">
                                        <input
                                            className="w-full p-2 mb-3 rounded-md bg-white border"
                                            type={showForgotNewPassword ? "text" : "password"}
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={handleForgotNewPasswordChange}
                                            required
                                        />
                                        <PasswordToggleIcon visible={showForgotNewPassword} onClick={() => setShowForgotNewPassword((prev) => !prev)} />
                                    </div>
                                    <div className="relative">
                                        <input
                                            className="w-full p-2 mb-3 rounded-md bg-white border"
                                            type={showForgotConfirmNewPassword ? "text" : "password"}
                                            placeholder="Confirm New Password"
                                            value={confirmNewPassword}
                                            onChange={handleForgotConfirmNewPasswordChange}
                                            required
                                        />
                                        <PasswordToggleIcon visible={showForgotConfirmNewPassword} onClick={() => setShowForgotConfirmNewPassword((prev) => !prev)} />
                                    </div>
                                    {forgotPasswordError && <p className="text-red-600 text-xs mb-2">{forgotPasswordError}</p>}
                                    <div className="flex items-center justify-center pt-2">
                                        <button
                                            className="text-black font-bold p-2 mb-3 w-50 rounded-md bg-green-700 hover:bg-green-800 transition duration-200"
                                            type="submit"
                                            id="btn4"
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
                                        onChange={handleLoginEmailChange}
                                        required
                                    />
                                    {loginEmailError && <p className="text-red-600 text-xs mb-1">{loginEmailError}</p>}
                                    <div className="relative">
                                        <input
                                            className="w-full p-2 mb-3 rounded-md bg-white border"
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
                                            onClick={handleForgotPasswordClick}
                                        >
                                            Forgot Password?
                                        </span>
                                        <span className="cursor-pointer hover:underline" onClick={handleLoginOtpSwitch}>
                                            {loginWithOtp ? 'Login with Email' : 'Login with Mobile'}
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            checked={remember}
                                            onChange={handleRememberChange}
                                        />
                                        <label htmlFor="rememberMe">Remember Me</label>
                                    </div>

                                    <div className="flex items-center justify-center pt-2">
                                        <input
                                            className={`text-black font-bold p-2 mb-3 w-50 rounded-md ${role ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200`}
                                            type="submit"
                                            value="Log In"
                                            disabled={!role}
                                            id="btn6"
                                        />
                                    </div>
                                    <SocialLogin />
                                </form>
                            ) : (
                                <form onSubmit={showLoginOtpForm ? handleLoginOtpSubmit : handleLoginMobileSubmit}>
                                    {!showLoginOtpForm ? (
                                        <>
                                            <input
                                                className="w-full p-2 mb-3 rounded-md bg-white border"
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
                                            {loginWithOtp ? 'Login with Email' : 'Login with Mobile'}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            checked={remember}
                                            onChange={handleRememberChange}
                                        />
                                        <label htmlFor="rememberMe">Remember Me</label>
                                    </div>
                                    <div className="flex items-center justify-center pt-2">
                                        <button
                                            className={`text-black font-bold p-2 mb-3 w-50 rounded-md ${role ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200`}
                                            type="submit"
                                            disabled={!role}
                                            id="btn1"
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
                            {signupMethod === 'email' && (
                                <form onSubmit={handleSignupEmailSubmit}>
                                    <div className="p-2">
                                        <input
                                            className="w-full p-1.5 mb-3 rounded-md bg-white border"
                                            type="text"
                                            placeholder="Full Name"
                                            value={signupFullName}
                                            onChange={handleSignupFullNameChange}
                                            required
                                        />
                                        {signupFullNameError && <p className="text-red-600 text-xs mb-2">{signupFullNameError}</p>}
                                        <input
                                            className="w-full p-1.5 mb-3 rounded-md bg-white border"
                                            type="text"
                                            placeholder="Mobile Number"
                                            value={signupAadhaar}
                                            onChange={handleSignupAadhaarChange}
                                            maxLength={10}
                                            required
                                        />
                                        {signupAadhaarError && <p className="text-red-600 text-xs mb-2">{signupAadhaarError}</p>}
                                        <input
                                            className="w-full p-1.5 mb-3 rounded-md bg-white border"
                                            type="email"
                                            placeholder="Email"
                                            value={signupEmail}
                                            onChange={handleSignupEmailChange}
                                            required
                                        />
                                        {signupEmailError && <p className="text-red-600 text-xs mb-2">{signupEmailError}</p>}
                                        <div className="relative">
                                            <input
                                                className="w-full p-1.5 mb-3 rounded-md bg-white border"
                                                type={showSignupPassword ? "text" : "password"}
                                                placeholder="Password"
                                                value={signupPassword}
                                                onChange={handleSignupPasswordChange}
                                                required
                                            />
                                            <PasswordToggleIcon visible={showSignupPassword} onClick={() => setShowSignupPassword((prev) => !prev)} />
                                        </div>
                                        <div className="relative">
                                            <input
                                                className="w-full p-1.5 rounded-md bg-white border"
                                                type={showSignupConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                value={signupConfirmPassword}
                                                onChange={handleSignupConfirmPasswordChange}
                                                required
                                            />
                                            <PasswordToggleIcon visible={showSignupConfirmPassword} onClick={() => setShowSignupConfirmPassword((prev) => !prev)} />
                                        </div>
                                        {signupPasswordError && <p className="text-red-600 text-xs mb-2">{signupPasswordError}</p>}
                                    </div>
                                    {/* <p onClick={handleSignupMethodSwitch} className="cursor-pointer hover:underline text-green-700 font-semibold mb-2 text-right mr-3">
                                    {signupMethod === 'email' ? 'Login with OTP' : 'Login with Email'}
                                </p> */}
                                    <div className="flex items-center space-x-2 pl-4 mb-2">
                                        <input type="checkbox" id="agree" className="h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-500" required />
                                        <label htmlFor="agree" className="text-black">I agree to the <span className='text-green-700'>Terms & Conditions</span></label>
                                    </div>
                                    <div className="flex items-center justify-center pt-2">
                                        <button
                                            className={`text-black font-bold p-2 mb-3 w-50 rounded-md ${(signupEmail && !signupEmailError && signupPassword && signupConfirmPassword && !signupPasswordError) ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200`}
                                            type="submit"
                                            disabled={!(signupEmail && !signupEmailError && signupPassword && signupConfirmPassword && !signupPasswordError)}
                                            id="btn5"
                                        >
                                            Create Account
                                        </button>
                                    </div>
                                    <SocialLogin />
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div >
        </>
    );
}

export default Signup;
