const axios = require('axios');

let currentAccessToken = null;
let lastFetchTime = 0;

async function getAccessToken() {
    const now = Date.now();
    // console.log("e10e580851c59738ba02a4f57dbad5a7bc5c1e9c83: ", now)
    // if token was fetched less than 55 mins ago, reuse it
    if (currentAccessToken && now - lastFetchTime < 55 * 60 * 1000) {
        return currentAccessToken;
    }

    const response = await axios.post(
        `https://accounts.zoho.eu/oauth/v2/token`,
        null,
        {
            params: {
                refresh_token: process.env.ZOHO_REFRESH_TOKEN,// process.env.ZOHO_REFRESH_TOKEN,
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                grant_type: "refresh_token",
            },
        }
    );
    // console.log(response.data)
    currentAccessToken = response.data.access_token;
    lastFetchTime = now;

    return currentAccessToken;
}

module.exports = { getAccessToken }