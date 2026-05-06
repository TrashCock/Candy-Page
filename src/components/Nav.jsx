import { useState, useEffect } from 'react'
import { useScene, SCENES } from '../SceneContext'

const links = ['WORK', 'SKILLS', 'ABOUT', 'CONTACT']

export default function Nav() {
  const { currentScene } = useScene()
  const scene = SCENES[currentScene]
  const accent = scene.accent

  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toTimeString().slice(0, 8))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <nav style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 40px',
      zIndex: 100,
      borderBottom: `1px solid ${accent}1a`,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
      transition: 'border-color 0.8s ease',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '13px',
        letterSpacing: '0.3em',
        color: accent,
        textShadow: `0 0 12px ${accent}`,
        animation: 'flicker 8s infinite',
        transition: 'color 0.8s, text-shadow 0.8s',
      }}>
        {scene.logo}
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '36px' }}>
        {links.map((link) => (
          <a key={link} href="#" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'rgba(200,216,232,0.6)',
            textDecoration: 'none',
            transition: 'color 0.2s, text-shadow 0.2s',
          }}
          onMouseEnter={e => { e.target.style.color = accent; e.target.style.textShadow = `0 0 8px ${accent}` }}
          onMouseLeave={e => { e.target.style.color = 'rgba(200,216,232,0.6)'; e.target.style.textShadow = 'none' }}
          >
            {link}
          </a>
        ))}
      </div>

      {/* Clock */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: `${accent}80`,
        letterSpacing: '0.15em',
        transition: 'color 0.8s',
      }}>
        {time} UTC+5:30
      </div>
    </nav>
  )
}
