import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Homepage from './Homepage';
import Settings from './Settings';

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentId = parseInt(id);
  const totalNews = 3;

  const handlePrevious = () => {
    const prevId = currentId > 1 ? currentId - 1 : totalNews;
    navigate(`/news/${prevId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    const nextId = currentId < totalNews ? currentId + 1 : 1;
    navigate(`/news/${nextId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newsArticles = {
    1: {
      title: "Government Announces New Agricultural Subsidies for 2025",
      date: "Aug 12, 2025",
      image: "/News1.jpg",
      category: "Government Policy",
      author: "Ministry of Agriculture",
      content: [
        "In a landmark announcement, the government has unveiled a comprehensive package of new agricultural subsidies for 2025, aimed at revolutionizing farming practices across the nation. This initiative marks one of the most significant investments in the agricultural sector in recent years.",
        "The new subsidy program focuses on three key areas: modern irrigation systems, improved seed varieties, and eco-friendly fertilizers. Farmers who adopt these technologies will be eligible for financial assistance covering up to 60% of the implementation costs.",
        "Under the irrigation component, subsidies will be provided for drip irrigation systems, sprinkler systems, and rainwater harvesting structures. These systems are designed to improve water use efficiency and help farmers cope with water scarcity challenges.",
        "The improved seed program offers subsidies for high-yielding, disease-resistant crop varieties that have been specifically developed for local climatic conditions. This initiative aims to increase crop productivity by an estimated 25-30% while reducing the need for chemical pesticides.",
        "For eco-friendly fertilizers, the government is promoting organic and bio-fertilizers that enhance soil health and reduce environmental impact. Farmers transitioning to organic farming practices will receive additional incentives and technical support.",
        "The subsidy scheme also includes provisions for farmer training programs, ensuring that beneficiaries can effectively utilize the new technologies. Extension services will be strengthened across districts to provide on-ground support.",
        "Applications for these subsidies will be accepted through the KrushiSetu portal starting next month. The government has allocated a budget of ₹5,000 crores for this program in the current fiscal year.",
        "Agriculture Minister stated that this initiative aligns with the government's vision of doubling farmers' income while promoting sustainable agricultural practices. The program is expected to benefit over 2 million farmers nationwide."
      ]
    },
    2: {
      title: "Smart Farming Technologies Gain Momentum",
      date: "Sep 02, 2025",
      image: "/News2.jpg",
      category: "Technology",
      author: "Agricultural Innovation Center",
      content: [
        "Smart farming technologies are rapidly transforming the agricultural landscape, with artificial intelligence, IoT sensors, and automation leading the revolution. These technologies are no longer just concepts but practical tools that farmers across the country are increasingly adopting.",
        "AI-powered crop monitoring systems use satellite imagery and drone technology to provide real-time insights into crop health, pest infestations, and nutrient deficiencies. These systems can detect problems days or even weeks before they become visible to the naked eye.",
        "Soil sensors represent another breakthrough in precision agriculture. These devices continuously monitor soil moisture, pH levels, nutrients, and temperature, transmitting data to farmers' smartphones. This information enables precise irrigation and fertilizer application, reducing waste and increasing efficiency.",
        "Automated irrigation systems integrated with weather forecasts and soil sensors can adjust watering schedules automatically, ensuring crops receive optimal moisture levels while conserving water resources. Early adopters report water savings of up to 40%.",
        "The financial benefits are equally impressive. Farmers using smart farming technologies report an average increase in yields of 20-30% and a reduction in operational costs of approximately 25%. These improvements directly translate to higher profitability and more sustainable farming operations.",
        "Recognizing the potential of these technologies, the government and private sector organizations are now offering comprehensive training programs. These programs cover everything from basic smartphone usage to advanced data analytics, ensuring farmers can fully leverage these new tools.",
        "Training centers have been established in 150 districts, offering both in-person and online courses. The courses are designed to be practical and hands-on, with demonstration farms where farmers can see the technologies in action before implementing them on their own land.",
        "Success stories are emerging from across the country. In Maharashtra, a farmer increased his tomato yield by 35% using AI crop monitoring. In Punjab, a cooperative of 50 farmers reduced their water consumption by 45% through smart irrigation systems while maintaining the same yield levels.",
        "Experts predict that within the next five years, smart farming technologies will become mainstream, fundamentally changing how agriculture is practiced. The combination of increased productivity, reduced environmental impact, and improved farmer incomes presents a compelling case for widespread adoption."
      ]
    },
    3: {
      title: "New Initiatives for Sustainable Farming Launched",
      date: "Sep 15, 2025",
      image: "/News3.jpg",
      category: "Sustainability",
      author: "Environmental Agriculture Department",
      content: [
        "The government has launched a series of groundbreaking initiatives aimed at promoting sustainable farming practices among farmers nationwide. These programs represent a comprehensive approach to addressing environmental challenges while ensuring agricultural productivity.",
        "The cornerstone of these initiatives is the Organic Farming Transition Program, which provides financial support and technical assistance to farmers switching from conventional to organic farming methods. The program offers a three-year transition support package to compensate for potential yield fluctuations during the conversion period.",
        "Another key initiative focuses on integrated pest management (IPM), encouraging farmers to reduce reliance on chemical pesticides. The program promotes biological pest control methods, use of pest-resistant crop varieties, and crop rotation strategies that naturally reduce pest populations.",
        "Water conservation is a major component of the sustainability drive. The initiatives include support for constructing farm ponds, check dams, and percolation tanks. These structures not only provide irrigation water but also help recharge groundwater levels, addressing a critical challenge in many agricultural regions.",
        "Agroforestry is being actively promoted as a means to enhance farm sustainability. Farmers are encouraged to integrate trees with their agricultural crops, which provides multiple benefits including additional income from timber and non-timber forest products, improved soil health, and carbon sequestration.",
        "The soil health card program has been expanded and digitized. Farmers now receive detailed soil analysis reports via mobile apps, along with customized recommendations for soil improvement using organic matter and bio-fertilizers. This helps maintain long-term soil fertility while reducing chemical fertilizer dependency.",
        "To support these initiatives, the government has established 500 model sustainable farms across the country. These farms serve as learning centers where farmers can observe sustainable practices in action and receive hands-on training.",
        "Financial incentives are substantial. Farmers adopting sustainable practices can access subsidies covering up to 50% of implementation costs. Additional incentives are available for organic certification and for farmers who achieve measurable improvements in soil health and biodiversity.",
        "Early results are promising. Pilot projects have shown that sustainable farming practices can maintain or even increase productivity while significantly reducing environmental impact. Farmers in these projects report improved soil quality, reduced input costs, and access to premium markets for sustainably produced crops.",
        "The initiatives also include partnerships with organic food companies and retail chains, ensuring that farmers practicing sustainable agriculture have guaranteed markets for their produce, often at premium prices. This addresses one of the key concerns farmers have about transitioning to sustainable methods.",
        "Looking ahead, these initiatives are expected to transform Indian agriculture, making it more resilient to climate change, environmentally sustainable, and economically viable for farmers. The government has committed to expanding these programs over the next five years, with a target of covering 30% of the country's agricultural land under sustainable farming practices."
      ]
    }
  };

  const article = newsArticles[id];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />
      <Settings />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4">
          <span className="bg-[#1B7A43] text-white px-4 py-1 rounded-full text-sm font-semibold">
            {article.category}
          </span>
        </div>


        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>


        <div className="flex items-center gap-6 text-gray-600 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">By:</span>
            <span>{article.author}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          {currentId > 1 ? (
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 bg-[#1B7A43] text-white px-4 py-2 rounded-lg hover:bg-[#145a32] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Previous</span>
            </button>
          ) : <div />}
          <span className="text-gray-600 font-semibold">
            {currentId} / {totalNews}
          </span>
          {currentId < totalNews ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#1B7A43] text-white px-4 py-2 rounded-lg hover:bg-[#145a32] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ) : <div />}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <div className="float-none md:float-left md:mr-6 mb-4 w-full md:w-80 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-48 md:h-64 object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {article.content.map((paragraph, index) => (
              <p key={index} className="text-gray-700 mb-6 leading-relaxed text-justify">
                {paragraph}
              </p>
            ))}
          </div>
          <div className='flex justify-center items-center'>
            <button onClick={() => navigate('/')} className='bg-green-700 text-black px-4 py-2 rounded-lg'>
                Back
            </button>
          </div>
        </div>
      </div> 
    </div>
  );
}

export default NewsDetail;
