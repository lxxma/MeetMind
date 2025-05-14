import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'



function EditRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    topic: ''
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)



  useEffect(() => {
    const fetchRoomData = async () => {
      const token = localStorage.getItem('access')
      if (!token) {
        setError('No authentication token found!')
        return
      }

      if (!roomId) {
        setError('Room ID is missing!')
        return
      }

      try {
        // Get the room data
        const response = await axios.get(`http://127.0.0.1:8000/api/rooms/${roomId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status !== 200) {
          throw new Error('Failed to fetch room data')
        }

        // Set room data
        setRoomData(response.data)
        setError('')
      } catch (error) {
        setError(error.response?.data?.detail || 'Error fetching room data')
        console.error("Error fetching room data:", error)
      }
    }

    fetchRoomData()
  }, [roomId])

  
  const handleChange = (e) => {
    setRoomData({
      ...roomData,
      [e.target.name]: e.target.value,
    })
  }


  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('access')
    if (!token) {
      setError('No authentication token found!')
      setLoading(false)
      return
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/rooms/${roomId}/`,
        {
          name: roomData.name,
          description: roomData.description,
          topic: roomData.topic
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        setSuccessMessage('Room updated successfully!')
        setError('');
        setTimeout(() => navigate('/home'), 2000)
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Only the room creator can edit the room')
      } else if (error.response?.status === 404) {
        setError('Room not found')
      } else {
        setError(error.response?.data?.detail || 'Error updating room')
      }
      console.error('Error updating room:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async () => {
    const token = localStorage.getItem('access')
    if (!token) {
      setError('No authentication token found!')
      return
    }

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/rooms/${roomId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 204) {
        setSuccessMessage('Room deleted successfully!')
        setError('')
        setTimeout(() => navigate('/home'), 2000)
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Only the room creator can delete the room')
      } else if (error.response?.status === 404) {
        setError('Room not found')
      } else if (error.response?.status === 500) {
        setError('Internal server error occurred while deleting the room')
      } else {
        setError(error.response?.data?.detail || 'Error deleting room')
      }
      console.error('Error deleting room:', error)
    }
  }


  const handleCancel = () => {
    navigate('/home')
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/90 to-gray-900/90">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-gray-800/50 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-purple-400">Edit Room</h1>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-700/90 text-gray-400 rounded-lg hover:bg-gray-600/90 transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-red-900/90 border border-red-700/90 text-red-400 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/90 border border-green-700/90 text-green-400 px-4 py-3 rounded-md mb-6">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                Room Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={roomData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700/90 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                required
                placeholder="Enter room name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={roomData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700/90 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                rows="4"
                placeholder="Add a description..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-1">
                Topic
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={roomData.topic}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700/90 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                required
                placeholder="Enter topic"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Room'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600/90 text-white rounded-lg hover:bg-red-700/90 transition-colors"
              >
                Delete Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditRoom
