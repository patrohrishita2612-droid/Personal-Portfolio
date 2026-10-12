import { useMemo } from 'react'

type BuildingSpec = {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  roofColor: string
  windowColor: string
}

export default function CityBuildings() {
  // Procedural background buildings placed across the city grid blocks
  const buildings = useMemo<BuildingSpec[]>(() => {
    return [
      // Block A: Northwest residential & commercial cluster (around x: -6 to -12, z: 4 to 8)
      { position: [-6, 3, 5], size: [2.6, 6, 2.6], color: '#131e3b', roofColor: '#1c2b54', windowColor: '#fbbf24' },
      { position: [-9, 2.2, 5.5], size: [2.4, 4.4, 2.2], color: '#182444', roofColor: '#22335f', windowColor: '#fde047' },
      { position: [-6, 2, 8.5], size: [2.5, 4, 2.4], color: '#111b33', roofColor: '#19284a', windowColor: '#f59e0b' },
      { position: [-9, 3.8, 8.5], size: [2.8, 7.6, 2.5], color: '#152140', roofColor: '#1e3059', windowColor: '#fbbf24' },

      // Block B: North-central apartments (around x: -2 to 4, z: 6 to 10)
      { position: [-2, 2.8, 7], size: [2.6, 5.6, 2.4], color: '#192647', roofColor: '#243763', windowColor: '#fde047' },
      { position: [2.4, 3.4, 7], size: [2.8, 6.8, 2.6], color: '#121c38', roofColor: '#1a284e', windowColor: '#fbbf24' },
      { position: [2.4, 2, 10], size: [2.6, 4, 2.2], color: '#172242', roofColor: '#21315b', windowColor: '#f59e0b' },
      { position: [-2, 1.8, 10.2], size: [2.4, 3.6, 2.2], color: '#101a33', roofColor: '#182647', windowColor: '#fbbf24' },

      // Block C: Northeast educational offices (around x: 6 to 10, z: 4 to 8)
      { position: [6, 3, 5], size: [2.6, 6, 2.4], color: '#172342', roofColor: '#21335e', windowColor: '#fde047' },
      { position: [9, 2.4, 5.2], size: [2.2, 4.8, 2.2], color: '#131d38', roofColor: '#1b2a4e', windowColor: '#fbbf24' },
      { position: [6, 2, 8.6], size: [2.4, 4, 2.4], color: '#192547', roofColor: '#233561', windowColor: '#f59e0b' },
      { position: [9, 3.6, 8.8], size: [2.6, 7.2, 2.6], color: '#111b36', roofColor: '#1a274c', windowColor: '#fde047' },

      // Block D: East corporate corridor (around x: 14 to 22, z: 2 to 8)
      { position: [14, 4.5, 5], size: [3, 9, 2.8], color: '#14203d', roofColor: '#1d2d54', windowColor: '#38bdf8' },
      { position: [18, 3.5, 6], size: [2.8, 7, 2.6], color: '#192649', roofColor: '#243764', windowColor: '#fde047' },
      { position: [22, 2.8, 5.5], size: [2.6, 5.6, 2.4], color: '#121c36', roofColor: '#1a284c', windowColor: '#fbbf24' },

      // Block E: Southeast business blocks (around x: 6 to 11, z: -4 to -8)
      { position: [6, 3.2, -5.5], size: [2.6, 6.4, 2.6], color: '#15203d', roofColor: '#1f2e54', windowColor: '#fbbf24' },
      { position: [9, 2.6, -5], size: [2.4, 5.2, 2.2], color: '#182444', roofColor: '#233460', windowColor: '#f59e0b' },
      { position: [6, 2.2, -8.5], size: [2.4, 4.4, 2.4], color: '#121b36', roofColor: '#19274c', windowColor: '#fde047' },
      { position: [9, 4, -8.5], size: [2.8, 8, 2.6], color: '#141e3a', roofColor: '#1d2b51', windowColor: '#fbbf24' },

      // Block F: South civic parkway (around x: -4 to 4, z: -5 to -10)
      { position: [-4, 2.4, -6.5], size: [2.6, 4.8, 2.4], color: '#192647', roofColor: '#243662', windowColor: '#fde047' },
      { position: [3, 3, -6.5], size: [2.8, 6, 2.6], color: '#131e3b', roofColor: '#1c2b52', windowColor: '#fbbf24' },
      { position: [-5, 1.8, -9.5], size: [2.4, 3.6, 2.2], color: '#111a33', roofColor: '#182647', windowColor: '#f59e0b' },
      { position: [3.5, 2, -10], size: [2.6, 4, 2.4], color: '#162240', roofColor: '#203058', windowColor: '#fbbf24' },

      // Block G: Southwest arts and residential (around x: -6 to -11, z: -5 to -8)
      { position: [-6, 3.2, -5], size: [2.6, 6.4, 2.6], color: '#15203d', roofColor: '#1e2d54', windowColor: '#fde047' },
      { position: [-9, 2.2, -5.2], size: [2.4, 4.4, 2.2], color: '#182342', roofColor: '#23325c', windowColor: '#fbbf24' },
      { position: [-6, 2, -8.5], size: [2.4, 4, 2.4], color: '#111a33', roofColor: '#182649', windowColor: '#f59e0b' },
      { position: [-9, 3.8, -8.5], size: [2.8, 7.6, 2.6], color: '#16223e', roofColor: '#203056', windowColor: '#fde047' },

      // Block H: West industrial & tech lofts (around x: -14 to -22, z: 2 to 8)
      { position: [-19, 3.2, 5], size: [3, 6.4, 2.8], color: '#141f3b', roofColor: '#1d2c52', windowColor: '#2dd4bf' },
      { position: [-22, 2.5, 6], size: [2.6, 5, 2.4], color: '#182442', roofColor: '#23335b', windowColor: '#fbbf24' },
      { position: [-19, 2, 9], size: [2.6, 4, 2.6], color: '#101a30', roofColor: '#172545', windowColor: '#fde047' },
    ]
  }, [])

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.position}>
          {/* Main Building Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.65}
              metalness={0.2}
            />
          </mesh>

          {/* Roof Parapet / Cap */}
          <mesh position={[0, b.size[1] / 2 + 0.1, 0]}>
            <boxGeometry args={[b.size[0] * 0.95, 0.2, b.size[2] * 0.95]} />
            <meshStandardMaterial color={b.roofColor} roughness={0.5} />
          </mesh>

          {/* Glowing Windows Facing South (+Z) */}
          <mesh position={[0, 0, b.size[2] / 2 + 0.02]}>
            <planeGeometry args={[b.size[0] * 0.75, b.size[1] * 0.75]} />
            <meshBasicMaterial color={b.windowColor} transparent opacity={0.78} />
          </mesh>

          {/* Glowing Windows Facing North (-Z) */}
          <mesh position={[0, 0, -b.size[2] / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[b.size[0] * 0.75, b.size[1] * 0.75]} />
            <meshBasicMaterial color={b.windowColor} transparent opacity={0.68} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
