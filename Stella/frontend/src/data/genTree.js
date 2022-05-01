import Inputs from "../components/input";
const max = Inputs["max_stars"];
class Song {
  constructor(name, children) {
    this.name = name;
    this.children = children;
  }
}


///this is just a fake tree for prototyping///

function GenTree() {
  let rootSong = new Song(0, []);
  let idx = 1;
  // while (songs[0] && idx < max) {
  //   let song = songs.shift();
  //   let num_child = 3 
  //   // let num_child = Math.floor(3 + Math.random() * 2);
  //   for (let i = 0; i < num_child; i++) {
  //     let newSong = new Song(idx, []);
  //     songs.push(newSong);
  //     song.children.push(newSong);
  //     idx++;
  //   }
  // }
  for (let i = 0; i < 15; i++) {
    let newSong = new Song(idx, []);
    rootSong.children.push(newSong);
    idx++;
  }
  for (let i = 0; i < 15; i++) {
    for (let j=0;j<Math.floor(3*Math.random()+1) ;j++){
      let newSong = new Song(idx, []);
      rootSong.children[i].children.push(newSong);
      idx++;
    }
  }
  for (let i = 0; i < 15; i++) {
    for (let j=0;j< rootSong.children[i].children.length ;j++){
      for (let k=0;k< Math.floor(2*Math.random()) ;k++){
        let newSong = new Song(idx, []);
        rootSong.children[i].children[j].children.push(newSong);
        idx++;
      }
    }
  }
  return rootSong;
}

export default GenTree;
