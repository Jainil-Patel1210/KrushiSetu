import React,{useState} from 'react'
import Dashboard from './Dashboard.jsx';
import Personal_info from './personal_info.jsx'
import Subsidy_List from './Subsidy_List.jsx';
import Documents from './Documents.jsx';
function Sidebar() {
    const [page,setPage]=useState('Dashboard');

    function handlePageChange(newPage){
        setPage(newPage);
    }

    return (
        <>
            <div className='flex min-h-screen'>
                <div className='max-w-90 w-73 rounded-2xl sticky top-0 self-start'>
                    <img src="./Krushisetu_banner-removebg-preview.png" className='lg:h-20 lg:w-50 md:h-15 md:w-45 h-10 w-30 pt-3 ml-2' />
                    <hr role="separator" className="my-2 border-t border-gray-300" />
                    <div className='flex flex-col gap-6 mt-5'>
                        <button className={`flex flex-wrap gap-2 pl-4 ${page==="Dashboard" ? "bg-green-600 p-3 rounded-md" :""}`} onClick={(e)=>handlePageChange('Dashboard')}><img src="./Home.svg" className='h-5 w-5' />Dashboard</button>
                        <button className={`flex flex-wrap gap-2 pl-4 ${page==="Profile" ? "bg-green-600 p-3 rounded-md" :""}`} onClick={(e)=>handlePageChange('Profile')}><img src="./Profile.svg" className='h-5 w-5' />Profile & Personal Details</button>
                        <button className={`flex flex-wrap gap-2 pl-4 ${page==="Documents" ? "bg-green-600 p-3 rounded-md" :""}`} onClick={(e)=>handlePageChange('Documents')}><img src="./Document.svg" className='h-5 w-5' />Documents</button>
                        <button className={`flex flex-wrap gap-2 pl-4 ${page==="Subsidies" ? "bg-green-600 p-3 rounded-md" :""}`} onClick={(e)=>handlePageChange('Subsidies')}><img src="./Note.svg" className='h-5 w-5' />Subsidies</button>
                        <button className={`flex flex-wrap gap-2 pl-4 ${page==="Support" ? "bg-green-600 p-3 rounded-md" :""}`} onClick={(e)=>handlePageChange('Support')}><img src="./Support.svg" className='h-5 w-5' />Support</button>
                        <button className={`flex flex-wrap gap-2 pl-4 ${page==="Settings" ? "bg-green-600 p-3 rounded-md" :""}`} onClick={(e)=>handlePageChange('Settings')}><img src="./Setting.svg" className='h-5 w-5' />Settings</button>
                    </div>
                </div>
                <div className="w-px bg-gray-300" />
                <div className='flex-1'>
                    {page==='Dashboard' && <Dashboard/>}
                    {page==='Profile' && <Personal_info/>}
                    {page==='Documents' && <Documents/>}
                    {page==='Subsidies' && <Subsidy_List/>}
                    {page==='Support' && <Support/>}
                    {page==='Settings' && <Settings/>}
                </div>
            </div>
        </>
    )
}

export default Sidebar
