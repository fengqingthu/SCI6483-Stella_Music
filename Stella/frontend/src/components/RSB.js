import React, { useRef, useState } from "react";
import { MeshWobbleMaterial } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";
import { Html } from "@react-three/drei";

const Spinningorb = ({ position, dimensions, color, content }) => {
  const mesh = useRef(null);
  const [expand, setExpand] = useState(false);
  const props = useSpring({
    scale: expand ? [1.4, 1.4, 1.4] : [1, 1, 1],
  });
  return (
    <a.mesh
      onClick={() => setExpand(!expand)}
      position={position}
      scale={props.scale}
      ref={mesh}
    >
      <sphereGeometry attach="geometry" args={dimensions} />
      <meshStandardMaterial
        attach="material"
        color={color}
        metalness={0.1}
        roughness={0}
      />
      <Html distanceFactor={10}>
        <div class="content">{content}</div>
      </Html>
    </a.mesh>
  );
};
export default Spinningorb;
