import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Shaders ─────────────────────────────────────────────────────────────────

const uvVert = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

// Animated caustics on sand floor
const causticFrag = `
  uniform float uTime;
  varying vec2 vUv;

  float caustic(vec2 uv, float t, float scale, float speed) {
    vec2 p = abs(fract(uv * scale + vec2(t * speed, t * speed * 0.7)) * 2.0 - 1.0);
    float v = abs(p.x - p.y);
    p = abs(fract(uv * scale * 0.7 - vec2(t * speed * 0.5, t * speed * 0.8)) * 2.0 - 1.0);
    v += abs(p.x + p.y) * 0.6;
    return clamp(1.0 - v * 1.7, 0.0, 1.0);
  }

  void main() {
    float c1 = caustic(vUv, uTime, 2.2, 0.18);
    float c2 = caustic(vUv, uTime, 1.5, 0.12) * 0.5;
    float c  = c1 * 0.7 + c2 * 0.3;

    vec3 sandColor    = vec3(0.76, 0.64, 0.36);
    vec3 causticColor = vec3(0.55, 0.90, 1.00);

    // Distance fade from edges
    float edgeFade = min(
      min(vUv.x, 1.0 - vUv.x),
      min(vUv.y, 1.0 - vUv.y)
    ) * 4.0;
    edgeFade = clamp(edgeFade, 0.0, 1.0);

    vec3 col = sandColor + causticColor * c * 0.45 * edgeFade;
    gl_FragColor = vec4(col, 1.0);
  }
`

// Water surface shimmer
const waterFrag = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float w = sin(vUv.x * 12.0 + uTime * 2.0) * 0.5 + 0.5;
    w *= sin(vUv.y * 8.0 - uTime * 1.5) * 0.5 + 0.5;
    float alpha = w * 0.07 + 0.02;
    gl_FragColor = vec4(0.2, 0.7, 1.0, alpha);
  }
