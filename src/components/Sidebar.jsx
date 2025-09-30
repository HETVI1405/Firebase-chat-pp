import React, { useEffect } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useDispatch, useSelector } from 'react-redux'
import { setUsers } from '../store/slices/usersSlice'
import { setSelectedUser } from '../store/slices/chatSlice'
import { useAuthState } from '../hooks/useAuthState'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const dispatch = useDispatch()
  const users = useSelector(s => s.users.list)
  const { user } = useAuthState()
  const navigate = useNavigate()

  useEffect(() => {
    const q = query(collection(db, 'users'))
    const unsub = onSnapshot(q, snap => {
      const arr = []
      snap.forEach(doc => arr.push(doc.data()))
      dispatch(setUsers(arr.filter(u => u.uid !== (user && user.uid))))
    })
    return () => unsub()
  }, [dispatch, user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/auth') 
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

  return (
    <div className="sidebar">
      <h3>Users</h3>
      <div className="user-list">
        {users.map(u => (
          <div
            key={u.uid}
            className="user-row"
            onClick={() => dispatch(setSelectedUser(u))}
          >
            <div className="avatar">
              {u.displayName ? u.displayName[0].toUpperCase() : u.email[0]}
            </div>
            <div>
              <div className="u-email">{u.email}</div>
              <div className="u-last">
                Last seen:{" "}
                {u.lastSeen
                  ? new Date(u.lastSeen.seconds * 1000).toLocaleString()
                  : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Logout button */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}
