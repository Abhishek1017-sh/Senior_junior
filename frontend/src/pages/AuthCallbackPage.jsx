import { useEffect } from 'react';
    import { useNavigate, useSearchParams } from 'react-router-dom';
    import { useAuth } from '../context/AuthContext';
    import axios from 'axios';

    const AuthCallbackPage = () => {
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();
      const { updateUser } = useAuth();

      useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Fetch the user details now that we have the token
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me`)
            .then(response => {
              updateUser(response.data.data);
              navigate('/dashboard');
            })
            .catch(err => {
              console.error("Failed to fetch user after OAuth callback", err);
              navigate('/login');
            });
        } else {
          // No token found, redirect to login
          navigate('/login');
        }
      }, [navigate, searchParams, updateUser]);

      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="ml-4">Finalizing authentication...</p>
        </div>
      );
    };

    export default AuthCallbackPage;