import React  from "react";
import { useLoader } from "react-three-fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


export default function Spaceship({position}) {
  const { nodes } = useLoader(GLTFLoader, "models/arwing.glb");
  return (
    <group position={position}>
      <mesh visible geometry={nodes.Default.geometry} scale={0.05}>
        <meshBasicMaterial
          attach="material"
          color="red"
          wireframe={true}
        />
      </mesh>
    </group>
  );
}
