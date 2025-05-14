import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'



function StudyRooms() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  console.log('Topic ID:', topicId)

  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase())
    if (e.target.value === '') {
      setFilteredRooms(rooms)
    }
  }

  useEffect(() => {
    if (searchQuery) {
      const filtered = rooms.filter(room => 
        room.name.toLowerCase().includes(searchQuery)
      )
      setFilteredRooms(filtered)
    }
  }, [searchQuery, rooms])

  useEffect(() => {
    setFilteredRooms(rooms)
  }, [rooms])

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem('access')
      if (!token) {
        setError('Not authenticated. Please login first.')
        return
      }

      try {
        setLoading(true)
        const response = await axios.get(`http://127.0.0.1:8000/api/rooms/?topic=${topicId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Rooms fetched:", response.data)
        setRooms(response.data)
        setError('')
      } catch (error) {
        console.error('Error fetching rooms:', error)
        setError('Error loading rooms. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (topicId) {
      fetchRooms() // Fetch rooms only if topicId is available
    }

  }, [topicId])

  const handleSendMessage = async () => {
    const token = localStorage.getItem('access')
    if (!token) {
      console.log('No token found')
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/rooms/${topicId}/messages/`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log("New message sent:", response.data)
      setMessages([...messages, response.data]) // Update messages with the new one
      setNewMessage('') // Clear message input after sending
    } catch (error) {
      console.error('Error sending message:', error)
    }
  };

  if (loading) {
    return <div>Loading rooms...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className={styles['study-rooms-container']}>
      <div className="w-full">
        <h2 className="text-center">Available Study Rooms</h2>
        
        <div className="mt-4">
          <div className="relative w-96 mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search rooms..."
              className="w-full px-4 py-2 rounded-lg bg-gray-800/50 text-purple-400 placeholder-purple-400/50 border border-purple-400/20 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className={styles['rooms-list']}>
        {filteredRooms.length === 0 ? (
          <p className={styles['error-message']}>No rooms available for this topic</p>
        ) : (
          filteredRooms.map((room) => (
            <div 
              key={room.id} 
              className={styles['room-card']}
              onClick={() => navigate(`/rooms/${room.id}`)}
            >
              <div className={styles['room-info']}>
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <p>Host: {room.host?.username || 'Unknown host'}</p>
                <p>Participants: {room.participants?.length || 0}</p>
              </div>
              <button 
                className={styles['join-button']}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/rooms/${room.id}`)
                }}
              >
                Join Room
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StudyRooms
