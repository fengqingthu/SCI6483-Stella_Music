import Spaceship from "./spaceship";
import React,{useRef} from "react";
import { useFrame } from "react-three-fiber";
//the spaceship symbolize the user, it would be orbiting around the current song playing
export default function FlyingSpaceship(){

    const rotateRef=useRef(null);
    useFrame(() => {
        rotateRef.current.rotation.x-=0.01;
      });
    return (
    <group ref={rotateRef}>
    <Spaceship position={[0,1.3,0]}>

    </Spaceship>
    </group>
    )
}