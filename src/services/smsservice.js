const axios = require("axios");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phone, otp) => {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (process.env.NODE_ENV === "development" || !apiKey) {
      console.log(`📱 OTP for ${phone}: ${otp}`);
      return true;
    }

    const response = await axios.get(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        params: {
          authorization: apiKey,
          route: "otp",
          variables_values: otp,
          numbers: phone,
        },
      }
    );

    return response.data.return === true;
  } catch (error) {
    console.error("SMS Error:", error.message);
    return false;
  }
};

module.exports = { generateOTP, sendOTP };