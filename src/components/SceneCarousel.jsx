import { useEffect } from 'react'
import { useScene, SCENES } from '../SceneContext'

const AUTO_ADVANCE_MS = 15000

function NavArrow({ dir, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      title={dir === 'left' ? 'Previous' : 'Next'}
      style={{
        width: '26px', height: '26px',
        border: `1px solid ${accent}55`,
        background: 'transparent',
        color: accent,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '9px',
        fontFamily: 'var(--font-mono)',
        transition: 'all 0.2s',
        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
        flexShrink: 0,
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

  // Auto-advance — setTimeout resets naturally on every scene change
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
      bottom: '28px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      userSelect: 'none',
    }}>

      {/* Auto-advance progress bar — CSS animation resets on scene change via key */}
      <div style={{
        width: '120px', height: '1.5px',
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

      {/* Scene label */}
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

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <NavArrow dir="left" accent={accent} onClick={prev} />

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => switchScene(i)}
              title={s.label}
              style={{
                width: i === currentScene ? '22px' : '6px',
                height: '6px',
                borderRadius: '3px',
                border: 'none',
                background: i === currentScene ? accent : 'rgba(255,255,255,0.18)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: i === currentScene ? `0 0 10px ${accent}` : 'none',
              }}
            />
          ))}
        </div>

        <NavArrow dir="right" accent={accent} onClick={next} />
      </div>
    </div>
  )
}
