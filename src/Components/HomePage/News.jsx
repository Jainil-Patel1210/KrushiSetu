import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './News.css';
import api from '../User_Profile/api1';
import { formatDate } from '../../utils/auth';

function News() {
    const navigate = useNavigate();
    const [newsData, setNewsData] = useState([]);

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            delay: 0
        });

        fetchLatestNews();
    }, []);

    const fetchLatestNews = async () => {
        const token = localStorage.getItem("access");
        try {
            const res = await api.get("/news/articles/?limit=3");
            setNewsData(res.data);
        } catch (err) {
            console.error("Error fetching news:", err);
        }
    };

    return (
        <>
            <div id="news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className='text-4xl font-extrabold text-gray-900 mb-6 text-center mt-6' data-aos="fade-up">
                    Latest News
                </h1>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12'>
                    {newsData.map((newsItem, index) => (
                        <div
                            key={newsItem.id}
                            className={`bg-[#F5F5DC] rounded-lg overflow-hidden shadow-sm transition-all duration-500 ease-in-out hover:transform hover:scale-105 hover:shadow-xl w-full h-full 
                            ${index >= 2 ? 'hidden lg:block' : ''}`}
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                        >
                            <div className='h-44 w-full overflow-hidden'>
                                <img
                                    src={newsItem.image}
                                    alt={`news-${newsItem.id}`}
                                    className='w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-110'
                                />
                            </div>

                            <div className='p-5'>
                                <h2 className='text-lg font-bold text-gray-900 mb-2'>{newsItem.title}</h2>

                                <p className='text-sm text-gray-700 mb-3 line-clamp-3'>
                                    {newsItem.description}
                                </p>

                                <div className='flex items-center justify-between'>
                                    <span className='text-xs text-gray-500'>{formatDate(newsItem.date)}</span>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            navigate(`/news/${newsItem.id}`);
                                        }}
                                        className='bg-[#1B7A43] text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-[#145a32] transition-colors cursor-pointer'
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
    );
}

export default News;
