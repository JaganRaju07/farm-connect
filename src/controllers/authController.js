const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { sendOTP, generateOTP } = require("../services/smsservice");

exports.sendOTP = async (req, res, next) => {
  try {
    const { phone, userType, action } = req.body;

    const table = userType === "farmer" ? "farmers" : "consumers";

    const existingUser = await pool.query(
      `SELECT id FROM ${table} WHERE phone=$1`,
      [phone]
    );

    const phoneExists = existingUser.rows.length > 0;

    if (action === "register" && phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone already registered",
      });
    }

    if (action === "login" && !phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone not found. Please register first.",
      });
    }

    const existingOtp = await pool.query(
      `SELECT otp_code, expires_at FROM otp_store WHERE phone=$1 AND user_type=$2`, 
      [phone, userType]
    );

    let otp, expiresAt;
    
    // Check if there is an active OTP generated less than 60 seconds ago (expires in > 4 mins)
    if (existingOtp.rows.length > 0 && new Date(existingOtp.rows[0].expires_at).getTime() > Date.now() + 4 * 60 * 1000) {
      // Reuse the existing OTP to prevent overwriting during rapid double-clicks
      otp = existingOtp.rows[0].otp_code;
      expiresAt = existingOtp.rows[0].expires_at;
    } else {
      // Generate a new one
      otp = generateOTP();
      expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    }

    // Upsert the OTP
    await pool.query(
      `INSERT INTO otp_store (phone, otp_code, expires_at, user_type, action)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (phone)
       DO UPDATE SET
       otp_code=$2,
       expires_at=$3,
       user_type=$4,
       action=$5`,
      [phone, otp, expiresAt, userType, action]
    );

    const smsSent = await sendOTP(phone, otp);

    if (!smsSent) {
      throw new Error("Failed to send OTP");
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    // Note: Added profile fields for the registration flow
    const { phone, otp, userType, name, latitude, longitude, address, city } = req.body;

    const result = await pool.query(
      `SELECT * FROM otp_store WHERE phone=$1 AND user_type=$2`,
      [phone, userType]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "No OTP found" });
    }

    const storedOTP = result.rows[0];

    console.log("=== OTP VERIFICATION DEBUG ===");
    console.log("Provided OTP:", otp, typeof otp);
    console.log("Stored OTP:", storedOTP.otp_code, typeof storedOTP.otp_code);
    console.log("Match:", storedOTP.otp_code === String(otp));
    console.log("Trim Match:", storedOTP.otp_code.trim() === String(otp).trim());

    if (storedOTP.otp_code.trim() !== String(otp).trim()) { // Added trim to be safe
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > new Date(storedOTP.expires_at)) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const table = userType === "farmer" ? "farmers" : "consumers";
    let user;

    // --- CRITICAL FIX HERE ---
    if (storedOTP.action === "register") {
      // For progressive onboarding, we don't require latitude, longitude, address, city upfront.
      // The frontend will send them later via /complete-registration.
      // However, the database schema has NOT NULL constraints, so we insert temporary defaults.
      const insertLat = latitude || 0;
      const insertLon = longitude || 0;
      const insertAddr = address || 'Pending Profile Completion';
      const insertCity = city || 'Pending';

      let query;
      if (userType === "farmer") {
        query = `INSERT INTO farmers (name, phone, latitude, longitude, address, city, phone_verified) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id, phone, name`;
      } else {
        // Note: Consumers table uses 'delivery_address' instead of 'address'
        query = `INSERT INTO consumers (name, phone, latitude, longitude, delivery_address, city, phone_verified) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id, phone, name`;
      }

      const newUser = await pool.query(query, [name, phone, insertLat, insertLon, insertAddr, insertCity]);
      user = newUser.rows[0];
    } else {
      // Login Flow
      const existingUser = await pool.query(
        `SELECT id, phone, name FROM ${table} WHERE phone=$1`,
        [phone]
      );
      user = existingUser.rows[0];
    }

    // Clean up OTP after successful use
    await pool.query(`DELETE FROM otp_store WHERE phone=$1`, [phone]);

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: userType,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "30d",
      }
    );

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: {
        token,
        user,
        requiresProfileCompletion: storedOTP.action === "register"
      }
    });
  } catch (error) {
    next(error);
  }
};