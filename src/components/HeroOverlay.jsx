import { useEffect, useRef } from 'react'
import { useScene, SCENES } from '../SceneContext'

function useTypewriter(text, speed = 45, delay = 800) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.textContent = ''
    let i = 0
    const timer = setTimeout(() => {
      const id = setInterval(() => {
        if (ref.current) ref.current.textContent = text.slice(0, i + 1)
        i++
        if (i >= text.length) clearInterval(id)
      }, speed)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(timer)
  }, [text, speed, delay])
  return ref
}

function GlitchTitle({ text, accent }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
        fontWeight: 900,
        letterSpacing: '0.08em',
        color: '#fff',
        lineHeight: 1.05,
        textTransform: 'uppercase',
        animation: 'pulseGlow 3s ease-in-out infinite',
        textShadow: `0 0 20px ${accent}, 0 0 60px ${accent}4d`,
        userSelect: 'none',
        transition: 'text-shadow 0.8s',
      }}>
        {text}
      </h1>
      <h1 aria-hidden style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
        fontWeight: 900,
        letterSpacing: '0.08em',
        color: accent,
        lineHeight: 1.05,
        textTransform: 'uppercase',
        position: 'absolute',
        top: 0, left: 0,
        animation: 'glitch-1 6s infinite linear',
        opacity: 0.7,
        userSelect: 'none',
      }}>{text}</h1>
      <h1 aria-hidden style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
        fontWeight: 900,
        letterSpacing: '0.08em',
        color: '#ff00aa',
        lineHeight: 1.05,
        textTransform: 'uppercase',
        position: 'absolute',
        top: 0, left: 0,
        animation: 'glitch-2 6s infinite linear',
        opacity: 0.5,
        userSelect: 'none',
      }}>{text}</h1>
    </div>
  )
}

function StatusBadge({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: color, boxShadow: `0 0 8px ${color}`,
        animation: 'flicker 3s infinite',
      }} />
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        letterSpacing: '0.2em', color: 'rgba(200,216,232,0.5)',
      }}>
        {label}
      </span>
    </div>
  )
}

function CyberButton({ label, accent, primary, href }) {
  const sharedStyle = {
    fontFamily: 'var(--font-mono)', fontSize: '11px',
    letterSpacing: '0.25em', padding: '12px 28px',
    border: `1px solid ${primary ? accent : 'rgba(200,216,232,0.25)'}`,
    background: primary ? `${accent}14` : 'transparent',
    color: primary ? accent : 'rgba(200,216,232,0.6)',
    cursor: 'pointer', position: 'relative',
    transition: 'all 0.2s',
    textDecoration: 'none',
    display: 'inline-block',
    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
  }
  const onEnter = e => {
    e.currentTarget.style.background = `${accent}2a`
    e.currentTarget.style.borderColor = accent
    e.currentTarget.style.color = accent
  }
  const onLeave = e => {
    e.currentTarget.style.background = primary ? `${accent}14` : 'transparent'
    e.currentTarget.style.borderColor = primary ? accent : 'rgba(200,216,232,0.25)'
    e.currentTarget.style.color = primary ? accent : 'rgba(200,216,232,0.6)'
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={sharedStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {label}
    </a>
  )
}

function DataPanel({ accent }) {
  const stats = [
    { label: 'PROJECTS_SHIPPED', value: '24+' },
    { label: 'UNITY_EXPERIENCE', value: '5 YRS' },
    { label: 'SHADERS_WRITTEN', value: '∞' },
    { label: 'COFFEE_CONSUMED', value: 'ZERO' },
  ]
  return (
    <div style={{
      position: 'absolute', right: '40px', bottom: '12vh',
      zIndex: 100, animation: 'fadeUp 1s ease forwards',
      opacity: 0, animationDelay: '0.5s', animationFillMode: 'forwards',
    }}>
      <div style={{
        border: `1px solid ${accent}33`,
        background: 'rgba(3,4,10,0.7)',
        padding: '24px', backdropFilter: 'blur(8px)',
        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        minWidth: '220px',
        transition: 'border-color 0.8s',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          letterSpacing: '0.3em', color: accent, marginBottom: '16px',
          borderBottom: `1px solid ${accent}26`, paddingBottom: '10px',
          transition: 'color 0.8s',
        }}>DATA_STREAM //</div>
        {stats.map(({ label, value }) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', gap: '24px', marginBottom: '12px',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(200,216,232,0.4)' }}>
              {label}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: accent, textShadow: `0 0 8px ${accent}`, transition: 'color 0.8s, text-shadow 0.8s' }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BottomBar() {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-between',
      padding: '12px 40px',
      borderTop: '1px solid rgba(0,245,255,0.08)',
      background: 'linear-gradient(to top, rgba(3,4,10,0.8) 0%, transparent 100%)',
      zIndex: 100,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(200,216,232,0.25)' }}>
        © 2025 // ALL_RIGHTS_RESERVED
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(200,216,232,0.2)' }}>
        THREE.JS + R3F // REACT_18 // VITE_5
      </span>
    </div>
  )
}

export default function HeroOverlay() {
  const { currentScene } = useScene()
  const scene = SCENES[currentScene]
  const accent = scene.accent
  const subtitleRef = useTypewriter(scene.subtitle, 38, 1000)

  return (
    <>
      <div style={{
        position: 'absolute', left: '40px', bottom: '12vh',
        zIndex: 100, maxWidth: '620px',
        animation: 'fadeUp 1s ease forwards',
        opacity: 0, animationDelay: '0.2s', animationFillMode: 'forwards',
      }}>
        {/* Status row */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
          <StatusBadge color="#39ff14" label="SYSTEM_ONLINE" />
          <StatusBadge color={accent}  label="UNITY_6  //  URP_17" />
          <StatusBadge color="#ff00aa" label="BENGALURU // IND" />
        </div>

        <GlitchTitle text="ARGHO DAS" accent={accent} />

        {/* Subtitle typewriter */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          letterSpacing: '0.22em', color: `${accent}b3`,
          marginTop: '14px', minHeight: '18px',
          transition: 'color 0.8s',
        }}>
          <span ref={subtitleRef} />
          <span style={{ animation: 'blink 1s infinite', color: accent }}>_</span>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '1.05rem',
          fontWeight: 300, color: 'rgba(200,216,232,0.65)',
          marginTop: '18px', lineHeight: 1.7, maxWidth: '480px',
          letterSpacing: '0.04em',
        }}>
          Building real-time worlds at the intersection of<br />
          <span style={{ color: accent, fontWeight: 600, transition: 'color 0.8s' }}>rendering performance</span>{' '}
          and <span style={{ color: 'var(--magenta)', fontWeight: 600 }}>visual craft.</span>
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <CyberButton
            primary
            accent={accent}
            label="PORTFOLIO"
            href="https://portfolio.arghorithm.com/"
          />
          <CyberButton
            accent={accent}
            label="GITHUB"
            href="https://github.com/LDL-291"
          />
        </div>
      </div>

      <DataPanel accent={accent} />
      <BottomBar />
    </>
  )
}
