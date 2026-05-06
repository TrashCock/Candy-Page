import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleField({ count = 600 }) {
  const ref = useRef()

  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors    = new Float32Array(count * 3)
    const speeds    = new Float32Array(count)

    const palette = [
      new THREE.Color('#00f5ff'),
      new THREE.Color('#ff00aa'),
      new THREE.Color('#39ff14'),
      new THREE.Color('#ffe600'),
    ]

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = Math.random() * 8 - 1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      speeds[i] = 0.02 + Math.random() * 0.06
    }
    return { positions, colors, speeds }
  }, [count])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.1
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -1
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
