import React, { useState,useRef } from "react";
import { useFrame } from "react-three-fiber";
import { useSpring, a } from "@react-spring/three";
import { Html } from "@react-three/drei";




function Planet ({ position, dimensions, song ,context}) {
//   const songContext=useContext(SongContext);
  // console.log("context in planet",context)
  const selfRotateSpeed=0.5+Math.random()*1;
  const planetRef=useRef(null);
  useFrame(() => {
      planetRef.current.rotation.y+=selfRotateSpeed;
  });
  function handleHoverOn(){
    setHovered(true)
    
    context.onHover(song.node)
    // console.log(song.name)
  }
  function handleHoverOff(){
    setHovered(false)
    
  }
  // const axis = useRef(null);
  let [hovered, setHovered] = useState(false);
  let props = useSpring({
    scale: hovered ? [1.2, 1.2, 1.2] : [1, 1, 1],
  });
  
    return (
        
        <a.mesh
            ref={planetRef} 
            onPointerOver={handleHoverOn}
            // onClick={()=>songContext.onHover(song.id)}
            onPointerOut={handleHoverOff}
            onDoubleClick={()=>context.onClick(song.node)}
            position={position}    
            scale={props.scale}
            id={song.id}
        >
            <sphereGeometry attach="geometry" args={dimensions} />
            <meshBasicMaterial attach="material" wireframe={true}/>
            <Html distanceFactor={4}>
                <div class="content" >Song Name:{song.node}</div>
            </Html>
        </a.mesh>
        
    );
  
};
export default Planet;
