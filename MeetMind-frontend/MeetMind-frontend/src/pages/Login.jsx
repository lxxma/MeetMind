import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'



function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        email: email,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200) {
        localStorage.setItem('access', response.data.access)
        localStorage.setItem('refresh', response.data.refresh)
        
        // Store user data
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          username: response.data.user.username,
          profile: {
            avatar: response.data.user.profile.avatar,
            bio: response.data.user.profile.bio,
            full_name: response.data.user.profile.full_name
          }
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        navigate('/home')
      } else {
        setError(`Login failed: ${response.data?.detail || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.detail || 'An error occurred during login'
      setError(errorMessage)
    }
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex justify-center items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-500 mb-2">Welcome Back</h1>
            <p className="text-gray-400">Please sign in to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
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

            {error && (
              <div className="bg-red-700/20 border border-red-600 text-red-300 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600/90 text-white py-2 px-4 rounded-md hover:bg-purple-700/90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Sign In
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

