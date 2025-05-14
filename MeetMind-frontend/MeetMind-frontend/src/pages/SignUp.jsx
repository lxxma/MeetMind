import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/signup/',
        {
          username: username,
          email: email,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);

        const userData = {
          id: response.data.id,
          email: response.data.email,
          username: response.data.username,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/home');
      } else {
        setError(`Signup failed: ${response.data?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.error || 'An error occurred during signup';
      setError(errorMessage);
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex justify-center items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-500 mb-2">Create Account</h1>
            <p className="text-gray-400">Join our community today</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-700/20 border border-red-600 text-red-300 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-purple-600/90 text-white py-2 px-4 rounded-md hover:bg-purple-700/90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Sign Up
            </button>
          </form>

          {/* Link to Login Page */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
