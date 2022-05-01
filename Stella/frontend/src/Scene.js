
import Login from "./data/login";
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
import { PlaceHolderTree } from "./data/placeholderTree";
import {GetSongInfo} from "./components/songInfo";
;
// import Spaceship from "./components/spaceship";
// import Get_tree from "./backend/src/app";
let root =PlaceHolderTree;
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
const root_radius = Inputs["root_radius"];
function Scene({mode}) {
  // console.log(R);
root =Tree();
const songContext=useContext(SongContext);
  // console.log("context on scene",songContext)
  
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
  return <button onClick={handleClick}>{text}</button>
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
  useEffect(() => {
    if (!accessToken) return
    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])
  const infoUpdate=React.createRef()
  const [orbit, setOrbit] = useState(true);
  const [reset, doReset] = useState(true);
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
    doReset(!reset);
    // root=GenTree();
    console.log("clicked!",songId)
    
    
  }
  const handleMode=()=>{
    // console.log("info",info)
    setOrbit(!orbit);
    
  }
  let mode=orbit?"loop":"explore";
  return (
  <Fragment > 
    
    <SongInfoCard ref={infoUpdate}></SongInfoCard>
    <ModeSwitch handler={handleMode}></ModeSwitch>
    
    <SongContext.Provider value={{id:index,onHover:handleHover,onClick:handleClick}}>
    <Scene mode={mode}/>
    </SongContext.Provider>
  </Fragment> );

}


function App(){
  const code=new URLSearchParams(window.location.search).get("code")
  console.log(code)
  return code?<SceneContext style={{background:' #000000'}} code={code}/>:<Login/>
}

export default App;
