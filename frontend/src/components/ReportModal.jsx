import { useState } from 'react';

const ReportModal = ({ isOpen, onClose, onSubmit, reportedUser }) => {
  const [reason, setReason] = useState('Inappropriate Language');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ reason, description });
      onClose();
      // Optionally clear fields
      setDescription('');
      setReason('Inappropriate Language');
    } catch (error) {
      console.error('Failed to submit report', error);
      // Let the caller handle showing errors
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-2">Report {reportedUser?.profile?.firstName || reportedUser?.username}</h2>
        <p className="text-sm text-gray-500 mb-4">Please help us understand the issue by selecting the reason and optionally adding more details.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Inappropriate Language</option>
              <option>Harassment</option>
              <option>Spam</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what happened (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50">{loading ? 'Submitting...' : 'Submit Report'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
