import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BinaryCosmicUI() {
  const [weight, setWeight] = useState(100);
  const [signalTension, setSignalTension] = useState(1);
  const [binaryState, setBinaryState] = useState(1);

  const toggleBinary = () => {
    setBinaryState(binaryState === 1 ? 0 : 1);
    setSignalTension(binaryState === 1 ? 0.5 : 1);
    setWeight(binaryState === 1 ? weight / 2 : weight * 2);
  };

  const Particle = ({ position, color }) => (
    <mesh position={position}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
    </mesh>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-2 text-blue-300">Infinity Physics RPG System</h1>
      <p className="text-sm text-gray-300 mb-6">Binary Universe Simulation – Oxygen ↔ Hydrogen Flip Model</p>

      <div className="w-full h-[60vh] border border-gray-700 rounded-2xl overflow-hidden shadow-lg">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} />
          <OrbitControls enableZoom={true} />

          {/* Central field */}
          <mesh>
            <sphereGeometry args={[1.5, 64, 64]} />
            <meshStandardMaterial
              color={binaryState === 1 ? 'skyblue' : 'crimson'}
              wireframe
            />
          </mesh>

          {/* Interactive particles showing hydrogen/oxygen flip */}
          <Particle position={[2, 0, 0]} color={binaryState === 1 ? 'blue' : 'red'} />
          <Particle position={[-2, 0, 0]} color={binaryState === 1 ? 'red' : 'blue'} />
          <Particle position={[0, 2, 0]} color={binaryState === 1 ? 'white' : 'gray'} />
        </Canvas>
      </div>

      <Card className="bg-gray-900/60 border-gray-700 mt-6 w-80 text-center">
        <CardContent>
          <h2 className="text-xl font-semibold text-green-400 mb-2">System Readout</h2>
          <p>Binary State: <span className="text-yellow-300">{binaryState}</span></p>
          <p>Signal Tension: <span className="text-cyan-300">{signalTension.toFixed(2)}</span></p>
          <p>Simulated Weight: <span className="text-pink-300">{weight.toFixed(1)} kg</span></p>
          <p className="text-xs text-gray-400 mt-2 italic">"Hydrogen and Oxygen – the universe’s binary code."</p>
          <Button onClick={toggleBinary} className="mt-4 bg-blue-700 hover:bg-blue-600">Flip Polarity</Button>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-500 mt-3">Powered by Infinity OS – Quantum Binary Physics Engine</p>
    </div>
  );
}
