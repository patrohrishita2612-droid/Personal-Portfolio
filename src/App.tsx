import SpaceScene from './three/SpaceScene'
import HUD from './three/HUD'
import './three/HUD.css'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#101d4d' }}>
      <SpaceScene />
      <HUD />
    </div>
  )
}

export default App
