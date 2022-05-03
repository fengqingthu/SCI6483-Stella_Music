import * as THREE from "three";
import React, { useRef, Suspense,useState } from "react";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial,OrbitControls } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import "./App.css";
// import { Range } from 'react-range';
// import { Vector3 } from "three";

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  { uR:0.2,
    uG:0.4,
    uB:0.5,
    uCraters:0.0,
    uJupiterness:0.0,
    uColorNoiseFreq:1.0,
    Radius:1.0,
    uPi:3.14,
    uTime:0.0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uPosition:new THREE.Vector3(0.0,0.0,0.0),
    // uPoint:new THREE.Vector3(0.6,0.8,0.0),
    uPointArray:[new THREE.Vector3(0.6,0.8,Math.sqrt(0.0)),new THREE.Vector3(0.0,0.0,1.0),new THREE.Vector3(0.0,0.6,0.8),new THREE.Vector3(-0.25,-0.1,-Math.sqrt(1.0-0.25**2.0-0.01))],
    uSizeArray:[1.0,0.5,1.5,1.2],
    uCrateNum:80,
    uFlatR:0.1,
    uCraterR:0.2,
    uSteepness:3.0,
    uRimHF:0.16,
    uSphereR:1.0,
    uTexture:new THREE.Texture(),
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
    
    uniform float uTime;
    uniform float uPi;
    varying vec2 vUv;
    // varying float modelz;
    // uniform vec3 uPoint;
    varying float vDent;
    varying vec3 vPos;
    varying vec3 vNormal;
    // varying float distanceToCenter;
    uniform sampler2D uTexture;
    uniform float Radius;
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
    uniform vec3 uPosition;

    void main() {
      vUv=uv;
      vPos=position;
      vec3 relativePosition=position-uPosition;
      vec3 texture = texture2D(uTexture,vUv).rgb;
      vec4 modelPosition=modelMatrix* vec4(relativePosition, 1.0);
      // modelPosition.x=sin(uTime);
      // modelPosition.z=cos(uTime);
      vec4 pos=modelPosition;
      float sAngle=0.0;

      float noiseFreq =2.0/Radius;
      float noiseAmp = 0.0005*Radius;
      float noiseL=0.0;
      for(int i=0;i<5;i++){
        vec3 noisePos = vec3( pos.x * noiseFreq,  pos.y* noiseFreq,  pos.z* noiseFreq);
        noiseL+=snoise3(noisePos)*noiseAmp;
        noiseFreq=noiseFreq*2.0;
        noiseAmp=noiseAmp*0.5;
      }
      float snoiseFreq =5000.0/Radius;
      float snoiseAmp = 0.0001*Radius;
      for(int i=0;i<5;i++){
        vec3 noisePos = vec3( pos.x * snoiseFreq,  pos.y * snoiseFreq,  pos.z* snoiseFreq);
        noiseL+=snoise3(noisePos)*snoiseAmp;
        snoiseFreq=snoiseFreq*2.0;
        snoiseAmp=snoiseAmp*0.5;
      }
      
      // float disloc=0.0;
      
      float disloc=noiseL+(texture.r+texture.b+texture.g)/3.0*0.002;

      for(int j=0;j<uCrateNum;j+=1){
        vec3 uPoint=uPointArray[j];
        float sizeF=uSizeArray[j];
        float CraterR=sizeF*uCraterR*sqrt(Radius);
        float FlatR=sizeF*uFlatR*sqrt(Radius);  
        float distanceToCenter=pow(modelPosition.x-uPoint.x,2.0)+pow(modelPosition.y-uPoint.y,2.0)+pow(modelPosition.z-uPoint.z,2.0);
        
        float RimH=pow(CraterR,2.0)*uSteepness*uRimHF;
        float deHeight=pow(CraterR,2.0)*uSteepness-RimH;
        float fHeight=deHeight-pow(FlatR,2.0)*uSteepness;
        float curR=sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.y,2.0)+pow(modelPosition.z,2.0));
        if (distanceToCenter>pow(CraterR*1.4,2.0)){
          float pFactor=(curR+disloc)/curR;
          modelPosition.z=modelPosition.z*pFactor;
          modelPosition.y=modelPosition.y*pFactor;
          modelPosition.x=modelPosition.x*pFactor;
        }else if (distanceToCenter>=pow(CraterR,2.0)&&distanceToCenter<pow(CraterR*1.4,2.0)){
          float disToEdge=CraterR*1.4-sqrt(distanceToCenter);
          float h=pow(disToEdge,2.0)*3.0;
          float pFactor=(curR+h+disloc)/curR;
          modelPosition.z=modelPosition.z*pFactor;
          modelPosition.y=modelPosition.y*pFactor;
          modelPosition.x=modelPosition.x*pFactor;
        }else if (distanceToCenter>pow(FlatR,2.0)&&distanceToCenter<pow(CraterR,2.0)){
          float pFactor=(curR+distanceToCenter*uSteepness-deHeight+disloc)/curR;
          modelPosition.z=modelPosition.z*pFactor;
          modelPosition.y=modelPosition.y*pFactor;
          modelPosition.x=modelPosition.x*pFactor;
        }else if(distanceToCenter<=pow(FlatR,2.0)){
          float pFactor=(curR-fHeight+disloc)/curR;
          modelPosition.z=modelPosition.z*pFactor;
          modelPosition.y=modelPosition.y*pFactor;
          modelPosition.x=modelPosition.x*pFactor;

        }
      }
      float newR=sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.z,2.0));

      if(modelPosition.z>=-0.03){
        sAngle=asin(modelPosition.x/newR)+uTime;
      }else if(modelPosition.x>=0.000000){
        sAngle=uPi-asin(modelPosition.x/newR)+uTime;
      }else{
        sAngle=-uPi-asin(modelPosition.x/newR)+uTime;
      }
      modelPosition.x=sin(sAngle)*newR;
      modelPosition.z=cos(sAngle)*newR;

      // vDent=0.0;
      vDent=(Radius-sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.y,2.0)+pow(modelPosition.z,2.0)))/Radius;
      // if (modelPosition.x*modelPosition.x+modelPosition.y*modelPosition.y<0.02)
      //   modelPosition.z += (0.02*2.0-0.08);
      // modelz=modelPosition.z+0.08;
      // modelz=modelPosition.z;
      // modelPosition.z+=uTime;
      modelPosition=modelPosition+vec4(uPosition,0.0);
      vec4 viewPosition=viewMatrix*modelPosition;
      vec4 projectedPosition=projectionMatrix*viewPosition;
      gl_Position = projectedPosition;  
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;
    uniform float uColorNoiseFreq;
    uniform float uJupiterness;
    uniform vec3 uColor;
    // uniform vec3 uPoint;
    varying float vDent;
    varying vec3 vPos;
    // uniform float uTime;
    uniform sampler2D uTexture;
    uniform float Radius;
    varying vec2 vUv;
    uniform float uCraters;
    uniform float uR;
    uniform float uB;
    uniform float uG;
    // varying float modelz;
    // varying float distanceToCenter;
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
    void main() {
      // float wave = vWave * 0.2;
      // vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      // gl_FragColor = vec4(0.8-abs(abs(modelz)-1.0)*1.0,0.8-abs(abs(modelz)-1.0)*1.0,0.8-abs(abs(modelz)-1.0)*1.0, 1.0); 
      float noiseFreq =uColorNoiseFreq/Radius;
      float noiseAmp = 0.2;
      float noiseL=0.0;
      for(int i=0;i<5;i++){
        vec3 noisePos = vec3( vPos.x * noiseFreq*(1.0-uJupiterness),  vPos.y* noiseFreq*(1.0+10.0*uJupiterness), vPos.z* noiseFreq*(1.0-uJupiterness));
        noiseL+=snoise3(noisePos)*noiseAmp;
        noiseFreq=noiseFreq*2.0;
        noiseAmp=noiseAmp*0.5;
      }
      noiseL=noiseL;
      vec3 texture = texture2D(uTexture,vUv).rgb;
      
      // gl_FragColor = vec4(0.2-vDent*3.0+noiseL,0.4-vDent*3.0+noiseL*0.8,0.4-vDent*3.0+noiseL*0.3,1.0)*0.8+vec4(texture,1.0)*0.2;
      if (uCraters==0.0){
      gl_FragColor = vec4(uR+noiseL,uB+noiseL*0.8,uG+noiseL*0.3,1.0)*0.8+vec4(texture,1.0)*0.2;
      }else{
        gl_FragColor = vec4(0.2-vDent*3.0+noiseL,0.4-vDent*3.0+noiseL*0.8,0.4-vDent*3.0+noiseL*0.3,1.0)*0.8+vec4(texture,1.0)*0.2;
      }
      // gl_FragColor = vec4(texture,1.0);
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

const ShaderMoon = () => {
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

export default ShaderMoon;
