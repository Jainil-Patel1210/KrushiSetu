import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SocialLogin from './SocialLogin';
import PasswordToggleIcon from './PasswordToggleIcon';
import axios from 'axios'; // For the signup API call

function Signup({ onSignupSuccess }) {
    const navigate = useNavigate(); 
    const [signupMethod, setSignupMethod] = useState('email');
    const [signupFullName, setSignupFullName] = useState('');
    const [signupFullNameError, setSignupFullNameError] = useState('');
    const [signupAadhaar, setSignupAadhaar] = useState(''); 
    const [signupAadhaarError, setSignupAadhaarError] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupEmailError, setSignupEmailError] = useState('');
    const [signupPasswordError, setSignupPasswordError] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

    const passwordRestriction = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    const nameRestriction = /^[A-Za-z\s]+$/;
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Name validation
    const handleSignupFullNameChange = (e) => {
        const value = e.target.value;
        if (!nameRestriction.test(value) && value !== "") {
            setSignupFullNameError("Name can only contain alphabets and spaces.");
        } else {
            setSignupFullNameError("");
        }
        setSignupFullName(value.replace(/[^A-Za-z\s]/g, ""));
    };

    // Mobile validation (Aadhaar was used as a placeholder name in original, but it's mobile number)
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
        const value = e.target.value;
        setSignupConfirmPassword(value);
        if (signupPassword && value !== signupPassword) {
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
        try {
            if (signupPassword !== signupConfirmPassword) {
                setSignupPasswordError('Passwords do not match.');
                return;
            }
            if (signupFullNameError || signupAadhaarError || signupEmailError || signupPasswordError) {
                alert("Please correct the errors in the form.");
                return;
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
                alert("Account created successfully!");
                // Clear form after successful signup
                setSignupFullName('');
                setSignupAadhaar('');
                setSignupEmail('');
                setSignupPassword('');
                setSignupConfirmPassword('');
                onSignupSuccess(); // Notify parent to switch to login page
            } else {
                // If API returns error but no exception is thrown
                alert("Register failed! " + (response.data?.detail || 'Unknown error.'));
            }
        } catch (error) {
            // Only show error if an actual error occurs
            console.error("Register failed: ", error.response ? error.response.data : error.message);
            alert("Register failed! " + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div>
            <p className="text-black text-center text-xl font-bold mb-0.5">Create Your Account</p>
            {signupMethod === 'email' && (
                <form onSubmit={handleSignupEmailSubmit}>
                    <div className="p-2">
                        <input
                            className="w-full p-1.5 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                            type="text"
                            placeholder="Full Name"
                            value={signupFullName}
                            onChange={handleSignupFullNameChange}
                            required
                        />
                        {signupFullNameError && <p className="text-red-600 text-xs mb-2">{signupFullNameError}</p>}
                        <input
                            className="w-full p-1.5 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                            type="text"
                            placeholder="Mobile Number"
                            value={signupAadhaar}
                            onChange={handleSignupAadhaarChange}
                            maxLength={10}
                            required
                        />
                        {signupAadhaarError && <p className="text-red-600 text-xs mb-2">{signupAadhaarError}</p>}
                        <input
                            className="w-full p-1.5 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 "
                            type="email"
                            placeholder="Email"
                            value={signupEmail}
                            onChange={handleSignupEmailChange}
                            required
                        />
                        {signupEmailError && <p className="text-red-600 text-xs mb-2">{signupEmailError}</p>}
                        <div className="relative">
                            <input
                                className="w-full p-1.5 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 "
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
                                className="w-full p-1.5 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 "
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
            )}
        </div>
    );
}

export default Signup;
