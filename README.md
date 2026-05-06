# PORTFOLIO // CYBERPUNK STARTER

A Three.js + React Three Fiber portfolio template with cyberpunk aesthetic.

## 📁 Recommended location
D:\Projects\portfolio-cyberpunk\

## 🚀 Setup

1. Copy this folder to D:\Projects\portfolio-cyberpunk\
2. Open terminal in that folder:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173 in Firefox

## 🎨 Customization

### Change your name
→ src/components/HeroOverlay.jsx
  - Line with `<GlitchTitle text="YOUR NAME" />` — replace with your name
  - Update the subtitle typewriter text
  - Update the stats in DataPanel

### Colors
→ src/index.css  :root variables
  --cyan, --magenta, --green are the main neon accents

### 3D objects
→ src/components/FloatingGeometry.jsx
  - Swap geometry types: box, octa, tetra, sphere, torus
  - Change colors per object

### Grid
→ src/components/CyberpunkGrid.jsx
  - uColor1/uColor2 uniforms = grid line colors
  - Grid scale controlled by `* 0.5` and `* 2.0` in the shader

### Add your GLB models
```jsx
import { useGLTF } from '@react-three/drei'

function MyModel() {
  const { scene } = useGLTF('/models/mymodel.glb')
  return <primitive object={scene} />
}
```
Drop .glb files in /public/models/

## 📦 Build for web
```bash
npm run build
```
Output goes to /dist — deploy to Vercel, Netlify, or Cloudflare Pages (free)

## 🛠 Tech Stack
- React 18
- Three.js r165
- React Three Fiber 8
- Drei (helpers)
- Vite 5 (dev server + bundler)
- Google Fonts: Orbitron, Share Tech Mono, Rajdhani
