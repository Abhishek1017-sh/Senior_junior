import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthFooter from '../components/AuthFooter';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
/* Updated comment: Frontend login page improved */


const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await login(data.email, data.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleOAuthLogin = (provider) => {
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Welcome back</h2>
          <p className="text-sm text-gray-600">Sign in to manage your sessions and connect with mentors.</p>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-lg shadow-md">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 text-center">Sign in to your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              No account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:underline">Create one</Link>
            </p>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-400 focus:border-primary-400 focus:z-10 sm:text-sm"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="mt-4">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-400 focus:border-primary-400 focus:z-10 sm:text-sm"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => handleOAuthLogin('google')} className="w-full inline-flex oauth-btn justify-center py-2 px-4 rounded-md shadow-sm oauth-google text-sm font-medium text-gray-700">
                  <FaGoogle className="text-xl" />
                  <span>Continue with Google</span>
                </button>

                <button type="button" onClick={() => handleOAuthLogin('github')} className="w-full inline-flex oauth-btn justify-center py-2 px-4 rounded-md shadow-sm oauth-github text-sm font-medium">
                  <FaGithub className="text-xl" />
                  <span>Continue with GitHub</span>
                </button>
              </div>
            </div>
          </form>
        <div className="mt-4">
          <p className="text-center text-xs text-gray-400">By continuing you agree to our <a href="#" className="text-primary-600">Terms</a> and <a href="#" className="text-primary-600">Privacy Policy</a>.</p>
        </div>
        <div className="mt-6">
          <p className="text-center text-sm text-gray-500">Having trouble? <a href="/contact" className="text-primary-600 hover:underline">Contact support</a></p>
        </div>
        <AuthFooter />
      </div>
    </div>
  </div>
  );
};

export default LoginPage;
