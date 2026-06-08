# Complete NestJS Backend API Documentation

**Project:** Usta Technical Service Platform  
**Generated:** 2026-06-07  
**Version:** 1.0.0

---

## Table of Contents

1. [Authentication Module](#authentication-module)
2. [Users Module](#users-module)
3. [Technician Module](#technician-module)
4. [Categories Module](#categories-module)
5. [Services Module](#services-module)
6. [Requests Module](#requests-module)
7. [Reviews Module](#reviews-module)
8. [Admin Module](#admin-module)
9. [Emergency Module](#emergency-module)
10. [Chat/AI Assistant Module](#chatai-assistant-module)
11. [Enums Reference](#enums-reference)
12. [Response Format](#response-format)
13. [Error Handling](#error-handling)
14. [Role-Based Access Control](#role-based-access-control)

---

## Authentication Module

**Base URL:** `/auth`

### Endpoint 1: Register User (Client)

#### General Information

- **Method:** POST
- **Route:** `/auth/register/user`
- **Description:** Register a new client account
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullName": "Ahmed Mohamed",
  "email": "client@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "phone": "20123456789",
  "governorate": "Cairo",
  "city": "Giza",
  "gender": "male"
}
```

#### Validation Rules

| Field             | Type   | Rules                                | Example              |
| ----------------- | ------ | ------------------------------------ | -------------------- |
| `fullName`        | string | Required, minimum 3 characters       | "Ahmed Mohamed"      |
| `email`           | string | Required, valid email format         | "client@example.com" |
| `password`        | string | Required, minimum 8 characters       | "SecurePass123"      |
| `confirmPassword` | string | Required, must match password        | "SecurePass123"      |
| `phone`           | string | Required, exactly 11 digits          | "20123456789"        |
| `governorate`     | string | Required                             | "Cairo"              |
| `city`            | string | Required                             | "Giza"               |
| `gender`          | enum   | Required, must be "male" or "female" | "male"               |

#### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "60d5ec49c1234567890abc12",
    "fullName": "Ahmed Mohamed",
    "email": "client@example.com",
    "phone": "20123456789",
    "role": "client",
    "gender": "male",
    "governorate": "Cairo",
    "city": "Giza",
    "isVerified": false,
    "createdAt": "2026-06-07T10:30:00Z",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-06-07T10:30:00Z"
}
```

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Please enter a valid email address"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "timestamp": "2026-06-07T10:30:00Z"
}
```

**Conflict Error (409 Conflict) - Email/Phone already exists:**

```json
{
  "success": false,
  "message": "Email or phone already registered",
  "data": null,
  "timestamp": "2026-06-07T10:30:00Z"
}
```

#### Business Rules

- Email must be unique across the system
- Phone number must be unique across the system
- Password must be at least 8 characters for security
- Gender must be explicitly male or female
- New users are assigned the "client" role by default
- Email verification is required after registration (separate step)
- Account is not verified until email verification link is clicked

#### Postman Example

```
POST /auth/register/user HTTP/1.1
Host: api.usta.com
Content-Type: application/json

{
  "fullName": "Ahmed Mohamed",
  "email": "client@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "phone": "20123456789",
  "governorate": "Cairo",
  "city": "Giza",
  "gender": "male"
}
```

---

### Endpoint 2: Register Technician

#### General Information

- **Method:** POST
- **Route:** `/auth/register/technician`
- **Description:** Register a new technician account (starts technician registration workflow)
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullName": "Karim Hassan",
  "email": "technician@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "phone": "20198765432",
  "governorate": "Cairo",
  "city": "New Cairo",
  "gender": "male"
}
```

#### Validation Rules

Same as Register User (Endpoint 1)

#### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Technician registered successfully",
  "data": {
    "id": "60d5ec49c1234567890abc13",
    "fullName": "Karim Hassan",
    "email": "technician@example.com",
    "phone": "20198765432",
    "role": "technician",
    "gender": "male",
    "governorate": "Cairo",
    "city": "New Cairo",
    "isVerified": false,
    "createdAt": "2026-06-07T10:30:00Z",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-06-07T10:30:00Z"
}
```

#### Business Rules

- Technician must complete a 5-step registration process after account creation
- Initial verification status: "INCOMPLETE"
- Current step tracking starts at 1
- Profile is not complete until all 5 steps are finished
- Registration can be paused and resumed later

#### Postman Example

```
POST /auth/register/technician HTTP/1.1
Host: api.usta.com
Content-Type: application/json

{
  "fullName": "Karim Hassan",
  "email": "technician@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "phone": "20198765432",
  "governorate": "Cairo",
  "city": "New Cairo",
  "gender": "male"
}
```

---

### Endpoint 3: Login

#### General Information

- **Method:** POST
- **Route:** `/auth/login`
- **Description:** Authenticate user with email and password
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "client@example.com",
  "password": "SecurePass123"
}
```

#### Validation Rules

| Field      | Type   | Rules                          |
| ---------- | ------ | ------------------------------ |
| `email`    | string | Required, valid email format   |
| `password` | string | Required, minimum 8 characters |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60d5ec49c1234567890abc12",
      "fullName": "Ahmed Mohamed",
      "email": "client@example.com",
      "role": "client",
      "phone": "20123456789",
      "governorate": "Cairo",
      "city": "Giza",
      "gender": "male",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-06-07T10:35:00Z"
}
```

**Invalid Credentials (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "timestamp": "2026-06-07T10:35:00Z"
}
```

**User Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "timestamp": "2026-06-07T10:35:00Z"
}
```

#### Business Rules

- Email is case-insensitive
- Password is case-sensitive
- Both access token and refresh token are returned on successful login
- Access token expires in 1 hour (default)
- Refresh token can be used to obtain new access token
- Failed login attempts may be rate-limited

#### Postman Example

```
POST /auth/login HTTP/1.1
Host: api.usta.com
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "SecurePass123"
}
```

---

### Endpoint 4: Refresh Token

#### General Information

- **Method:** POST
- **Route:** `/auth/refresh`
- **Description:** Get new access token using refresh token
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Validation Rules

| Field           | Type   | Rules                     |
| --------------- | ------ | ------------------------- |
| `refresh_token` | string | Required, valid JWT token |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-06-07T10:40:00Z"
}
```

**Invalid Token (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "data": null,
  "timestamp": "2026-06-07T10:40:00Z"
}
```

#### Business Rules

- Refresh token must be valid and not expired
- Refresh token is invalidated after logout
- New refresh token is issued with new access token
- Tokens use HS256 algorithm

#### Postman Example

```
POST /auth/refresh HTTP/1.1
Host: api.usta.com
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Endpoint 5: Logout

#### General Information

- **Method:** POST
- **Route:** `/auth/logout`
- **Description:** Invalidate current session and refresh token
- **Authentication Required:** Yes (JWT)
- **Required Roles:** All authenticated users

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{}
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null,
  "timestamp": "2026-06-07T10:45:00Z"
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Business Rules

- Refresh token is cleared from database
- Access token remains valid until expiration (security measure)
- Further requests with old tokens will be rejected on refresh attempt
- User can login again with credentials

#### Postman Example

```
POST /auth/logout HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

---

### Endpoint 6: Forget Password

#### General Information

- **Method:** POST
- **Route:** `/auth/forget-password`
- **Description:** Request password reset by sending OTP to email
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "client@example.com"
}
```

#### Validation Rules

| Field   | Type   | Rules                                              |
| ------- | ------ | -------------------------------------------------- |
| `email` | string | Required, valid email format, must exist in system |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "email": "client@example.com",
    "message": "Check your email for OTP code"
  },
  "timestamp": "2026-06-07T10:50:00Z"
}
```

**User Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "timestamp": "2026-06-07T10:50:00Z"
}
```

**Email Send Failed (500 Internal Server Error):**

```json
{
  "success": false,
  "message": "Failed to send email",
  "data": null,
  "timestamp": "2026-06-07T10:50:00Z"
}
```

#### Business Rules

- OTP is generated and sent to registered email
- OTP is valid for 10 minutes
- OTP must be 6 digits
- User must verify OTP before resetting password
- Multiple OTP requests don't expire previous OTP (last one is used)
- Rate limiting: maximum 3 OTP requests per hour per email

#### Postman Example

```
POST /auth/forget-password HTTP/1.1
Host: api.usta.com
Content-Type: application/json

{
  "email": "client@example.com"
}
```

---

### Endpoint 7: Verify OTP

#### General Information

- **Method:** POST
- **Route:** `/auth/verify-otp`
- **Description:** Verify OTP code for password reset
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "client@example.com",
  "otp": "123456"
}
```

#### Validation Rules

| Field   | Type   | Rules                        |
| ------- | ------ | ---------------------------- |
| `email` | string | Required, valid email format |
| `otp`   | string | Required, exactly 6 digits   |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "resetToken": "temp_token_xyz",
    "expiresIn": 600
  },
  "timestamp": "2026-06-07T10:55:00Z"
}
```

**Invalid OTP (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "data": null,
  "timestamp": "2026-06-07T10:55:00Z"
}
```

**OTP Expired (400 Bad Request):**

```json
{
  "success": false,
  "message": "OTP has expired. Request a new one",
  "data": null,
  "timestamp": "2026-06-07T10:55:00Z"
}
```

#### Business Rules

- OTP must be exactly 6 digits
- OTP is case-sensitive (if alphanumeric)
- Each incorrect attempt increments counter
- After 5 failed attempts, OTP is locked for 15 minutes
- Valid OTP generates a temporary reset token
- Reset token expires in 10 minutes

#### Postman Example

```
POST /auth/verify-otp HTTP/1.1
Host: api.usta.com
Content-Type: application/json

{
  "email": "client@example.com",
  "otp": "123456"
}
```

---

### Endpoint 8: Reset Password

#### General Information

- **Method:** POST
- **Route:** `/auth/reset-password`
- **Description:** Reset password using verified OTP
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "client@example.com",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

#### Validation Rules

| Field             | Type   | Rules                                                       |
| ----------------- | ------ | ----------------------------------------------------------- |
| `email`           | string | Required, valid email format                                |
| `newPassword`     | string | Required, minimum 8 characters, different from old password |
| `confirmPassword` | string | Required, must match newPassword                            |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "email": "client@example.com",
    "message": "You can now login with your new password"
  },
  "timestamp": "2026-06-07T11:00:00Z"
}
```

**Passwords Don't Match (400 Bad Request):**

```json
{
  "success": false,
  "message": "Passwords do not match",
  "data": null,
  "timestamp": "2026-06-07T11:00:00Z"
}
```

**Weak Password (400 Bad Request):**

```json
{
  "success": false,
  "message": "Password must be at least 8 characters",
  "data": null,
  "timestamp": "2026-06-07T11:00:00Z"
}
```

#### Business Rules

- Must have verified OTP first
- New password must be different from current password
- Password must be at least 8 characters
- All refresh tokens are invalidated after password reset
- User must login again with new password
- Password change history is tracked (optional, for security)

#### Postman Example

```
POST /auth/reset-password HTTP/1.1
Host: api.usta.com
Content-Type: application/json

{
  "email": "client@example.com",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

---

### Endpoint 9: Send Email Verification

#### General Information

- **Method:** POST
- **Route:** `/auth/send-verification`
- **Description:** Resend email verification link (authenticated users)
- **Authentication Required:** Yes (JWT)
- **Required Roles:** All authenticated users

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{}
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "data": {
    "email": "client@example.com",
    "message": "Check your email for verification link"
  },
  "timestamp": "2026-06-07T11:05:00Z"
}
```

**Already Verified (400 Bad Request):**

```json
{
  "success": false,
  "message": "Email already verified",
  "data": null,
  "timestamp": "2026-06-07T11:05:00Z"
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Business Rules

- Can only be used by authenticated users
- If email is already verified, returns error
- Verification link is valid for 24 hours
- Only one active verification token at a time
- Requesting new verification invalidates old token

#### Postman Example

```
POST /auth/send-verification HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

---

### Endpoint 10: Verify Email

#### General Information

- **Method:** GET
- **Route:** `/auth/verify-email`
- **Description:** Verify email using token from email link
- **Authentication Required:** No
- **Required Roles:** None
- **Response Type:** HTML page

#### Request

**Query Parameters:**

```
?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success Response (200 OK):**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Email Verified</title>
  </head>
  <body>
    <h1>Email Verified Successfully</h1>
    <p>Your email has been verified. You can now close this window.</p>
  </body>
</html>
```

**Invalid Token (400 Bad Request):**

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Error: Invalid or Expired Token</h1>
  </body>
</html>
```

#### Business Rules

- Token is provided in email link
- Token must be valid and not expired
- Can be clicked multiple times (idempotent)
- After verification, user can access full features
- Unverified accounts have limited access

#### Postman Example

```
GET /auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... HTTP/1.1
Host: api.usta.com
```

---

### Endpoint 11: Google OAuth Login

#### General Information

- **Method:** GET
- **Route:** `/auth/google`
- **Description:** Redirect to Google OAuth consent screen
- **Authentication Required:** No (redirects to Google)
- **Required Roles:** None

#### Request

**Query Parameters:**

```
None
```

#### Response

**Redirect (302 Found):**

```
Location: https://accounts.google.com/o/oauth2/v2/auth?...
```

#### Business Rules

- User is redirected to Google login
- Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL in environment
- Scope: email, profile
- User will be redirected to callback URL after authentication

#### Postman Example

```
GET /auth/google HTTP/1.1
Host: api.usta.com
```

---

### Endpoint 12: Google OAuth Callback

#### General Information

- **Method:** GET
- **Route:** `/auth/google/callback`
- **Description:** Handle Google OAuth callback
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Query Parameters:**

```
?code=authorization_code&state=state_value
```

#### Response

**Success Response (Redirect):**

```
Location: frontend_url?accessToken=...&refreshToken=...
```

#### Business Rules

- Handles Google OAuth callback
- Creates or finds existing user by Google ID
- If user exists: login user
- If new user: create user with verified email status
- Redirect includes tokens for frontend

---

## Users Module

**Base URL:** `/users`

### Endpoint 1: Get My Profile

#### General Information

- **Method:** GET
- **Route:** `/users/me`
- **Description:** Get authenticated user's profile information
- **Authentication Required:** Yes (JWT)
- **Required Roles:** All authenticated users

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc12",
    "fullName": "Ahmed Mohamed",
    "email": "client@example.com",
    "phone": "20123456789",
    "role": "client",
    "gender": "male",
    "governorate": "Cairo",
    "city": "Giza",
    "isVerified": true,
    "createdAt": "2026-06-07T10:30:00Z",
    "updatedAt": "2026-06-07T10:30:00Z"
  },
  "timestamp": "2026-06-07T11:10:00Z"
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Business Rules

- Only authenticated users can access
- Returns complete user profile including verified status
- User can only access their own profile (enforcement at service level)

#### Postman Example

```
GET /users/me HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Endpoint 2: Update My Profile

#### General Information

- **Method:** PATCH
- **Route:** `/users/me`
- **Description:** Update authenticated user's profile information
- **Authentication Required:** Yes (JWT)
- **Required Roles:** All authenticated users

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body (All fields optional):**

```json
{
  "fullName": "Ahmed Mohamed Updated",
  "phone": "20123456789",
  "governorate": "Alexandria",
  "city": "Alexandria City",
  "gender": "male"
}
```

#### Validation Rules

| Field         | Type   | Rules                                | Example         |
| ------------- | ------ | ------------------------------------ | --------------- |
| `fullName`    | string | Optional, minimum 3 characters       | "Ahmed Mohamed" |
| `phone`       | string | Optional, valid phone format         | "20123456789"   |
| `governorate` | string | Optional                             | "Cairo"         |
| `city`        | string | Optional                             | "Giza"          |
| `gender`      | enum   | Optional, must be "male" or "female" | "male"          |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc12",
    "fullName": "Ahmed Mohamed Updated",
    "email": "client@example.com",
    "phone": "20123456789",
    "role": "client",
    "gender": "male",
    "governorate": "Alexandria",
    "city": "Alexandria City",
    "isVerified": true,
    "updatedAt": "2026-06-07T11:15:00Z"
  },
  "timestamp": "2026-06-07T11:15:00Z"
}
```

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "phone",
        "message": "Invalid phone number format"
      }
    ]
  },
  "timestamp": "2026-06-07T11:15:00Z"
}
```

**Unauthorized (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Business Rules

- All fields are optional (partial update)
- Email and role cannot be updated through this endpoint
- Phone must be unique (cannot match another user's phone)
- Changes are applied immediately
- Update timestamp is automatically updated

#### Postman Example

```
PATCH /users/me HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "Ahmed Mohamed Updated",
  "governorate": "Alexandria",
  "city": "Alexandria City"
}
```

---

## Technician Module

**Base URL:** `/technician`

### Technician Registration Workflow

Technician registration consists of 5 steps that must be completed in order:

1. **Step 1:** Account creation (via auth/register/technician)
2. **Step 2:** Select specialization (category and services)
3. **Step 3:** Professional information (experience, tools, schedule)
4. **Step 4:** Service areas and availability
5. **Step 5:** Upload documents

---

### Endpoint 1: Technician Step 2 - Set Specialization

#### General Information

- **Method:** POST
- **Route:** `/technician/step2`
- **Description:** Set technician's specialization (category and services)
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "categoryId": "60d5ec49c1234567890abc20",
  "serviceIds": [
    "60d5ec49c1234567890abc21",
    "60d5ec49c1234567890abc22",
    "60d5ec49c1234567890abc23"
  ]
}
```

#### Validation Rules

| Field        | Type   | Rules                                                |
| ------------ | ------ | ---------------------------------------------------- |
| `categoryId` | string | Required, valid MongoDB ObjectId                     |
| `serviceIds` | array  | Required, non-empty array of valid MongoDB ObjectIds |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Specialization updated successfully",
  "data": {
    "currentStep": 3,
    "specialization": {
      "categoryId": "60d5ec49c1234567890abc20",
      "serviceIds": [
        "60d5ec49c1234567890abc21",
        "60d5ec49c1234567890abc22",
        "60d5ec49c1234567890abc23"
      ]
    }
  },
  "timestamp": "2026-06-07T11:20:00Z"
}
```

**Invalid Category/Service (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid category or service ID",
  "data": null,
  "timestamp": "2026-06-07T11:20:00Z"
}
```

**Not Technician (403 Forbidden):**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

#### Business Rules

- Only accessible to technicians
- categoryId must exist in Category collection
- All serviceIds must exist in ServiceEntity collection
- Services must belong to selected category
- Completes Step 2, advances to Step 3
- This operation can be repeated to update specialization

#### Postman Example

```
POST /technician/step2 HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "categoryId": "60d5ec49c1234567890abc20",
  "serviceIds": [
    "60d5ec49c1234567890abc21",
    "60d5ec49c1234567890abc22"
  ]
}
```

---

### Endpoint 2: Technician Step 3 - Professional Information

#### General Information

- **Method:** POST
- **Route:** `/technician/step3`
- **Description:** Set technician's professional information
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "yearsOfExperience": 5,
  "hasTools": true,
  "hasTransportation": true,
  "workingDays": [
    "السبت",
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس"
  ],
  "startTime": "08:00",
  "endTime": "18:00"
}
```

#### Validation Rules

| Field               | Type    | Rules                                                  |
| ------------------- | ------- | ------------------------------------------------------ |
| `yearsOfExperience` | number  | Required, must be >= 0                                 |
| `hasTools`          | boolean | Required                                               |
| `hasTransportation` | boolean | Required                                               |
| `workingDays`       | array   | Required, array of WorkingDay enum values              |
| `startTime`         | string  | Required, time format (HH:mm)                          |
| `endTime`           | string  | Required, time format (HH:mm), must be after startTime |

#### Working Days Enum

```
السبت (Saturday)
الأحد (Sunday)
الاثنين (Monday)
الثلاثاء (Tuesday)
الأربعاء (Wednesday)
الخميس (Thursday)
الجمعة (Friday)
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Professional information updated successfully",
  "data": {
    "currentStep": 4,
    "yearsOfExperience": 5,
    "hasTools": true,
    "hasTransportation": true,
    "workingDays": [
      "السبت",
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس"
    ],
    "startTime": "08:00",
    "endTime": "18:00"
  },
  "timestamp": "2026-06-07T11:25:00Z"
}
```

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "workingDays",
        "message": "Invalid working day"
      }
    ]
  },
  "timestamp": "2026-06-07T11:25:00Z"
}
```

#### Business Rules

- All fields are required
- Experience must be 0 or positive integer
- Working days must be valid Arabic day names
- Start time must be before end time
- Completes Step 3, advances to Step 4
- Can be updated after completion

#### Postman Example

```
POST /technician/step3 HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "yearsOfExperience": 5,
  "hasTools": true,
  "hasTransportation": true,
  "workingDays": ["السبت", "الأحد", "الاثنين"],
  "startTime": "08:00",
  "endTime": "18:00"
}
```

---

### Endpoint 3: Technician Step 4 - Service Areas

#### General Information

- **Method:** POST
- **Route:** `/technician/step4`
- **Description:** Set technician's service areas
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "serviceAreas": ["Cairo", "Giza", "Helwan"],
  "canWorkOutsideArea": true
}
```

