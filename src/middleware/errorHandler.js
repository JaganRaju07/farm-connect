const errorHandler = (err, req, res, next) => {
    console.error('X Error:', err); // [cite: 298]
    
    const statusCode = err.statusCode || 500; // [cite: 300]
    const message = err.message || 'Internal server error'; // [cite: 301]

    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'SERVER_ERROR', // [cite: 306]
            message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message // [cite: 307-309]
        }
    }); // [cite: 317]
};

module.exports = errorHandler; // [cite: 318]