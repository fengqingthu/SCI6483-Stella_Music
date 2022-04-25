/**
 * This is a basic node.js script to crawl the
 * recommendation tree of Spotify through its API
 */

const request = require('request');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');


var client_id = 'ca9db14086f4432bb29b1dc2745dbc05'; // Your client id
var client_secret; // Your secret
var token; // access token
var token_life; // token expire time in seconds

const BRANCH = 10;
const MAXLEVEL = 10;

const secretpath = '../input/client_secret.txt';
const tokenpath = '../output/token/token.txt';
const rootpath = '../input/root.txt';
const treedir = '../output/tree/';
const songdir = '../output/songs/';


const _clean = (directory) => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
            if (file.endsWith('.txt') || file.endsWith('.json')) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        }
      });
}

// private method to request for access token, write it to file
const _get_token = () => {

    console.log('========== ACCESSING TOKEN ==========');

    try {
        let data = fs.readFileSync(secretpath, 'utf8');
        console.log(`Read client_secret: ${data}`);
        client_secret = data;
    } catch (err) {
        console.error(err);
    }
    
    // initialize authOptions
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
          grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {

        if (!error && response.statusCode === 200) {
        token = body.access_token;
        token_life = body.expires_in;

        console.log(`Get token: ${token}`);
        console.log(`Exipres in: ${token_life}`);

        const content = token + '\n' + token_life;
        fs.writeFile(tokenpath, content, err => {
            if (err) {
                console.error(err);
                return;
            }
        })
        }
    });
}

// method to read token into memory
const _read_token = () => {
    try {

        let data = fs.readFileSync(tokenpath, 'utf8');
        arr = data.split("\n");
        console.log(`Read token: ${arr[0]}, will expire in ${arr[1]}s`);
        token = arr[0];
        return token;

    } catch (err) {
        console.error(err);
        exit();
    }
}

const _crawl = (song_id) => {
    // read root song
    var root_artist_id;
    var root_song_id;

    try {
        let data = fs.readFileSync(rootpath, 'utf8');

        arr = data.split("\n");
        root_artist_id = arr[0];
        root_song_id = arr[1];

    } catch (err) {
        console.error(err);
        exit();
    }

    console.log('========== START CRAWLING ==========');
    console.log(`Root: ${root_song_id}`);
    _recommend(root_artist_id, root_song_id, 0);
}

// return true if already cached otherwise false
const _fetch_song = (song_id) => {
    // check if already cached
    var opath = songdir+song_id+".json";

    if (fs.existsSync(opath)) {
        return true;
    }

    // otherwise request the song from Spotify API and cache locally
    var options = {
        url: 'https://api.spotify.com/v1/tracks/'+song_id,
        headers: {
            'Authorization': 'Bearer ' + token,
            // 'Content-Type': 'application/json',
            // 'Host': 'api.spotify.com'
        },
        json: true
    };

    request.get(options, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            if (!fs.existsSync(opath)) {
                // create output file
                fs.closeSync(fs.openSync(opath, 'w'));
                // cache the song
                let data = JSON.stringify(body, null, 2);
                fs.writeFileSync(opath, data);
            }
        }
    });
    
    return false;
}

// private method to request for recommendation
const _recommend = (seed_artist_id, seed_song_id, level) => {
    // if reach the max level
    if (level >= MAXLEVEL) {
        return;
    }
    // check if already visited
    var opath = treedir+seed_song_id+".txt";
    if (fs.existsSync(opath)) {
        return;
    }
    // console.log(`Visiting level ${level}`);
    

    var query = `?seed_artists=${seed_artist_id}` 
    + `&seed_tracks=${seed_song_id}`
    + `&limit=${BRANCH}`;

    var options = {
        url: 'https://api.spotify.com/v1/recommendations' + query,
        headers: {
            'Authorization': 'Bearer ' + token,
            // 'Content-Type': 'application/json',
            // 'Host': 'api.spotify.com'
        },
        json: true
    };
    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            // create output file
            fs.closeSync(fs.openSync(opath, 'w'));
            // write children to file
            for (let i = 0; i < body.tracks.length; i++) {
                
                fs.writeFileSync(opath, 
                    body.tracks[i].id+"\n",
                    {encoding: "utf8",
                    flag: "a+",});
                
                // cache locally
                _fetch_song(body.tracks[i].id);

                console.log(`Get ${body.tracks[i].id}`);
            }
            
            // start next level
            for (let i = 0; i < body.tracks.length; i++) {
                
                _recommend(body.tracks[i].artists[0].id,
                    body.tracks[i].id,
                    level+1
                );

            }
        }
    });
}

// sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// method to launch the instance
const Launch = async() => {
    console.log("========== LAUNCH ==========");
    // setup
    // _clean(songdir);
    // _clean(treedir);
    _get_token();
    await sleep(2000);

    _read_token();
    // start crawling
    // _crawl();

    // todo: interface handler
    console.log(Get_tree('4WmB04GBqS4xPMYN9dHgBw', [10,10,10]))
}; Launch();

// method to get the children nodes, if not crawled yet return am empty array
const _get_children = (song_id) => {

    var path = treedir+song_id+".txt";

    if (fs.existsSync(path)) {
        try {
            let data = fs.readFileSync(path, 'utf-8');
            return data.split('\n');
        } catch (err) {
            throw err;
        }
        
    } else {
        var artist_id;
        try {
            artist_id = Read_song(song_id)['artists'][0]['id'];

        } catch (err) {
            console.log(err)
            artist_id = '';
        } finally {
            _recommend(artist_id, song_id, 0);
            return [];
        }
    }
}

// get tree
const Get_tree = (root_id, branches) => {
    try {
        // base case
        if (branches.length == 0) {
            return {node: root_id, children: []};
        }

        var res = _get_children(root_id).slice(0, branches[0]);
        var children = [];
        for (let i = 0; i < res.length; i++) {
            children.push(Get_tree(res[i], branches.slice(0, branches.length - 1)));
        }
        return {node: root_id, children: children};
        
    } catch (err) {
        throw err;
    }
}

// read info from cached songs
const Read_song = (song_id) => {

    var path = songdir+song_id+".json";

    if (fs.existsSync(path)) {

        try {
            let data = fs.readFileSync(path);
            return JSON.parse(data);
        } catch (err) {
            throw err;
        }
    } else {
        // should not be used though
        _fetch_song(token, song_id);
        throw new Error('song not found');
    }
}