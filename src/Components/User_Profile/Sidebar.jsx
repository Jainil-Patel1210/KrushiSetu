import React from 'react'
import Personal_info from './personal_info.jsx'

function Sidebar() {
    return (
        <>
            <div className='flex  flex-2'>
                <div className='w-70 rounded-2xl sticky top-0 self-start'>
                    <img src="./Krushisetu_banner-removebg-preview.png" className='h-20 w-50 pt-3 ml-2' />
                    <hr role="separator" className="my-2 border-t border-gray-300" />
                    <div className='flex flex-col gap-8 mt-5'>
                        <button className='flex gap-2 ml-4'><img src="./Home.svg" className='h-5 w-5' />Home</button>
                        <button className='flex gap-2 ml-4'><img src="./Profile.svg" className='h-5 w-5' />Profile & Personal Details</button>
                        <button className='flex gap-2 ml-4'><img src="./Document.svg" className='h-5 w-5 text-black' />Documents</button>
                        <button className='flex gap-2 ml-4'><img src="./Note.svg" className='h-5 w-5' />My Subsidies</button>
                        <button className='flex gap-2 ml-4'><img src="./Support.svg" className='h-5 w-5' />Support</button>
                        <button className='flex gap-2 ml-4'><img src="./Setting.svg" className='h-5 w-5' />Settings</button>
                    </div>
                </div>
                <div className="w-px bg-gray-300" />
                <div>
                    <Personal_info/>
                </div>
            </div>
        </>
    )
}

export default Sidebar
