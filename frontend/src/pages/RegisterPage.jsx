import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthFooter from '../components/AuthFooter';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const userData = {
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        interests: data.interests ? data.interests.split(',').map(i => i.trim()) : [],
      },
    };

    const result = await registerUser(userData);

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleOAuthRegister = (provider) => {
    // Redirect to OAuth provider
    if (provider === 'google') {
      const API_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
      window.location.href = `${API_URL}/api/auth/google`;
    } else if (provider === 'github') {
      const API_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
      window.location.href = `${API_URL}/api/auth/github`;
    }
  };

  return (
    <div className="auth-layout bg-gray-50">
      <div className="auth-hero">
        <div className="max-w-md text-left">
          <img src="/auth-illustration.svg" alt="Auth illustration" className="mb-6 w-full max-w-[420px]" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Create your account</h2>
          <p className="text-sm text-gray-600">Join the community — sign up as a mentor or learner to start collaborating.</p>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-lg shadow-md">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 text-center">Create your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign in</Link>
            </p>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <input
                id="username"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  {...register('firstName', {
                    required: 'First name is required',
                  })}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  {...register('lastName', {
                    required: 'Last name is required',
                  })}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a *
              </label>
              <select
                id="role"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register('role', {
                  required: 'Please select your role',
                })}
              >
                <option value="">Select your role</option>
                <option value={USER_ROLES.JUNIOR}>Junior (Student/Learner)</option>
                <option value={USER_ROLES.SENIOR}>Senior (Mentor/Expert)</option>
                <option value={USER_ROLES.BOTH}>Both (I want to mentor and learn)</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Interests */}
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                Interests (comma-separated)
              </label>
              <input
                id="interests"
                type="text"
                placeholder="e.g., Web Development, AI, Data Science"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register('interests')}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or register with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthRegister('google')}
                className="w-full inline-flex oauth-btn justify-center py-2 px-4 rounded-md shadow-sm oauth-google text-sm font-medium text-gray-700"
              >
                <FaGoogle className="text-red-500" />
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthRegister('github')}
                className="w-full inline-flex oauth-btn justify-center py-2 px-4 rounded-md shadow-sm oauth-github text-sm font-medium"
              >
                <FaGithub className="text-gray-900" />
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
        </form>
        <div className="mt-4">
          <p className="text-center text-xs text-gray-400">By creating an account you agree to our <a href="#" className="text-primary-600">Terms</a> and <a href="#" className="text-primary-600">Privacy Policy</a>.</p>
        </div>
        <AuthFooter />
      </div>
    </div>
  </div>
  );
};

export default RegisterPage;
