import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Toaster, toast } from 'react-hot-toast';

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
        <>
            <Toaster position="top-center" reverseOrder={false} />
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
        </>
    );
}

export default SocialLogin;