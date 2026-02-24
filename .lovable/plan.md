

# Email-to-Document AI Pipeline -- Full Plan

## Overview

This plan details the complete architecture for automatically receiving emails at a dedicated address, extracting document attachments, parsing them with AI (OCR + summarization), storing them in Supabase, and notifying the user with "N new documents synced from email."

Since you're connecting your own Supabase (not through Lovable), I'll outline what you need to configure on the Supabase side and the code changes needed in the app.

---

## Architecture

```text
Office Scanner / User
        |
        v
  Email sent to docs+company@docbox.app
        |
        v
  Email Service (SendGrid Inbound Parse / Postmark / Mailgun)
        |
        v  POST webhook with attachments
  Supabase Edge Function: "ingest-email"
        |
        +---> Store raw file in Supabase Storage (bucket: "documents")
        +---> Call AI Edge Function: "parse-document"
                    |
                    +---> OCR (if scanned PDF)
                    +---> AI summarization + field extraction
                    +---> Insert parsed document record into "documents" table
                    +---> Insert notification record into "notifications" table
                    |
        v
  Frontend polls / subscribes via Supabase Realtime
        |
        +---> New documents appear in Documents page
        +---> Notification: "5 new documents synced from email"
```

---

## Phase 1: Supabase Setup (Manual -- Your Side)

You will need to create the following in your Supabase project:

### Database Tables

**`documents` table** -- mirrors the existing `Document` type:
- `id` (uuid, PK, default gen_random_uuid())
- `filename` (text)
- `title` (text)
- `upload_date` (timestamptz, default now())
- `uploader` (text)
- `uploader_id` (uuid, FK to auth.users)
- `source` (text) -- 'manual_upload' | 'scan_to_email' | 'gmail' | 'outlook' | 'whatsapp'
- `status` (text) -- 'parsed' | 'needs_review' | 'processing'
- `tags` (text[])
- `category` (text)
- `folder_id` (text, nullable)
- `file_size` (bigint)
- `file_type` (text)
- `ai_summary` (text, nullable)
- `extracted_fields` (jsonb, nullable)
- `storage_path` (text) -- path in Supabase Storage
- `is_starred` (boolean, default false)
- `is_trashed` (boolean, default false)
- `trashed_at` (timestamptz, nullable)

**`notifications` table** -- mirrors the existing `Notification` type:
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `type` (text)
- `title` (text)
- `description` (text)
- `timestamp` (timestamptz, default now())
- `read` (boolean, default false)
- `archived` (boolean, default false)
- `action_url` (text, nullable)

### Storage Bucket
- Bucket name: `documents` (private)

### Secrets (via Supabase Dashboard > Edge Functions > Secrets)
- `OPENAI_API_KEY` -- for AI parsing/summarization
- `SENDGRID_WEBHOOK_SECRET` (or equivalent) -- to verify inbound email webhooks

---

## Phase 2: Edge Functions

### Edge Function 1: `ingest-email`

Receives the webhook POST from the email service.

**Logic:**
1. Verify webhook signature (security)
2. Extract sender, subject, and file attachments from the multipart form data
3. For each attachment:
   - Upload to Supabase Storage (`documents/{timestamp}_{filename}`)
   - Insert a row into `documents` table with `status: 'processing'`, `source: 'scan_to_email'`
   - Call `parse-document` function (or invoke it async)
4. After all attachments are processed, insert one notification:
   - title: `"{N} new document(s) synced from email"`
   - description: `"Your scan-to-email address received {N} documents from {sender}."`
   - type: `'document_sync'`
   - action_url: `'/documents'`
5. Return 200 OK to the email service

### Edge Function 2: `parse-document`

Handles AI processing of a single document.

**Logic:**
1. Receive `{ document_id, storage_path }` as input
2. Download the file from Supabase Storage
3. If PDF, convert to text (use pdf-parse or send to OpenAI vision)
4. Send text to OpenAI API:
   - Generate summary (2-3 sentences)
   - Extract fields: Document Type, Date, Reference Number, Key Parties, Amounts
   - Suggest tags and category
5. Update the `documents` row:
   - `status` -> `'parsed'`
   - `ai_summary` -> generated summary
   - `extracted_fields` -> extracted JSON
   - `tags` -> suggested tags
   - `category` -> suggested category

---

## Phase 3: Frontend Code Changes

### 3a. Supabase Client Setup

Create `src/integrations/supabase/client.ts`:
- Initialize the Supabase JS client using environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### 3b. Migrate AppContext from Mock to Supabase

Update `src/context/AppContext.tsx`:
- Replace `mockDocuments` with a query to the `documents` table on mount
- Replace `addDocuments` to insert into Supabase
- Replace `updateDocument`, `deleteDocuments`, `trashDocuments`, `restoreDocuments`, `permanentlyDeleteDocuments` to use Supabase operations
- Subscribe to Supabase Realtime on the `documents` table so new email-ingested docs appear live

### 3c. Migrate NotificationContext to Supabase

Update `src/context/NotificationContext.tsx`:
- Replace `mockNotifications` with a query to the `notifications` table
- Subscribe to Supabase Realtime on the `notifications` table for INSERT events
- When a new notification arrives (e.g., `type: 'document_sync'`), it appears automatically in the notification popover with the message "N new documents synced from email"
- `markAsRead`, `archiveNotification`, etc. become Supabase UPDATE calls

### 3d. Upload Flow Update

Update `src/components/documents/UploadModal.tsx`:
- On manual upload, actually upload the file to Supabase Storage
- Insert the document record into the `documents` table
- Optionally trigger the `parse-document` edge function for AI processing of manually uploaded files too

### 3e. Notification Display

The existing `NotificationPopover` component already renders notifications by type. The new `document_sync` notifications from the edge function will display naturally with the existing UI -- showing the bell icon badge and the "N new documents synced from email" message.

---

## Phase 4: Email Service Configuration (Your Side)

1. **Choose a provider**: SendGrid Inbound Parse is recommended (free tier available)
2. **Set up an MX record** for your domain pointing to the provider
3. **Configure the webhook URL** to point to your Supabase edge function:
   `https://<your-project>.supabase.co/functions/v1/ingest-email`
4. **Set the inbound email address**: `docs+company@yourdomain.com`

---

## Summary of Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/integrations/supabase/client.ts` | Create | Supabase JS client |
| `supabase/functions/ingest-email/index.ts` | Create | Webhook receiver for inbound emails |
| `supabase/functions/parse-document/index.ts` | Create | AI document parsing |
| `supabase/config.toml` | Create | Edge function config (verify_jwt = false for webhook) |
| `src/context/AppContext.tsx` | Modify | Replace mock data with Supabase queries + realtime |
| `src/context/NotificationContext.tsx` | Modify | Replace mock data with Supabase queries + realtime for sync notifications |
| `src/components/documents/UploadModal.tsx` | Modify | Upload to Supabase Storage instead of simulating |
| `src/types/index.ts` | Modify | Minor adjustments (add `storage_path` to Document type) |

