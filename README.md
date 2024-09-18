# API Documentation

## `/api/users`

### GET
**Description:** Retrieve user information. You can either get a specific user by ID or all users.

**Request Parameters:**
- **id** (optional): ID of the user to retrieve.
- **haveMaterial** (default: false): true, false to get the material along with the user

**Response:**
- **200 OK:** Returns the user data excluding the password.
- **404 Not Found:** User not found (if an ID is provided).
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
GET /api/users?id=1&haveMaterial=true
```

**Example Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "photo": "http://example.com/photo.jpg",
  "semester": "One",
  "role": "STUDENT",
  "material": []
}
```

### POST
**Description:** Create a new user.

**Request Body:**
- **name**: User's name.
- **email**: User's email.
- **password**: User's password.
- **semester**: User's semester (must be one of the defined enum values).
- **phone** (optional): User's phone number.
- **photo** (optional): URL of the user's photo.

**Response:**
- **201 Created:** Returns the created user data excluding the password.
- **400 Bad Request:** Validation errors.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
POST /api/users
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "password123",
  "semester": "Two"
}
```

**Example Response:**
```json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": null,
  "photo": null,
  "semester": "Two",
  "role": "STUDENT",
  "material": []
}
```

### PUT
**Description:** Update an existing user.

**Request Parameters:**
- **id**: ID of the user to update.

**Request Body:**
- **name**: User's name.
- **email**: User's email.
- **password**: User's password.
- **semester**: User's semester (must be one of the defined enum values).
- **phone** (optional): User's phone number.
- **photo** (optional): URL of the user's photo.

**Response:**
- **200 OK:** Returns the updated user data excluding the password.
- **400 Bad Request:** Validation errors.
- **401 Unauthorized:** If the request is unauthorized.
- **404 Not Found:** User not found.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
PUT /api/users?id=1
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "password": "newpassword123",
  "semester": "Three"
}
```

**Example Response:**
```json
{
  "id": 1,
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "1234567890",
  "photo": "http://example.com/photo.jpg",
  "semester": "Three",
  "role": "STUDENT",
  "material": []
}
```

## `/api/me`

### GET
**Description:** Retrieve the currently authenticated user data.

**Request Headers:**
- **Authorization**: Bearer token.

**Response:**
- **200 OK:** Returns the user data excluding the password.
- **401 Unauthorized:** If the request is unauthorized.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
GET /api/me
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "photo": "http://example.com/photo.jpg",
  "semester": "One",
  "role": "STUDENT",
  "material": []
}
```

## `/api/material`

### GET
**Description:** Retrieve material information by subject or semester

**Request Parameters:**
- **accepted**: true or false
-
- **subject**: Subject to filter materials.
- or
- **semester**: Semester to filter materials

### NOTE
- if subject exists, semester will not be used

**Response:**
- **200 OK:** Returns a list of materials.
- **400 Bad Request:** If the subject is missing or invalid.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
GET /api/material?subject=CALC_1&accepted=true
```

**Example Response:**
```json
[
  {
    "link": "http://example.com/material1",
    "type": "YOUTUBE"
    "author": {
      "name": "bomba"
    }
  }
]
```

**Example Request:**
```http
GET /api/material?semester=One&accepted=false
```

**Example Response:**
```json
[
  {
    "link": "http://example.com/material1",
    "type": "YOUTUBE",
    "subject": "CALC_1"
    "author": {
      "name": "bomba"
    }
  }
]
```


### POST
**Description:** Create a new material entry.

**Request Headers:**
- **Authorization**: Bearer token.

**Request Body:**
- **subject**: Subject of the material.
- **link**: Link to the material.
- **type**: Type of material (must be one of the defined enum values).
- **semester**:

**Response:**
- **201 Created:** Returns the created material.
- **400 Bad Request:** Validation errors or missing authorization.
- **401 Unauthorized:** If the request is unauthorized.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
POST /api/material
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "CALC_1",
  "link": "http://example.com/newmaterial",
  "type": "DRIVE"
  "semester": "One"
}
```

**Example Response:**
```json
{
  "id": 1,
  "subject": "CALC_1",
  "link": "http://example.com/newmaterial",
  "type": "DRIVE",
  "authorId": 1
}
```

### DELETE
**Description:** Delete a material entry.

**Request Headers:**
- **Authorization**: Bearer token.

**Request Body:**
- **id**: ID of the material to delete.

**Response:**
- **200 OK:** Confirmation of deletion.
- **400 Bad Request:** If the ID is missing or invalid.
- **401 Unauthorized:** If the request is unauthorized.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
DELETE /api/material
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": 1
}
```

**Example Response:**
```json
{
  "message": "Material deleted"
}
```
## `/api/material/accept`
### GET
**Description:** Authorizes the request and updates the `accepted` status of a material by its ID.

**Request Parameters:**
- **id**: ID of the material to update. (Required)
- **accepted**: The new `accepted` status (`true` or `false`). (Required)

**Headers:**
- **Authorization**: `Bearer {token}` (Required)

