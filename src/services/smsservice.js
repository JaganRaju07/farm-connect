const axios = require("axios");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phone, otp) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const demoMode = process.env.OTP_DEMO_MODE === "true";

    // Demo-only bypass: explicit OTP_DEMO_MODE=true.
    // If in production, this branch ONLY activates if OTP_DEMO_MODE=true explicitly.
    if (demoMode) {
      console.log(`\n[DEMO OTP] Phone: ${phone} | OTP: ${otp}\n`);
      return true;
    }

    // Production path — always call Fast2SMS.
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      // Fail loudly in production rather than silently swallowing the error.
      console.error("[OTP ERROR] FAST2SMS_API_KEY is not set. SMS cannot be sent.");
      return false;
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