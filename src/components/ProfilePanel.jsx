import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProfilePanel({ user }){
  const navigate = useNavigate()
  if(!user) return <div className="profile-panel center">No user selected</div>
  return (
    <div className="profile-panel">
      <div className="avatar-large">{user.displayName ? user.displayName[0] : user.email[0]}</div>
      <h3>{user.displayName || user.email}</h3>
      <p>{user.email}</p>
      <p>Last seen: {user.lastSeen ? new Date(user.lastSeen.seconds*1000).toLocaleString() : '—'}</p>
    
    </div>
  )
}