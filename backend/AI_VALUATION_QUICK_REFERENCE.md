# AI Car Valuation - Quick Reference

## Setup (5 minutes)

### 1. Get OpenAI API Key

```
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key
```

### 2. Configure Environment

```env
# Add to backend/.env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-vision-preview
```

### 3. Install & Migrate

```bash
cd backend
pip install openai requests
python manage.py migrate loans
python manage.py runserver
```

---

## API Quick Start

### Analyze Vehicle Images

**Endpoint:**

```
POST /api/loans/applications/{id}/analyze_vehicle/
```

**cURL:**

```bash
curl -X POST \
  http://localhost:8000/api/loans/applications/123/analyze_vehicle/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@car_front.jpg" \
  -F "images=@car_side.jpg" \
  -F "images=@car_interior.jpg"
```

**Python:**

```python
import requests

url = f"http://localhost:8000/api/loans/applications/{app_id}/analyze_vehicle/"
headers = {"Authorization": f"Bearer {token}"}
files = [
    ("images", open("car_front.jpg", "rb")),
    ("images", open("car_side.jpg", "rb")),
]

response = requests.post(url, headers=headers, files=files)
result = response.json()

print(f"Vehicle: {result['analysis']['vehicle']}")
print(f"Value: ${result['analysis']['valuation']['estimated_average']}")
print(f"Approved: {result['analysis']['loan_assessment']['is_approved']}")
```

**JavaScript (React):**

```javascript
const analyzeVehicle = async (applicationId, imageFiles) => {
  const formData = new FormData();
  imageFiles.forEach((file) => {
    formData.append("images", file);
  });

  const response = await axios.post(
    `/api/loans/applications/${applicationId}/analyze_vehicle/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
```

---

## Response Structure

```json
{
  "success": true,
  "analysis": {
    "vehicle": {
      "make": "Toyota",
      "model": "Camry",
      "year": "2020"
    },
    "valuation": {
      "estimated_average": "20250.00"
    },
    "loan_assessment": {
      "ltv_ratio": "74.07",
      "max_loan_amount": "16200.00",
      "is_approved": true
    },
    "risk": {
      "level": "low"
    }
  }
}
```

---

## Image Guidelines

### ✅ Good Images

- Front, side, rear views
- Full vehicle in frame
- Natural daylight
- Clear, focused
- 800x600+ pixels

### ❌ Avoid

- Blurry/dark images
- Partial views
- Heavy filters
- Extreme angles

---

## Approval Logic

### LTV Calculation

```
LTV = (Loan Amount / Vehicle Value) × 100
```

### Decision Matrix

| LTV Ratio | Decision       | Action        |
| --------- | -------------- | ------------- |
| ≤ 80%     | ✅ Approved    | Process loan  |
| 81-90%    | ⚠️ Conditional | Request docs  |
| > 90%     | ❌ Denied      | Reduce amount |

### Condition Multipliers

- Excellent: 85% of value
- Good: 80% of value
- Fair: 70% of value
- Poor: 60% of value

---

## Admin Access

### View Valuations

```
Django Admin → Loans → Vehicle Valuations
```

### Filter Options

- Risk level
- Approval status
- Condition
- Date range

### Manual Override

1. Find valuation in admin
2. Edit `is_approved_for_loan`
3. Update `approval_notes`
4. Save changes

---

## Testing

### Test Analysis

```python
from loans.car_image_analyzer import CarValuationService

service = CarValuationService()
result = service.evaluate_for_loan(
    image_paths=['test_car.jpg'],
    requested_loan_amount=15000.0
)
print(result)
```

### Test Images

Place test images in: `backend/test_images/`

---

## Common Issues

### "API key not configured"

```bash
# Check .env file exists
cat backend/.env | grep OPENAI

# Restart server
python manage.py runserver
```

### "Error analyzing images"

- Check image format (JPG/PNG)
- Verify file size < 20MB
- Ensure clear, full vehicle view

### Low Confidence

- Upload more images (3-5 recommended)
- Improve lighting
- Get closer, clearer shots

---

## Cost Tracking

### Per Analysis

- 3 images: ~$0.03
- Market lookup: ~$0.01
- **Total: ~$0.04**

### Monthly Estimates

- 100 apps: $4
- 500 apps: $20
- 1000 apps: $40

### Monitor Usage

```
OpenAI Dashboard → Usage → API Usage
```

---

## Integration Checklist

- [ ] Get OpenAI API key
- [ ] Add key to `.env`
- [ ] Install packages (`openai`, `requests`)
- [ ] Run migrations
- [ ] Test with sample images
- [ ] Configure rate limiting
- [ ] Set up error logging
- [ ] Train staff on image guidelines
- [ ] Monitor API costs
- [ ] Document approval overrides

---

## Support Resources

- **Full Docs:** `AI_CAR_VALUATION_SYSTEM.md`
- **System Docs:** `LOAN_APPLICATION_SYSTEM.md`
- **Quick Start:** `QUICK_START_GUIDE.md`
- **OpenAI Docs:** https://platform.openai.com/docs

---

## Sample Frontend Component

```jsx
import React, { useState } from "react";
import axios from "axios";

const VehicleImageUpload = ({ applicationId }) => {
  const [images, setImages] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    setAnalyzing(true);
    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    try {
      const response = await axios.post(
        `/api/loans/applications/${applicationId}/analyze_vehicle/`,
        formData
      );
      setResult(response.data.analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages([...e.target.files])}
      />
      <button onClick={handleUpload} disabled={analyzing}>
        {analyzing ? "Analyzing..." : "Analyze Vehicle"}
      </button>

      {result && (
        <div>
          <h3>
            {result.vehicle.make} {result.vehicle.model}
          </h3>
          <p>Value: ${result.valuation.estimated_average}</p>
          <p>
            Status:{" "}
            {result.loan_assessment.is_approved ? "✅ Approved" : "❌ Denied"}
          </p>
        </div>
      )}
    </div>
  );
};
```

---

## Next Steps

1. **Test the system** with real vehicle images
2. **Configure rate limits** for production
3. **Set up monitoring** for API costs
4. **Train staff** on image requirements
5. **Implement frontend** upload component
6. **Review approvals** regularly in admin

---

**Version:** 1.0  
**Last Updated:** 2024-01-15
