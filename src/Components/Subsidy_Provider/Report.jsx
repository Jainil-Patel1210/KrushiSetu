import React, { useState } from 'react'
import Header from '../User_Profile/Header'
import Settings from '../HomePage/Settings'

const Report = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - replace with actual data from your backend
  const allApplications = [
    { id: 1, farmerName: 'Rajesh Kumar', subsidyName: 'Organic Farming Subsidy', applicationId: 'APP2024001', date: '2024-01-15', status: 'Approved' },
    { id: 2, farmerName: 'Priya Singh', subsidyName: 'Drip Irrigation Subsidy', applicationId: 'APP2024002', date: '2024-02-10', status: 'Approved' },
    { id: 3, farmerName: 'Amit Patel', subsidyName: 'Crop Insurance Premium', applicationId: 'APP2024003', date: '2024-03-05', status: 'Under Review' },
    { id: 4, farmerName: 'Sunita Verma', subsidyName: 'Drip Irrigation Subsidy', applicationId: 'APP2024004', date: '2024-03-12', status: 'Pending' },
    { id: 5, farmerName: 'Vikram Sharma', subsidyName: 'Organic Farming Subsidy', applicationId: 'APP2024005', date: '2024-03-18', status: 'Approved' },
    { id: 6, farmerName: 'Kavita Joshi', subsidyName: 'Solar Pump Subsidy', applicationId: 'APP2024006', date: '2024-03-20', status: 'Pending' }
  ];

  const sanitizeInput = (input) => {
    return input.replace(/[^a-zA-Z0-9\s-]/g, '');
  };

  const handleSearchChange = (e) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setSearchQuery(sanitizedValue);
  };

  const filteredApplications = allApplications.filter(app => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      app.subsidyName.toLowerCase().includes(query) ||
      app.farmerName.toLowerCase().includes(query) ||
      app.applicationId.toLowerCase().includes(query) ||
      app.status.toLowerCase().includes(query) ||
      app.date.toLowerCase().includes(query)
    );
  });

  const applications = searchQuery ? filteredApplications : allApplications;

  const totalApplications = applications.length;
  const approved = applications.filter(app => app.status === 'Approved').length;
  const underReview = applications.filter(app => app.status === 'Under Review').length;
  const pending = applications.filter(app => app.status === 'Pending').length;
  const rejected = applications.filter(app => app.status === 'Rejected').length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Under Review': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <Header />
      <Settings />

      <div className="w-full bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Application Reports
              </h1>
              <p className="text-[#77797C] font-semibold mt-1 sm:mt-2 text-xs sm:text-sm md:text-base lg:text-lg">
                View and Analyze Subsidy Scheme Applications with Detailed Reports
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Subsidy, Farmer Name, Application ID, Status or Date..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-10 pr-9 sm:pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <svg className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button type="submit" className="bg-[#009500] text-xs sm:text-sm md:text-base text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition whitespace-nowrap flex items-center justify-center gap-2">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </form>

            <div className="mb-3 sm:mb-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Only letters, numbers, spaces, and hyphens are allowed
              </span>
            </div>

            {searchQuery && (
              <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                Showing {applications.length} result{applications.length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Total Applications</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalApplications}</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Approved</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">
                  {approved} <span className="text-xs sm:text-sm">({totalApplications > 0 ? ((approved/totalApplications)*100).toFixed(1) : 0}%)</span>
                </p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Under Review</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">
                  {underReview} <span className="text-xs sm:text-sm">({totalApplications > 0 ? ((underReview/totalApplications)*100).toFixed(1) : 0}%)</span>
                </p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Pending</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-700">
                  {pending} <span className="text-xs sm:text-sm">({totalApplications > 0 ? ((pending/totalApplications)*100).toFixed(1) : 0}%)</span>
                </p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2 sm:p-3 lg:p-4 col-span-2 sm:col-span-1">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold mb-1">Rejected</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700">
                  {rejected} <span className="text-xs sm:text-sm">({totalApplications > 0 ? ((rejected/totalApplications)*100).toFixed(1) : 0}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 mb-3 sm:mb-4">Subsidy Applications</h2>
            
            {applications.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500">No applications found matching your search.</p>
              </div>
            ) : (
              <>
                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr className="text-left text-base md:text-lg lg:text-lg font-bold text-gray-700">
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Sr. No.</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Farmer Name</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Subsidy Name</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Application ID</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Date</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">Status</th>
                        <th className="px-3 lg:px-4 py-3 lg:py-4">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications.map((app, index) => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base">{index + 1}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base font-medium">{app.farmerName}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base">{app.subsidyName}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base">{app.applicationId}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base">{app.date}</td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3">
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-3 lg:px-4 py-2 lg:py-3">
                            <button className="flex items-center gap-1 text-green-600 border border-green-600 px-2 lg:px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-50 transition">
                              <svg className="h-3 w-3 lg:h-4 lg:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {applications.map((app, index) => (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                          <h3 className="font-semibold text-sm">{app.farmerName}</h3>
                          <p className="text-xs text-gray-600 mt-1">{app.subsidyName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Application ID:</span>
                          <span>{app.applicationId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>{app.date}</span>
                        </div>
                      </div>
                      <button className="w-full flex items-center justify-center gap-1 text-green-600 border border-green-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-50 transition">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* View Report Button */}
            {applications.length > 0 && (
              <div className="flex justify-center mt-4 sm:mt-6">
                <button className="bg-[#009500] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 transition flex items-center gap-2">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Report
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default Report
