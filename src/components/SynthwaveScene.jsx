import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

// ─── Shaders ─────────────────────────────────────────────────────────────────

const gridVert = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const gridFrag = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float gridLine(float v, float thickness) {
    return smoothstep(thickness, 0.0, abs(fract(v + 0.5) - 0.5));
  }

  void main() {
    // Scrolling Z lines (converge toward horizon)
    float xLine = gridLine(vWorldPos.x * 0.55, 0.022);
    float zLine = gridLine((vWorldPos.z + uTime * 2.8) * 0.55, 0.022);

    // Distance fades
    float zDist = abs(vWorldPos.z);
    float fade  = 1.0 - smoothstep(4.0, 22.0, zDist);
    float xFade = 1.0 - smoothstep(0.0, 14.0, abs(vWorldPos.x));

    float grid = (xLine + zLine * 0.9) * fade * xFade;

    // Color: pink verticals, purple horizontals
    vec3 col = mix(
      vec3(0.55, 0.0, 1.0),  // purple (Z lines)
      vec3(0.95, 0.05, 0.65), // hot-pink (X lines)
      xLine / (xLine + zLine + 0.001)
    );

    // Pulse sweep
    float sweep = smoothstep(0.92, 1.0, sin((vWorldPos.z + uTime * 4.0) * 0.4)) * 0.5;
    col += sweep * vec3(1.0, 0.2, 0.8);

    gl_FragColor = vec4(col, grid * 0.92);
  }
`

const sunVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const sunFrag = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float d = length(uv - 0.5) * 2.0;
    if (d > 1.01) discard;

    // Gradient top → mid → bottom
    vec3 topColor = vec3(1.0, 0.88, 0.08);   // golden yellow
    vec3 midColor = vec3(1.0, 0.42, 0.04);   // amber orange
    vec3 botColor = vec3(0.88, 0.04, 0.38);  // magenta-red

    vec3 sunColor = uv.y > 0.5
      ? mix(midColor, topColor, (uv.y - 0.5) * 2.0)
      : mix(botColor, midColor,  uv.y * 2.0);

    // Horizontal stripes — denser toward bottom
    float stripeT = max(0.0, 0.5 - uv.y) / 0.5;
    float freq = 4.0 + stripeT * 24.0;
    float stripe = step(0.38, fract(uv.y * freq));
    float inBot  = step(uv.y, 0.5);
    sunColor = mix(sunColor, sunColor * 0.04, inBot * stripe * 0.9);

    // Soft edge + animated pulse
    float alpha = 1.0 - smoothstep(0.85, 1.0, d);
    float pulse = 1.0 + sin(uTime * 0.9) * 0.025;
    sunColor *= pulse;

    // Halo glow ring
    float halo = smoothstep(1.0, 0.82, d) * smoothstep(0.75, 1.0, d) * 0.35;
    sunColor += halo * vec3(1.0, 0.3, 0.7);

    gl_FragColor = vec4(sunColor, alpha);
  }
`

// Horizon glow band shader
const horizonFrag = `
  varying vec2 vUv;
  void main() {
    float falloff = 1.0 - abs(vUv.y - 0.5) * 2.0;
    falloff = pow(falloff, 2.5);
    vec3 col = mix(vec3(0.6, 0.0, 0.9), vec3(0.95, 0.05, 0.6), vUv.x);
    gl_FragColor = vec4(col, falloff * 0.22);
  }
`
const uvVert = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

// ─── Components ──────────────────────────────────────────────────────────────

