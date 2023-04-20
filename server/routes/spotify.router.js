const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const querystring = require('querystring');
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = "http://localhost:5000/api/spotify/callback";

/**
 * Sourced from basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

// generates random string with length = incoming argument
// const generateRandomString = (length) => {
//   let text = "";
//   let possible =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//   for (let i = 0; i < length; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return text;
// };

// var stateKey = "spotify_auth_state";

// router.get("/login", rejectUnauthenticated, function (req, res) {
//   console.log("in spotify get");
//   var state = generateRandomString(16);
//   res.cookie(stateKey, state);

//   // requesting authorization from spotify
//   var scope = "user-read-private user-read-email";
//   res.redirect(
//     "https://accounts.spotify.com/authorize?" +
//       querystring.stringify({
//         response_type: 'code',
//         client_id: client_id,
//         scope: scope,
//         redirect_uri: redirect_uri,
//         state: state,
//       })
//   );
// });

// router.get("/callback", function (req, res) {
//   // your application requests refresh and access tokens
//   // after checking the state parameter

//   var code = req.query.code || null;
// //   var state = req.query.state || null;
// //   var storedState = req.cookies ? req.cookies[stateKey] : null;

//   if (state === null || state !== storedState) {
//     res.redirect(
//       "/#" +
//         querystring.stringify({
//           error: "state_mismatch",
//         })
//     );
//   } else {
//     res.clearCookie(stateKey);
//     var authOptions = {
//       url: "https://accounts.spotify.com/api/token",
//       form: {
//         code: code,
//         redirect_uri: redirect_uri,
//         grant_type: "authorization_code",
//       },
//       headers: {
//         Authorization:
//           "Basic " +
//           new Buffer(client_id + ":" + client_secret).toString("base64"),
//       },
//       json: true,
//     };

//     axios.post(authOptions, function (error, response, body) {
//       if (!error && response.statusCode === 200) {
//         var access_token = body.access_token,
//           refresh_token = body.refresh_token;

//         var options = {
//           url: "https://api.spotify.com/v1/me",
//           headers: { Authorization: "Bearer " + access_token },
//           json: true,
//         };

//         // use the access token to access the Spotify Web API
//         axios.get(options, function (error, response, body) {
//           console.log(body);
//         });

//         // we can also pass the token to the browser to make requests from there
//         res.redirect(
//           "/#" +
//             querystring.stringify({
//               access_token: access_token,
//               refresh_token: refresh_token,
//             })
//         );
//       } else {
//         res.redirect(
//           "/#" +
//             querystring.stringify({
//               error: "invalid_token",
//             })
//         );
//       }
//     });
//   }
// });

// router.get("/refresh_token", function (req, res) {
//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: "https://accounts.spotify.com/api/token",
//     headers: {
//       Authorization:
//         "Basic " +
//         new Buffer(client_id + ":" + client_secret).toString("base64"),
//     },
//     form: {
//       grant_type: "refresh_token",
//       refresh_token: refresh_token,
//     },
//     json: true,
//   };

//   router.post(authOptions, function (error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         access_token: access_token,
//       });
//     }
//   });
// });

router.get("/callback", rejectUnauthenticated, (req, res) => {
  console.log("in callback");
  // incoming query params
  var code = req.query.code;
  console.log("code coming from spotify!!", code);
  axios
    .post(
      "https://accounts.spotify.com/api/token",
      {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(client_id + ":" + client_secret).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      res.send(response);
      redirect("http://localhost:3000/#/home");
    })
    .catch((err) => {
      console.log("error getting token", err);
      res.redirect(400, "http://localhost:3000/#/home");
    });
});

module.exports = router;
