import { useEffect, useState } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import CustomEditor from "./components/CustomEditor";
// import { vertexShader, fragmentShader } from "./lib/NoiseShaders";
import { vertexShader, fragmentShader } from "./lib/TextureShaders";
// import { vertexShader, fragmentShader } from "./lib/DynamicShaders";

export default function Home() {
  let test, audioContext, audioElement, dataArray, analyser, source;


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

    // Texture
    const texture1 = new THREE.TextureLoader().load('./noise.png', function(texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3,3);
    });
    
    // Uniform
    const uniforms1 = {
      u_time: {type: "f", value: 1.0},
      u_resolution: {type: "v2", value: new THREE.Vector2()},
      u_texture: {type:"sampler2D", value: texture1},
      u_amplitude: {type: "f", value: 3.0},
      u_data_arr: {type: "float[64]", value: dataArray}      
    };

    // Material
    const planeCustomMaterial = new THREE.ShaderMaterial({
      // note: this is where the magic happens
      uniforms: uniforms1,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      wireframe: true,
    });

    // Geometry
    const planeGeometry = new THREE.PlaneGeometry(64, 64, 64, 64);
    const planeMesh = new THREE.Mesh(planeGeometry, planeCustomMaterial);
    planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
    planeMesh.scale.x = 2;
    planeMesh.scale.y = 2;
    planeMesh.scale.z = 2;
    planeMesh.position.y = 8;
    test.scene.add(planeMesh);

    if (gui === undefined) {
      await initGui();
      const audioWaveGui = gui.addFolder("audio waveform");
      audioWaveGui
        .add(planeCustomMaterial, "wireframe")
        .name("wireframe")
        .listen();
      audioWaveGui
        .add(uniforms1.u_amplitude, "value", 1.0, 8.0)
        .name("amplitude")
        .listen();
    }

    const render = (time) => {
      analyser.getByteFrequencyData(dataArray);
      uniforms1.u_time.value = time;
      uniforms1.u_data_arr.value = dataArray;
      uniforms1.u_resolution.value.x = test.renderer.domElement.width;
      uniforms1.u_resolution.value.y = test.renderer.domElement.height;
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
          src="./fur_elise.mp3"
          className="w-80"
          controls
          autoPlay
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
