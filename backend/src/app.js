/**
 * Copy Right: Qing Feng @2022
 * This is an application to navigate the recommendation tree
 * of Spotify, simultaneouly cache the song info locally. The
 * app provides http interfaces as a backend service for our
 * Stella Music web app.
 */

const request = require('request');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const http = require("http");

// ==================== CONFIGURATION ====================

var client_id = 'ca9db14086f4432bb29b1dc2745dbc05'; // Your client id
var client_secret; // Your secret
var token; // access token
var token_life; // token expire time in seconds

const INITIAL_CRAWL = false;
const MAXBRANCH = 10;
const MAXLEVEL = 2;

const WAIT = 1000; // time to wait for system setup or request to return
var cooloff = 500; // time to pause after reaching Spotify API rate limit
const UNIT = 10;

const SECRETPATH = '../input/client_secret.txt';
const TOKENPATH = '../output/token/token.txt';
const ROOTPATH = '../input/root.txt';
const TREEDIR = '../output/tree/';
const SONGDIR = '../output/songs/';

const host = 'localhost';
const port = 8000;

// ==================== PRIVATE METHODS ====================

// method to clean given directory
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

// method to request for access token, write it to file
const _get_token = () => {

    console.log('========== ACCESSING TOKEN ==========');

    try {
        let data = fs.readFileSync(SECRETPATH, 'utf8');
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

        console.log(`Get token: ${token}, will expire in ${token_life}s`);

        const content = token + '\n' + token_life;
        fs.writeFile(TOKENPATH, content, err => {
            if (err) {
                console.error(err);
                return;
            }
        })
        }
    });
}

// method to read token from disk to memory
const _load_token = () => {
    try {

        let data = fs.readFileSync(TOKENPATH, 'utf8');
        arr = data.split("\n");
        console.log(`Load token: ${arr[0]}, will expire in ${arr[1]}s`);
        token = arr[0];
        return token;

    } catch (err) {
        console.error(err);
        exit();
    }
}

// read default root and start initial crawling
const _crawl = (song_id) => {
    // read root song
    var root_artist_id;
    var root_song_id;

    try {
        let data = fs.readFileSync(ROOTPATH, 'utf8');

        arr = data.split("\n");
        root_artist_id = arr[0];
        root_song_id = arr[1];

    } catch (err) {
        console.error(err);
        exit();
    }

    console.log('========== INITIAL CRAWLING ==========');
    console.log(`Root: ${root_song_id}`);
    _recommend(root_artist_id, root_song_id, 0);
}

// method to request for recommendation, crawl from root and asynchronously
// cache info locally 
const _recommend = async(seed_artist_id, seed_song_id, level) => {
    // if reach the max level
    if (level >= MAXLEVEL) {
        return;
    }
    // check if already visited
    var opath = TREEDIR+seed_song_id+".txt";
    if (fs.existsSync(opath)) {
        return;
    }
    // console.log(`Visiting level ${level}`);
    

    var query = `?seed_artists=${seed_artist_id}` 
    + `&seed_tracks=${seed_song_id}`
    + `&limit=${MAXBRANCH}`;

    var options = {
        url: 'https://api.spotify.com/v1/recommendations' + query,
        headers: {
            'Authorization': 'Bearer ' + token,
            // 'Content-Type': 'application/json',
            // 'Host': 'api.spotify.com'
        },
        json: true
    };
    // console.log(options);

    request.get(options, async function(error, response, body) {
        if (!error && response.statusCode === 200) {

            cooloff = Math.max(0, cooloff - UNIT);

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
        } else {
            if (error) {
                console.log(`Recommendation request encounters ${error}`);
            } else {
                console.log(`Recommendation request fails with ${response.statusCode}`);
            }
            // cool down and retry if requests are sent too frequently
            if (error || response.statusCode == 429) {
                cooloff += UNIT;
                await sleep(cooloff);
                _recommend(seed_artist_id, seed_song_id, level);
            }
        }
    });
}

