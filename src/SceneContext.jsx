import { createContext, useContext } from 'react'

export const SceneContext = createContext({ currentScene: 0, switchScene: () => {} })
export const useScene = () => useContext(SceneContext)

export const SCENES = [
  {
    id: 'cyberpunk',
    label: 'CYBERPUNK',
    accent: '#00f5ff',
    bg: '#03040a',
    camera: { pos: [0, 2.5, 9], fov: 60 },
    logo: 'SYS://PORTFOLIO',
    subtitle: 'TECHNICAL ARTIST  //  GAME ENGINEER  //  SHADER DEV',
  },
  {
    id: 'synthwave',
    label: 'SYNTHWAVE',
    accent: '#ff44cc',
    bg: '#0d0015',
    camera: { pos: [0, 1.5, 9], fov: 70 },
    logo: 'OUTRUN://STUDIO',
    subtitle: 'REAL-TIME RENDERING  //  RETRO AESTHETICS  //  NEON DREAMS',
  },
  {
    id: 'aquarium',
    label: 'BIKINI_BOTTOM',
    accent: '#00d4aa',
    bg: '#001528',
    camera: { pos: [0, 1.2, 12], fov: 65 },
    logo: 'SEA://CREATIVE',
    subtitle: 'GAME WORLDS  //  ENVIRONMENT ART  //  INTERACTIVE STORYTELLING',
  },
]
