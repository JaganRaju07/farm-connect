const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { sendOTP, generateOTP } = require("../services/smsService");

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

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Upsert the OTP (Updates if phone already exists in store)
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

    if (storedOTP.otp_code !== String(otp)) { // Enforced string comparison just in case
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > new Date(storedOTP.expires_at)) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const table = userType === "farmer" ? "farmers" : "consumers";
    let user;

    // --- CRITICAL FIX HERE ---
    if (storedOTP.action === "register") {
      // Ensure required fields are provided
      if (!name || !latitude || !longitude || !address || !city) {
         return res.status(400).json({ 
            success: false, 
            message: "Missing required profile fields for registration (name, latitude, longitude, address, city)" 
         });
      }

      let query;
      if (userType === "farmer") {
        query = `INSERT INTO farmers (name, phone, latitude, longitude, address, city, phone_verified) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id, phone, name`;
      } else {
        // Note: Consumers table uses 'delivery_address' instead of 'address'
        query = `INSERT INTO consumers (name, phone, latitude, longitude, delivery_address, city, phone_verified) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id, phone, name`;
      }

      const newUser = await pool.query(query, [name, phone, latitude, longitude, address, city]);
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
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};