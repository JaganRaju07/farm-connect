const db = require('../config/db');

// PATCH /api/v1/admin/verify-farmer/:id
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