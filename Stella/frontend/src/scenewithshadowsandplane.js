import "./App.scss";
import React, { useRef, useState, useEffect } from "react";

import { Canvas, useFrame, useThree } from "react-three-fiber";
import {
  softShadows,
  MeshWobbleMaterial,
  OrbitControls,
} from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";
import { SphereGeometry } from "three";
import { Html } from "@react-three/drei";
softShadows();

const SpinningBox = ({ position, dimensions, color, content }) => {
  const mesh = useRef(null);
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));
  const [expand, setExpand] = useState(false);
  const props = useSpring({
    scale: expand ? [1.4, 1.4, 1.4] : [1, 1, 1],
  });
  return (
    <a.mesh
      onClick={() => setExpand(!expand)}
      castShadow
      position={position}
      scale={props.scale}
      ref={mesh}
    >
      <boxBufferGeometry attach="geometry" args={dimensions} />
      <MeshWobbleMaterial
        attach="material"
        color={color}
        speed={3}
        factor={0.4}
      />
      <Html distanceFactor={10}>
        <div class="content">{content}</div>
      </Html>
    </a.mesh>
  );
};

const Spinningorb = ({ position, dimensions, color, content }) => {
  const mesh = useRef(null);
  let orbState = "up";
  useFrame(() => {
    if (orbState === "up") {
      if (mesh.current.position.y < 3) {
        // console.log(mesh.current.position.y);
        mesh.current.position.y += 0.01;
      } else {
        orbState = "down";
      }
    }
    if (orbState === "down") {
      if (mesh.current.position.y > 0.1) {
        // console.log(mesh.current.position.y);
        mesh.current.position.y -= 0.01;
      } else {
        orbState = "up";
      }
    }
  });
  const [expand, setExpand] = useState(false);
  const props = useSpring({
    scale: expand ? [1.4, 1.4, 1.4] : [1, 1, 1],
  });
  return (
    <a.mesh
      onClick={() => setExpand(!expand)}
      castShadow
      position={position}
      scale={props.scale}
      ref={mesh}
    >
      <sphereGeometry attach="geometry" args={dimensions} />
      <MeshWobbleMaterial
        attach="material"
        color={color}
        speed={3}
        factor={1}
      />
      <Html distanceFactor={10}>
        <div class="content">{content}</div>
      </Html>
    </a.mesh>
  );
};

function App() {
  return (
    <>
      <Canvas
        shadows
        colorManagement
        camera={{ position: [-5, 2, 10], fov: 60 }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[0, 10, 0]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        <pointLight position={[-10, 0, -20]} intensity={0.5} />
        <pointLight position={[0, -10, 0]} intensity={1.5} />
        <group>
          <mesh
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -3, 0]}
          >
            <planeBufferGeometry attach="geometry" args={[100, 100]} />
            {/* <meshStandardMaterial attach="material" color="yellow" /> */}
            <shadowMaterial attach="material" opacity={0.3} />
          </mesh>
        </group>
        <SpinningBox
          position={[0, 1, 0]}
          dimensions={[3, 2, 1]}
          color="lightblue"
          content="click!"
        />
        <SpinningBox position={[-2, 1, -5]} color="pink" content="Duo" />
        <SpinningBox position={[5, 1, -2]} color="pink" content="SCI 6483" />

        <Spinningorb position={[8, 1, 0]} color="aqua" content="More!" />
        <OrbitControls />
      </Canvas>
    </>
  );
}

export default App;
