import React,{useEffect,useState} from 'react';

export const Tree=()=>{
    const[initialState,setInitialState]=useState([]);
    useEffect(()=>{
        fetch("/tree/4WmB04GBqS4xPMYN9dHgBw/9,3,1").then(res=>{
            if(res.ok){
                return res.json()
            }
        }).then(jsonResponse=>setInitialState(jsonResponse))
    },[])
    return(initialState)
}
