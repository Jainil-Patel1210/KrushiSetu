import React, { useState } from "react";
import api from "./api1";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PasswordToggleIcon from "../Signup_And_Login/PasswordToggleIcon";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false); 
  const [showNewPassword, setShowNewPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const navigate = useNavigate();

  const onClose = () => {
    navigate('/sidebar');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/api/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success(res.data.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate('/sidebar');
    } catch (err) {
      console.error("Password change failed:", err);
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="fixed inset-0 flex justify-center items-center bg-gray-50 p-6 md:p-0">
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-500 hover:rounded-full hover:bg-gray-200 transition-all duration-200 text-2xl font-bold hover:shadow-md"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
            Change Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old Password */}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Old Password
              </label>
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter your old password"
                required
              />
              <PasswordToggleIcon
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                visible={showOldPassword}
                onClick={() => setShowOldPassword((prev) => !prev)}
              />
            </div>

            {/* New Password */}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                New Password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter new password"
                required
              />
              <PasswordToggleIcon
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                visible={showNewPassword}
                onClick={() => setShowNewPassword((prev) => !prev)}
              />
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Confirm New Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Confirm new password"
                required
              />
              <PasswordToggleIcon
                className="absolute right-3 top-1/2 pt-8 cursor-pointer"
                visible={showConfirmPassword}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-semibold py-3 px-4 rounded-md transition duration-200 ${
                isLoading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              }`}
            >
              {isLoading ? "Processing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ChangePassword;
