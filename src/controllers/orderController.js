const pool = require('../config/db');

exports.placeOrder = async (req, res, next) => {
    const client = await pool.connect(); // Used for Transactions
    try {
        const { product_id, quantity, consumer_id } = req.body;

        await client.query('BEGIN'); // Start Transaction

        // 1. Check stock and lock the row (Task 3 requirement)
        const productCheck = await client.query(
            'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
            [product_id]
        );

        if (productCheck.rows.length === 0) {
            throw new Error('Product not found');
        }

        if (productCheck.rows[0].stock < quantity) {
            throw new Error('Not enough stock available');
        }

        // 2. Subtract stock
        await client.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2',
            [quantity, product_id]
        );

        // 3. Create the order
        const orderResult = await client.query(
            'INSERT INTO orders (product_id, quantity, consumer_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_id, quantity, consumer_id, 'pending']
        );

        await client.query('COMMIT'); // Save changes

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            data: orderResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Undo changes if something fails
        res.status(400).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};