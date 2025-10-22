import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const BookingModal = ({ isOpen, onClose, onSubmit, senior }) => {
  const [selectedSlot, setSelectedSlot] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedSlot('');
      setTopic('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !topic.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        seniorId: senior._id,
        slot: selectedSlot,
        topic: topic.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Error booking session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock availability slots - in real app, fetch from API
  const availabilitySlots = [
    { id: '1', date: '2025-10-25', time: '10:00 AM', duration: '60 min' },
    { id: '2', date: '2025-10-25', time: '2:00 PM', duration: '60 min' },
    { id: '3', date: '2025-10-26', date: '3:00 PM', duration: '60 min' },
    { id: '4', date: '2025-10-27', time: '11:00 AM', duration: '60 min' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Book a Session</h2>
        <p className="text-gray-600 mb-6">
          Book a mentorship session with {senior?.profile?.firstName} {senior?.profile?.lastName}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Available Slots */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Available Time Slot *
            </label>
            <div className="space-y-2">
              {availabilitySlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedSlot === slot.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-gray-500" />
                    <div>
                      <p className="font-medium">{slot.date}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaClock />
                        <span>{slot.time} ({slot.duration})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Development, Career Advice"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about what you'd like to discuss..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSlot || !topic.trim() || loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Book Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;