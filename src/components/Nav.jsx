import { useState, useEffect } from 'react'
import { useScene, SCENES } from '../SceneContext'
import { useIsMobile } from '../hooks/useIsMobile'

const links = ['WORK', 'SKILLS', 'ABOUT', 'CONTACT']

function HamburgerButton({ open, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40,
        background: open ? `${accent}18` : 'transparent',
        border: `1px solid ${accent}55`,
        color: accent,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '5px',
        padding: '8px',
        transition: 'all 0.2s',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {open ? (
        <span style={{
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1,
          textShadow: `0 0 8px ${accent}`,
        }}>✕</span>
      ) : (
        <>
          <div style={{ width: '18px', height: '1.5px', background: accent, boxShadow: `0 0 4px ${accent}`, transition: 'all 0.2s' }} />
          <div style={{ width: '12px', height: '1.5px', background: accent, boxShadow: `0 0 4px ${accent}`, transition: 'all 0.2s' }} />
          <div style={{ width: '18px', height: '1.5px', background: accent, boxShadow: `0 0 4px ${accent}`, transition: 'all 0.2s' }} />
        </>
      )}
    </button>
  )
}

export default function Nav() {
  const { currentScene } = useScene()
  const scene = SCENES[currentScene]
  const accent = scene.accent
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toTimeString().slice(0, 8))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Close menu when scene changes
  useEffect(() => { setMenuOpen(false) }, [currentScene])

  return (
    <>
      <nav style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 20px' : '20px 40px',
        zIndex: 200,
        borderBottom: `1px solid ${menuOpen ? accent + '33' : accent + '1a'}`,
        background: isMobile && menuOpen
          ? 'rgba(3,4,10,0.97)'
          : 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
        transition: 'border-color 0.3s, background 0.3s',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: isMobile ? '11px' : '13px',
          letterSpacing: isMobile ? '0.15em' : '0.3em',
          color: accent,
          textShadow: `0 0 12px ${accent}`,
          animation: 'flicker 8s infinite',
          transition: 'color 0.8s, text-shadow 0.8s',
          maxWidth: isMobile ? '180px' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {scene.logo}
        </div>

        {/* Desktop: center nav links */}
        {!isMobile && (
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
        )}

        {/* Desktop: clock | Mobile: hamburger */}
        {isMobile ? (
          <HamburgerButton open={menuOpen} onClick={() => setMenuOpen(v => !v)} accent={accent} />
        ) : (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: `${accent}80`,
            letterSpacing: '0.15em',
            transition: 'color 0.8s',
          }}>
            {time} UTC+5:30
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          top: menuOpen ? '64px' : '0px',
          left: 0, right: 0,
          background: 'rgba(3,4,10,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${accent}33`,
          zIndex: 190,
          overflow: 'hidden',
          maxHeight: menuOpen ? '320px' : '0px',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), top 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: menuOpen ? 'all' : 'none',
        }}>
          <div style={{ padding: '8px 20px 20px' }}>
            {links.map((link, i) => (
              <a
                key={link}
                href="#"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  letterSpacing: '0.3em',
                  color: 'rgba(200,216,232,0.75)',
                  padding: '14px 0',
                  borderBottom: i < links.length - 1 ? `1px solid rgba(200,216,232,0.06)` : 'none',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onTouchStart={e => { e.currentTarget.style.color = accent }}
                onTouchEnd={e => { e.currentTarget.style.color = 'rgba(200,216,232,0.75)' }}
              >
                <span style={{ color: accent, opacity: 0.5, fontSize: '9px' }}>{'0' + (i + 1)}</span>
                {link}
              </a>
            ))}

            {/* Clock inside mobile menu */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: `${accent}55`,
              letterSpacing: '0.15em',
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: `1px solid ${accent}18`,
            }}>
              {time} UTC+5:30
            </div>
          </div>
        </div>
      )}

      {/* Tap-outside backdrop */}
      {isMobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'absolute', inset: 0,
            zIndex: 180,
            background: 'transparent',
          }}
        />
      )}
    </>
  )
}
