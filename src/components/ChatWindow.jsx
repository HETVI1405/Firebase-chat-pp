import React, { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { useAuthState } from "../hooks/useAuthState"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "../firebase"

export default function ChatWindow() {
  const { user } = useAuthState()
  const sel = useSelector((s) => s.chat.selectedUser)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState("")
  const inputRef = useRef()

  // ✅ Fetch messages real-time
  useEffect(() => {
    if (!user || !sel) return setMsgs([])

    const chatId = [user.uid, sel.uid].sort().join("_")
    console.log("Listening for chatId:", chatId)

    // 🔑 First try simple query (safe)
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId)
      // orderBy hata diya test ke liye
    )

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        console.log("No messages found for chatId:", chatId)
      } else {
        console.log(
          "Messages fetched:",
          snap.docs.map((d) => d.data())
        )
      }
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setMsgs(arr)
    })

    return () => unsub()
  }, [user, sel])

  // ✅ Send message
  async function sendMessage(e) {
    e && e.preventDefault()
    if (!text.trim() || !user || !sel) return

    const chatId = [user.uid, sel.uid].sort().join("_")

    await addDoc(collection(db, "messages"), {
      text,
      from: user.uid,
      to: sel.uid,
      chatId,
      createdAt: serverTimestamp(),
    })

    setText("")
    inputRef.current.focus()
  }

  // ✅ Delete message
  async function removeMessage(id) {
    await deleteDoc(doc(db, "messages", id))
  }

  // ✅ Edit message
  async function editMessage(id, oldText) {
    const newText = prompt("Edit message", oldText)
    if (!newText || newText === oldText) return
    await updateDoc(doc(db, "messages", id), { text: newText })
  }

  if (!sel) return <div className="center">Select a user to start chat</div>

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <h3>{sel.displayName || sel.email}</h3>
      </div>

      {/* Messages */}
      <div className="messages">
        {msgs.map((m) => {
          const time = m.createdAt?.seconds
            ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString()
            : "sending..."

          return (
            <div
              key={m.id}
              className={"message " + (m.from === user.uid ? "me" : "them")}
            >
              <div className="m-text">{m.text}</div>
              <div className="m-meta">
                <span>{time}</span>
                {m.from === user.uid && (
                  <>
                    <button
                      onClick={() => editMessage(m.id, m.text)}
                      className="tiny"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeMessage(m.id)}
                      className="tiny danger"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Composer */}
      <form onSubmit={sendMessage} className="composer">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
