import React,{useState,useEffect} from 'react';

import SpotifyPlayer from "react-spotify-web-playback";
export default function Player({accessToken,trackUri}){
    const [play, setPlay] = useState(true)

    useEffect(() => setPlay(true), [trackUri])
    if (!accessToken) return null;
    console.log("player rendered")
    return <SpotifyPlayer 
    style="z-index:100" 
    token={accessToken}
    showSaveIcon
    callback={state => {
        if (!state.isPlaying) setPlay(true)
      }}
    play={play}

    uris={trackUri?[trackUri]:["spotify:track:4WmB04GBqS4xPMYN9dHgBw"]}
    />
}