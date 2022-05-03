import React, { useState,useRef,useEffect } from "react";
import { useFrame } from "react-three-fiber";
import { useSpring, a } from "@react-spring/three";
import { Html } from "@react-three/drei";
import * as THREE from "three";
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


function Planet ({ position, dimensions, song ,context}) {
//   const songContext=useContext(SongContext);
  // console.log("context in planet",context)
  const[songInfo,setsongInfo]=useState({album:{name:"",artists:[]},external_urls:{uri:""}});
  const[audioFeatures,setAudioFeatures]=useState(backup);
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
    }).then(jsonResponse=>{setAudioFeatures(jsonResponse);setColor(jsonResponse)})
  },[]
  )

  // {
  //   "danceability": 0.687,
  //   "energy": 0.686,
  //   "key": 7,
  //   "loudness": -8.343,
  //   "mode": 0,
  //   "speechiness": 0.0307,
  //   "acousticness": 0.328,
  //   "instrumentalness": 0,
  //   "liveness": 0.0591,
  //   "valence": 0.459,
  //   "tempo": 114.024,
  //   "type": "audio_features",
  //   "id": "0a0eWptMSFinwTAg1zfndE",
  //   "uri": "spotify:track:0a0eWptMSFinwTAg1zfndE",
  //   "track_href": "https://api.spotify.com/v1/tracks/0a0eWptMSFinwTAg1zfndE",
  //   "analysis_url": "https://api.spotify.com/v1/audio-analysis/0a0eWptMSFinwTAg1zfndE",
  //   "duration_ms": 282760,
  //   "time_signature": 4
  // }
  const setColor=(jsonResponse)=>{
    ref.current.uR=jsonResponse.energy*0.3+0.2;
    ref.current.uB=jsonResponse.acousticness*0.3+0.2;
    ref.current.uG=jsonResponse.danceability*0.15+0.2;
    ref.current.uJupiterness=jsonResponse.acousticness;
  }
  const selfRotateSpeed=0.5+Math.random()*1;
  const planetRef=useRef(null);
  useFrame(() => {
      planetRef.current.rotation.y+=selfRotateSpeed/20;
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


  const ref = useRef();
  const CraterCenters=[];
  const CraterSizes=[];
  
  const Radius=dimensions[0];
  // console.log("Radius",Radius)
  for (let i = 0; i <80; i++) {
    let x=(Math.random()*2-1)*Radius;
    let y=(Math.random()*2-1)*Radius;
    let z=Math.sqrt(Radius**2-x**2-y**2)*(Math.floor(Math.random()*2)*2-1);
    let point=new THREE.Vector3(x,y,z);
    CraterCenters[i]=point;
    CraterSizes[i]=Math.random()**4+0.5;
    
  }
  // const uR=
  

  // const [image] = useLoader(THREE.TextureLoader, [
  //   "https://images.unsplash.com/photo-1604011092346-0b4346ed714e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1534&q=80",
  // ]);

  
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
            <sphereGeometry attach="geometry" args={[Radius,100,100]} />
            <waveShaderMaterial uPointArray={CraterCenters}  uSizeArray={CraterSizes} ref={ref} Radius={Radius}/>
            {/* <meshBasicMaterial attach="material" wireframe={true}/> */}
            <Html distanceFactor={4}>
                <div class="content" >Song Name:{songInfo.name}</div>
            </Html>
        </a.mesh>
        
    );
  
};
export default Planet;
