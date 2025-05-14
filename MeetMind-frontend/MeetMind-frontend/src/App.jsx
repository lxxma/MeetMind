import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import SignUp from "./pages/SignUp"
import CreateRoom from "./pages/CreateRoom"
import EditRoom from "./pages/EditRoom"
import ExploreTopics from "./pages/ExploreTopics"
import StudyRooms from './pages/StudyRooms'
import TopicRooms from './pages/TopicRooms'
import StudyRoom from './pages/StudyRoom'
import RecentActivity from './pages/RecentActivity'
import LandingPage from "./pages/LandingPage"
import './index.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/explore-topics" element={<ExploreTopics />} />
        <Route path="/topics/:id" element={<TopicRooms />} />
        <Route path="/rooms/:roomId" element={<StudyRoom />} />
        <Route path="/rooms/:roomId/edit" element={<EditRoom />} />
        <Route path="/profile" element={
          <div className="relative">
            <Profile />
            <RecentActivity />
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
