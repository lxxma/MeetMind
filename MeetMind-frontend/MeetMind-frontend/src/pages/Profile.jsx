import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'



function Profile() {
  const [userData, setUserData] = useState({
    avatar: '',
    username: '',
    email: '',
    bio: '',
    full_name: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('access')
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/me/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        // Ensure we have all required fields in the initial state
        const profileData = {
          avatar: response.data.avatar || '',
          username: response.data.username || '',
          email: response.data.email || '',
          bio: response.data.bio || '',
          full_name: response.data.full_name || ''
        }
        
        setUserData(profileData);
      } catch (err) {
        setError('Error fetching user profile');
        console.log(err);
      }
    }
    fetchUserProfile();
  }, [])

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = (e) => {
    setUserData({
      ...userData,
      avatar: e.target.files[0]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', userData.username)
    formData.append('email', userData.email)
    formData.append('bio', userData.bio)
    formData.append('full_name', userData.full_name)
    if (userData.avatar) {
      formData.append('avatar', userData.avatar)
    }

    const token = localStorage.getItem('access')
    try {
      const response = await axios.put('http://127.0.0.1:8000/api/users/me/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Ensure we have all required fields in the response
      const updatedData = {
        avatar: response.data.avatar || '',
        username: response.data.username || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        full_name: response.data.full_name || ''
      }
      
      setUserData(updatedData)
      setIsEditing(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error updating profile')
      console.error('Error updating profile:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-400 mb-4">Profile Settings</h1>
            <p className="text-gray-400">Manage your account information</p>
          </div>

          {error && (
            <div className="bg-red-700/20 border border-red-600 text-red-300 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={userData.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <label
                    htmlFor="avatar"
                    className="absolute bottom-0 right-0 bg-purple-600/90 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-purple-700/90 transition-colors"
                  >
                    Change
                  </label>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={userData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={userData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-6 py-2 border border-gray-700 text-base font-medium rounded-md text-gray-400 hover:bg-gray-800/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600/90 hover:bg-purple-700/90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-center mb-6">
                <img
                  src={userData.avatar || '/default-avatar.png'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <p className="text-xl text-gray-400">Full Name: <span className="cursor-pointer hover:text-purple-400" onClick={() => navigate('/profile')}>{userData.name}</span></p>
                <p className="text-xl text-gray-400">Username: {userData.username}</p>
                <p className="text-xl text-gray-400">Email: {userData.email}</p>
                {userData.bio && (
                  <p className="text-xl text-gray-400">Bio: {userData.bio}</p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600/90 hover:bg-purple-700/90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-6 py-2 border border-gray-700 text-base font-medium rounded-md text-gray-400 hover:bg-gray-800/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