#### Validation Rules

| Field                | Type    | Rules                                   |
| -------------------- | ------- | --------------------------------------- |
| `serviceAreas`       | array   | Required, array of strings (city names) |
| `canWorkOutsideArea` | boolean | Required                                |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Service areas updated successfully",
  "data": {
    "currentStep": 5,
    "serviceAreas": ["Cairo", "Giza", "Helwan"],
    "canWorkOutsideArea": true
  },
  "timestamp": "2026-06-07T11:30:00Z"
}
```

#### Business Rules

- At least one service area must be specified
- Service areas are city names
- canWorkOutsideArea indicates willingness to travel beyond specified areas
- Completes Step 4, advances to Step 5
- Can be updated later

#### Postman Example

```
POST /technician/step4 HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "serviceAreas": ["Cairo", "Giza"],
  "canWorkOutsideArea": true
}
```

---

### Endpoint 4: Technician Step 5 - Upload Documents

#### General Information

- **Method:** POST
- **Route:** `/technician/step5`
- **Description:** Upload required documents for technician verification
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician
- **Content-Type:** multipart/form-data

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----FormBoundary
```

**Form Fields:**

```
personalImage (file, required) - Personal photograph
idFrontImage (file, required) - ID card front
idBackImage (file, required) - ID card back
certificateImage (file, optional) - Professional certificate
criminalRecordImage (file, optional) - Criminal record clearance
```

**File Requirements:**

- Format: PNG, JPG, JPEG, PDF (for documents)
- Size: Max 5MB per file
- Resolution: Minimum 1024x768 for images

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Documents uploaded successfully",
  "data": {
    "currentStep": 5,
    "isProfileComplete": false,
    "verificationStatus": "pending",
    "documents": {
      "personalImage": "uploads/technician/user_id/personalImage.jpg",
      "idFrontImage": "uploads/technician/user_id/idFrontImage.jpg",
      "idBackImage": "uploads/technician/user_id/idBackImage.jpg",
      "certificateImage": "uploads/technician/user_id/certificateImage.pdf",
      "criminalRecordImage": null
    }
  },
  "timestamp": "2026-06-07T11:35:00Z"
}
```

**Missing Required Files (400 Bad Request):**

```json
{
  "success": false,
  "message": "Missing required files: personalImage, idFrontImage, idBackImage",
  "data": null,
  "timestamp": "2026-06-07T11:35:00Z"
}
```

**File Size Exceeded (413 Payload Too Large):**

```json
{
  "success": false,
  "message": "File size exceeds maximum allowed size (5MB)",
  "data": null,
  "timestamp": "2026-06-07T11:35:00Z"
}
```

#### Business Rules

- personalImage, idFrontImage, idBackImage are mandatory
- certificateImage and criminalRecordImage are optional
- Files are stored on disk with user-specific directory structure
- Verification status changes to "pending" after document upload
- Admin must review and approve/reject
- Profile is not complete until documents are approved
- Files are scanned for malware (if enabled)

#### Postman Example

```
POST /technician/step5 HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="personalImage"; filename="photo.jpg"
Content-Type: image/jpeg

[binary image data]
------FormBoundary
Content-Disposition: form-data; name="idFrontImage"; filename="id_front.jpg"
Content-Type: image/jpeg

[binary image data]
------FormBoundary--
```

---

### Endpoint 5: Get Technician Details

#### General Information

- **Method:** GET
- **Route:** `/technician/details`
- **Description:** Get authenticated technician's complete profile
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Technician details fetched successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc30",
    "userId": "60d5ec49c1234567890abc13",
    "specialization": {
      "categoryId": "60d5ec49c1234567890abc20",
      "serviceIds": ["60d5ec49c1234567890abc21", "60d5ec49c1234567890abc22"]
    },
    "yearsOfExperience": 5,
    "hasTools": true,
    "hasTransportation": true,
    "workingDays": ["السبت", "الأحد", "الاثنين"],
    "startTime": "08:00",
    "endTime": "18:00",
    "serviceAreas": ["Cairo", "Giza"],
    "canWorkOutsideArea": true,
    "personalImage": "uploads/technician/user_id/personalImage.jpg",
    "idFrontImage": "uploads/technician/user_id/idFrontImage.jpg",
    "idBackImage": "uploads/technician/user_id/idBackImage.jpg",
    "certificateImage": "uploads/technician/user_id/certificateImage.pdf",
    "criminalRecordImage": null,
    "verificationStatus": "approved",
    "rejectionReason": null,
    "verifiedAt": "2026-06-07T12:00:00Z",
    "currentStep": 5,
    "isProfileComplete": true,
    "isAvailable": true,
    "averageRating": 4.7,
    "totalReviews": 23,
    "createdAt": "2026-06-07T10:30:00Z",
    "updatedAt": "2026-06-07T12:00:00Z"
  },
  "timestamp": "2026-06-07T11:40:00Z"
}
```

#### Business Rules

- Only accessible to the technician's own account
- Returns complete profile including verification status
- Average rating is calculated from all reviews

#### Postman Example

```
GET /technician/details HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Categories Module

**Base URL:** `/categories`

### Endpoint 1: Get All Categories

#### General Information

- **Method:** GET
- **Route:** `/categories`
- **Description:** Get all active categories
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Query Parameters:**

```
None
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc20",
      "key": "PLUMBING",
      "name": "Plumbing",
      "description": "All plumbing services",
      "image": "https://cdn.example.com/categories/plumbing.jpg",
      "servicesCount": 15,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    },
    {
      "_id": "60d5ec49c1234567890abc21",
      "key": "ELECTRICAL",
      "name": "Electrical",
      "description": "Electrical installation and repair",
      "image": "https://cdn.example.com/categories/electrical.jpg",
      "servicesCount": 12,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "timestamp": "2026-06-07T11:45:00Z"
}
```

#### Business Rules

- Returns only active categories (isActive = true)
- Includes service count for each category
- Results are sorted by creation date
- Public endpoint (no authentication required)

#### Postman Example

```
GET /categories HTTP/1.1
Host: api.usta.com
```

---

### Endpoint 2: Get Category by ID

#### General Information

- **Method:** GET
- **Route:** `/categories/:id`
- **Description:** Get specific category by ID
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Path Parameters:**

```
id = 60d5ec49c1234567890abc20 (MongoDB ObjectId)
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Category fetched successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc20",
    "key": "PLUMBING",
    "name": "Plumbing",
    "description": "All plumbing services",
    "image": "https://cdn.example.com/categories/plumbing.jpg",
    "servicesCount": 15,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  },
  "timestamp": "2026-06-07T11:50:00Z"
}
```

**Not Found (404 Not Found):**

```json
{
  "success": false,
  "message": "Category not found",
  "data": null,
  "timestamp": "2026-06-07T11:50:00Z"
}
```

**Invalid ID Format (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid category ID format",
  "data": null,
  "timestamp": "2026-06-07T11:50:00Z"
}
```

#### Business Rules

- ID must be valid MongoDB ObjectId
- Only active categories are returned
- Returns full category details including service count

#### Postman Example

```
GET /categories/60d5ec49c1234567890abc20 HTTP/1.1
Host: api.usta.com
```

---

### Endpoint 3: Create Category (Admin)

#### General Information

- **Method:** POST
- **Route:** `/categories`
- **Description:** Create new category
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "key": "PLUMBING",
  "name": "Plumbing Services",
  "description": "Complete plumbing solutions",
  "image": "https://cdn.example.com/categories/plumbing.jpg",
  "isActive": true
}
```

#### Validation Rules

| Field         | Type    | Rules                                   |
| ------------- | ------- | --------------------------------------- |
| `key`         | string  | Required, uppercase, unique, 2-50 chars |
| `name`        | string  | Required, unique, 2-100 chars           |
| `description` | string  | Required, 10-500 chars                  |
| `image`       | string  | Optional, valid URL format              |
| `isActive`    | boolean | Optional, defaults to true              |

#### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc99",
    "key": "PLUMBING",
    "name": "Plumbing Services",
    "description": "Complete plumbing solutions",
    "image": "https://cdn.example.com/categories/plumbing.jpg",
    "servicesCount": 0,
    "isActive": true,
    "createdAt": "2026-06-07T11:55:00Z",
    "updatedAt": "2026-06-07T11:55:00Z"
  },
  "timestamp": "2026-06-07T11:55:00Z"
}
```

**Duplicate Key (409 Conflict):**

```json
{
  "success": false,
  "message": "Key or name already exists",
  "data": null,
  "timestamp": "2026-06-07T11:55:00Z"
}
```

**Unauthorized (403 Forbidden):**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

#### Business Rules

- Only admins can create categories
- Key must be uppercase
- Key and name must be unique
- New category starts with 0 services
- Default isActive is true

#### Postman Example

```
POST /categories HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "key": "PLUMBING",
  "name": "Plumbing Services",
  "description": "Complete plumbing solutions",
  "image": "https://cdn.example.com/categories/plumbing.jpg"
}
```

---

### Endpoint 4: Update Category (Admin)

#### General Information

- **Method:** PATCH
- **Route:** `/categories/:id`
- **Description:** Update category information
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body (all fields optional):**

```json
{
  "key": "PLUMBING_UPDATED",
  "name": "Updated Plumbing",
  "description": "Updated description",
  "image": "https://cdn.example.com/categories/plumbing-new.jpg",
  "isActive": true
}
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc20",
    "key": "PLUMBING_UPDATED",
    "name": "Updated Plumbing",
    "description": "Updated description",
    "image": "https://cdn.example.com/categories/plumbing-new.jpg",
    "servicesCount": 15,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-06-07T12:00:00Z"
  },
  "timestamp": "2026-06-07T12:00:00Z"
}
```

#### Postman Example

```
PATCH /categories/60d5ec49c1234567890abc20 HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Updated Plumbing"
}
```

---

### Endpoint 5: Toggle Category Active Status (Admin)

#### General Information

- **Method:** PATCH
- **Route:** `/categories/:id/toggle-active`
- **Description:** Toggle category active/inactive status
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

```json
{}
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Category status updated",
  "data": {
    "_id": "60d5ec49c1234567890abc20",
    "key": "PLUMBING",
    "name": "Plumbing Services",
    "description": "Complete plumbing solutions",
    "isActive": false
  },
  "timestamp": "2026-06-07T12:05:00Z"
}
```

#### Business Rules

- Toggles isActive boolean value
- Inactive categories are not shown in public list
- Existing services remain associated

#### Postman Example

```
PATCH /categories/60d5ec49c1234567890abc20/toggle-active HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{}
```

---

### Endpoint 6: Delete Category (Admin)

#### General Information

- **Method:** DELETE
- **Route:** `/categories/:id`
- **Description:** Delete category (soft or hard delete based on implementation)
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc20",
    "key": "PLUMBING",
    "name": "Plumbing Services"
  },
  "timestamp": "2026-06-07T12:10:00Z"
}
```

**Cannot Delete (409 Conflict) - Category has services:**

```json
{
  "success": false,
  "message": "Cannot delete category with associated services",
  "data": null,
  "timestamp": "2026-06-07T12:10:00Z"
}
```

#### Business Rules

- Cannot delete category if it has associated services
- Must remove all services first
- Admin should be warned about cascade effects

#### Postman Example

```
DELETE /categories/60d5ec49c1234567890abc20 HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Services Module

**Base URL:** `/services`

### Endpoint 1: Get All Services

#### General Information

- **Method:** GET
- **Route:** `/services`
- **Description:** Get all active services, optionally filtered by category
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Query Parameters:**

```
categoryId (optional) - Filter by category ID
```

**Example:**

```
GET /services?categoryId=60d5ec49c1234567890abc20
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Services fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc21",
      "key": "PIPE_REPAIR",
      "name": "Pipe Repair",
      "description": "Professional pipe repair service",
      "image": "https://cdn.example.com/services/pipe-repair.jpg",
      "category": {
        "_id": "60d5ec49c1234567890abc20",
        "key": "PLUMBING",
        "name": "Plumbing"
      },
      "priceRange": {
        "min": 50,
        "max": 200
      },
      "fixingSteps": {
        "includes": ["Diagnosis", "Repair", "Testing"],
        "doesNotInclude": ["Replacement of entire system"]
      },
      "averageRating": 4.5,
      "totalRatings": 12,
      "commentsCount": 5,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "timestamp": "2026-06-07T12:15:00Z"
}
```

#### Business Rules

- Returns only active services (isActive = true)
- Includes category information
- Includes rating and comment count
- Optional category filter for UI dropdowns
- Can return empty array if no services match filter

#### Postman Example

```
GET /services?categoryId=60d5ec49c1234567890abc20 HTTP/1.1
Host: api.usta.com
```

---

### Endpoint 2: Get Most Common Services

#### General Information

- **Method:** GET
- **Route:** `/services/most-common`
- **Description:** Get top 6 most requested services
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Query Parameters:**

```
None
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Most common services fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc21",
      "key": "PIPE_REPAIR",
      "name": "Pipe Repair",
      "averageRating": 4.5,
      "totalRequests": 45
    },
    {
      "_id": "60d5ec49c1234567890abc22",
      "key": "ELECTRICAL_WIRING",
      "name": "Electrical Wiring",
      "averageRating": 4.8,
      "totalRequests": 38
    }
  ],
  "timestamp": "2026-06-07T12:20:00Z"
}
```

#### Business Rules

- Returns maximum 6 services
- Sorted by number of requests (descending)
- Used for homepage/dashboard display

#### Postman Example

```
GET /services/most-common HTTP/1.1
Host: api.usta.com
```

---

### Endpoint 3: Get Service by ID

#### General Information

- **Method:** GET
- **Route:** `/services/:id`
- **Description:** Get specific service details
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Path Parameters:**

```
id = 60d5ec49c1234567890abc21
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Service fetched successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc21",
    "key": "PIPE_REPAIR",
    "name": "Pipe Repair",
    "description": "Professional pipe repair service",
    "image": "https://cdn.example.com/services/pipe-repair.jpg",
    "category": {
      "_id": "60d5ec49c1234567890abc20",
      "name": "Plumbing"
    },
    "priceRange": {
      "min": 50,
      "max": 200
    },
    "fixingSteps": {
      "includes": ["Diagnosis", "Repair", "Testing"],
      "doesNotInclude": ["Full system replacement"]
    },
    "averageRating": 4.5,
    "totalRatings": 12,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00Z"
  },
  "timestamp": "2026-06-07T12:25:00Z"
}
```

#### Postman Example

```
GET /services/60d5ec49c1234567890abc21 HTTP/1.1
Host: api.usta.com
```

---

### Endpoint 4: Get Service Comments

#### General Information

- **Method:** GET
- **Route:** `/services/:id/comments`
- **Description:** Get all comments/reviews for a service
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Path Parameters:**

```
id = 60d5ec49c1234567890abc21
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Comments fetched successfully",
  "data": [
    {
      "userId": "60d5ec49c1234567890abc12",
      "userName": "Ahmed Mohamed",
      "userAvatar": "https://cdn.example.com/avatars/user123.jpg",
      "rating": 5,
      "text": "Excellent service! Very professional.",
      "createdAt": "2026-06-05T10:30:00Z"
    },
    {
      "userId": "60d5ec49c1234567890abc14",
      "userName": "Fatima Ali",
      "userAvatar": "https://cdn.example.com/avatars/user124.jpg",
      "rating": 4,
      "text": "Good service, arrived a bit late",
      "createdAt": "2026-06-04T15:20:00Z"
    }
  ],
  "timestamp": "2026-06-07T12:30:00Z"
}
```

#### Business Rules

- Returns comments from all clients
- Comments are sorted by creation date (newest first)
- Includes user information and rating

#### Postman Example

```
GET /services/60d5ec49c1234567890abc21/comments HTTP/1.1
Host: api.usta.com
```

---

### Endpoint 5: Create Service (Admin)

#### General Information

- **Method:** POST
- **Route:** `/services`
- **Description:** Create new service
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "key": "PIPE_REPAIR",
  "name": "Pipe Repair",
  "description": "Professional pipe repair and installation",
  "image": "https://cdn.example.com/services/pipe-repair.jpg",
  "category": "60d5ec49c1234567890abc20",
  "priceRange": {
    "min": 50,
    "max": 200
  },
  "fixingSteps": {
    "includes": ["Diagnosis", "Repair", "Testing"],
    "doesNotInclude": ["Full system replacement"]
  },
  "isActive": true
}
```

#### Validation Rules

| Field                        | Type    | Rules                                        |
| ---------------------------- | ------- | -------------------------------------------- |
| `key`                        | string  | Required, uppercase, unique                  |
| `name`                       | string  | Required, unique                             |
| `description`                | string  | Optional                                     |
| `image`                      | string  | Optional, valid URL                          |
| `category`                   | string  | Required, valid MongoDB ObjectId, must exist |
| `priceRange.min`             | number  | Required, >= 0                               |
| `priceRange.max`             | number  | Required, >= min                             |
| `fixingSteps.includes`       | array   | Optional, array of strings                   |
| `fixingSteps.doesNotInclude` | array   | Optional, array of strings                   |
| `isActive`                   | boolean | Optional, defaults to true                   |

#### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc99",
    "key": "PIPE_REPAIR",
    "name": "Pipe Repair",
    "description": "Professional pipe repair and installation",
    "image": "https://cdn.example.com/services/pipe-repair.jpg",
    "category": "60d5ec49c1234567890abc20",
    "priceRange": {
      "min": 50,
      "max": 200
    },
    "fixingSteps": {
      "includes": ["Diagnosis", "Repair", "Testing"],
      "doesNotInclude": ["Full system replacement"]
    },
    "averageRating": 0,
    "totalRatings": 0,
    "comments": [],
    "isActive": true,
    "createdAt": "2026-06-07T12:35:00Z"
  },
  "timestamp": "2026-06-07T12:35:00Z"
}
```

#### Postman Example

```
POST /services HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "key": "PIPE_REPAIR",
  "name": "Pipe Repair",
  "description": "Professional pipe repair",
  "category": "60d5ec49c1234567890abc20",
  "priceRange": {
    "min": 50,
    "max": 200
  }
}
```

---

### Endpoint 6: Update Service (Admin)

#### General Information

- **Method:** PATCH
- **Route:** `/services/:id`
- **Description:** Update service information
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body (all fields optional):**

```json
{
  "name": "Updated Pipe Repair",
  "priceRange": {
    "min": 60,
    "max": 250
  }
}
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc21",
    "key": "PIPE_REPAIR",
    "name": "Updated Pipe Repair",
    "priceRange": {
      "min": 60,
      "max": 250
    },
    "updatedAt": "2026-06-07T12:40:00Z"
  },
  "timestamp": "2026-06-07T12:40:00Z"
}
```

#### Postman Example

```
PATCH /services/60d5ec49c1234567890abc21 HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Updated Pipe Repair"
}
```

---

### Endpoint 7: Toggle Service Active Status (Admin)

#### General Information

- **Method:** PATCH
- **Route:** `/services/:id/toggle-active`
- **Description:** Toggle service active/inactive
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Service status updated",
  "data": {
    "_id": "60d5ec49c1234567890abc21",
    "isActive": false
  },
  "timestamp": "2026-06-07T12:45:00Z"
}
```

---

### Endpoint 8: Delete Service (Admin)

#### General Information

- **Method:** DELETE
- **Route:** `/services/:id`
- **Description:** Delete service
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Service deleted successfully",
  "data": null,
  "timestamp": "2026-06-07T12:50:00Z"
}
```

---

### Endpoint 9: Add Comment to Service

#### General Information

- **Method:** POST
- **Route:** `/services/:id/comments`
- **Description:** Add comment/review to service
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Client

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "rating": 5,
  "text": "Excellent service! Very professional and timely."
}
```

#### Validation Rules

| Field    | Type   | Rules                  |
| -------- | ------ | ---------------------- |
| `rating` | number | Required, integer, 1-5 |
| `text`   | string | Required, non-empty    |

#### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "userId": "60d5ec49c1234567890abc12",
    "userName": "Ahmed Mohamed",
    "userAvatar": "https://cdn.example.com/avatars/user123.jpg",
    "rating": 5,
    "text": "Excellent service! Very professional and timely.",
    "createdAt": "2026-06-07T12:55:00Z"
  },
  "timestamp": "2026-06-07T12:55:00Z"
}
```

#### Business Rules

- User must be authenticated
- Only one comment per user per service (update if exists)
- Rating affects service average rating
- Comments are public and visible to all

#### Postman Example

```
POST /services/60d5ec49c1234567890abc21/comments HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "rating": 5,
  "text": "Excellent service!"
}
```

---

### Endpoint 10: Delete Comment from Service

#### General Information

- **Method:** DELETE
- **Route:** `/services/:serviceId/comments/:commentId`
- **Description:** Delete own comment from service
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Client

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "data": null,
  "timestamp": "2026-06-07T13:00:00Z"
}
```

**Unauthorized (403 Forbidden):**

```json
{
  "statusCode": 403,
  "message": "Can only delete your own comments"
}
```

#### Business Rules

- User can only delete their own comments
- Deleting comment updates service average rating

---

## Requests Module

**Base URL:** `/requests`

### Endpoint 1: Create Service Request

#### General Information

- **Method:** POST
- **Route:** `/requests`
- **Description:** Create new service request
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Client

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Urgent plumbing repair",
  "description": "My kitchen sink is leaking water",
  "categoryId": "60d5ec49c1234567890abc20",
  "serviceId": "60d5ec49c1234567890abc21",
  "address": {
    "fullAddress": "123 Main St, Cairo, Egypt",
    "street": "Main St",
    "city": "Cairo",
    "district": "Heliopolis",
    "coordinates": {
      "lat": 30.0897,
      "lng": 31.341
    }
  },
  "preferredDate": "2026-06-10",
  "preferredTime": "14:00"
}
```

#### Validation Rules

| Field                     | Type   | Rules                                  |
| ------------------------- | ------ | -------------------------------------- |
| `title`                   | string | Required, non-empty                    |
| `description`             | string | Required, non-empty                    |
| `categoryId`              | string | Required, valid MongoDB ObjectId       |
| `serviceId`               | string | Required, valid MongoDB ObjectId       |
| `address.fullAddress`     | string | Required                               |
| `address.street`          | string | Optional                               |
| `address.city`            | string | Optional                               |
| `address.district`        | string | Optional                               |
| `address.coordinates.lat` | number | Optional, valid latitude               |
| `address.coordinates.lng` | number | Optional, valid longitude              |
| `preferredDate`           | date   | Required, ISO 8601 format, future date |
| `preferredTime`           | string | Required, time format HH:mm            |

#### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Service request created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc40",
    "title": "Urgent plumbing repair",
    "description": "My kitchen sink is leaking water",
    "userId": "60d5ec49c1234567890abc12",
    "categoryId": "60d5ec49c1234567890abc20",
    "serviceId": "60d5ec49c1234567890abc21",
    "address": {
      "fullAddress": "123 Main St, Cairo, Egypt",
      "street": "Main St",
      "city": "Cairo",
      "district": "Heliopolis",
      "coordinates": {
        "lat": 30.0897,
        "lng": 31.341
      }
    },
    "preferredDate": "2026-06-10T00:00:00Z",
    "preferredTime": "14:00",
    "status": "pending",
    "assignedTechnician": null,
    "createdAt": "2026-06-07T13:05:00Z"
  },
  "timestamp": "2026-06-07T13:05:00Z"
}
```

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "preferredDate",
        "message": "Preferred date must be in the future"
      }
    ]
  },
  "timestamp": "2026-06-07T13:05:00Z"
}
```

#### Business Rules

- Only clients can create requests
- Status starts as "PENDING"
- No technician assigned initially
- Preferred date must be in the future
- Request is broadcast to matching technicians

#### Postman Example

```
POST /requests HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Urgent plumbing repair",
  "description": "Kitchen sink leak",
  "categoryId": "60d5ec49c1234567890abc20",
  "serviceId": "60d5ec49c1234567890abc21",
  "address": {
    "fullAddress": "123 Main St, Cairo"
  },
  "preferredDate": "2026-06-10",
  "preferredTime": "14:00"
}
```

---

### Endpoint 2: Get All Requests (Admin)

#### General Information

- **Method:** GET
- **Route:** `/requests`
- **Description:** Get all service requests (paginated)
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**

```
page (optional, default: 1)
limit (optional, default: 10, max: 100)
status (optional, enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Requests fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc40",
      "title": "Urgent plumbing repair",
      "description": "Kitchen sink leak",
      "userId": {
        "_id": "60d5ec49c1234567890abc12",
        "fullName": "Ahmed Mohamed",
        "phone": "20123456789"
      },
      "service": {
        "_id": "60d5ec49c1234567890abc21",
        "name": "Pipe Repair"
      },
      "status": "pending",
      "preferredDate": "2026-06-10T00:00:00Z",
      "preferredTime": "14:00",
      "assignedTechnician": null,
      "createdAt": "2026-06-07T13:05:00Z"
    }
  ],
  "meta": {
    "total": 145,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2026-06-07T13:10:00Z"
}
```

#### Business Rules

- Admin-only access
- Returns paginated results
- Includes user and service information
- Can filter by status

---

### Endpoint 3: Get Pending Requests

#### General Information

- **Method:** GET
- **Route:** `/requests/pending`
- **Description:** Get pending requests (for technicians)
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician, Admin

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**

```
page (optional, default: 1)
limit (optional, default: 10)
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Pending requests fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc40",
      "title": "Urgent plumbing repair",
      "description": "Kitchen sink leak",
      "client": {
        "_id": "60d5ec49c1234567890abc12",
        "fullName": "Ahmed Mohamed",
        "phone": "20123456789",
        "address": "123 Main St, Cairo"
      },
      "service": {
        "_id": "60d5ec49c1234567890abc21",
        "name": "Pipe Repair",
        "priceRange": {
          "min": 50,
          "max": 200
        }
      },
      "preferredDate": "2026-06-10T00:00:00Z",
      "preferredTime": "14:00",
      "createdAt": "2026-06-07T13:05:00Z"
    }
  ],
  "meta": {
    "total": 23,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2026-06-07T13:15:00Z"
}
```

#### Business Rules

- Shows only unassigned pending requests
- Matched based on technician's specialization and service areas
- Sorted by creation date (oldest first)

---

### Endpoint 4: Get My Requests (Client)

#### General Information

- **Method:** GET
- **Route:** `/requests/my`
- **Description:** Get authenticated client's requests
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Client

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Your requests fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc40",
      "title": "Urgent plumbing repair",
      "status": "pending",
      "service": "Pipe Repair",
      "technician": null,
      "preferredDate": "2026-06-10T00:00:00Z",
      "createdAt": "2026-06-07T13:05:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1
  },
  "timestamp": "2026-06-07T13:20:00Z"
}
```

---

### Endpoint 5: Get Assigned Requests (Technician)

#### General Information

- **Method:** GET
- **Route:** `/requests/assigned`
- **Description:** Get requests assigned to technician
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Assigned requests fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc40",
      "title": "Urgent plumbing repair",
      "status": "in_progress",
      "client": {
        "fullName": "Ahmed Mohamed",
        "phone": "20123456789"
      },
      "preferredDate": "2026-06-10T00:00:00Z",
      "preferredTime": "14:00"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1
  },
  "timestamp": "2026-06-07T13:25:00Z"
}
```

---

### Endpoint 6: Get Request by ID

#### General Information

- **Method:** GET
- **Route:** `/requests/:id`
- **Description:** Get specific request details
- **Authentication Required:** Yes (JWT)
- **Required Roles:** All authenticated users (with access control)

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Request fetched successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc40",
    "title": "Urgent plumbing repair",
    "description": "Kitchen sink is leaking",
    "client": {
      "_id": "60d5ec49c1234567890abc12",
      "fullName": "Ahmed Mohamed",
      "email": "client@example.com",
      "phone": "20123456789"
    },
    "service": {
      "_id": "60d5ec49c1234567890abc21",
      "name": "Pipe Repair"
    },
    "address": {
      "fullAddress": "123 Main St, Cairo"
    },
    "status": "pending",
    "preferredDate": "2026-06-10T00:00:00Z",
    "preferredTime": "14:00",
    "assignedTechnician": null,
    "cancellation": null,
    "createdAt": "2026-06-07T13:05:00Z"
  },
  "timestamp": "2026-06-07T13:30:00Z"
}
```

---

### Endpoint 7: Accept Request (Technician)

#### General Information

- **Method:** PATCH
- **Route:** `/requests/:id/accept`
- **Description:** Accept pending request (mark as assigned)
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Request accepted successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc40",
    "status": "in_progress",
    "assignedTechnician": "60d5ec49c1234567890abc13"
  },
  "timestamp": "2026-06-07T13:35:00Z"
}
```

**Already Assigned (409 Conflict):**

```json
{
  "success": false,
  "message": "Request is already assigned to another technician",
  "data": null,
  "timestamp": "2026-06-07T13:35:00Z"
}
```

#### Business Rules

- Request must be in PENDING status
- Changes status to IN_PROGRESS
- Technician is recorded as assignedTechnician
- Other technicians can no longer accept this request

---

### Endpoint 8: Complete Request (Technician)

#### General Information

- **Method:** PATCH
- **Route:** `/requests/:id/complete`
- **Description:** Mark request as completed
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Technician

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc40",
    "status": "completed",
    "completedAt": "2026-06-10T15:30:00Z"
  },
  "timestamp": "2026-06-07T13:40:00Z"
}
```

**Not Assigned to You (403 Forbidden):**

```json
{
  "statusCode": 403,
  "message": "Can only complete requests assigned to you"
}
```

#### Business Rules

- Only assigned technician can complete
- Changes status to COMPLETED
- Completion timestamp is recorded
- Client can now submit review

---

### Endpoint 9: Update Request Status (Admin)

#### General Information

- **Method:** PATCH
- **Route:** `/requests/:id/status`
- **Description:** Override request status (admin only)
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Request Body:**

```json
{
  "status": "cancelled"
}
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Request status updated",
  "data": {
    "_id": "60d5ec49c1234567890abc40",
    "status": "cancelled"
  },
  "timestamp": "2026-06-07T13:45:00Z"
}
```

---

### Endpoint 10: Cancel Request

#### General Information

- **Method:** PATCH
- **Route:** `/requests/:id/cancel`
- **Description:** Cancel service request
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Client (or admin)

#### Request

**Request Body:**

```json
{
  "reason": "Found another provider"
}
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Request cancelled successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc40",
    "status": "cancelled",
    "cancellation": {
      "cancelledBy": "60d5ec49c1234567890abc12",
      "role": "client",
      "reason": "Found another provider",
      "cancelledAt": "2026-06-07T13:50:00Z"
    }
  },
  "timestamp": "2026-06-07T13:50:00Z"
}
```

#### Business Rules

- Client can cancel only their own requests
- Can only cancel pending or in_progress requests
- Completed or already-cancelled cannot be cancelled again
- Reason is optional
- Technician is notified of cancellation

---

### Endpoint 11: Delete Request (Admin)

#### General Information

- **Method:** DELETE
- **Route:** `/requests/:id`
- **Description:** Delete service request from system
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Request deleted successfully",
  "data": null,
  "timestamp": "2026-06-07T13:55:00Z"
}
```

---

## Reviews Module

**Base URL:** `/reviews`

### Endpoint 1: Create Review

#### General Information

- **Method:** POST
- **Route:** `/reviews`
- **Description:** Submit review for completed request
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Client

#### Request

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "requestId": "60d5ec49c1234567890abc40",
  "rating": 5,
  "comment": "Excellent work! Very professional and prompt service."
}
```

#### Validation Rules

| Field       | Type   | Rules                            |
| ----------- | ------ | -------------------------------- |
| `requestId` | string | Required, valid MongoDB ObjectId |
| `rating`    | number | Required, integer 1-5            |
| `comment`   | string | Optional                         |

#### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc50",
    "userId": "60d5ec49c1234567890abc12",
    "requestId": "60d5ec49c1234567890abc40",
    "technicianId": "60d5ec49c1234567890abc13",
    "serviceId": "60d5ec49c1234567890abc21",
    "rating": 5,
    "comment": "Excellent work! Very professional and prompt service.",
    "createdAt": "2026-06-07T14:00:00Z"
  },
  "timestamp": "2026-06-07T14:00:00Z"
}
```

**Request Not Completed (400 Bad Request):**

```json
{
  "success": false,
  "message": "Can only review completed requests",
  "data": null,
  "timestamp": "2026-06-07T14:00:00Z"
}
```

#### Business Rules

- Only clients can submit reviews
- Request must be completed
- Only one review per request
- Rating is mandatory
- Comment is optional
- Review updates technician's average rating

#### Postman Example

```
POST /reviews HTTP/1.1
Host: api.usta.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "requestId": "60d5ec49c1234567890abc40",
  "rating": 5,
  "comment": "Excellent service!"
}
```

---

### Endpoint 2: Get Reviews for Technician

#### General Information

- **Method:** GET
- **Route:** `/reviews/technician/:id`
- **Description:** Get all reviews for specific technician
- **Authentication Required:** No
- **Required Roles:** None

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc50",
      "userId": "60d5ec49c1234567890abc12",
      "userName": "Ahmed Mohamed",
      "rating": 5,
      "comment": "Excellent work!",
      "createdAt": "2026-06-07T14:00:00Z"
    }
  ],
  "meta": {
    "averageRating": 4.7,
    "totalReviews": 23
  },
  "timestamp": "2026-06-07T14:05:00Z"
}
```

---

### Endpoint 3: Get Reviews for Service

#### General Information

- **Method:** GET
- **Route:** `/reviews/service/:id`
- **Description:** Get all reviews for specific service
- **Authentication Required:** No
- **Required Roles:** None

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc50",
      "technicianName": "Karim Hassan",
      "rating": 5,
      "comment": "Great service!",
      "createdAt": "2026-06-07T14:00:00Z"
    }
  ],
  "meta": {
    "averageRating": 4.5,
    "totalReviews": 12
  },
  "timestamp": "2026-06-07T14:10:00Z"
}
```

---

### Endpoint 4: Update Review

#### General Information

- **Method:** PATCH
- **Route:** `/reviews/:id`
- **Description:** Update own review
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Client

#### Request

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Good service overall"
}
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc50",
    "rating": 4,
    "comment": "Good service overall",
    "updatedAt": "2026-06-07T14:15:00Z"
  },
  "timestamp": "2026-06-07T14:15:00Z"
}
```

---

### Endpoint 5: Delete Review

#### General Information

- **Method:** DELETE
- **Route:** `/reviews/:id`
- **Description:** Delete own review
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Client

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null,
  "timestamp": "2026-06-07T14:20:00Z"
}
```

---

## Admin Module

**Base URL:** `/admin`

### Endpoint 1: Get All Users (Admin)

#### General Information

- **Method:** GET
- **Route:** `/admin/users`
- **Description:** Get all users with filtering and pagination
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Query Parameters:**

```
page (optional, default: 1)
limit (optional, default: 10)
role (optional, enum: client, technician, admin)
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc12",
      "fullName": "Ahmed Mohamed",
      "email": "client@example.com",
      "phone": "20123456789",
      "role": "client",
      "isVerified": true,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 245,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2026-06-07T14:25:00Z"
}
```

---

### Endpoint 2: Get User by ID (Admin)

#### General Information

- **Method:** GET
- **Route:** `/admin/users/:id`
- **Description:** Get specific user details
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc12",
    "fullName": "Ahmed Mohamed",
    "email": "client@example.com",
    "phone": "20123456789",
    "role": "client",
    "gender": "male",
    "governorate": "Cairo",
    "city": "Giza",
    "isVerified": true,
    "createdAt": "2026-01-15T10:00:00Z",
    "totalRequests": 5,
    "totalReviews": 4,
    "averageRating": 4.5
  },
  "timestamp": "2026-06-07T14:30:00Z"
}
```

---

### Endpoint 3: Get Pending Technicians (Admin)

#### General Information

- **Method:** GET
- **Route:** `/admin/technicians/pending`
- **Description:** Get technicians awaiting verification
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Pending technicians fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc30",
      "user": {
        "_id": "60d5ec49c1234567890abc13",
        "fullName": "Karim Hassan",
        "email": "technician@example.com",
        "phone": "20198765432"
      },
      "specialization": {
        "categoryName": "Plumbing"
      },
      "yearsOfExperience": 5,
      "verificationStatus": "pending",
      "currentStep": 5,
      "submittedAt": "2026-06-05T10:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1
  },
  "timestamp": "2026-06-07T14:35:00Z"
}
```

---

### Endpoint 4: Get Technician by ID (Admin)

#### General Information

- **Method:** GET
- **Route:** `/admin/technicians/:id`
- **Description:** Get technician details for review/approval
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Technician fetched successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc30",
    "user": {
      "_id": "60d5ec49c1234567890abc13",
      "fullName": "Karim Hassan",
      "email": "technician@example.com",
      "phone": "20198765432",
      "governorate": "Cairo",
      "city": "New Cairo",
      "gender": "male"
    },
    "specialization": {
      "category": "Plumbing",
      "services": ["Pipe Repair", "Installation"]
    },
    "yearsOfExperience": 5,
    "hasTools": true,
    "hasTransportation": true,
    "serviceAreas": ["Cairo", "Giza"],
    "documents": {
      "personalImage": "uploads/technician/user_id/personalImage.jpg",
      "idFrontImage": "uploads/technician/user_id/idFrontImage.jpg",
      "idBackImage": "uploads/technician/user_id/idBackImage.jpg",
      "certificateImage": "uploads/technician/user_id/certificateImage.pdf"
    },
    "verificationStatus": "pending",
    "totalRequests": 0,
    "averageRating": 0
  },
  "timestamp": "2026-06-07T14:40:00Z"
}
```

---

### Endpoint 5: Approve Technician (Admin)

#### General Information

- **Method:** PATCH
- **Route:** `/admin/technicians/:id/approve`
- **Description:** Approve technician for platform
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Technician approved successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc30",
    "verificationStatus": "approved",
    "verifiedAt": "2026-06-07T14:45:00Z",
    "isAvailable": true
  },
  "timestamp": "2026-06-07T14:45:00Z"
}
```

#### Business Rules

- Technician must be in PENDING status
- Notification email sent to technician
- Technician becomes available for requests
- Can accept service requests

---

### Endpoint 6: Reject Technician (Admin)

#### General Information

- **Method:** PATCH
- **Route:** `/admin/technicians/:id/reject`
- **Description:** Reject technician application
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Request Body:**

```json
{
  "reason": "Incomplete documentation. Please resubmit with all required certifications."
}
```

#### Validation Rules

| Field    | Type   | Rules                      |
| -------- | ------ | -------------------------- |
| `reason` | string | Required, 5-300 characters |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Technician rejected successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc30",
    "verificationStatus": "rejected",
    "rejectionReason": "Incomplete documentation. Please resubmit with all required certifications."
  },
  "timestamp": "2026-06-07T14:50:00Z"
}
```

#### Business Rules

- Reason is required and visible to technician
- Technician can reapply after rejection
- Notification sent with rejection reason
- Technician cannot accept requests while rejected

---

### Endpoint 7: Get All Technicians (Admin)

#### General Information

- **Method:** GET
- **Route:** `/admin/technicians`
- **Description:** Get all approved technicians
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Technicians fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc30",
      "user": {
        "fullName": "Karim Hassan",
        "email": "technician@example.com"
      },
      "specialization": "Plumbing",
      "averageRating": 4.7,
      "totalRequests": 28,
      "isAvailable": true,
      "verificationStatus": "approved"
    }
  ],
  "meta": {
    "total": 87,
    "page": 1
  },
  "timestamp": "2026-06-07T14:55:00Z"
}
```

---

### Endpoint 8: Promote User to Admin

#### General Information

