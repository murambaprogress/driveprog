# Loan Application Document Upload - API Documentation

## Problem
Images are uploaded from the frontend but don't show in the loan application documents list.

## Root Cause
The backend document upload functionality works correctly, but the frontend needs to:
1. Upload documents to the correct endpoint
2. Associate documents with the correct application ID

## Solution

### Backend Endpoints

#### 1. Upload Documents
**Endpoint:** `POST /api/loans/documents/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `application_id`: ID of the loan application (number)
- `document_type`: Type of document (string) - Options:
  - `photo_vin_sticker`
  - `photo_odometer`
  - `photo_borrower`
  - `photo_front_car`
  - `photo_vin_plate`
  - `photo_license`
  - `photo_insurance`
  - `id`
  - `income`
  - `address`
  - `vehicle_title`
  - `other`
- `title`: Document title (string)
- `file`: The image/document file (file)
- `description`: Optional description (string)

**Example Request (using JavaScript fetch):**
```javascript
const formData = new FormData();
formData.append('application_id', applicationId);
formData.append('document_type', 'photo_front_car');
formData.append('title', 'Front of Car Photo');
formData.append('file', imageFile);
formData.append('description', 'Photo taken during application');

fetch('/api/loans/documents/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "document_type": "photo_front_car",
  "title": "Front of Car Photo",
  "file": "/media/loan_documents/2025/11/02/car_front.jpg",
  "description": "Photo taken during application",
  "uploaded_at": "2025-11-02T15:49:17.433869Z",
  "is_analyzed": false,
  "ai_analysis_result": null
}
```

#### 2. Get Application Documents
**Endpoint:** `GET /api/loans/applications/{id}/`

**Response includes documents:**
```json
{
  "id": 180,
  "application_id": "uuid-here",
  ...
  "documents": [
    {
      "id": 1,
      "document_type": "photo_front_car",
      "title": "Front of Car Photo",
      "file": "/media/loan_documents/2025/11/02/car_front.jpg",
      "uploaded_at": "2025-11-02T15:49:17.433869Z"
    }
  ],
  "document_summary": {
    "total_count": 1,
    "document_types": ["Front of Car Photo"],
    "has_documents": true
  }
}
```

## Frontend Fix Required

### Current Issue
The frontend likely uploads images during the loan application create/update process, but doesn't separately POST to the documents endpoint.

### Required Changes

1. **After Creating/Updating Loan Application:**
   - Get the application ID from the response
   - For each image file the user uploaded, make a separate POST request to `/api/loans/documents/`

2. **Example Flow:**

```javascript
// Step 1: Create/Update loan application
const response = await fetch('/api/loans/applications/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(loanData)
});

const application = await response.json();
const applicationId = application.id;

// Step 2: Upload each document/image
const documents = [
  { file: frontCarImage, type: 'photo_front_car', title: 'Front of Car' },
  { file: vinImage, type: 'photo_vin_sticker', title: 'VIN Sticker' },
  { file: odometerImage, type: 'photo_odometer', title: 'Odometer' },
  // ... more documents
];

for (const doc of documents) {
  if (doc.file) {
    const formData = new FormData();
    formData.append('application_id', applicationId);
    formData.append('document_type', doc.type);
    formData.append('title', doc.title);
    formData.append('file', doc.file);
    
    await fetch('/api/loans/documents/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
  }
}
```

## Verification

After uploading documents, verify they appear:

```javascript
// Get application with documents
const response = await fetch(`/api/loans/applications/${applicationId}/`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log('Documents:', data.documents);
console.log('Document Summary:', data.document_summary);
```

## Testing

Run this test to verify backend functionality:
```bash
python test_document_upload.py
```

Expected output: ✅ Document upload functionality is working correctly!