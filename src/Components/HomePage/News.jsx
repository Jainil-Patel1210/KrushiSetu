import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './News.css'


function News() {
    const navigate = useNavigate();

    const newsData = [
        {
            id: 1,
            title: "Government Announces New Agricultural Subsidies for 2025",
            description: "Farmers can now access new subsidies for modern farming — irrigation systems, improved seeds, and eco-friendly fertilizers to boost yields and sustainability.",
            date: "Aug 12, 2025",
        },
        {
            id: 2,  
            title: "Smart Farming Technologies Gain Momentum",
            description: "AI crop monitoring, soil sensors, and automated irrigation are helping farmers increase yields and reduce costs. Training programs are now available.",
            date: "Sep 02, 2025",
        },
        {
            id: 3,
            title: "New Initiatives for Sustainable Farming Launched",
            description: "The government is introducing new initiatives aimed at promoting sustainable farming practices among local farmers.",
            date: "Sep 15, 2025",
        },
    ]

    useEffect(() => {
        AOS.init({ 
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            delay: 0
        });
    }, []);

    return (
        <>
            <div id="news" className="max-w-7xl mx-auto px-4 sm:px-6">
                <h1 className='text-4xl font-extrabold text-gray-900 mb-6 text-center mt-6' data-aos="fade-up">Latest News</h1>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12'>
                    {newsData.map((newsItem, index) => (
                        <div key={newsItem.id} className={`bg-[#F5F5DC] rounded-lg overflow-hidden shadow-sm transition-all duration-500 ease-in-out hover:transform hover:scale-105 hover:shadow-xl w-full h-full 
                            ${index >= 2 ? 'hidden lg:block' : ''}`} data-aos="fade-up" data-aos-delay={index * 100}
                            style={{ transitionDelay: `${index * 50}ms` }}>
                            <div className='h-44 w-full overflow-hidden'>
                                <img src={`/News${newsItem.id}.jpg`} alt={`news-${newsItem.id}`} className='w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-110' 
                                style={{ transitionDelay: `${index * 50}ms` }} />
                            </div>
                            <div className='p-5'>
                                <h2 className='text-lg font-bold text-gray-900 mb-2'>{newsItem.title}</h2>
                                <p className='text-sm text-gray-700 mb-3'>{newsItem.description}</p>
                                <div className='flex items-center justify-between'>
                                    <span className='text-xs text-gray-500'>{newsItem.date}</span>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Navigating to:', `/news/${newsItem.id}`);
                                            navigate(`/news/${newsItem.id}`);
                                        }}
                                        className='bg-[#1B7A43] text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-[#145a32] transition-colors cursor-pointer z-10 relative'
                                    >
                                        Read More
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default News
