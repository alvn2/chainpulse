---
name: africastalking-sms
description: Africa's Talking SMS API — send bulk/promotional and premium SMS, fetch messages, manage subscriptions, debug 406 blacklist errors and other status codes
---

# Africa's Talking SMS API

You are an expert on the Africa's Talking SMS API. When a user asks you to help with SMS — sending messages, fetching received SMS, managing subscriptions, debugging errors (especially 406 User Blacklisted), or setting up Postman collections — use this skill to guide them accurately.

---

## Account Setup & Credentials

1. Sign up / login at https://account.africastalking.com/
2. Create a **Team** → click team → create an **App** (the app's unique name is your `username`)
3. Open the app dashboard → **Settings** (sidebar) → create an **API Key**
4. For **sandbox**: click the orange **"Go To Sandbox App"** button. Use username `sandbox` + the sandbox API key.
5. **Sender ID**: needed for production bulk SMS. Check: app dashboard → **SMS** (sidebar) → **Alphanumerics** → **My Alphanumerics**. If none exists, email `support@africastalking.com`. During AT hackathons, one is assigned upon request. **Sandbox does NOT require a Sender ID.**

---

## Which SMS API to Use?

**Decision guide** — always clarify or infer the user's environment:

| Situation | Use |
|-----------|-----|
| User is on **sandbox credentials** | Legacy Bulk API (`/version1/messaging`) |
| User is on **production credentials** (default) | New Bulk API (`/version1/messaging/bulk`) |
| User explicitly asks for **two-way / shortcode / premium SMS** | Premium SMS API |

> **Why the split?** The new Bulk API (`/messaging/bulk`) requires a Sender ID, which is not yet supported in the sandbox environment. Using it with sandbox credentials will fail. The Legacy API works for sandbox.

---

## Endpoints

| API | Method | URL |
|-----|--------|-----|
| Send Bulk SMS — New API (production) | POST | `https://api.africastalking.com/version1/messaging/bulk` |
| Send Bulk SMS — Legacy API (sandbox) | POST | `https://api.africastalking.com/version1/messaging` |
| Send Premium SMS | POST | `https://content.africastalking.com/version1/messaging` |
| Fetch Received Messages | GET | `https://api.africastalking.com/version1/messaging` |
| Create Premium Subscription | POST | `https://content.africastalking.com/version1/subscription/create` |
| Fetch Subscriptions | GET | `https://content.africastalking.com/version1/subscription` |
| Delete Subscription | POST | `https://content.africastalking.com/version1/subscription/delete` |

> **Sandbox note**: The sandbox-specific SMS URL is not yet functional. Always use the live URLs above — they accept sandbox credentials and route to the sandbox environment correctly.

---

## Send Bulk (Promotional) SMS — New API

Use for **production credentials** when sending bulk/promotional messages.

**Method**: `POST`
**URL**: `https://api.africastalking.com/version1/messaging/bulk`

**Headers**:
```
apiKey: YOUR_API_KEY
Accept: application/json
Content-Type: application/x-www-form-urlencoded
```

**Body Parameters**:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `username` | Yes | Your AT app username |
| `phoneNumber` | Yes | Array of E.164 phone numbers e.g. `["+254712345678"]` |
| `message` | Yes | The SMS message text |
| `senderId` | Production: Yes / Sandbox: No | Alphanumeric Sender ID (e.g. `"MYAPP"`) |
| `bulkSMSMode` | Yes | Set to `1` for bulk |
| `enqueue` | No | `1` to enqueue, `0` to send immediately |
| `retryDurationInHours` | No | Retry duration in hours for failed sends |

> **Key difference from legacy**: New API uses `phoneNumber` (array) and `senderId` instead of `to` and `from`.

Phone numbers **must** include country code: `+254` (Kenya), `+256` (Uganda), `+233` (Ghana), `+234` (Nigeria), etc.

### Success Response (HTTP 201)

```json
{
  "SMSMessageData": {
    "Message": "Sent to 1/1 Total Cost: KES 0.8000",
    "Recipients": [
      {
        "number": "+254712345678",
        "statusCode": 101,
        "status": "Sent",
        "cost": "KES 0.8000",
        "messageId": "ATXid_...",
        "networkCode": "63902"
      }
    ]
  }
}
```

---

## Send Bulk (Promotional) SMS — Legacy API

Use for **sandbox credentials** or when the new API is unavailable.

**Method**: `POST`
**URL**: `https://api.africastalking.com/version1/messaging`

**Headers**: same as above

**Body Parameters**:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `username` | Yes | Your AT app username (or `sandbox`) |
| `to` | Yes | Comma-separated E.164 numbers e.g. `"+254712345678,+254711000000"` |
| `message` | Yes | The SMS message text |
| `from` | No | Sender ID (legacy key name) — not required for sandbox |
| `bulkSMSMode` | Yes | Set to `1` for bulk |

> **Legacy API uses `to` and `from`** (not `phoneNumber` and `senderId`)

Docs: https://developers.africastalking.com/docs/sms/sending/bulk_(legacy)

---

## Send Premium SMS (Two-Way / Shortcode)

Only use when the user is building **interactive SMS flows** using a shortcode (rarely needed).

**Method**: `POST`
**URL**: `https://content.africastalking.com/version1/messaging`

**Headers**: same as above

**Body Parameters**:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `username` | Yes | Your AT app username |
| `to` | Yes | Comma-separated E.164 numbers |
| `message` | Yes | The SMS message text |
| `from` | Yes | Sender ID (required for premium) |
| `bulkSMSMode` | Yes | Set to `0` for premium |
| `keyword` | Yes | Keyword linked to your shortcode |
| `linkId` | No | Used for follow-up replies |
| `retryDurationInHours` | No | Retry duration in hours |

Docs: https://developers.africastalking.com/docs/sms/sending/premium

---

## Fetch Received Messages

**Method**: `GET`
**URL**: `https://api.africastalking.com/version1/messaging`

**Headers**:
```
apiKey: YOUR_API_KEY
Accept: application/json
```

**Query Parameters**:
- `username` — your app username
- `lastReceivedId` — start from this message ID (use `0` to fetch from the beginning)
- `keyword` — (optional) filter by keyword
- `shortCode` — (optional) filter by shortcode

**Response**:
```json
{
  "SMSMessageData": {
    "Messages": [
      {
        "id": 1234,
        "text": "Hello",
        "to": "+254200000001",
        "from": "+254712345678",
        "date": "2024-01-01 12:00:00",
        "linkId": "SomeId"
      }
    ]
  }
}
```

---

## SMS Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| 100 | Processed | Message processed |
| 101 | Sent | Message sent successfully |
| 102 | Queued | Message queued for sending |
| 401 | RiskHold | Message held for risk review |
| 402 | InvalidSenderId | Sender ID not registered/approved |
| 403 | InvalidPhoneNumber | Phone number is invalid |
| **406** | **UserInBlacklist** | **Recipient has blocked promotional messages** |
| 407 | CouldNotRoute | Could not find a route for the number |
| 500 | InternalServerError | AT internal error |
| 501 | GatewayError | Gateway error |
| 502 | RejectedByGateway | Rejected by the carrier gateway |

---

## Common Errors & Fixes

### 406 UserInBlacklist — User Has Blocked Promotional Messages

This is the most common error for Safaricom (Kenya) users. The recipient has opted out of promotional messages.

**Fix: Safaricom USSD method**
1. Dial `*456#` on the affected phone
2. Select **9** → STOP
3. Select **5** → Marketing Messages
4. Select **2** → Stop All Promo Messages *(to re-enable, uncheck this)*
5. To check which senders are blocked: `*456#` → 9 → 5 → "Check Stopped Promotional Messages"

**Fix: MySafaricom App method**
1. Login to the MySafaricom app
2. Navigate to **My Subscriptions**
3. Select **Promotional Messages** → re-enable or manage blocked senders

**Code-side fix**: If the message is transactional (not promotional), switch to the Premium SMS API with `bulkSMSMode=0`. Transactional messages bypass promotional opt-outs.

---

### 402 InvalidSenderId
- Sender ID not yet approved or doesn't exist
- **Check**: app dashboard → SMS → Alphanumerics → My Alphanumerics
- **Fix**: email `support@africastalking.com` (approval takes 1–3 business days)
- **Hackathon**: request a temporary sender ID — one is assigned upon request
- **Sandbox**: sender ID is not required — leave it out

### 403 InvalidPhoneNumber
- Phone number must include country code in E.164 format
- Kenya: `+254712345678` (not `0712345678` or `712345678`)
- Uganda: `+256701234567`
- Nigeria: `+2348012345678`

### New Bulk API Fails with Sandbox Credentials
- The new bulk API (`/messaging/bulk`) requires a Sender ID, which sandbox doesn't support
- **Fix**: switch to the Legacy Bulk API (`/version1/messaging`) when using sandbox credentials

### Auth Errors
- `apiKey` must be in **request headers**, not query params or body
- Sandbox credentials: `apiKey` = sandbox key, `username` = `sandbox`
- Production credentials: `apiKey` = production key, `username` = your app username

---

## SDK Usage (Node.js / TypeScript)

```js
const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});

const sms = at.SMS;

// Send bulk SMS (production)
const result = await sms.send({
  to: ['+254712345678', '+254711000000'],
  from: 'MYSENDERID',  // Sender ID
  message: 'Hello from MyApp!',
});

// Fetch received messages
const messages = await sms.fetchMessages({ lastReceivedId: 0 });
```

**Python (requests)**:
```python
import requests

url = 'https://api.africastalking.com/version1/messaging/bulk'  # or /messaging for sandbox
headers = {
    'apiKey': 'YOUR_API_KEY',
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
}
data = {
    'username': 'YOUR_USERNAME',
    'phoneNumber': ['+254712345678'],  # new API
    'message': 'Hello from MyApp!',
    'senderId': 'MYSENDERID',         # new API (not needed for sandbox)
    'bulkSMSMode': 1
}
response = requests.post(url, headers=headers, data=data)
print(response.json())
```

---

## Postman Collection Setup

If the user asks to create a Postman collection for SMS, use the Postman MCP tools:

1. **Create collection** using `mcp__postman__createCollection` with name "Africa's Talking SMS"
2. **Create environment** using `mcp__postman__createEnvironment` with variables:
   - `AT_API_KEY` — your Africa's Talking API key
   - `AT_USERNAME` — your username (or `sandbox`)
   - `AT_SENDER_ID` — your alphanumeric sender ID
   - `AT_BASE_URL` — `https://api.africastalking.com/version1`
   - `AT_CONTENT_URL` — `https://content.africastalking.com/version1`
3. **Add Send Bulk SMS (New) request**:
   - Method: POST, URL: `{{AT_BASE_URL}}/messaging/bulk`
   - Headers: `apiKey: {{AT_API_KEY}}`, `Accept: application/json`
   - Body (x-www-form-urlencoded): `username={{AT_USERNAME}}`, `phoneNumber=["+254712345678"]`, `message=Hello!`, `senderId={{AT_SENDER_ID}}`, `bulkSMSMode=1`
4. **Add Send Bulk SMS (Legacy) request**:
   - Method: POST, URL: `{{AT_BASE_URL}}/messaging`
   - Body: `username={{AT_USERNAME}}`, `to=+254712345678`, `message=Hello!`, `bulkSMSMode=1`
5. **Add Fetch Messages request**:
   - Method: GET, URL: `{{AT_BASE_URL}}/messaging?username={{AT_USERNAME}}&lastReceivedId=0`
   - Headers: `apiKey: {{AT_API_KEY}}`, `Accept: application/json`
