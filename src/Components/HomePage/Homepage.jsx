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
            <div className="middle-bg">
                <div className="bg_green_layer  bg-[#1B7A43] flex justify-around">
                    <div className="flex flex-col center-text text-white mt-40 space-y-3">
                        <p className="text-3xl space-y-3 font-bold align-middle">Empowering Farmers <br/> Enabling Growth with Subsidies</p>
                        <p>One platform to explore, apply, <br/> and track agricultural subsidies with ease.</p>
                        <button className='bg-white p-1 rounded-md pl-3 pr-3 text-green-600 mt-5 w-30 font-bold'>Learn More</button>
                    </div>
                    <div>
                        <img src='/Tractor.jpg' className='h-100 w-100 mt-20 border-white border-1'/>
                    </div>
                </div>
            </div>
            <Subsidy />
            <Guidlines />
            <News />
            <FAQ />
            <Footer />
        </>
    )
}

export default Homepage
