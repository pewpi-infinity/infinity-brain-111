import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls, useTexture, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// InfinityPortalEinstein.jsx
// Single-file React component for a single-page Infinity Portal
// - 3D "Einstein head" placeholder that drifts along a vector-field
// - Floating 3D buttons that appear on recall (no page switching)
// - Click a button to 'mount' an app panel (HTML overlay) inside the same page
// - Easily replace the placeholder head with a GLTF model (instructions below)

export default function InfinityPortalEinstein({ apps = defaultApps }) {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-black via-slate-900 to-indigo-900 text-white">
      <div className="absolute z-30 p-4 w-full flex justify-between items-center">
        <h1 className="text-lg font-semibold">Infinity Portal</h1>
        <div className="flex gap-2 items-center">
          <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => window.dispatchEvent(new CustomEvent('recall-buttons'))}>Recall</button>
          <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => window.dispatchEvent(new CustomEvent('hide-buttons'))}>Hide</button>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <color attach="background" args={[0, 0, 0]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 7]} intensity={1.0} />

        <Scene apps={apps} />
        <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>

      {/* App mount area (in-page panels, not navigation) */}
      <AppMount />
    </div>
  )
}

// ===================== Scene & Helpers =====================
function Scene({ apps }) {
  return (
    <group>
      <VectorFieldParticles count={7000} />
      <EinsteinHead />
      <FloatingButtons apps={apps} />
    </group>
  )
}

// Placeholder head: simple low-poly object that moves through the field
function EinsteinHead() {
  const ref = useRef()
  // path param that changes over time
  const t = useRef(0)

  useFrame((state, delta) => {
    t.current += delta * 0.4
    // sample a 3D Perlin-like field via simple sin/cos waves
    const x = Math.sin(t.current * 0.8) * 6 + Math.cos(t.current * 0.3) * 1.5
    const y = Math.cos(t.current * 0.7) * 3 + Math.sin(t.current * 0.2) * 1.2
    const z = Math.sin(t.current * 0.5) * 4

    // gentle orientation toward motion
    ref.current.position.lerp(new THREE.Vector3(x, y, z), 0.08)
    const lookAt = new THREE.Vector3(Math.cos(t.current) * 0.1, Math.sin(t.current * 0.7) * 0.2, 0)
    ref.current.rotation.x = lookAt.y * 0.6
    ref.current.rotation.y = lookAt.x * 0.6
    ref.current.rotation.z = Math.sin(t.current * 0.3) * 0.05
  })

  return (
    <group ref={ref}>
      {/* Replace this mesh with a proper GLTF/GLB model for a real Einstein head. See notes below. */}
      <mesh>
        <icosahedronGeometry args={[1.4, 4]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} color={'#e6e6e6'} />
      </mesh>

      {/* optional subtle glow */}
      <mesh scale={[1.6, 1.6, 1.6]}> 
        <icosahedronGeometry args={[1.4, 4]} />
        <meshBasicMaterial color={'#ffffff'} transparent opacity={0.02} />
      </mesh>

      {/* small name label */}
      <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: 12, color: 'white', opacity: 0.9, textAlign: 'center' }}>Einstein — Head Node</div>
      </Html>
    </group>
  )
}

// Particle cloud that visualizes the underlying vector field
function VectorFieldParticles({ count = 3000 }) {
  const points = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloatSpread(30)
      pos[i * 3 + 0] = THREE.MathUtils.randFloatSpread(20)
      pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(12)
      pos[i * 3 + 2] = THREE.MathUtils.randFloatSpread(20)
    }
    return pos
  }, [count])

  const ref = useRef()
  useFrame((state, delta) => {
    // slow drift — rotate the whole cloud to make the space feel alive
    ref.current.rotation.y += delta * 0.02
    ref.current.rotation.x += delta * 0.005
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} sizeAttenuation depthWrite={false} transparent opacity={0.9} />
    </points>
  )
}

// Floating interactive 3D buttons (appear/disappear on recall)
function FloatingButtons({ apps = [] }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onRecall = () => setVisible(true)
    const onHide = () => setVisible(false)
    window.addEventListener('recall-buttons', onRecall)
    window.addEventListener('hide-buttons', onHide)
    return () => {
      window.removeEventListener('recall-buttons', onRecall)
      window.removeEventListener('hide-buttons', onHide)
    }
  }, [])

  return (
    <group>
      {apps.map((app, i) => (
        <Button3D key={app.id || i} app={app} index={i} visible={visible} />
      ))}
    </group>
  )
}

