# AI-Powered Car Valuation System Documentation

## Overview

The AI Car Valuation System integrates GPT-4 Vision API to automatically analyze vehicle images uploaded during loan applications. The system extracts vehicle details, assesses condition, estimates market value, and provides loan approval recommendations based on loan-to-value (LTV) ratios.

---

## System Architecture

### Components

1. **CarImageAnalyzer** (`loans/car_image_analyzer.py`)

   - Analyzes vehicle images using GPT-4 Vision API
   - Extracts vehicle make, model, year, condition, and features
   - Identifies visible damage and condition issues

2. **CarValuationService** (`loans/car_image_analyzer.py`)

   - Performs market value estimation
   - Calculates loan-to-value ratios
   - Provides approval recommendations
   - Assesses risk factors

3. **VehicleValuation Model** (`loans/models.py`)

   - Stores analysis results
   - Tracks vehicle details and condition
   - Records valuation estimates and loan assessments

4. **API Endpoint** (`loans/views.py`)
   - `POST /api/loans/applications/{id}/analyze_vehicle/`
   - Accepts multiple vehicle images
   - Triggers AI analysis
   - Returns comprehensive valuation report

---

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-vision-preview
```

### Getting OpenAI API Key

1. Visit https://platform.openai.com/
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key to your `.env` file

**Important:** Never commit your API key to version control!

---

## Models

### VehicleValuation

Stores comprehensive vehicle analysis results.

**Fields:**

```python
# Vehicle Details
- make (CharField): Vehicle manufacturer
- model (CharField): Vehicle model name
- year (CharField): Manufacturing year
- body_type (CharField): Vehicle body type (sedan, SUV, truck, etc.)
- color (CharField): Vehicle color

# Condition Assessment
- condition (CharField): Overall condition (excellent, good, fair, poor)
- visible_damage (JSONField): List of damage items identified
- features (JSONField): Notable features (leather, sunroof, etc.)

# Valuation
- estimated_value_low (DecimalField): Low estimate
- estimated_value_high (DecimalField): High estimate
- estimated_value_avg (DecimalField): Average estimate

# Loan Assessment
- ltv_ratio (DecimalField): Loan-to-value ratio percentage
- max_loan_amount (DecimalField): Maximum recommended loan
- recommended_loan_amount (DecimalField): Conservative recommendation

# Risk Assessment
- risk_level (CharField): low, medium, high
- risk_factors (JSONField): List of risk factors
- is_approved_for_loan (BooleanField): Approval decision
- approval_notes (TextField): Explanation of decision

# Metadata
- confidence_level (CharField): AI confidence (low, medium, high)
- images_analyzed (IntegerField): Number of images processed
- analysis_notes (TextField): Additional notes
- full_analysis_data (JSONField): Complete raw analysis
- analyzed_at (DateTimeField): Analysis timestamp
```

### LoanApplicationDocument

Updated to support vehicle image analysis.

**New Fields:**

```python
- document_type: Added 'vehicle_image' choice
- ai_analysis_result (JSONField): Stores individual image analysis
- is_analyzed (BooleanField): Indicates if image was analyzed
```

---

## API Usage

### Analyze Vehicle Images

**Endpoint:** `POST /api/loans/applications/{id}/analyze_vehicle/`

**Authentication:** Required (Bearer token or session)

**Content-Type:** `multipart/form-data`

**Request:**

```bash
curl -X POST \
  http://localhost:8000/api/loans/applications/123/analyze_vehicle/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@car_front.jpg" \
  -F "images=@car_side.jpg" \
  -F "images=@car_interior.jpg"
```

**Python Example:**

```python
import requests

url = "http://localhost:8000/api/loans/applications/123/analyze_vehicle/"
headers = {"Authorization": "Bearer YOUR_TOKEN"}
files = [
    ("images", open("car_front.jpg", "rb")),
    ("images", open("car_side.jpg", "rb")),
    ("images", open("car_interior.jpg", "rb")),
]

