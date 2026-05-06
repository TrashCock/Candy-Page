import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Individual wireframe ring
function Ring({ position, color, speed = 1, rotAxis = [1, 0, 0] }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed
    ref.current.rotation.x = rotAxis[0] * t
    ref.current.rotation.y = rotAxis[1] * t
    ref.current.rotation.z = rotAxis[2] * t
  })
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.9, 0.03, 8, 48]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

// Glowing core orb
function CoreOrb() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.rotation.y = t * 0.3
    ref.current.rotation.x = t * 0.15
  })
  return (
    <Float speed={1.5} floatIntensity={0.4} floatingRange={[-0.1, 0.1]}>
      <group ref={ref} position={[0, 1.2, 0]}>
        {/* Core */}
        <mesh>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color="#001a22"
            emissive="#00f5ff"
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.9}
            wireframe={false}
          />
        </mesh>
        {/* Wireframe shell */}
        <mesh scale={1.08}>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshBasicMaterial color="#00f5ff" wireframe />
        </mesh>
        {/* Orbiting rings */}
        <Ring position={[0, 0, 0]} color="#00f5ff" speed={0.6} rotAxis={[1, 0.2, 0]} />
        <Ring position={[0, 0, 0]} color="#ff00aa" speed={0.45} rotAxis={[0.3, 1, 0.1]} />
        <Ring position={[0, 0, 0]} color="#39ff14" speed={0.3} rotAxis={[0.1, 0.2, 1]} />
      </group>
    </Float>
  )
}

// Side floating cubes
function SideObject({ position, color, shape = 'box', speed = 0.4 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed
    ref.current.rotation.x = t
    ref.current.rotation.y = t * 1.3
  })

  const geo = shape === 'box'
    ? <boxGeometry args={[0.45, 0.45, 0.45]} />
    : shape === 'octa'
    ? <octahedronGeometry args={[0.38]} />
    : <tetrahedronGeometry args={[0.42]} />

  return (
    <Float speed={2} floatIntensity={0.6} floatingRange={[-0.25, 0.25]}>
      <group position={position}>
        <mesh ref={ref}>
          {geo}
          <meshStandardMaterial
            color="#000d14"
            emissive={color}
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Wireframe overlay */}
        <mesh ref={ref} scale={1.05}>
          {geo}
          <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
        </mesh>
      </group>
    </Float>
  )
}

// Horizontal scan bar
function ScanBar() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.3) % 1
    ref.current.position.z = THREE.MathUtils.lerp(5, -12, t)
    ref.current.material.opacity = t < 0.05 || t > 0.92 ? 0 : 0.15
  })
  return (
    <mesh ref={ref} position={[0, -1.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 0.5]} />
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.15} depthWrite={false} />
    </mesh>
  )
}

export default function FloatingGeometry() {
  return (
    <group>
      <CoreOrb />
      <SideObject position={[-4.5, 0.8, -2]} color="#ff00aa" shape="octa" speed={0.5} />
      <SideObject position={[4.5, 0.6, -2]}  color="#39ff14" shape="box"  speed={0.35} />
      <SideObject position={[-3,   1.4, -5]} color="#00f5ff" shape="tetra" speed={0.55} />
      <SideObject position={[3.2,  1.2, -5]} color="#ffe600" shape="octa"  speed={0.42} />
      <SideObject position={[-6,   0.4, -8]} color="#ff00aa" shape="box"   speed={0.28} />
      <SideObject position={[6,    0.6, -8]} color="#00f5ff" shape="tetra" speed={0.38} />
      <ScanBar />
    </group>
  )
}
