import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Toaster, toast } from 'react-hot-toast';

import {
    storeTokens,
    normalizeRole,
    getRedirectPathForRole
} from "../../utils/auth";

function SocialLogin() {
    const navigate = useNavigate();

    // Google login handler
    const handleGoogleLogin = async (credentialResponse) => {
        const token = credentialResponse.credential; // Google ID token

        try {
            // Send Google token to Django backend
            const res = await api.post("/auth/google/callback/", {
                token,
            });

            const { access_token, refresh_token} = res.data;
            const role = res.data.user.role;
            console.log("Login response:", res.data);

            const normalizedRole = normalizeRole(role);

            // Store tokens + role
            storeTokens({
                access_token,
                refresh_token,
                role: normalizedRole,
            });
            localStorage.setItem("isLoggedOut", "false");
            toast.success("Logged in successfully!");

            // Redirect based on role
            const redirectPath = getRedirectPathForRole(normalizedRole);
            navigate(redirectPath);

        } catch (err) {
            console.error("Google login failed:", err.response?.data || err.message);
            toast.error(err.response?.data?.error || "Google login failed");
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
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => toast.error("Google Login Failed")}
                        />
                    </GoogleOAuthProvider>
                </div>
            </div>
        </>
    );
}

export default SocialLogin;
