import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetPalette } from './destinations'

// ---------------------------------------------------------------------------
// Decorative distant bodies. Non-interactive, no point lights — they are lit
// by the scene's directional sun and hazed by distance fog, which gives the
// mid/far field real depth without cluttering the flight paths.
// ---------------------------------------------------------------------------

type SceneryPlanetProps = {
  position: [number, number, number]
  palette: PlanetPalette
  radius?: number
  spin?: number
}

function SceneryPlanet({ position, palette, radius = 40, spin = 0.01 }: SceneryPlanetProps) {
  const groupRef = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(radius, 3)
    const positions = geo.getAttribute('position')
    const colors = new Float32Array(positions.count * 3)

    const deep = new THREE.Color(palette.deep)
    const mid = new THREE.Color(palette.mid)
    const light = new THREE.Color(palette.light)
    const pole = new THREE.Color(palette.pole)

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) / radius
      const y = positions.getY(i) / radius
      const z = positions.getZ(i) / radius
      const longitude = Math.atan2(z, x)

      // Soft continents + broken latitude banding — varied, never flat
      const grain = Math.sin(longitude * 6.1 + y * 9.4) * Math.cos(longitude * 4.7 - y * 7.2)
      const band = 0.5 + 0.5 * Math.sin(y * 6.5 + Math.sin(longitude * 2.4))

      const color = deep.clone().lerp(mid, 0.25 + 0.4 * band + 0.2 * grain)
      const patch = Math.max(0, Math.sin(longitude * 2.2 + y * 3.6 + grain) - 0.25)
      color.lerp(light, Math.min(0.7, patch))
      const polar = Math.max(0, (Math.abs(y) - 0.7) / 0.3)
      color.lerp(pole, Math.min(0.85, polar))

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [radius, palette])

  const atmosphereGeo = useMemo(
    () => new THREE.SphereGeometry(radius * 1.3, 24, 24),
    [radius],
  )

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += spin * delta
  })

  return (
    <group position={position}>
      <group ref={groupRef}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color="#ffffff"
            vertexColors
            metalness={0.12}
            roughness={0.68}
            emissive="#05081c"
            emissiveIntensity={0.3}
            flatShading
          />
        </mesh>
        <mesh geometry={atmosphereGeo}>
          <meshBasicMaterial
            color={palette.light}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>
    </group>
  )
}

export default function Scenery() {
  return (
    <group>
      {/* Warm giant off the starboard bow (ahead-right) */}
      <SceneryPlanet
        position={[1450, 260, 950]}
        radius={46}
        spin={0.012}
        palette={{ deep: '#4a2c12', mid: '#a86a32', light: '#e8b06a', accent: '#ffd9a8', pole: '#fff2dc' }}
      />
      {/* Violet giant rear starboard — landmark when the player turns around */}
      <SceneryPlanet
        position={[-865, -180, -1500]}
        radius={64}
        spin={0.008}
        palette={{ deep: '#2a1a58', mid: '#6a4ab8', light: '#a88ae0', accent: '#e0b8f0', pole: '#efe8ff' }}
      />
      {/* Cool teal body low behind */}
      <SceneryPlanet
        position={[520, -520, -1550]}
        radius={38}
        spin={0.015}
        palette={{ deep: '#0c3440', mid: '#1f7f90', light: '#5ac8d4', accent: '#a8ecf0', pole: '#e8fbff' }}
      />
      {/* Far royal-blue world high ahead-left, near the primary galaxy */}
      <SceneryPlanet
        position={[-880, 620, 1750]}
        radius={56}
        spin={0.006}
        palette={{ deep: '#12245f', mid: '#2f5ac9', light: '#7fa8e8', accent: '#c8dcf8', pole: '#f4f8ff' }}
      />
    </group>
  )
}
