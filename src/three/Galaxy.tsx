import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Soft round sprite so arm stars read as haze-like points, not square pixels
function makeSoftTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create the galaxy texture.')
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.4)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 32, 32)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// A distant spiral galaxy built from particle systems — acts as a visual landmark
type Props = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export default function Galaxy({
  position = [-520, 340, 2100],
  rotation = [1, 0, 0.15],
  scale = 1,
}: Props) {
  const ref = useRef<THREE.Points>(null)
  const softTexture = useMemo(makeSoftTexture, [])

  const {
    geometry,
    material,
    coreGeometry,
    coreMaterial,
    hazeGeometry,
    hazeMaterial,
    diskGeometry,
    diskMaterial,
  } = useMemo(() => {
    const armCount = 4
    const starsPerArm = 1100
    const totalStars = armCount * starsPerArm + 1600 // extra core stars
    const positions = new Float32Array(totalStars * 3)
    const colors = new Float32Array(totalStars * 3)

    const galaxyRadius = 300
    const spin = 1.5
    const randomnessPower = 2

    // Cinematic palette: warm-white core, royal blue mid, indigo/violet rim
    const innerColor = new THREE.Color('#ffe3b3')
    const midColor = new THREE.Color('#5f82e6')
    const outerColor = new THREE.Color('#6a58d6')
    const accentColor = new THREE.Color('#7fd4e8')
    const magentaColor = new THREE.Color('#b061c4')

    let i = 0

    // Spiral arms
    for (let arm = 0; arm < armCount; arm++) {
      const armOffset = (arm / armCount) * Math.PI * 2
      for (let s = 0; s < starsPerArm; s++) {
        const i3 = i * 3
        const t = s / starsPerArm
        const radius = Math.pow(t, 0.5) * galaxyRadius
        const branchAngle = armOffset + t * spin * Math.PI * 2

        // Soft, cloud-like scatter that decreases toward center — wide enough
        // that the arms read as broad cloudy bands, not thin spiral lines
        const scatter = Math.pow(radius / galaxyRadius, randomnessPower) * 88
        const rx = (Math.random() - 0.5) * scatter
        const ry = (Math.random() - 0.5) * scatter * 0.2 // thin disk
        const rz = (Math.random() - 0.5) * scatter

        positions[i3] = Math.cos(branchAngle) * radius + rx
        positions[i3 + 1] = ry
        positions[i3 + 2] = Math.sin(branchAngle) * radius + rz

        // Warm core → royal blue → indigo/violet rim
        const distRatio = radius / galaxyRadius
        let color: THREE.Color
        if (distRatio < 0.32) {
          color = innerColor.clone().lerp(midColor, distRatio / 0.32)
        } else {
          color = midColor.clone().lerp(outerColor, (distRatio - 0.32) / 0.68)
        }
        // Sparse soft-cyan and muted-magenta sprinkles keep the arms alive, never neon
        const roll = Math.random()
        if (distRatio > 0.4 && roll < 0.07) {
          color.lerp(accentColor, 0.7)
        } else if (distRatio > 0.35 && roll < 0.12) {
          color.lerp(magentaColor, 0.55)
        }
        const brightness = 0.32 + Math.random() * 0.6
        colors[i3] = color.r * brightness
        colors[i3 + 1] = color.g * brightness
        colors[i3 + 2] = color.b * brightness

        i++
      }
    }

    // Core stars (dense cluster)
    for (let s = 0; s < 1600; s++) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 2) * 60
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5
      positions[i3 + 2] = r * Math.cos(phi)

      const color = innerColor.clone().lerp(midColor, r / 60)
      const brightness = 0.5 + Math.random() * 0.5
      colors[i3] = color.r * brightness
      colors[i3 + 1] = color.g * brightness
      colors[i3 + 2] = color.b * brightness

      i++
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      // Compact points so the dense spiral reads as structure, not blur
      size: 4.6,
      map: softTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    // Warm core glow
    const coreGeo = new THREE.SphereGeometry(30, 16, 16)
    const coreMat = new THREE.MeshBasicMaterial({
      color: '#ffd9a8',
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    // Soft inner halo + flattened dust glow give the spiral subtle cloudy structure
    const hazeGeo = new THREE.SphereGeometry(72, 16, 16)
    const hazeMat = new THREE.MeshBasicMaterial({
      color: '#6a7ad8',
      transparent: true,
      opacity: 0.075,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
    const diskGeo = new THREE.SphereGeometry(220, 16, 16)
    const diskMat = new THREE.MeshBasicMaterial({
      color: '#4a5fc0',
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    return {
      geometry: geo,
      material: mat,
      coreGeometry: coreGeo,
      coreMaterial: coreMat,
      hazeGeometry: hazeGeo,
      hazeMaterial: hazeMat,
      diskGeometry: diskGeo,
      diskMaterial: diskMat,
    }
  }, [softTexture])

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += 0.005 * delta
  })

  // Landmark sits far ahead (+Z is the direction the camera faces) and high-left,
  // tilted so the spiral face is visible instead of edge-on
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <points ref={ref} geometry={geometry} material={material} />
      <mesh geometry={coreGeometry} material={coreMaterial} />
      <mesh geometry={hazeGeometry} material={hazeMaterial} />
      <mesh geometry={diskGeometry} material={diskMaterial} scale={[1, 0.3, 1]} />
    </group>
  )
}
