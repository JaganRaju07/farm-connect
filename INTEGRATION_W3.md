# Week 3 Integration Checklist — Team P116

## New Services Available (Jagan Completed):

### 1. Cloudinary Upload
- Import: `const { uploadImage, deleteImage } = require('../services/cloudinary.service');`
- `uploadImage(req.file.buffer, 'products')` → returns Cloudinary URL
- `uploadImage(req.file.buffer, 'profiles')` → for profile photos

### 2. Notification Service
- Import: `const { createNotification, notifyOrderStatusChange } = require('../services/notification.service');`
- Call `notifyOrderStatusChange(order, newStatus)` inside updateOrderStatus
- Call `createNotification()` for any custom notification

### 3. Admin Service
- Import: `const adminService = require('../services/admin.service');`
- `adminService.getPlatformAnalytics()` → returns dashboard stats
- `adminService.getPendingFarmers(page, limit)` → farmers waiting for approval
- `adminService.verifyFarmer(id, 'approved' | 'rejected', note)` → verify/reject

## Database Changes (Run Migration 003):
- **farmers** now has: `profile_photo_url`, `bio`, `years_of_farming`, `profile_completed`
- **consumers** now has: `profile_photo_url`, `profile_completed`
- New **notifications** table (`id`, `user_id`, `user_type`, `title`, `message`, `type`, `is_read`)

## What Deekshitha Needs to Build (Week 3 Backend):
1. **POST /api/v1/farmer/profile** — Complete farmer profile (lat, lon, address, bio, photo)
2. **POST /api/v1/consumer/profile** — Complete consumer profile
3. **POST /api/v1/upload/image** — Accept multipart/form-data, upload to Cloudinary
4. **Farmer Product CRUD**:
   - `POST /api/v1/farmer/products` — Add product (with optional image)
   - `PUT /api/v1/farmer/products/:id` — Edit product
   - `DELETE /api/v1/farmer/products/:id` — Deactivate product
   - `PATCH /api/v1/farmer/products/:id/stock` — Update stock quantity
5. **GET /api/v1/notifications** — User notifications
6. **PATCH /api/v1/notifications/read** — Mark as read
7. **Admin auth**: `POST /api/v1/admin/login` — Email+password for admin
8. **GET /api/v1/admin/analytics** — Platform metrics
9. **GET /api/v1/admin/farmers?status=pending** — Farmers list
10. **PATCH /api/v1/admin/farmers/:id/verify** — Approve/reject farmer

## What Ishani Needs to Build (Week 3 Frontend):
1. Profile completion page (shown after first OTP login)
2. Farmer Dashboard: products list + add/edit/delete
3. Product image upload UI (drag-and-drop or file picker)
4. Farmer order management UI (view orders, update status)
5. Notification bell with dropdown
6. Admin panel pages (login, farmer verification, analytics dashboard)

## Auth Middleware Change (Important):
Add a check in `authenticateToken` middleware — after verifying JWT, also check if `profile_completed === false`. If so, return `403` with:
```json
{ "error": { "code": "PROFILE_INCOMPLETE", "redirect": "/complete-profile" } }
```
This forces users to complete their profile before using the app. (Except for the profile-completion endpoint itself)

---

## STUDY NOTES — Key Week 3 Concepts

### Why Profile Completion is a Separate Step
OTP registration is intentionally minimal: phone number in → account created.
If we asked for name + address + photo during registration, farmers with slow phones would drop off halfway through a long form.

The pattern (used by Zomato, Urban Company, etc.):
1. Fast registration: Just phone + OTP
2. Separate profile completion: Name, address, photo
3. `profile_completed` flag: Controls app access

This UX pattern is called **progressive onboarding**.

### Cloudinary vs S3 vs Local Storage

| Option | Cost | Complexity | CDN | Auto-resize |
|--------|------|------------|-----|-------------|
| Cloudinary | Free tier: 25GB | Low | Yes | Yes |
| AWS S3 | Per GB | Medium | Needs CloudFront | No |
| Local disk | Free | Low | No | No |

For a student project demo, Cloudinary free tier is sufficient. The 25GB free storage handles thousands of product photos.

### Notification Pattern (Pull vs Push)
We are implementing **PULL** notifications: frontend asks "do I have notifications?"
- Simpler to implement
- Works without WebSockets

**PUSH** notifications (real-time): server pushes to frontend instantly
- Uses WebSockets or Server-Sent Events
- More complex, overkill for MVP

For mentor demo, pull is sufficient.

---

## TESTING CHECKLIST — Week 3 (Jagan)

### Database Tests:
- [ ] Run migration `003` without errors
- [ ] `SELECT * FROM notifications LIMIT 1` returns rows after order test
- [ ] `farmers` table shows `profile_completed` column
- [ ] Cloudinary test upload: `node -e "require('./cloudinary.service').uploadImage(require('fs').readFileSync('./test.jpg'), 'test').then(console.log)"`

### Service Tests:
- [ ] `createNotification()` inserts row in notifications table
- [ ] `notifyOrderStatusChange()` creates notifications for both consumer and farmer
- [ ] `getPlatformAnalytics()` returns object with all 5 keys (farmers, consumers, products, orders, revenue)
- [ ] `verifyFarmer(id, 'approved')` sets `is_verified = TRUE` and creates notification
- [ ] `uploadImage()` returns a valid Cloudinary HTTPS URL

### Integration Tests (with Deekshitha):
- [ ] `POST /api/v1/upload/image` returns Cloudinary URL
- [ ] `POST /api/v1/farmer/profile` with image updates farmers table
- [ ] `GET /api/v1/admin/analytics` returns correct counts
- [ ] `PATCH /api/v1/admin/farmers/:id/verify` changes verification_status