function SynthGrid() {
  const matRef = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 3]}>
      <planeGeometry args={[60, 44, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={gridVert}
        fragmentShader={gridFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function SynthSun() {
  const matRef = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <mesh position={[0, 2.2, -9]}>
      <circleGeometry args={[3.5, 80]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={sunVert}
        fragmentShader={sunFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

function HorizonGlow() {
  return (
    <mesh position={[0, 0.6, -9.5]}>
      <planeGeometry args={[50, 3.5]} />
      <shaderMaterial
        vertexShader={uvVert}
        fragmentShader={horizonFrag}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Mountain silhouette geometry — 3 depth layers
function createMountainGeo(peaks, w = 34, baseY = -3) {
  const pts = [[-w / 2, baseY], ...peaks, [w / 2, baseY]]
  const shape = new THREE.Shape()
  shape.moveTo(pts[0][0], pts[0][1])
  pts.slice(1).forEach(([x, y]) => shape.lineTo(x, y))
  shape.closePath()
  return new THREE.ShapeGeometry(shape)
}

function MountainLayers() {
  const far = useMemo(() => createMountainGeo([
    [-14, 2.4], [-10, 4.5], [-6, 2.9], [-2, 5.2], [2, 3.0], [6, 4.8], [10, 2.6], [14, 3.8],
  ], 34, -3), [])

  const mid = useMemo(() => createMountainGeo([
    [-15, 1.0], [-11, 3.2], [-7, 1.6], [-3, 3.9], [0, 2.2], [3, 3.6], [7, 1.8], [11, 3.0], [15, 1.4],
  ], 34, -3), [])

  const near = useMemo(() => createMountainGeo([
    [-15, 0.3], [-12, 1.9], [-8, 0.6], [-4, 2.3], [0, 1.2], [4, 2.0], [8, 0.7], [12, 1.8], [15, 0.5],
  ], 34, -3), [])

  return (
    <>
      <mesh geometry={far}  position={[0, 0.3, -11]} renderOrder={1}>
        <meshBasicMaterial color="#28003e" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={mid}  position={[0, 0.0, -9]} renderOrder={2}>
        <meshBasicMaterial color="#180028" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={near} position={[0, -0.2, -7]} renderOrder={3}>
        <meshBasicMaterial color="#0d0018" side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

// Simplified palm tree silhouette
function PalmTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk with lean */}
      <mesh position={[0.15, 0.8, 0]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[0.06, 0.12, 2.2, 6]} />
        <meshBasicMaterial color="#0a0015" />
      </mesh>
      {/* 5 fronds fanning out */}
      {[0, 0.65, 1.3, 2.0, 2.8].map((angle, i) => (
        <mesh
          key={i}
          position={[
            0.15 + Math.cos(angle - 0.3) * 0.55,
            2.1 + Math.sin((i / 5) * 0.8) * 0.25,
            Math.sin(angle) * 0.08,
          ]}
          rotation={[Math.sin(angle) * 0.3, 0, (angle - 1.4) * 0.35 + 0.1]}
        >
          <capsuleGeometry args={[0.045, 0.85, 4, 6]} />
          <meshBasicMaterial color="#060010" />
        </mesh>
      ))}
    </group>
  )
}

// Floating neon particles
function NeonParticles({ count = 300 }) {
  const ref = useRef()
  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors    = new Float32Array(count * 3)
    const speeds    = new Float32Array(count)
    const palette = [
      new THREE.Color('#ff44cc'),
      new THREE.Color('#8833ff'),
      new THREE.Color('#ff88ff'),
      new THREE.Color('#cc00ff'),
    ]
    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 28
      positions[i*3+1] = Math.random() * 6 - 0.5
      positions[i*3+2] = (Math.random() - 0.5) * 20
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b
      speeds[i] = 0.015 + Math.random() * 0.04
    }
    return { positions, colors, speeds }
  }, [count])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i*3+1] += speeds[i] * 0.06
      if (pos[i*3+1] > 5.5) pos[i*3+1] = -0.5
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
        size={0.04}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// ─── Scene root ───────────────────────────────────────────────────────────────

export default function SynthwaveScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.08} color="#200030" />
      <pointLight position={[0, 4, -5]} intensity={4} color="#ff22bb" distance={28} decay={2} />
      <pointLight position={[-8, 1, 2]} intensity={1.5} color="#7700ff" distance={18} decay={2} />
      <pointLight position={[8,  1, 2]} intensity={1.5} color="#7700ff" distance={18} decay={2} />
      <pointLight position={[0,  0, 5]} intensity={2}   color="#440088" distance={12} decay={2} />

      <Stars radius={55} depth={25} count={1800} factor={3} saturation={0.6} fade speed={0.25} />

      <SynthSun />
      <HorizonGlow />
      <MountainLayers />

      {/* Palm trees — left and right, in silhouette zone */}
      <PalmTree position={[-6.0, -1.4, -5.8]} scale={1.05} />
      <PalmTree position={[ 5.5, -1.4, -5.5]} scale={1.10} />
      <PalmTree position={[-4.0, -1.4, -4.8]} scale={0.72} />
      <PalmTree position={[ 3.8, -1.4, -4.6]} scale={0.78} />

      <SynthGrid />
      <NeonParticles />

    </>
  )
}
