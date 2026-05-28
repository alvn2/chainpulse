---
name: africastalking-airtime
description: Africa's Talking Airtime API — send airtime to any phone number, check transaction status, handle errors, and create Postman collections
---

# Africa's Talking Airtime API

You are an expert on the Africa's Talking Airtime API. When a user asks you to help with airtime — sending airtime, checking transaction status, debugging errors, or setting up Postman collections — use this skill to guide them accurately.

---

## Account Setup & Credentials

1. Sign up / login at https://account.africastalking.com/
2. Create a **Team** → click team → create an **App** (the app's unique name is your `username`)
3. Open the app dashboard → **Settings** (sidebar) → create an **API Key**
4. For **sandbox**: click the orange **"Go To Sandbox App"** button on the main dashboard. Use username `sandbox` + the sandbox API key. The live URL also accepts sandbox credentials and routes correctly.

---

## Endpoints

Both sandbox and production use the **live URL** — credentials determine the environment:

| Action | Method | URL |
|--------|--------|-----|
| Send Airtime | POST | `https://api.africastalking.com/version1/airtime/send` |
| Find Transaction Status | GET | `https://api.africastalking.com/version1/airtime/status` |

---

## Send Airtime

### Request

**Method**: `POST`
**URL**: `https://api.africastalking.com/version1/airtime/send`

**Headers**:
```
apiKey: YOUR_API_KEY
Accept: application/json
Content-Type: application/x-www-form-urlencoded
```

**Body Parameters**:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `username` | Yes | Your AT app username (or `sandbox` for sandbox) |
| `recipients` | Yes | JSON string of recipient array (see format below) |
| `maxNumRetry` | No | Max retry attempts on failure (integer) |

**Recipients format** — JSON-stringified array:
```json
[
  {"phoneNumber": "+254712345678", "amount": "KES 10"},
  {"phoneNumber": "+256701234567", "amount": "UGX 500"}
]
```

- Phone numbers **must** include country code in E.164 format: `+254` for Kenya, `+256` for Uganda, `+233` for Ghana, etc.
- Amount format: `"<CURRENCY_CODE> <AMOUNT>"` — e.g. `"KES 10"`, `"UGX 500"`, `"NGN 50"`

### Success Response (HTTP 201)

```json
{
  "numSent": 1,
  "totalAmount": "KES 10",
  "totalDiscount": "KES 0",
  "responses": [
    {
      "phoneNumber": "+254712345678",
      "amount": "KES 10",
      "status": "Success",
      "requestId": "ATQid_...",
      "errorMessage": "None",
      "discount": "KES 0"
    }
  ]
}
```

**Per-recipient status values**: `Success`, `Failed`

---

## Find Transaction Status

### Request

**Method**: `GET`
**URL**: `https://api.africastalking.com/version1/airtime/status`

**Headers**:
```
apiKey: YOUR_API_KEY
Accept: application/json
```

**Query Parameters**:
- `transactionId` — the `requestId` from the send response
- `username` — your AT app username

### Response

```json
{
  "status": "Success",
  "data": {
    "requestId": "ATQid_...",
    "status": "Success",
    "phoneNumber": "+254712345678",
    "amount": "KES 10"
  }
}
```

---

## SDK Usage (Node.js / TypeScript)

```js
const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME, // 'sandbox' for sandbox
});

const airtime = at.AIRTIME;

// Send airtime
const response = await airtime.send({
  recipients: [
    { phoneNumber: '+254712345678', currencyCode: 'KES', amount: 10 }
  ],
  maxNumRetry: 1 // optional
});

// Find transaction status
const status = await airtime.findTransactionStatus('ATQid_...');
```

**Python (requests)**:
```python
import requests, json

url = 'https://api.africastalking.com/version1/airtime/send'
headers = {
    'apiKey': 'YOUR_API_KEY',
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
}
recipients = json.dumps([
    {"phoneNumber": "+254712345678", "amount": "KES 10"}
])
data = {'username': 'YOUR_USERNAME', 'recipients': recipients}

response = requests.post(url, headers=headers, data=data)
print(response.json())
```

---

## Common Errors & Fixes

### `Failed` status for a recipient
- **Wrong phone format**: must be E.164 with country code — `+254712345678` not `0712345678`
- **Wrong amount format**: must be `"KES 10"` (currency code + space + number as a string)
- **Insufficient funds**: top up your AT wallet at https://account.africastalking.com/

### `Invalid API Key` / 401 errors
- `apiKey` must be in **request headers**, not query params
- Sandbox key only works with username `sandbox`
- Production key only works with your actual app username

### `maxNumRetry` not working
- Must be a positive integer (e.g. `1`, `2`, `3`)
- Only applies when a send fails — it retries the failed recipients

---

## Postman Collection Setup

If the user asks to create a Postman collection for Airtime, use the Postman MCP tools:

1. **Create collection** using `mcp__postman__createCollection` with name "Africa's Talking Airtime"
2. **Create environment** using `mcp__postman__createEnvironment` with variables:
   - `AT_API_KEY` — your Africa's Talking API key
   - `AT_USERNAME` — your username (or `sandbox`)
   - `AT_BASE_URL` — `https://api.africastalking.com/version1`
3. **Add Send Airtime request** using `mcp__postman__createCollectionRequest`:
   - Method: POST
   - URL: `{{AT_BASE_URL}}/airtime/send`
   - Headers: `apiKey: {{AT_API_KEY}}`, `Accept: application/json`
   - Body (x-www-form-urlencoded): `username={{AT_USERNAME}}`, `recipients=[{"phoneNumber":"+254712345678","amount":"KES 10"}]`
4. **Add Find Status request**:
   - Method: GET
   - URL: `{{AT_BASE_URL}}/airtime/status?username={{AT_USERNAME}}&transactionId=REPLACE_WITH_REQUEST_ID`
   - Headers: `apiKey: {{AT_API_KEY}}`, `Accept: application/json`
