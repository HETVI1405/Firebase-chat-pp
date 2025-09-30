import React from 'react'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'
import ProfilePanel from './ProfilePanel'
import { useSelector } from 'react-redux'

export default function ChatLayout(){
  const sel = useSelector(s=>s.chat.selectedUser)
  return (
    <div className="app-grid">
      <Sidebar />
      <ChatWindow />
      <ProfilePanel user={sel} />
    </div>
  )
}