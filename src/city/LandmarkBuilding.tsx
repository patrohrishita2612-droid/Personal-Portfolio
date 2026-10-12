import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { LandmarkDistrict } from './cityData'
import './LandmarkBadge.css'

type Props = {
  landmark: LandmarkDistrict
  isSelected: boolean
  onSelect: (id: string) => void
}

export default function LandmarkBuilding({ landmark, isSelected, onSelect }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const beaconRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    // Subtle hover float
    if (groupRef.current) {
      const targetY = isSelected ? 0.35 : hovered ? 0.2 : 0
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 8 * delta
    }
    // Rotating beacon
    if (beaconRef.current) {
      beaconRef.current.rotation.y += 1.8 * delta
    }
  })

  const { id, subtitle, position, accent, icon, badgeText } = landmark

  return (
    <group
      position={position}
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Selection / Hover Accent Ground Decal Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[3.2, 3.6, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={isSelected ? 0.9 : hovered ? 0.6 : 0.2}
        />
      </mesh>

      {/* Upward Spotlight Beam when Selected */}
      {isSelected && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 7, 0]}>
            <cylinderGeometry args={[1.5, 3.8, 14, 16, 1, true]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.16}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <pointLight color={accent} intensity={35} distance={20} position={[0, 4, 0]} />
        </group>
      )}

      {/* -------------------- ARCHITECTURAL MODELS -------------------- */}

      {id === 'about' && (
        /* 1. CIVIC CLOCK TOWER & CITY HALL (ABOUT ME) */
        <group>
          {/* Main hall base */}
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[5, 3.6, 4.4]} />
            <meshStandardMaterial color="#1b2548" roughness={0.6} />
          </mesh>
          {/* Windows row */}
          <mesh position={[0, 1.8, 2.22]}>
            <planeGeometry args={[4, 1.2]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <mesh position={[0, 1.8, -2.22]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[4, 1.2]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
          {/* Stepped middle tier */}
          <mesh position={[0, 4.2, 0]} castShadow>
            <boxGeometry args={[3.2, 2.2, 3.2]} />
            <meshStandardMaterial color="#22305c" roughness={0.5} />
          </mesh>
          {/* Clock tower spire */}
          <mesh position={[0, 6.8, 0]} castShadow>
            <boxGeometry args={[1.8, 3.8, 1.8]} />
            <meshStandardMaterial color="#2d3d72" roughness={0.4} />
          </mesh>
          {/* Glowing Clock Faces */}
          <mesh position={[0, 7.2, 0.92]}>
            <circleGeometry args={[0.55, 16]} />
            <meshBasicMaterial color="#e0f2fe" />
          </mesh>
          <mesh position={[0, 7.2, -0.92]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.55, 16]} />
            <meshBasicMaterial color="#e0f2fe" />
          </mesh>
          {/* Roof Pyramid */}
          <mesh position={[0, 9.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.3, 1.8, 4]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      )}

      {id === 'projects' && (
        /* 2. INNOVATION QUARTER (PROJECTS) */
        <group>
          {/* Studio Building 1 (Tall Glass Studio) */}
          <mesh position={[-1.2, 3.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 6.4, 3]} />
            <meshStandardMaterial color="#142142" roughness={0.4} metalness={0.4} />
          </mesh>
          {/* Illuminated Glass Windows Grid */}
          <mesh position={[-1.2, 3.2, 1.52]}>
            <planeGeometry args={[2.6, 5.4]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
          {/* Studio Building 2 (Low-rise Creative Lab) */}
          <mesh position={[1.8, 1.8, 0.4]} castShadow receiveShadow>
            <boxGeometry args={[2.8, 3.6, 2.8]} />
            <meshStandardMaterial color="#1a2b54" roughness={0.5} />
          </mesh>
          {/* Amber Glow Windows */}
          <mesh position={[1.8, 1.8, 1.82]}>
            <planeGeometry args={[2.2, 2.4]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
          </mesh>
          {/* Sky-bridge connecting both */}
          <mesh position={[0.3, 2.8, 0.4]}>
            <boxGeometry args={[1.6, 0.8, 1]} />
            <meshStandardMaterial color="#2dd4bf" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Rooftop Solar Grid / Innovation Sign */}
          <mesh position={[-1.2, 6.5, 0]} rotation={[-Math.PI / 6, 0, 0]}>
            <boxGeometry args={[2.4, 0.15, 1.8]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {id === 'skills' && (
        /* 3. DATA SYSTEMS TOWER (SKILLS) */
        <group>
          {/* Monolithic Server Tower */}
          <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.4, 9, 3.4]} />
            <meshStandardMaterial color="#0e1f38" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Cyan Vertical Server Light Strips */}
          <mesh position={[0, 4.5, 1.72]}>
            <planeGeometry args={[0.3, 7.8]} />
            <meshBasicMaterial color="#2dd4bf" />
          </mesh>
          <mesh position={[-0.8, 4.5, 1.72]}>
            <planeGeometry args={[0.15, 6.8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0.8, 4.5, 1.72]}>
            <planeGeometry args={[0.15, 6.8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Rooftop Cooling Array */}
          <mesh position={[0, 9.3, 0]}>
            <boxGeometry args={[2.8, 0.6, 2.8]} />
            <meshStandardMaterial color="#1a2e4c" roughness={0.6} />
          </mesh>
          {/* High Antenna Spire */}
          <mesh position={[0, 11, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 3, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Pulsing Beacon Light on Top */}
          <mesh position={[0, 12.5, 0]} ref={beaconRef}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshBasicMaterial color="#2dd4bf" />
          </mesh>
        </group>
      )}

      {id === 'education' && (
        /* 4. ACADEMY CAMPUS (EDUCATION) */
        <group>
          {/* Main Classical Hall */}
          <mesh position={[0, 2.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.4, 4.8, 3.6]} />
            <meshStandardMaterial color="#241e38" roughness={0.7} />
          </mesh>
          {/* Front Classical Portico & Pillars */}
          <group position={[0, 0, 2]}>
            <mesh position={[-1.8, 1.8, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 3.6, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </mesh>
            <mesh position={[-0.6, 1.8, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 3.6, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </mesh>
            <mesh position={[0.6, 1.8, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 3.6, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </mesh>
            <mesh position={[1.8, 1.8, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 3.6, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </mesh>
            {/* Pediment triangle */}
            <mesh position={[0, 4, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[2.8, 2.8, 0.4]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
            </mesh>
          </group>
          {/* Academic Roof with warm dormers */}
          <mesh position={[0, 5.2, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[3.2, 1.4, 4]} />
            <meshStandardMaterial color="#3b2d54" roughness={0.6} />
          </mesh>
          {/* Dome Cupola */}
          <mesh position={[0, 6.3, 0]}>
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      )}

      {id === 'experience' && (
        /* 5. CORPORATE HIGHRISE (EXPERIENCE) */
        <group>
          {/* Main Tower (12 units tall) */}
          <mesh position={[0, 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 12, 3.6]} />
            <meshStandardMaterial color="#151e36" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Multilevel Office Windows Grid (Warm amber + orange lit offices) */}
          <mesh position={[0, 6, 1.82]}>
            <planeGeometry args={[2.8, 10.4]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 6, -1.82]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[2.8, 10.4]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.85} />
          </mesh>
          {/* Top Architectural Crown */}
          <mesh position={[0, 12.6, 0]}>
            <boxGeometry args={[2.6, 1.2, 2.6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Communication Needle */}
          <mesh position={[0, 14, 0]}>
            <cylinderGeometry args={[0.06, 0.15, 2.2, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
        </group>
      )}

      {id === 'achievements' && (
        /* 6. HONORS OBSERVATORY (ACHIEVEMENTS) */
        <group>
          {/* Round Temple Base */}
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[2.6, 3, 3.6, 24]} />
            <meshStandardMaterial color="#2d2214" roughness={0.6} />
          </mesh>
          {/* Golden Ring Ribbon */}
          <mesh position={[0, 3.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.6, 0.15, 8, 32]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Illuminated Golden Dome */}
          <mesh position={[0, 4.4, 0]}>
            <sphereGeometry args={[2.4, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.6}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          {/* Front Obelisk Trophy Monument */}
          <mesh position={[0, 2, 3.6]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.4, 3.8, 4]} />
            <meshStandardMaterial color="#fef08a" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      )}

      {id === 'resume' && (
        /* 7. CITY ARCHIVES (RESUME) */
        <group>
          {/* Modern Cantilevered Pavilion Base */}
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.4, 3, 3.4]} />
            <meshStandardMaterial color="#1a203d" roughness={0.5} />
          </mesh>
          {/* Glass Reading Terrace */}
          <mesh position={[0, 1.5, 1.72]}>
            <planeGeometry args={[3.8, 2]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.75} />
          </mesh>
          {/* Cantilevered Floating Roof */}
          <mesh position={[0, 3.2, 0.4]} castShadow>
            <boxGeometry args={[5, 0.35, 4.2]} />
            <meshStandardMaterial color="#312e81" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Document / Archive Beacon Symbol on Roof */}
          <mesh position={[0, 4.2, 0]} rotation={[0, 0.3, 0]}>
            <boxGeometry args={[1.2, 1.6, 0.1]} />
            <meshStandardMaterial color="#c7d2fe" emissive="#818cf8" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {id === 'contact' && (
        /* 8. TELECOM TERMINAL & SPIRE (CONTACT) */
        <group>
          {/* Operations Bunker */}
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.8, 2.8, 3.4]} />
            <meshStandardMaterial color="#0f2628" roughness={0.6} />
          </mesh>
          {/* Green Glow Communications Screen */}
          <mesh position={[0, 1.4, 1.72]}>
            <planeGeometry args={[2.8, 1.6]} />
            <meshBasicMaterial color="#34d399" transparent opacity={0.8} />
          </mesh>
          {/* Triangular Lattice Transmission Mast */}
          <mesh position={[0, 6.2, 0]}>
            <cylinderGeometry args={[0.2, 0.7, 7, 3]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} wireframe />
          </mesh>
          {/* Satellite Dishes */}
          <mesh position={[0.8, 6.5, 0.4]} rotation={[0.4, 0.8, 0]}>
            <coneGeometry args={[0.7, 0.35, 16, 1, true]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.8, 8, -0.3]} rotation={[-0.4, -0.6, 0]}>
            <coneGeometry args={[0.6, 0.3, 16, 1, true]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Red/Green Beacon on top */}
          <mesh position={[0, 10, 0]} ref={beaconRef}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
        </group>
      )}

      {/* -------------------- FLOATING 3D HTML BADGE -------------------- */}
      <Html
        position={[0, id === 'experience' ? 14.5 : id === 'skills' ? 13 : 9.5, 0]}
        center
        distanceFactor={32}
        zIndexRange={[20, 0]}
      >
        <div
          className={`city-badge ${hovered ? 'is-hovered' : ''} ${isSelected ? 'is-selected' : ''}`}
          style={{ '--badge-accent': accent } as React.CSSProperties}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(id)
          }}
          role="button"
          tabIndex={0}
        >
          <div className="city-badge-pill">
            <span className="city-badge-icon">{icon}</span>
            <div className="city-badge-text">
              <span className="city-badge-name">{badgeText}</span>
              <span className="city-badge-sub">{subtitle}</span>
            </div>
            <span className="city-badge-arrow">➜</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
