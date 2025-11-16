import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api1";
import { Toaster, toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { clearAuth, normalizeRole, getRedirectPathForRole } from "../../utils/auth";

function Header() {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const token = localStorage.getItem("access"); 
        const res = await api.get("/profile/user/photo/", {
                headers: { Authorization: `Bearer ${token}`},
        });
        setPhotoUrl(res.data.photo_url);
      } catch (err) {
        console.error("Failed to load photo:", err);
      }
    };
    fetchPhoto();
  }, []);

  // TODO: Remove hardcoded notifications after backend integration
  const hardcodedNotifications = [
    {
      id: 1,
      title: "Application Approved",
      message: "Your PM-KISAN Scheme application has been approved. Amount will be credited within 7 working day....",
      type: "approved",
      is_new: true,
      created_at: "2025-11-12T10:30:00Z"
    },
    {
      id: 2,
      title: "Application Submitted",
      message: "Your applied for Drip Irrigation Subsidy on October 28, 2025. Application ID: DB2025001234",
      type: "submitted",
      is_new: false,
      created_at: "2025-10-28T14:20:00Z"
    }
  ];

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Uncomment this when backend is ready
     
      // TODO: Remove this setTimeout - using hardcoded data for now
      setTimeout(() => {
        setNotifications(hardcodedNotifications);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications");
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setNotificationOpen(true);
    if (notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleClearNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    // TODO: Add API call to delete notification when backend is ready
   
    // });
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    // TODO: Add API call to delete all notifications when backend is ready
   
    // });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approved':
      case 'success':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'info':
      case 'submitted':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleLogout = async () => {
      try {
          localStorage.setItem("isLoggedOut", "true");
          await api.post("/api/logout/");
          setTimeout(()=>{
              toast.success("Logged out successfully");
          }, 5000);
          
      } 
      catch (error) {
          if (!error.response) {
              console.warn("Server unreachable — local logout only.");
              toast.error("⚠️ Server offline. Logged out locally.");
          } else {
              toast.error("Logout failed on server. Logged out locally.");
          }
      }

      
      // Clear local auth (tokens + role)
      clearAuth();

      // Remove cookies (if backend set them)
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("refresh_token", { path: "/" });

      // Redirect to login
      setTimeout(() => {
          window.location.href = "/login";
      }, 2000);
  };


  const handleChangePassword = () => {
    setDropdownOpen(false);
    navigate("/change-password"); 
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="lg:block hidden">
        <div className="sticky top-0 bg-white w-full flex justify-end items-center py-4 px-4 sm:px-6 md:px-8 ">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src="./Notification.svg"
              alt="Notifications"
              onClick={handleNotificationClick}
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

      {/* Notification Modal */}
      {notificationOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={notificationRef} className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl text-[#006400] font-bold">Notifications</h2>
              <button onClick={() => setNotificationOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Notifications List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition relative group">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {notification.is_new && (
                          <span className="px-2 py-0.5 text-xs font-medium text-white bg-green-600 rounded">New</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{formatDate(notification.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClearNotification(notification.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Clear notification"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 ">
              <div className="flex gap-3">
                {notifications.length > 0 && (
                  <button 
                    onClick={handleClearAllNotifications}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={() => setNotificationOpen(false)}
                  className="flex-1 bg-[#009500] text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;