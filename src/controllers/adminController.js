const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/v1/admin/login
exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email and password are required'
                }
            });
        }

        const result = await db.query(
            `SELECT id, name, email, phone, password_hash, role, is_active
             FROM admins
             WHERE LOWER(email) = LOWER($1)`,
            [email.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        const admin = result.rows[0];

        if (admin.is_active === false) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCOUNT_DISABLED',
                    message: 'Admin account has been deactivated.'
                }
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not configured');
        }

        const token = jwt.sign(
            {
                userId: admin.id,
                email: admin.email,
                role: 'admin',
                adminRole: admin.role
            },
            jwtSecret,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        );

        res.json({
            success: true,
            message: 'Admin authentication successful',
            data: {
                token,
                user: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone || 'N/A',
                    role: 'admin',
                    adminRole: admin.role
                }
            }
        });
    } catch (error) {
        if (next) return next(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/v1/admin/farmers
exports.listFarmers = async (req, res) => {
    try {
        const query = `
            SELECT id, name, phone, email, city, verification_status, is_verified, is_active, created_at
            FROM farmers
            ORDER BY created_at DESC;
        `;
        const { rows } = await db.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/v1/admin/verify-farmer/:id or /farmers/:id/verify
exports.verifyFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const { verification_status, is_verified } = req.body;

        // Valid values check matching table constraints
        if (!['pending', 'approved', 'rejected'].includes(verification_status)) {
            return res.status(400).json({ success: false, message: "Invalid verification state value." });
        }

        const query = `
            UPDATE farmers 
            SET verification_status = $1, is_verified = $2
            WHERE id = $3
            RETURNING id, name, verification_status, is_verified;
        `;

        const { rows } = await db.query(query, [verification_status, is_verified, id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Farmer record not found" });
        }

        res.status(200).json({
            success: true,
            message: `Farmer status successfully updated to ${verification_status}`,
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/v1/admin/stats
exports.getStats = async (req, res) => {
    try {
        const [farmers, consumers, products, orders] = await Promise.all([
            db.query('SELECT COUNT(*) FROM farmers WHERE is_active = TRUE'),
            db.query('SELECT COUNT(*) FROM consumers WHERE is_active = TRUE'),
            db.query('SELECT COUNT(*) FROM products WHERE is_active = TRUE'),
            db.query('SELECT COUNT(*) FROM orders')
        ]);

        res.status(200).json({
            success: true,
            data: {
                total_farmers: parseInt(farmers.rows[0].count, 10),
                total_consumers: parseInt(consumers.rows[0].count, 10),
                total_products: parseInt(products.rows[0].count, 10),
                total_orders: parseInt(orders.rows[0].count, 10)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
