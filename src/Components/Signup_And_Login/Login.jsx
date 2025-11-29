import React, { useState, useEffect } from 'react';
import RoleDropdown from './RoleDropDown';
import SocialLogin from './SocialLogin';
import PasswordToggleIcon from './PasswordToggleIcon';
import api from './api';
import { Toaster, toast } from 'react-hot-toast';
import { clearAuth, normalizeRole, storeTokens, getRedirectPathForRole} from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

function Login({ onForgotPasswordClick, redirectTo }) {


    const navigate = useNavigate();

    const [loginWithOtp, setLoginWithOtp] = useState(false);
    const [showLoginOtpForm, setShowLoginOtpForm] = useState(false);
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const [otpTimer, setOtpTimer] = useState(0);

    useEffect(() => {
        // In unit tests, skip auto-login/refresh side effects to avoid hanging tests
        const isTestEnv = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test';
        if (isTestEnv) {
            return; // do nothing in tests
        }
        const access = localStorage.getItem("access");
        const role = localStorage.getItem("user_role");
        const isLoggedOut = localStorage.getItem("isLoggedOut") === "true";

        // If user just logged out → DO NOT auto-login
        if (isLoggedOut) {
            clearAuth();
            // Clear the logout flag so user can login again
            localStorage.removeItem("isLoggedOut");
            return;
        }

        // Function to redirect based on role
        const redirectUser = () => {
            const path = getRedirectPathForRole(role);
            navigate(path);
        };

        // Case 1 → Access token already exists
        if (access && role) {
            redirectUser();
            return;
        }

        // Case 2 → Try to refresh using cookies (only if user has some auth data)
        const tryCookieRefresh = async () => {
            try {
                const res = await api.post("/token/refresh/");

                // Store tokens returned only if backend includes them
                if (res.data.access) localStorage.setItem("access", res.data.access);
                if (res.data.refresh) localStorage.setItem("refresh", res.data.refresh);
                
                // Get role from response or existing storage
                const userRole = res.data.role || localStorage.getItem("user_role");
                if (userRole && res.data.access) {
                    redirectUser();
                }
            } catch (err) {
                // Refresh failed → ensure user stays logged out
                clearAuth();
            }
        };

        // Only try to refresh if we don't have access token but might have refresh token
        if (!access) {
            tryCookieRefresh();
        }
    }, [navigate]);

    // Accessibility aid: reflect selected role in an SR-only span for tests/AT

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setIsOpen(false);
    };

    const handleClick = () => setIsOpen(!isOpen);

    //Added Remember Me State
    const [remember, setRemember] = useState(false);
    const handleRememberChange = (e) => {
        setRemember(e.target.checked);
    };

    // Login with OTP handlers
    const handleLoginOtpSwitch = () => {
        setLoginWithOtp(!loginWithOtp);
        setOtpTimer(0);
        setShowLoginOtpForm(false);
        setLoginMobile('');
        setLoginOtp('');
        setLoginMobileOrEmail('');
        setLoginPassword('');
        setLoginEmailError('');
        setLoginMobileError('');
    };

    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);


    const handleLoginMobileSubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn1");
        btn.disabled = true;
        setIsLoading(true);
        if (loginMobile.length !== 10) {
            setLoginMobileError('Please enter a valid 10-digit mobile number.');
            btn.disabled = false;
            setIsLoading(false);
            return;
        }
        if (!role) {
            toast("Please select a role.");
            btn.disabled = false;
            setIsLoading(false);
            return;
        }
        setLoginMobileError('');
        try {
            const response = await api.post("/login/", {
                mobile_number: loginMobile,
                role: role,
                remember: remember,
            });
            setUserId(response.data.user_id); // save user_id for OTP step
            toast.success(response.data.message || "OTP sent to your mobile number!");
            setOtpTimer(30); 
            setShowLoginOtpForm(true);
            btn.disabled = false;
            setIsLoading(false);
        } catch (error) {
            console.error("Login failed: ", error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.error || "Failed to send OTP");
            btn.disabled = false;
            setIsLoading(false);
        }
    };

    const handleLoginOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post("/verify-otp/", {
                user_id: userId,
                otp: loginOtp,
                remember: remember,
            });
            console.log(response);
            toast.success("Logged in successfully!");
            setShowLoginOtpForm(false);
            setLoginWithOtp(false);
            setLoginMobile('');
            setLoginOtp('');
            const normalizedRole = normalizeRole(role);
            storeTokens({
                access: response.data.access,
                refresh: response.data.refresh,
                role: normalizedRole,
            });
            localStorage.setItem("isLoggedOut", "false");
            setRole('');
            setIsLoading(false);
            const redirectPath = getRedirectPathForRole(normalizedRole);
            navigate(redirectPath);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "OTP verification failed");
            setIsLoading(false);
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
        const btn = document.getElementById("btn6");
        btn.disabled = true;
        setIsLoading(true);
        
        try {
            if (!role) {
                toast("Please select a role.");
                btn.disabled = false;
                setIsLoading(false);
                return;
            }

            if (/^\d{10}$/.test(loginMobileOrEmail)) {
                // valid mobile
            } else if (validateEmail(loginMobileOrEmail)) {
                // valid email
            } else {
                btn.disabled = false;
                setIsLoading(false);
                setLoginEmailError("Enter a valid 10-digit mobile number or email.");
                return;
            }

            const response = await api.post("/token/", {
                email_address: loginMobileOrEmail,
                password: loginPassword,
                role: role,
                remember: remember,
            });

            const normalizedRole = normalizeRole(role);

            storeTokens({
                access: response.data.access,
                refresh: response.data.refresh,
                role: normalizedRole,
            });

            setLoginEmailError("");
            toast.success("Logged in successfully!");
            localStorage.setItem("isLoggedOut", "false");
            setLoginMobileOrEmail("");
            setLoginPassword("");
            setRole('');
            // If a redirect target was provided (e.g. /apply/:id), prefer it
            if (redirectTo) {
                btn.disabled = false;
                setIsLoading(false);
                navigate(redirectTo);
                return;
            }

            const redirectPath = getRedirectPathForRole(normalizedRole);
            btn.disabled = false;
            setIsLoading(false);
            navigate(redirectPath);

        } catch (error) {
            console.error("Login failed: ", error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.error || "Login failed");
            btn.disabled = false;
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div>
                <p className="text-black text-center text-xl font-bold mb-2">Welcome back!</p>
                {/* -------------------------------------------Login with Password--------------------------------*/}
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
                            <PasswordToggleIcon visible={showLoginPassword} onClick={() => setShowLoginPassword((prev) => !prev)} top="1/2" />
                        </div>
                        <RoleDropdown
                            role={role}
                            isOpen={isOpen}
                            onClick={handleClick}
                            onSelect={handleRoleSelect}
                        />
                        {role && (
                            <span data-testid="selected-role-text" className="sr-only">
                                {role.toLowerCase()}
                            </span>
                        )}
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
                        <label className="flex items-center space-x-2 text-green-700 text-semibold">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={handleRememberChange}
                                className="accent-green-700"
                            />
                            <span>Remember Me</span>
                        </label>
                        <div className="flex items-center justify-center pt-2">
                            <button
                                className={`relative text-white font-bold p-2 mb-3 w-50 rounded-md ${role ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200 min-w-[120px]`}
                                type="submit"
                                id="btn6"
                                disabled={!role || isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>In Progress...</span>
                                    </div>
                                ) : (
                                    'Log In'
                                )}
                            </button>
                        </div>
                        <SocialLogin />
                    </form>
                ) : (
                    // -------------------------------------------Login with OTP--------------------------------
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
                                <RoleDropdown
                                    role={role}
                                    isOpen={isOpen}
                                    onClick={handleClick}
                                    onSelect={handleRoleSelect}
                                />
                                {role && (
                                    <span data-testid="selected-role-text" className="sr-only">
                                        {role.toLowerCase()}
                                    </span>
                                )}
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
                        {showLoginOtpForm && (
                            otpTimer > 0 ? (
                                <p className="text-center text-gray-500 text-sm mb-2">
                                    Resend OTP in {otpTimer}s
                                </p>
                            ) : (
                                <p
                                    className="text-center text-green-700 font-semibold mb-2 cursor-pointer"
                                    onClick={handleLoginMobileSubmit}
                                >
                                    Resend OTP
                                </p>
                            )
                        )}

                        
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
                        <label className="flex items-center space-x-2 text-green-700 text-semibold">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={handleRememberChange}
                                className="accent-green-700"
                            />
                            <span>Remember Me</span>
                        </label>
                        <div className="flex items-center justify-center pt-2">
                            <button
                                className={`relative text-white font-bold p-2 mb-3 w-50 rounded-md ${role ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200 min-w-[120px]`}
                                type="submit"
                                id="btn1"
                                disabled={!role || isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>In Progress...</span>
                                    </div>
                                ) : (
                                    showLoginOtpForm ? 'Verify OTP & Login' : 'Send OTP'
                                )}
                            </button>
                        </div>
                        <SocialLogin />
                    </form>
                )}
            </div>
        </>

    );
}

export default Login;