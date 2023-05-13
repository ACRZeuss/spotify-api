var express = require("express");
var router = express.Router();

var SpotifyWebApi = require("spotify-web-api-node");
scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
];

require("dotenv").config();

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_API_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.CALLBACK_URL,
  autoRefresh: true,
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Spotify API by ACRZeuss" });
});

router.get("/login", (req, res) => {
  var html = spotifyApi.createAuthorizeURL(scopes);
  //console.log(html);
  res.redirect(html + "&show_dialog=true");
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    var data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    setInterval(async () => {
      try {
        var data = await spotifyApi.refreshAccessToken();
        const { access_token } = data.body;
        spotifyApi.setAccessToken(access_token);
      } catch (err) {
        console.log("Could not refresh access token", err);
      }
    }, 1000 * 60 * 60);

    res.redirect(process.env.REDIRECT_URI);
  } catch (err) {
    res.redirect("/#/error/invalid token");
  }
});

router.get("/userinfo", async (req, res) => {
  try {
    var result = await spotifyApi.getMe();
    // console.log(result.body);
    res.status(200).send(result.body);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/playlists", async (req, res) => {
  try {
    var result = await spotifyApi.getUserPlaylists();
    // console.log(result.body);
    res.status(200).send(result.body);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/currently-playing", async (req, res) => {
  try {
    var result = await spotifyApi.getMyCurrentPlayingTrack();
    // console.log(result.body);
    res.status(200).send(result.body);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/top-tracks", async (req, res) => {
  try {
    var result = await spotifyApi.getMyTopTracks();
    // console.log(result.body);
    res.status(200).send(result.body);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/recently-played", async (req, res) => {
  try {
    var result = await spotifyApi.getMyRecentlyPlayedTracks();
    // console.log(result.body);
    res.status(200).send(result.body);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
