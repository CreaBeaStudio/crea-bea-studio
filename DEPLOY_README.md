# CreaBea Studio — Deployment Guide

## How the flow works

1. Customer uploads photo + email + settings on /create
2. Photo goes straight to your **Google Drive folder** via API
3. **You get a notification email** with a link to open it in Drive
4. You run `pbn_generator.py` locally, review the result
5. You email the customer a download link (Google Drive share or WeTransfer)

No Python server needed. No timeouts. Deploy on **Vercel free tier**.

---

## Step 1 – Google Drive Setup (one-time, ~10 min)

### 1a. Create a Google Cloud project
1. Go to https://console.cloud.google.com
2. Create a new project (e.g. "CreaBea Studio")
3. Enable the **Google Drive API**:
   - APIs & Services → Library → search "Google Drive API" → Enable

### 1b. Create a Service Account
1. APIs & Services → Credentials → Create Credentials → Service Account
2. Name it anything (e.g. "crea-bea-drive")
3. Skip optional steps, click Done
4. Click the service account → Keys tab → Add Key → JSON
5. Download the JSON file — keep it safe!

### 1c. Base64-encode the JSON
```bash
# Mac/Linux:
base64 -i your-service-account.json | tr -d '\n'

# Windows (PowerShell):
[Convert]::ToBase64String([IO.File]::ReadAllBytes("your-service-account.json"))
```
Copy the output — this is your `GOOGLE_SERVICE_ACCOUNT_B64`.

### 1d. Create a Drive folder & share it
1. In Google Drive, create a folder: "CreaBea Orders"
2. Right-click → Share → paste the service account email (looks like `name@project.iam.gserviceaccount.com`)
3. Give it **Editor** access
4. Copy the folder ID from the URL: `drive.google.com/drive/folders/`**THIS_PART**

---

## Step 2 – Email Notifications (optional but recommended)

Easiest option: **Resend** (https://resend.com) — free tier: 3,000 emails/month.

1. Sign up, verify your domain (or use their sandbox for testing)
2. Get your API key
3. Set `EMAIL_WEBHOOK_URL=https://api.resend.com/emails`

The `/api/submit-order` route POSTs to this URL with `{ to, subject, html }`.
Resend's API accepts exactly that format. For other providers (Postmark, Mailgun),
you may need to adjust the payload shape in `app/api/submit-order/route.ts`.

**Without email notifications:** Orders still land in Drive. Just check the folder manually.

---

## Step 3 – Deploy to Vercel (free)

```bash
npm install -g vercel
vercel login
vercel --prod
```

In the Vercel dashboard → Settings → Environment Variables, add:
| Variable | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_B64` | (your base64 string) |
| `GOOGLE_DRIVE_FOLDER_ID` | (your folder ID) |
| `NOTIFY_EMAIL` | your@email.com |
| `EMAIL_WEBHOOK_URL` | https://api.resend.com/emails (optional) |

Vercel free tier is plenty — this app is just a Next.js frontend + a small file-upload API.
No Python, no long-running processes, no timeouts.

---

## Step 4 – Local PBN Processing

When an order comes in:
```bash
# Install deps once:
pip install numpy pillow scikit-learn opencv-python scipy

# Process an order (download image from Drive first):
python3 pbn_generator.py \
  --image customer_photo.jpg \
  --colors 24 \
  --output pbn_outline.png \
  --preview

# Or with specific pens from the order metadata:
python3 pbn_generator.py \
  --image customer_photo.jpg \
  --colors 24 \
  --output pbn_outline.png
```

Then share `pbn_outline.png` back to the customer via:
- Google Drive (share link)
- WeTransfer (free, no account needed)
- Email attachment (if file is small enough)

---

## Step 5 – Lemon Squeezy (payments)

1. Create account at https://lemonsqueezy.com
2. Create a Store → add a Product (e.g. "Custom PBN File" at $7.99)
3. Get: Store ID, Variant ID, API Key
4. Add to Vercel env vars
5. The "Order Print" button on the create page links to `/api/checkout`

**Payment flow options:**
- **Pay first, then submit photo**: Add Lemon Squeezy checkout before the upload form
- **Submit photo, pay on delivery**: Send payment link in the fulfilment email
- **Pay now, photo later**: Customer pays, you email them an upload link

For MVP, "submit photo → pay on delivery" is simplest — less friction to start.

---

## Folder structure in Google Drive

Each order creates two files:
```
📁 CreaBea Orders/
  ├── PBN-1234567-ABCD_customer@email.com_level24.jpg   ← their photo
  └── PBN-1234567-ABCD_META.json                        ← order details
```

The META.json contains: orderId, customerEmail, level, pens, notes, timestamp.

---

## Pages
- `/` — Landing page
- `/create` — Order form (upload + settings + email)
- `/color-converter` — Guangna colour finder tool
- `/examples` — Gallery
- `/faq` — FAQ
