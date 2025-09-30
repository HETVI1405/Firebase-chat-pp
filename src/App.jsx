import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth'
import ChatLayout from './components/ChatLayout'

import { useAuthState } from './hooks/useAuthState'

export default function App(){
  const { user, loading } = useAuthState()
  if(loading) return <div className="center">Loading...</div>
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path='/' element={user ? <ChatLayout /> : <Navigate to="/auth" />} />

    </Routes>
  )
}