`

// ─── Sub-components ───────────────────────────────────────────────────────────

function SandFloor() {
  const matRef = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]}>
      <planeGeometry args={[22, 18, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={uvVert}
        fragmentShader={causticFrag}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function WaterSurface() {
  const matRef = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 3.8, 0]}>
      <planeGeometry args={[22, 18, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={uvVert}
        fragmentShader={waterFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Glass tank frame
function TankFrame() {
  return (
    <group>
      {/* Left wall */}
      <mesh position={[-9.0, 1.0, 0]}>
        <boxGeometry args={[0.07, 7.5, 16]} />
        <meshPhysicalMaterial color="#b8ddf5" transparent opacity={0.07} roughness={0} />
      </mesh>
      {/* Right wall */}
      <mesh position={[9.0, 1.0, 0]}>
        <boxGeometry args={[0.07, 7.5, 16]} />
        <meshPhysicalMaterial color="#b8ddf5" transparent opacity={0.07} roughness={0} />
      </mesh>
      {/* Bottom frame bar */}
      <mesh position={[0, -2.25, 0]}>
        <boxGeometry args={[18.5, 0.18, 16]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.5} roughness={0.7} />
      </mesh>
      {/* Top frame bar */}
      <mesh position={[0, 4.1, 0]}>
        <boxGeometry args={[18.5, 0.18, 16]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.5} roughness={0.7} />
      </mesh>
      {/* Corner posts */}
      {[[-9, 4.1], [9, 4.1], [-9, -2.25], [9, -2.25]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[0.22, 0.22, 16.5]} />
          <meshStandardMaterial color="#0d1a24" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {/* Front glass pane (ultra-faint) */}
      <mesh position={[0, 1.0, 7.5]}>
        <planeGeometry args={[18, 7.5]} />
        <meshPhysicalMaterial
          color="#88ccee"
          transparent opacity={0.025}
          side={THREE.DoubleSide}
          roughness={0}
        />
      </mesh>
    </group>
  )
}

// Kelp plant — segments that sway
function Kelp({ position, height = 3.0, color = '#1a7a1a' }) {
  const ref = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.65 + phase) * 0.14
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.45 + phase * 1.2) * 0.06
  })
  const segments = Math.max(2, Math.floor(height / 0.5))
  return (
    <group ref={ref} position={position}>
      {Array.from({ length: segments }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.5) * 0.08, i * 0.5 + 0.25, 0]}>
          <capsuleGeometry args={[0.055, 0.48, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Bikini Bottom landmarks ──────────────────────────────────────────────────

// SpongeBob's Pineapple House
function PineappleHouse({ position }) {
  return (
    <group position={position}>
      {/* Pineapple body */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.75, 0.95, 2.2, 10]} />
        <meshStandardMaterial color="#d4780a" roughness={0.65} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.32, 0.72, 0.85, 10]} />
        <meshStandardMaterial color="#bb6508" roughness={0.7} />
      </mesh>
      {/* Diamond pattern (faint ribs) */}
      {[-0.6, 0.0, 0.6].map((y, i) => (
        <mesh key={i} position={[0, y + 0.8, 0]}>
          <torusGeometry args={[0.88, 0.025, 6, 20]} />
          <meshStandardMaterial color="#a05008" roughness={0.8} />
        </mesh>
      ))}
      {/* Door */}
      <mesh position={[0, -0.5, 0.97]}>
        <boxGeometry args={[0.38, 0.65, 0.05]} />
        <meshStandardMaterial color="#3a1a08" />
      </mesh>
      {/* Porthole window */}
      <mesh position={[0.35, 0.9, 0.94]}>
        <ringGeometry args={[0.1, 0.18, 16]} />
        <meshStandardMaterial color="#557799" metalness={0.6} />
      </mesh>
      <mesh position={[0.35, 0.9, 0.945]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#aaddff" emissive="#50aacc" emissiveIntensity={0.3} />
      </mesh>
      {/* Green leaves crown */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2
        const lean  = Math.PI * 0.2 + (i % 2) * 0.1
        return (
          <mesh
            key={i}
            position={[
              Math.sin(angle) * 0.42,
              2.85 + (i % 3) * 0.2,
              Math.cos(angle) * 0.42,
            ]}
            rotation={[Math.cos(angle) * lean, 0, Math.sin(angle) * lean]}
          >
            <capsuleGeometry args={[0.05, 0.75, 4, 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#1a9a1a' : '#148814'} roughness={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}

// Squidward's Easter Island Head
function SquidwardHouse({ position }) {
  return (
    <group position={position}>
      {/* Main head body */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.25, 3.2, 1.15]} />
        <meshStandardMaterial color="#5e6e5e" roughness={0.92} />
      </mesh>
      {/* Crown ridge */}
      <mesh position={[0, 2.85, 0]}>
        <boxGeometry args={[1.05, 0.45, 0.95]} />
        <meshStandardMaterial color="#4e5e4e" roughness={0.95} />
      </mesh>
      {/* Top nub */}
      <mesh position={[0, 3.18, 0]}>
        <cylinderGeometry args={[0.28, 0.5, 0.35, 6]} />
        <meshStandardMaterial color="#456045" roughness={0.95} />
      </mesh>
      {/* Left eye hole */}
      <mesh position={[-0.28, 1.35, 0.59]}>
        <boxGeometry args={[0.28, 0.38, 0.06]} />
        <meshBasicMaterial color="#181e18" />
      </mesh>
      {/* Right eye hole */}
      <mesh position={[0.28, 1.35, 0.59]}>
        <boxGeometry args={[0.28, 0.38, 0.06]} />
        <meshBasicMaterial color="#181e18" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.85, 0.62]}>
        <boxGeometry args={[0.18, 0.42, 0.28]} />
        <meshStandardMaterial color="#668066" roughness={0.9} />
      </mesh>
      {/* Mouth slit */}
      <mesh position={[0, 0.45, 0.59]}>
        <boxGeometry args={[0.55, 0.07, 0.05]} />
        <meshBasicMaterial color="#202820" />
      </mesh>
      {/* Arch doorway */}
      <mesh position={[0, -0.9, 0.59]}>
        <boxGeometry args={[0.58, 0.95, 0.06]} />
        <meshBasicMaterial color="#141a14" />
      </mesh>
      {/* Stone texture horizontal lines */}
      {[-0.5, 0.5, 1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.59]}>
          <boxGeometry args={[1.26, 0.05, 0.01]} />
          <meshBasicMaterial color="#788870" />
        </mesh>
      ))}
    </group>
  )
}

// Patrick's Rock
function PatrickRock({ position }) {
  return (
    <group position={position}>
      {/* Dome top */}
      <mesh position={[0, 0.15, 0]} rotation={[0, 0.4, 0]}>
        <sphereGeometry args={[1.0, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#9a8a78" roughness={1.0} />
      </mesh>
      {/* Flat base */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[1.0, 1.05, 0.28, 18]} />
        <meshStandardMaterial color="#888070" roughness={1.0} />
      </mesh>
      {/* Surface cracks / texture lines */}
      {[0, 0.8, 1.6, 2.4].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.5, 0.3, Math.sin(a) * 0.5]}
          rotation={[Math.cos(a) * 0.5, a, Math.sin(a) * 0.3]}>
          <boxGeometry args={[0.55, 0.02, 0.02]} />
          <meshBasicMaterial color="#706858" />
        </mesh>
      ))}
    </group>
  )
}

// Krusty Krab
function KrustyKrab({ position }) {
  return (
    <group position={position}>
      {/* Main building — wide trapezoidal shape */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.4, 1.6, 1.4]} />
        <meshStandardMaterial color="#a87850" roughness={0.75} />
      </mesh>
      {/* Roof overhang */}
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[2.7, 0.22, 1.6]} />
        <meshStandardMaterial color="#8a6038" roughness={0.8} />
      </mesh>
      {/* Chimney */}
      <mesh position={[0.7, 2.05, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.95, 8]} />
        <meshStandardMaterial color="#705028" roughness={0.85} />
      </mesh>
      {/* Chimney cap */}
      <mesh position={[0.7, 2.55, 0]}>
        <cylinderGeometry args={[0.2, 0.13, 0.12, 8]} />
        <meshStandardMaterial color="#504020" />
      </mesh>
      {/* Windows */}
      {[-0.65, 0.65].map((x, i) => (
        <group key={i} position={[x, 0.65, 0.72]}>
          <mesh>
            <boxGeometry args={[0.38, 0.32, 0.04]} />
            <meshStandardMaterial color="#88c8e0" emissive="#40a0c0" emissiveIntensity={0.25} />
          </mesh>
          {/* Window cross */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.38, 0.03, 0.02]} />
            <meshBasicMaterial color="#705030" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.03, 0.32, 0.02]} />
            <meshBasicMaterial color="#705030" />
          </mesh>
        </group>
      ))}
      {/* Front door */}
      <mesh position={[0, -0.12, 0.72]}>
        <boxGeometry args={[0.45, 0.9, 0.04]} />
        <meshStandardMaterial color="#3a2010" />
      </mesh>
      {/* Clamshell sign on post */}
      <mesh position={[0, 1.55, 0.72]}>
        <cylinderGeometry args={[0.025, 0.025, 1.2, 6]} />
        <meshStandardMaterial color="#805030" />
      </mesh>
      <mesh position={[0, 2.25, 0.72]} rotation={[Math.PI * 0.05, 0, 0]}>
        <sphereGeometry args={[0.38, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#e898c0" emissive="#cc5090" emissiveIntensity={0.2} roughness={0.5} />
      </mesh>
    </group>
  )
}

// Animated bubbles
function Bubbles({ count = 120 }) {
  const ref = useRef()
  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds    = new Float32Array(count)
    const offsets   = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 18
      positions[i*3+1] = (Math.random() - 0.5) * 5.5
      positions[i*3+2] = (Math.random() - 0.5) * 8
      speeds[i]  = 0.25 + Math.random() * 0.55
      offsets[i] = Math.random() * Math.PI * 2
    }
    return { positions, speeds, offsets }
  }, [count])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    const t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      pos[i*3+1] += speeds[i] * 0.012
      pos[i*3]   += Math.sin(t * 0.6 + offsets[i]) * 0.0018
      if (pos[i*3+1] > 4.0) pos[i*3+1] = -2.0
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#88ddff"
        transparent opacity={0.55}
        sizeAttenuation depthWrite={false}
      />
    </points>
  )
}

// Small animated fish
function Fish({ startPos, speed, amplitude, color = '#ff6633' }) {
  const ref = useRef()
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * speed + offset
    ref.current.position.x = startPos[0] + Math.sin(t * 0.65) * amplitude
    ref.current.position.y = startPos[1] + Math.sin(t * 0.42) * 0.3
    // Face swimming direction
    ref.current.rotation.y = Math.cos(t * 0.65) > 0 ? 0 : Math.PI
  })
  return (
    <group ref={ref} position={startPos}>
      <mesh>
        <sphereGeometry args={[0.14, 10, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      {/* Eye */}
      <mesh position={[0.08, 0.04, 0.11]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.11, 0.22, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

// Animated underwater shimmer lights
function WaterShimmer() {
  const l1 = useRef(), l2 = useRef(), l3 = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (l1.current) {
      l1.current.position.x = Math.sin(t * 0.7) * 5
      l1.current.intensity   = 2.5 + Math.sin(t * 1.4) * 0.9
    }
    if (l2.current) {
      l2.current.position.x = Math.cos(t * 0.5) * 6
      l2.current.intensity   = 1.8 + Math.sin(t * 1.8 + 1) * 0.7
    }
    if (l3.current) {
      l3.current.position.z = Math.sin(t * 0.4) * 3
      l3.current.intensity   = 1.5 + Math.sin(t * 1.1 + 2) * 0.5
    }
  })
  return (
    <>
      <pointLight ref={l1} position={[0, 4.0, 1]}  intensity={2.5} color="#30d8ff" distance={14} decay={2} />
      <pointLight ref={l2} position={[4, 4.2, -1]} intensity={1.8} color="#20c0f0" distance={12} decay={2} />
      <pointLight ref={l3} position={[-4, 3.8, 0]} intensity={1.5} color="#40e0d0" distance={11} decay={2} />
    </>
  )
}

// ─── Scene root ───────────────────────────────────────────────────────────────

export default function AquariumScene() {
  return (
    <>
      {/* Underwater ambient lighting */}
      <ambientLight intensity={0.35} color="#003a5e" />
      <pointLight position={[0, 5, 6]}  intensity={2.5} color="#20d0ff" distance={22} decay={2} />
      <pointLight position={[-6, 2, 0]} intensity={0.9} color="#008890" distance={16} decay={2} />
      <pointLight position={[6,  2, 0]} intensity={0.9} color="#006688" distance={16} decay={2} />

      <WaterShimmer />

      {/* Ocean backdrop */}
      <mesh position={[0, 1.0, -9]}>
        <planeGeometry args={[26, 13]} />
        <meshBasicMaterial color="#001826" />
      </mesh>
      {/* Gradient overlay on backdrop */}
      <mesh position={[0, 4.5, -8.9]}>
        <planeGeometry args={[26, 4]} />
        <meshBasicMaterial color="#002840" transparent opacity={0.6} />
      </mesh>

      <SandFloor />
      <WaterSurface />
      <TankFrame />

      {/* ── Bikini Bottom landmarks (left → right) ── */}
      <KrustyKrab     position={[-6.0, -2.0, 0.0]} />
      <SquidwardHouse position={[-2.5, -2.0, -0.5]} />
      <PineappleHouse position={[ 1.2, -2.0,  0.2]} />
      <PatrickRock    position={[ 5.0, -2.0,  0.5]} />

      {/* Kelp clusters */}
      <Kelp position={[-8.2, -2.0, -1.5]} height={3.8} color="#1a7a1a" />
      <Kelp position={[-7.6, -2.0,  0.8]} height={2.6} color="#159515" />
      <Kelp position={[ 7.5, -2.0, -1.2]} height={4.2} color="#1a8a1a" />
      <Kelp position={[ 8.0, -2.0,  0.5]} height={2.9} color="#128012" />
      <Kelp position={[-4.0, -2.0, -2.5]} height={2.2} color="#16801a" />
      <Kelp position={[ 3.5, -2.0, -2.0]} height={2.8} color="#1a7018" />
      <Kelp position={[ 0.0, -2.0, -2.8]} height={1.8} color="#188018" />

      {/* Fish */}
      <Fish startPos={[-3.5, 0.8, 3.5]}  speed={0.55} amplitude={3.2} color="#ff6633" />
      <Fish startPos={[ 2.5, 1.5, 3.0]}  speed={0.40} amplitude={4.0} color="#ffaa22" />
      <Fish startPos={[ 0.0, 0.2, 4.5]}  speed={0.70} amplitude={2.8} color="#ff4488" />
      <Fish startPos={[-5.0, 0.5, 2.5]}  speed={0.35} amplitude={3.5} color="#22aaff" />
      <Fish startPos={[ 4.0, 1.0, 1.5]}  speed={0.60} amplitude={2.5} color="#aa66ff" />

      <Bubbles count={130} />

      {/* Small pebbles / rocks on the sand */}
      {[
        [-1.5, 2.5], [0.8, -1.5], [3.5, 1.8], [-3.5, -1.0],
        [2.0, 3.0],  [-5.5, 2.0], [4.5, -2.0], [-0.5, 1.0],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -1.92, z]}>
          <sphereGeometry args={[0.05 + Math.random() * 0.09, 8, 6]} />
          <meshStandardMaterial
            color={['#887868', '#997a68', '#aa8870', '#776655'][i % 4]}
            roughness={1.0}
          />
        </mesh>
      ))}

    </>
  )
}
