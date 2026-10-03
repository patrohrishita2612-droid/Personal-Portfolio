import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// One shared soft dot sprite so cloud particles read as haze, not square pixels
let softDotTexture: THREE.CanvasTexture | null = null
function getSoftDotTexture(): THREE.CanvasTexture {
  if (softDotTexture) return softDotTexture
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create the nebula texture.')
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.4)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 32, 32)
  softDotTexture = new THREE.CanvasTexture(canvas)
  softDotTexture.colorSpace = THREE.SRGBColorSpace
  return softDotTexture
}

type NebulaCloudProps = {
  position: [number, number, number]
  color: string
  color2: string
  size?: number
  particleCount?: number
  rotationSpeed?: number
}

function NebulaCloud({ position, color, color2, size = 200, particleCount = 800, rotationSpeed = 0.01 }: NebulaCloudProps) {
  const ref = useRef<THREE.Points>(null)

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const c1 = new THREE.Color(color)
    const c2 = new THREE.Color(color2)

    // Four offset sub-centres give each cloud an irregular, painterly silhouette
    const centres: THREE.Vector3[] = []
    for (let c = 0; c < 4; c++) {
      centres.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * size * 0.9,
          (Math.random() - 0.5) * size * 0.5,
          (Math.random() - 0.5) * size * 0.9,
        ),
      )
    }

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const centre = centres[i % 4]

      // Soft puff around one of the sub-centres, flattened into a cloud layer
      const r = Math.pow(Math.random(), 1.6) * size * 0.72
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = centre.x + r * Math.sin(phi) * Math.cos(theta)
      const y = centre.y + r * Math.sin(phi) * Math.sin(theta) * 0.62
      const z = centre.z + r * Math.cos(phi)

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      // Two-tone falloff measured from the cloud centre keeps the edges hazy
      const distRatio = Math.min(1, Math.sqrt(x * x + y * y + z * z) / (size * 1.05))
      const blended = c1.clone().lerp(c2, distRatio)
      const brightness = (1 - distRatio) * 0.66 + 0.16
      colors[i3] = blended.r * brightness
      colors[i3 + 1] = blended.g * brightness
      colors[i3 + 2] = blended.b * brightness
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      // Large + faint: neighbouring sprites overlap into continuous haze instead
      // of resolving as individual confetti dots at distance
      size: 46,
      map: getSoftDotTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.12,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    return { geometry: geo, material: mat }
  }, [color, color2, size, particleCount])

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += rotationSpeed * delta
  })

  return <points ref={ref} geometry={geometry} material={material} position={position} />
}

export default function Nebulae() {
  return (
    <group>
      {/* Clouds live ahead of the start position (+Z is where the camera looks)
          spread asymmetrically across the visible field */}
      {/* Indigo drifting into magenta — the anchor cloud */}
      <NebulaCloud position={[-560, 180, 950]} color="#3b2a8f" color2="#a5407e" size={250} particleCount={1000} rotationSpeed={0.008} />

      {/* Violet cloud fading into dusty pink */}
      <NebulaCloud position={[640, -90, 1150]} color="#5b34a6" color2="#c9748d" size={200} particleCount={800} rotationSpeed={0.012} />

      {/* Teal cloud carrying a muted amber rim */}
      <NebulaCloud position={[340, 250, 720]} color="#0a5f74" color2="#b3894a" size={180} particleCount={600} rotationSpeed={0.01} />

      {/* Distant dusty-rose cloud easing toward deep violet */}
      <NebulaCloud position={[-700, -170, 1500]} color="#6d2a63" color2="#4a3f9e" size={220} particleCount={700} rotationSpeed={0.006} />

      {/* Small cobalt cloud warming to amber */}
      <NebulaCloud position={[90, -330, 800]} color="#27409e" color2="#c1763f" size={120} particleCount={400} rotationSpeed={0.015} />

      {/* Wide royal-blue haze drifting behind the galaxy — fills the mid-field with colour */}
      <NebulaCloud position={[-540, 330, 2600]} color="#2a4bb8" color2="#7a4fd0" size={420} particleCount={1100} rotationSpeed={0.004} />

      {/* Warm amber dust wall off the starboard bow */}
      <NebulaCloud position={[900, 150, 1800]} color="#8a5a2c" color2="#c98a4a" size={260} particleCount={700} rotationSpeed={0.007} />

      {/* High dusty-blue cirrus layer */}
      <NebulaCloud position={[-280, 470, 620]} color="#4a6cb8" color2="#93a9d8" size={300} particleCount={800} rotationSpeed={0.005} />

      {/* Small subtle-cyan wisp low and to port */}
      <NebulaCloud position={[-260, -420, 1100]} color="#1c6f86" color2="#6fc6d4" size={150} particleCount={450} rotationSpeed={0.012} />

      {/* Far dusty-pink bloom easing into violet */}
      <NebulaCloud position={[560, 420, 1600]} color="#b87a94" color2="#6a5fb8" size={240} particleCount={650} rotationSpeed={0.006} />

      {/* === Behind the launch point — turning around is never an empty void === */}
      <NebulaCloud position={[780, 140, -980]} color="#27409e" color2="#8a5a2c" size={300} particleCount={800} rotationSpeed={0.005} />
      <NebulaCloud position={[-700, -240, -1250]} color="#5b34a6" color2="#c9748d" size={260} particleCount={750} rotationSpeed={0.007} />
      <NebulaCloud position={[140, 520, -1650]} color="#0a5f74" color2="#7a4fd0" size={380} particleCount={950} rotationSpeed={0.004} />
      <NebulaCloud position={[-360, -480, -760]} color="#6d2a63" color2="#4a6cb8" size={200} particleCount={600} rotationSpeed={0.009} />

      {/* === Far port/starboard horizons — keeps banking left/right interesting === */}
      <NebulaCloud position={[1650, -60, 350]} color="#1c6f86" color2="#b3894a" size={340} particleCount={850} rotationSpeed={0.004} />
      <NebulaCloud position={[-1750, 260, -150]} color="#3b2a8f" color2="#93a9d8" size={320} particleCount={800} rotationSpeed={0.005} />
    </group>
  )
}
