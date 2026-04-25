# Klipit Pro API Documentation

## 🔹 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

### Bearer Token
All protected endpoints require an Authorization header:

```
Authorization: Bearer <token>
```

### Token Acquisition
Tokens are obtained via login or registration endpoints.

---

## 📍 Endpoints

### 1. Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### Login
```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 2. Clipboard Operations

#### Create Clipboard
```http
POST /clipboard
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "This is my clipboard content",
  "isPublic": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "handle": "ABC123",
    "content": "This is my clipboard content",
    "isPublic": true,
    "expiresIn": "24 hours",
    "link": "http://localhost:3000/ABC123"
  }
}
```

---

#### Get Clipboard Content
```http
GET /clipboard/{handle}
```

**Example:**
```http
GET /clipboard/ABC123
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "handle": "ABC123",
    "content": "This is my clipboard content",
    "is_public": true,
    "created_at": "2024-04-25T10:30:00Z",
    "expires_at": "2024-04-26T10:30:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Clipboard not found or expired"
}
```

---

#### Update Clipboard Content
```http
PUT /clipboard/{handle}
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Updated clipboard content"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "handle": "ABC123",
    "content": "Updated clipboard content",
    "is_public": true,
    "created_at": "2024-04-25T10:30:00Z",
    "updated_at": "2024-04-25T11:00:00Z",
    "expires_at": "2024-04-26T10:30:00Z"
  }
}
```

---

#### Delete Clipboard
```http
DELETE /clipboard/{handle}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Clipboard deleted successfully"
}
```

---

#### Generate QR Code
```http
GET /clipboard/{handle}/qr
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "handle": "ABC123",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "url": "http://localhost:3000/ABC123"
  }
}
```

---

### 3. File Operations

#### Upload File to Clipboard
```http
POST /uploads/{clipboardHandle}
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data:**
- `file`: (binary) File to upload

**Response (201 Created):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileId": "550e8400-e29b-41d4-a716-446655440002",
    "filename": "document.pdf",
    "size": 2048576,
    "mimeType": "application/pdf",
    "uploadedAt": "2024-04-25T10:30:00Z"
  }
}
```

---

#### Get Clipboard Files
```http
GET /uploads/{clipboardHandle}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "filename": "document.pdf",
      "file_size": 2048576,
      "mime_type": "application/pdf",
      "created_at": "2024-04-25T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "filename": "image.jpg",
      "file_size": 1024576,
      "mime_type": "image/jpeg",
      "created_at": "2024-04-25T10:35:00Z"
    }
  ]
}
```

---

#### Delete File
```http
DELETE /uploads/{fileId}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 🔍 Query Parameters

### Pagination (Future Implementation)
```http
GET /clipboard?page=1&limit=10
```

### Filters
```http
GET /clipboard?isPublic=true&sortBy=created_at
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Permission denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📋 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal server error |

---

## 🧪 Testing with cURL

### Create Clipboard
```bash
curl -X POST http://localhost:5000/api/clipboard \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello World",
    "isPublic": true
  }'
```

### Get Clipboard
```bash
curl http://localhost:5000/api/clipboard/ABC123
```

### Generate QR Code
```bash
curl http://localhost:5000/api/clipboard/ABC123/qr
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Upload File
```bash
curl -X POST http://localhost:5000/api/uploads/ABC123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/file.pdf"
```

---

## 🔌 WebSocket Endpoints (Future)

```javascript
// Real-time clipboard updates
ws://localhost:5000/api/clipboard/{handle}

socket.on('content-updated', (data) => {
  console.log('Clipboard updated:', data);
});
```

---

## 📱 Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Remaining`

---

## 🔒 Security Headers

The API includes these security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## 📖 SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Create clipboard
async function createClipboard() {
  try {
    const res = await api.post('/clipboard', {
      content: 'Hello World',
      isPublic: true
    });
    console.log('Clipboard:', res.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Python

```python
import requests

BASE_URL = 'http://localhost:5000/api'

def create_clipboard(content):
    response = requests.post(f'{BASE_URL}/clipboard', json={
        'content': content,
        'isPublic': True
    })
    return response.json()

print(create_clipboard('Hello World'))
```

---

**API Version**: 1.0.0  
**Last Updated**: 2026
