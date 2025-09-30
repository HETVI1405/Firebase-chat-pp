import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import './Auth.css'


// ================= GlowCard Component =================
const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 }
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
}

function GlowCard({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false
}) {
  const cardRef = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const syncPointer = (e) => {
      const { clientX: x, clientY: y } = e
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2))
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2))
        cardRef.current.style.setProperty('--y', y.toFixed(2))
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2))
      }
    }
    document.addEventListener('pointermove', syncPointer)
    return () => document.removeEventListener('pointermove', syncPointer)
  }, [])

  const { base, spread } = glowColorMap[glowColor]
  const getSizeClasses = () => (customSize ? '' : sizeMap[size])

  const getInlineStyles = () => {
    const baseStyles = {
      '--base': base,
      '--spread': spread,
      '--radius': '14',
      '--border': '3',
      '--backdrop': 'hsl(0 0% 60% / 0.12)',
      '--backup-border': 'var(--backdrop)',
      '--size': '200',
      '--outer': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) 100% 70% / 0.1), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'fixed',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
      touchAction: 'none'
    }

    if (width !== undefined) baseStyles.width = typeof width === 'number' ? `${width}px` : width
    if (height !== undefined) baseStyles.height = typeof height === 'number' ? `${height}px` : height

    return baseStyles
  }

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      -webkit-mask-clip: padding-box, border-box;
      -webkit-mask-composite: destination-in;
    }
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) 100% 50% / 1), transparent 100%
      );
      filter: brightness(2);
    }
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / 1), transparent 100%
      );
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4]' : ''}
          rounded-2xl relative grid grid-rows-[1fr_auto] 
          shadow-[0_1rem_2rem_-1rem_black] p-4 gap-4 
          backdrop-blur-[5px] ${className}
        `}
      >
        <div ref={innerRef} data-glow></div>
        {children}
      </div>
    </>
  )
}

// ================= Auth Component =================
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const navigate = useNavigate()

  // signup
  async function handleSignup(e) {
    e.preventDefault()
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName,
      lastSeen: serverTimestamp()
    })
    navigate('/')
  }

  // login
  async function handleLogin(e) {
    e.preventDefault()
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || '',
      lastSeen: serverTimestamp()
    }, { merge: true })
    navigate('/')
  }

  // google login
  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL || '',
      lastSeen: serverTimestamp()
    }, { merge: true })
    navigate('/')
  }

  return (
    <div className="auth-page flex items-center justify-center min-h-screen bg-gray-900">
      <GlowCard glowColor="purple" size="lg" className="max-w-md w-full">
        <div className="auth-box flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-4" style={{color:"white"}}>
  {isLogin ? 'Sign In' : 'Sign Up'}
</h2>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="flex flex-col gap-3 w-full"  style={{color:"white"}}>
            {!isLogin && (
              <input
                className="p-2 rounded bg-gray-800 text-white"
                placeholder="Display name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            )}
            <input
              className="p-2 rounded bg-gray-800 text-white"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="p-2 rounded bg-gray-800 text-white"
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            onClick={handleGoogleLogin}
            className="google-btn bg-red-500 hover:bg-red-600 text-white py-2 px-4 mt-3 rounded"
          >
            Continue with Google
          </button>

          <p
            onClick={() => setIsLogin(!isLogin)}
            className="link text-sm text-purple-300 mt-3 cursor-pointer"
          >
            {isLogin ? 'Create an account' : 'Have an account? Sign in'}
          </p>
        </div>
      </GlowCard>
    </div>
  )
}
