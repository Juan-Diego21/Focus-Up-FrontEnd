# Frontend Integration Guide - Backend Security Refactoring

## 📋 Overview

The backend has undergone comprehensive security hardening. All changes maintain backward compatibility for existing functionality while significantly improving security. This guide outlines all changes that affect frontend integration.

## 🔐 Authentication & Authorization Changes

### ✅ **Available Authentication Endpoints**

All authentication endpoints are now centralized under `/api/v1/auth/` prefix:

```javascript
// Login
POST /api/v1/auth/login
Content-Type: application/json
{
  "correo": "user@example.com", // or "nombre_usuario": "username"
  "contrasena": "password123"
}

// Response
{
  "success": true,
  "message": "Autenticación exitosa",
  "token": "jwt_token_here",
  "userId": 123,
  "username": "johndoe",
  "user": { /* user object */ },
  "timestamp": "2025-12-13T..."
}

// Logout
POST /api/v1/auth/logout
Authorization: Bearer <jwt_token>

// Register (after email verification)
POST /api/v1/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123"
}
```

### ⚠️ **Security Enhancements**

- **Rate Limiting**: 5 login attempts per 15 minutes per IP
- **JWT Tokens**: Include token versioning for secure logout
- **Input Validation**: All inputs validated with Zod schemas
- **CORS**: Restricted to `localhost:8081`, `localhost:5173`, and `localhost:3001`

## 🚫 Removed Endpoints (Security Risk)

### **Dangerous User Management Endpoints**

The following endpoints have been **completely removed** for security reasons:

```javascript
// ❌ REMOVED - Security Risk
GET    /api/v1/users/:id           // Get any user by ID
GET    /api/v1/users/email/:email  // Get user by email
PUT    /api/v1/users/:id           // Update any user by ID
DELETE /api/v1/users/:id           // Delete any user by ID
```

## ✅ Updated/Secure User Endpoints

### **Profile Management (Authenticated User Only)**

```javascript
// Get own profile
GET /api/v1/users
Authorization: Bearer <jwt_token>

// Response
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id_usuario": 123,
    "nombre_usuario": "johndoe",
    "correo": "user@example.com",
    "pais": "Colombia",
    "genero": "Masculino",
    "fecha_nacimiento": "2000-01-01",
    "horario_fav": "08:00",
    "fecha_creacion": "2025-01-01",
    "fecha_actualizacion": "2025-12-01"
  },
  "timestamp": "2025-12-13T..."
}

// Update own profile
PUT /api/v1/users
Authorization: Bearer <jwt_token>
Content-Type: application/json
{
  "nombre_usuario": "newusername",
  "pais": "Colombia",
  "genero": "Masculino",
  "fecha_nacimiento": "2000-01-01",
  "horario_fav": "08:00",
  "intereses": [1, 2, 3],
  "distracciones": [1, 2]
}

// Change password (secure - only own password)
PATCH /api/v1/users/:userId/password
Authorization: Bearer <jwt_token>
Content-Type: application/json
{
  "currentPassword": "oldpassword123",
  "newPassword": "NewSecurePass123"
}
```

## 🔄 Unchanged Endpoints

### **Password Reset (Still Available)**

```javascript
// Request password reset
POST /api/v1/users/request-password-reset
Content-Type: application/json
{
  "emailOrUsername": "user@example.com"
}

// Reset with code
POST /api/v1/users/reset-password-with-code
Content-Type: application/json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

### **Other Endpoints (No Changes)**

- `GET /api/v1/health` - Health check
- `GET /api/v1/users/:userId/sessions` - User sessions
- All `/api/v1/beneficios/`, `/api/v1/metodos-estudio/`, etc. endpoints remain unchanged

## 🛡️ Security Changes Affecting Frontend

### **1. CORS Policy**

```javascript
// Frontend must run on allowed origins:
✅ http://localhost:8081  // Your main frontend
✅ http://localhost:5173  // Alternative dev port
✅ http://localhost:3001  // API server itself
✅ Any localhost:* or 127.0.0.1:* (development)
```

### **2. Input Validation**

All API inputs are now strictly validated. Frontend should expect:

```javascript
// Validation errors return:
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "field": "correo",
      "message": "Formato de email inválido"
    }
  ],
  "timestamp": "2025-12-13T..."
}
```

### **3. Authentication Flow**

- JWT tokens now include version numbers for secure logout
- Tokens are invalidated immediately on logout (not just on expiration)
- Rate limiting applies to login attempts

### **4. Error Handling**

All endpoints now return standardized error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2025-12-13T..."
}
```

## 🔧 Required Frontend Changes

### **1. Update API Calls**

```javascript
// ❌ OLD - Remove these calls
fetch("/api/v1/users/123"); // Get other user
fetch("/api/v1/users/123", { method: "PUT" }); // Update other user

// ✅ NEW - Use these instead
fetch("/api/v1/users", {
  // Get own profile
  headers: { Authorization: `Bearer ${token}` },
});
fetch("/api/v1/users", {
  // Update own profile
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(profileData),
});
```

### **2. Authentication Endpoints**

```javascript
// Update auth endpoints to use /auth prefix
const login = async (credentials) => {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

const logout = async () => {
  await fetch("/api/v1/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};
```

### **3. Error Handling Updates**

```javascript
// Handle new validation error format
const handleApiResponse = (response) => {
  if (!response.success) {
    if (response.errors) {
      // Handle validation errors
      const errorMessages = response.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join("\n");
      showValidationErrors(errorMessages);
    } else {
      // Handle general errors
      showError(response.message);
    }
  }
};
```

### **4. CORS Considerations**

- Ensure frontend runs on allowed ports (`8081`, `5173`, or `3001`)
- Handle CORS preflight requests properly
- Swagger UI available at `http://localhost:3001/api-docs/`

## 📊 API Response Format

### **Standardized Response Structure**

All endpoints now return responses in this format:

```javascript
{
  "success": boolean,
  "message": string,
  "data"?: any,        // Present on success
  "error"?: string,    // Present on error
  "token"?: string,    // Present on login
  "userId"?: number,   // Present on login
  "username"?: string, // Present on login
  "user"?: object,     // Present on login
  "timestamp": string
}
```

## ✅ Migration Checklist

- [ ] Update all authentication API calls to use `/api/v1/auth/` prefix
- [ ] Remove calls to deleted endpoints (`GET/PUT/DELETE /users/:id`)
- [ ] Update profile management to use `GET/PUT /users` (own profile only)
- [ ] Implement proper error handling for validation errors
- [ ] Ensure frontend runs on allowed CORS origins
- [ ] Test authentication flow with new rate limiting
- [ ] Update API documentation references

## 🚀 Benefits for Frontend

1. **Enhanced Security**: No risk of accessing other users' data
2. **Better Error Handling**: Detailed validation error messages
3. **Rate Limiting Protection**: Automatic protection against brute force
4. **Standardized Responses**: Consistent API response format
5. **Improved CORS**: More permissive for development

## 📞 Support

If you encounter any issues with the updated API:

1. Check the Swagger documentation at `http://localhost:3001/api-docs/`
2. Verify CORS origin settings
3. Ensure JWT tokens are properly included in requests
4. Check browser console for detailed error messages

The backend now provides enterprise-grade security while maintaining all necessary functionality for your frontend application.
