import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api1";
import { Toaster, toast } from "react-hot-toast";

function Header() {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const res = await api.get("/profile/user/photo/");
        console.log("PHOTO RESPONSE:", res.data);   // ← CHECK THIS
        setPhotoUrl(res.data.photo_url);
      } catch (err) {
        console.error("Failed to load photo:", err);
      }
    };
    fetchPhoto();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/logout/");
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed!");
    }
  };

  const handleChangePassword = () => {
    setDropdownOpen(false);
    navigate("/change-password"); 
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="lg:block hidden">
        <div className="sticky top-0 bg-white w-full flex justify-end items-center py-4 px-4 sm:px-6 md:px-8 relative">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src="./Notification.svg"
              alt="Notifications"
              className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer"
            />

            {/* Profile image + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <img
                src={photoUrl || "./Account.svg"}
                alt="Account"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover cursor-pointer border border-gray-200 hover:ring-2 hover:ring-green-600 transition"
              />

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <ul className="py-2 text-sm text-gray-700">
                    <li>
                      <button
                        onClick={handleChangePassword}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Change Password
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-300" />
      </div>
    </>
  );
}

export default Header;
