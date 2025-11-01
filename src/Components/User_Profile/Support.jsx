import React from 'react'
import { FaPlus, FaEye, FaPlay } from 'react-icons/fa';
import Header from "./Header";
import './Support.css';
import FAQ from '../HomePage/FAQ.jsx';
import Settings from '../HomePage/Settings.jsx';

function Support() {
    const grievances = [
        {id: 1, grievanceId: 'GRV2024001', subject: 'Subsidy Payment Delay', date: '2024-03-15', status: 'Pending'},
        {id: 2, grievanceId: 'GRV2024002', subject: 'Document Verification Issue', date: '2024-03-10', status: 'Resolved'},
        {id: 3, grievanceId: 'GRV2024003', subject: 'Application Status Not Updated', date: '2024-03-05', status: 'Under Review'},
        {id: 4, grievanceId: 'GRV2024004', subject: 'Wrong Bank Details', date: '2024-02-28', status: 'Resolved'},
    ];

    const videoTutorials = [
        { id: 1, title: 'How to apply for subsidies?', thumbnail: 'video1.jpg' },
        { id: 2, title: 'How to check application status?', thumbnail: 'video2.jpg' },
        { id: 3, title: 'How to raise a grievance?', thumbnail: 'video3.jpg' },
        { id: 4, title: 'How to Compare subsidies?', thumbnail: 'video4.jpg' },
        { id: 5, title: 'How to check eligibility?', thumbnail: 'video5.jpg' },
        { id: 6, title: 'How to upload documents?', thumbnail: 'video6.jpg' },
    ];

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Resolved':
                return 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium';
            case 'Under Review':
                return 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium';
            default:
                return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium';
        }
    };

    return (
        <>
            <Header />
            <Settings />
            <div className="w-full mx-auto">
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-10">
                    <h1 className="font-extrabold text-3xl text-gray-900 mt-1">Support & Help</h1>
                    <p className="text-gray-600 mt-2 max-w-2xl">Get help, raise grievances, and access helpful resources</p>
                </div>
                <div className='flex justify-between items-center bg-white rounded-xl p-4 ml-10 mr-10 mb-3 shadow-lg ring-1 ring-gray-100'>
                    <div>
                        <h2 className='text-green-700 font-semibold text-xl'>Raise a Grievance</h2>
                        <p className='text-gray-600 mt-2 max-w-2xl'>Having an issue? Let us know and we'll help you resolve it</p>
                    </div>
                    <div>
                        <button className='bg-green-700 text-white p-2 rounded-md text-semibold flex items-center gap-2'><FaPlus className="text-sm" />New Grievance</button>
                    </div>
                </div>
                <div className='bg-white rounded-xl p-6 ml-10 mr-10 mb-3 shadow-lg ring-1 ring-gray-100'>
                    <h2 className='text-green-700 font-semibold text-xl mb-6'>My Grievances</h2>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b-2 border-gray-200'>
                                    <th className='table-heading'>Sr. No.</th>
                                    <th className='table-heading'>Grievance ID</th>
                                    <th className='table-heading'>Subject</th>
                                    <th className='table-heading'>Date</th>
                                    <th className='table-heading'>Status</th>
                                    <th className='table-heading'>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grievances.map((grievance, index) => (
                                    <tr key={grievance.id} className='border-b border-gray-300 hover:bg-gray-50 transition-colors'>
                                        <td className='py-4 px-4 text-gray-800'>{index + 1}</td>
                                        <td className='py-4 px-4 text-gray-800 font-medium'>{grievance.grievanceId}</td>
                                        <td className='py-4 px-4 text-gray-800'>{grievance.subject}</td>
                                        <td className='py-4 px-4 text-gray-600'>{grievance.date}</td>
                                        <td className='py-4 px-4'><span className={getStatusStyle(grievance.status)}>{grievance.status}</span></td>
                                        <td className='py-4 px-4'><button className='flex items-center gap-1 text-green-700 border-2 border-green-700 px-3 py-1 rounded-full hover:bg-green-50 transition-colors text-sm font-medium'><FaEye className='text-xs' />View</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='bg-white rounded-xl p-6 ml-10 mr-10 mb-3 shadow-lg ring-1 ring-gray-100'>
                    <FAQ />
                </div>
                <div className='bg-white rounded-xl p-6 ml-10 mr-10 mb-5 shadow-lg ring-1 ring-gray-100'>
                    <h2 className='text-green-700 font-semibold text-xl mb-6'>Video Tutorials</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {videoTutorials.map((video) => (
                            <div key={video.id} className='group cursor-pointer'>
                                <div className='relative bg-green-700 rounded-lg overflow-hidden aspect-video flex items-center justify-center hover:bg-green-800 transition-colors'>
                                    <div className='flex items-center justify-center'>
                                        <div className='bg-white bg-opacity-90 rounded-md p-2 group-hover:scale-110 transition-transform'>
                                            <FaPlay className='text-green-700 text-lg ml-1' />
                                        </div>
                                    </div>
                                </div>
                                <h3 className='mt-3 text-gray-800 font-medium text-sm'>{video.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Support
