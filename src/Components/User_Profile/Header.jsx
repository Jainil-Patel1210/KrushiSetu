import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api1";
import { Toaster, toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { clearAuth } from "../../utils/auth";

function Header() {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // ------------------ Load Profile Photo ------------------
  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await api.get("/profile/user/photo/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhotoUrl(res.data.photo_url);
      } catch (err) {
        console.error("Failed to load photo:", err);
      }
    };
    fetchPhoto();
  }, []);

  // ------------------ TYPE MAPPING ------------------
  const mapNotificationType = (backendType) => {
    switch (backendType) {
      case "application":
        return "submitted"; // blue
      case "payment":
        return "approved"; // green
      case "grievance":
      case "subsidy":
      case "system":
        return "info";
      default:
        return "info";
    }
  };

  // ------------------ FETCH NOTIFICATIONS ------------------
  const fetchNotifications = async (filter = "unread") => {
    // default changed to unread for safer UX
    if (loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("access");
      const url = filter === "unread" ? "/notify/?unread=true" : "/notify/?all=true";

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: mapNotificationType(n.notif_type),
        is_new: !n.is_read,
        created_at: n.created_at,
      }));

      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to load notifications", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ MARK ONE READ (server) ------------------
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access");
      await api.patch(
        `/notify/read/${id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (err) {
      console.error("markAsRead error:", err);
      return false;
    }
  };

  // ------------------ OPEN NOTIFICATION PANEL ------------------
  const handleNotificationClick = () => {
    setNotificationOpen(true);
    fetchNotifications("unread");
  };

  // ------------------ HANDLE WHEN USER CLICKS A NOTIFICATION ITEM ------------------
  const handleOpenNotification = async (notif) => {
    if (notif.is_new) {
      const ok = await markAsRead(notif.id);
      if (ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_new: false } : n))
        );
      }
     
      await fetchNotifications("unread");
    } else {
    }
  };

  // ------------------ CLEAR SINGLE NOTIFICATION (mark read & refresh unread) ------------------
  const handleClearNotification = async (id) => {
    try {
      const token = localStorage.getItem("access");
      await api.patch(
        `/notify/read/${id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // reload unread only to reflect change (will be empty if last unread)
      await fetchNotifications("unread");
    } catch (err) {
      console.error("Failed to clear notification", err);
      toast.error("Failed to clear notification");
    }
  };

  // ------------------ CLEAR ALL NOTIFICATIONS ------------------
  const handleClearAllNotifications = async () => {
    try {
      const token = localStorage.getItem("access");
      await api.patch(
        `/notify/read-all/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchNotifications("unread");
    } catch (err) {
      console.error("Failed to clear all notifications", err);
      toast.error("Failed to clear all notifications");
    }
  };


  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const getNotificationIcon = (type) => {
    switch (type) {
      case "approved":
      case "success":
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );

      case "submitted":
      case "info":
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );

      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  // ------------------ DATE FORMATTER ------------------
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ------------------ LOGOUT ------------------
  const handleLogout = async () => {
    try {
      localStorage.setItem("isLoggedOut", "true");
      await api.post("/api/logout/");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logged out locally");
    }

    clearAuth();
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <>
      <Toaster position="top-center" />

      {/* Header Bar */}
      <div className="lg:block hidden">
        <div className="sticky top-0 bg-white w-full flex justify-end items-center py-4 px-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src="./Notification.svg"
                alt="Notifications"
                onClick={handleNotificationClick}
                className="w-8 h-8 cursor-pointer"
              />
              {notifications.some((n) => n.is_new) && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full ring-2 ring-white"></span>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <img
                src={photoUrl || "./Account.svg"}
                alt="Account"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full cursor-pointer border hover:ring-2 hover:ring-green-600 transition"
              />

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow z-50">
                  <ul className="py-2 text-sm">
                    <li>
                      <button
                        onClick={() => navigate("/change-password")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Change Password
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
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

        <hr className="border-gray-300" />
      </div>
      
      {/* -----------------------Notification-------------------------- */}
      {notificationOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={notificationRef} className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl text-green-700 font-bold">Notifications</h2>
            </div>


            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-green-600 rounded-full"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-4 border rounded-lg group hover:shadow transition relative"
                    onClick={() => handleOpenNotification(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleOpenNotification(n);
                    }}
                  >
                    {getNotificationIcon(n.type)}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{n.title}</h3>
                        {n.is_new && (
                          <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded">New</span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(n.created_at)}</p>
                    </div>

                    {n.is_new && (
                      <button
                        onClick={(e) => {
                          // stop click bubbling to parent (which also marks as read)
                          e.stopPropagation();
                          handleClearNotification(n.id);
                        }}
                        className="absolute top-3 right-3 text-xs text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition "
                        title="Mark as read"
                      >
                        &times
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 flex gap-3">
              {notifications.length > 0 && (
                <button onClick={handleClearAllNotifications} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
                  Clear All
                </button>
              )}
              <button onClick={() => setNotificationOpen(false)} className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
