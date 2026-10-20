const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOTP, generateOTP } = require("../services/smsservice");

// In-memory per-phone attempt limiter
// NOTE: otpAttempts uses a Node.js process-local Map. This provides reliable enforcement
// in single-instance deployments. For multi-instance, clustered, or autoscaled environments,
// this state must be backed by an external shared store (such as Redis or a PostgreSQL table)
// so that failed-attempt counting and lockouts are synchronized across all application workers.
const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_PERIOD_MS = 15 * 60 * 1000; // 15 minutes
const otpAttempts = new Map(); // phone -> { attempts: number, lockoutUntil: number | null }

// Periodic cleanup of stale attempt records every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of otpAttempts.entries()) {
    if (record.lockoutUntil && record.lockoutUntil < now) {
      otpAttempts.delete(phone);
    }
  }
}, 30 * 60 * 1000).unref();

exports.sendOTP = async (req, res, next) => {
  try {
    const { phone, userType, action } = req.body;

    // Check if phone is currently locked out due to excessive failed attempts
    const attemptRecord = otpAttempts.get(phone);
    if (attemptRecord) {
      if (attemptRecord.lockoutUntil && attemptRecord.lockoutUntil > Date.now()) {
        const remainingMinutes = Math.ceil((attemptRecord.lockoutUntil - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          message: `Too many failed attempts. Please wait ${remainingMinutes} minute(s) before requesting another OTP.`
        });
      } else if (attemptRecord.lockoutUntil && attemptRecord.lockoutUntil <= Date.now()) {
        // Active lockout has elapsed, reset attempt record
        otpAttempts.delete(phone);
      }
    }

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
      // NOTE: Failed attempts persist across re-issuances. We deliberately do NOT
      // delete otpAttempts here, preventing an attacker from resetting attempt limits.
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
    const { phone, otp, userType, name, latitude, longitude, address, city } = req.body;

    // Check per-phone lockout
    const attemptRecord = otpAttempts.get(phone);
    if (attemptRecord) {
      if (attemptRecord.lockoutUntil && attemptRecord.lockoutUntil > Date.now()) {
        const remainingMinutes = Math.ceil((attemptRecord.lockoutUntil - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          message: `Too many failed attempts. Account temporarily locked for ${remainingMinutes} minute(s).`
        });
      } else if (attemptRecord.lockoutUntil && attemptRecord.lockoutUntil <= Date.now()) {
        // Lockout period has elapsed, clear lockout
        otpAttempts.delete(phone);
      }
    }

    const result = await pool.query(
      `SELECT * FROM otp_store WHERE phone=$1 AND user_type=$2`,
      [phone, userType]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "No OTP found" });
    }

    const storedOTP = result.rows[0];

    // Expiry check must happen BEFORE comparing codes
    if (new Date() > new Date(storedOTP.expires_at)) {
      await pool.query(`DELETE FROM otp_store WHERE phone=$1`, [phone]);
      // NOTE: Do not clear otpAttempts here, so expired attempts still count against quota
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new OTP." });
    }

    // Constant-time comparison to prevent timing attacks
    const storedBuf = Buffer.from(storedOTP.otp_code.trim());
    const providedBuf = Buffer.from(String(otp || '').trim());
    const isMatch = storedBuf.length === providedBuf.length && crypto.timingSafeEqual(storedBuf, providedBuf);

    if (!isMatch) {
      const priorAttempts = otpAttempts.get(phone)?.attempts || 0;
      const currentAttempts = priorAttempts + 1;

      if (currentAttempts >= MAX_OTP_ATTEMPTS) {
        otpAttempts.set(phone, {
          attempts: currentAttempts,
          lockoutUntil: Date.now() + LOCKOUT_PERIOD_MS
        });
        // Invalidate OTP immediately upon exceeding max attempts
        await pool.query(`DELETE FROM otp_store WHERE phone=$1`, [phone]);
        return res.status(429).json({
          success: false,
          message: "Too many failed attempts. OTP has been invalidated. Please try again after 15 minutes."
        });
      } else {
        otpAttempts.set(phone, {
          attempts: currentAttempts,
          lockoutUntil: null
        });
        const remaining = MAX_OTP_ATTEMPTS - currentAttempts;
        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${remaining} attempt(s) remaining.`
        });
      }
    }

    // OTP verified successfully - clear attempt counter
    otpAttempts.delete(phone);

    const table = userType === "farmer" ? "farmers" : "consumers";
    let user;

    if (storedOTP.action === "register") {
      const insertLat = latitude || 0;
      const insertLon = longitude || 0;
      const insertAddr = address || 'Pending Profile Completion';
      const insertCity = city || 'Pending';

      let query;
      if (userType === "farmer") {
        query = `INSERT INTO farmers (name, phone, latitude, longitude, address, city, phone_verified) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id, phone, name`;
      } else {
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

    // Ensure JWT secret is configured
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

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

exports.getDemoOTP = async (req, res, next) => {
  try {
    if (process.env.OTP_DEMO_MODE !== "true") {
      return res.status(403).json({ success: false, message: "Demo mode disabled" });
    }

    const authHeader = req.headers["x-demo-secret"];
    const demoSecret = process.env.OTP_DEMO_SECRET;

    if (!demoSecret || authHeader !== demoSecret) {
      return res.status(401).json({ success: false, message: "Unauthorized demo access" });
    }

    const { phone } = req.params;

    const existingOtp = await pool.query(
      `SELECT otp_code, expires_at, user_type, action FROM otp_store WHERE phone=$1`,
      [phone]
    );

    if (existingOtp.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No OTP found for this phone" });
    }

    res.json({
      success: true,
      data: existingOtp.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Exported for testing and audit inspection
exports._otpAttempts = otpAttempts;
exports._MAX_OTP_ATTEMPTS = MAX_OTP_ATTEMPTS;
exports._LOCKOUT_PERIOD_MS = LOCKOUT_PERIOD_MS;
