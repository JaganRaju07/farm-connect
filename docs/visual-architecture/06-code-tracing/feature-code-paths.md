# 🌾 Farm Connect — Full-Stack Feature Code Tracing Guide

> **Target Audience**: Developers onboarding to Farm Connect  
> **Purpose**: Step-by-step code file and line-number traces through the stack for primary user workflows  
> **Repository Root**: `D:\farm-connect`  

---

## Trace 1: Passwordless SMS OTP Authentication & Progressive Profile Onboarding

This trace follows a user registering or logging in using their mobile phone number.

```text
[User Form] ────► [AuthContext.tsx] ────► [authroutes.js] ────► [authController.js] ────► [otp_store / DB] ────► [Fast2SMS]
                                                                        │
                                                                        ▼ (Verify)
[localStorage] ◄─── [AuthContext.tsx] ◄─── [authController.js] ◄─── [JWT Sign]
```

### 1. Frontend Dispatch: Send OTP
- **File**: [`frontend/src/app/login/page.tsx`](file:///D:/farm-connect/frontend/src/app/login/page.tsx) or [`register/page.tsx`](file:///D:/farm-connect/frontend/src/app/register/page.tsx)
  - User enters phone number and selects role (`farmer` or `consumer`).
  - Calls `axios.post(`${API}/auth/send-otp`, { phone, userType, action })`.

### 2. Backend Route Handling: Send OTP
- **File**: [`src/routes/authroutes.js#L9`](file:///D:/farm-connect/src/routes/authroutes.js#L9)
  - `router.post('/send-otp', sendOTP);` dispatches to controller.
- **File**: [`src/controllers/authController.js#L5-76`](file:///D:/farm-connect/src/controllers/authController.js#L5-L76)
  - **Lines 11-16**: Queries `farmers` or `consumers` table to check if phone is registered.
  - **Lines 18-30**: Validates registration/login preconditions.
  - **Lines 32-48**: Checks `otp_store` for unexpired tokens (>4 min remaining). Reuses existing token if present to prevent double-click spam; otherwise calls `generateOTP()`.
  - **Lines 51-61**: Executes atomic upsert into `otp_store`:
    ```sql
    INSERT INTO otp_store (phone, otp_code, expires_at, user_type, action)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (phone) DO UPDATE SET otp_code=$2, expires_at=$3, user_type=$4, action=$5;
    ```
  - **Lines 63-67**: Calls `sendOTP(phone, otp)` in [`src/services/smsservice.js#L7-45`](file:///D:/farm-connect/src/services/smsservice.js#L7-L45). If `OTP_DEMO_MODE=true`, logs to stdout; otherwise invokes Fast2SMS Bulk V2 API.
  - **Line 69**: Returns HTTP 200 `{ success: true, message: "OTP sent successfully" }`.

### 3. Frontend Verification & JWT Reception
- **File**: User enters 6-digit OTP received via SMS.
  - Form dispatches `axios.post(`${API}/auth/verify-otp`, { phone, otp, userType, name, ... })`.
- **File**: [`src/controllers/authController.js#L78-170`](file:///D:/farm-connect/src/controllers/authController.js#L78-L170)
  - **Lines 83-90**: Queries `otp_store` for phone and userType.
  - **Lines 94-106**: Compares trimmed OTP strings and checks expiry timestamp.
  - **Lines 112-132**: For registration (`action === 'register'`), inserts user into `farmers` or `consumers` with progressive default fallbacks (`lat: 0, lon: 0, address: 'Pending Profile Completion'`).
  - **Line 143**: Purges OTP: `DELETE FROM otp_store WHERE phone=$1;`.
  - **Lines 146-156**: Signs JWT token:
    ```javascript
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );
    ```
  - **Line 158**: Returns `{ success: true, data: { token, user, requiresProfileCompletion } }`.
- **File**: [`frontend/src/context/AuthContext.tsx#L62-72`](file:///D:/farm-connect/frontend/src/context/AuthContext.tsx#L62-L72)
  - `login(newToken, newUser, newRole)` stores credentials in `localStorage` (`auth_token`, `auth_user`, `auth_role`).
  - Automatically updates `axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`.

---

## Trace 2: Hyperlocal Proximity Search & Map Explorer

This trace follows how a consumer's coordinates are passed to PostgreSQL to query nearby crops.

```text
[useGeolocation.ts] ────► [LocationContext.tsx] ────► [marketplace/page.tsx]
                                                              │
                                                              ▼ (Axios)
[MapExplorer (Leaflet)] ◄─── [ProductCard.tsx] ◄─── [productController.js] ◄─── [PostgreSQL calculate_distance_km]
```

### 1. Browser Geolocation Resolution
- **File**: [`frontend/src/hooks/useGeolocation.ts#L42-199`](file:///D:/farm-connect/frontend/src/hooks/useGeolocation.ts#L42-L199)
  - Requests hardware coordinates via `navigator.geolocation.getCurrentPosition()`.
  - Passes options: `enableHighAccuracy: true`, `timeout: 10000ms`, `maximumAge: 300000ms`.
  - Receives coordinates: `{ latitude: 12.9716, longitude: 77.5946, accuracy: 10 }`.
- **File**: [`frontend/src/context/LocationContext.tsx#L35-59`](file:///D:/farm-connect/frontend/src/context/LocationContext.tsx#L35-L59)
  - Stores location globally and provides `useLocation()` hook across the component tree.

### 2. Marketplace Data Query
- **File**: [`frontend/src/app/marketplace/page.tsx#L69-106`](file:///D:/farm-connect/frontend/src/app/marketplace/page.tsx#L69-L106)
  - Sets up `AbortController` signal to allow clean cancellation on rapid search inputs.
  - Calls `axios.get(`${API}/products`, { params: { lat, lon, radius: appliedFilters.radius, category, ... } })`.

### 3. Backend Spatial Query
- **File**: [`src/routes/productroutes.js#L6`](file:///D:/farm-connect/src/routes/productroutes.js#L6)
  - Routes request to `productController.searchNearbyProducts`.
- **File**: [`src/controllers/productController.js#L4-39`](file:///D:/farm-connect/src/controllers/productController.js#L4-L39)
  - Extracts `lat`, `lon`, and `radius` (defaults to 30km).
  - Executes spatial SQL query against PostgreSQL:
    ```sql
    SELECT 
        p.id AS product_id, p.name, p.category, p.description, p.price, p.unit, 
        p.stock_available, p.is_organic, p.harvest_date,
        f.id AS farmer_id, f.name AS farmer_name, f.city AS farmer_city,
        calculate_distance_km($1, $2, f.latitude, f.longitude) AS distance_km
    FROM products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE p.is_active = TRUE 
      AND f.is_verified = TRUE
      AND calculate_distance_km($1, $2, f.latitude, f.longitude) <= $3
    ORDER BY distance_km ASC;
    ```
  - Returns `{ success: true, count: rows.length, data: rows }`.

### 4. Client View Rendering (Grid vs Map)
- **File**: [`frontend/src/app/marketplace/page.tsx#L302-337`](file:///D:/farm-connect/frontend/src/app/marketplace/page.tsx#L302-L337)
  - **Grid View**: Iterates over products, rendering [`ProductCard.tsx`](file:///D:/farm-connect/frontend/src/components/product/productcard.tsx) with distance indicators (e.g. `"4.2 km"`).
  - **Map View**: Renders [`MapExplorer.tsx`](file:///D:/farm-connect/frontend/src/components/common/MapExplorer.tsx) (Leaflet), plotting the consumer's blue pin alongside green farm markers.

---

## Trace 3: Shopping Cart Mutation & Stock Bound Clamping

This trace follows adding items to the cart and enforcing inventory safety.

- **File**: [`frontend/src/components/product/productcard.tsx`](file:///D:/farm-connect/frontend/src/components/product/productcard.tsx)
  - User selects quantity and clicks "Add to Cart".
  - Invokes `addToCart(product, quantity)` from `useCart()`.
- **File**: [`frontend/src/context/cartcontext.tsx#L60-77`](file:///D:/farm-connect/frontend/src/context/cartcontext.tsx#L60-L77)
  - Clamps quantity to stock available:
    ```typescript
    const newQ = updated[idx].quantity + quantity;
    const finalQ = Math.min(newQ, product.stockAvailable);
    updated[idx] = { ...updated[idx], quantity: finalQ };
    ```
  - Triggers `useEffect([items, mounted])` at **lines 53-58** to persist state to `localStorage.setItem('farmconnect_cart', JSON.stringify(items))`.
  - Computes real-time totals via `getSubtotal()` and item counts via `getItemCount()`.

---

## Trace 4: Geotagged Order Checkout & Order Creation

This trace follows submitting an order from checkout to database insertion.

- **File**: [`frontend/src/app/checkout/page.tsx`](file:///D:/farm-connect/frontend/src/app/checkout/page.tsx)
  - Confirms customer delivery address and GPS coordinates.
  - Submits payload via `POST /api/v1/consumers/orders`:
    ```json
    {
      "consumer_id": 12,
      "farmer_id": 4,
      "items": [{ "productId": 101, "quantity": 2, "price": 40 }],
      "subtotal": 80,
      "delivery_fee": 20,
      "total_amount": 100,
      "consumer_notes": "Leave at front gate"
    }
    ```
- **File**: [`src/controllers/consumerController.js#L22-65`](file:///D:/farm-connect/src/controllers/consumerController.js#L22-L65)
  - **Lines 26-36**: Verifies consumer and farmer records exist in PostgreSQL.
  - **Lines 38-40**: Recalculates exact delivery transit distance:
    ```sql
    SELECT calculate_distance_km($1, $2, $3, $4) AS dist;
    ```
  - **Line 43**: Generates unique order number: `const orderNumber = `FC${Date.now()}`;`.
  - **Lines 46-59**: Commits order record with JSONB snapshot:
    ```sql
    INSERT INTO orders (
      order_number, consumer_id, farmer_id, items, subtotal, delivery_fee, total_amount,
      delivery_latitude, delivery_longitude, delivery_address, delivery_city, delivery_pincode,
      delivery_distance_km, consumer_notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id, order_number, order_status, total_amount;
    ```
- **Modular Alternative**: [`backend/src/services/order.service.js#L115-258`](file:///D:/farm-connect/backend/src/services/order.service.js#L115-L258)
  - **Line 140**: Wraps order flow in `db.executeTransaction(async (client) => ...)`.
  - **Lines 146-174**: Locks inventory with `SELECT ... FROM products WHERE id = $1 FOR UPDATE` to eliminate overselling race conditions.
  - **Lines 201-208**: Decrements stock atomically: `UPDATE products SET stock_available = stock_available - $1 WHERE id = $2`.
  - **Lines 225-247**: Inserts order with serialized JSON items and commits on transaction resolution.
- **File**: [`frontend/src/context/cartcontext.tsx#L100-102`](file:///D:/farm-connect/frontend/src/context/cartcontext.tsx#L100-L102)
  - Client clears cart via `clearCart()`, removing stored items from `localStorage`.
  - Client navigates to `/orders` for order tracking.
