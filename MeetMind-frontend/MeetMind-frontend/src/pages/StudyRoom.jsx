import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'



function StudyRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)

  useEffect(() => {
    console.log('StudyRoom component mounted with roomId:', roomId)
    const fetchRoomData = async () => {
      const token = localStorage.getItem('access')
      
      if (!token) {
        setError('Not authenticated. Please login first.')
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching room data...')
        // Fetch room details
        const roomResponse = await axios.get(`http://127.0.0.1:8000/api/rooms/${roomId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        console.log('Room response:', JSON.stringify(roomResponse.data, null, 2))
        
        // Fetch messages for this specific room
        const messagesResponse = await axios.get(`http://127.0.0.1:8000/api/rooms/${roomId}/messages/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        // Filter messages to ensure they belong to this room
        const filteredMessages = messagesResponse.data.filter(message => message.room === roomId)

        console.log('Messages response:', JSON.stringify(messagesResponse.data, null, 2))

        // Handle the data structure
        const roomData = roomResponse.data
        const messagesData = messagesResponse.data

        if (roomData && messagesResponse.data) {
          setRoom(roomData)
          setMessages(filteredMessages)
          setError('')
        } else {
          setError('Invalid response from server')
        }
      } catch (err) {
        console.error('API Error:', err.response?.data || err)
        setError(err.response?.data?.detail || 
          'Error loading room data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [roomId])

  const handleSendMessage = async (e) => {
    e.preventDefault() // Prevent form submission
    const token = localStorage.getItem('access')
    
    if (!token) {
      setError('Not authenticated. Please login first.')
      return
    }

    if (!newMessage.trim()) {
      setError('Message cannot be empty')
      return;
    }

    try {
      // Include room ID in the message data
      const response = await axios.post(
        `http://127.0.0.1:8000/api/rooms/${roomId}/messages/`,
        { 
          content: newMessage,
          room: roomId
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      // Add the new message to the state
      setMessages(prevMessages => [...prevMessages, response.data])
      
      // Clear the input field
      setNewMessage('')
      
      // Clear any error message
      setError('')
    } catch (err) {
      setError('Error sending message. Please try again.')
      console.error('API Error:', err.response?.data || err)
    }
  }

  const handleLeaveRoom = () => {
    setShowLeaveConfirmation(false)
    navigate('/home')
  }

  return (
    <div className="study-room-container bg-gray-900 text-white min-h-screen">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-purple-400 mb-2">Loading Room...</h3>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-red-400 mb-2">Error</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 bg-purple-600/90 text-white rounded-md hover:bg-purple-700/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-purple-400 mb-4">Leave Room?</h3>
            <p className="text-gray-400 mb-4">Are you sure you want to leave this study room?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLeaveConfirmation(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-purple-600/90 text-white rounded-md hover:bg-purple-700/90 transition-colors"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}

      {room && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-purple-400">{room.name}</h1>
                <button
                  onClick={() => setShowLeaveConfirmation(true)}
                  className="px-4 py-2 bg-red-600/90 text-white rounded-md hover:bg-red-700/90 transition-colors"
                >
                  Leave Room
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600/90 flex items-center justify-center">
                    <span className="text-white font-semibold">{room.host?.username?.[0] || 'H'}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400">Host</h3>
                    <p className="text-gray-400">{room.host?.username || 'Unknown host'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400">Description</h3>
                  <p className="text-gray-400 mt-1">{room.description || 'No description provided'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400">Topic</h3>
                  <p className="text-gray-400 mt-1">{room.topic?.name || room.topic || 'No topic specified'}</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Room Rules</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>Be respectful to others</li>
                    <li>Stay on topic</li>
                    <li>Ask questions when needed</li>
                    <li>Help others when possible</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 bg-gray-800/50 rounded-xl p-6">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className="mb-4">
                      <div className="flex items-start gap-3">
                        <img 
                          src={message.user?.avatar || '/default-avatar.png'} 
                          alt={`${message.user?.username || 'Unknown user'} avatar`} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-purple-400">
                              {message.user?.username || 'Unknown user'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Just now'}
                            </span>
                          </div>
                          <div className="bg-gray-700/50 p-3 rounded-lg max-w-[85%]">
                            <p className="text-gray-400">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No messages yet. Be the first to send one!</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-700/50 rounded-lg px-4 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 transition-colors"
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyRoom
