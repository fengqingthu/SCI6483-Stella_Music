import React,{useState,Component} from "react";
import { GetSongInfo } from "./songInfo";
class SongInfoCard extends Component{
    constructor(props){
        super(props);
        this.state={
            id:-1,
            
        }
    }
    //a function for parent App to call for updating the song info
    update=(index)=>{
        this.setState({
            id:index,

        })
        
    }
    render(){
    if (this.state.id==-1){
        return(<h4>Hover to see song infomation</h4>)
    }else{
    return (
        <h4>
           <p> Song Id:   {this.state.id}</p>
           <GetSongInfo id={this.state.id}></GetSongInfo>
        </h4>
        
    );
    }
    }
}
export default SongInfoCard;