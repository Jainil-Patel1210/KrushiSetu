import React, { useEffect } from 'react'
import AOS from 'aos';
import 'aos/dist/aos.css';
import './News.css'


function News() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className='text-4xl font-extrabold text-gray-900 mb-6 text-center mt-6' data-aos="fade-down" data-aos-delay="100">Latest News</h1>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-14 mb-12'>
                    <article className='bg-[#F5F5DC] rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 custom-transition hover:transform hover:scale-102 hover:shadow-lg' data-aos="fade-up" data-aos-delay="120">
                        <div className='h-44 w-full overflow-hidden'>
                            <img src='./News1.jpg' alt='news-1' className='w-full h-full object-cover' />
                        </div>
                        <div className='p-5'>
                            <h2 className='text-lg font-bold text-gray-900 mb-2'>Government Announces New Agricultural Subsidies for 2025</h2>
                            <p className='text-sm text-gray-700 mb-3'>Farmers can now access new subsidies for modern farming — irrigation systems, improved seeds, and eco-friendly fertilizers to boost yields and sustainability.</p>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs text-gray-500'>Aug 12, 2025</span>
                                <button className='bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-green-700 transition-colors'>Read More</button>
                            </div>
                        </div>
                    </article>

                    {/* Card 2 */}
                    <article className='bg-[#F5F5DC] rounded-lg overflow-hidden shadow-sm]transition-shadow duration-300 custom-transition hover:transform hover:scale-102 hover:shadow-lg' data-aos="fade-up" data-aos-delay="140">
                        <div className='h-44 w-full overflow-hidden'>
                            <img src='./News2.jpg' alt='news-2' className='w-full h-full object-cover' />
                        </div>
                        <div className='p-5'>
                            <h2 className='text-lg font-bold text-gray-900 mb-2'>Smart Farming Technologies Gain Momentum</h2>
                            <p className='text-sm text-gray-700 mb-3'>AI crop monitoring, soil sensors, and automated irrigation are helping farmers increase yields and reduce costs. Training programs are now available.</p>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs text-gray-500'>Sep 02, 2025</span>
                                <button className='bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-green-700 transition-colors'>Read More</button>
                            </div>
                        </div>
                    </article>

                    {/* Card 3 */}
                    <article className='bg-[#F5F5DC] rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 custom-transition hover:transform hover:scale-102 hover:shadow-lg' data-aos="fade-up" data-aos-delay="160">
                        <div className='h-44 w-full overflow-hidden'>
                            <img src='./News3.jpg' alt='news-3' className='w-full h-full object-cover' />
                        </div>
                        <div className='p-5'>
                            <h2 className='text-lg font-bold text-gray-900 mb-2'>Weather Advisory: Unseasonal Rain Expected This Week</h2>
                            <p className='text-sm text-gray-700 mb-3'>Forecasts predict unseasonal rainfall — farmers should secure vulnerable crops and ensure adequate drainage to avoid waterlogging.</p>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs text-gray-500'>Oct 10, 2025</span>
                                <button className='bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-green-700 transition-colors'>Read More</button>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </>
    )
}

export default News
