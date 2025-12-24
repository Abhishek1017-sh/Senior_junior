import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaSave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import userService from '../services/userService';
import { USER_ROLES } from '../utils/constants';
import { AVAILABILITY_OPTIONS, AVAILABILITY_PRESETS, WEEK_DAYS } from '../utils/constants';
import Container from '../components/Container';

const EditProfilePage = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    interests: '',
    skills: '',
    experience: '',
  });
  const [availability, setAvailability] = useState([]);
  const [availabilityInput, setAvailabilityInput] = useState({ days: [], start: '', end: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        interests: user.profile?.interests?.join(', ') || '',
        skills: user.seniorProfile?.skills?.join(', ') || '',
        experience: user.seniorProfile?.experience || '',
      });
      setPreviewUrl(user.profile?.profilePictureUrl || '');
      // Normalize legacy string availability into objects so UI can toggle them
      const avail = user.seniorProfile?.availability || [];
      const normalized = avail.map((a) => (typeof a === 'string' ? { type: 'legacy', label: a } : a));
      setAvailability(normalized);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    setLoading(true);
    try {
      await userService.deleteProfilePicture();
      await refetchUser();
      setProfilePicture(null);
      setPreviewUrl('');
    } catch (err) {
      console.error('Failed to delete profile picture', err);
      setError('Failed to remove profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Build profile data
      const profilePayload = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          location: formData.location,
          bio: formData.bio,
          interests: formData.interests ? formData.interests.split(',').map(s => s.trim()) : [],
        },
      };

      // If senior, include seniorProfile fields
      if (user?.role === USER_ROLES.SENIOR || user?.role === USER_ROLES.BOTH) {
        profilePayload.seniorProfile = {
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
          experience: formData.experience,
          availability,
        };
      }

      // Update profile
      await authService.updateProfile(profilePayload);

      // If profile picture selected, upload it and capture result
      let uploadRes;
      if (profilePicture) {
        uploadRes = await userService.uploadProfilePicture(profilePicture);
      }

      // Refresh user data in context
      await refetchUser();

      // If server returned the new URL, set preview so we immediately show the DP
      if (uploadRes?.data?.profilePictureUrl) {
        setPreviewUrl(uploadRes.data.profilePictureUrl);
        } else {
        // fallback — fetch updated user to ensure preview reflects server state
        try {
          const updated = await authService.getCurrentUser();
          setPreviewUrl(updated?.data?.profile?.profilePictureUrl || '');
        } catch (err) {
          // ignore silently but log for debugging
          console.debug('Failed to fetch updated user for preview:', err);
        }
      }
      // Force re-fetch of profile (with auth headers) so profile page shows fresh location
      try {
        await userService.getUserProfile(user._id);
      } catch (err) {
        console.debug('Ignored error fetching user profile post-save:', err);
      }
      navigate(`/profile/${user._id}`);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="card-surface rounded-lg shadow-md p-6 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <img
            src={previewUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <label htmlFor="profilePicture" className="flex items-center space-x-2 cursor-pointer">
              <FaCamera className="text-blue-600" />
              <span className="text-blue-600 hover:text-blue-700">Change Picture</span>
            </label>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemoveProfilePicture}
                className="ml-4 text-sm text-red-600 hover:text-red-800"
                disabled={loading}
              >
                Remove Picture
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="City, Country"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interests (comma-separated)
          </label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleInputChange}
            placeholder="Web Development, AI, Data Science"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Senior Profile Fields */}
        {(user?.role === USER_ROLES.SENIOR || user?.role === USER_ROLES.BOTH) && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="React, Node.js, MongoDB"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="10+ years"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              {/* Preset buttons for quick selection - will add structured objects */}
              <div className="grid md:grid-cols-2 gap-3">
                {AVAILABILITY_OPTIONS.map((opt) => {
                  const preset = AVAILABILITY_PRESETS[opt];
                  const isSelected = availability.some(a => a.label === preset.label || a.type === 'legacy' && a.label === opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setAvailability(prev => prev.filter(v => v.label !== preset.label && !(v.type === 'legacy' && v.label === opt)));
                        } else {
                          setAvailability(prev => [...prev, preset]);
                        }
                      }}
                      className={`p-3 text-left border rounded-md transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Add custom availability entry */}
              <div className="mt-3 border rounded-md p-3">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex flex-wrap gap-1">
                    {WEEK_DAYS.map((d) => (
                      <label key={d} className="inline-flex items-center text-sm mr-2">
                        <input
                          type="checkbox"
                          checked={availabilityInput.days.includes(d)}
                          onChange={() => setAvailabilityInput(prev => ({ ...prev, days: prev.days.includes(d) ? prev.days.filter(x => x !== d) : [...prev.days, d] }))}
                        />
                        <span className="ml-1">{d}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="time" value={availabilityInput.start} onChange={(e) => setAvailabilityInput(prev => ({ ...prev, start: e.target.value }))} className="px-2 py-1 border rounded" />
                    <span className="text-sm">to</span>
                    <input type="time" value={availabilityInput.end} onChange={(e) => setAvailabilityInput(prev => ({ ...prev, end: e.target.value }))} className="px-2 py-1 border rounded" />
                    <button
                      type="button"
                      onClick={() => {
                        if (availabilityInput.days.length === 0) return;
                        const label = `${availabilityInput.days.join(', ')} (${availabilityInput.start || 'Any'} - ${availabilityInput.end || 'Any'})`;
                        setAvailability(prev => [...prev, { days: availabilityInput.days, start: availabilityInput.start, end: availabilityInput.end, label }]);
                        setAvailabilityInput({ days: [], start: '', end: '' });
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >Add</button>
                  </div>
                </div>

                {/* Show list of selected availability items */}
                {availability.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {availability.map((av, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm text-gray-700">{av.label || (av.days ? `${av.days.join(', ')} ${av.start ? `(${av.start}-${av.end})` : ''}` : av)}</div>
                        <button type="button" onClick={() => setAvailability(prev => prev.filter((_, i) => i !== idx))} className="text-red-600 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(`/profile/${user._id}`)}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <FaSave />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Container>
  );
};

export default EditProfilePage;
