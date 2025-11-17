import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SocialLogin from "./SocialLogin";
import PasswordToggleIcon from "./PasswordToggleIcon";
import api from "./api";
import { Toaster, toast } from "react-hot-toast";

function Signup({ onSignupSuccess = null }) {
    const navigate = useNavigate();

    // UI States
    const [step, setStep] = useState(1); // 1=Register, 2=Email OTP, 3=Mobile OTP
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [fullName, setFullName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Error states
    const [fullNameError, setFullNameError] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Password toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP States
    const [emailOtp, setEmailOtp] = useState("");
    const [mobileOtp, setMobileOtp] = useState("");
    const [otpTimer, setOtpTimer] = useState(0);
    const [userId, setUserId] = useState("");

    // ----------------------------
    // VALIDATIONS
    // ----------------------------

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const passwordRestriction =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const nameRestriction = /^[A-Za-z\s]+$/;

    // ----------------------------
    // REGISTER SUBMIT
    // ----------------------------

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
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

            toast.success("Account created! Verify your email.");
            setUserId(res.data.user_id || null);
            setStep(2); // go to email OTP step
        } catch (err) {
            toast.error(err.response?.data?.error || "Signup failed");
        }

        setIsLoading(false);
    };

    // ----------------------------
    // VERIFY EMAIL OTP
    // ----------------------------

    const handleVerifyEmailOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await api.post("/verify-email/", {
                email_address: email,
                otp: emailOtp,
            });

            toast.success("Email verified! OTP sent to mobile.");
            setUserId(res.data.user_id);
            setOtpTimer(30);
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid OTP");
        }

        setIsLoading(false);
    };

    // ----------------------------
    // VERIFY MOBILE OTP
    // ----------------------------

    const handleVerifyMobileOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await api.post("/verify-mobile-otp/", {
                user_id: userId,
                otp: mobileOtp,
            });

            toast.success("Signup completed! You can now login.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid OTP");
        }

        setIsLoading(false);
    };


    const resendEmailOtp = async () => {
        try {
            const res = await api.post("/resend-email-otp/", {
                email_address: email,
            });

            toast.success("Email OTP resent!");
            setOtpTimer(30);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to resend OTP");
        }
    };

    const resendMobileOtp = async () => {
        try {
            const res = await api.post("/resend-mobile-otp/", {
                user_id: userId,
            });

            toast.success("Mobile OTP resent!");
            setOtpTimer(30);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to resend OTP");
        }
    };



    // ----------------------------
    // OTP Timer
    // ----------------------------

    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    // ------------------------------------------------------------
    // STEP UI
    // ------------------------------------------------------------

    return (
        <>
            <Toaster position="top-center" />

            <div>
                <p className="text-black text-center text-xl font-bold mb-0.5">
                    Create Your Account
                </p>

                {/* ---------------------------------------------------------
                    STEP 1: SIGNUP FORM
                --------------------------------------------------------- */}
                {step === 1 && (
                    <form onSubmit={handleSignupSubmit}>
                        <div className="p-2">
                            {/* Full Name */}
                            <input
                                className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => {
                                    setFullName(e.target.value);
                                    setFullNameError(
                                        nameRestriction.test(e.target.value) ? "" : "Invalid name"
                                    );
                                }}
                                required
                            />
                            {fullNameError && (
                                <p className="text-red-600">{fullNameError}</p>
                            )}

                            {/* Email */}
                            <input
                                className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError(
                                        validateEmail(e.target.value)
                                            ? ""
                                            : "Invalid email"
                                    );
                                }}
                                required
                            />
                            {emailError && (
                                <p className="text-red-600 text-xs mb-1">{emailError}</p>
                            )}

                            {/* Mobile */}
                            <input
                                className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                                type="text"
                                placeholder="Mobile Number"
                                value={mobile}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    setMobile(val);
                                    setMobileError(
                                        val.length === 10 ? "" : "Must be 10 digits"
                                    );
                                }}
                                required
                            />
                            {mobileError && (
                                <p className="text-red-600 text-xs mb-1">{mobileError}</p>
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
                                            passwordRestriction.test(e.target.value)
                                                ? ""
                                                : "Weak password"
                                        );
                                    }}
                                    required
                                />
                                <PasswordToggleIcon
                                    visible={showPassword}
                                    onClick={() => setShowPassword(!showPassword)}
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
                                <p className="text-red-600 text-xs mb-1">{passwordError}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 pl-4 mb-2">
                            <input type="checkbox" id="agree" className="h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-500" required />
                            <label htmlFor="agree" className="text-black">I agree to the <span className='text-green-700'>Terms & Conditions</span></label>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-center pb-3">
                            <button
                                className="bg-green-700 text-white p-2 rounded w-40"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "Create Account"}
                            </button>
                        </div>
                    </form>
                )}

                {/* ---------------------------------------------------------
                    STEP 2: EMAIL OTP
                --------------------------------------------------------- */}
                {step === 2 && (
                    <form onSubmit={handleVerifyEmailOtp}>
                        <p className="text-center mb-2">Enter Email OTP</p>

                        <input
                            className="w-full p-2 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                            type="text"
                            placeholder="Enter OTP"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            required
                        />

                        {otpTimer > 0 ? (
                            <p className="text-center text-gray-500">
                                Resend OTP in {otpTimer}s
                            </p>
                        ) : (
                            <p
                                className="text-center text-green-700 cursor-pointer"
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


                {/* ---------------------------------------------------------
                    STEP 3: MOBILE OTP
                    (Uses same login-with-OTP UI style)
                --------------------------------------------------------- */}
                {step === 3 && (
                    <form onSubmit={handleVerifyMobileOtp}>
                        <p className="text-center mb-2">Enter Mobile OTP</p>

                        <input
                            className="w-full p-2 mb-3 border rounded"
                            type="text"
                            placeholder="Enter OTP"
                            value={mobileOtp}
                            onChange={(e) => setMobileOtp(e.target.value)}
                            required
                        />

                        {otpTimer > 0 ? (
                            <p className="text-center text-gray-500">
                                Resend OTP in {otpTimer}s
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
