import React, { useState, useEffect } from 'react'
import { FaPlus, FaEye, FaPlay } from 'react-icons/fa';
import Header from "./Header";
import './Support.css';
import Settings from '../HomePage/Settings.jsx';
import FileDropzone from './FileDropzone';

function Support() {
    const [grievances, setGrievances] = useState([]);

    // New grievance form state
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [preferredContact, setPreferredContact] = useState('email');
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const [answerno, setAnswerno] = useState(null);
    
    const toggleAnswer = (index) => {
    if (answerno === index) {
      setAnswerno(null); // Answer is already open, close it
    } else {
      setAnswerno(index);
    }
  };

    useEffect(() => {
        // fetch grievances for current user on component mount
        fetchGrievances();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchGrievances = async () => {
        try {
            const token = localStorage.getItem('access');
            const res = await fetch('http://127.0.0.1:8000/support/grievances/', {
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: 'include',
            });
            if (!res.ok) {
                console.error('Failed to load grievances');
                return;
            }
            const data = await res.json();
            // normalize to local shape
            const list = data.map((g) => ({
                id: g.id,
                grievanceId: g.grievance_id,
                subject: g.subject,
                date: g.created_at ? g.created_at.slice(0, 10) : '',
                status: g.status,
                description: g.description || '',
                attachmentUrl: g.attachment_url || null,
            }));
            setGrievances(list);
        } catch (err) {
            console.error('Error fetching grievances', err);
        }
    };

    const resetForm = () => {
        setSubject('');
        setDescription('');
        setPreferredContact('email');
        setAttachment(null);
        setErrors({});
    }

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setAttachment(file);
            setAttachmentPreview({
                name: file.name,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                size: file.size,
            });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!subject.trim()) newErrors.subject = 'Subject is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        // prepare form data for API
        const data = new FormData();
        data.append('subject', subject.trim());
        data.append('description', description.trim());
        data.append('preferred_contact', preferredContact);
        if (attachment) data.append('attachment', attachment);

        try {
            const token = localStorage.getItem('access');
            const res = await fetch('http://127.0.0.1:8000/support/grievances/', {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: data,
                credentials: 'include',
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to create grievance');
            }

            const created = await res.json();

            // normalize server response to local table shape
            const createdGrievance = {
                id: created.id,
                grievanceId: created.grievance_id,
                subject: created.subject,
                date: created.created_at ? created.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
                status: created.status || 'Pending',
                description: created.description || '',
                attachmentName: created.attachment_url ? created.attachment_url.split('/').pop() : null,
            };

            // refresh list from server to get canonical data
            await fetchGrievances();
            resetForm();
            setShowForm(false);
        } catch (err) {
            console.error(err);
            // basic error handling - show in form errors
            setErrors({ form: err.message || 'Failed to submit' });
        }
    }

    const videoTutorials = [
        { id: 1, title: 'How to apply for subsidies?', thumbnail: 'video1.jpg' },
        { id: 2, title: 'How to check application status?', thumbnail: 'video2.jpg' },
        { id: 3, title: 'How to raise a grievance?', thumbnail: 'video3.jpg' },
        { id: 4, title: 'How to Compare subsidies?', thumbnail: 'video4.jpg' },
        { id: 5, title: 'How to check eligibility?', thumbnail: 'video5.jpg' },
        { id: 6, title: 'How to upload documents?', thumbnail: 'video6.jpg' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium';
            case 'Resolved':
                return 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium';
            case 'Rejected':
                return 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium';
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
                <div className="max-w-6xl mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8">
                    <h1 className="font-extrabold text-2xl sm:text-3xl text-gray-900 mt-1 ml-2">Support & Help</h1>
                    <p className="text-gray-600 mt-2 max-w-2xl text-sm sm:text-base ml-2">Get help, raise grievances, and access helpful resources</p>
                </div>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-xl p-4 mx-4 sm:mx-8 md:mx-10 mb-3 shadow-lg ring-1 ring-gray-100 gap-4 sm:gap-0'>
                    <div>
                        <h2 className='text-green-700 font-semibold text-xl'>Raise a Grievance</h2>
                        <p className='text-gray-600 mt-2 max-w-2xl'>Having an issue? Let us know and we'll help you resolve it</p>
                    </div>
                    <div>
                        <button onClick={() => setShowForm(true)} className='bg-green-700 text-white p-2 rounded-md text-semibold flex items-center gap-2'>
                            <FaPlus className="text-sm" />New Grievance
                        </button>
                    </div>
                </div>

                {/* ---------------------------------Grievance Form-------------------------------------- */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowForm(false)}></div>
                        <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-4 sm:p-6 z-10">
                            <h3 className="text-lg sm:text-xl font-semibold text-green-700">Raise New Grievance</h3>
                            <form onSubmit={handleSubmit} className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject <span className='text-red-500'>*</span></label>
                                    <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Short summary" />
                                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description <span className='text-red-500'>*</span></label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Describe the issue in detail" />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Attachment (optional)</label>
                                    <FileDropzone file={attachmentPreview} onFileSelected={(file) => {
                                        setAttachment(file);
                                        setAttachmentPreview({
                                            name: file.name,
                                            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                                            size: file.size,
                                        });
                                    }} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Preferred contact</label>
                                    <div className="mt-1 flex items-center gap-4">
                                        <label className="flex items-center gap-2"><input type="radio" name="contact" checked={preferredContact === 'email'} onChange={() => setPreferredContact('email')} /> Email</label>
                                        <label className="flex items-center gap-2"><input type="radio" name="contact" checked={preferredContact === 'phone'} onChange={() => setPreferredContact('phone')} /> Phone</label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="px-4 py-2 rounded-md border border-gray-300">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-md bg-green-700 text-white">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ---------------------------------Grievance Table-------------------------------------- */}
                <div className='bg-white rounded-xl p-4 sm:p-6 mx-4 sm:mx-8 md:mx-10 mb-3 shadow-lg ring-1 ring-gray-100'>
                    <h2 className='text-green-700 font-semibold text-lg sm:text-xl mb-4 sm:mb-6'>My Grievances</h2>
                    <div className='hidden sm:block overflow-x-auto sm:mx-0'>
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
                                        <td className='py-4 px-4'>
                                            <button onClick={() => { setSelectedGrievance(grievance); setShowDetails(true); }} className='flex items-center gap-1 text-green-700 border-2 border-green-700 px-3 py-1 rounded-full hover:bg-green-50 transition-colors text-sm font-medium'><FaEye className='text-xs' />View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ---------------------------------Grievance List for mobile-------------------------------------- */}
                    <div className='sm:hidden space-y-4'>
                        {grievances.map((grievance, index) => (
                            <div key={grievance.id} className='bg-white rounded-lg border border-gray-200 p-4 shadow-sm'>
                                <div className='flex justify-between items-start mb-3'>
                                    <div>
                                        <p className='text-xs text-gray-500'>Grievance ID</p>
                                        <h3 className='text-gray-800 font-medium'>{grievance.grievanceId}</h3>
                                    </div>
                                    <span className={getStatusStyle(grievance.status)}>{grievance.status}</span>
                                </div>
                                
                                <div className='space-y-2 mb-4'>
                                    <div>
                                        <p className='text-xs text-gray-500'>Subject</p>
                                        <p className='text-gray-800'>{grievance.subject}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500'>Date Applied</p>
                                        <p className='text-gray-800'>{grievance.date}</p>
                                    </div>
                                </div>

                                <div className='flex justify-end'>
                                    <button 
                                        onClick={() => { setSelectedGrievance(grievance); setShowDetails(true); }}
                                        className='flex items-center gap-1 text-green-700 border-2 border-green-700 px-4 py-1.5 rounded-full hover:bg-green-50 transition-colors text-sm font-medium'>
                                        <FaEye className='text-xs' />View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </div>

                {/* ---------------------------------Grievance Details Modal-------------------------------------- */}
                {showDetails && selectedGrievance && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setShowDetails(false); setSelectedGrievance(null); }}></div>
                        <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 p-4 sm:p-6 z-10">
                            <div className="flex justify-between items-start gap-3 sm:gap-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-green-700">Grievance Details</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Details for {selectedGrievance.grievanceId}</p>
                                </div>
                                <button onClick={() => { setShowDetails(false); setSelectedGrievance(null); }} className="text-gray-500 hover:text-gray-700">Close</button>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between">
                                    <div className="text-sm text-gray-600">Grievance ID</div>
                                    <div className="font-medium">{selectedGrievance.grievanceId}</div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="text-sm text-gray-600">Subject</div>
                                    <div className="font-medium">{selectedGrievance.subject}</div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="text-sm text-gray-600">Date</div>
                                    <div className="font-medium">{selectedGrievance.date}</div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="text-sm text-gray-600">Status</div>
                                    <div>
                                        <span className={getStatusStyle(selectedGrievance.status)}>{selectedGrievance.status}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-600">Description</div>
                                    <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                                        {selectedGrievance.description || <span className="text-gray-500">No description provided.</span>}
                                    </div>
                                </div>

                                {selectedGrievance.attachmentUrl && (
                                    <div>
                                        <div className="text-sm text-gray-600">Attachment</div>
                                        <a href={selectedGrievance.attachmentUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 px-3 py-1 border rounded-md text-sm text-green-700 border-green-700 hover:bg-green-50">View attachment</a>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-4">
                                <button onClick={() => { setShowDetails(false); setSelectedGrievance(null); }} className="px-4 py-2 rounded-md border border-gray-300">Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------------------------FAQ-------------------------------------- */}
                <div className='bg-white rounded-xl p-4 sm:p-6 mx-4 sm:mx-8 md:mx-10 mb-3 shadow-lg ring-1 ring-gray-100'>
                    <h1 className='text-green-700 font-semibold text-xl mb-6'>Frequently Asked Questions</h1>
                    
                </div>

                {/* ---------------------------------Video Tutorials-------------------------------------- */}
                <div className='bg-white rounded-xl p-4 sm:p-6 mx-4 sm:mx-8 md:mx-10 mb-5 shadow-lg ring-1 ring-gray-100'>
                    <h2 className='text-green-700 font-semibold text-xl mb-6'>Video Tutorials</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                        {videoTutorials.map((video) => (
                            <div key={video.id} className='group cursor-pointer'>
                                <div className='relative bg-green-700 rounded-lg overflow-hidden aspect-video flex items-center justify-center hover:bg-green-800 transition-colors'>
                                    <div className='flex items-center justify-center'>
                                        <div className='bg-white bg-opacity-90 rounded-md p-1.5 sm:p-2 group-hover:scale-110 transition-transform'>
                                            <FaPlay className='text-green-700 text-base sm:text-lg ml-0.5 sm:ml-1' />
                                        </div>
                                    </div>
                                </div>
                                <h3 className='mt-2 sm:mt-3 text-gray-800 font-medium text-xs sm:text-sm'>{video.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
        </>
    )
}

export default Support
