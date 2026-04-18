# Farm Connect API Specification - Week 1

## Base URL: `http://localhost:5000/api/v1`

### 1. Authentication
- **POST** `/auth/send-otp`: Sends OTP to user's phone.
- **POST** `/auth/verify-otp`: Verifies OTP and returns JWT.
- **GET** `/auth/me`: Gets current user profile.

### 2. Farmer
- **GET** `/farmer/dashboard`: Summary of products and sales.
- **POST** `/farmer/products`: Add a new crop for sale.
- **DELETE** `/farmer/products/:id`: Remove a product.

### 3. Consumer
- **GET** `/consumer/products`: Browse available crops.
- **POST** `/consumer/orders`: Place a new order.

### 4. Admin
- **GET** `/admin/stats`: Platform-wide analytics.
- **PATCH** `/admin/farmers/:id/verify`: Approve a farmer's account.