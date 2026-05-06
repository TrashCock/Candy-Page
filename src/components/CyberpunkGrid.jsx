import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Custom shader grid material — gives that Tron/synthwave look
const gridVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const gridFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float line(float val, float width) {
    float half = width * 0.5;
    return smoothstep(half, 0.0, abs(fract(val) - 0.5) - (0.5 - half));
  }

  void main() {
    // Grid lines
    float bigGrid   = line(vWorldPos.x * 0.5, 0.02) + line(vWorldPos.z * 0.5, 0.02);
    float smallGrid = line(vWorldPos.x * 2.0, 0.015) + line(vWorldPos.z * 2.0, 0.015);

    // Moving scan line
    float scanZ = vWorldPos.z + uTime * 2.0;
    float scan = smoothstep(0.96, 1.0, sin(scanZ * 0.5)) * 0.6;

    // Distance fade
    float dist = length(vWorldPos.xz);
    float fade = 1.0 - smoothstep(6.0, 22.0, dist);

    vec3 col = uColor1 * bigGrid * 0.9
             + uColor2 * smallGrid * 0.3
             + uColor1 * scan;

    float alpha = (bigGrid * 0.8 + smallGrid * 0.25 + scan * 0.5) * fade;
    gl_FragColor = vec4(col, alpha * 0.85);
  }
`

export default function CyberpunkGrid() {
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uColor1: { value: new THREE.Color('#00f5ff') },
    uColor2: { value: new THREE.Color('#ff00aa') },
  }), [])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[60, 60, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={gridVertexShader}
        fragmentShader={gridFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
