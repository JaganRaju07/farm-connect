/**
* Input Sanitization Middleware
* 
* STUDY NOTE — Defense Against XSS:
* XSS (Cross-Site Scripting) is when an attacker injects JavaScript into
* data that gets stored in the database and later rendered in a browser.
*/

function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value
    .trim() // Remove leading/trailing whitespace
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, ''); // Remove inline event handlers (onclick= etc.)
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

/**
* Express middleware that sanitizes request body and query parameters
* Applied globally — protects all endpoints automatically
*/
const sanitizeInputs = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  next();
};

module.exports = sanitizeInputs;
