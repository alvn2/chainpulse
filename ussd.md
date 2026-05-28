---
name: africastalking-ussd
description: Africa's Talking USSD API — build USSD callback handlers, parse session text, implement CON/END flow, set up sandbox channels with ngrok, debug common issues, and create Postman collections
---

# Africa's Talking USSD API

You are an expert on the Africa's Talking USSD API. When a user asks you to help with USSD — building a USSD menu, handling sessions, setting up the sandbox, debugging errors, or creating Postman collections — use this skill to guide them accurately.

---

## How USSD Works

USSD is **callback-based** — you do not make outbound requests. Instead:

1. A user dials a USSD code (e.g. `*384*1234#`) on their phone
2. Africa's Talking sends a `POST` request to **your registered callback URL**
3. Your server processes the request and responds with a **plain text** string
4. The response is shown to the user on their phone
5. If the session continues (`CON`), steps 2–4 repeat for each user input

You only need **one endpoint** on your server (e.g. `/ussd`).

---

## Account Setup

1. Sign up / login at https://account.africastalking.com/
2. Create a **Team** → click team → create an **App**
3. Get API key from app dashboard → **Settings**

**For Sandbox USSD**:
1. Click the orange **"Go To Sandbox App"** button on the main dashboard
2. In the sandbox dashboard sidebar: **USSD** → **Create Channel**
   - Direct URL: https://account.africastalking.com/apps/sandbox/ussd/channel/create
3. Enter any 5-digit number as the channel code (e.g. `12345`)
4. Set the callback URL to your publicly accessible server URL (see ngrok setup below)
5. Your callback URL must end with your route path (e.g. `https://abc123.ngrok.io/ussd`)
6. **Maximum 2 channels** allowed in the sandbox at one time

**For Production USSD**:
- Request a dedicated service code from AT support: `support@africastalking.com`

---

## Local Development with ngrok

For local development, expose your server with ngrok:

```sh
# Install ngrok from https://ngrok.com/
ngrok http 5001  # replace 5001 with your port
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`) and set it as your callback URL in the AT sandbox dashboard:
```
https://abc123.ngrok.io/ussd
```

---

## Callback Request (AT → Your Server)

**Method**: `POST`
**Content-Type**: `application/x-www-form-urlencoded`

**Body Parameters**:

| Parameter | Description |
|-----------|-------------|
| `sessionId` | Unique ID for this USSD session |
| `serviceCode` | The USSD code dialed (e.g. `*384*12345#`) |
| `phoneNumber` | The user's phone number in E.164 format |
| `text` | Cumulative user input for this session (see below) |
| `networkCode` | The user's carrier network code |

---

## The `text` Parameter

The `text` value is **cumulative** — it builds up with each interaction, separated by `*`.

| User action | `text` value |
|-------------|-------------|
| First dial (no input yet) | `""` (empty string) |
| User selects option 1 | `"1"` |
| User selects 2 after selecting 1 | `"1*2"` |
| User selects 3 after 1 then 2 | `"1*2*3"` |

Always parse `text` by splitting on `*` or matching exact strings:

```js
if (text === '') { /* first screen */ }
if (text === '1') { /* user selected 1 from first menu */ }
if (text === '1*2') { /* user selected 1, then 2 */ }
```

---

## Your Response Format

Your server must respond with **plain text** — no JSON, no HTML.

| Prefix | Meaning | Example |
|--------|---------|---------|
| `CON ` | Continue session — show text and wait for more input | `CON Choose:\n1. Balance\n2. Airtime` |
| `END ` | End session — show final message and close | `END Your balance is KES 500` |

**Important rules**:
- `CON` and `END` must be **uppercase** followed by a **single space**
- Set `Content-Type: text/plain` on your response
- Use `\n` for new lines in the menu

---

## Implementation Examples

### Node.js (Express)

```js
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

app.post('/ussd', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  let response = '';

  if (text === '') {
    // First screen
    response = 'CON Welcome! What would you like to do?\n';
    response += '1. Check Balance\n';
    response += '2. My Phone Number';

  } else if (text === '1') {
    // User selected "Check Balance"
    response = 'CON Choose balance type:\n';
    response += '1. Account Balance\n';
    response += '2. Airtime Balance';

  } else if (text === '1*1') {
    // User selected Balance → Account Balance
    response = 'END Your account balance is KES 10,000';

  } else if (text === '1*2') {
    // User selected Balance → Airtime Balance
    response = 'END Your airtime balance is KES 50';

  } else if (text === '2') {
    // User selected "My Phone Number"
    response = 'END Your phone number is ' + phoneNumber;

  } else {
    response = 'END Invalid selection. Please try again.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

app.listen(5001, () => console.log('USSD server running on port 5001'));
```

### Python / Flask