response = requests.post(url, headers=headers, files=files)
data = response.json()
```

**Response:**

```json
{
  "success": true,
  "message": "Vehicle analysis completed successfully",
  "analysis": {
    "vehicle": {
      "make": "Toyota",
      "model": "Camry",
      "year": "2020",
      "color": "Silver",
      "body_type": "Sedan"
    },
    "condition": {
      "overall": "good",
      "damage": [
        "Minor scratches on rear bumper",
        "Small dent on driver's side door"
      ],
      "features": ["Leather seats", "Sunroof", "Backup camera", "Alloy wheels"]
    },
    "valuation": {
      "estimated_low": "18500.00",
      "estimated_high": "22000.00",
      "estimated_average": "20250.00"
    },
    "loan_assessment": {
      "ltv_ratio": "74.07",
      "max_loan_amount": "16200.00",
      "recommended_amount": "14175.00",
      "is_approved": true,
      "approval_notes": "Approved - LTV ratio within acceptable range"
    },
    "risk": {
      "level": "low",
      "factors": ["Minor cosmetic damage"]
    },
    "metadata": {
      "confidence": "high",
      "images_analyzed": 3,
      "analyzed_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## How It Works

### 1. Image Upload

User uploads multiple vehicle images (front, side, rear, interior) during loan application.

### 2. Image Analysis (CarImageAnalyzer)

For each image:

- Converts image to base64
- Sends to GPT-4 Vision API with detailed prompt
- Extracts: make, model, year, condition, damage, features
- Returns structured JSON response

### 3. Result Aggregation

Multiple image analyses are combined:

- Vehicle details verified across images
- Damage reports consolidated
- Features list merged
- Most comprehensive data used

### 4. Market Valuation

GPT-4 is queried for current market pricing:

- Based on vehicle details from analysis
- Considers condition and damage
- Provides price range (low, high, average)

### 5. Loan Assessment (CarValuationService)

Calculates approval recommendation:

- **LTV Ratio** = (Requested Loan / Vehicle Value) × 100
- **Condition Multiplier:**
  - Excellent: 0.85
  - Good: 0.80
  - Fair: 0.70
  - Poor: 0.60
- **Max Loan** = Vehicle Value × Condition Multiplier
- **Risk Assessment:**
  - Low: LTV < 70%
  - Medium: LTV 70-85%
  - High: LTV > 85%

### 6. Decision Logic

```python
if LTV_RATIO <= 80%:
    APPROVED
elif 80% < LTV_RATIO <= 90%:
    CONDITIONAL (requires additional documentation)
else:
    DENIED (LTV too high)
```

---

## Best Practices

### Image Requirements

**Recommended Images:**

- Front view (full vehicle)
- Side view (driver's side)
- Rear view
- Interior (dashboard and seats)
- Engine bay (optional)
- Close-ups of any damage

**Image Quality:**

- Minimum 800x600 pixels
- Good lighting (natural daylight preferred)
- Clear, in-focus shots
- No filters or heavy editing

**What to Avoid:**

- Blurry or dark images
- Partial vehicle views
- Extreme angles
- Heavy shadows

### API Rate Limits

GPT-4 Vision API has rate limits:

- **Free tier:** Limited requests per minute
- **Paid tier:** Higher limits based on plan

**Optimization Tips:**

- Process 3-5 key images instead of 10+
- Implement request queuing for high volume
- Cache results to avoid re-analyzing same vehicle
- Use batch processing during off-peak hours

### Error Handling

The system handles common errors:

- Invalid image format → Returns clear error message
- API timeout → Retries with exponential backoff
- Low confidence results → Flags for manual review
- Missing API key → Returns configuration error

---

## Admin Interface

### Viewing Valuations

Navigate to Django Admin → Loans → Vehicle Valuations

**Features:**

- Color-coded value indicators (green/orange/red)
- Approval status badges
- Risk level filters
- Search by make/model/year
- Expandable raw data view

**Custom Display Fields:**

- `vehicle_display`: Shows "Make Model (Year)"
- `estimated_value_display`: Colored value with range
- `loan_assessment_display`: Approval status with metrics

### Manual Override

Admins can:

- Edit AI assessment results
- Override approval decision
- Add custom approval notes
- Adjust recommended loan amount

---

## Testing

### Test with Sample Images

```python
from loans.car_image_analyzer import CarValuationService

# Initialize service
service = CarValuationService()

# Test analysis
result = service.evaluate_for_loan(
    image_paths=['test_images/car1.jpg', 'test_images/car2.jpg'],
    requested_loan_amount=15000.0
)

print(result)
```

### Expected Output Structure

```json
{
  "vehicle_info": {
    "make": "Honda",
    "model": "Accord",
    "year": "2019",
    "body_type": "Sedan",
    "color": "White",
    "features": ["Sunroof", "Leather seats"]
  },
  "condition_assessment": {
    "overall_condition": "good",
    "visible_damage": ["Minor door ding"],
    "interior_condition": "excellent",
    "exterior_condition": "good"
  },
  "estimated_value": {
    "low": 17000,
    "high": 20000,
    "average": 18500
  },
  "loan_assessment": {
    "ltv_ratio": 81.08,
    "max_loan_amount": 14800,
    "recommended_amount": 12950,
    "decision": "conditional",
    "recommendation": "LTV slightly high - require additional documentation"
  },
  "risk_assessment": {
    "risk_level": "medium",
    "risk_factors": ["LTV ratio above 80%"]
  },
  "confidence": "high",
  "notes": "Clear images provided, confident assessment"
}
```

---

## Troubleshooting

### Common Issues

**1. "OpenAI API key not configured"**

- Ensure `OPENAI_API_KEY` is set in `.env`
- Restart Django server after adding key
- Verify key is valid on OpenAI platform

**2. "Error analyzing vehicle images"**

- Check image file formats (JPG, PNG supported)
- Ensure images are not corrupted
- Verify file sizes (< 20MB recommended)
- Check API rate limits

**3. Low Confidence Results**

- Upload clearer, better-lit images
- Provide multiple angles
- Ensure full vehicle is visible
- Flag for manual review if confidence < 50%

**4. Incorrect Vehicle Details**

- Verify image quality
- Check if vehicle has custom modifications
- Consider manual correction in admin
- Report persistent issues for prompt tuning

### Debug Mode

Enable detailed logging:

```python
# In settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'ai_valuation.log',
        },
    },
    'loggers': {
        'loans.car_image_analyzer': {
            'handlers': ['file'],
            'level': 'DEBUG',
        },
    },
}
```

---

## Security Considerations

### API Key Protection

- Never expose API key in frontend code
- Use environment variables only
- Add `.env` to `.gitignore`
- Rotate keys regularly
- Monitor usage on OpenAI dashboard

### Image Privacy

- Store images securely (HTTPS only)
- Implement access controls
- Auto-delete images after X days (optional)
- Comply with data protection regulations
- Obtain user consent for AI analysis

### Rate Limiting

Implement request throttling:

```python
# In views.py
from rest_framework.throttling import UserRateThrottle

class VehicleAnalysisThrottle(UserRateThrottle):
    rate = '10/hour'  # Max 10 analyses per user per hour

class LoanApplicationViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'],
            throttle_classes=[VehicleAnalysisThrottle])
    def analyze_vehicle(self, request, pk=None):
        # ... analysis code
```

---

## Cost Estimation

### OpenAI Pricing (as of 2024)

GPT-4 Vision API costs:

- **Input:** ~$0.01 per image
- **Text output:** ~$0.03 per 1K tokens

**Example Cost per Analysis:**

- 3 vehicle images: $0.03
- Market comparison query: $0.01
- Total: ~$0.04 per loan application

**Monthly Estimate:**

- 100 applications/month: $4
- 500 applications/month: $20
- 1000 applications/month: $40

### Cost Optimization

1. **Cache results** - Don't re-analyze same vehicle
2. **Batch processing** - Analyze off-peak hours
3. **Image compression** - Reduce size before upload
4. **Selective analysis** - Only analyze when needed
5. **Tiered approach** - Use simpler models for initial screening

---

## Future Enhancements

### Planned Features

1. **VIN Lookup Integration**

   - Decode VIN from images
   - Cross-reference with vehicle history databases
   - Verify mileage and title status

2. **Damage Cost Estimation**

   - Estimate repair costs for identified damage
   - Adjust valuation based on repair needs
   - Partner with body shop APIs

3. **Market Trend Analysis**

   - Track price changes over time
   - Seasonal adjustment factors
   - Regional market variations

4. **Enhanced Risk Scoring**

   - Machine learning model for fraud detection
   - Anomaly detection (mismatch between stated/analyzed)
   - Historical loan performance correlation

5. **Multi-language Support**
   - Analyze vehicles with foreign language badges
   - International market pricing
   - Currency conversion

### Integration Opportunities

- **Kelly Blue Book API** - Cross-reference valuations
- **CARFAX** - Vehicle history reports
- **NADA Guides** - Additional pricing data
- **AutoCheck** - Title and accident history
- **Black Book** - Wholesale values

---

## Support

### Documentation

- Main docs: `LOAN_APPLICATION_SYSTEM.md`
- Quick start: `QUICK_START_GUIDE.md`
- Troubleshooting: `TROUBLESHOOTING.md`

### Contact

For technical issues:

1. Check this documentation
2. Review error logs
3. Test with sample images
4. Contact development team

### Reporting Bugs

Include:

- Error message
- Request/response data (redact sensitive info)
- Image samples (if applicable)
- Steps to reproduce
- Expected vs actual behavior

---

## Appendix

### Sample Prompts Used

**Image Analysis Prompt:**

```
Analyze this vehicle image and provide detailed information in JSON format:
{
  "make": "vehicle manufacturer",
  "model": "vehicle model name",
  "year": "manufacturing year or range",
  "body_type": "sedan/SUV/truck/etc",
  "color": "primary color",
  "condition": "excellent/good/fair/poor",
  "visible_damage": ["list of damage items"],
  "features": ["notable features visible"],
  "confidence": "low/medium/high"
}
```

**Market Valuation Prompt:**

```
What is the current market value range for a [YEAR] [MAKE] [MODEL]
in [CONDITION] condition? Provide low, high, and average estimates.
Consider: [VISIBLE_DAMAGE]
```

### Error Codes

- `VAL001`: Missing API key
- `VAL002`: Invalid image format
- `VAL003`: API timeout
- `VAL004`: Insufficient images
- `VAL005`: Low confidence result
- `VAL006`: Rate limit exceeded
- `VAL007`: Invalid response format

---

## Version History

- **v1.0** (2024-01-15): Initial release
  - GPT-4 Vision integration
  - VehicleValuation model
  - Basic loan assessment logic
  - Admin interface

---

**End of Documentation**
