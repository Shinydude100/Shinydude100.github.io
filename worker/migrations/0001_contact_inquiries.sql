-- Migration 0001: Create B2B consulting & hiring contact inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  inquiry_type TEXT NOT NULL CHECK (
    inquiry_type IN (
      'enterprise_network',
      'workstation_ai_build',
      'cloudflare_mcp',
      'leadership_hiring',
      'general_consulting'
    )
  ),
  message TEXT NOT NULL,
  ip_hash TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at
  ON contact_inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_inquiry_type_status
  ON contact_inquiries(inquiry_type, status);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email
  ON contact_inquiries(client_email);
