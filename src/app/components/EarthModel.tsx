'use client';

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Environment, Line, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

// Function to generate random points on a sphere
function getRandomSpherePoint(radius: number) {
  const theta = 2 * Math.PI * Math.random();
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

function createArcPoints(start: THREE.Vector3, end: THREE.Vector3) {
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  
  // Keep arcs very close to surface
  const arcHeight = distance * 0.15;
  const surfaceOffset = 0.001; // Tiny offset to prevent z-fighting
  
  // Ensure mid point follows surface curvature
  midPoint.normalize().multiplyScalar(0.52 + arcHeight);
  
  return {
    start: start,
    mid: midPoint,
    end: end
  };
}

function ConnectionLines() {
  const points = useMemo(() => {
    const pts = [];
    const numPoints = 20;
    const radius = 0.52; // Match Earth radius
    for (let i = 0; i < numPoints; i++) {
      pts.push(getRandomSpherePoint(radius));
    }
    return pts;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (Math.random() < 0.15) {
          const arc = createArcPoints(points[i], points[j]);
          lines.push({
            points: [arc.start, arc.mid, arc.end],
            speed: 0.2 + Math.random() * 0.3,
            progress: Math.random(),
            color: new THREE.Color('#ff00ff'),
            width: 0.3 + Math.random() * 0.4
          });
        }
      }
    }
    return lines;
  }, [points]);

  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, delta) => {
    connections.forEach((line, i) => {
      const pulse = pulseRefs.current[i];
      if (pulse) {
        line.progress += delta * line.speed;
        if (line.progress > 1) line.progress = 0;

        const t = line.progress;
        const pos = new THREE.Vector3();
        pos.x = Math.pow(1-t, 2) * line.points[0].x + 2 * (1-t) * t * line.points[1].x + t * t * line.points[2].x;
        pos.y = Math.pow(1-t, 2) * line.points[0].y + 2 * (1-t) * t * line.points[1].y + t * t * line.points[2].y;
        pos.z = Math.pow(1-t, 2) * line.points[0].z + 2 * (1-t) * t * line.points[1].z + t * t * line.points[2].z;
        
        pulse.position.copy(pos);
        pulse.scale.setScalar(0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      }
    });
  });

  return (
    <group>
      {connections.map((line, i) => (
        <group key={i}>
          <QuadraticBezierLine
            start={line.points[0]}
            mid={line.points[1]}
            end={line.points[2]}
            color={line.color}
            lineWidth={line.width}
            transparent={true}
            opacity={0.6}
            dashed={false}
          />
          <mesh
            ref={el => { pulseRefs.current[i] = el }}
            position={line.points[0].clone()}
          >
            <sphereGeometry args={[0.005, 8, 8]} />
            <meshBasicMaterial
              color={line.color}
              transparent={true}
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Model() {
  const { scene } = useGLTF('/models/earth.glb');
  const earthTexture = useTexture('/models/Earth.jpeg');
  const modelRef = useRef<THREE.Group>(null);

  // Apply texture to the model
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: earthTexture,
        metalness: 0.2,
        roughness: 0.8,
      });
    }
  });

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={modelRef} scale={0.5}>
      <primitive object={scene} renderOrder={0} />
      <ConnectionLines />
    </group>
  );
}

function LoadingSpinner() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#4c1d95" wireframe />
    </mesh>
  );
}

export default function EarthModel() {
  return (
    <div className="model-container w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 20 }}
        style={{ background: 'transparent' }}
      >
        <Environment preset="city" />
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Suspense fallback={<LoadingSpinner />}>
          <Model />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI * 2 / 3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 