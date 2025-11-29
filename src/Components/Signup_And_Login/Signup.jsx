import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SocialLogin from "./SocialLogin";
import PasswordToggleIcon from "./PasswordToggleIcon";
import api from "./api";
import { Toaster, toast } from "react-hot-toast";

function Signup({ onSignupSuccess = null }) {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [fullNameError, setFullNameError] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const nameRestriction = /^[A-Za-z\s]+$/;
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordRestriction = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const [emailOtp, setEmailOtp] = useState("");
    // Only enable button if all fields are filled and no errors
    const isFormValid =
        fullName &&
        email &&
        mobile &&
        password &&
        confirmPassword &&
        !fullNameError &&
        !emailError &&
        !mobileError &&
        !passwordError;
    const [mobileOtp, setMobileOtp] = useState("");
    const [otpTimer, setOtpTimer] = useState(0);
    const [userId, setUserId] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!nameRestriction.test(fullName)) {
            toast.error("Enter a valid name containing only letters.");
            setIsLoading(false);
            return;
        }
        if (!validateEmail(email)) {
            toast.error("Enter a valid email address.");
            setIsLoading(false);
            return;
        }
        if (mobile.length !== 10) {
            toast.error("Mobile number must be exactly 10 digits.");
            setIsLoading(false);
            return;
        }
        if (!passwordRestriction.test(password)) {
            toast.error("Password must have 8 chars, 1 letter, 1 digit, 1 special char.");
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await api.post("/signup/", {
                full_name: fullName,
                email_address: email,
                mobile_number: mobile,
                password: password,
                confirm_password: confirmPassword,
            });

            toast.success("Account created. Verify email OTP.");
            setUserId(res.data.user_id);
            setOtpTimer(30);
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.error || "Signup failed");
        }

        setIsLoading(false);
    };

    const handleVerifyEmailOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await api.post("/verify-email/", {
                email_address: email,
                otp: emailOtp,
            });

            toast.success("Email verified. Mobile OTP sent.");
            setUserId(res.data.user_id);
            setOtpTimer(30);
            setStep(3);
        } catch (err) {
            setMobile("");
            setStep(1);
            toast.error(err.response?.data?.error || "Invalid OTP");
        }

        setIsLoading(false);
    };

    const handleVerifyMobileOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post("/verify-mobile-otp/", {
                user_id: userId,
                otp: mobileOtp,
            });

            toast.success("Signup complete! You can now login.");
            if (onSignupSuccess) onSignupSuccess();
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid OTP");
        }

        setIsLoading(false);
    };

    const resendEmailOtp = async () => {
        try {
            await api.post("/resend-email-otp/", { email_address: email });
            toast.success("Email OTP resent.");
            setOtpTimer(30);
        } catch (err) {
            toast.error("Failed to resend OTP.");
        }
    };

    const resendMobileOtp = async () => {
        try {
            await api.post("/resend-mobile-otp/", { user_id: userId });
            toast.success("Mobile OTP resent.");
            setOtpTimer(30);
        } catch (err) {
            toast.error("Failed to resend OTP.");
        }
    };

    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((t) => t - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);


    return (
        <>
            <Toaster position="top-center" />

            <div>
                <p className="text-black text-center text-xl font-bold mb-1">
                    Create Your Account
                </p>

                {/* STEP 1 — SIGNUP FORM */}
                {step === 1 && (
                    <form onSubmit={handleSignupSubmit}>
                        <div className="p-2">

                            {/* Full Name */}
                            <input
                                className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => {
                                    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "")
                                    setFullName(e.target.value);
                                    setFullNameError(
                                        nameRestriction.test(e.target.value)
                                            ? ""
                                            : "Only letters and spaces allowed"
                                    );
                                }}
                                required
                            />
                            {fullNameError && (
                                <p className="text-red-600 text-xs mb-1">
                                    {fullNameError}
                                </p>
                            )}

                            {/* Email */}
                            <input
                                className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError(
                                        validateEmail(e.target.value)
                                            ? ""
                                            : "Enter a valid email address."
                                    );
                                }}
                                required
                            />
                            {emailError && (
                                <p className="text-red-600 text-xs mb-1">
                                    {emailError}
                                </p>
                            )}

                            {/* Mobile */}
                            <input
                                className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                                type="text"
                                placeholder="Mobile Number"
                                value={mobile}
                                onChange={(e) => {
                                    const v = e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 10);
                                    setMobile(v);
                                    setMobileError(
                                        v.length === 10
                                            ? ""
                                            : "Must be exactly 10 digits"
                                    );
                                }}
                                required
                            />
                            {mobileError && (
                                <p className="text-red-600 text-xs mb-1">
                                    {mobileError}
                                </p>
                            )}

                            {/* Password */}
                            <div className="relative">
                                <input
                                    className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError(
                                            passwordRestriction.test(
                                                e.target.value
                                            )
                                                ? ""
                                                : 'Password must be at least 8 characters, include 1 letter, 1 digit, and 1 special character.'
                                        );
                                    }}
                                    required
                                />
                                <PasswordToggleIcon
                                    visible={showPassword}
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <input
                                    className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setPasswordError(
                                            e.target.value === password
                                                ? ""
                                                : "Passwords do not match"
                                        );
                                    }}
                                    required
                                />
                                <PasswordToggleIcon
                                    visible={showConfirmPassword}
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                />
                            </div>

                            {passwordError && (
                                <p className="text-red-600 text-xs mb-1">
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-center pt-2">
                            <button
                                className={`relative text-white font-bold p-2 mb-3 w-50 rounded-md ${isFormValid ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'} transition duration-200 min-w-[120px]`}
                                type="submit"
                                id="btn6"
                                disabled={!isFormValid || isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>In Progress...</span>
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 2 — EMAIL OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyEmailOtp}>
                        <p className="text-center mb-2">Enter Email OTP</p>
                        <input
                            className="w-full p-2 mb-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                            placeholder="Enter OTP"
                            value={emailOtp}
                            onChange={(e) =>
                                setEmailOtp(
                                    e.target.value.replace(/\D/g, "").slice(0, 6)
                                )
                            }
                            required
                        />

                        {otpTimer > 0 ? (
                            <p className="text-center text-gray-600 ">
                                Resend in {otpTimer}s
                            </p>
                        ) : (
                            <p
                                className="text-center text-green-700 cursor-pointer mt-2 mb-2"
                                onClick={resendEmailOtp}
                            >
                                Resend OTP
                            </p>
                        )}

                        <div className="flex justify-center pb-3">
                            <button
                                className="bg-green-700 text-white p-2 rounded w-40"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Verifying..." : "Verify Email"}
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3 — MOBILE OTP */}
                {step === 3 && (
                    <form onSubmit={handleVerifyMobileOtp}>
                        <p className="text-center mb-2">Enter Mobile OTP</p>
                        <input
                            className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                            placeholder="Enter OTP"
                            value={mobileOtp}
                            onChange={(e) =>
                                setMobileOtp(
                                    e.target.value.replace(/\D/g, "").slice(0, 6)
                                )
                            }
                            required
                        />

                        {otpTimer > 0 ? (
                            <p className="text-center text-gray-600">
                                Resend in {otpTimer}s
                            </p>
                        ) : (
                            <p
                                className="text-center text-green-700 cursor-pointer"
                                onClick={resendMobileOtp}
                            >
                                Resend OTP
                            </p>
                        )}

                        <div className="flex justify-center pb-3">
                            <button
                                className="bg-green-700 text-white p-2 rounded w-40"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Verifying..." : "Verify Mobile"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

export default Signup;
