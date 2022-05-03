
import Login from "./data/login";
import * as THREE from "three";
import { useSpring, a } from "@react-spring/three";
import { Html } from "@react-three/drei";
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.scss";
import React,{Suspense,Fragment,useContext,useState,useRef,Component, useEffect} from "react";
import { useFrame } from "react-three-fiber";
import SongContext from "./components/songContext";
import SongInfoCard from "./components/songInfoCard";
import { Canvas, useThree } from "react-three-fiber";
import { OrbitControls,FlyControls, Stars } from "@react-three/drei";
import FlyingSpaceship from "./components/flyingAroundGlobe";
import RecursiveSpinningOrb from "./components/Recurse";
import GenTree from "./data/genTree";
import Inputs from "./components/input";
import {Tree} from "./components/getTree";
import Player from "./player";
import { PlaceHolderTree } from "./data/placeholderTree";
import {GetSongInfo} from "./components/songInfo";
import SoundPlanet from "./components/SoundPlanet";
// import {GetSongUri} from "./components/songInfo";

// import Spaceship from "./components/spaceship";
// import Get_tree from "./backend/src/app";

import { CubeTextureLoader } from "three";

function SkyBox() {
  const { scene } = useThree();
  const loader = new CubeTextureLoader();
  // The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
  const texture = loader.load([
    "/front.png",
    "/back.png",
    "/top.png",
    "/bottom.png",
    "/right.png",
    "/left.png",
  ]);
  // Set the scene background property to the resulting texture.
  scene.background = texture;
  return null;
}
let defaultroot =PlaceHolderTree;
// let Tree=Get_tree("0YC192cP3KPCRWx8zr8MfZ4WmB04GBqS4xPMYN9dHgBw" ,[4,3,2]);
function Loading() {
  return (
    <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <sphereGeometry attach="geometry" args={[1, 16, 16]} />
      <meshBasicMaterial
        attach="material"
        color="white"
      />
    </mesh>
  );
}
function SpaceControl({mode}){
  const [state,setState]=useState(true);
  const {camera}=useThree();
  useFrame(() => {

});
  if (mode=="loop"){
    
    return(
      <Fragment>
      <Suspense fallback={<Loading />}>
        <FlyingSpaceship />
      </Suspense>
      <OrbitControls maxPolarAngle={Math.PI*80/180} minPolarAngle={0} enableDamping={true} enablePan={false} maxDistance={50} minDistance={root_radius*1.3}/>
      </Fragment>
    ) 
  }else{
    return (
    <Fragment>
    <FlyControls  moveMentSpeed={2**53} rollSpeed={0.1}/>
    </Fragment>
    )
    

  }

}
const root_radius =2.0;


function Scene({mode,rootId}) {
  
  // console.log(R);

const[root,setRoot]=useState(defaultroot);
useEffect(()=>{
    if (rootId==""){return}
    fetch("/tree/"+rootId+"/8,3").then(res=>{
        if(res.ok){
            // setInitialState();
            return res.json()
        }
    }).then(jsonResponse=>{setRoot(jsonResponse);console.log("rootchanged!")})
},[rootId])
console.log(rootId)
const songContext=useContext(SongContext);
  // console.log("context on scene",songContext)
// const ref = useRef();
// useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));
  // console.log(GetSongInfo(PlaceHolderTree.node))
  // console.log(PlaceHolderTree.node)
  
  return (
    <Fragment>
      {/* <GetSongInfo></GetSongInfo> */}
      <Canvas
        colorManagement
        // camera={{ position: [-5, 2, 10], fov: 60 }}
        // orthographic
        camera={{ fov:30, position: [10,5,0],far:100000 }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[0, 10, 0]} intensity={1.5} />

        <pointLight position={[-10, 0, -20]} intensity={0.5} />
        <pointLight position={[0, -10, 0]} intensity={1.5} />
        <Stars depth={100} />
        <Stars depth={5} />
        <SoundPlanet song={root}  context={songContext}></SoundPlanet>
        <RecursiveSpinningOrb
          position={[0, 0, 0]}
          color="aqua"
          song={root}
          dimensions={[root_radius, 32, 32]}
          context={songContext}
          level={0}
        />
        {/* <Terrain /> */}
        <SpaceControl mode={mode}></SpaceControl>
        {/* <OrbitControls enableDamping={true} enablePan={false}  /> */}
        <SkyBox />
      </Canvas>
    </Fragment>
  );
}
let index=-1
function ModeSwitch({handler}){
  const [t, setText] = useState(true);
  let text=t?"Explore Galaxy":"Orbit Planet";
  function handleClick(){
    setText(!t)
    handler()
  }
  return <button className="mode-switch" onClick={handleClick}>{text}</button>
}


const spotifyApi=new SpotifyWebApi(
  {
    clientID:"89c1c8fb88fe4d999e5facc42983914e",
    // clientSecret: "b6f5506e191341aa95a4855aebe7275eT",
  }
)



export function SceneContext ({code}){
  // console.log(Tree);
  const accessToken=useAuth(code);
  console.log("sceneContext",accessToken)
  useEffect(() => {
    if (!accessToken) return
    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])
  const infoUpdate=React.createRef()
  const [orbit, setOrbit] = useState(true);
  const [Id, setId] = useState("");
  const[uri,setUri]=useState("");
  useEffect(()=>{
    if (Id==""){return}
    console.log("triggered")
    fetch("/song/"+Id).then(res=>{
        if(res.ok){
            return res.json()
        }
    }).then(jsonResponse=>{setUri(jsonResponse.uri);console.log("uriset",jsonResponse)})
  },[Id]
  )
  let songInfo
  const handleHover=(songId)=>{
   
    // songInfo=GetSongInfo(songId)
    // // while(!songInfo){

    // // }
    // console.log(songInfo)
    infoUpdate.current.update(songId)
    
  }
  const handleClick=(songId)=>{
    // console.log("info",info)
    setId(songId);
    // root=GenTree();
    console.log("clicked!",Id)
    console.log("uri",uri)
    // }
    
    
    
  }
  const handleMode=()=>{
    // console.log("info",info)
    setOrbit(!orbit);
    
  }
  let mode=orbit?"loop":"explore";
  return (
  <> 
    <div className="scene">
    <SongInfoCard ref={infoUpdate}></SongInfoCard>
    <ModeSwitch handler={handleMode}></ModeSwitch>
    
    <SongContext.Provider value={{id:index,onHover:handleHover,onClick:handleClick}}>
    <Scene mode={mode} rootId={Id}/>
    
    </SongContext.Provider>
    </div>
    <div className="player"><Player accessToken={accessToken} trackUri={uri}></Player></div>
    
  </> );

}


function App(){
  const code=new URLSearchParams(window.location.search).get("code")
  console.log(code)
  return code?<SceneContext code={code}/>:<Login/>
}

export default App;
