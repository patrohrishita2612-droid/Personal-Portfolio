import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Soft round sprite for the majority of stars
function makeStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create the starfield texture.')

  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.12, 'rgba(255, 255, 255, 0.9)')
  gradient.addColorStop(0.38, 'rgba(255, 255, 255, 0.3)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 32, 32)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Four-point diffraction spikes for the few brightest stars — like a real astrophotograph
function makeSpikeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to create the star spike texture.')

  const core = context.createRadialGradient(32, 32, 0, 32, 32, 32)
  core.addColorStop(0, 'rgba(255, 255, 255, 1)')
  core.addColorStop(0.09, 'rgba(255, 255, 255, 0.8)')
  core.addColorStop(0.3, 'rgba(255, 255, 255, 0.14)')
  core.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = core
  context.fillRect(0, 0, 64, 64)

  // Tapered spike: widest at the core, fading to a point
  const spike = (angle: number, length: number, baseWidth: number) => {
    context.save()
    context.translate(32, 32)
    context.rotate(angle)
    const fade = context.createRadialGradient(0, 0, 0, 0, 0, length)
    fade.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
    fade.addColorStop(0.5, 'rgba(255, 255, 255, 0.26)')
    fade.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = fade
    context.beginPath()
    context.moveTo(0, -baseWidth)
    context.lineTo(length, 0)
    context.lineTo(0, baseWidth)
    context.closePath()
    context.fill()
    context.restore()
  }

  spike(0, 31, 2.6)
  spike(Math.PI, 31, 2.6)
  spike(Math.PI / 2, 31, 2.6)
  spike(-Math.PI / 2, 31, 2.6)
  const diagonal = Math.PI / 4
  spike(diagonal, 17, 1.8)
  spike(Math.PI + diagonal, 17, 1.8)
  spike(-diagonal, 17, 1.8)
  spike(Math.PI - diagonal, 17, 1.8)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export default function Starfield() {
  const starTexture = useMemo(makeStarTexture, [])
  const spikeTexture = useMemo(makeSpikeTexture, [])

  // === Far star layer — many tiny, faint, warm-white points ===
  const farStars = useMemo(() => {
    const count = 12000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#fbf6ec'),
      new THREE.Color('#fbf6ec'),
      new THREE.Color('#f8efdc'),
      new THREE.Color('#f8efdc'),
      new THREE.Color('#f3e3bd'),
      new THREE.Color('#eccf8f'),
      new THREE.Color('#dfe6ff'),
      new THREE.Color('#cfeaf2'),
      new THREE.Color('#f3d9df'),
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 800 + Math.random() * 2000
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      const color = palette[Math.floor(Math.random() * palette.length)]
      const brightness = 0.26 + Math.random() * 0.46
      colors[i3] = color.r * brightness
      colors[i3 + 1] = color.g * brightness
      colors[i3 + 2] = color.b * brightness
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.9,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    return { geo, mat }
  }, [starTexture])

  // === Mid star layer — medium visible stars ===
  const midStars = useMemo(() => {
    const count = 3500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#fdfaf4'),
      new THREE.Color('#fbf4e5'),
      new THREE.Color('#f7ebc9'),
      new THREE.Color('#f0d391'),
      new THREE.Color('#e8b772'),
      new THREE.Color('#dfe6ff'),
      new THREE.Color('#c9e7f0'),
      new THREE.Color('#eed4dc'),
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 300 + Math.random() * 600
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      const color = palette[Math.floor(Math.random() * palette.length)]
      const brightness = 0.4 + Math.random() * 0.48
      colors[i3] = color.r * brightness
      colors[i3 + 1] = color.g * brightness
      colors[i3 + 2] = color.b * brightness
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 1.7,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    return { geo, mat }
  }, [starTexture])

  // === Bright near stars — a SMALL number with diffraction spikes ===
  const brightStars = useMemo(() => {
    const count = 240
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#fffaf0'),
      new THREE.Color('#fdf1d6'),
      new THREE.Color('#f7dda2'),
      new THREE.Color('#f2c778'),
      new THREE.Color('#f0d9b4'),
      new THREE.Color('#d3ecf4'),
      new THREE.Color('#f4dce3'),
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 120 + Math.random() * 480
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      const color = palette[Math.floor(Math.random() * palette.length)]
      const brightness = 0.7 + Math.random() * 0.3
      colors[i3] = color.r * brightness
      colors[i3 + 1] = color.g * brightness
      colors[i3 + 2] = color.b * brightness
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 4.5,
      map: spikeTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    return { geo, mat }
  }, [spikeTexture])

  // === Milky Way band — clustered stars along a tilted great circle ===
  // This is what makes the sky read like an astronomical photograph:
  // loose field hugging the plane + dense star clouds along it.
  const bandStars = useMemo(() => {
    const clusterCount = 14
    const perCluster = 520
    const looseCount = 3600
    const count = clusterCount * perCluster + looseCount
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#fbf6ec'),
      new THREE.Color('#f8efdc'),
      new THREE.Color('#f3e3bd'),
      new THREE.Color('#eccf8f'),
      new THREE.Color('#dfe6ff'),
      new THREE.Color('#cfeaf2'),
      new THREE.Color('#f3d9df'),
    ]

    // Band basis: a gently tilted plane crossing the sky diagonally
    const bandNormal = new THREE.Vector3(0.35, 1, 0.22).normalize()
    const axisA = new THREE.Vector3(1, 0, 0).cross(bandNormal).normalize()
    const axisB = bandNormal.clone().cross(axisA).normalize()

    const write = (index: number, centre: THREE.Vector3, spread: number, bright: number) => {
      const i3 = index * 3
      // Sum-of-uniforms ≈ gaussian so stars clump instead of spreading evenly
      const gx = (Math.random() + Math.random() + Math.random() - 1.5) * spread
      const gy = (Math.random() + Math.random() + Math.random() - 1.5) * spread
      const gz = (Math.random() + Math.random() + Math.random() - 1.5) * spread
      positions[i3] = centre.x + gx
      positions[i3 + 1] = centre.y + gy
      positions[i3 + 2] = centre.z + gz

      const color = palette[Math.floor(Math.random() * palette.length)]
      const brightness = bright * (0.45 + Math.random() * 0.55)
      colors[i3] = color.r * brightness
      colors[i3 + 1] = color.g * brightness
      colors[i3 + 2] = color.b * brightness
    }

    let i = 0
    // Loose field hugging the band plane
    for (let s = 0; s < looseCount; s++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 500 + Math.pow(Math.random(), 0.7) * 2100
      const height = (Math.random() + Math.random() + Math.random() - 1.5) * 260
      const centre = new THREE.Vector3()
        .addScaledVector(axisA, Math.cos(angle) * radius)
        .addScaledVector(axisB, Math.sin(angle) * radius)
        .addScaledVector(bandNormal, height)
      write(i++, centre, 14, 0.34 + Math.random() * 0.4)
    }

    // Dense star clouds — the bright clumps you see in deep-sky photos
    for (let c = 0; c < clusterCount; c++) {
      const angle = (c / clusterCount) * Math.PI * 2 + Math.random() * 0.5
      const radius = 700 + Math.random() * 1700
      const centre = new THREE.Vector3()
        .addScaledVector(axisA, Math.cos(angle) * radius)
        .addScaledVector(axisB, Math.sin(angle) * radius)
        .addScaledVector(bandNormal, (Math.random() - 0.5) * 180)
      const spread = 90 + Math.random() * 130
      for (let s = 0; s < perCluster; s++) {
        write(i++, centre, spread, 0.4 + Math.random() * 0.6)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 1.2,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    return { geo, mat }
  }, [starTexture])

  // === Close drifting dust (subtle, slow) ===
  const dustRef = useRef<THREE.Points>(null)
  const dust = useMemo(() => {
    const count = 1100
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#8a6437'),
      new THREE.Color('#8f5a5c'),
      new THREE.Color('#4c3d90'),
      new THREE.Color('#1f6d76'),
      new THREE.Color('#2f5a95'),
      new THREE.Color('#8b6b4f'),
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 20 + Math.random() * 200
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      const color = palette[Math.floor(Math.random() * palette.length)]
      const brightness = 0.25 + Math.random() * 0.35
      colors[i3] = color.r * brightness
      colors[i3 + 1] = color.g * brightness
      colors[i3 + 2] = color.b * brightness

      velocities[i3] = (Math.random() - 0.5) * 0.3
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.3
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.3
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.userData = { velocities }

    const mat = new THREE.PointsMaterial({
      size: 1.1,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })

    return { geo, mat }
  }, [starTexture])

  // Slowly drift dust particles
  useFrame((_, delta) => {
    if (!dustRef.current) return
    const dt = Math.min(delta, 0.05)
    const posAttr = dustRef.current.geometry.attributes.position as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array
    const velocities = dust.geo.userData.velocities as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i] * dt
      positions[i + 1] += velocities[i + 1] * dt
      positions[i + 2] += velocities[i + 2] * dt
    }
    posAttr.needsUpdate = true
  })

  return (
    <group>
      {/* Far layer */}
      <points geometry={farStars.geo} material={farStars.mat} />
      {/* Milky Way band with clusters */}
      <points geometry={bandStars.geo} material={bandStars.mat} />
      {/* Mid layer */}
      <points geometry={midStars.geo} material={midStars.mat} />
      {/* Bright spiked stars */}
      <points geometry={brightStars.geo} material={brightStars.mat} />
      {/* Glowing dust */}
      <points ref={dustRef} geometry={dust.geo} material={dust.mat} />
    </group>
  )
}
