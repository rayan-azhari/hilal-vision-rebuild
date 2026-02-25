# Hilal Vision Public REST API Reference

The Hilal Vision Public REST API provides programmatic access to precision astronomical calculations for Islamic crescent moon visibility and lunar phases.

**Base URL (Production):** `https://your-domain.com` (replace with actual production domain)
**Base Path:** `/api/v1`

---

## 1. Crescent Visibility (`/api/v1/visibility`)

Computes the sun and moon geometric positions at sunset for a specific location and evaluates crescent visibility against both the **Yallop (1997)** and **Odeh (2004)** criteria.

### GET `/api/v1/visibility`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | Number | **Yes** | Latitude of the observer (`-90` to `90`) |
| `lng` | Number | **Yes** | Longitude of the observer (`-180` to `180`) |
| `date` | String | No | ISO 8601 Date string. Defaults to the current date if omitted. |

#### Example Request
```bash
curl "https://your-domain.com/api/v1/visibility?lat=21.4225&lng=39.8262&date=2024-03-10"
```

#### Example Response (200 OK)
```json
{
  "success": true,
  "data": {
    "date": "2024-03-10T00:00:00.000Z",
    "location": {
      "lat": 21.4225,
      "lng": 39.8262
    },
    "qValue": 0.352,
    "odehCriterion": 6.84,
    "visibilityZone": "A",
    "moonAgeHours": 25.4,
    "elongation": 11.2,
    "moonAltitude": 9.5,
    "sunAltitude": -0.833
  }
}
```

#### Visibility Zones Explained
- `A` - Easily visible to the naked eye.
- `B` - Visible under perfect atmospheric conditions.
- `C` - May need optical aid to find the moon before it can be seen with the naked eye.
- `D` - Visible only with optical aid (binoculars or a telescope).
- `E` - Not visible even with optical aid.
- `F` - Below the horizon at sunset; impossible to see.

---

## 2. Moon Phases (`/api/v1/moon-phases`)

Retrieves the current lunar phase, illumination details, and exact conjunction (New Moon) / Full Moon times down to the second.

### GET `/api/v1/moon-phases`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | String | No | ISO 8601 Date string. Defaults to the current date if omitted. |

#### Example Request
```bash
curl "https://your-domain.com/api/v1/moon-phases?date=2024-03-10"
```

#### Example Response (200 OK)
```json
{
  "success": true,
  "data": {
    "date": "2024-03-10T00:00:00.000Z",
    "phaseName": "Waxing Crescent",
    "illuminatedFraction": 0.024,
    "moonAgeHours": 25.4,
    "nextNewMoon": "2024-04-08T18:21:00.000Z",
    "nextNewMoonExact": "2024-04-08T18:20:43.000Z",
    "nextFullMoon": "2024-03-25T07:00:00.000Z"
  }
}
```

---

## Error Handling

All endpoints use `Zod` validation. Invalid inputs will return a `400 Bad Request` with structured error details.

#### Example Error Response (400 Bad Request)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_big",
      "maximum": 90,
      "type": "number",
      "inclusive": true,
      "exact": false,
      "message": "Number must be less than or equal to 90",
      "path": ["lat"]
    }
  ]
}
```
