import React from 'react';
import { Bell } from "lucide-react";

function Header() {
    return (
        <>
            <div className="sticky top-0 bg-white w-full flex justify-end items-center py-4 px-4 sm:px-6 md:px-8">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-black cursor-pointer hover:text-green-700" />
                    <img
                        src="./Account.svg"
                        alt="Account"
                        className="w-7 h-7 sm:w-8 sm:h-8 cursor-pointer rounded-full"
                    />
                </div>
            </div>
            <hr className="border-t border-gray-300" />
        </>
    )
}

export default Header
