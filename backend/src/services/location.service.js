/**
 * ============================================================
 * FARM CONNECT – LOCATION SERVICE
 * File: backend/src/services/location.service.js
 * Author: Jagan Raju B (Week 2 implementation)
 * ============================================================
 *
 * PURPOSE:
 * This module is the single source of truth for all GPS-related
 * logic in the backend. It provides:
 *   1. A JavaScript Haversine implementation (calculateDistance)
 *      – used when we need distance WITHOUT a database query
 *   2. findFarmersInRadius – returns approved farmers near a point
 *   3. getProductsInRadius – the main function Deekshitha calls from
 *      the products API endpoint
 *
 * WHY BOTH SQL AND JS IMPLEMENTATIONS?
 * The SQL function (calculate_distance_km in schema.sql) runs INSIDE
 * PostgreSQL queries. It is fast because the filtering happens in the
 * database, and only matching rows travel over the network.
 * The JS version (calculateDistance below) is used when we already
 * have coordinates in memory and just need a number – e.g., when
 * calculating delivery_fee for a new order without an extra DB call.
 *
 * TEAM INTEGRATION NOTE FOR DEEKSHITHA:
 *   const { getProductsInRadius } = require('../services/location.service');
 *   // call it from your GET /products endpoint
 * ============================================================
 */

'use strict';

const db = require('../config/database');

// ============================================================
// HELPER: DEGREES → RADIANS
// ============================================================
// JavaScript's Math.sin / Math.cos expect angles in RADIANS,
// not degrees. This tiny conversion is applied to every coordinate
// before the Haversine formula runs.
// Formula: radians = degrees × (π / 180)
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// ============================================================
// CORE: HAVERSINE DISTANCE CALCULATION (JavaScript)
// ============================================================
/**
 * Calculates the straight-line distance (along Earth's surface)
 * between two GPS points using the Haversine formula.
 *
 * MENTAL MODEL:
 * Imagine you peel an orange flat like a map. On a flat map you
 * could use Pythagoras (a² + b² = c²) to find a distance. But the
 * orange is curved. Haversine is the "Pythagoras for a curved
 * surface" – it adds trigonometry to correct for that curvature.
 *
 * @param {number} lat1 - Origin latitude  (e.g. 12.9716 for Jayanagar)
 * @param {number} lon1 - Origin longitude (e.g. 77.5946 for Jayanagar)
 * @param {number} lat2 - Target latitude
 * @param {number} lon2 - Target longitude
 * @returns {number}    Distance in kilometres, rounded to 2 decimal places
 *
 * USAGE EXAMPLE:
 *   const dist = calculateDistance(12.9716, 77.5946, 12.7900, 77.4700);
 *   console.log(dist); // → 24.78  (Jayanagar to Kanakapura Road)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS_KM = 6371; // mean radius of Earth

  const dLat = toRadians(lat2 - lat1); // difference in latitude (radians)
  const dLon = toRadians(lon2 - lon1); // difference in longitude (radians)

  // "a" is the square of half the chord length between the two points.
  // Think of it as a measure of how "far apart" the two angles are on
  // the sphere, corrected for the fact that longitude lines converge at
  // the poles (that's what the cos(lat) terms do).
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // "c" is the angular distance in radians between the two points.
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = EARTH_RADIUS_KM * c;

  // Round to 2 decimal places (metre-level precision is enough for us)
  return Math.round(distanceKm * 100) / 100;
}

// ============================================================
// FUNCTION: FIND FARMERS WITHIN RADIUS
// ============================================================
/**
 * Returns all active, verified farmers whose GPS coordinates fall
 * within `radiusKm` kilometres of the consumer's location.
 *
 * Results are sorted closest-first so the consumer sees the most
 * convenient farmers at the top.
 *
 * HOW THE QUERY WORKS:
 * We delegate the distance math to PostgreSQL's calculate_distance_km()
 * function (defined in schema.sql). This is efficient because:
 *   - The calculation happens inside the DB engine (C-level speed)
 *   - Only rows that PASS the WHERE filter travel over the network
 *   - The index on (latitude, longitude) helps PostgreSQL narrow down
 *     candidates before running the full Haversine on every row
 *
 * @param {number} consumerLat - Consumer's latitude
 * @param {number} consumerLon - Consumer's longitude
 * @param {number} [radiusKm=10] - Search radius (default 10 km)
 * @returns {Promise<Array>} Array of farmer rows with distance_km field added
 */
async function findFarmersInRadius(consumerLat, consumerLon, radiusKm = 10) {
  const query = `
    SELECT
      id,
      name,
      phone,
      latitude,
      longitude,
      address,
      city,
      is_verified,
      farming_type,
      -- calculate_distance_km is our custom SQL function from schema.sql
      calculate_distance_km($1, $2, latitude, longitude) AS distance_km
    FROM farmers
    WHERE
      is_active = TRUE
      AND is_verified = TRUE
      AND verification_status = 'approved'
      AND calculate_distance_km($1, $2, latitude, longitude) <= $3
    ORDER BY distance_km ASC
  `;

  const result = await db.query(query, [consumerLat, consumerLon, radiusKm]);
  return result.rows;
}

