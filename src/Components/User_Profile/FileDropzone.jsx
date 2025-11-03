import React, { useRef, useState } from 'react';

/**
 * FileDropzone
 * Props:
 * - file: { name, preview, size } optional preview object
 * - onFileSelected: function(file) => void
 * - labelTitle: string
 * - hint: string
 * - accept: string
 * - maxSize: number (bytes)
 */
export default function FileDropzone({ file, onFileSelected, labelTitle = 'Click to upload or drag & drop', hint = 'PDF or Image (Max 5MB)', accept = '.pdf,image/*', maxSize = 5 * 1024 * 1024 }) {
    const inputRef = useRef(null);
    const [error, setError] = useState('');

    const onDragOver = (e) => e.preventDefault();

    const onDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleFile = (f) => {
        setError('');
        if (f.size > maxSize) {
            setError('File too large.');
            return;
        }
        onFileSelected && onFileSelected(f);
    };

    const onChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) handleFile(f);
    };

    return (
        <div>
            <div
                className={`border-2 border-dashed p-6 mt-3 text-center cursor-pointer rounded-lg transition-all duration-200 bg-gray-50 border-gray-200`}
                onClick={() => inputRef.current?.click()}
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                <input type="file" ref={inputRef} className="hidden" onChange={onChange} accept={accept} />

                <div className="flex flex-col items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l3-3m-3 3L9 10" />
                        <path strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    </svg>
                    <div className="mt-2">
                        <div className="font-medium">{labelTitle}</div>
                        <div className="text-xs">{hint}</div>
                    </div>
                </div>

                {file && (
                    <div className="mt-3 text-sm text-gray-500">
                        {file.preview ? (
                            <div className="flex items-center gap-3 justify-center">
                                <img src={file.preview} alt={file.name} className="w-20 h-14 object-cover rounded" />
                                <div>
                                    <div className="font-medium">{file.name}</div>
                                    {file.size && <div className="text-xs">{(file.size / (1024 * 1024)).toFixed(1)} MB</div>}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">{file.name}</div>
                        )}
                    </div>
                )}

                {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
            </div>
        </div>
    );
}
