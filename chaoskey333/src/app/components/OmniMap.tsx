'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import PulseBadge from './PulseBadge';

interface Replay {
  id: string;
  pr: number;
  title: string;
  duration: number;
  tags: string[];
  locales: string[];
  status: 'LIVE' | 'MUTATING' | 'ARCHIVED';
}

interface OmniMapProps {
  replays: Replay[];
  onNodeClick: (replay: Replay) => void;
  selectedReplay: Replay | null;
  currentTime: number;
}

export default function OmniMap({ replays, onNodeClick, selectedReplay, currentTime }: OmniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodeRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<Replay | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000511);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create constellation nodes
    const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    
    replays.forEach((replay, index) => {
      // Position nodes in a spiral constellation pattern
      const angle = (index / replays.length) * Math.PI * 2;
      const radius = 3 + (index % 3) * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 4;

      // Color based on status
      let color = 0x4a5568; // ARCHIVED - gray
      if (replay.status === 'LIVE') color = 0x00ff88; // Green
      if (replay.status === 'MUTATING') color = 0xff6b35; // Orange

      const material = new THREE.MeshBasicMaterial({ 
        color,
        transparent: true,
        opacity: 0.8
      });

      const node = new THREE.Mesh(nodeGeometry, material);
      node.position.set(x, y, z);
      node.userData = { replay };
      
      scene.add(node);
      nodeRefs.current.set(replay.id, node);

      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(node.position);
      scene.add(glow);
    });

    // Add constellation connections
    const lineGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    for (let i = 0; i < replays.length; i++) {
      const current = nodeRefs.current.get(replays[i].id);
      const next = nodeRefs.current.get(replays[(i + 1) % replays.length].id);
      
      if (current && next) {
        positions.push(current.position.x, current.position.y, current.position.z);
        positions.push(next.position.x, next.position.y, next.position.z);
      }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x0891b2,
      transparent: true,
      opacity: 0.3
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      setMousePos({ x: event.clientX, y: event.clientY });

      raycaster.setFromCamera(mouse, camera);
      const nodes = Array.from(nodeRefs.current.values());
      const intersects = raycaster.intersectObjects(nodes);

      if (intersects.length > 0) {
        const intersectedNode = intersects[0].object as THREE.Mesh;
        const replay = intersectedNode.userData.replay as Replay;
        setHoveredNode(replay);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        document.body.style.cursor = 'default';
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const nodes = Array.from(nodeRefs.current.values());
      const intersects = raycaster.intersectObjects(nodes);

      if (intersects.length > 0) {
        const intersectedNode = intersects[0].object as THREE.Mesh;
        const replay = intersectedNode.userData.replay as Replay;
        onNodeClick(replay);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate scene slowly
      scene.rotation.y += 0.001;
      
      // Pulse selected node
      if (selectedReplay) {
        const selectedNode = nodeRefs.current.get(selectedReplay.id);
        if (selectedNode) {
          const scale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
          selectedNode.scale.setScalar(scale);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      
      const container = containerRef.current;
      if (container && renderer.domElement.parentNode) {
        container.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      document.body.style.cursor = 'default';
    };
  }, [replays, onNodeClick, selectedReplay]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Timeline scrubber */}
      {selectedReplay && (
        <div className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-90 p-4 rounded-lg">
          <div className="text-sm text-cyan-400 mb-2">
            Timeline: {selectedReplay.title}
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max={selectedReplay.duration}
              value={currentTime}
              onChange={(e) => {
                // This would sync with ReplayCapsule
                const time = parseInt(e.target.value);
                // onTimeChange(time);
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
              <span>{Math.floor(selectedReplay.duration / 60)}:{(selectedReplay.duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Node tooltip */}
      {hoveredNode && (
        <div 
          className="absolute pointer-events-none z-50 bg-gray-900 border border-gray-700 rounded-lg p-3 max-w-xs"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <PulseBadge status={hoveredNode.status} size="sm" />
            <span className="font-semibold text-cyan-400">{hoveredNode.id}</span>
          </div>
          <div className="text-sm text-gray-300">{hoveredNode.title}</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.floor(hoveredNode.duration / 60)}:{(hoveredNode.duration % 60).toString().padStart(2, '0')} • {hoveredNode.tags.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}