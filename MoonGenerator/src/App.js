import * as THREE from "three";
import React, { useRef, Suspense,useState } from "react";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial,OrbitControls } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import "./App.css";
import { Range } from 'react-range';
import { Vector3 } from "three";

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    // uPoint:new THREE.Vector3(0.6,0.8,0.0),
    uPointArray:[new THREE.Vector3(0.6,0.8,Math.sqrt(0.0)),new THREE.Vector3(0.0,0.0,1.0),new THREE.Vector3(0.0,0.6,0.8),new THREE.Vector3(-0.25,-0.1,-Math.sqrt(1.0-0.25**2.0-0.01))],
    uSizeArray:[1.0,0.5,1.5,1.2],
    uCrateNum:80,
    uFlatR:0.1,
    uCraterR:0.2,
    uSteepness:3.0,
    uRimHF:0.16,
    uSphereR:1.0,
  },
  // Vertex Shader
  glsl`
    precision mediump float;
    uniform float uCraterR;
    uniform float uFlatR;
    uniform float uRimHF;
    uniform float uSphereR;
    uniform float uSteepness;
    uniform int uCrateNum;
    uniform vec3 uPointArray[80];
    uniform float uSizeArray[80];
   
    // varying float modelz;
    // uniform vec3 uPoint;
    varying float vDent;
    // varying float distanceToCenter;

    // #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);


    void main() {
      vec4 modelPosition=modelMatrix* vec4(position, 1.0);
      for(int j=0;j<uCrateNum;j+=1){
        vec3 uPoint=uPointArray[j];
        float sizeF=uSizeArray[j];
        float CraterR=sizeF*uCraterR;
        float FlatR=sizeF*uFlatR;  
        float distanceToCenter=pow(modelPosition.x-uPoint.x,2.0)+pow(modelPosition.y-uPoint.y,2.0)+pow(modelPosition.z-uPoint.z,2.0);
        if (distanceToCenter>pow(CraterR*1.4,2.0)){
          continue;
        }
        float RimH=pow(CraterR,2.0)*uSteepness*uRimHF;
        float deHeight=pow(CraterR,2.0)*uSteepness-RimH;
        float fHeight=deHeight-pow(FlatR,2.0)*uSteepness;
        float curR=sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.y,2.0)+pow(modelPosition.z,2.0));
        if (distanceToCenter>=pow(CraterR,2.0)&&distanceToCenter<pow(CraterR*1.4,2.0)){
          float disToEdge=CraterR*1.4-sqrt(distanceToCenter);
          float h=pow(disToEdge,2.0)*3.0;
          float pFactor=(curR+h)/curR;
          modelPosition.z=modelPosition.z*pFactor;
          modelPosition.y=modelPosition.y*pFactor;
          modelPosition.x=modelPosition.x*pFactor;
        }else if (distanceToCenter>pow(FlatR,2.0)&&distanceToCenter<pow(CraterR,2.0)){
          float pFactor=(curR+distanceToCenter*uSteepness-deHeight)/curR;
          modelPosition.z=modelPosition.z*pFactor;
          modelPosition.y=modelPosition.y*pFactor;
          modelPosition.x=modelPosition.x*pFactor;
        }else if(distanceToCenter<=pow(FlatR,2.0)){
          float pFactor=(curR-fHeight)/curR;
          modelPosition.z=modelPosition.z*pFactor;
          modelPosition.y=modelPosition.y*pFactor;
          modelPosition.x=modelPosition.x*pFactor;

        }
      }
      vDent=1.0-sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.y,2.0)+pow(modelPosition.z,2.0));
      // if (modelPosition.x*modelPosition.x+modelPosition.y*modelPosition.y<0.02)
      //   modelPosition.z += (0.02*2.0-0.08);
      // modelz=modelPosition.z+0.08;
      // modelz=modelPosition.z;
      vec4 viewPosition=viewMatrix*modelPosition;
      vec4 projectedPosition=projectionMatrix*viewPosition;
      gl_Position = projectedPosition;  
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;

    uniform vec3 uColor;
    // uniform vec3 uPoint;
    varying float vDent;
    // uniform float uTime;
    // uniform sampler2D uTexture;

    // varying vec2 vUv;
    // varying float modelz;
    // varying float distanceToCenter;

    void main() {
      // float wave = vWave * 0.2;
      // vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      // gl_FragColor = vec4(0.8-abs(abs(modelz)-1.0)*1.0,0.8-abs(abs(modelz)-1.0)*1.0,0.8-abs(abs(modelz)-1.0)*1.0, 1.0); 
      gl_FragColor = vec4(0.7-vDent*3.0,0.7-vDent*3.0,0.7-vDent*3.0,1.0);
    }
  `
);

extend({ WaveShaderMaterial });

const Wave = () => {
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  // const [image] = useLoader(THREE.TextureLoader, [
  //   "https://images.unsplash.com/photo-1604011092346-0b4346ed714e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1534&q=80",
  // ]);
  const CraterCenters=[];
  const CraterSizes=[];
  for (let i = 0; i <80; i++) {
    let x=Math.random()*2-1;
    let y=Math.random()*2-1;
    let z=Math.sqrt(1-x**2-y**2)*(Math.floor(Math.random()*2)*2-1);
    let point=new THREE.Vector3(x,y,z);
    CraterCenters[i]=point;
    CraterSizes[i]=Math.random()**4+0.5;
  }
  return (
    <mesh>
      <sphereBufferGeometry args={[1, 1000,1000]} />
      <waveShaderMaterial uPointArray={CraterCenters} uSizeArray={CraterSizes} ref={ref} />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ fov: 12, position: [0, 0, 5] }}>
      <pointLight position={[10,10,10]}/>
      <pointLight position={[5,-5,10]}/>
      <pointLight position={[5,5,-10]}/>
      <Suspense fallback={null}>
        <Wave />
      </Suspense>
      <OrbitControls/>
    </Canvas>
  );
};

const App = () => {
  const [values, setValues] = useState([0])
  return (
    <>
      {/* <div className="w-full flex justify-center">
			<div className="w-48 border-4 border-red-300">
				<h1 className="text-4xl">Range</h1>
				<label>React Range</label>
				<Range
					step={1}
					min={0}
					max={75}
					values={values}
					onChange={(values) => {
						setValues(values)
					}}
					renderTrack={({ props, children }) => (
						<div
							{...props}
							className="w-full h-3 pr-2 my-4 bg-gray-200 rounded-md"
						>
							{children}
						</div>
					)}
					renderThumb={({ props }) => (
						<div
							{...props}
							className="w-5 h-5 transform translate-x-10 bg-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						/>
					)}
				/>
				<span>{values[0]}px</span>
				<br />
				<br />
				<hr />
				<br />
			</div>
		</div> */}
      <Scene />
    </>
  );
};

export default App;
