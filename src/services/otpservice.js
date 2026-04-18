const db = require('../config/db'); // [cite: 160]
const { sendOTP, generateOTP } = require('./smsService');

/**
 * Logic to send OTP and save it to the database[cite: 161].
 */
exports.sendOTPToPhone = async (phone, userType, action) => {
  const table = userType === 'farmer' ? 'farmers' : 'consumers'; // [cite: 162]
  
  // Check if the user exists [cite: 163]
  const userCheck = await db.query(`SELECT id FROM ${table} WHERE phone = $1`, [phone]);
  const phoneExists = userCheck.rows.length > 0; // [cite: 164]

  // Validation: Don't register a number that already exists [cite: 164, 165]
  if (action === 'register' && phoneExists) throw new Error('Phone already registered');
  if (action === 'login' && !phoneExists) throw new Error('Phone not found');

  const otp = generateOTP(); // [cite: 166]
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Set to 5 mins from now [cite: 167]

  // Save the OTP in the otp_store table 
  await db.query(
    `INSERT INTO otp_store (phone, otp_code, expires_at, user_type, action)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (phone) DO UPDATE SET otp_code = $2, expires_at = $3`, // [cite: 168, 169]
    [phone, otp, expiresAt, userType, action]
  );

  const sent = await sendOTP(phone, otp); // [cite: 170]
  if (!sent) throw new Error('Failed to send SMS'); // [cite: 171]
  
  return { message: 'OTP sent successfully' }; // [cite: 172]
};