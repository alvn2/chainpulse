---
name: africastalking-voice
description: Africa's Talking Voice API — make outbound calls, handle inbound call callbacks, use all XML voice actions (Say, Play, GetDigits, Dial, Record, Enqueue, Dequeue, Redirect, Conference, Reject), manage call queues, upload media, and create Postman collections
---

# Africa's Talking Voice API

You are an expert on the Africa's Talking Voice API. When a user asks you to help with voice — making calls, handling inbound calls, building IVR (Interactive Voice Response) menus, recording audio, managing call queues, or setting up Postman collections — use this skill to guide them accurately.

---

## Important: Voice Uses Live Credentials Only

**There is no sandbox environment for Voice.** Voice only works with production (live) credentials. If a user tells you they are using sandbox credentials, inform them that voice requires live credentials and a purchased virtual number.

---

## Account Setup

1. Sign up / login at https://account.africastalking.com/
2. Create a **Team** → click team → create an **App**
3. Open the app dashboard → **Settings** → create an **API Key**
4. **Get a Virtual Number**: app dashboard → **Voice** (sidebar) → **Phone Numbers** → purchase or request a number
5. Register your **callback URL** in the Voice settings — this is the URL AT will call when a call comes in or when call events occur

---

## Endpoints

All voice endpoints use the live URL only:

| Action | Method | URL |
|--------|--------|-----|
| Make Outbound Call | POST | `https://voice.africastalking.com/call` |
| Get Queue Status | POST | `https://voice.africastalking.com/queueStatus` |
| Upload Media File | POST | `https://voice.africastalking.com/mediaUpload` |

---

## Make Outbound Call

Initiates a call from your virtual number to one or more recipients.

**Method**: `POST`
**URL**: `https://voice.africastalking.com/call`

**Headers**:
```
apikey: YOUR_API_KEY
Accept: application/json
Content-Type: application/x-www-form-urlencoded
```

**Body Parameters**:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `username` | Yes | Your AT app username |
| `from` | Yes | Your virtual number (e.g. `+254711082XXX`) |
| `to` | Yes | Recipient number(s) in E.164 format. Comma-separated for multiple |
| `clientRequestId` | No | Custom request ID for tracking |

Phone numbers **must** include country code: `+254` (Kenya), `+256` (Uganda), etc.

### Success Response (HTTP 200 or 201)

```json
{
  "entries": [
    {
      "phoneNumber": "+254712345678",
      "status": "Queued",
      "sessionId": "ATVid_..."
    }
  ]
}
```

---

## Handling Inbound Calls (Webhook)

When a call comes in (or when your outbound call connects), AT sends a `POST` request to your registered callback URL.

**Incoming request body from AT**:
```
sessionId        — unique call session ID
direction        — "Inbound" or "Outbound"
callerNumber     — the caller's phone number
destinationNumber — the number that was dialed
callerCarrierName — carrier name
clientDialedCode  — country dial code
durationInSeconds — call duration so far
currencyCode      — billing currency
amount           — billing amount
callStartTime    — timestamp
isActive         — "1" if call is active
dtmfDigits       — digit(s) the user pressed (from GetDigits)
```

**Your server must**:
1. Respond within **5 seconds**
2. Return valid XML in the `<Response>` wrapper
3. Set `Content-Type` to `text/plain` or `application/xml`

**Response structure**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- one or more voice actions -->
</Response>
```

---

## Voice XML Actions

### Say — Text to Speech

Speaks text to the caller.

```xml
<Say voice="woman" playBeep="false">Welcome to our service.</Say>
```

| Attribute | Values | Description |
|-----------|--------|-------------|
| `voice` | `man`, `woman` | Voice gender (basic voices) |
| `voice` | `en-US-Wavenet-C`, `en-GB-Neural2-A`, etc. | Neural/WaveNet voices for higher quality |
| `playBeep` | `true`, `false` | Play a beep before speaking |

For SSML (Speech Synthesis Markup Language):
```xml
<Say><speak>Hello <break time="1s"/> World</speak></Say>
```

---

### Play — Play an Audio File

Plays a pre-recorded audio file (must be a publicly accessible URL).

```xml
<Play url="https://yourdomain.com/audio/greeting.mp3"/>
```

---

### GetDigits — Collect DTMF Input

Prompts the caller and waits for them to press keys.

```xml
<GetDigits timeout="10" numDigits="1" finishOnKey="#" callbackUrl="https://yourserver.com/handle-input">
  <Say>Press 1 for Sales, Press 2 for Support, then press hash.</Say>
