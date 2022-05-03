import React, { Fragment, useRef, useState,useContext } from "react";
import { useSpring, a } from "@react-spring/three";
import { useFrame } from "react-three-fiber";
import { Html } from "@react-three/drei";
import Inputs from "./input";
import Planet from "./planet";
import SoundPlanet from "./SoundPlanet";
// import SongContext from "./songContext";

const min_dis = Inputs["min_distance"];
const var_dis = Inputs["var_distance"];
const speed = Inputs["speed"];
const R = Inputs["root_radius"];

function getRadius(radius) {
  let res = Math.floor(Math.random() * 2);
  let ans;
  res === 0
    ? (ans =
        ((radius * min_dis + radius * Math.random() * var_dis) * radius) / R)
    : (ans =
        ((-radius * min_dis - radius * Math.random() * var_dis) * radius) / R);
  return ans;
}

function getPosition(Radius,i,level) {
  // console.log("child index:",i)
  let distance=0;
  if(level==0){
    distance=(8*Radius+4*Radius*i*2);
  }else if(level==1){
    distance=(6*Radius+Radius*i*2);
  }else if(level==2){
    distance=(3*Radius);
  }
  let x=distance*Math.random()*(-1+2*Math.floor(Math.random()*2));
  let z=Math.sqrt(distance**2-x**2)*(-1+2*Math.floor(Math.random()*2));
  return [x,z];
}

function RecusiveSpinningOrb({ position, dimensions, color, song ,context,level}){

  // console.log("context on Recursive",context)
  // console.log("level is",level)
  // console.log(song);
  const sysRefs=useRef([]);
  const speedF=new Array(song.children.length);
  const angle=new Array(song.children.length);
  for (let i=0;i<song.children.length;i++){
    speedF[i]=(0.01+Math.random() *0.03)*5**level;
    // angle[i]=Math.random() *0.05;
  }
  // const axis = useRef(null);
  useFrame(() => {
    for (let i=0;i<song.children.length;i++){
      sysRefs.current[i].rotation.y+=speed*speedF[i];
      // sysRefs.current[i].rotation.x+=speed*speedF[i]*angle[i];
    }
    // axis.current.rotation.y += speed * speed_factor;
  });
  const x = { ...position }[0];
  const y = { ...position }[1];
  const z = { ...position }[2];
  const Radius={...dimensions}[0];
  let radius=0
  if (level==0){
    radius = { ...dimensions }[0] * 0.5;
  }else{
    radius = { ...dimensions }[0] * 0.2;
  }
 
  
  if (song.children === []) {
    return (
      <Fragment>
        <a.mesh
          // onPointerOver={handleHoverOn}
          // onPointerOut={handleHoverOff}
          position={position}
          
          
        >
          <sphereGeometry attach="geometry" args={dimensions} />
          <meshBasicMaterial attach="material" wireframe="true" color="red"/>
          <Html >
              <div class="content">songNAme</div>
          </Html>
        </a.mesh>
      </Fragment>
    );
  }else if(level==0){
    return (
      <>
        {/* <SoundPlanet/> */}
        {/* <SoundPlanet position={position} song={song} dimensions={dimensions} context={context}></SoundPlanet> */}
        {song.children.map((child,i) => {
          // console.log(i)
          // const plane = useRef(null);
          // plane.current.rotation.y = 90;
          let Offset=getPosition(Radius,i,level);
          // console.log(R)
          // let r_1 = getRadius(radius);
          // let r_2 = getRadius(radius);
          return (
            <group key={child.id} ref={(element) => {sysRefs.current[i] = element}}  position={position} >
              <RecusiveSpinningOrb
                position={[Offset[0],0, Offset[1]]}
                dimensions={[radius, 32, 32]}
                color={color}
                song={child}
                key={child.id}
                context={context}
                level={level+1}
              />
            </group>
          );
        })}
      </>
      
      
    );

  } else {
    return (
      <>
        <Planet position={position} song={song} dimensions={dimensions} context={context}></Planet>
        {song.children.map((child,i) => {
          // console.log(i)
          // const plane = useRef(null);
          // plane.current.rotation.y = 90;
          let Offset=getPosition(Radius,i,level);
          // console.log(R)
          // let r_1 = getRadius(radius);
          // let r_2 = getRadius(radius);
          return (
            <group key={child.id} ref={(element) => {sysRefs.current[i] = element}}  position={position} >
              {/* <mesh>
                <torusGeometry
                  attach="geometry"
                  args={[Math.sqrt(r_1 * r_1 + r_2 * r_2), 0.4, 32, 32]}
                />
              </mesh> */}
              <RecusiveSpinningOrb
                position={[Offset[0],0, Offset[1]]}
                dimensions={[radius*(Math.random()*1.2+0.2), 32, 32]}
                color={color}
                song={child}
                key={child.id}
                context={context}
                level={level+1}
              />
            </group>
          );
        })}
      </>
      
      
    );
  }
};
export default RecusiveSpinningOrb;
