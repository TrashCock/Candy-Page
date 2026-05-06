import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import CyberpunkGrid from './CyberpunkGrid'
import FloatingGeometry from './FloatingGeometry'
import ParticleField from './ParticleField'

export default function Scene() {
  return (
    <>
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.05} color="#000820" />
      <pointLight position={[0, 6, 0]} intensity={3} color="#00f5ff" distance={20} decay={2} />
      <pointLight position={[-8, 2, -4]} intensity={2} color="#ff00aa" distance={15} decay={2} />
      <pointLight position={[8, 2, -4]} intensity={1.5} color="#39ff14" distance={12} decay={2} />
      <spotLight
        position={[0, 10, 5]}
        angle={0.4}
        penumbra={1}
        intensity={5}
        color="#00f5ff"
        castShadow
      />

      {/* Background stars */}
      <Stars radius={80} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

      {/* The grid floor */}
      <CyberpunkGrid />

      {/* Floating 3D objects */}
      <FloatingGeometry />

      {/* Particle field */}
      <ParticleField />

      {/* Fog for depth */}
    </>
  )
}
