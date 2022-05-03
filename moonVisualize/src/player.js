import React, { Component, createRef } from 'react';
import songFile from './HMLTD01.mp3';



class Player extends Component{
    constructor(props) {
        super(props)
        this.audio = new Audio(songFile);
        this.funv=props.func;
        // this.canvas = createRef();
    }



    componentDidMount() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.source = this.context.createMediaElementSource(this.audio);

        this.analyser = this.context.createAnalyser();
        this.source.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        this.frequency_array = new Uint8Array(this.analyser.frequencyBinCount);


    }

    togglePlay = () => {
        const { audio } = this;
        if(audio.paused) {
            audio.play();
            this.rafId = requestAnimationFrame(this.tick);

         } else {
            audio.pause();
            cancelAnimationFrame(this.rafId);
         }
    }

    tick = () => {
        // this.animationLooper(this.canvas.current);
        this.analyser.getByteTimeDomainData(this.frequency_array);
        console.log("array data",this.frequency_array[180],this.frequency_array[540],this.frequency_array[900])
        this.props.func(this.frequency_array[180],this.frequency_array[540],this.frequency_array[900])
        
        this.rafId = requestAnimationFrame(this.tick);
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rafId);
        this.analyser.disconnect();
        this.source.disconnect();
    }

    render() {
        return <>
            <button onClick={this.togglePlay}>Play/Pause</button>
            {/* <canvas ref={this.canvas}  /> */}
        </>
    }
}

export default Player;