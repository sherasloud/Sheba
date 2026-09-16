# Website + App Integration Guide

## Overview
The Sheba App now integrates with your website to manage institutions and their students.

---

## 1. Screen Rotation Lock
✅ **COMPLETED** - The app now stays in portrait mode only
- Screen rotation is disabled across the entire app
- Users cannot rotate the device to landscape

---

## 2. Bill Provider Number Field
✅ **COMPLETED** - Bill providers now have contact numbers
- Admins add provider's customer service number in Admin Panel
- Users can see the number when paying bills (read-only field)
- Used for accessing Provider Dashboard and support

**How it works:**
1. Go to Admin Panel → Manage Bill & Donate
2. Click "Add Bill Provider"
3. Enter provider details including **Customer Service Number**
4. Users will see this number when making payments

---

## 3. Students Management System

### For Institution Admins (Website):
Your website should provide an admin dashboard where institution admins can:
- Log in with their institution credentials
- Add students with:
  - **Student Name**
  - **Roll Number**
  - **Student ID**
  - **Class** (optional)
  - **Email** (optional)
  - **Phone** (optional)

### For App Users:
The app calls the API to fetch students for their institution

---

## 4. API Integration

### Get All Students
```bash
GET /api/students
```

### Get Students by Institution
```bash
GET /api/students?institutionName=YourSchoolName
```

**Response:**
```json
{
  "students": [
    {
      "id": 1234567890,
      "name": "Ahmed Hassan",
      "roll": "001",
      "studentId": "STU-2024-001",
      "class": "10A",
      "email": "ahmed@email.com",
      "phone": "01XXXXXXXXX",
      "institutionName": "Bangladesh Universal School",
      "createdAt": "2024-07-25T10:00:00Z"
    }
  ],
  "success": true
}
```

### Add a Student
```bash
POST /api/students
Content-Type: application/json

{
  "name": "Ahmed Hassan",
  "roll": "001",
  "studentId": "STU-2024-001",
  "class": "10A",
  "email": "ahmed@email.com",
  "phone": "01XXXXXXXXX",
  "institutionName": "Bangladesh Universal School"
}
```

### Delete a Student
```bash
DELETE /api/students
Content-Type: application/json

{
  "index": 0
}
```

---

## 5. Admin Panel Access

### Students Management
- **Access:** `/admin/manage-students`
- **What it does:**
  1. Select an institution
  2. View all students for that institution
  3. Add new students
  4. Delete students

### Bill & Donation Management
- **Access:** `/admin/manage-bill-donate`
- **Features:**
  1. Add Bill Providers (with customer service numbers)
  2. Add Donation Recipients (with contact numbers)
  3. Add Education Institutions (schools, colleges, universities)
  4. Manage students for institutions

---

## 6. Website Integration Steps

### Step 1: Authentication
Create a login system for institution admins with:
- Institution Name
- Admin Username
- Admin Password

### Step 2: Student Management Page
Build a page where admins can:
```html
<form method="POST" action="/api/students">
  <input name="name" placeholder="Student Name" required />
  <input name="roll" placeholder="Roll Number" required />
  <input name="studentId" placeholder="Student ID" required />
  <input name="class" placeholder="Class" />
  <input name="email" placeholder="Email" />
  <input name="phone" placeholder="Phone" />
  <input type="hidden" name="institutionName" value="Institution Name" />
  <button type="submit">Add Student</button>
</form>
```

### Step 3: Data Sync
Both website and app pull from the same API endpoints (`/api/students`)

---

## 7. Data Flow

```
Website Admin Dashboard
        ↓
        → Adds Student
        ↓
    API Endpoint: POST /api/students
        ↓
    Stored in Memory/Database
        ↓
Sheba App
        ↓
    Calls: GET /api/students?institutionName=...
        ↓
    Displays student list for that institution
```

---

## 8. Current Data Storage
- **Method:** In-memory storage (for development)
- **Production:** Should use a database (PostgreSQL, MongoDB, etc.)

### To Migrate to Database:
1. Replace the memory store in each API route with database queries
2. Use your preferred ORM (Prisma, Drizzle, etc.)
3. Update the endpoints to query the database

---

## 9. Security Considerations

⚠️ **Important for Production:**
1. Add authentication to `/api/students` endpoints
2. Verify that admins can only manage their own institution's students
3. Use JWT tokens or session management
4. Validate all input data
5. Add rate limiting to API endpoints
6. Use HTTPS for all API calls

---

## 10. Testing

### Test Student Addition:
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "roll": "001",
    "studentId": "TEST-001",
    "class": "10A",
    "institutionName": "Test School"
  }'
```

### Test Getting Students:
```bash
curl http://localhost:3000/api/students?institutionName=Test%20School
```

---

## 11. Next Steps

1. Build institution admin dashboard on your website
2. Add authentication system
3. Connect website form to `/api/students` endpoint
4. Test data sync between website and app
5. For production, migrate to database storage
