import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'



function CreateRoom() {
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    topic: ''
  })
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem('access')
        const response = await axios.get('http://127.0.0.1:8000/api/topics/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        setTopics(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch topics')
        setLoading(false)
      }
    }
    fetchTopics()
  }, [])

  const handleChange = (e) => {
    setRoomData({
      ...roomData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('access')
    if (!token) {
      setError('Not authenticated. Please login first.')
      return
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/rooms/create/', {
        name: roomData.name,
        description: roomData.description,
        topic: roomData.topic
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 201) {
        setSuccess('Room created successfully!')
        setError('')
        // Reset form after successful creation
        setRoomData({ name: '', description: '', topic: '' })
        // Navigate to the new room
        navigate(`/rooms/${response.data.id}`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create room')
      setSuccess('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/90 to-gray-900/90">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-purple-400 mb-8">Create a New Room</h2>

            {loading && (
              <div className="flex items-center justify-center mb-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-400 mb-2">Room Name</label>
                <input
                  type="text"
                  name="name"
                  value={roomData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  required
                  placeholder="Enter room name"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Description</label>
                <textarea
                  name="description"
                  value={roomData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  rows="4"
                  required
                  placeholder="Enter room description"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Select Topic</label>
                <select
                  name="topic"
                  value={roomData.topic}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  required
                >
                  <option value="">Select a topic...</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!roomData.name || !roomData.description || !roomData.topic}
              >
                Create Room
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-800/50 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-800/50 rounded-lg">
                <p className="text-green-400">{success}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateRoom;