// ============================================================
// FUNCTION: GET PRODUCTS WITHIN RADIUS (Main exported function)
// ============================================================
/**
 * This is the PRIMARY function used by the products API endpoint.
 * It returns all active products from verified farmers within
 * the consumer's search radius, with optional category/price/organic filters.
 *
 * WHY THIS REPLACES CITY FILTERING:
 * In Week 1 you queried WHERE farmers.city = 'Bengaluru'. The problem is
 * Bengaluru spans 741 sq km – a consumer in Jayanagar and a farmer in
 * Whitefield are both "in Bengaluru" but 40 km apart, making fresh-produce
 * delivery impractical. GPS radius filtering draws an accurate circle so
 * only genuinely nearby farmers appear.
 *
 * QUERY EXPLANATION (step by step):
 *   SELECT  → all product columns + farmer name/location + computed distance
 *   FROM products JOIN farmers → link product to its owning farmer
 *   WHERE p.is_active = TRUE  → skip unlisted products
 *         f.is_verified = TRUE → skip unapproved farmers
 *         calculate_distance_km(...) <= $3 → the GPS radius filter
 *   ORDER BY distance_km ASC → closest products first
 *
 * Optional filters (category, minPrice, maxPrice, isOrganic) are appended
 * to the WHERE clause dynamically.
 *
 * @param {number} consumerLat      - Consumer's latitude
 * @param {number} consumerLon      - Consumer's longitude
 * @param {number} [radiusKm=10]    - Radius to search within (km)
 * @param {Object} [filters={}]     - Optional additional filters
 * @param {string} [filters.category]   - Product category (e.g. 'vegetables')
 * @param {number} [filters.minPrice]   - Minimum price filter
 * @param {number} [filters.maxPrice]   - Maximum price filter
 * @param {boolean}[filters.isOrganic]  - true = organic only
 * @returns {Promise<Array>} Products sorted by distance from consumer
 *
 * USAGE (Deekshitha – in your products route handler):
 *   const { getProductsInRadius } = require('../services/location.service');
 *   const products = await getProductsInRadius(
 *     req.query.lat, req.query.lon, 10,
 *     { category: req.query.category }
 *   );
 */
async function getProductsInRadius(consumerLat, consumerLon, radiusKm = 10, filters = {}) {
  const hasLocation = typeof consumerLat === 'number' && !isNaN(consumerLat) && typeof consumerLon === 'number' && !isNaN(consumerLon);

  // Base query – always applied
  let query = `
    SELECT
      p.id,
      p.farmer_id,
      p.name,
      p.category,
      p.description,
      p.price,
      p.unit,
      p.stock_available,
      p.minimum_order_quantity,
      p.primary_image_url AS image_url,
      p.is_organic,
      p.harvest_date,
      p.created_at,

      -- Farmer details (Ishani needs these for the product card UI)
      f.name         AS farmer_name,
      f.latitude     AS farmer_latitude,
      f.longitude    AS farmer_longitude,
      f.address      AS farmer_address,
      f.city         AS farmer_city,
      f.is_verified  AS farmer_verified,

      -- Distance from the consumer to this product's farm
      -- This is the KEY field replacing city-based filtering
      ${hasLocation ? 'calculate_distance_km($1, $2, f.latitude, f.longitude)' : 'NULL'} AS distance_km

    FROM products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE
      p.is_active          = TRUE
      AND f.is_active      = TRUE
      AND f.is_verified    = TRUE
      AND f.verification_status = 'approved'
      AND p.stock_available > 0
      ${hasLocation ? 'AND calculate_distance_km($1, $2, f.latitude, f.longitude) <= $3' : ''}
  `;

  // Start with the parameters depending on location availability
  const params = hasLocation ? [consumerLat, consumerLon, radiusKm] : [];
  let paramIndex = hasLocation ? 4 : 1;

  // ---- Optional filters (appended dynamically) ----
  // WHY dynamic: Not every request uses all filters. Building the WHERE
  // clause string avoids empty IN clauses and keeps queries lean.

  if (filters.category) {
    query += ` AND p.category = $${paramIndex}`;
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    query += ` AND p.price >= $${paramIndex}`;
    params.push(Number(filters.minPrice));
    paramIndex++;
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    query += ` AND p.price <= $${paramIndex}`;
    params.push(Number(filters.maxPrice));
    paramIndex++;
  }

  if (filters.isOrganic !== undefined) {
    query += ` AND p.is_organic = $${paramIndex}`;
    params.push(filters.isOrganic === true || filters.isOrganic === 'true');
    paramIndex++;
  }

  // Sort: closest farm first if location exists, then newest products within same farm
  if (hasLocation) {
    query += ` ORDER BY distance_km ASC, p.created_at DESC`;
  } else {
    query += ` ORDER BY p.created_at DESC`;
  }

  const result = await db.query(query, params);
  return result.rows;
}

// ============================================================
// FUNCTION: VALIDATE GPS COORDINATES
// ============================================================
/**
 * Sanity-checks that incoming coordinates are valid numbers within
 * geographic bounds before we fire a database query.
 *
 * WHY: If the frontend sends bad data (NaN, null, out-of-range),
 * the PostgreSQL query would either crash or silently return wrong
 * results. Catching it here lets us return a clear HTTP 400 error.
 *
 * Valid ranges:
 *   latitude  → -90  to  +90   (south pole to north pole)
 *   longitude → -180 to +180   (antimeridian to antimeridian)
 *
 * For Karnataka specifically:
 *   latitude  → roughly 11.5 to 18.5
 *   longitude → roughly 74.0 to 78.6
 *
 * @param {number} lat - Latitude to validate
 * @param {number} lon - Longitude to validate
 * @returns {{ valid: boolean, error?: string }}
 */
function validateCoordinates(lat, lon) {
  const latitude  = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return { valid: false, error: 'Latitude and longitude must be valid numbers.' };
  }

  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: `Latitude ${latitude} is out of range (-90 to 90).` };
  }

  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: `Longitude ${longitude} is out of range (-180 to 180).` };
  }

  return { valid: true };
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  calculateDistance,   // used by order.service.js for delivery fee calculation
  findFarmersInRadius, // used if you ever need a "farmers near me" endpoint
  getProductsInRadius, // used by Deekshitha's products API route
  validateCoordinates, // used in request validation middleware
  toRadians,           // exported for unit testing
};
