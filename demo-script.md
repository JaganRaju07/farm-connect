# Farm Connect - Final Presentation Demo Script

## 1. Introduction (2 mins)
- **Presenter**: Welcome to Farm Connect. We are Team P116 for the IEEE CS Bangalore Chapter Internship 2026.
- **Vision**: Our goal is to connect consumers directly with local farmers. We eliminate middlemen, ensuring farmers get a fair price for their produce, and consumers get fresh, organic food directly from the source.
- **Problem Solved**: High commission fees from middlemen, delay in fresh produce delivery, lack of direct feedback loop between the grower and the buyer.

## 2. Farmer Registration & Dashboard (3 mins)
- **Action**: Open the landing page and click "Sell Your Harvest".
- **Demo**: Show the 6-input OTP component for Farmer Registration.
- **Flow**: Enter a mobile number -> Receive OTP -> Validate OTP -> Complete Profile.
- **Action**: Once logged in, go to the Farmer Dashboard.
- **Highlight**: Show the Analytics section (Earnings, Active Orders), the Inventory view, and the Low Stock Alerts. 
- **Action**: Add a new product (e.g., "Fresh Tomatoes"). Show how the image upload to Cloudinary works, and how the farmer can set price, stock, and organic status.

## 3. Consumer Discovery & Shopping (3 mins)
- **Action**: Open a new incognito window and go to the Consumer portal.
- **Demo**: Click "Get Started", register as a consumer using OTP. Complete profile with address and GPS coordinates.
- **Action**: Go to the Marketplace.
- **Highlight**: Show how the backend uses PostgreSQL Haversine distance calculations to show products from farmers *closest* to the consumer's location.
- **Action**: Filter by "Organic" or search for the "Fresh Tomatoes" we just added. 
- **Action**: Add to cart and place the order. Explain that the app uses direct payment methods (UPI/Cash on Delivery) to avoid platform gateway fees.

## 4. Order Fulfillment & Real-time Updates (3 mins)
- **Action**: Switch back to the Farmer dashboard. 
- **Highlight**: Show the new incoming order in the Farmer's "Recent Orders" list. 
- **Action**: The farmer clicks "Accept Order". Show the status change.
- **Action**: Switch to the Consumer window. Check the Notification Bell. Show the real-time polling fetching the "Order Accepted" notification.
- **Action**: The farmer updates the status to "Out for Delivery", then "Delivered".

## 5. Review & Rating (2 mins)
- **Action**: As the Consumer, go to the Order History. Now that the order is delivered, the "Write a Review" button is unlocked.
- **Demo**: Write a review and give a 5-star rating. Explain how our backend enforces bounds checking on ratings and verifies that only buyers of the product can leave reviews.
- **Action**: Go back to the Farmer Dashboard and show how the rating has improved their overall profile standing.

## 6. Architecture & Security (2 mins)
- **Highlights**:
  - Hosted on **Railway (Backend)** and **Vercel (Frontend)**.
  - Data stored in **Supabase (PostgreSQL)** with connection pooling.
  - Images securely uploaded directly via **Cloudinary**.
  - **Security**: Discuss our implementation of strict Role-Based Access Control (RBAC). For example, a consumer token cannot access farmer endpoints. And authorization bypass checks prevent a farmer from modifying another farmer's products.

## 7. Q&A (3 mins)
- Open the floor for questions from the panel.
