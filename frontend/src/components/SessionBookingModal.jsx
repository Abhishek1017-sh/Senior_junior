import { useState } from 'react';
import { FaCalendarAlt, FaClock, FaVideo, FaStickyNote } from 'react-icons/fa';
import sessionService from '../services/sessionService';

const SessionBookingModal = ({ isOpen, onClose, senior, onSuccess }) => {
  const [formData, setFormData] = useState({
    topic: '',
    scheduledTime: '',
    duration: 60,
    meetingLink: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      setLoading(false);
      return;
    }

    if (!formData.scheduledTime) {
      setError('Please select a date and time');
      setLoading(false);
      return;
    }

    const scheduledDate = new Date(formData.scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      setError('Please select a valid date and time');
      setLoading(false);
      return;
    }

    if (scheduledDate < new Date()) {
      setError('Please select a future date and time');
      setLoading(false);
      return;
    }

    if (!senior || !senior._id) {
      setError('Invalid senior selected');
      setLoading(false);
      return;
    }

    try {
      const sessionData = {
        seniorId: senior._id,
        topic: formData.topic.trim(),
        scheduledTime: scheduledDate.toISOString(),
        duration: parseInt(formData.duration),
        meetingLink: formData.meetingLink.trim(),
        notes: formData.notes.trim()
      };

      console.log('Sending session data:', sessionData); // Debug log

      await sessionService.bookSession(sessionData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Session booking error:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Book Session with {senior?.profile?.firstName}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic *
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="e.g., React Development, Career Advice"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-1" />
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleInputChange}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaClock className="inline mr-1" />
              Duration (minutes) *
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaVideo className="inline mr-1" />
              Meeting Link (optional)
            </label>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleInputChange}
              placeholder="https://zoom.us/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaStickyNote className="inline mr-1" />
              Additional Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any specific questions or topics you'd like to cover..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionBookingModal;