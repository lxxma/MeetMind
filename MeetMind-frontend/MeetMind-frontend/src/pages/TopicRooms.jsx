import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import RoomCard from '../components/RoomCard';

function TopicRooms() {
  const { id } = useParams();
  const [rooms, setRooms] = useState([]);
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // First try to get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Then fetch fresh data from API
    const fetchTopic = async () => {
      const access = localStorage.getItem('access');
      const refresh = localStorage.getItem('refresh');
      
      if (!access || !refresh) {
        setError('Not authenticated. Please login first.');
        return;
      }

      try {
        // Get current user data using the token
        const userResponse = await axios.get('http://127.0.0.1:8000/api/users/me/', {
          headers: { 
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.status !== 200) {
          throw new Error(`API returned status ${userResponse.status}`);
        }

        const userData = userResponse.data;
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid response data');
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        // Fetch topic
        const topicResponse = await axios.get(`http://127.0.0.1:8000/api/topics/${id}/`, {
          headers: {
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'application/json'
          }
        });

        if (topicResponse.status !== 200) {
          throw new Error(`API returned status ${topicResponse.status}`);
        }

        setTopic(topicResponse.data);

        // Fetch rooms separately
        const roomsResponse = await axios.get(`http://127.0.0.1:8000/api/rooms/?topic=${id}`, {
          headers: {
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'application/json'
          }
        });

        if (roomsResponse.status !== 200) {
          throw new Error(`API returned status ${roomsResponse.status}`);
        }
        
        const roomsData = Array.isArray(roomsResponse.data) ? roomsResponse.data : [];
        const validRooms = roomsData.filter(room => 
          room && 
          room.id && 
          typeof room.id === 'number' && 
          Array.isArray(room.participants)
        );
        
        // Store room data in localStorage
        localStorage.setItem('rooms', JSON.stringify(validRooms));
        
        // Store user data
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          setUser(parsedUser);
          console.log('Set user data:', parsedUser);
        } else {
          console.error('No user data found in localStorage');
        }
        
        setRooms(validRooms);
        setLoading(false);
      } catch (err) {
        // If we get a 401 (unauthorized) error, try to refresh the token
        if (err.response?.status === 401) {
          try {
            const refreshResponse = await axios.post(
              'http://127.0.0.1:8000/api/token/refresh/',
              { refresh: refresh },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (refreshResponse.status === 200) {
              localStorage.setItem('access', refreshResponse.data.access);
              
              // Retry the original request with the new token
              return fetchTopic();
            }
          } catch (refreshErr) {
            setError('Failed to refresh token. Please login again.');
            console.error('Token refresh failed:', refreshErr);
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return;
          }
        }
        
        console.error('Topic fetch error:', err);
        setError('Error fetching topic details: ' + (err.response?.data?.detail || err.message));
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

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

      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-purple-400 mb-4">{topic?.name}</h1>
          <p className="text-gray-400">{topic?.description}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="bg-gray-800/50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-purple-400 mb-4">
                    No Rooms Found
                  </h3>
                  <p className="text-gray-400">
                    Be the first to create a room in this topic!
                  </p>
                  <Link
                    to="/create-room"
                    className="mt-4 inline-flex items-center px-6 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 transition-colors"
                  >
                    Create Room
                  </Link>
                </div>
              </div>
            ) : (
              rooms.map((room) => (
                <RoomCard key={room.id} room={room} user={user} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicRooms;
