import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordToggleIcon from './PasswordToggleIcon';
import api from './api';
import { Toaster, toast } from 'react-hot-toast';

function ForgotPassword({ onBackToLogin }) {
    const navigate = useNavigate();
    const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: new password
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
    const [showForgotConfirmNewPassword, setShowForgotConfirmNewPassword] = useState(false);

    const passwordRestriction = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Step 1: Send OTP to email
    const handleForgotSendOtp = async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn3");
        btn.disabled = true;
        if (!forgotEmail || !validateEmail(forgotEmail)) {
            setForgotPasswordError('Enter a valid email address.');
            btn.disabled = false;
            return;
        }
        setForgotPasswordError('');
        try {
            const response = await api.post("/forgot-password/", {
                email: forgotEmail,
            });
            // otpSent is not used for UI, but was in original logic
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
            // otpVerified is not used for UI, but was in original logic
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
        const value = e.target.value;
        setConfirmNewPassword(value);
        if (newPassword && value !== newPassword) {
            setForgotPasswordError('Passwords do not match.');
        } else if (value && !passwordRestriction.test(newPassword)) { // Check newPassword if confirmNewPassword is valid
            setForgotPasswordError('Password must be at least 8 characters, include 1 letter, 1 digit, and 1 special character.');
        } else {
            setForgotPasswordError('');
        }
    };

    // Step 3: Set new password
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn4");
        btn.disabled = true;
        if (!newPassword || !confirmNewPassword) {
            setForgotPasswordError('Please fill both fields.');
            btn.disabled = false;
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setForgotPasswordError('Passwords do not match.');
            btn.disabled = false;
            return;
        }
        setForgotPasswordError('');
        try {
            const response = await api.post("/forgot-password/reset-password/", {
                email: forgotEmail,
                new_password: newPassword,
            });
            toast.success('Password reset successfully!');
            setTimeout(() => {
                onBackToLogin();
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
            <div>
                <p className="text-black text-center text-xl font-bold mb-4">Forgot Password</p>
                {forgotStep === 1 && (
                    <form onSubmit={handleForgotSendOtp}>
                        <input
                            className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 "
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
                                type="submit" id="btn3"
                            >
                                Send OTP
                            </button>
                        </div>
                        <div className="text-center">
                            <span
                                className="text-green-700 cursor-pointer hover:underline"
                                onClick={onBackToLogin}
                            >
                                Back to Login
                            </span>
                        </div>
                    </form>
                )}
                {forgotStep === 2 && (
                    <form onSubmit={handleForgotVerifyOtp}>
                        <input
                            className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 "
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
                                type="submit" id="btn2"
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
                                className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 "
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
                                type="submit" id="btn4"
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
        </>

    );
}

export default ForgotPassword;