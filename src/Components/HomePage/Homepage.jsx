import React from 'react'
import Navbar from './Navbar'
import './Homepage.css'
import Subsidy from './Subsidy'
import Guidlines from './Guidlines'
import Footer from './Footer'
import FAQ from './FAQ'
import News from './News'

function Homepage() {
    
    return (
        <>
            <Navbar />
            <div className="middle-bg w-full">
                <div className="w-full bg_green_layer bg-[#1B7A43] flex justify-around p-1">
                    <div className="flex flex-col text-center text-white mt-40 space-y-3 md:ml-5 md:text-left">
                        <p className="text-3xl space-y-3 font-bold align-middle">Empowering Farmers <br/> Enabling Growth with Subsidies</p>
                        <p>One platform to explore, apply, <br/> and track agricultural subsidies with ease.</p>
                        <button className='bg-white p-1 rounded-md pl-3 pr-3 text-green-600 mt-5 w-30 font-bold mx-auto md:mx-0'>Learn More</button>
                    </div>
                    <div className="hidden md:block">
                        <img src='/Tractor.jpg' className='h-100 w-100 mt-20 border-white border-1 rounded-xl mx-auto'/>
                    </div>
                </div>
            </div>
            {/* <Subsidy /> */}
            {/* <Guidlines /> */}
            {/* <News /> */}
            <FAQ />
            <Footer />
        </>
    )
}

export default Homepage
