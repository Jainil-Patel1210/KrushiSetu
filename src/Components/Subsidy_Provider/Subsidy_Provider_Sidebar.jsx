import React,{useState} from 'react'
import Dashboard from './Dashboard';
import News from './News';
import Report from './Report';

const Subsidy_Provider_Sidebar = () => {
   const [page,setPage]=useState('Dashboard');
    const [isOpen, setIsOpen] = useState(false);

    function handlePageChange(newPage){
        setPage(newPage);
    }

    function sidebarToggle() {
        setIsOpen(!isOpen);
    }

    // Sidebar options array
    const sidebar_options = [
        {id : 'Dashboard', label: 'Dashboard', icon: './Home.svg'},
        {id : 'News', label: 'Post News', icon: './Note.svg'},
        {id : 'Report', label: 'Report', icon: './Support.svg'}
    ]

    return (
        <>
            {/* ----------------------------Mobile Header---------------------------- */}
            <div className="lg:hidden sticky top-0 z-50 bg-white shadow-md">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2 ">
                        <img src="./Krushisetu_banner-removebg-preview.png" className='h-10 w-30' />
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <img src="./Notification.svg" alt="Notifications" className="h-8 w-8 cursor-pointer" />
                        <img
                            src="./Account.svg"
                            alt="Account"
                            className="h-8 w-8 cursor-pointer rounded-full"
                        />
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
                    {page==='News' && <News/>}
                    {page==='Report' && <Report/>}
                </div>
            </div>
        </>
    )
}

export default Subsidy_Provider_Sidebar