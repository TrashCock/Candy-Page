import { Suspense, useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { SceneContext, SCENES } from './SceneContext'
import SceneManager from './components/SceneManager'
import HeroOverlay from './components/HeroOverlay'
import Nav from './components/Nav'
import SceneCarousel from './components/SceneCarousel'

export default function App() {
  const [currentScene, setCurrentScene] = useState(0)
  const [flashOpacity, setFlashOpacity] = useState(0)
  const flashRef = useRef(null)

  const doSwitch = useCallback((next) => {
    // Accent-color wash instead of black — blends scenes visually
    setFlashOpacity(0.28)
    clearTimeout(flashRef.current)
    flashRef.current = setTimeout(() => setFlashOpacity(0), 220)
    setCurrentScene(next)
  }, [])

  const switchScene = useCallback((next) => {
    if (next === currentScene) return
    doSwitch(next)
  }, [currentScene, doSwitch])

  const scene = SCENES[currentScene]

  return (
    <SceneContext.Provider value={{ currentScene, switchScene }}>
      <div style={{
        width: '100vw', height: '100vh',
        position: 'relative',
        background: scene.bg,
        transition: 'background 0.6s ease',
        overflow: 'hidden',
      }}>

        {/*
          Accent color wash overlay — flash in on switch, fade out fast.
          mixBlendMode 'screen' tints bright pixels with the scene accent
          while keeping darks dark. Never goes full black.
        */}
        <div style={{
          position: 'absolute', inset: 0,
          background: scene.accent,
          opacity: flashOpacity,
          transition: flashOpacity > 0 ? 'none' : 'opacity 0.22s ease-out',
          pointerEvents: 'none',
          zIndex: 300,
          mixBlendMode: 'screen',
        }} />

        {/* CRT scanlines — synthwave only */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.13) 2px, rgba(0,0,0,0.13) 4px)',
          pointerEvents: 'none',
          zIndex: 160,
          opacity: currentScene === 1 ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }} />

        {/* Aquarium vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,10,30,0.7) 100%)',
          pointerEvents: 'none',
          zIndex: 155,
          opacity: currentScene === 2 ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }} />

        {/* Single Canvas — never remounts */}
        <Canvas
          style={{ position: 'absolute', inset: 0 }}
          camera={{ position: [0, 2.5, 9], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <SceneManager />
            <Preload all />
          </Suspense>
        </Canvas>

        <Nav />
        <HeroOverlay />
        <SceneCarousel />
      </div>
    </SceneContext.Provider>
  )
}
