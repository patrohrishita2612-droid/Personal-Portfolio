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
      // Large + soft: neighbouring sprites overlap into continuous haze
      size: 58,
      map: getSoftDotTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
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
      {/* Indigo into vivid magenta — anchor cloud */}
      <NebulaCloud position={[-560, 180, 950]} color="#4338ca" color2="#d946ef" size={280} particleCount={1100} rotationSpeed={0.008} />

      {/* Violet cloud drifting into bubblegum pink */}
      <NebulaCloud position={[640, -90, 1150]} color="#6366f1" color2="#ec4899" size={230} particleCount={900} rotationSpeed={0.012} />

      {/* Electric turquoise with golden amber core */}
      <NebulaCloud position={[340, 250, 720]} color="#06b6d4" color2="#f59e0b" size={200} particleCount={700} rotationSpeed={0.01} />

      {/* Distant fuchsia easing toward deep violet */}
      <NebulaCloud position={[-700, -170, 1500]} color="#c026d3" color2="#4f46e5" size={250} particleCount={800} rotationSpeed={0.006} />

      {/* Cobalt cloud warming to peach */}
      <NebulaCloud position={[90, -330, 800]} color="#2563eb" color2="#fb923c" size={150} particleCount={500} rotationSpeed={0.015} />

      {/* Wide royal-blue haze behind the galaxy */}
      <NebulaCloud position={[-540, 330, 2600]} color="#3b82f6" color2="#a855f7" size={460} particleCount={1200} rotationSpeed={0.004} />

      {/* Warm peach and apricot dust cloud */}
      <NebulaCloud position={[900, 150, 1800]} color="#ea580c" color2="#fde047" size={290} particleCount={800} rotationSpeed={0.007} />

      {/* High cyan-periwinkle layer */}
      <NebulaCloud position={[-280, 470, 620]} color="#38bdf8" color2="#a78bfa" size={320} particleCount={850} rotationSpeed={0.005} />

      {/* Glowing turquoise wisp */}
      <NebulaCloud position={[-260, -420, 1100]} color="#06b6d4" color2="#22d3ee" size={170} particleCount={500} rotationSpeed={0.012} />

      {/* Pastel pink bloom */}
      <NebulaCloud position={[560, 420, 1600]} color="#f472b6" color2="#818cf8" size={260} particleCount={700} rotationSpeed={0.006} />

      {/* === Behind launch point === */}
      <NebulaCloud position={[780, 140, -980]} color="#3b82f6" color2="#f97316" size={320} particleCount={850} rotationSpeed={0.005} />
      <NebulaCloud position={[-700, -240, -1250]} color="#7c3aed" color2="#f43f5e" size={280} particleCount={800} rotationSpeed={0.007} />
      <NebulaCloud position={[140, 520, -1650]} color="#0284c7" color2="#a855f7" size={400} particleCount={1000} rotationSpeed={0.004} />
      <NebulaCloud position={[-360, -480, -760]} color="#c026d3" color2="#38bdf8" size={220} particleCount={650} rotationSpeed={0.009} />

      {/* === Horizons === */}
      <NebulaCloud position={[1650, -60, 350]} color="#06b6d4" color2="#fbbf24" size={360} particleCount={900} rotationSpeed={0.004} />
      <NebulaCloud position={[-1750, 260, -150]} color="#4f46e5" color2="#38bdf8" size={340} particleCount={850} rotationSpeed={0.005} />
    </group>
  )
}
