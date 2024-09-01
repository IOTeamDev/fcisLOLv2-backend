# Api Docs

### `/api/users`

#### **GET**
- **Description:** Retrieve all users or a specific user by ID.
- **Query Parameters:**
  - `id` (optional): User ID to fetch a specific user.
- **Responses:**
  - **200 OK:** Returns a list of users or a single user object.
  - **404 Not Found:** User not found (if `id` is provided).
  - **500 Internal Server Error:** On unexpected errors.

#### **POST**
- **Description:** Create a new user.
- **Request Body:**
  - `name`: User's name (string, required).
  - `email`: User's email (string, required).
  - `password`: User's password (string, required).
  - `level`: User's level (one of the values from `Level`, required).
- **Responses:**
  - **201 Created:** Returns the created user object.
  - **400 Bad Request:** Validation error.
  - **500 Internal Server Error:** On unexpected errors.

#### **PUT**
- **Description:** Update an existing user.
- **Query Parameters:**
  - `id`: User ID to update.
- **Request Body:**
  - `name`: User's name (string, required).
  - `email`: User's email (string, required).
  - `password`: User's password (string, required).
  - `level`: User's level (one of the values from `Level`, required).
- **Responses:**
  - **200 OK:** Returns the updated user object.
  - **400 Bad Request:** Validation error.
  - **500 Internal Server Error:** On unexpected errors.

---

### `/api/login`

#### **POST**
- **Description:** Authenticate a user and generate a JWT token.
- **Request Body:**
  - `email`: User's email (string, required).
  - `password`: User's password (string, required).
- **Responses:**
  - **200 OK:** Returns a JWT token and user information.
  - **400 Bad Request:** Invalid credentials.
  - **500 Internal Server Error:** On unexpected errors.

---

### `/api/material`

#### **GET**
- **Description:** Retrieve materials based on subject.
- **Query Parameters:**
  - `subject`: Subject to filter materials.
- **Responses:**
  - **200 OK:** Returns a list of materials.
  - **400 Bad Request:** Missing or invalid subject.
  - **500 Internal Server Error:** On unexpected errors.

#### **POST**
- **Description:** Create a new material.
- **Request Body:**
  - `subject`: Subject of the material (one of the values from `Subjects`, required).
  - `link`: Link to the material (string, required).
  - `type`: Type of material (one of the values from `MaterialType`, required).
  - `authorId`: ID of the author (number, required).
- **Responses:**
  - **201 Created:** Returns the created material object.
  - **400 Bad Request:** Validation errors or unauthorized.
  - **401 Unauthorized:** Token missing or invalid.
  - **500 Internal Server Error:** On unexpected errors.

#### **DELETE**
- **Description:** Delete a material.
- **Request Body:**
  - `id`: ID of the material to delete (number, required).
  - `authorId`: ID of the author (number, required).
- **Responses:**
  - **200 OK:** Confirmation message.
  - **400 Bad Request:** Missing material ID or unauthorized.
  - **401 Unauthorized:** Token missing or invalid.
  - **500 Internal Server Error:** On unexpected errors.

---

### `/api/leaderboard`

#### **GET**
- **Description:** Retrieve the leaderboard sorted by points in ascending order.
- **Responses:**
  - **200 OK:** Returns a list of leaderboard entries.
  - **500 Internal Server Error:** On unexpected errors.

---

### `/api/announcements`

#### **GET**
- **Description:** Retrieve all announcements or a specific announcement by ID.
- **Query Parameters:**
  - `id` (optional): Announcement ID to fetch a specific announcement.
- **Responses:**
  - **200 OK:** Returns a list of announcements or a single announcement object.
  - **404 Not Found:** Announcement not found (if `id` is provided).
  - **500 Internal Server Error:** On unexpected errors.

#### **POST**
- **Description:** Create a new announcement.
- **Request Body:**
  - `title`: Title of the announcement (string, required).
  - `content`: Content of the announcement (string, required).
  - `thumbnail`: Optional thumbnail URL (string).
  - `type`: Type of the announcement (one of the values from `AnnouncementType`, required).
  - `level`: Level associated with the announcement.
- **Responses:**
  - **201 Created:** Returns the created announcement object.
  - **400 Bad Request:** Validation error.
  - **500 Internal Server Error:** On unexpected errors.

#### **PUT**
- **Description:** Update an existing announcement.
- **Query Parameters:**
  - `id`: Announcement ID to update.
- **Request Body:**
  - `title`: Title of the announcement (string, required).
  - `content`: Content of the announcement (string, required).
  - `thumbnail`: Optional thumbnail URL (string).
  - `type`: Type of the announcement (one of the values from `AnnouncementType`, required).
- **Responses:**
  - **200 OK:** Returns the updated announcement object.
  - **400 Bad Request:** Validation error.
  - **500 Internal Server Error:** On unexpected errors.
