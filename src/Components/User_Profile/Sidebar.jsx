import React,{useState, useEffect, useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import Personal_info from './personal_info.jsx'
import Subsidy_List from './Subsidy_List.jsx';
import Documents from './Documents.jsx';
import Support from './Support.jsx';
import RecommendSubsidy from './SubsidyRecommandation.jsx'; 
import api from './api1';
import { Toaster, toast } from 'react-hot-toast';
import Cookies from "js-cookie";
import { clearAuth } from '../../utils/auth.js';


function Sidebar() {
    const [page,setPage]=useState('Dashboard');
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    function handlePageChange(newPage){
        setPage(newPage);
        setIsOpen(false); // Close mobile menu when page changes
    }

    function sidebarToggle() {
        setIsOpen(!isOpen);
    }

    // Fetch user photo
    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const res = await api.get("/profile/user/photo/");
                setPhotoUrl(res.data.photo_url);
            } catch (err) {
                console.error("Failed to load photo:", err);
            }
        };
        fetchPhoto();
    }, []);

    // Close dropdown when clicking outside
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

    // Sidebar options array
    const sidebar_options = [
        {id : 'Dashboard', label: 'Dashboard', icon: './Home.svg'},
        {id : 'Profile', label: 'Profile & Personal Details', icon: './Profile.svg'},
        {id : 'Documents', label: 'Documents', icon: './Document.svg'},
        {id : 'Subsidies', label: 'Subsidies', icon: './Note.svg'},
        {id : 'RecommendSubsidy', label: 'Recommend Subsidy', icon: './Subsidy_Recommendation.svg'},
        {id : 'Support', label: 'Support', icon: './Support.svg'}
    ]

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            {/* ----------------------------Mobile Header---------------------------- */}
            <div className="lg:hidden sticky top-0 z-50 bg-white shadow-md">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2 ">
                        <img src="./Krushisetu_banner-removebg-preview.png" className='h-10 w-30' />
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <img src="./Notification.svg" alt="Notifications" className="h-8 w-8 cursor-pointer" />
                        
                        {/* Profile image with dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <img
                                src={photoUrl || "./Account.svg"}
                                alt="Account"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="h-8 w-8 cursor-pointer rounded-full object-cover border border-gray-200 hover:ring-2 hover:ring-green-600 transition"
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

                        <button type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                                aria-label="Toggle menu"
                                onClick={() => setIsOpen(!isOpen)}>
                            <div className="relative h-5 w-6">
                                <span className={`absolute left-0 block h-0.5 w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'top-2.5 rotate-45' : 'top-0 rotate-0'}`}/>
                                <span className={`absolute left-0 block h-0.5 w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'top-2.5 opacity-100'}`}/>
                                <span className={`absolute left-0 block h-0.5 w-6 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'top-2.5 -rotate-45' : 'top-5 rotate-0'}`}/>
                            </div>
                        </button>
                    </div>
                </div>

                {/* ----------------------------Mobile Sidebar---------------------------- */}
                {isOpen && (
                    <div className="absolute top-full w-60 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
                        <div className='flex flex-col'>
                            {sidebar_options.map((item) => (
                                <button key={item.id}
                                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition ${page === item.id ? "bg-green-100 border-l-4 border-green-600" : ""}`}
                                        onClick={() => handlePageChange(item.id)}>
                                    <img src={item.icon} className='h-5 w-5' alt={item.label} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ----------------------------Desktop Sidebar---------------------------- */}
            <div className='flex min-h-screen'>
                <div className='max-w-90 w-73 rounded-2xl sticky top-0 self-start hidden lg:flex flex-col'>
                    <img src="./Krushisetu_banner-removebg-preview.png" className='lg:h-20 lg:w-50 md:h-15 md:w-45 h-10 w-30 pt-3 ml-2' />
                    <hr role="separator" className="my-2 border-t border-gray-300" />
                    <div className='flex flex-col gap-6 mt-5'>
                        {sidebar_options.map((option) => (
                            <button
                                key={option.id}
                                className={`flex flex-wrap gap-2 pl-4 ${page === option.id ? "bg-green-600 p-3 rounded-md" : ""}`}
                                onClick={() => handlePageChange(option.id)}
                            >
                                <img src={option.icon} className='h-5 w-5' alt={option.label} />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-px bg-gray-300 hidden lg:block" />
                <div className='flex-1'>
                    {page==='Dashboard' && <Dashboard/>}
                    {page==='Profile' && <Personal_info/>}
                    {page==='Documents' && <Documents/>}
                    {page==='Subsidies' && <Subsidy_List/>}
                    {page==='Support' && <Support/>}
                    {page==='RecommendSubsidy' && <RecommendSubsidy/>}
                </div>
            </div>
        </>
    )
}

export default Sidebar