function Button3D({ app, index, visible }) {
  const ref = useRef()
  const angle = (index / Math.max(1, 8)) * Math.PI * 2
  const radius = 6 + (index % 3) * 1.6

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * 0.2 + index
    const x = Math.cos(angle + t) * radius
    const y = Math.sin(angle * 1.3 + t * 0.6) * 2.0 + (Math.sin(t * 0.5 + index) * 0.5)
    const z = Math.sin(angle + t * 0.6) * radius * 0.5
    // appear/hide lerp
    const target = visible ? 1 : 0
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.06)
    ref.current.position.lerp(new THREE.Vector3(x, y, z), 0.12)
    ref.current.rotation.y += 0.01
  })

  const onClick = (e) => {
    e.stopPropagation()
    // mount the app (in-page) using a global router event system
    window.dispatchEvent(new CustomEvent('mount-app', { detail: { app } }))
  }

  return (
    <group ref={ref} scale={[0, 0, 0]}>
      <mesh onClick={onClick} castShadow>
        <torusGeometry args={[0.45, 0.12, 16, 60]} />
        <meshStandardMaterial color={app.color || '#22c1c3'} metalness={0.3} roughness={0.1} />
      </mesh>

      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ width: 84, textAlign: 'center', fontSize: 12 }}>{app.title}</div>
      </Html>
    </group>
  )
}

// ===================== AppMount: HTML overlay panels =====================
function AppMount() {
  const [mounted, setMounted] = useState(null)

  useEffect(() => {
    const open = (e) => setMounted(e.detail.app)
    const close = () => setMounted(null)
    window.addEventListener('mount-app', open)
    window.addEventListener('close-app', close)
    return () => {
      window.removeEventListener('mount-app', open)
      window.removeEventListener('close-app', close)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute z-40 inset-0 flex items-end md:items-center justify-center p-6 pointer-events-none">
      <div className="w-full md:w-3/5 bg-black/80 text-white rounded-lg shadow-xl p-4 pointer-events-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{mounted.title}</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-white/10" onClick={() => window.dispatchEvent(new Event('close-app'))}>Close</button>
          </div>
        </div>

        <div className="mt-3">
          {/* The app content injection point. If apps supply a render() they will be used.
              Otherwise a simple iframe/url or custom component name can be used. */}
          {mounted.render ? (
            <div>{mounted.render()}</div>
          ) : mounted.url ? (
            <iframe title={mounted.title} src={mounted.url} className="w-full h-96 border-0 rounded-md mt-2" />
          ) : (
            <div className="p-4 bg-white/5 rounded mt-2">No render defined for this app — provide `render()` or `url` in the apps array.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===================== Defaults & Helper notes =====================
const defaultApps = [
  { id: 'wallet', title: 'Wallet', color: '#22c1c3', url: 'about:blank' },
  { id: 'coins', title: 'Coins', color: '#ffd166', url: 'about:blank' },
  { id: 'pi-singer', title: 'Pi Singer', color: '#90be6d', url: 'about:blank' },
  { id: 'terminal', title: 'Terminal', color: '#8ecae6', url: 'about:blank' },
  { id: 'inventory', title: 'Inventory', color: '#f8961e', url: 'about:blank' },
]

/*
  HOW TO USE / CUSTOMIZE

  1) Dependencies (install in your project):
     npm install three @react-three/fiber @react-three/drei tailwindcss

  2) Place this file in your React app (e.g., src/components/InfinityPortalEinstein.jsx) and import it:

     import InfinityPortalEinstein from './components/InfinityPortalEinstein'

     function App() {
       const myApps = [ { id: 'a', title: 'My App', url: '/apps/myapp/index.html' }, ... ]
       return <InfinityPortalEinstein apps={myApps} />
     }

  3) Replacing the placeholder head with a GLTF model:
     - Add @react-three/drei and put your file in public/models/einstein.glb
     - Replace the contents of <EinsteinHead /> mesh with a GLTF loader like:

        function ModelHead() {
          const { scene } = useGLTF('/models/einstein.glb')
          return <primitive object={scene} scale={[1.2,1.2,1.2]} />
        }

     - Then use <ModelHead /> inside the <group ref={ref}> for EinsteinHead.

  4) Adding apps / connecting logic:
     - Each app object may contain:
         { id, title, url, color, render: () => <YourReactComponent/> }
     - When a 3D button is clicked the portal dispatches a `mount-app` event with the app object
     - The AppMount overlay will mount either an iframe (if url) or call render()

  5) Controlling button recall programmatically:
     - Use window.dispatchEvent(new CustomEvent('recall-buttons')) to reveal them
     - Use window.dispatchEvent(new CustomEvent('hide-buttons')) to hide

  6) Notes / next steps you might want me to implement for you:
     - Swap the icosahedron for a high-fidelity GLTF model of Einstein (I can help prepare the glb)
     - Add spatial audio that follows the head (Pi Singer playing) and a quick mixer UI
     - Save app positions to localStorage so the layout persists between visits
     - Add keyboard shortcuts to open specific apps (e.g., press 1 to open Wallet)

*/
