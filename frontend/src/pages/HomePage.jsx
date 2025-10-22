import { Link } from 'react-router-dom';
import { FaUsers, FaHandshake, FaRocket, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Connect with Industry Experts
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Bridge the gap between students and professionals. Get mentorship,
            guidance, and accelerate your career growth.
          </p>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link
                to="/find-seniors"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Find Mentors
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Senior-Junior Connect?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Network</h3>
              <p className="text-gray-600">
                Connect with experienced professionals from top companies
                across various industries.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Guidance</h3>
              <p className="text-gray-600">
                Get tailored advice and mentorship based on your career goals
                and current skill level.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRocket className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accelerate Growth</h3>
              <p className="text-gray-600">
                Fast-track your career development with industry insights
                and practical knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Mentors Available</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
              <p className="text-gray-600">Successful Sessions</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <p className="text-gray-600">Industries Covered</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">4.8</div>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who are already
            benefiting from our mentorship platform.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Now - It's Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
