import React, { useEffect } from 'react'
import AOS from 'aos';
import 'aos/dist/aos.css';


function News() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <>
            <h1 className='text-4xl font-extrabold text-gray-900 mb-6 text-center mt-3' data-aos="fade-down" data-aos-delay="100">Latest News</h1>
            <div className='flex justify-around text-center max-w-7xl mx-auto mb-6 space-x-6'>
                <div className='bg-[#F5F5DC] rounded-md' data-aos="fade-up" data-aos-delay="100"><img src='./News1.jpg' className='h-70 w-70 rounded-t-md'/>
                    <h2 className='max-w-70 font-bold pb-2'> Government Announces New Agricultural Subsidies for 2025</h2>
                    <p className='max-w-70'>Farmers can now access new subsidies for modern farming, including irrigation systems, high-quality seeds, and eco-friendly fertilizers, to boost yields and promote sustainable practices.</p>
                    <button className='bg-green-600 text-white font-semibold text-xl px-4 py-1 my-2 rounded-md w-50 mt-2 mb-2'>Read More</button>
                </div>
                <div className='bg-[#F5F5DC] rounded-md' data-aos="fade-up" data-aos-delay="100"><img src='./News2.jpg' className='h-70 w-70 rounded-t-md'/>
                    <h2 className='max-w-70 font-bold pb-2'> Smart Farming Technologies Gain Momentum</h2>
                    <p className='max-w-70'>Innovative farming technologies like AI crop monitoring, soil sensors, and automated irrigation are boosting yields and reducing costs. Farmers can explore training programs to integrate these tools.</p>
                    <button className='bg-green-600 text-white font-semibold text-xl px-4 py-1 my-2 rounded-md w-50 mt-2 mb-2'>Read More</button>
                </div>
                <div className='bg-[#F5F5DC] rounded-md' data-aos="fade-up" data-aos-delay="100"><img src='./News3.jpg' className='h-70 w-70 rounded-t-md'/>
                    <h2 className='max-w-70 font-bold pb-2'> Weather Advisory: Unseasonal Rain Expected This Week</h2>
                    <p className='max-w-70'>Weather advisories warn of unexpected rainfall this week. Farmers should take precautions to protect crops and ensure proper drainage. Stay updated with local forecasts.</p>
                    <button className='bg-green-600 text-white font-semibold text-xl px-4 py-1 my-2 rounded-md w-50 mt-7 mb-2'>Read More</button>
                </div>
            </div>
        </>
    )
}

export default News
