/**
 * This is a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts, to access and save a token.
 */

var request = require('request');
const fs = require('fs')

var client_id = 'ca9db14086f4432bb29b1dc2745dbc05'; // Your client id
var client_secret; // Your secret

var ipath = '../input/client_secret.txt'
var opath = '../output/token/token.txt'

// private method to request for access token, write it to file
const _get_token = () => {

    try {
        const data = fs.readFileSync(ipath, 'utf8')
        console.log(`Read client_secret: ${data}`)
        client_secret = data
    } catch (err) {
        console.error(err)
    }
    
    var token; // access token
    var token_life; // token expire time in seconds

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

        console.log(`Get token: ${token}`)
        console.log(`Exipres in: ${token_life}`)

        const content = token + '\n' + token_life
        fs.writeFile(opath, content, err => {
            if (err) {
                console.error(err)
                return
            }
        })
        console.log(`Write token to: ${opath}`)
        }
    });
}

console.log('========== ACCESSING TOKEN ==========');

_get_token()