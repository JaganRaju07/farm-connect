// backend/src/services/search.service.js
const db = require('../config/database');

/**
 * STUDY NOTE — PostgreSQL Full-Text Search vs ILIKE:
 *
 * ILIKE approach:
 *   WHERE name ILIKE '%tomato%'
 *   Problem: Scans every row. Does not match 'tomatoes'. Slow on large tables.
 *   Advantage: Simple. Works on Week 4 scale (hundreds of products).
 *
 * Full-text search approach:
 *   WHERE to_tsvector('english', name) @@ plainto_tsquery('english', 'tomato')
 *   Advantage: Matches 'tomatoes', 'tomato', ranked by relevance. Uses GIN index.
 *   Advantage: Ignores stop words ('a', 'the', 'is') automatically.
 *   Works at scale of millions of rows.
 *
 * We use ILIKE for Week 4 (simpler, adequate for your data size)
 * but structure the query to be easily upgraded to FTS later.
 */
async function searchProducts({ keyword, lat, lon, radius = 10, category, isOrganic, minPrice, maxPrice, sort = 'distance', page = 1, limit = 20 }) {
  const params = [];
  let paramIdx = 1;
  const conditions = [
    'p.is_active = TRUE',
    'f.is_active = TRUE',
    'f.is_verified = TRUE'
  ];

  // GPS filtering — only when coordinates provided
  let distanceSelect = '0::NUMERIC AS distance_km';

  if (lat && lon) {
    params.push(parseFloat(lat), parseFloat(lon), parseFloat(radius));
    conditions.push(
      `calculate_distance_km($${paramIdx}, $${paramIdx + 1}, f.latitude, f.longitude) <= $${paramIdx + 2}`
    );
    distanceSelect = `calculate_distance_km($${paramIdx}, $${paramIdx + 1}, f.latitude, f.longitude) AS distance_km`;
    paramIdx += 3;
  }

  // Keyword search across name, description, category
  if (keyword && keyword.trim()) {
    const kw = `%${keyword.trim()}%`;
    conditions.push(
      `(p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx} OR p.category ILIKE $${paramIdx})`
    );
    params.push(kw);
    paramIdx++;
  }

  if (category) {
    conditions.push(`p.category = $${paramIdx}`);
    params.push(category.toLowerCase());
    paramIdx++;
  }

  if (isOrganic !== undefined) {
    conditions.push(`p.is_organic = $${paramIdx}`);
    params.push(isOrganic === true || isOrganic === 'true');
    paramIdx++;
  }

  if (minPrice) {
    conditions.push(`p.price >= $${paramIdx}`);
    params.push(parseFloat(minPrice));
    paramIdx++;
  }

  if (maxPrice) {
    conditions.push(`p.price <= $${paramIdx}`);
    params.push(parseFloat(maxPrice));
    paramIdx++;
  }

  // Sort logic
  const sortMap = {
    distance: (lat && lon) ? 'distance_km ASC' : 'p.created_at DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    newest: 'p.created_at DESC',
    popular: 'p.order_count DESC'
  };
  const orderBy = sortMap[sort] || 'p.created_at DESC';

  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(parseInt(limit), offset);

  const query = `
    SELECT
      p.id, p.name, p.category, p.description, p.price, p.unit,
      p.stock_available, p.is_organic, p.primary_image_url,
      p.image_urls, p.tags, p.view_count, p.order_count,
      ${distanceSelect},
      f.id AS farmer_id,
      f.name AS farmer_name,
      f.city AS farmer_city,
      f.profile_photo_url AS farmer_photo,
      f.is_verified AS farmer_verified
    FROM products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;

  const result = await db.query(query, params);
  return result.rows;
}

async function getProductCategories({ lat, lon, radius = 10 } = {}) {
  let gpsCondition = '';
  const params = [];

  if (lat && lon) {
    params.push(parseFloat(lat), parseFloat(lon), parseFloat(radius));
    gpsCondition = `AND calculate_distance_km($1, $2, f.latitude, f.longitude) <= $3`;
  }

  const result = await db.query(`
    SELECT
      p.category,
      COUNT(DISTINCT p.id)::INTEGER AS product_count,
      ROUND(MIN(p.price)::NUMERIC, 2) AS min_price,
      ROUND(MAX(p.price)::NUMERIC, 2) AS max_price,
      COUNT(DISTINCT p.farmer_id)::INTEGER AS farmer_count
    FROM products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE p.is_active = TRUE
      AND f.is_verified = TRUE
      AND f.is_active = TRUE
      ${gpsCondition}
    GROUP BY p.category
    ORDER BY product_count DESC
  `, params);

  return result.rows;
}

async function incrementProductViewCount(productId) {
  await db.query(
    `UPDATE products SET view_count = view_count + 1 WHERE id = $1`,
    [productId]
  );
}

module.exports = {
  searchProducts,
  getProductCategories,
  incrementProductViewCount
};
