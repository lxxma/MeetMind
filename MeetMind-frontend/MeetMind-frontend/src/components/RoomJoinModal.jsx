import React, { useState, useEffect } from 'react'
import axios from 'axios'



function RoomJoinModal({ room, onClose, navigate }) {
  const [isLeaving, setIsLeaving] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkRoomStatus = async () => {
    const token = localStorage.getItem('access')
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/rooms/${room.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const user = JSON.parse(localStorage.getItem('user'))
      setIsJoined(response.data.participants.some(p => p.id === user.id))
    } catch (err) {
      console.error('Error checking room status:', err)
    }
  }

  useEffect(() => {
    checkRoomStatus()
  }, [room.id])

  const handleJoinRoom = async () => {
    if (isLeaving) return

    const token = localStorage.getItem('access')
    try {
      setLoading(true)
      setError('')
      
      // Make API call to join the room
      const response = await axios.post(
        `http://127.0.0.1:8000/api/rooms/${room.id}/`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log('Join room response:', response.data)

      // Close the modal and navigate to the study room
      setIsLeaving(true)
      onClose()
      navigate(`http://localhost:5173/rooms/${room.id}`, { replace: true })
      
    } catch (err) {
      setError('Failed to join room. Please try again.')
      console.error('Join room error:', err)
      console.error('Response data:', err.response?.data)
      console.error('Response status:', err.response?.status)
      console.error('Response headers:', err.response?.headers)
      setIsLeaving(false)
      setLoading(false)
    } finally {
      setIsLeaving(false)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Join Room</h2>
        
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <div className="mb-4">
          <p className="text-gray-600">Room ID: {room.id}</p>
          <p className="text-gray-600">Name: {room.name}</p>
          <p className="text-gray-600">Description: {room.description}</p>
        </div>

        <button
          onClick={handleJoinRoom}
          disabled={loading || isLeaving}
          className={`w-full py-2 px-4 rounded-lg ${
            loading || isLeaving
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </div>
    </div>
  )
}

export default RoomJoinModal