// asynchronously request the given song and cache it locally
// return true if already cached otherwise false
const _fetch_song = async(song_id) => {
    // check if already cached
    var opath = SONGDIR+song_id+".json";

    if (fs.existsSync(opath)) {
        return true;
    }

    // otherwise request the song from Spotify API and cache locally
    var options = {
        url: 'https://api.spotify.com/v1/tracks/' + song_id,
        headers: {
            'Authorization': 'Bearer ' + token,
            // 'Content-Type': 'application/json',
            // 'Host': 'api.spotify.com'
        },
        json: true
    };
    // console.log(options);

    request.get(options, async function(error, response, body) {

        if (!error && response.statusCode === 200) {

            cooloff = Math.max(0, cooloff - UNIT);
            
            if (!fs.existsSync(opath)) {
                // create output file
                fs.closeSync(fs.openSync(opath, 'w'));
                // cache the song
                let data = JSON.stringify(body, null, 2);
                fs.writeFileSync(opath, data);
                console.log(`Cached ${song_id}`);
            }
        } else {
            if (error) {
                console.log(`Fetch_song request encounters ${error}`);
            } else {
                console.log(`Fetch_song request fails with ${response.statusCode}`);
            }
            // increase cooloff time and retry if requests are sent too frequently
            if (error || response.statusCode == 429) {
                cooloff += UNIT;
                await sleep(cooloff);
                _fetch_song(song_id);
            }
        }
    });
    return false;
}

// sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// method to get children nodes, if not crawled yet 
// start crawling and retry
const _get_children = async(song_id) => {

    var path = TREEDIR + song_id + ".txt";

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
            let song_info = Read_song(song_id);
            artist_id = song_info['artists'][0]['id'];

        } catch (err) {
            // console.log(err)
            artist_id = '';
        } finally {
            // start a new crawling, only one level
            _recommend(artist_id, song_id, MAXLEVEL-1);
            // return []; // for better availability
            // retry or simply return an empty list? use case?
            
            await sleep(WAIT);
            let res = await _get_children(song_id);
            return res;
        }
    }
}

// ==================== PUBLIC METHODS ====================

// method to get a tree with given root_id with an array of branch rates.
// Eg. [4,3,2] represents a tree with number of nodes each level: 1, 4, 12, 24
const Get_tree = async(root_id, branches) => {
    try {
        // base case
        if (branches.length == 0) {
            return {node: root_id, children: []};
        }
        // recurse
        let res = await _get_children(root_id);
        res = res.slice(0, branches[0]);
        var children = [];
        for (let i = 0; i < res.length; i++) {
            let subtree = await Get_tree(res[i], branches.slice(0, branches.length - 1));
            children.push(subtree);
        }
        return {node: root_id, children: children};
        
    } catch (err) {
        throw err;
    }
}

// read info from cached songs
const Read_song = async(song_id) => {

    var path = SONGDIR+song_id+".json";

    if (fs.existsSync(path)) {

        try {
            let data = fs.readFileSync(path);
            return JSON.parse(data);
        } catch (err) {
            throw err;
        }

    } else {
        // if not cached yet, fetch and retry
        let cached = await _fetch_song(song_id);
        if (cached) {
            return Read_song(song_id);
        } else {
            await sleep(WAIT);
            let res = await Read_song(song_id);
            return res;
        }
    }
}

// method to launch the instance
const Launch = async() => {
    console.log("========== LAUNCHING ==========");
    console.log(`Initialize wait interval: ${WAIT}`);
    console.log(`Initialize request cooloff: ${cooloff}`);
    console.log(`Crawling branch: ${MAXBRANCH}`);
    console.log(`Crawling level: ${MAXLEVEL}`);
    // setup
    _clean(SONGDIR);
    _clean(TREEDIR);
    _get_token();
    await sleep(WAIT);

    _load_token();
    // start initial crawling if desired
    // _crawl();
    console.log("========== LISTENING ==========");
    
    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`);
    });
}; Launch();

// ==================== HTTP CODE ====================

// Usage:
// curl http://localhost:8000/tree/<root_id>/<branch array>
// eg. http://localhost:8000/tree/4WmB04GBqS4xPMYN9dHgBw/3,3,3
// will return a tree rooted at 'Day One' with nodes each level:1, 3, 9, 27

// curl http://localhost:8000/song/<song_id>
// will return a json file containing the song's infomation

const requestListener = async function (req, res) {
    res.setHeader("Content-Type", "application/json");
    var segs = req.url.split('/').slice(1,);
    console.log(`Receive request:${segs}`);
    try {
        res.writeHead(200);
        switch(segs[0]) {
            case "tree":
                let root_id = segs[1];
                let branches = segs[2].split(',');
                for (let i = 0; i < branches.length; i++) {
                    branches[i] = Number(branches[i]);
                }
                
                let tree = await Get_tree(root_id, branches);
                // console.log(tree);
                res.end(JSON.stringify(tree, null, 2));
                break;
            
            case "song":
                let song_id = segs[1];
                let song = await Read_song(song_id);
                // console.log(song);
                res.end(JSON.stringify(song, null, 2));
                break;
        }
    } catch (err) {
        res.writeHead(400);
    }
};