```python
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/ussd', methods=['POST', 'GET'])
def ussd_callback():
    session_id = request.values.get('sessionId')
    service_code = request.values.get('serviceCode')
    phone_number = request.values.get('phoneNumber')
    text = request.values.get('text', '')

    if text == '':
        response = 'CON Welcome! What would you like to do?\n'
        response += '1. Check Balance\n'
        response += '2. My Phone Number'

    elif text == '1':
        response = 'CON Choose balance type:\n'
        response += '1. Account Balance\n'
        response += '2. Airtime Balance'

    elif text == '1*1':
        response = 'END Your account balance is KES 10,000'

    elif text == '1*2':
        response = 'END Your airtime balance is KES 50'

    elif text == '2':
        response = 'END Your phone number is ' + phone_number

    else:
        response = 'END Invalid selection. Please try again.'

    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

### Python / Django

```python
# views.py
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def ussd_callback(request):
    session_id = request.POST.get('sessionId')
    service_code = request.POST.get('serviceCode')
    phone_number = request.POST.get('phoneNumber')
    text = request.POST.get('text', '')

    if text == '':
        response = 'CON Welcome! What would you like to do?\n'
        response += '1. Check Balance\n'
        response += '2. My Phone Number'
    elif text == '1':
        response = 'CON Choose balance type:\n1. Account Balance\n2. Airtime Balance'
    elif text == '1*1':
        response = 'END Your account balance is KES 10,000'
    elif text == '1*2':
        response = 'END Your airtime balance is KES 50'
    elif text == '2':
        response = 'END Your phone number is ' + phone_number
    else:
        response = 'END Invalid selection.'

    return HttpResponse(response, content_type='text/plain')

# urls.py
from django.urls import path
from . import views
urlpatterns = [path('ussd/', views.ussd_callback, name='ussd')]
```

---

## Session Text Parsing Tips

For complex menus, split the `text` value for easier handling:

```js
const parts = text.split('*');
const level = parts.length;

if (level === 1 && parts[0] === '') {
  // First screen (text is empty)
} else if (level === 1) {
  // First menu selection: parts[0]
} else if (level === 2) {
  // Second level: parts[0] = first choice, parts[1] = second choice
}
```

---

## Common Errors & Fixes

### USSD menu shows error / not responding
- Callback URL must be **publicly accessible** — not `localhost`
- Use ngrok: `ngrok http 5001` → copy the HTTPS URL
- Register the full callback path in AT sandbox: `https://abc123.ngrok.io/ussd`

### Session immediately ends with "END" when it should continue
- You responded with `END` instead of `CON`
- Remember: `CON` = continue, `END` = terminate
- Check the prefix is uppercase with a space: `"CON "` not `"Con"` or `"CON\n"`

### User gets "Invalid Input" on every selection
- Check your `text` matching — the value is cumulative with `*` separators
- `text === '1'` handles first selection, but `text === '1*1'` handles second level
- Use `console.log(text)` or `print(text)` to debug incoming values

### Content-Type error / garbled response
- Set `Content-Type: text/plain` explicitly
- In Flask: `return response` (Flask auto-sets text/plain for string returns)
- In Django: use `HttpResponse(response, content_type='text/plain')`
- In Express: `res.set('Content-Type', 'text/plain'); res.send(response)`

### Cannot create more than 2 channels in sandbox
- Sandbox is limited to 2 USSD channels
- Delete an existing channel before creating a new one
- URL: https://account.africastalking.com/apps/sandbox/ussd/channel/create

### Production service code needed
- Contact AT support: `support@africastalking.com`
- Alternatively, visit https://africastalking.com/about/#contactus

---

## Testing USSD in Sandbox

The AT sandbox includes a **USSD simulator** that lets you test your flow without a real phone:
1. Login → orange "Go To Sandbox App" button
2. In sandbox dashboard: **Launch Simulator**
3. Enter the phone number and dial your channel code (e.g. `*384*12345#`)
4. Interact with the menu just like on a real phone

---

## Postman Collection Setup

USSD is server-side only (AT calls you, not the other way around), but you can simulate AT's request to your server using Postman for testing.

If the user asks to create a Postman collection for USSD testing, use the Postman MCP tools:

1. **Create collection** using `mcp__postman__createCollection` with name "Africa's Talking USSD"
2. **Create environment** using `mcp__postman__createEnvironment` with variables:
   - `USSD_CALLBACK_URL` — your local or ngrok URL (e.g. `https://abc123.ngrok.io/ussd`)
   - `PHONE_NUMBER` — test phone number (e.g. `+254712345678`)
   - `SERVICE_CODE` — your USSD channel code (e.g. `*384*12345#`)
3. **Add Simulate First Dial request**:
   - Method: POST, URL: `{{USSD_CALLBACK_URL}}`
   - Body (x-www-form-urlencoded):
     - `sessionId=test-session-001`
     - `serviceCode={{SERVICE_CODE}}`
     - `phoneNumber={{PHONE_NUMBER}}`
     - `text=` (empty — first dial)
     - `networkCode=63902`
4. **Add Simulate Menu Selection request**:
   - Same as above but `text=1` (or `text=1*2` for second level)
