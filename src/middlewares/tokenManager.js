// tokenManager.js
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const tokenPath = 'src/middlewares/accessToken.txt';

// Function to fetch a new access token from the external API
async function fetchAccessToken() {
  // Perform the logic to obtain a new access token from the external API
  const postData = new URLSearchParams();
  postData.append('grant_type', 'client_credentials');
  postData.append('scope', 'booking_engine:api');
  postData.append('client_id', process.env.GUESTY_CLIENT_ID);
  postData.append('client_secret', process.env.GUESTY_CLIENT_SECRET);

  axios.post('https://booking.guesty.com/oauth2/token', postData, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache,no-cache',
    },
  })
    .then((response) => {
      console.log('New Access Token:', response.data.access_token);
      if(response.data.access_token){
        accessToken = response.data.access_token;
        fs.writeFileSync(tokenPath, accessToken);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Schedule token refresh every 24 hours
cron.schedule('0 0 * * *', async () => {
  await fetchAccessToken();
});

// Initialize the access token
async function initAccessToken() {
  // Load the access token from a file or environment variable at startup
  try {
    accessToken = process.env.GUESTY_ACCESS_TOKEN;
  } catch (error) {
    // Handle the case where the file does not exist or read error
    console.error('Error reading access token:', error);
  }
}

initAccessToken();

// Middleware to ensure a valid access token is available
function ensureAccessToken(req, res, next) {
  // console.log('Access Token:', accessToken)
  if (!accessToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Set the access token in the request headers or wherever needed for external API requests
  req.headers['Authorization'] = `Bearer ${accessToken}`;
  next();
}

module.exports = {
  ensureAccessToken,
  fetchAccessToken,
};