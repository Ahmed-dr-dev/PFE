# Student API Endpoints Documentation

This document describes all API endpoints available for student features.

## Base URL
All endpoints are prefixed with `/api/student`

## Authentication
All endpoints require authentication. The user must be logged in via Supabase Auth.

---

## Endpoints

### 1. Get Available Topics
**GET** `/api/student/topics`

Returns all approved PFE topics available for students to apply.

**Response:**
```json
{
  "topics": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "department": "string",
      "status": "approved",
      "created_at": "timestamp",
      "professor_id": "uuid",
      "professor": {
        "id": "uuid",
        "full_name": "string",
        "email": "string"
      }
    }
  ]
}
```

---

### 2. Apply to a Topic
**POST** `/api/student/topics/apply`

Submit an application for a PFE topic.

**Request Body:**
```json
{
  "topicId": "uuid"
}
```

**Response:**
```json
{
  "application": {
    "id": "uuid",
    "student_id": "uuid",
    "topic_id": "uuid",
    "status": "pending",
    "submitted_at": "timestamp"
  }
}
```

**Errors:**
- `400` - Already has a PFE or already applied
- `404` - Topic not found

---

### 3. Get My PFE
**GET** `/api/student/my-pfe`

Get the student's current PFE project with topic and supervisor information.

**Response:**
```json
{
  "pfe": {
    "id": "uuid",
    "status": "in_progress",
    "progress": 65,
    "start_date": "date",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "topic": {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "department": "string"
    },
    "supervisor": {
      "id": "uuid",
      "full_name": "string",
      "email": "string",
      "phone": "string",
      "department": "string",
      "office": "string",
      "office_hours": "string",
      "bio": "string",
      "expertise": ["string"]
    }
  }
}
```

**Response (no PFE):**
```json
{
  "pfe": null
}
```

---

### 4. Get Supervision Information
**GET** `/api/student/supervision`

Get supervisor details, meetings, and shared documents.

**Response:**
```json
{
  "supervisor": {
    "id": "uuid",
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "department": "string",
    "office": "string",
    "office_hours": "string",
    "bio": "string",
    "expertise": ["string"]
  },
  "meetings": [
    {
      "id": "uuid",
      "date": "date",
      "time": "time",
      "duration": 60,
      "type": "Suivi",
      "status": "planned",
      "notes": "string",
      "location": "string"
    }
  ],
  "documents": [
    {
      "id": "uuid",
      "name": "string",
      "file_path": "string",
      "file_type": "string",
      "file_size": 123456,
      "category": "string",
      "status": "pending",
      "uploaded_at": "timestamp"
    }
  ]
}
```

---

### 5. Get Documents
**GET** `/api/student/documents`

Get all documents for the student's PFE project.

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "name": "string",
      "file_path": "string",
      "file_type": "PDF",
      "file_size": 123456,
      "category": "Cahier des charges",
      "status": "approved",
      "uploaded_at": "timestamp",
      "uploaded_by": "uuid",
      "uploader": {
        "full_name": "string"
      }
    }
  ]
}
```

---

### 6. Upload Document
**POST** `/api/student/documents`

Upload a document to the student's PFE project.

**Request:** `multipart/form-data`
- `file` - File to upload
- `category` - Document category (optional)

**Response:**
```json
{
  "document": {
    "id": "uuid",
    "name": "string",
    "file_path": "string",
    "file_type": "PDF",
    "file_size": 123456,
    "category": "string",
    "status": "pending",
    "uploaded_at": "timestamp"
  }
}
```

**Note:** Requires Supabase Storage bucket `pfe-documents` to be set up.

---

### 7. Delete Document
**DELETE** `/api/student/documents/[id]`

Delete a document (only if owned by the student).

**Response:**
```json
{
  "success": true
}
```

---

### 8. Get Calendar Events
**GET** `/api/student/calendar`

Get calendar events for the student's PFE project.

**Query Parameters:**
- `month` - Month number (1-12)
- `year` - Year (e.g., 2024)

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "date": "date",
      "time": "time",
      "type": "meeting",
      "location": "string"
    }
  ]
}
```

---

### 9. Get Profile
**GET** `/api/student/profile`

Get the student's profile information.

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "role": "student",
    "department": "string",
    "year": "5ème année",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

---

### 10. Update Profile
**PUT** `/api/student/profile`

Update the student's profile information.

**Request Body:**
```json
{
  "full_name": "string",
  "phone": "string",
  "department": "string",
  "year": "string"
}
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "department": "string",
    "year": "string",
    "updated_at": "timestamp"
  }
}
```

---

### 11. Get Applications
**GET** `/api/student/applications`

Get all topic applications submitted by the student.

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "status": "pending",
      "submitted_at": "timestamp",
      "reviewed_at": "timestamp",
      "topic": {
        "id": "uuid",
        "title": "string",
        "description": "string",
        "department": "string",
        "professor": {
          "id": "uuid",
          "full_name": "string",
          "email": "string"
        }
      }
    }
  ]
}
```

---

### 12. Get Milestones
**GET** `/api/student/milestones`

Get project milestones for the student's PFE.

**Response:**
```json
{
  "milestones": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "pending",
      "due_date": "date",
      "completed_date": "date",
      "order_index": 0
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Non authentifié"
}
```

**400 Bad Request:**
```json
{
  "error": "Error message"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Erreur serveur"
}
```

---

## Usage Examples

### Fetch Topics
```typescript
const response = await fetch('/api/student/topics')
const { topics } = await response.json()
```

### Apply to Topic
```typescript
const response = await fetch('/api/student/topics/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topicId: 'uuid' })
})
const { application } = await response.json()
```

### Upload Document
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('category', 'Rapports')

const response = await fetch('/api/student/documents', {
  method: 'POST',
  body: formData
})
const { document } = await response.json()
```

---

## Notes

- All timestamps are in ISO 8601 format
- File uploads require the `pfe-documents` storage bucket to be configured
- Students can only have one active PFE project at a time
- Document deletion only works for documents uploaded by the student
- All endpoints use Supabase RLS policies for security
