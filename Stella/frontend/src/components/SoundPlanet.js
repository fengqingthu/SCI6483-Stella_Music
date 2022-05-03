import React, { Suspense,Fragment, useRef, useEffect, useState} from 'react'
import { useFrame} from 'react-three-fiber'
import { useSpring, a } from "@react-spring/three";
import { Html } from "@react-three/drei";
import Sound from './sound';
import * as THREE from "three";
import { Canvas, extend, useLoader } from "@react-three/fiber";
import { shaderMaterial,OrbitControls } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
// import "./App.css";
import { Vector3 } from "three";
const backup={
  "danceability": 0.687,
  "energy": 0.686,
  "key": 7,
  "loudness": -8.343,
  "mode": 0,
  "speechiness": 0.0307,
  "acousticness": 0.328,
  "instrumentalness": 0,
  "liveness": 0.0591,
  "valence": 0.459,
  "tempo": 114.024,
  "type": "audio_features",
  "id": "0a0eWptMSFinwTAg1zfndE",
  "uri": "spotify:track:0a0eWptMSFinwTAg1zfndE",
  "track_href": "https://api.spotify.com/v1/tracks/0a0eWptMSFinwTAg1zfndE",
  "analysis_url": "https://api.spotify.com/v1/audio-analysis/0a0eWptMSFinwTAg1zfndE",
  "duration_ms": 282760,
  "time_signature": 4
}

// const WaveShaderMaterial = shaderMaterial(
//   // Uniform
//   {
//     uPi:3.14,
//     uTime:0.0,
//     uColor: new THREE.Color(0.0, 0.0, 0.0),
//     // uPoint:new THREE.Vector3(0.6,0.8,0.0),
//     uPointArray:[new THREE.Vector3(0.6,0.8,Math.sqrt(0.0)),new THREE.Vector3(0.0,0.0,1.0),new THREE.Vector3(0.0,0.6,0.8),new THREE.Vector3(-0.25,-0.1,-Math.sqrt(1.0-0.25**2.0-0.01))],
//     uSizeArray:[1.0,0.5,1.5,1.2],
//     uCrateNum:80,
//     uFlatR:0.1,
//     uCraterR:0.2,
//     uSteepness:3.0,
//     uRimHF:0.16,
//     uSphereR:1.0,
//   },
//   // Vertex Shader
//   glsl`
//     // precision mediump float;
//     uniform float uCraterR;
//     uniform float uFlatR;
//     uniform float uRimHF;
//     uniform float uSphereR;
//     uniform float uSteepness;
//     uniform int uCrateNum;
//     uniform vec3 uPointArray[80];
//     uniform float uSizeArray[80];
    
//     uniform float uTime;
//     uniform float uPi;
//     // varying float modelz;
//     // uniform vec3 uPoint;
//     varying float vDent;
//     // uniform mat4 modelMatrix;
//     // uniform mat4 viewMatrix;
//     // uniform mat4 projectionMatrix;
//     // varying float distanceToCenter;
//     // attribute vec3 position;

//     // #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);


//     void main() {
//       vec4 modelPosition=modelMatrix* vec4(position, 1.0);

      


