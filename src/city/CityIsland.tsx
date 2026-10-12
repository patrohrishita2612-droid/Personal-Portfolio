import { useMemo } from 'react'

export default function CityIsland() {
  // Road dashed lines geometry
  const roadLines = useMemo(() => {
    const lines: Array<{ position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] }> = []
    
    // Horizontal main avenue (Z = 0)
    for (let x = -26; x <= 26; x += 3.2) {
      if (Math.abs(x) < 4 || Math.abs(x - 9) < 2 || Math.abs(x + 9) < 2) continue
      lines.push({
        position: [x, 0.04, 0],
        rotation: [-Math.PI / 2, 0, 0],
        scale: [1.6, 0.22, 1],
      })
    }

    // Vertical main boulevard (X = 0)
    for (let z = -26; z <= 26; z += 3.2) {
      if (Math.abs(z) < 4 || Math.abs(z - 9) < 2 || Math.abs(z + 9) < 2) continue
      lines.push({
        position: [0, 0.04, z],
        rotation: [-Math.PI / 2, 0, Math.PI / 2],
        scale: [1.6, 0.22, 1],
      })
    }

    // Outer cross streets
    for (let x = -24; x <= 24; x += 3.5) {
      lines.push({ position: [x, 0.04, 10], rotation: [-Math.PI / 2, 0, 0], scale: [1.4, 0.18, 1] })
      lines.push({ position: [x, 0.04, -10], rotation: [-Math.PI / 2, 0, 0], scale: [1.4, 0.18, 1] })
    }
    for (let z = -24; z <= 24; z += 3.5) {
      lines.push({ position: [9, 0.04, z], rotation: [-Math.PI / 2, 0, Math.PI / 2], scale: [1.4, 0.18, 1] })
      lines.push({ position: [-9, 0.04, z], rotation: [-Math.PI / 2, 0, Math.PI / 2], scale: [1.4, 0.18, 1] })
    }

    return lines
  }, [])

  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. Deep Pedestal Base (Subterranean foundation of the miniature diorama) */}
      <mesh position={[0, -2.5, 0]} receiveShadow>
        <boxGeometry args={[58, 4, 58]} />
        <meshStandardMaterial
          color="#060b1c"
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>

      {/* 2. Top Island Slab (Sidewalks & pavement layer) */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[56, 0.8, 56]} />
        <meshStandardMaterial
          color="#0e1736"
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* Perimeter Curb Accent Light Rim */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[56.2, 0.08, 56.2]} />
        <meshBasicMaterial color="#1e2c56" />
      </mesh>

      {/* 3. Main Roads (Dark asphalt) */}
      {/* Avenue East-West */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[54, 4.8]} />
        <meshStandardMaterial
          color="#0a1024"
          roughness={0.9}
        />
      </mesh>
      {/* Boulevard North-South */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[54, 4.8]} />
        <meshStandardMaterial
          color="#0a1024"
          roughness={0.9}
        />
      </mesh>

      {/* Secondary Streets */}
      <mesh position={[0, 0.02, 10]} receiveShadow>
        <planeGeometry args={[54, 3.4]} />
        <meshStandardMaterial color="#0a1024" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, -10]} receiveShadow>
        <planeGeometry args={[54, 3.4]} />
        <meshStandardMaterial color="#0a1024" roughness={0.9} />
      </mesh>
      <mesh position={[9, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[54, 3.4]} />
        <meshStandardMaterial color="#0a1024" roughness={0.9} />
      </mesh>
      <mesh position={[-9, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[54, 3.4]} />
        <meshStandardMaterial color="#0a1024" roughness={0.9} />
      </mesh>

      {/* 4. Dashed Road Markings */}
      {roadLines.map((line, idx) => (
        <mesh
          key={idx}
          position={line.position}
          rotation={line.rotation}
          scale={line.scale}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ffdc8a" transparent opacity={0.65} />
        </mesh>
      ))}

      {/* 5. Central Plaza Roundabout / Paved Circle */}
      <group position={[0, 0.03, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5.5, 32]} />
          <meshStandardMaterial color="#141f42" roughness={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.2, 5.5, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.8, 24]} />
          <meshStandardMaterial color="#0d1b3a" roughness={0.5} />
        </mesh>
        {/* Fountain / Plaza Core Basin */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[2, 2.2, 0.25, 24]} />
          <meshStandardMaterial color="#162952" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.08, 24]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#1e40af"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* 6. City District Plaza Pads / Lawn Patches */}
      {/* Northwest Park Lawn (near Skills) */}
      <mesh position={[-16, 0.03, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#0f2622" roughness={0.9} />
      </mesh>

      {/* Northeast Academy Lawn (near Education) */}
      <mesh position={[16, 0.03, 15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 8.5]} />
        <meshStandardMaterial color="#132e23" roughness={0.85} />
      </mesh>

      {/* Southeast Heritage Park Lawn (near Achievements) */}
      <mesh position={[15, 0.03, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 9]} />
        <meshStandardMaterial color="#122c22" roughness={0.9} />
      </mesh>

      {/* Southwest Innovation Terrace (near Projects / Telecom) */}
      <mesh position={[-16, 0.03, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 9]} />
        <meshStandardMaterial color="#151d38" roughness={0.7} />
      </mesh>
    </group>
  )
}
