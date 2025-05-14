import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'



function ExploreTopics() {
  const [topics, setTopics] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTopics, setFilteredTopics] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTopics = async () => {
      const token = localStorage.getItem('access')
      if (!token) {
        console.log('No token found')
        return
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/topics/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setTopics(response.data)
        setFilteredTopics(response.data)
      } catch (error) {
        console.error('Error fetching topics:', error)
      }
    }

    fetchTopics()
  }, [])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    const filtered = topics.filter((topic) =>
      topic.name.toLowerCase().includes(e.target.value.toLowerCase())
    )
    setFilteredTopics(filtered)
  }

  const handleTopicClick = (topic) => {
    navigate(`/topics/${topic.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/90 to-gray-900/90">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-purple-400 mb-8">Explore Topics</h2>
          
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search for topics..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 bg-gray-800/50 rounded-lg text-gray-400 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">No topics found</p>
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div 
                  key={topic.id} 
                  onClick={() => handleTopicClick(topic)} 
                  className="bg-gray-800/50 rounded-2xl p-6 cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <h3 className="text-2xl font-bold text-purple-400 mb-2">{topic.name}</h3>
                  <p className="text-gray-400">Click to join!</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExploreTopics
