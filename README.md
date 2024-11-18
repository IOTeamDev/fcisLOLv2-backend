# FCIS LOL API Documentation
 
## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Users](#users)
4. [Materials](#materials)
5. [Announcements](#announcements)
6. [Leaderboard](#leaderboard)

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
    "type": "Assignment | Quiz | Other",
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
