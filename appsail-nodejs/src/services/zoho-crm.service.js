const axios = require("axios");
const { getAccessToken } = require("../config/zoho.config.js");

async function getCRMData(moduleName = "Contacts", params = {}) {
  const token = await getAccessToken();

  const response = await axios.get(
    `https://www.zohoapis.eu/crm/v2/${moduleName}`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
      params,
    }
  );

  return response.data;
}

module.exports = { getCRMData };