//       for(int j=0;j<uCrateNum;j+=1){
//         vec3 uPoint=uPointArray[j];
//         float sizeF=uSizeArray[j];
//         float CraterR=sizeF*uCraterR;
//         float FlatR=sizeF*uFlatR;  
//         float distanceToCenter=pow(modelPosition.x-uPoint.x,2.0)+pow(modelPosition.y-uPoint.y,2.0)+pow(modelPosition.z-uPoint.z,2.0);
//         if (distanceToCenter>pow(CraterR*1.4,2.0)){
//           continue;
//         }
//         float RimH=pow(CraterR,2.0)*uSteepness*uRimHF;
//         float deHeight=pow(CraterR,2.0)*uSteepness-RimH;
//         float fHeight=deHeight-pow(FlatR,2.0)*uSteepness;
//         float curR=sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.y,2.0)+pow(modelPosition.z,2.0));
//         if (distanceToCenter>=pow(CraterR,2.0)&&distanceToCenter<pow(CraterR*1.4,2.0)){
//           float disToEdge=CraterR*1.4-sqrt(distanceToCenter);
//           float h=pow(disToEdge,2.0)*3.0;
//           float pFactor=(curR+h)/curR;
//           modelPosition.z=modelPosition.z*pFactor;
//           modelPosition.y=modelPosition.y*pFactor;
//           modelPosition.x=modelPosition.x*pFactor;
//         }else if (distanceToCenter>pow(FlatR,2.0)&&distanceToCenter<pow(CraterR,2.0)){
//           float pFactor=(curR+distanceToCenter*uSteepness-deHeight)/curR;
//           modelPosition.z=modelPosition.z*pFactor;
//           modelPosition.y=modelPosition.y*pFactor;
//           modelPosition.x=modelPosition.x*pFactor;
//         }else if(distanceToCenter<=pow(FlatR,2.0)){
//           float pFactor=(curR-fHeight)/curR;
//           modelPosition.z=modelPosition.z*pFactor;
//           modelPosition.y=modelPosition.y*pFactor;
//           modelPosition.x=modelPosition.x*pFactor;

//         }
//       }
//       float newR=sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.z,2.0));
//       float sAngle=0.0;
//       if(modelPosition.z>=-0.03){
//         sAngle=asin(modelPosition.x/newR)+uTime;
//       }else if(modelPosition.x>=0.000000){
//         sAngle=uPi-asin(modelPosition.x/newR)+uTime;
//       }else{
//         sAngle=-uPi-asin(modelPosition.x/newR)+uTime;
//       }
//       modelPosition.x=sin(sAngle)*newR;
//       modelPosition.z=cos(sAngle)*newR;

      
//       vDent=1.0-sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.y,2.0)+pow(modelPosition.z,2.0));
//       // if (modelPosition.x*modelPosition.x+modelPosition.y*modelPosition.y<0.02)
//       //   modelPosition.z += (0.02*2.0-0.08);
//       // modelz=modelPosition.z+0.08;
//       // modelz=modelPosition.z;
//       // modelPosition.z+=uTime;

//       vec4 viewPosition=viewMatrix*modelPosition;
//       vec4 projectedPosition=projectionMatrix*viewPosition;
//       gl_Position = projectedPosition;  
//     }
//   `,
//   // Fragment Shader
//   glsl`
//     precision mediump float;

//     uniform vec3 uColor;
//     // uniform vec3 uPoint;
//     varying float vDent;
//     // uniform float uTime;
//     // uniform sampler2D uTexture;

//     // varying vec2 vUv;
//     // varying float modelz;
//     // varying float distanceToCenter;

//     void main() {
//       // float wave = vWave * 0.2;
//       // vec3 texture = texture2D(uTexture, vUv + wave).rgb;
//       // gl_FragColor = vec4(0.8-abs(abs(modelz)-1.0)*1.0,0.8-abs(abs(modelz)-1.0)*1.0,0.8-abs(abs(modelz)-1.0)*1.0, 1.0); 
//       gl_FragColor = vec4(0.7-vDent*3.0,0.7-vDent*3.0,0.7-vDent*3.0,1.0);
//     }
//   `
// );

// extend({ WaveShaderMaterial });

