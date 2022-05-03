import React,{useEffect,useState} from 'react';
import { Html } from '@react-three/drei';

export const GetSongInfo=({id})=>{
    
    const[initialState,setInitialState]=useState({album:{name:"",artists:[]},external_urls:{uri:""}});
    
    useEffect(()=>{
        fetch("/song/"+id).then(res=>{
            if(res.ok){
                return res.json()
            }
        }).then(jsonResponse=>setInitialState(jsonResponse))
    },[id]
    )
    // console.log(initialState)
    return (
    <div className="overlay">
    <p >Song:{initialState.name}</p>
    <p>Album:{initialState.album.name}</p>
    <p>Artist:{initialState.album.artists.map((e,i)=><li key={i}>{e.name}</li>)}</p>
    <p>Uri:{initialState.uri}</p>
    </div>);
}


export const GetSongTag=({id})=>{
    const[initialState,setInitialState]=useState({});
    useEffect(()=>{
        fetch("/song/"+id).then(res=>{
            if(res.ok){
                return res.json()
            }
        }).then(jsonResponse=>setInitialState(jsonResponse))
    }
    )
    return (
    <Html>
        {initialState.name}
    </Html>);
}

export const GetSongUri=({id})=>{
    const[initialState,setInitialState]=useState({});
    useEffect(()=>{
        fetch("/song/"+id).then(res=>{
            if(res.ok){
                return res.json()
            }
        }).then(jsonResponse=>setInitialState(jsonResponse))
    }
    )
    return (initialState.uri);
}