# Farm Connect - Week 3 Testing Checklist 🧪

This checklist outlines the verification steps required to validate the Week 3 frontend deliverables before demonstration.

---

## 1. Profile Completion Flow
- [ ] **Onboarding Redirect:** Verify that a newly authenticated user (with `profile_completed = false`) is automatically redirected from protected routes to `/complete-profile`.
- [ ] **GPS Location Detection:** Ensure coordinates are fetched from the browser Geolocation API and displayed cleanly inside the success banner.
- [ ] **Conditional Fields:** 
  - [ ] If logged in as `farmer`, check that farming experience, bio, and farming type options appear.
  - [ ] If logged in as `consumer`, check that these fields are hidden.
- [ ] **Image Upload Preview:** Verify that selecting a profile photo shows an instant local preview before submission.
- [ ] **Form Submission:** Verify that a successful submit saves profile info and redirects the user to `/farmer/dashboard` or `/marketplace`.

---

## 2. Notification System
- [ ] **Header Icon:** Verify that the `NotificationBell` icon renders cleanly on the main app header.
- [ ] **Numeric Badge:** Verify that the badge shows the exact number of unread notifications, updating dynamically.
- [ ] **Dropdown Display:** Verify that clicking the bell opens the list dropdown, showing structured alerts with matching icons.
- [ ] **Clear Badge:** Verify that opening the dropdown marks notifications as read on the backend, resetting the unread badge to 0.
- [ ] **Background Polling:** Ensure that `GET /api/v1/notifications` triggers every 30 seconds to fetch new updates.

---

## 3. Farmer Dashboard
- [ ] **Layout Responsiveness:** Verify that the sidebar is visible on desktop, hides on mobile, and opens smoothly via the hamburger menu.
- [ ] **Analytics Cards:** Ensure the cards render actual numbers representing active products, pending orders, and total earnings.
- [ ] **Recent Orders:** Verify that the 5 most recent orders render with their status badge colored according to the status machine.

---

## 4. Product Management Page
- [ ] **Inventory Table:** Check that all listings render in the table with price, stock, and thumbnail previews.
- [ ] **Eye/EyeOff Toggle:** Verify that clicking the visibility icon switches the product status (Active/Hidden) and updates the UI instantly.
- [ ] **Delete Confirmation:** Ensure clicking delete requests user confirmation before removing the item from the grid.
- [ ] **Product Modal Validation:** 
  - [ ] Opening the modal clears previous errors.
  - [ ] Editing a product pre-loads existing details.
  - [ ] Required fields block empty submissions.
  - [ ] Selecting an image uploads it to Cloudinary and returns a public URL.
  - [ ] Clicking save refreshes the main product table.

---

## 5. Admin Panel
- [ ] **Admin Route Guarding:** Verify that `/admin/dashboard` is protected, redirecting unauthorized traffic to `/admin/login`.
- [ ] **Admin Login:** Ensure correct credentials authorize the admin, store `admin_token`, and redirect to the dashboard.
- [ ] **Platform Analytics:** Ensure Gross GMV, Total Farmers, Total Consumers, and Total Orders load and align with backend DB counts.
- [ ] **Pending Farmer List:** Verify that the list only displays farmers with a `pending` status.
- [ ] **Verification Controls:**
  - [ ] Clicking "Approve" verifies the farmer and sends a notification.
  - [ ] Clicking "Reject" requires a rejection reason and notifies the farmer.
