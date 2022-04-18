/**
 * This is a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts, to access and save a token.
 */

var request = require('request');
const fs = require('fs');
const { exit } = require('process');

var tokenpath = '../output/token/token.txt'
var ipath = '../input/root.txt'
var odir = '../output/tree/'
const BRANCH = 10
const MAXLEVEL = 20

// read token
var token
try {
    const data = fs.readFileSync(tokenpath, 'utf8')
    arr = data.split("\n")
    console.log(`Read token: ${arr[0]}, will expire in ${arr[1]}s`)
    token = arr[0]
} catch (err) {
    console.error(err)
    exit()
}

// read root song
var root_artist_id
var root_genre
var root_song_id

try {
    const data = fs.readFileSync(ipath, 'utf8')

    arr = data.split("\n")
    root_artist_id = arr[0]
    root_genre = arr[1]
    root_song_id = arr[2]

} catch (err) {
    console.error(err)
    exit()
}

// private method to request for recommendation
const _recommend = (seed_artist_id, seed_genre, seed_song_id, level) => {
    // if reach the max level
    if (level >= MAXLEVEL) {
        return
    }
    // check if already visited
    var opath
    opath = odir+seed_song_id+".txt"
    if (fs.existsSync(opath)) {
        return
    }
    console.log(`Visiting level ${level}`)
    

    var query = `?seed_artists=${seed_artist_id}` + `&seed_genres=${seed_genre}` 
    + `&seed_tracks=${seed_song_id}` + `&limit=${BRANCH}`;
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
                    flag: "a+",})

                console.log(`Get ${body.tracks[i].id}`)
            }

            // start next level
            for (let i = 0; i < body.tracks.length; i++) {
                
                _recommend(body.tracks[i].artists[0].id,
                    "",
                    body.tracks[i].id,
                    level+1
                )

            }
        }
    });
  }

console.log('========== START CRAWLING ==========');
console.log(`Root: ${root_song_id}`)
_recommend(root_artist_id, root_genre, root_song_id, 0)