</GetDigits>
<Say>Sorry, we did not receive your input. Goodbye.</Say>
```

| Attribute | Description |
|-----------|-------------|
| `timeout` | Seconds to wait for input |
| `numDigits` | Max number of digits to collect |
| `finishOnKey` | Key that ends input collection (e.g. `#`) |
| `callbackUrl` | URL AT calls with the collected digits (`dtmfDigits` in body) |

**Tip**: Always place a `<Say>` fallback after `</GetDigits>` for when no input is received.

**Children**: `<Say>` or `<Play>` — used to prompt the caller before collecting digits.

---

### Dial — Bridge to Another Number

Connects the current caller to another phone number.

```xml
<Dial phoneNumbers="+254712345678" record="true" sequential="false" callerId="+254711082XXX" maxDuration="120"/>
```

| Attribute | Description |
|-----------|-------------|
| `phoneNumbers` | Comma-separated E.164 numbers to dial |
| `record` | `true`/`false` — record the bridged call |
| `sequential` | `true` = try numbers one by one; `false` = ring all simultaneously |
| `callerId` | Override the caller ID shown to the dialed party |
| `ringBackTone` | URL to audio played to the original caller while waiting |
| `maxDuration` | Max duration in seconds for the bridged call |

---

### Record — Record Caller's Voice

Records audio from the caller.

```xml
<Record finishOnKey="#" maxLength="30" timeout="10" trimSilence="true" playBeep="true" callbackUrl="https://yourserver.com/recording">
  <Say>Please leave your message after the beep, then press hash.</Say>
</Record>
```

| Attribute | Description |
|-----------|-------------|
| `finishOnKey` | Key that ends recording (e.g. `#`) |
| `maxLength` | Max recording duration in seconds |
| `timeout` | Seconds of silence before stopping |
| `trimSilence` | `true`/`false` — remove silence from recording |
| `playBeep` | `true`/`false` — play beep before recording starts |
| `callbackUrl` | URL AT posts the recording URL to when done |

**Children**: `<Say>` or `<Play>` — introduction before recording starts.

**Callback payload** (AT posts to `callbackUrl`):
```
sessionId, recordingUrl, durationInSeconds, callerNumber, destinationNumber, callSessionState
```

---

### Enqueue — Put Caller in a Queue

Places the caller in a call queue (used with an agent dequeue system).

```xml
<Enqueue holdMusic="https://yourdomain.com/audio/hold.mp3"/>
```

| Attribute | Description |
|-----------|-------------|
| `holdMusic` | (Optional) Public URL of audio to play while waiting |

---

### Dequeue — Pull a Caller from Queue

Connects an agent to a queued caller.

```xml
<Dequeue phoneNumber="+254712345678" name="support-queue"/>
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `phoneNumber` | Yes | E.164 phone number of the queued caller |
| `name` | No | Queue name |

---

### Redirect — Send to Another URL

Transfers call handling to a different URL.

```xml
<Redirect>https://yourserver.com/new-handler</Redirect>
```

---

### Conference — Join a Conference Call

Places the caller into a conference room. All callers with `<Conference/>` in the same session join the same room.

```xml
<Conference/>
```

---

### Reject — Reject an Incoming Call

Rejects the call without connecting it.

```xml
<Reject/>
```

---

## Get Queue Status

Check how many calls are queued for a virtual number.

**Method**: `POST`
**URL**: `https://voice.africastalking.com/queueStatus`

**Headers**: `apikey: YOUR_API_KEY`, `Accept: application/json`

**Body (JSON)**:
```json
{
  "username": "YOUR_USERNAME",
  "phoneNumbers": "+254711082XXX,+254711082YYY"
}
```

---

## Upload Media File

Upload an audio file to AT's servers for use in `<Play>` actions.

**Method**: `POST`
**URL**: `https://voice.africastalking.com/mediaUpload`

**Headers**: `apikey: YOUR_API_KEY`, `Accept: application/json`

**Body (JSON)**:
```json
{
  "username": "YOUR_USERNAME",
  "url": "https://yourdomain.com/audio/greeting.mp3",
  "phoneNumber": "+254711082XXX"
}
```

---

## Voice Notification / Status Callback

AT sends status updates to your `callbackUrl` throughout the call lifecycle.

**Payload**:
```
sessionId           — unique session ID
callSessionState    — e.g. "Active", "Completed", "Failed"
durationInSeconds   — call duration
direction           — "Inbound" or "Outbound"
callerNumber        — caller's phone number
destinationNumber   — dialed number
isActive            — "0" or "1"
dtmfDigits          — digits pressed (if GetDigits was used)
recordingUrl        — URL to recording (if Record was used)
currencyCode        — billing currency
amount              — billing amount
```

