import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HousePartsProps {
  buildProgress: number;
}

const HouseParts = ({ buildProgress }: HousePartsProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Foundation (0-20%)
  const foundationScale = Math.min(buildProgress / 0.2, 1);
  
  // Walls (20-50%)
  const wallsScale = Math.max(0, Math.min((buildProgress - 0.2) / 0.3, 1));
  
  // Roof (50-80%)
  const roofScale = Math.max(0, Math.min((buildProgress - 0.5) / 0.3, 1));
  
  // Details (80-100%)
  const detailsScale = Math.max(0, Math.min((buildProgress - 0.8) / 0.2, 1));

  return (
    <group ref={groupRef}>
      {/* Ambient Light */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />

      {/* Foundation */}
      {foundationScale > 0 && (
        <mesh position={[0, -1.5 + (foundationScale * 0.5), 0]} scale={[1, foundationScale, 1]}>
          <boxGeometry args={[4, 0.5, 3]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      )}

      {/* Walls */}
      {wallsScale > 0 && (
        <>
          {/* Front Wall */}
          <mesh position={[0, -1 + (wallsScale * 1), 1.5]} scale={[1, wallsScale, 1]}>
            <boxGeometry args={[4, 2, 0.2]} />
            <meshStandardMaterial color="#E8DCC8" />
          </mesh>
          
          {/* Back Wall */}
          <mesh position={[0, -1 + (wallsScale * 1), -1.5]} scale={[1, wallsScale, 1]}>
            <boxGeometry args={[4, 2, 0.2]} />
            <meshStandardMaterial color="#E8DCC8" />
          </mesh>
          
          {/* Left Wall */}
          <mesh position={[-2, -1 + (wallsScale * 1), 0]} scale={[1, wallsScale, 1]}>
            <boxGeometry args={[0.2, 2, 3]} />
            <meshStandardMaterial color="#D4C5B0" />
          </mesh>
          
          {/* Right Wall */}
          <mesh position={[2, -1 + (wallsScale * 1), 0]} scale={[1, wallsScale, 1]}>
            <boxGeometry args={[0.2, 2, 3]} />
            <meshStandardMaterial color="#D4C5B0" />
          </mesh>
        </>
      )}

      {/* Roof */}
      {roofScale > 0 && (
        <>
          {/* Left Roof Panel */}
          <mesh 
            position={[-1, 0.5 + (roofScale * 0.5), 0]} 
            rotation={[0, 0, Math.PI / 6]}
            scale={[1, roofScale, 1]}
          >
            <boxGeometry args={[2.5, 0.1, 3.2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          
          {/* Right Roof Panel */}
          <mesh 
            position={[1, 0.5 + (roofScale * 0.5), 0]} 
            rotation={[0, 0, -Math.PI / 6]}
            scale={[1, roofScale, 1]}
          >
            <boxGeometry args={[2.5, 0.1, 3.2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </>
      )}

      {/* Details - Door and Windows */}
      {detailsScale > 0 && (
        <>
          {/* Door */}
          <mesh position={[0, -0.5, 1.51]} scale={[detailsScale, detailsScale, 1]}>
            <boxGeometry args={[0.8, 1.6, 0.05]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          
          {/* Left Window */}
          <mesh position={[-1, 0, 1.51]} scale={[detailsScale, detailsScale, 1]}>
            <boxGeometry args={[0.6, 0.6, 0.05]} />
            <meshStandardMaterial color="#87CEEB" opacity={0.6} transparent />
          </mesh>
          
          {/* Right Window */}
          <mesh position={[1, 0, 1.51]} scale={[detailsScale, detailsScale, 1]}>
            <boxGeometry args={[0.6, 0.6, 0.05]} />
            <meshStandardMaterial color="#87CEEB" opacity={0.6} transparent />
          </mesh>
        </>
      )}
    </group>
  );
};

export const IsometricHouse = () => {
  const [buildProgress, setBuildProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on section visibility
      // Start building when section enters viewport from bottom
      // Finish when section exits from top
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Progress from 0 to 1 as section scrolls through viewport
      let progress = 0;
      
      if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
        // Section is visible
        const visibleAmount = windowHeight - sectionTop;
        progress = Math.min(visibleAmount / (windowHeight + sectionHeight), 1);
      } else if (sectionTop <= -sectionHeight) {
        // Section has passed
        progress = 1;
      }
      
      setBuildProgress(progress);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={sectionRef} className="w-full h-[600px] relative">
      <Canvas
        orthographic
        camera={{
          zoom: 80,
          position: [10, 10, 10],
          near: 0.1,
          far: 1000,
        }}
      >
        <HouseParts buildProgress={buildProgress} />
      </Canvas>
      
      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full border">
        <p className="text-sm font-medium">
          Building Progress: {Math.round(buildProgress * 100)}%
        </p>
      </div>
    </div>
  );
};
