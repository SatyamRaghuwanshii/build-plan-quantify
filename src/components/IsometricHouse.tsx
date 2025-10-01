import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface HousePartsProps {
  buildProgress: number;
  isDragging: boolean;
}

// Easing function for smooth animations
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const ModernHouse = ({ buildProgress, isDragging }: HousePartsProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Continuous rotation when not dragging
  useFrame(() => {
    if (groupRef.current && !isDragging) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  // Foundation/Base (0-15%)
  const baseProgress = Math.min(buildProgress / 0.15, 1);
  const baseScale = easeOutCubic(baseProgress);
  const baseY = -3 + (baseProgress * 0.5);
  
  // Ground Floor (15-35%)
  const groundFloorProgress = Math.max(0, Math.min((buildProgress - 0.15) / 0.2, 1));
  const groundFloorScale = easeOutCubic(groundFloorProgress);
  const groundFloorY = -2 + (groundFloorProgress * 0.8);
  
  // Second Floor (35-55%)
  const secondFloorProgress = Math.max(0, Math.min((buildProgress - 0.35) / 0.2, 1));
  const secondFloorScale = easeOutCubic(secondFloorProgress);
  const secondFloorY = 0 + (secondFloorProgress * 0.8);
  
  // Roof (55-75%)
  const roofProgress = Math.max(0, Math.min((buildProgress - 0.55) / 0.2, 1));
  const roofScale = easeOutCubic(roofProgress);
  const roofY = 1.5 + (roofProgress * 0.5);
  
  // Details (75-100%)
  const detailsProgress = Math.max(0, Math.min((buildProgress - 0.75) / 0.25, 1));
  const detailsScale = easeOutCubic(detailsProgress);

  return (
    <group ref={groupRef}>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-8, 10, -8]} intensity={0.6} />
      <spotLight position={[0, 20, 0]} intensity={0.5} angle={0.3} penumbra={1} />
      <hemisphereLight args={['#87CEEB', '#8B7355', 0.3]} />

      {/* Foundation/Deck Base */}
      {baseProgress > 0 && (
        <group position={[0, baseY, 0]} scale={[baseScale, baseScale, baseScale]}>
          <mesh position={[0, -0.2, 0]} receiveShadow>
            <boxGeometry args={[8, 0.3, 6]} />
            <meshStandardMaterial 
              color="#C4A57B" 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
          {/* Wooden deck texture simulation */}
          <mesh position={[1, -0.05, 1]} receiveShadow>
            <boxGeometry args={[3, 0.05, 2.5]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.9}
            />
          </mesh>
        </group>
      )}

      {/* Ground Floor - Left Section with Textured Wall */}
      {groundFloorProgress > 0 && (
        <group position={[0, groundFloorY, 0]} scale={[groundFloorScale, groundFloorScale, groundFloorScale]}>
          {/* Textured left section */}
          <mesh position={[-2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 2, 4]} />
            <meshStandardMaterial 
              color="#4A4A4A" 
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          
          {/* White right section */}
          <mesh position={[1.5, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 2, 4]} />
            <meshStandardMaterial 
              color="#F5F5F5" 
              roughness={0.7}
            />
          </mesh>

          {/* Large Windows with warm glow */}
          {detailsProgress > 0 && (
            <>
              <mesh position={[-2, 0, 2.01]} scale={detailsScale}>
                <boxGeometry args={[1.2, 1.5, 0.05]} />
                <meshStandardMaterial 
                  color="#FFE4B5"
                  emissive="#FFA500"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              <mesh position={[-2, 0, -2.01]} scale={detailsScale}>
                <boxGeometry args={[1.2, 1.5, 0.05]} />
                <meshStandardMaterial 
                  color="#FFE4B5"
                  emissive="#FFA500"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              <mesh position={[1.5, 0, 2.01]} scale={detailsScale}>
                <boxGeometry args={[1, 1.3, 0.05]} />
                <meshStandardMaterial 
                  color="#FFE4B5"
                  emissive="#FFA500"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* Second Floor - Upper white section */}
      {secondFloorProgress > 0 && (
        <group position={[0, secondFloorY, 0]} scale={[secondFloorScale, secondFloorScale, secondFloorScale]}>
          <mesh position={[1, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[4, 1.6, 3.5]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              roughness={0.6}
            />
          </mesh>

          {/* Upper windows */}
          {detailsProgress > 0 && (
            <>
              <mesh position={[0.5, 2, 1.76]} scale={detailsScale}>
                <boxGeometry args={[0.8, 1, 0.05]} />
                <meshStandardMaterial 
                  color="#FFE4B5"
                  emissive="#FFA500"
                  emissiveIntensity={0.2}
                  transparent
                  opacity={0.7}
                />
              </mesh>
              <mesh position={[2, 2, 1.76]} scale={detailsScale}>
                <boxGeometry args={[0.8, 1, 0.05]} />
                <meshStandardMaterial 
                  color="#FFE4B5"
                  emissive="#FFA500"
                  emissiveIntensity={0.2}
                  transparent
                  opacity={0.7}
                />
              </mesh>
              <mesh position={[1.5, 2, 0]} scale={detailsScale}>
                <boxGeometry args={[0.7, 0.9, 0.05]} />
                <meshStandardMaterial 
                  color="#FFE4B5"
                  emissive="#FFA500"
                  emissiveIntensity={0.2}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* Flat Roofs */}
      {roofProgress > 0 && (
        <group position={[0, roofY, 0]} scale={[roofScale, roofScale, roofScale]}>
          {/* Lower roof section */}
          <mesh position={[-2, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.15, 4.2]} />
            <meshStandardMaterial 
              color="#2C2C2C" 
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          
          {/* Upper roof section */}
          <mesh position={[1, 2.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.2, 0.15, 3.7]} />
            <meshStandardMaterial 
              color="#2C2C2C" 
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
        </group>
      )}

      {/* Terrace/Deck Extension */}
      {detailsProgress > 0 && (
        <group scale={detailsScale}>
          <mesh position={[3.5, -1.85, 1]} receiveShadow>
            <boxGeometry args={[2, 0.1, 2]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.9}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const IsometricHouse = () => {
  const [buildProgress, setBuildProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      let progress = 0;
      
      // Calculate progress based on how much the section has been scrolled through
      if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
        // Element is in viewport
        const scrolledIntoView = Math.max(0, windowHeight - sectionTop);
        const totalScrollDistance = windowHeight + sectionHeight;
        progress = Math.min(scrolledIntoView / totalScrollDistance, 1);
      } else if (sectionTop <= -sectionHeight) {
        // Element has been fully scrolled past
        progress = 1;
      }
      
      setBuildProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={sectionRef} className="w-full h-[600px] relative">
      <Canvas
        shadows
        camera={{
          position: [12, 8, 12],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <ModernHouse buildProgress={buildProgress} isDragging={isDragging} />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minDistance={8}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2}
          onStart={() => setIsDragging(true)}
          onEnd={() => setIsDragging(false)}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full border pointer-events-none">
        <p className="text-sm font-medium">
          Building Progress: {Math.round(buildProgress * 100)}%
        </p>
      </div>
      
      {/* Controls hint */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border text-xs pointer-events-none">
        <p className="font-medium">🖱️ Drag to rotate</p>
      </div>
    </div>
  );
};
