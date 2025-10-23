function Subsidy_detail({ subsidy, onClose }) {
    if (!subsidy) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-xl font-bold mb-2">{subsidy.title}</h2>
                <p>Amount: ₹{parseFloat(subsidy.amount).toLocaleString('en-IN')}</p>
                <p>Date: {subsidy.created_at ? new Date(subsidy.created_at).toLocaleDateString() : "N/A"}</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Close</button>
            </div>
        </div>
    );
}

export default Subsidy_detail;
