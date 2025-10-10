const { Dropbox } = require("dropbox");
const axios = require("axios");

const {
    DROPBOX_CLIENT_ID,
    DROPBOX_CLIENT_SECRET,
    DROPBOX_REFRESH_TOKEN,
} = process.env;

let cachedAccessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    const now = Date.now();

    if (cachedAccessToken && tokenExpiry && now < tokenExpiry - 60000) {
        // Use cached token (expires 1 min buffer)
        return cachedAccessToken;
    }

    // Generate new access token using refresh token
    const res = await axios.post(
        "https://api.dropbox.com/oauth2/token",
        null,
        {
            params: {
                grant_type: "refresh_token",
                refresh_token: DROPBOX_REFRESH_TOKEN,
                client_id: DROPBOX_CLIENT_ID,
                client_secret: DROPBOX_CLIENT_SECRET,
            },
        }
    );

    cachedAccessToken = res.data.access_token;
    tokenExpiry = now + res.data.expires_in * 1000; // expires_in is in seconds
    return cachedAccessToken;
}

// Returns a Dropbox client instance ready to use
async function getDropboxClient() {
    const token = await getAccessToken();
    return new Dropbox({ accessToken: token });
}

module.exports = { getDropboxClient };