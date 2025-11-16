import React, { useState, useEffect } from 'react';
import Header from '../User_Profile/Header';
import Settings from '../HomePage/Settings';
import { AiOutlineEye, AiOutlineDelete, AiOutlineEdit, AiOutlineClose } from "react-icons/ai";
import { Toaster, toast } from "react-hot-toast";

const News = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    provider: '',
    description: '',
    image: null
  });
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch news articles (you'll need to implement the API call)
  useEffect(() => {
    // TODO: Fetch news from API
    // For now, using empty array
    setNewsArticles([]);
  }, []);

  const handleAddClick = () => {
    setIsEditing(false);
    setSelectedNews(null);
    setFormData({
      title: '',
      date: '',
      provider: '',
      description: '',
      image: null
    });
    setShowModal(true);
  };

  const handleEditClick = (news) => {
    setIsEditing(true);
    setSelectedNews(news);
    setFormData({
      title: news.title,
      date: news.date,
      provider: news.provider,
      description: news.description,
      image: null // Don't set the image file, but we'll keep the URL
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setSelectedNews(null);
    setFormData({
      title: '',
      date: '',
      provider: '',
      description: '',
      image: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedNews) {
        // Update existing news article
        const updatedNews = {
          ...selectedNews,
          title: formData.title,
          date: formData.date,
          provider: formData.provider,
          description: formData.description,
          image: formData.image ? URL.createObjectURL(formData.image) : selectedNews.image
        };
        
        // Update in state
        setNewsArticles(newsArticles.map(news => 
          news.id === selectedNews.id ? updatedNews : news
        ));
        toast.success("News article updated successfully!");
      } else {
        // Create new news article object
        const newNews = {
          id: Date.now(), // Temporary ID
          title: formData.title,
          date: formData.date,
          provider: formData.provider,
          description: formData.description,
          image: formData.image ? URL.createObjectURL(formData.image) : null
        };
        
        // Add to state to display immediately
        setNewsArticles([newNews, ...newsArticles]);
        toast.success("News article posted successfully!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error posting news:", error);
      toast.error("Failed to post news article!");
    }
  };

  const handleDeleteClick = (news) => {
    setSelectedNews(news);
    setShowDeleteModal(true);
  };

  const handleViewClick = (news) => {
    setSelectedNews(news);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedNews(null);
  };

  const handleConfirmDelete = async () => {
    try {
      // Remove from state
      setNewsArticles(newsArticles.filter((item) => item.id !== selectedNews.id));
      setShowDeleteModal(false);
      setSelectedNews(null);
      toast.success("News article deleted successfully");
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Failed to delete news article!");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedNews(null);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <Settings />
      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Post News
              </h1>
              <p className="text-[#77797C] font-semibold mt-2 text-sm sm:text-base lg:text-lg">
                Share updates and announcements with farmers
              </p>
            </div>
            <button
              onClick={handleAddClick}
              className="mt-4 sm:mt-0 bg-[#009500] hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span className="text-xl font-bold">+</span>
              Post New Article
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news articles..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* News Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles && newsArticles.length > 0 ? (
              newsArticles
                .filter((news) => {
                  const query = searchQuery.toLowerCase();
                  return (
                    news.title.toLowerCase().includes(query) ||
                    news.description.toLowerCase().includes(query) ||
                    news.provider.toLowerCase().includes(query)
                  );
                })
                .map((news) => (
                <div key={news.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Image Placeholder */}
                  <div className="bg-gray-300 h-48 flex items-center justify-center">
                    {news.image ? (
                      <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {news.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{news.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{news.provider}</span>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {news.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewClick(news)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#009500] text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <AiOutlineEye className="text-lg" />
                        View More
                      </button>
                      <button
                        onClick={() => handleEditClick(news)}
                        className="px-4 py-2 border-2 border-[#009500] text-[#009500] rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <AiOutlineEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(news)}
                        className="px-4 py-2 border-2 border-[#E7000B] text-[#E7000B] rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <AiOutlineDelete className="text-xl" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">No news articles available. Click "Post New Article" to create one.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Post News Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{isEditing ? 'Edit Article' : 'Post New Article'}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <AiOutlineClose className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Article Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter article title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Provider <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Government of India"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter article description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing ? 'Leave empty to keep current image. Upload new to replace.' : 'Supported formats: JPG, PNG, GIF'}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-[#009500] text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isEditing ? 'Update Article' : 'Post Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View News Details Modal */}
      {showViewModal && selectedNews && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">News Details</h2>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <AiOutlineClose className="text-2xl" />
              </button>
            </div>

            <div className="p-6">
              {/* Image */}
              {selectedNews.image && (
                <div className="mb-6">
                  <img 
                    src={selectedNews.image} 
                    alt={selectedNews.title} 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Title */}
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedNews.title}
              </h3>

              {/* Date and Provider */}
              <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">{selectedNews.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-semibold">{selectedNews.provider}</span>
                </div>
              </div>

              {/* Full Description */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Description</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedNews.description}
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-6">
                <button
                  onClick={handleCloseViewModal}
                  className="w-full px-6 py-3 bg-[#009500] text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this news article? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-6 py-2 bg-[#E7000B] text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default News;
