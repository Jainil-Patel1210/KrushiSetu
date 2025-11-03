import React from 'react'

function Header() {

    return (
        <div className='lg:block hidden'>
            <div className="sticky top-0 bg-white w-full flex justify-end items-center py-4  px-4 sm:px-6 md:px-8">
                <div className="flex items-center gap-4 sm:gap-6">
                    <img src="./Notification.svg" alt="Notifications" className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer" />
                    <img
                        src="./Account.svg"
                        alt="Account"
                        className="w-7 h-7 sm:w-8 sm:h-8 cursor-pointer rounded-full"
                    />
                </div>
            </div>
            <hr className="border-t border-gray-300" />
        </div>
    )
}

export default Header
