import { useEffect } from 'react'
import { useScene, SCENES } from '../SceneContext'
import { useIsMobile } from '../hooks/useIsMobile'

const AUTO_ADVANCE_MS = 15000

function NavArrow({ dir, accent, onClick, isMobile }) {
  const size = isMobile ? '44px' : '26px'
  return (
    <button
      onClick={onClick}
      title={dir === 'left' ? 'Previous' : 'Next'}
      style={{
        width: size, height: size,
        border: `1px solid ${accent}55`,
        background: 'transparent',
        color: accent,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isMobile ? '12px' : '9px',
        fontFamily: 'var(--font-mono)',
        transition: 'all 0.2s',
        clipPath: isMobile
          ? 'none'
          : 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
        borderRadius: isMobile ? '4px' : '0',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${accent}18`
        e.currentTarget.style.borderColor = accent
        e.currentTarget.style.boxShadow = `0 0 8px ${accent}44`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = `${accent}55`
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {dir === 'left' ? '◀' : '▶'}
    </button>
  )
}

export default function SceneCarousel() {
  const { currentScene, switchScene } = useScene()
  const scene = SCENES[currentScene]
  const accent = scene.accent
  const isMobile = useIsMobile()

  useEffect(() => {
    const id = setTimeout(() => {
      switchScene((currentScene + 1) % SCENES.length)
    }, AUTO_ADVANCE_MS)
    return () => clearTimeout(id)
  }, [currentScene]) // eslint-disable-line react-hooks/exhaustive-deps

  const prev = () => switchScene((currentScene - 1 + SCENES.length) % SCENES.length)
  const next = () => switchScene((currentScene + 1) % SCENES.length)

  return (
    <div style={{
      position: 'absolute',
      bottom: isMobile ? '36px' : '28px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: isMobile ? '8px' : '10px',
      userSelect: 'none',
    }}>

      {/* Auto-advance progress bar */}
      <div style={{
        width: isMobile ? '80px' : '120px',
        height: '1.5px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '1px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div
          key={`progress-${currentScene}`}
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: '100%',
            background: accent,
            boxShadow: `0 0 4px ${accent}`,
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
            animation: `autoProgress ${AUTO_ADVANCE_MS}ms linear forwards`,
            transition: 'background 0.8s, box-shadow 0.8s',
          }}
        />
      </div>

      {/* Scene label — hidden on mobile (shown in Nav instead) */}
      {!isMobile && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.35em',
          color: accent,
          textShadow: `0 0 12px ${accent}`,
          transition: 'color 0.5s, text-shadow 0.5s',
        }}>
          [{scene.label}]
        </div>
      )}

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '12px' }}>
        <NavArrow dir="left" accent={accent} onClick={prev} isMobile={isMobile} />

        <div style={{ display: 'flex', gap: isMobile ? '8px' : '6px', alignItems: 'center' }}>
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => switchScene(i)}
              title={s.label}
              style={{
                width: i === currentScene ? (isMobile ? '28px' : '22px') : (isMobile ? '8px' : '6px'),
                height: isMobile ? '8px' : '6px',
                borderRadius: '4px',
                border: 'none',
                background: i === currentScene ? accent : 'rgba(255,255,255,0.18)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: i === currentScene ? `0 0 10px ${accent}` : 'none',
                WebkitTapHighlightColor: 'transparent',
                // Larger invisible tap area on mobile via padding
                ...(isMobile ? { margin: '8px 2px' } : {}),
              }}
            />
          ))}
        </div>

        <NavArrow dir="right" accent={accent} onClick={next} isMobile={isMobile} />
      </div>
    </div>
  )
}