**Response:**
- **200 OK:** Returns the updated material.
- **400 Bad Request:** If the `id` or `accepted` status is missing or invalid.
- **401 Unauthorized:** If the request is unauthorized or if the token is missing/invalid.
- **403 Forbidden:** If the user does not have the required admin role.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
GET /api/materials?id=1&accepted=true
Authorization: Bearer <token>
```
***Example response***
```json
{
  "id": 1,
  "subject": "CALC_1",
  "link": "http://example.com",
  "type": "YOUTUBE",
  "accepted": true
}
```
## `/api/specificMaterial`
request: pass an `id` parameter
response: material of the id
(Too lazy to write another doc)

## `/api/login`

### POST
**Description:** Authenticate a user and obtain a JWT token.

**Request Body:**
- **email**: User's email.
- **password**: User's password.

**Response:**
- **200 OK:** Returns a JWT token and user data.
- **400 Bad Request:** If email or password is missing.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
POST /api/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Example Response:**
```json
{
  "message": "success",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "level": "One",
    "phone": "1234567890"
  }
}
```
## `/api/leaderboard`

#### Description

Fetches the current leaderboard data, which includes a list of participants, their points, and the associated semester.

#### Response

The response will be a JSON array of objects, each representing a participant on the leaderboard. The structure of each object is as follows:

- **id** (integer): A unique identifier for the participant.
- **name** (string): The name of the participant.
- **score** (integer): The number of points the participant has accumulated.
  
#### Example

**Request:**

```http
GET /api/leaderboard?semester=One
```

**Response:**

```json
[
    {
        "id": 1,
        "name": "q",
        "score": 1,
    },
    {
        "id": 2,
        "name": "bomba",
        "score": 4,
    }
]
```

#### Notes

- Ensure that the response data is sorted by points in descending order if required.
- The `semester` field may be used to filter or sort the leaderboard based on the specific semester.

## `/api/announcements`

### GET
**Description:** Retrieve announcement information. You can either get a specific announcement by ID or all announcements.

**Request Parameters:**
- **id** (optional): ID of the announcement to retrieve.

**Response:**
- **200 OK:** Returns the announcement data.
- **404 Not Found:** Announcement not found (if an ID is provided).
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
GET /api/announcements?id=1
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Assignment 1",
  "content": "Details about Assignment 1.",
  "due_date": "...",
  "type": "Assignment",
  "semester": "One"
}
```

### POST
**Description:** Create a new announcement.

**Request Body:**
- **title**: Title of the announcement.
- **content**: Content of the announcement.
- **due_date** due date
- **type**: Type of the announcement (  Assignment, Quiz, Other ).
- **semester**: Semester of the announcement (must be one of the defined enum values).

**Response:**
- **201 Created:** Returns the created announcement.
- **400 Bad Request:** Validation errors.
- **401 Unauthorized:** If the request is unauthorized.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
POST /api/announcements
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Quiz",
  "content": "Details about the new quiz.",
  "due_date": "...",
  "type": "Quiz",
  "semester": "Two"
}
```

**Example Response:**
```json
{
  "id": 1,
  "title": "New Quiz",
  "content": "Details about the new quiz.",
  "due_date": "due_date",
  "type": "Quiz",
  "semester": "Two"
}
```

### PUT
**Description:** Update an existing announcement.

**Request Parameters:**
- **id**: ID of the announcement to update.

**Request Body:**
- **title** (optional): Title of the announcement.
- **content** (optional): Content of the announcement.
- **due_date** due_date
- **type** (optional): Type of the announcement (must be one of the defined enum values).
- **semester** (optional): Semester of the announcement (must be one of the defined enum values).

**Response:**
- **200 OK:** Returns the updated announcement.
- **400 Bad Request:** Validation errors.
- **401 Unauthorized:** If the request is unauthorized.
- **404 Not Found:** Announcement not found.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
PUT /api/announcements?id=1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Assignment",
  "content": "Updated details about the assignment.",
  "due_date": "due_date",
  "type": "Assignment",
  "semester": "Three"
}
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Updated Assignment",
  "content": "Updated details about the assignment.",
  "due_date": "due_date",
  "type": "Assignment",
  "semester": "Three"
}
```

### DELETE
**Description:** Delete an announcement by its ID.

**Request Parameters:**
- **id**: ID of the announcement to delete.

**Response:**
- **200 OK:** Returns the deleted announcement details.
- **400 Bad Request:** If the ID parameter is missing.
- **401 Unauthorized:** If the request is unauthorized.
- **403 Forbidden:** If the user does not have the required permissions.
- **500 Internal Server Error:** If there is an issue with the server.

**Example Request:**
```http
DELETE /api/announcements?id=1
Authorization: Bearer <token>
```
***Example Response***
```http
{
  "id": 1,
  "title": "Sample Announcement",
  "content": "Details about the announcement.",
  "due_date": "2024-01-01T00:00:00.000Z",
  "type": "...",
  "semester": "..."
}
```

### Notes
- **Authorization:** For POST and PUT requests, include an `Authorization` header with a Bearer token.
- **Validation:** Ensure that the `type` and `semester` fields match the defined enum values.
- **Error Handling:** Responses include specific error messages for validation issues, unauthorized access, and internal server errors.
