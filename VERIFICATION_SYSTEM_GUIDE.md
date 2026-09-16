# Verification Request Management System - Implementation Guide

## Overview
This implementation adds a complete verification request management system where:
- Users submit NID + facial verification requests
- Admin can view pending requests and accept/reject them
- Real-time updates using Supabase Realtime
- Automatic profile updates when requests are approved

## Database Setup Required

You need to create a new table in Supabase:

```sql
CREATE TABLE verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  nid_number VARCHAR(17) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_verification_requests_phone ON verification_requests(phone);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_submitted_at ON verification_requests(submitted_at DESC);
```

## File Changes

### 1. **Verification Page** (`/app/verification/page.tsx`)
- Updated to capture phone number from localStorage
- Sends verification request to API with phone number
- Shows pending status message to user
- Added face detection simulation

### 2. **Verification API** (`/app/api/verify-nid/route.ts`)
- Changed to create a **pending** verification request instead of immediate profile update
- Stores NID number and phone in `verification_requests` table
- Returns request ID and pending status

### 3. **New Verification Request API** (`/app/api/verify-request/route.ts`)
**GET** - Fetches all verification requests
```
GET /api/verify-request
Returns: { success: true, data: [...] }
```

**PUT** - Admin approves/rejects verification requests
```
PUT /api/verify-request
Body: { requestId, action: "approve|reject", adminPhone }
- Validates admin phone (01709783145 or 01930314459)
- Updates request status
- If approved: updates user profile with verified NID and face
- Returns: { success: true, message, data }
```

### 4. **Admin Dashboard** (`/app/admin-dashboard/page.tsx`)
- Added "Users" and "Verification Requests" tabs
- **Users Tab**: Existing functionality for managing user accounts
- **Verification Requests Tab**:
  - Shows all verification requests with status (Pending/Approved/Rejected)
  - Displays NID number, phone, submission date
  - For pending requests: shows Approve/Reject buttons
  - Real-time updates via Supabase Realtime subscription
  - Color-coded badges (yellow=pending, green=approved, red=rejected)

### 5. **Data Service** (`/lib/supabase/data-service.ts`)
- Added `VerificationRequest` interface
- Added `subscribeToVerificationRequests()` for real-time updates
- Added `getVerificationRequests()` to fetch all requests
- Added `getVerificationRequestsByPhone()` to fetch user-specific requests

## Features

### ✅ User Flow
1. User goes to verification page
2. Enters NID number
3. Enables camera for facial verification
4. Submits verification request
5. Request shows as "pending" - user sees confirmation message
6. User redirected to home page

### ✅ Admin Flow
1. Admin goes to dashboard
2. Clicks "Verification Requests" tab
3. Sees all verification requests with details
4. For each pending request:
   - Can click "Approve" to verify user
   - Can click "Reject" to deny verification
5. Status updates in real-time
6. Approved users get NID + face verified in profiles table

### ✅ Real-time Updates
- Admin dashboard automatically updates when new requests arrive
- Status changes appear instantly without page refresh
- Uses Supabase Realtime PostgreSQL subscription

## Testing Checklist

1. **Submit Verification Request**
   - Go to verification page
   - Enter valid NID (10-17 digits)
   - Enable camera & allow face detection
   - Submit and check if request is pending

2. **Admin Approval**
   - Login as admin (phone: 01709783145 or 01930314459)
   - Go to Admin Dashboard
   - Click "Verification Requests" tab
   - Approve a pending request
   - Verify user profile gets `is_nid_verified: true` and `face_verified: true`

3. **Real-time Updates**
   - Have two browser windows open
   - One as user submitting verification
   - One as admin viewing dashboard
   - Verify new request appears in admin dashboard instantly

## Admin Phone Numbers
- 01709783145
- 01930314459

## Status Codes
- `pending`: Waiting for admin review
- `approved`: Admin approved verification
- `rejected`: Admin rejected verification

## Important Notes

⚠️ **Make sure to create the `verification_requests` table in Supabase before testing!**

The system prevents:
- Non-admin users from approving/rejecting requests
- Invalid NID formats from being submitted
- Duplicate processing of requests

All verification requests include timestamps for audit trail purposes.
