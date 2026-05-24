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

    const [isLoading, setIsLoading] = useState(false);

    // Login form states (Now strictly Email & Password)
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginEmailError, setLoginEmailError] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Role selection states
    const [role, setRole] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Remember Me State
    const [remember, setRemember] = useState(false);

    useEffect(() => {
        const run = async () => {
            await new Promise(res => setTimeout(res, 5000));

            const access = localStorage.getItem("access");
            const role = localStorage.getItem("user_role");
            const isLoggedOut = localStorage.getItem("isLoggedOut") === "true";

            if (isLoggedOut) {
                clearAuth();
                localStorage.removeItem("isLoggedOut");
                return;
            }

            const redirectUser = () => {
                const path = getRedirectPathForRole(role);
                navigate(path);
            };

            if (access && role) {
                redirectUser();
                return;
            }
            
            const tryCookieRefresh = async () => {
                try {
                    const res = await api.post("/token/refresh/");

                    if (res.data.access) localStorage.setItem("access", res.data.access);
                    if (res.data.refresh) localStorage.setItem("refresh", res.data.refresh);

                    const userRole = res.data.role || localStorage.getItem("user_role");
                    if (userRole && res.data.access) {
                        redirectUser();
                    }
                } catch (err) {
                    clearAuth();
                }
            };

            if (!access) {
                tryCookieRefresh();
            }
        };

        run();
    }, [navigate]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setIsOpen(false);
    };

    const handleClick = () => setIsOpen(!isOpen);

    const handleRememberChange = (e) => {
        setRemember(e.target.checked);
    };

    const handleLoginEmailChange = (e) => {
        const value = e.target.value;
        setLoginEmail(value);
        if (value && !validateEmail(value)) {
            setLoginEmailError('Enter a valid email address.');
        } else {
            setLoginEmailError('');
        }
    };

    const handleLoginPasswordChange = (e) => {
        setLoginPassword(e.target.value);
    };

    // Login form submit (Email/Password)
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            if (!role) {
                toast("Please select a role.");
                setIsLoading(false);
                return;
            }

            if (!validateEmail(loginEmail)) {
                setLoginEmailError("Enter a valid email address.");
                setIsLoading(false);
                return;
            }

            const response = await api.post("/token/", {
                email_address: loginEmail,
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
            setLoginEmail("");
            setLoginPassword("");
            setRole('');
            
            // If a redirect target was provided (e.g. /apply/:id), prefer it
            if (redirectTo) {
                setIsLoading(false);
                navigate(redirectTo);
                return;
            }

            const redirectPath = getRedirectPathForRole(normalizedRole);
            setIsLoading(false);
            navigate(redirectPath);

        } catch (error) {
            console.error("Login failed: ", error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.error || "Login failed");
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div>
                <p className="text-black text-center text-xl font-bold mb-2">Welcome back!</p>
                
                <form onSubmit={handleLoginSubmit}>
                    <input
                        className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                        type="email"
                        placeholder="Email"
                        value={loginEmail}
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
                    
                    <div className='flex justify-start text-green-700 font-semibold mb-2'>
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={onForgotPasswordClick}
                        >
                            Forgot Password?
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
            </div>
        </>
    );
}

export default Login;