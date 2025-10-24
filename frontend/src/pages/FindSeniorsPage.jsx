import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import SeniorCard from '../components/SeniorCard';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { SKILL_CATEGORIES } from '../utils/constants';
import { debounce } from '../utils/helpers';

const FindSeniorsPage = () => {
  const { user, updateUser, refetchUser } = useAuth();
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSeniors(currentPage, searchQuery, selectedSkills);
    }
  }, [user, currentPage, searchQuery, selectedSkills]);

  // Refetch user data when page becomes visible (in case connections were updated)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchUser(); // Refetch user data to get updated connections
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchUser]); // Refetch when user or filters change

  const fetchSeniors = async (page = 1, query = '', skills = []) => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };

      if (query) {
        params.name = query;
      }

      if (skills.length > 0) {
        params.skills = skills.join(',');
      }

      const response = await userService.getSeniors(params);
      setSeniors(response.data); // <-- The data is in response.data
      setTotalPages(response.pagination.pages); // <-- Total pages are in response.pagination.pages
    } catch (error) {
      console.error('Error fetching seniors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeniors(currentPage, searchQuery, selectedSkills);
  }, [currentPage]);

  const debouncedSearch = debounce((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchSeniors(1, query, selectedSkills);
  }, 500);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    debouncedSearch(query);
  };

  const handleSkillToggle = (skill) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];

    setSelectedSkills(newSkills);
    setCurrentPage(1);
    fetchSeniors(1, searchQuery, newSkills);
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setSearchQuery('');
    setCurrentPage(1);
    fetchSeniors(1, '', []);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Mentors</h1>
        <p className="text-gray-600">
          Discover experienced professionals who can guide your career journey.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, skills, or expertise..."
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t pt-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {SKILL_CATEGORIES.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedSkills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {(selectedSkills.length > 0 || searchQuery) && (
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {skill} ×
                    </span>
                  ))}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : seniors.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Found {seniors.length} mentor{seniors.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seniors.map((senior) => (
                <SeniorCard 
                  key={senior._id} 
                  senior={senior} 
                  user={user}
                  onConnectionUpdate={() => fetchSeniors(currentPage, searchQuery, selectedSkills)}
                  onUserUpdate={updateUser}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FaSearch className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindSeniorsPage;