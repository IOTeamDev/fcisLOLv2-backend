# FCIS LOL API Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Users](#users)
4. [Materials](#materials)
5. [Announcements](#announcements)
6. [Previous Exams](#previous-exams)
7. [Leaderboard](#leaderboard)
8. [Useful Links](#useful-links)
9. [Verification](#verification)

## Introduction

This document provides detailed information about the FCIS LOL API endpoints, their functionality, required parameters, and expected responses.

## Authentication

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### POST /api/login

Authenticate a user and obtain a JWT token.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

- **200 OK:** Returns a JWT token and user data.
- **400 Bad Request:** If email or password is missing or invalid.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "message": "success",
  "token": "Bearer <token>",
  "user": {
    "name": "string",
    "email": "string",
    "semester": "string",
    "role": "string",
    "photo": "string | null"
  }
}
```

### GET /api/me

Retrieve the currently authenticated user's data.

**Headers:**

- Authorization: Bearer token

**Response:**

- **200 OK:** Returns user data.
- **401 Unauthorized:** If the token is invalid or missing.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "semester": "string",
  "role": "string",
  "phone": "string | null",
  "photo": "string | null"
}
```

### PATCH /api/me/edit

Updates the authenticated user's profile information.

**Headers:**

- `Authorization`: Bearer token required for authentication

**Request Body:**

```json
{
  "name": "New Name",           // optional
  "email": "new@email.com",     // optional
  "phone": "1234567890",        // optional
  "photo": "photo_url",         // optional
  "semester": "One",            // optional
  "oldPassword": "old",         // optional
  "newPassword": "new",         // optional
  "newPasswordConfirm": "new"   // optional
}
```

## Users

### POST /api/users

Create a new user account.

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "semester": "One | Two | Three | Four | Five | Six | Seven | Eight",
  "phone": "string (optional)",
  "photo": "string (optional)",
  "fcmToken": "string (optional)"
}
```

**Response:**

- **200 OK:** Returns created user data and JWT token.
- **400 Bad Request:** If there are validation errors.
- **500 Internal Server Error:** If there is an issue with the server or if a user already exists with the provided email.

**Example Response:**

```json
{
  "message": "success",
  "token": "Bearer <token>",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "semester": "string",
    "role": "STUDENT",
    "score": 0,
    "photo": "string | null"
  }
}
```

### GET /api/users

Retrieve user information. Note: Password is always excluded from responses.

**Query Parameters:**

- `id` (optional): ID of the user to retrieve.
- `haveMaterial` (optional): "true" or "false" to include user's materials.

**Response:**

- **200 OK:** Returns user data or list of users.
- **404 Not Found:** If the user is not found (when ID is provided).
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response (single user):**

```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "semester": "string",
  "role": "string",
  "score": "number",
  "photo": "string | null",
  "material": [] // Only included if haveMaterial=true
}
```

**Example Response (multiple users):**

```json
[
  {
    "id": "number",
    "name": "string",
    "email": "string",
    "semester": "string",
    "role": "string",
    "score": "number",
    "photo": "string | null",
    "material": [] // Only included if haveMaterial=true
  }
]
```

### PUT /api/users

Update an existing user account. Note: Only admins can update any user's data, while regular users can only update their own account.

**Query Parameters:**

- `id`: ID of the user to update.

**Headers:**

- Authorization: Bearer token

**Request Body (all fields optional):**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "semester": "One | Two | Three | Four | Five | Six | Seven | Eight",
  "phone": "string",
  "photo": "string"
}
```

**Response:**

- **200 OK:** Returns the updated user data.
- **400 Bad Request:** If there are validation errors or missing ID.
- **401 Unauthorized:** If the token is invalid or missing, or if the user is not authorized to update the account.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "semester": "string",
  "role": "string",
  "score": "number",
  "photo": "string | null"
}
```

### PATCH /api/users

Update a user's last active timestamp. Note: Users can only update their own last active status.

**Query Parameters:**

- `id`: User ID (required)

**Headers:**

- Authorization: Bearer token (required)

**Response:**

- **200 OK:** Returns updated user data
- **400 Bad Request:** If user ID is missing
- **401 Unauthorized:** If token is invalid or user tries to update another user's status
- **500 Internal Server Error:** If there is an issue with the server

**Example Response:**

```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "semester": "string",
  "role": "string",
  "lastActive": "string (ISO date)",
  "phone": "string | null",
  "photo": "string | null"
}
```

### DELETE /api/users

Delete a user account. This operation can only be performed by users with DEV role or by the account owner themselves. When a user is deleted, all their materials are transferred to a system account (ID 0).

**Query Parameters:**

- `id`: ID of the user to delete.

**Headers:**

- Authorization: Bearer token

**Response:**

- **200 OK:** Returns the deleted user's data and confirmation message.
- **400 Bad Request:** If the user ID is missing.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the requester doesn't have permission to delete the account (not owner or DEV).
- **403 Forbidden:** If attempting to delete the system account (ID 0).
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "message": "User deleted successfully",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "semester": "string",
    "role": "string",
    "score": "number",
    "photo": "string | null"
  }
}
```

## Materials

### GET /api/material

Retrieve material information.

**Query Parameters:**

- `accepted`: "true" or "false" (required)
- Either `subject` OR `semester` is required (cannot use both):
  - `subject`: Filter materials by subject
  - `semester`: Filter materials by semester

**Response:**

- **200 OK:** Returns a list of materials.
- **400 Bad Request:** If required parameters are missing or invalid.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
[
  {
    "id": "number",
    "subject": "string",
    "link": "string",
    "type": "DOCUMENT | VIDEO | OTHER",
    "title": "string",
    "description": "string | null",
    "author": {
      "id": "number",
      "name": "string",
      "photo": "string | null"
    }
  }
]
```

### POST /api/material

Create a new material entry. Note: Materials posted by admins are automatically accepted and the admin receives a score point.

**Headers:**

- Authorization: Bearer token

**Request Body:**

```json
{
  "subject": "string",
  "link": "string",
  "type": "DOCUMENT | VIDEO | OTHER",
  "semester": "One | Two | Three | Four | Five | Six | Seven | Eight",
  "title": "string",
  "description": "string (optional)"
}
```

**Response:**

- **201 Created:** Returns the created material.
- **400 Bad Request:** If there are validation errors.
- **401 Unauthorized:** If the token is invalid or missing.
- **500 Internal Server Error:** If there is an issue with the server.

### PATCH /api/material/edit

Updates an existing material resource. Only users with the ADMIN role can perform this operation.

**Headers:**

- `Authorization`: Bearer token required for authentication and authorization.

**Request Body:**

```json
{
  "id": 1, // required, the unique identifier of the material to update
  "subject": "SUBJECT_NAME", // optional
  "link": "https://example.com/resource", // optional
  "type": "MATERIAL_TYPE", // optional
  "semester": "SEMESTER_VALUE", // optional
  "title": "Resource Title", // optional
  "description": "Detailed description of the material" // optional
}
```

**Response:**

- **200 OK:**
  **Example Response**

```json
{
  "success": true,
  "material": {
    "id": 1,
    "subject": "SUBJECT_NAME",
    "link": "https://example.com/resource",
    "type": "MATERIAL_TYPE",
    "semester": "SEMESTER_VALUE",
    "title": "Resource Title",
    "description": "Detailed description of the material"
  }
}
```

### PUT /api/material/accept

Update the accepted status of a material (Admin only). Note: When a material is accepted, the author receives a score point.

**Query Parameters:**

- `id`: ID of the material to update.
- `accepted`: "true" or "false"

**Headers:**

- Authorization: Bearer token

**Response:**

- **200 OK:** Returns the updated material.
- **400 Bad Request:** If there are invalid parameters.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user is not an admin.
- **500 Internal Server Error:** If there is an issue with the server.

### GET /api/specificMaterial

Retrieve a specific material by ID.

**Query Parameters:**

- `id`: ID of the material to retrieve.

**Response:**

- **200 OK:** Returns the material.
- **400 Bad Request:** If the ID is missing.
- **500 Internal Server Error:** If there is an issue with the server.

### DELETE /api/material

Delete a material entry.

**Headers:**

- Authorization: Bearer token

**Request Body:**

```json
{
  "id": "number"
}
```

**Response:**

- **200 OK:** Returns a success message.
- **400 Bad Request:** If the material ID is missing.
- **401 Unauthorized:** If the token is invalid or missing.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "message": "Material deleted"
}
```

## Announcements

### GET /api/announcements

Retrieve announcement information.

**Query Parameters:**

- `id` (optional): ID of the announcement to retrieve.
- `semester` (optional): Filter announcements by semester.

**Response:**

- **200 OK:** Returns announcement data.
- **404 Not Found:** If the announcement is not found (when ID is provided).
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
[
  {
    "id": "number",
    "title": "string",
    "content": "string",
    "due_date": "DateTime | null",
    "type": "Assignment | Quiz | Practical | Final | Workshop | Summer_Training | Faculty | Other",
    "semester": "string",
    "image": "string | null"
  }
]
```

### POST /api/announcements

Create a new announcement (Admin only).

**Headers:**

- Authorization: Bearer token

**Request Body:**

```json
{
  "title": "string",
  "content": "string",
  "due_date": "2021-09-30T00:00:00.000Z", (optional)
  "type": "Assignment | Quiz | Other",
  "semester": "One | Two | Three | Four | Five | Six | Seven | Eight",
  "image": "string (optional)"
}
```

**Response:**

- **201 Created:** Returns the created announcement.
- **400 Bad Request:** If there are validation errors.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user is not an admin.
- **500 Internal Server Error:** If there is an issue with the server.

### PUT /api/announcements

Update an existing announcement (Admin only).

**Query Parameters:**

- `id`: ID of the announcement to update.

**Headers:**

- Authorization: Bearer token

**Request Body:**
Same as POST, all fields optional.

**Response:**

- **200 OK:** Returns the updated announcement.
- **400 Bad Request:** If there are validation errors.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user is not an admin.
- **404 Not Found:** If the announcement is not found.
- **500 Internal Server Error:** If there is an issue with the server.

### DELETE /api/announcements

Delete an announcement (Admin only).

**Query Parameters:**

- `id`: ID of the announcement to delete.

**Headers:**

- Authorization: Bearer token

**Response:**

- **200 OK:** Returns the deleted announcement details.
- **400 Bad Request:** If the ID is missing.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user is not an admin.
- **500 Internal Server Error:** If there is an issue with the server.

### GET /api/announcements/deleteExpired

Delete expired announcements automatically (system endpoint).

**Response:**

- **200 OK:** Returns the number of deleted announcements
- **500 Internal Server Error:** If there is an issue with the server

## Previous Exams

### GET /api/previousExams

Retrieve previous exam information.

**Query Parameters:**

- `accepted`: "true" or "false" (required)
- Either `subject` OR `semester` is required (cannot use both):
  - `subject`: Filter exams by subject
  - `semester`: Filter exams by semester

**Response:**

- **200 OK:** Returns a list of previous exams.
- **400 Bad Request:** If required parameters are missing or invalid.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
[
  {
    "id": "number",
    "title": "string",
    "link": "string",
    "type": "Mid | Final | Other",
    "subject": "string",
    "createdAt": "date"
  }
]
```

### POST /api/previousExams

Create a new previous exam entry. Note: Exams posted by admins are automatically accepted and the admin receives a score point.

**Headers:**

- Authorization: Bearer token

**Request Body:**

```json
{
  "subject": "string", // required
  "link": "string", // required
  "type": "Mid | Final | Other", // required
  "semester": "One | Two | Three | Four | Five | Six | Seven | Eight", // required
  "title": "string" // required
}
```

**Response:**

- **201 Created:** Returns the created exam.
- **400 Bad Request:** If there are validation errors.
- **401 Unauthorized:** If the token is invalid or missing.
- **500 Internal Server Error:** If there is an issue with the server.

### DELETE /api/previousExams

Delete a previous exam entry. Only users with ADMIN or DEV roles can perform this operation.

**Headers:**

- Authorization: Bearer token

**Request Body:**

```json
{
  "id": "number"
}
```

**Response:**

- **200 OK:** Returns a success message.
- **400 Bad Request:** If the exam ID is missing.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user doesn't have ADMIN or DEV role.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "message": "Exam deleted"
}
```

### GET /api/previousExams/specificExam

Retrieve a specific previous exam by ID.

**Query Parameters:**

- `id`: ID of the exam to retrieve.

**Response:**

- **200 OK:** Returns the exam.
- **400 Bad Request:** If the ID is missing.
- **500 Internal Server Error:** If there is an issue with the server.

### PATCH /api/previousExams/edit

Updates an existing previous exam. Only users with ADMIN or DEV roles can perform this operation.

**Headers:**

- `Authorization`: Bearer token required for authentication and authorization.

**Request Body:**

```json
{
  "id": 1, // required, the unique identifier of the exam to update
  "Subject": "SUBJECT_NAME", // optional
  "link": "https://example.com/resource", // optional
  "Type": "Mid | Final | Other", // optional
  "Semester": "SEMESTER_VALUE", // optional
  "title": "Exam Title" // optional
}
```

**Response:**

- **200 OK:**
  **Example Response**

```json
{
  "success": true,
  "exam": {
    "id": 1,
    "subject": "SUBJECT_NAME",
    "link": "https://example.com/resource",
    "type": "Mid | Final | Other",
    "semester": "SEMESTER_VALUE",
    "title": "Exam Title",
    "accepted": true
  }
}
```

### GET /api/previousExams/accept

Update the accepted status of a previous exam. Only users with ADMIN or DEV roles can perform this operation.

**Query Parameters:**

- `id`: ID of the exam to update.
- `accepted`: "true" or "false"

**Headers:**

- Authorization: Bearer token

**Response:**

- **200 OK:** Returns the updated exam.
- **400 Bad Request:** If there are invalid parameters.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user doesn't have ADMIN or DEV role.
- **500 Internal Server Error:** If there is an issue with the server.

## Leaderboard

### GET /api/leaderboard

Fetch the current leaderboard data.

**Query Parameters:**

- `semester`: Filter leaderboard by semester.

**Response:**

- **200 OK:** Returns leaderboard data.
- **400 Bad Request:** If the semester is invalid.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
[
  {
    "id": "number",
    "name": "string",
    "score": "number"
  }
]
```

## Useful Links

### GET /api/usefulLinks

Retrieve useful links information.

**Query Parameters:**

- `id` (optional): ID of the specific useful link to retrieve.
- `semester` (optional): Filter useful links by semester.
- `subject` (optional): Filter useful links by subject.
- `isGeneral` (optional): Filter useful links by general status ("true" or "false").

**Response:**

- **200 OK:** Returns useful link data or list of useful links.
- **404 Not Found:** If the useful link is not found (when ID is provided).
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
[
  {
    "id": "number",
    "link": "string",
    "subject": "string",
    "semester": "string",
    "isGeneral": "boolean"
  }
]
```

### POST /api/usefulLinks

Create a new useful link (DEV role only).

**Headers:**

- Authorization: Bearer token

**Request Body:**

```json
{
  "link": "string",
  "subject": "string",
  "semester": "One | Two | Three | Four | Five | Six | Seven | Eight",
  "isGeneral": "boolean (optional, defaults to false)"
}
```

**Response:**

- **201 Created:** Returns the created useful link.
- **400 Bad Request:** If there are validation errors.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user doesn't have DEV role.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "id": "number",
  "link": "string",
  "subject": "string",
  "semester": "string",
  "isGeneral": "boolean"
}
```

### PUT /api/usefulLinks

Update an existing useful link (DEV role only).

**Query Parameters:**

- `id`: ID of the useful link to update.

**Headers:**

- Authorization: Bearer token

**Request Body:**

```json
{
  "link": "string (optional)",
  "subject": "string (optional)",
  "semester": "One | Two | Three | Four | Five | Six | Seven | Eight (optional)",
  "isGeneral": "boolean (optional)"
}
```

**Response:**

- **200 OK:** Returns the updated useful link.
- **400 Bad Request:** If there are validation errors or missing ID.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user doesn't have DEV role.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "id": "number",
  "link": "string",
  "subject": "string",
  "semester": "string",
  "isGeneral": "boolean"
}
```

### DELETE /api/usefulLinks

Delete a useful link (DEV role only).

**Query Parameters:**

- `id`: ID of the useful link to delete.

**Headers:**

- Authorization: Bearer token

**Response:**

- **200 OK:** Returns the deleted useful link.
- **400 Bad Request:** If the ID parameter is missing.
- **401 Unauthorized:** If the token is invalid or missing.
- **403 Forbidden:** If the user doesn't have DEV role.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response:**

```json
{
  "id": "number",
  "link": "string",
  "subject": "string",
  "semester": "string",
  "isGeneral": "boolean"
}
```

## Verification

### POST /api/verificationCode/send

Send a verification code (OTP) to a user's email. The code is stored in the database and expires after 15 minutes.

**Request Body:**

```json
{
  "recipientEmail": "string",
  "recipientName": "string (optional)"
}
```

**Response:**

- **200 OK:** Returns success message.
- **400 Bad Request:** If recipientEmail is missing.
- **500 Internal Server Error:** If there is an issue with sending the email or the server.

**Example Response:**

```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

### POST /api/verificationCode/check

Verify an OTP code sent to a user's email. If verification is successful and the user exists in the database, their account will be marked as verified.

**Request Body:**

```json
{
  "email": "string",
  "otp": "string"
}
```

**Response:**

- **200 OK:** Returns success message if verification is successful.
- **400 Bad Request:** If email or OTP is missing, invalid, expired, or not found.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response (Success):**

```json
{
  "success": true,
  "message": "Verification successful"
}
```

**Example Response (Error):**

```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

### POST /api/resetPassword

Reset a user's password using a verification code (OTP) previously sent to their email.

**Request Body:**

```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

**Response:**

- **200 OK:** Returns success message if the password was reset successfully.
- **400 Bad Request:** If email, OTP, or new password is missing or invalid.
- **404 Not Found:** If no user with the given email exists.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Response (Success):**

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Example Response (Error):**

```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

**Notes:**
- The password reset process requires first requesting a verification code via the `/api/verificationCode/send` endpoint.
- The OTP must be valid and not expired.
- The new password must be at least 6 characters long.
- After a successful password reset, the verification code is deleted and cannot be reused.
