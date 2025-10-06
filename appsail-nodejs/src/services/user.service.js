const { getAccessToken } = require("../configs/zoho.config");
const axios = require('axios');

const userLoginService = async (loginId) => {
    try {
        const token = await getAccessToken();

        // Determine filter field
        const isEmail = loginId.includes("@");
        const criteria = isEmail
            ? `(Email:equals:${loginId})`
            : `(Phone:equals:${loginId} or Mobile:equals:${loginId})`;

        const { data } = await axios.get(
            `${process.env.ZOHO_API_BASE}/Contacts/search?criteria=${encodeURIComponent(criteria)}`,
            { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
        );

        if (data?.data?.length > 0) return data.data[0];
        return null;
    } catch (err) {
        console.error("Error fetching user from Zoho:", err.response?.data || err);
        throw new Error("Error fetching user from Zoho CRM");
    }
};

const getUserByIdService = async (contactId) => {
    try {
        const token = await getAccessToken();
        const { data } = await axios.get(
            `${process.env.ZOHO_API_BASE}/Contacts/${contactId}`,
            { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
        );

        // Zoho API returns 'data' array
        return data?.data?.length ? data.data[0] : null;
    } catch (err) {
        console.error("Error fetching user by ID:", err.response?.data || err.message);
        return null;
    }
};

module.exports = { userLoginService, getUserByIdService }