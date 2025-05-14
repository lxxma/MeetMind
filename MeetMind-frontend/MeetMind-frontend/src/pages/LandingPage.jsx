import React from 'react'
import { Link } from 'react-router-dom'



function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800">
      <div className="min-h-screen flex items-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-12">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-purple-400 mb-6">
                Welcome to MeetMind
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                A platform where you can create and join study rooms to collaborate with others.
                Discuss, share ideas, and learn together in a comfortable environment.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600/90 hover:bg-purple-700/90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-8 py-3 border border-purple-600 text-base font-medium rounded-md text-purple-400 bg-transparent hover:bg-purple-800/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