---

## Example: Complete IVR Flow

```js
// Node.js Express example
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

// Step 1: Initial callback when call connects
app.post('/voice/callback', (req, res) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits timeout="10" finishOnKey="#" callbackUrl="https://yourserver.com/menu">
    <Say>Welcome! Press 1 for Sales, press 2 for Support, then press hash.</Say>
  </GetDigits>
  <Say>We did not receive your input. Goodbye.</Say>
</Response>`;
  res.set('Content-Type', 'text/plain');
  res.send(xml);
});

// Step 2: Handle menu selection
app.post('/menu', (req, res) => {
  const digit = req.body.dtmfDigits;
  let xml;

  if (digit === '1') {
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting you to Sales. Please hold.</Say>
  <Dial phoneNumbers="+254712345678" sequential="true" maxDuration="120"/>
</Response>`;
  } else if (digit === '2') {
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>All agents are busy. Please leave a message after the beep.</Say>
  <Record finishOnKey="#" maxLength="30" timeout="5" trimSilence="true" playBeep="true" callbackUrl="https://yourserver.com/recording">
    <Say>Speak after the beep then press hash.</Say>
  </Record>
</Response>`;
  } else {
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Invalid selection. Goodbye.</Say>
</Response>`;
  }

  res.set('Content-Type', 'text/plain');
  res.send(xml);
});
```

---

## SDK Usage (Node.js)

```js
const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  apiKey: process.env.API_KEY,
  username: process.env.USERNAME,
});

const voice = at.VOICE;

// Make outbound call
const response = await voice.call({
  callFrom: process.env.VIRTUAL_NUMBER,
  callTo: ['+254712345678'],
  clientRequestId: 'optional-tracking-id'
});

// Get queue status
const status = await voice.getNumQueuedCalls({
  phoneNumbers: process.env.VIRTUAL_NUMBER
});

// Upload media
await voice.uploadMediaFile({
  url: 'https://yourdomain.com/audio/greeting.mp3',
  phoneNumber: process.env.VIRTUAL_NUMBER
});
```

---

## Common Errors & Fixes

### Voice API not working with sandbox credentials
- Voice requires **live (production) credentials** — sandbox does not work
- Get a production API key from app dashboard → Settings

### Call not connecting / No callback received
- Virtual number must be active and purchased (app dashboard → Voice → Phone Numbers)
- Callback URL must be **publicly accessible** — use ngrok for local dev: `ngrok http 3000`
- Register callback URL in AT Voice settings dashboard
- Must respond within **5 seconds** or AT will hang up

### XML not being processed
- Response must be wrapped in `<?xml version="1.0" encoding="UTF-8"?><Response>...</Response>`
- `Content-Type` must be `text/plain` or `application/xml`
- XML must be valid — unclosed tags will cause issues

### `dtmfDigits` is `"undefined"` string
- This means the caller did not press any key before `GetDigits` timed out
- Always check: `if (digits === 'undefined' || !digits)` before processing

---

## Postman Collection Setup

If the user asks to create a Postman collection for Voice, use the Postman MCP tools:

1. **Create collection** using `mcp__postman__createCollection` with name "Africa's Talking Voice"
2. **Create environment** using `mcp__postman__createEnvironment` with variables:
   - `AT_API_KEY` — your Africa's Talking production API key
   - `AT_USERNAME` — your app username
   - `AT_VIRTUAL_NUMBER` — your virtual number (e.g. `+254711082XXX`)
   - `AT_VOICE_URL` — `https://voice.africastalking.com`
   - `YOUR_CALLBACK_URL` — your publicly accessible callback URL
3. **Add Make Call request** using `mcp__postman__createCollectionRequest`:
   - Method: POST, URL: `{{AT_VOICE_URL}}/call`
   - Headers: `apikey: {{AT_API_KEY}}`, `Accept: application/json`, `Content-Type: application/x-www-form-urlencoded`
   - Body: `username={{AT_USERNAME}}`, `from={{AT_VIRTUAL_NUMBER}}`, `to=+254712345678`
4. **Add Queue Status request**:
   - Method: POST, URL: `{{AT_VOICE_URL}}/queueStatus`
   - Headers: `apikey: {{AT_API_KEY}}`, `Accept: application/json`
   - Body (raw JSON): `{"username": "{{AT_USERNAME}}", "phoneNumbers": "{{AT_VIRTUAL_NUMBER}}"}`
