import { useEffect, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three";
import SceneInit from "./lib/SceneInit";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { PMREMGenerator } from "three";
import { interpolateAs } from "next/dist/shared/lib/router/router";

/*
music react setting credit to https://github.com/SuboptimalEng/gamedex/tree/main/audio-visualizer
material shader is developed from the project https://codepen.io/mattrossman/pen/XWRYWwb
*/
export default function Home() {
  let test, audioContext, audioElement, dataArray, analyser, source;
  let totalVol = 0;

  let gui;
  const initGui = async () => {
    const dat = await import("dat.gui");
    gui = new dat.GUI();
  };

  const setupAudioContext = () => {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById("myAudio");
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  };

  const play = async () => {
    if (audioContext === undefined) {
      setupAudioContext();
    }

    /* 
    Mapping functions:
    iterations: current time / duration_ms: float / float, round to 
    speed: danceability: float 0-1
    depth: frequencyBin
    colorA (dim, all entries < 11): (r:speechness, g: instrumentalness, b: acousticness)
    colorB (color, all entries > ): (r:valence, g: key(int -1 - 11), b:loudness (float -60 - 0),)
    displacement: liveness
    horizontal: modality
    */
    function mapIterations(curtime, durations) {
      let t = 6 + Math.floor(curtime / durations * 46);
      return (t < 45)? t:45;
    }

    function mapSpeed(danceability) {
      return danceability * 0.001;
    }

    function mapColorA(speechness, instrumentalness, acousticness) {
      let r = Math.floor(speechness * 11);
      let g = Math.floor(instrumentalness * 11);
      let b = Math.floor(acousticness * 11);
      return '#'+ r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    function mapColorB(valence, key, loudness) {
      let r = Math.floor(valence / 0.3 * 255);
      r = (r < 255) ? r: 255;
      let g = Math.floor(255 - r * 0.65 - 0.5*(key + 1)/11 * 255);
      g = (g > 0) ? g: 0;
      let b = Math.floor(255 - r * 0.78 + (loudness / 60) * 255);
      b = (b > 0) ? b: 0;
      return '#'+ r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    function mapDisplacement(energy, totalVol) {
      return energy * totalVol * 0.001 * 0.5 / 1000000;
    }

    function mapMode(mode) {
      return mode;
    }

    function getData(dataArray) {
      let sum = 0;
      let iter = 32;
      for (let i = 0; i < iter; i++) {
        sum += dataArray[i];
      }
      return [sum/iter/100., sum/iter/255];
    }


    // const music = {
    //   "danceability": 0.311,
    //   "energy": 0.0173,
    //   "key": 9,
    //   "loudness": -27.788,
    //   "mode": 0,
    //   "speechiness": 0.0348,
    //   "acousticness": 0.927,
    //   "instrumentalness": 0.964,
    //   "liveness": 0.0727,
    //   "valence": 0.0658,
    //   "tempo": 95.985,
    //   "type": "audio_features",
    //   "id": "4WmB04GBqS4xPMYN9dHgBw",
    //   "uri": "spotify:track:4WmB04GBqS4xPMYN9dHgBw",
    //   "track_href": "https://api.spotify.com/v1/tracks/4WmB04GBqS4xPMYN9dHgBw",
    //   "analysis_url": "https://api.spotify.com/v1/audio-analysis/4WmB04GBqS4xPMYN9dHgBw",
    //   "duration_ms": 199423,
    //   "time_signature": 3
    // }
    
    // const music = {
    //   "danceability": 0.542,
    //   "energy": 0.588,
    //   "key": 10,
    //   "loudness": -10.893,
    //   "mode": 1,
    //   "speechiness": 0.03,
    //   "acousticness": 0.148,
    //   "instrumentalness": 0.834,
    //   "liveness": 0.0778,
    //   "valence": 0.136,
    //   "tempo": 113.985,
    //   "type": "audio_features",
    //   "id": "7L2YlrpcKhqeYZQDDD2AYR",
    //   "uri": "spotify:track:7L2YlrpcKhqeYZQDDD2AYR",
    //   "track_href": "https://api.spotify.com/v1/tracks/7L2YlrpcKhqeYZQDDD2AYR",
    //   "analysis_url": "https://api.spotify.com/v1/audio-analysis/7L2YlrpcKhqeYZQDDD2AYR",
    //   "duration_ms": 238782,
    //   "time_signature": 4
    // }

    const music = {
      "danceability": 0.352,
      "energy": 0.586,
      "key": 6,
      "loudness": -11.735,
      "mode": 1,
      "speechiness": 0.0366,
      "acousticness": 0.00743,
      "instrumentalness": 0.918,
      "liveness": 0.12,
      "valence": 0.278,
      "tempo": 89.928,
      "type": "audio_features",
      "id": "1BjmXBrelBxr8DDrS84O99",
      "uri": "spotify:track:1BjmXBrelBxr8DDrS84O99",
      "track_href": "https://api.spotify.com/v1/tracks/1BjmXBrelBxr8DDrS84O99",
      "analysis_url": "https://api.spotify.com/v1/audio-analysis/1BjmXBrelBxr8DDrS84O99",
      "duration_ms": 170633,
      "time_signature": 4
    }

    const params = {
      roughness: 0.2,
      iterations: 10,
      depth:0.46,
      smoothing: 0.01,
      displacement: 0.03,
      speed: 0.0001,
      // colorA: mapColorA(music["speechiness"], music["instrumentalness"], music["acousticness"]),
      // colorB: mapColorB(music["valence"], music["key"], music["loudness"]),
      horizontal: mapMode(music["mode"]),
      musicData: 1.0,
      radius : 1,
      colorA: new THREE.Color("#EC1415"),
      colorB: new THREE.Color("#020000")
    };
    // console.log(params.colorA);
    // console.log(params.colorB);


    // Texture
    const heightMap = new THREE.TextureLoader().load('./noise5.jpeg');
    heightMap.minFilter = THREE.NearestFilter;
    const displacementMap = new THREE.TextureLoader().load('./wave.jpeg');
    displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
    
    // Craters
    const numCraters = 80;
    const CraterCenters=[];
    const CraterSizes=[];
    for (let i = 0; i <numCraters; i++) {
      let x=Math.random()*2-1;
      let y=Math.random()*2-1;
      let z=Math.sqrt(1-x**2-y**2)*(Math.floor(Math.random()*2)*2-1);
      let point=new THREE.Vector3(x,y,z);
      CraterCenters[i]=point;
      CraterSizes[i]=Math.random()**2+0.3;
    }
    

    // Uniform
    var uniforms = {
      time: {type: "f", value: 0.0},
      iterations: { value: params.iterations },
      depth: { value: params.depth },
      smoothing: { value: params.smoothing },
    	colorA: { value: new THREE.Color(params.colorA) },
    	colorB: { value: new THREE.Color(params.colorB) },
      heightMap: { value: heightMap },
      displacementMap: { value : displacementMap },
      displacement: { value: params.displacement },
      radius: {value: params.radius},
      horizontal: {value: params.horizontal},
      musicData: {value: params.musicData},

      uColor: {value: new THREE.Color(0.0, 0.0, 0.0)},
      uPointArray:{value: CraterCenters},
      uSizeArray:{value : CraterSizes},
      uCrateNum:{value:numCraters},
      uFlatR:{value: 0.1},
      uCraterR:{value: 0.2},
      uSteepness:{value: 3.0},
      uRimHF:{value:0.},
      uSphereR:{value: 1.0},
    };
    

    // Material
    const material = new THREE.MeshStandardMaterial({roughness: params.roughness});
    material.onBeforeCompile = shader => {
      shader.uniforms = { ...shader.uniforms, ...uniforms }

      // Add to top of vertex shader
      shader.vertexShader =
        `
        precision mediump float;

        varying vec3 v_pos;
        varying vec3 v_dir;
        varying float vDent;
        
        uniform float uCraterR;
        uniform float uFlatR;
        uniform float uRimHF;
        uniform float uSphereR;
        uniform float uSteepness;
        uniform int uCrateNum;
        uniform vec3 uPointArray[30];
        uniform float uSizeArray[30];
      ` + shader.vertexShader;

      // Assign values to varyings inside of main()
      shader.vertexShader = shader.vertexShader.replace(
        /void main\(\) {/,
        (match) =>
          match +
          `
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
      `
      );
      shader.vertexShader = shader.vertexShader.replace(`#include <fog_vertex>`,
      `#include <fog_vertex>
      v_dir = position - cameraPosition; // Points from camera to vertex
      v_pos = position;
      vDent = 1.0-sqrt(pow(modelPosition.x,2.0)+pow(modelPosition.y,2.0)+pow(modelPosition.z,2.0));
      gl_Position = projectionMatrix * modelViewMatrix * modelPosition;

      `);

      // Add to top of fragment shader
      shader.fragmentShader =
        `
      	#define FLIP vec2(1., -1.)
        precision mediump float;
        
        varying vec3 v_pos;
        varying vec3 v_dir;
        varying float vDent;

        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform sampler2D heightMap;
        uniform sampler2D displacementMap;
        uniform int iterations;
        uniform float depth;
        uniform float smoothing;
        uniform float displacement;
        uniform float time;
        uniform float radius;
        uniform int horizontal;
        uniform vec3 uColor;
        uniform float musicData;
      ` + shader.fragmentShader;

      // Add above fragment shader main() so we can access common.glsl.js
      shader.fragmentShader = shader.fragmentShader.replace(
        /void main\(\) {/,
        (match) =>
          `
       	/**
         * @param p - Point to displace
         * @param strength - How much the map can displace the point
         * @returns Point with scrolling displacement applied
         */
        vec3 displacePoint(vec3 p, float strength) {
        	vec2 uv = equirectUv(normalize(p));
          vec2 scroll = vec2(time, 0.);
          vec3 displacementA = texture(displacementMap, uv + scroll).rgb; // Upright
          vec3 displacementB;

          if (horizontal == 1) {
            displacementB = texture(displacementMap, uv * FLIP - scroll).rgb; // Upside down
          } else {
            displacementB = texture(displacementMap, uv - scroll).rgb;
          }
         
          // Center the range to [-0.5, 0.5], note the range of their sum is [-1, 1]
          displacementA -= 0.5;
          displacementB -= 0.5;

          return p + strength * (displacementA + displacementB) * radius;
        }
        
				/**
          * @param rayOrigin - Point on sphere
          * @param rayDir - Normalized ray direction
          * @returns Diffuse RGB color
          */
        vec3 marchMarble(vec3 rayOrigin, vec3 rayDir) {
          float perIteration = 1. / float(iterations);
          vec3 deltaRay = rayDir * perIteration * depth * radius;

          // Start at point of intersection and accumulate volume
          vec3 p = rayOrigin;
          float totalVolume = 0.;
          float angle = -0.008;

          for (int i=0; i<iterations; ++i) {
            // Read heightmap from spherical direction of displaced ray position
            vec3 displaced = displacePoint(p, displacement);
            vec2 uv = equirectUv(normalize(displaced));

            // rotate
            float cosAngle = cos(angle);
            float sinAngle = sin(angle);
            mat2 rotV = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
            mat2 rotU = mat2( -cosAngle, sinAngle,sinAngle, cosAngle);
            uv = rotV * uv;
            if (horizontal == 0) {
              uv = rotU * uv;
            }
            angle += 0.004;

            float heightMapVal = texture(heightMap, uv).r;

            // Take a slice of the heightmap
            float height = length(p); 
            float cutoff = 1. - float(i) * perIteration;
            float line = abs(fract(totalVolume - 0.5)-0.5) / fwidth(totalVolume) /0.25;
            float grid = 1.0 - min(line, 0.9);
            float slice = smoothstep(cutoff, cutoff + smoothing, heightMapVal);

            // Accumulate the volume and advance the ray forward one step
            totalVolume += slice * perIteration;
            p += deltaRay + 0.00000001*vec3(smoothstep(grid, slice, deltaRay));
          }
          return mix(colorA , colorB, totalVolume);
        }
      ` + match
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        /vec4 diffuseColor.*;/,
        `
      	vec3 rayDir = normalize(v_dir);
        vec3 rayOrigin = v_pos;
        
        vec3 rgb = marchMarble(rayOrigin, rayDir); // base color
        vec3 color = vec3(0.1+vDent*3.0,0.1+vDent*3.0,0.1+vDent*3.0); // thunderstorm color
        vec3 rgb2 = mix(rgb * (0.48+ 3.2*sin(musicData * 8./ PI)), colorA * 0.2, 0.5*v_dir) - 0.5* color; // mix the color layers
				vec4 diffuseColor = vec4(rgb2, 1.);   
      `
      );
    };


    // Geometry
    const geometry = new THREE.SphereGeometry(params.radius, 600, 600);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
    mesh.receiveShadow = true;
    test.scene.add(mesh)
 

    // GUI update
    if (gui === undefined) {
      await initGui();
      const audioWaveGui = gui.addFolder("audio waveform");
      audioWaveGui
        .add(material, "wireframe")
        .name("wireframe")
        .listen();
      audioWaveGui
        .add(params, "roughness", 0, 1, 0.01)
        .onChange((v)=>(material.roughness = v));
      audioWaveGui
        .add(params, "iterations", 0, 64, 1)
        .onChange((v)=>(uniforms.iterations.value = v));
      audioWaveGui
        .add(params, "depth", 0, 1, 0.01)
        .onChange((v)=>(uniforms.depth.value = v));
      audioWaveGui
        .add(params, "smoothing", 0, 1, 0.01)
        .onChange((v)=>(uniforms.smoothing.value = v));
      audioWaveGui
        .add(params, "displacement", 0, 0.3, 0.001)
        .onChange((v)=>(uniforms.displacement.value = v));
      audioWaveGui
        .add(params, "speed", 0, 0.0001, 0.00001)
      // audioWaveGui
      //   .add(params, "colorA")
      //   .onChange((v)=>(uniforms.displacement.value.set(v)));
      // audioWaveGui
      //   .add(params, "colorB")
      //   .onChange((v)=>(uniforms.displacement.value.set(v)));
    }

    const render = (time) => {
      analyser.getByteFrequencyData(dataArray);
      let musicData = getData(dataArray);
      uniforms.musicData.value = (uniforms.musicData.value + musicData[1]) / 2.;
      totalVol += musicData[0];
      let speed = mapSpeed(music["danceability"])
      uniforms.time.value =  speed * time * 0.01;
      uniforms.iterations.value = mapIterations(time,music["duration_ms"]);
      uniforms.depth.value = uniforms.iterations.value * 0.01;
      uniforms.displacement.value = mapDisplacement(music["duration_ms"], totalVol);
      mesh.rotation.y += speed * 2.;
      mesh.rotation.x += speed * 2.;
      requestAnimationFrame(render);
    };
    render();
  };


  useEffect(() => {
    test = new SceneInit("myThreeJsCanvas");
    test.initScene();
    test.animate();
  }, []);


  return (
    <div className="flex flex-col items-center justify-center">
      <div className="absolute bottom-2 right-2">
        <audio
          id="myAudio"
          src="./high.mp3"
          className="w-80"
          controls
          onPlay={play}
        />
      </div>
      {/* <div className="absolute bg-white bottom-2 left-2 p-2 rounded-xl text-2xl">
        <button onClick={toggleCustomEditor}>
          {showCustomEditor ? <div>⬅️ 💻</div> : <div>➡ 💻</div>}
        </button>
      </div> */}
      <canvas id="myThreeJsCanvas"></canvas>
      {/* {showCustomEditor ? <CustomEditor /> : null} */}
    </div>
  );
}
