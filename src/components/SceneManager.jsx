import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, ChromaticAberration, Bloom } from '@react-three/postprocessing'
import { useScene, SCENES } from '../SceneContext'
import Scene from './Scene'
import SynthwaveScene from './SynthwaveScene'
import AquariumScene from './AquariumScene'

// Per-scene fog config — centralized since all scenes are always mounted
const FOGS = [
  { color: '#03040a', near: 12, far: 35 },
  { color: '#0d0015', near: 16, far: 40 },
  { color: '#001528', near: 15, far: 32 },
]

// Sets scene.fog directly so only one fog is ever active
function FogController() {
  const { scene } = useThree()
  const { currentScene } = useScene()
  useEffect(() => {
    const f = FOGS[currentScene]
    scene.fog = new THREE.Fog(f.color, f.near, f.far)
  }, [currentScene, scene])
  return null
}

// Camera lerp runs inside R3F's own frame loop — no competing RAF
function CameraRig() {
  const { camera } = useThree()
  const { currentScene } = useScene()
  const targetPos = useRef(new THREE.Vector3(0, 2.5, 9))
  const targetFov = useRef(60)

  useEffect(() => {
    const cfg = SCENES[currentScene].camera
    targetPos.current.set(...cfg.pos)
    targetFov.current = cfg.fov
  }, [currentScene])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.05)
    if (Math.abs(camera.fov - targetFov.current) > 0.05) {
      camera.fov += (targetFov.current - camera.fov) * 0.06
      camera.updateProjectionMatrix()
    }
  })

  return null
}

function PostFX() {
  const { currentScene } = useScene()
  const isSynthwave = currentScene === 1
  return (
    <EffectComposer>
      <ChromaticAberration
        offset={isSynthwave ? [0.005, 0.003] : [0.0008, 0.0004]}
      />
      <Bloom
        intensity={isSynthwave ? 1.5 : 0.22}
        luminanceThreshold={isSynthwave ? 0.22 : 0.55}
        luminanceSmoothing={0.65}
      />
    </EffectComposer>
  )
}

export default function SceneManager() {
  const { currentScene } = useScene()
  return (
    <>
      <FogController />
      <CameraRig />

      {/*
        All 3 scenes are ALWAYS mounted — shaders compile on first render,
        so switching is instant with no recompile black frame.
        group.visible=false propagates to all children incl. lights.
      */}
      <group visible={currentScene === 0}><Scene /></group>
      <group visible={currentScene === 1}><SynthwaveScene /></group>
      <group visible={currentScene === 2}><AquariumScene /></group>

      <PostFX />
    </>
  )
}