- **Method:** PATCH
- **Route:** `/admin/users/:id/set-admin-role`
- **Description:** Grant admin privileges to user
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User promoted to admin",
  "data": {
    "_id": "60d5ec49c1234567890abc12",
    "fullName": "Ahmed Mohamed",
    "role": "admin"
  },
  "timestamp": "2026-06-07T15:00:00Z"
}
```

#### Business Rules

- User role changes from client/technician to admin
- No confirmation required
- Notify promoted user of new role
- One-way change (cannot be reversed through this endpoint)

---

## Emergency Module

**Base URL:** `/emergency` and `/admin/emergency`

### Endpoint 1: Get Emergency Numbers (Public)

#### General Information

- **Method:** GET
- **Route:** `/emergency`
- **Description:** Get emergency contact numbers (public)
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Query Parameters:**

```
type (optional, enum: URGENT, UTILITIES, SOCIAL)
page (optional, default: 1)
limit (optional, default: 10)
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Emergency numbers fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc60",
      "type": "URGENT",
      "name": "Police",
      "phone": "122",
      "description": "Police emergency line",
      "icon": "🚨"
    },
    {
      "_id": "60d5ec49c1234567890abc61",
      "type": "UTILITIES",
      "name": "Gas Leak",
      "phone": "129",
      "description": "Gas emergency service"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2026-06-07T15:05:00Z"
}
```

---

### Endpoint 2: Add Emergency Number (Admin)

#### General Information

- **Method:** POST
- **Route:** `/admin/emergency`
- **Description:** Add new emergency contact
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Request

**Request Body:**

```json
{
  "type": "URGENT",
  "name": "Ambulance",
  "phone": "123",
  "description": "Medical emergency",
  "icon": "🚑"
}
```

#### Validation Rules

| Field         | Type   | Rules                                          |
| ------------- | ------ | ---------------------------------------------- |
| `type`        | enum   | Required, must be URGENT, UTILITIES, or SOCIAL |
| `name`        | string | Required, non-empty                            |
| `phone`       | string | Required, valid phone format                   |
| `description` | string | Optional                                       |
| `icon`        | string | Optional                                       |

#### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Emergency number added successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc99",
    "type": "URGENT",
    "name": "Ambulance",
    "phone": "123",
    "description": "Medical emergency",
    "icon": "🚑",
    "createdAt": "2026-06-07T15:10:00Z"
  },
  "timestamp": "2026-06-07T15:10:00Z"
}
```

---

### Endpoint 3: Update Emergency Number (Admin)

#### General Information

- **Method:** PATCH
- **Route:** `/admin/emergency/:id`
- **Description:** Update emergency contact
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Emergency number updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abc60",
    "type": "URGENT",
    "name": "Police",
    "phone": "122",
    "updatedAt": "2026-06-07T15:15:00Z"
  },
  "timestamp": "2026-06-07T15:15:00Z"
}
```

---

### Endpoint 4: Delete Emergency Number (Admin)

#### General Information

- **Method:** DELETE
- **Route:** `/admin/emergency/:id`
- **Description:** Delete emergency contact
- **Authentication Required:** Yes (JWT)
- **Required Roles:** Admin

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Emergency number deleted successfully",
  "data": null,
  "timestamp": "2026-06-07T15:20:00Z"
}
```

---

## Chat/AI Assistant Module

**Base URL:** `/chat`

### Endpoint 1: Send Message to AI

#### General Information

- **Method:** POST
- **Route:** `/chat`
- **Description:** Send message to AI assistant
- **Authentication Required:** No
- **Required Roles:** None

#### Request

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "I need plumbing assistance, my sink is leaking"
}
```

#### Validation Rules

| Field     | Type   | Rules               |
| --------- | ------ | ------------------- |
| `message` | string | Required, non-empty |

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Message processed successfully",
  "data": {
    "response": "I can help you find a plumber! Based on your message, you need a plumbing service for a sink leak. Would you like me to help you request a service? I can connect you with available plumbers in your area.",
    "suggestions": [
      {
        "action": "create_request",
        "label": "Create Service Request"
      },
      {
        "action": "view_services",
        "label": "Browse Plumbing Services"
      }
    ]
  },
  "timestamp": "2026-06-07T15:25:00Z"
}
```

**Processing Error (500 Internal Server Error):**

```json
{
  "success": false,
  "message": "Failed to process message",
  "data": null,
  "timestamp": "2026-06-07T15:25:00Z"
}
```

#### Business Rules

- Public endpoint (no authentication required)
- AI uses multiple providers (OpenAI, Groq)
- Responses include contextual suggestions
- Message history is stored for conversation context (if enabled)
- Rate limiting: 10 messages per minute per IP

#### Postman Example

```
POST /chat HTTP/1.1
Host: api.usta.com
Content-Type: application/json

{
  "message": "I need plumbing help"
}
```

---

## Enums Reference

### UserRole

```typescript
enum UserRole {
  CLIENT = 'client', // Regular user requesting services
  TECHNICIAN = 'technician', // Service provider
  ADMIN = 'admin', // System administrator
}
```

### AuthProvider

```typescript
enum AuthProvider {
  LOCAL = 'local', // Email/password authentication
  GOOGLE = 'google', // Google OAuth
}
```

### Gender

```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}
```

### VerificationStatus (Technician)

```typescript
enum VerificationStatus {
  INCOMPLETE = 'incomplete', // Initial state, steps not complete
  PENDING = 'pending', // All steps done, awaiting admin review
  APPROVED = 'approved', // Approved, can accept requests
  REJECTED = 'rejected', // Rejected by admin, can reapply
}
```

### RequestStatus

```typescript
enum RequestStatus {
  PENDING = 'pending', // Waiting for technician to accept
  IN_PROGRESS = 'in_progress', // Technician accepted, working on it
  COMPLETED = 'completed', // Service completed
  CANCELLED = 'cancelled', // Cancelled by client or admin
}
```

### EmergencyType

```typescript
enum EmergencyType {
  URGENT = 'URGENT', // Police, ambulance, fire
  UTILITIES = 'UTILITIES', // Gas, electricity, water
  SOCIAL = 'SOCIAL', // Social services
}
```

### WorkingDay

```typescript
enum WorkingDay {
  SATURDAY = 'السبت',
  SUNDAY = 'الأحد',
  MONDAY = 'الاثنين',
  TUESDAY = 'الثلاثاء',
  WEDNESDAY = 'الأربعاء',
  THURSDAY = 'الخميس',
  FRIDAY = 'الجمعة',
}
```

---

## Response Format

All API responses follow a standardized format:

### Success Response

```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    /* actual response data */
  },
  "meta": {
    "total": 100, // optional, for paginated responses
    "page": 1, // optional
    "limit": 10 // optional
  },
  "timestamp": "2026-06-07T15:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2026-06-07T15:30:00Z"
}
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "fieldName",
        "message": "Validation error description"
      }
    ]
  },
  "timestamp": "2026-06-07T15:30:00Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning               | When Used                                  |
| ---- | --------------------- | ------------------------------------------ |
| 200  | OK                    | Successful GET, PATCH, PUT operations      |
| 201  | Created               | Successful POST operations                 |
| 400  | Bad Request           | Validation errors, missing required fields |
| 401  | Unauthorized          | Missing or invalid JWT token               |
| 403  | Forbidden             | User lacks required permissions/role       |
| 404  | Not Found             | Resource doesn't exist                     |
| 409  | Conflict              | Duplicate entry, resource conflict         |
| 413  | Payload Too Large     | File upload exceeds size limit             |
| 500  | Internal Server Error | Server-side error                          |

### Common Error Messages

| Error                    | Cause               | Solution                           |
| ------------------------ | ------------------- | ---------------------------------- |
| Unauthorized             | Missing/Invalid JWT | Include valid Authorization header |
| Forbidden resource       | Insufficient role   | Check user role requirements       |
| Validation failed        | Invalid input       | Review field validations           |
| Resource not found       | Invalid ID          | Verify resource ID exists          |
| Email already registered | Duplicate email     | Use different email                |
| Invalid MongoDB ID       | Malformed ObjectId  | Use valid 24-char hex string       |
| File size exceeds limit  | Upload too large    | Reduce file size to <5MB           |

---

## Role-Based Access Control

### Client Permissions

- Register/Login
- View profile and update personal info
- Create service requests
- View own requests
- Cancel own requests
- Submit reviews for completed requests
- View technicians and services
- Chat with AI assistant

### Technician Permissions

- Register/Login and complete registration steps
- View profile
- Update specialization, experience, service areas
- View pending requests
- Accept/Complete assigned requests
- Cannot create requests or approve others

### Admin Permissions

- View all users and technicians
- Approve/Reject technician applications
- Create/Update/Delete categories and services
- View all requests and override status
- Manage emergency numbers
- Promote users to admin
- Full system access

---

## Authentication Details

### JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "client|technician|admin",
  "iat": 1623050400,
  "exp": 1623054000
}

Signature:
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Token Expiration

- Access Token: 1 hour
- Refresh Token: 7 days (or configurable)

### Bearer Token Usage

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Rate Limiting

| Endpoint          | Limit         | Window    |
| ----------------- | ------------- | --------- |
| Auth endpoints    | 5 per minute  | Per IP    |
| Forgot password   | 3 per hour    | Per email |
| Chat/AI           | 10 per minute | Per IP    |
| Regular endpoints | 60 per minute | Per user  |

---

## Data Validation Patterns

### Email Validation

- Must be valid email format: `user@example.com`
- Must be unique (except OAuth duplicate check)

### Phone Validation

- Egypt format: 11 digits starting with 2
- Format: `20123456789`

### MongoDB ObjectId

- 24 hexadecimal characters
- Example: `60d5ec49c1234567890abc12`

### Date/Time

- ISO 8601 format for dates: `2026-06-10`
- 24-hour time format: `14:00`
- Timestamps: `2026-06-07T15:30:00Z`

---

**End of API Documentation**

_This documentation is generated from actual source code and reflects current implementation as of 2026-06-07._
