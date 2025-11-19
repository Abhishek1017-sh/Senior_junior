import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaComments, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Connect with Mentors & Learners</h1>
        <p className="text-xl mb-8 opacity-90">
          A platform for knowledge sharing, mentorship, and professional growth
        </p>
        <div className="flex justify-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/find-seniors"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Find Mentors
              </Link>
              <Link
                to="/dashboard"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaUsers className="text-blue-600 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Mentors</h3>
          <p className="text-gray-600">
            Search and connect with experienced professionals in your field
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaCalendarAlt className="text-green-600 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Sessions</h3>
          <p className="text-gray-600">
            Schedule mentorship sessions at times that work for you
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaComments className="text-purple-600 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Chat</h3>
          <p className="text-gray-600">
            Communicate instantly with mentors and peers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaStar className="text-yellow-600 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rate & Review</h3>
          <p className="text-gray-600">
            Share your experience and help others find great mentors
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white rounded-lg shadow-md p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up</h3>
            <p className="text-gray-600">
              Create your account and set up your profile as a student or mentor
            </p>
          </div>

          <div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-600">
              Find and connect with mentors or students that match your interests
            </p>
          </div>

          <div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn & Grow</h3>
            <p className="text-gray-600">
              Schedule sessions, chat in real-time, and accelerate your growth
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-blue-50 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Join thousands of mentors and learners on our platform
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
          >
            Create Your Account
          </Link>
        </section>
      )}
    </div>
  );
};

export default HomePage;
