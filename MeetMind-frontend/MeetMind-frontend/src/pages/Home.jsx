import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import RecentActivity from './RecentActivity'
import RoomCard from '../components/RoomCard'



function Home() {
  const [user, setUser] = useState({})
  const [rooms, setRooms] = useState([])
  const [topics, setTopics] = useState([])
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('access')
      if (!token) {
        setError('Not authenticated. Please login first.')
        return
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.')
        } else {
          setError('Error fetching user profile')
        }
        console.log(err)
      }
    }

    const handleLogout = () => {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      navigate('/login')
    }

    const fetchRooms = async () => {
      const token = localStorage.getItem('access')
      if (!token) {
        setError('Not authenticated. Please login first.')
        return
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/rooms/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('Rooms response:', response.data)
        setRooms(response.data)
      } catch (err) {
        console.error('Full error details:', err)
        console.error('Error response:', err.response?.data)
        
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.')
        } else if (err.response?.status === 403) {
          setError('Access denied. Please contact support.')
        } else if (err.response?.status === 404) {
          setError('No rooms found.')
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.')
        } else {
          setError(`Error fetching rooms: ${err.message || 'Please try again later.'}`)
        }
      }
    }

    const fetchTopics = async () => {
      const token = localStorage.getItem('access')
      if (!token) {
        setError('Not authenticated. Please login first.')
        setLoading(false)
        return
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/topics/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setTopics(response.data)
        setLoading(false)
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.')
        } else {
          setError(`Error fetching topics: ${err.response?.data?.error || 'Please try again later.'}`)
        }
        console.error('Error fetching topics:', err)
        setLoading(false)
      }
    }

    fetchUserProfile()
    fetchRooms()
    fetchTopics()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800/50 p-8 rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800/50 p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-red-400 mb-4">Error</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-purple-400">MeetMind</h1>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <Link
                  to="/profile"
                  className="flex items-center text-gray-400 hover:text-white focus:outline-none"
                >
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-sm">{user.username}</span>
                </Link>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800/50 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-purple-600/90"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 flex-grow py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Browse Topics</h3>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    to={`/topics/${topic.id}`}
                    className="block text-gray-400 hover:text-purple-400 transition-colors px-4 py-2 rounded-md hover:bg-gray-700/50"
                    onClick={() => {
                      console.log('Navigating to topic:', topic.id);
                    }}
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="md:w-3/4 flex-grow">
            <div className="mb-8">
              <Link 
                to="/create-room" 
                className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600/90 hover:bg-purple-700/90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Create a Room
              </Link>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-purple-400">Welcome to MeetMind</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for rooms..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-64 px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <h3>STUDY ROOMS</h3>
            {error && <p className="error-message">{error}</p>}

            <div className="rooms-list grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.length === 0 ? (
                <div className="col-span-full text-center">
                  <p className="text-gray-400">You haven't created or joined any rooms yet!</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} user={user} />
                ))
              )}
            </div>

            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