const SoundPlanet = ({ position, dimensions, song ,context}) => {
  const[songInfo,setsongInfo]=useState({album:{name:"",artists:[]},external_urls:{uri:""}});
  const[audioFeatures,setAudioFeatures]=useState(backup);
  function handleHoverOn(){
    setHovered(true)
    
    context.onHover(song.node)
    // console.log(song.name)
  }
  function handleHoverOff(){
    setHovered(false)
    
  }
 
  useEffect(()=>{
    fetch("/song/"+song.node).then(res=>{
        if(res.ok){
            return res.json()
        }
    }).then(jsonResponse=>{setsongInfo(jsonResponse)})

  },[]
  )
  useEffect(()=>{
    fetch("/audio-features/"+song.node).then(res=>{
        if(res.ok){
            return res.json()
        }
    }).then(jsonResponse=>{setAudioFeatures(jsonResponse)})
  },[]
  )
  // const axis = useRef(null);
  let [hovered, setHovered] = useState(false);
  let props = useSpring({
    scale: hovered ? [1.05, 1.05, 1.05] : [1, 1, 1],
  });

  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));
  // const [image] = useLoader(THREE.TextureLoader, [
  //   "https://images.unsplash.com/photo-1604011092346-0b4346ed714e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1534&q=80",
  // ]);
  const CraterCenters=[];
  const CraterSizes=[];
  const Radius=1.0;
  for (let i = 0; i <80; i++) {
    let x=(Math.random()*2-1)*Radius;
    let y=(Math.random()*2-1)*Radius;
    let z=Math.sqrt(Radius**2-x**2-y**2)*(Math.floor(Math.random()*2)*2-1);
    let point=new THREE.Vector3(x,y,z);
    CraterCenters[i]=point;
    CraterSizes[i]=Math.random()**4+0.5;
    
  }
  // const [image] = useLoader(THREE.TextureLoader, [
  //   "/moontexture.jpg"
  // ]);
  return (

       
     
    <a.mesh
        // ref={planetRef} 
        onPointerOver={handleHoverOn}
        // onClick={()=>songContext.onHover(song.id)}
        onPointerOut={handleHoverOff}
        onDoubleClick={()=>context.onClick(song.node)}
        position={position}    
        scale={props.scale}
        id={song.id}
    > 
      <icosahedronBufferGeometry args={[Radius,100]}  position={[0,0,0]} />
      <waveShaderMaterial uPointArray={CraterCenters} ref={ref} uSizeArray={CraterSizes} Radius={Radius} uCraters={1.0}/>
      <Html distanceFactor={4}>
          <div class="content" >Song Name:{songInfo.name}</div>
      </Html>
    </a.mesh>
    //   <mesh

    // > 
    //   <icosahedronBufferGeometry args={[1,100]}  position={[0,0,0]}/>
    //   <waveShaderMaterial uPointArray={CraterCenters} ref={ref} uSizeArray={CraterSizes}/>

    // </mesh>
 
  );
};

// function SoundPlanet ({ position, dimensions, song ,context}) {
//     //   const songContext=useContext(SongContext);
//       // console.log("context in planet",context)
//       // const ref = useRef();
//       // useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));
//       // const selfRotateSpeed=0.5+Math.random()*1;
//       // const planetRef=useRef(null);
//       // let timer=10
//       // useFrame(() => {

//       //   planetRef.current.rotation.y+=selfRotateSpeed/100;
        
          
//       // });
//       function handleHoverOn(){
//         setHovered(true)
        
//         context.onHover(song.node)
//         // console.log(song.name)
//       }
//       function handleHoverOff(){
//         setHovered(false)
        
//       }
//       // const axis = useRef(null);
//       let [hovered, setHovered] = useState(false);
//       let props = useSpring({
//         scale: hovered ? [1.2, 1.2, 1.2] : [1, 1, 1],
//       });
      

//       //for shaders
//       // const CraterCenters=[];
//       // const CraterSizes=[];
//       // for (let i = 0; i <80; i++) {
//       //   let x=Math.random()*2-1;
//       //   let y=Math.random()*2-1;
//       //   let z=Math.sqrt(1-x**2-y**2)*(Math.floor(Math.random()*2)*2-1);
//       //   let point=new THREE.Vector3(x,y,z);
//       //   CraterCenters[i]=point;
//       //   CraterSizes[i]=Math.random()**4+0.5;
//       // }

//         return (
//             <>
//             {/* <a.mesh
//                 // ref={planetRef} 
//                 onPointerOver={handleHoverOn}
//                 // onClick={()=>songContext.onHover(song.id)}
//                 onPointerOut={handleHoverOff}
//                 onDoubleClick={()=>context.onClick(song.node)}
//                 position={position}    
//                 scale={props.scale}
//                 id={song.id}
//             > */}
                
                   
//                 <RPlanet/>
//                 {/* <Html distanceFactor={4}>
//                     <div class="content" >Song Name:{song.node}</div>
//                 </Html> */}
//             {/* </a.mesh> */}
//             </>
            
//         );
      
//     };

export default SoundPlanet; 