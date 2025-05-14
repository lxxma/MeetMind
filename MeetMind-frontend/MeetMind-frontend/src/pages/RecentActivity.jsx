import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'



const ACTIVITY_TYPES = {
  ROOM_CREATE: 'Created Room',
  ROOM_JOIN: 'Joined Room',
  ROOM_LEAVE: 'Left Room',
  MESSAGE_POST: 'Posted Message',
  ROOM_UPDATE: 'Updated Room'
}

function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getActivityType = (activityType) => {
    switch (activityType) {
      case 'create_room':
        return ACTIVITY_TYPES.ROOM_CREATE;
      case 'join_room':
        return ACTIVITY_TYPES.ROOM_JOIN;
      case 'leave_room':
        return ACTIVITY_TYPES.ROOM_LEAVE;
      case 'post_message':
        return ACTIVITY_TYPES.MESSAGE_POST;
      case 'update_room':
        return ACTIVITY_TYPES.ROOM_UPDATE;
      default:
        return activityType // Return the raw type if it doesn't match our predefined types
    }
  }

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem('access')
      
      if (!token) {
        setError('Not authenticated. Please login first.')
        return
      }

      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/recent-activities/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })

        if (response.status === 200) {
          // Transform the data to include more details
          const transformedActivities = response.data.map(activity => {
            const activityDetails = {
              ...activity,
              type: activity.type,
              description: activity.description,
              timestamp: activity.timestamp
            }
            
            // Add room details if available
            if (activity.room) {
              activityDetails.room = {
                id: activity.room.id,
                name: activity.room.name,
                description: activity.room.description
              };
            }
            
            // Add message details if available
            if (activity.message) {
              activityDetails.message = activity.message
            }
            
            return activityDetails
          })
          
          setActivities(transformedActivities)
          setError('')
        } else {
          setError('Failed to fetch activities. Please try again.')
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.')
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          navigate('/login')
        } else if (err.response?.status === 403) {
          setError('Access denied. Please login again.')
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          navigate('/login')
        } else {
          setError('Error fetching recent activities. Please try again.')
          console.error('API Error:', err.response?.data || err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [navigate])

  return (
    <div className="fixed right-4 top-20 bg-gradient-to-br from-purple-900/90 to-gray-900/90 rounded-t-xl shadow-lg">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800/50 p-3 rounded-t-xl cursor-pointer hover:bg-gray-700/50"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-purple-400">Recent Activity</h2>
          <svg 
            className={`w-4 h-4 text-purple-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div 
        className={`bg-gradient-to-br from-purple-900/90 to-gray-900/90 rounded-b-xl overflow-y-auto max-h-[calc(100vh-24rem)] transition-all duration-300 ${isOpen ? 'h-auto opacity-100' : 'h-0 opacity-0'} transform ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/90 border border-red-700/90">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-400 text-sm">{error}</p>
                {error.includes('Please login') && (
                  <button 
                    onClick={() => navigate('/login')} 
                    className="mt-2 px-3 py-1.5 bg-red-600/90 text-white rounded-lg text-sm hover:bg-red-700/90 transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activities.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-400">No Recent Activity</h3>
          </div>
        )}

        {activities.length > 0 && (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="bg-gray-700/90 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-600/90 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {getActivityType(activity.type) === ACTIVITY_TYPES.ROOM_CREATE && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        )}
                        {getActivityType(activity.type) === ACTIVITY_TYPES.ROOM_JOIN && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        )}
                        {getActivityType(activity.type) === ACTIVITY_TYPES.ROOM_LEAVE && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        )}
                        {getActivityType(activity.type) === ACTIVITY_TYPES.MESSAGE_POST && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        )}
                        {getActivityType(activity.type) === ACTIVITY_TYPES.ROOM_UPDATE && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        )}
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-purple-400">
                      {getActivityType(activity.type)}
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      {activity.description}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivity
