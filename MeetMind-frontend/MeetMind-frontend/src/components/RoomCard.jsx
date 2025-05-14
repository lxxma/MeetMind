import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'



function RoomCard({ room, user }) {
  console.log('Rendering RoomCard with room:', room, 'and user:', user)
  const navigate = useNavigate()

  const handleJoinClick = async () => {
    const access = localStorage.getItem('access')
    const refresh = localStorage.getItem('refresh')
    
    if (!access || !refresh) {
      console.error('No valid tokens found')
      return
    }

    try {
      // Make API call to join the room
      const response = await axios.post(
        `http://127.0.0.1:8000/api/rooms/${room.id}/join/`,
        null,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      )
      console.log('Join room response:', response.data)
      navigate(`/rooms/${room.id}`);
    } catch (err) {
      console.error('Join room error:', err)
      console.error('Response data:', err.response?.data)
      console.error('Response status:', err.response?.status)
      console.error('Response headers:', err.response?.headers)
    }
  }

  return (
    <div className="room-card bg-gray-800/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h4 className="text-xl font-semibold text-purple-400 mb-2">{room.name}</h4>
      <p className="text-gray-400 mb-4">{room.description}</p>
      <div className="room-actions flex justify-between">
        <button
          onClick={handleJoinClick}
          className="room-button px-4 py-2 bg-purple-600/90 text-white rounded-md hover:bg-purple-700/90 transition-colors"
        >
          Join Room
        </button>
        {room.creator?.id === user?.id && (
          <Link 
            to={`/rooms/${room.id}/edit`} 
            className="room-button edit px-4 py-2 bg-gray-700 text-gray-400 rounded-md hover:bg-gray-600 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/rooms/${room.id}/edit`)
            }}
          >
            Edit Room
          </Link>
        )}
      </div>

    </div>
  )
}

export default RoomCard