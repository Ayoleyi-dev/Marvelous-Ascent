-- Database schema for project enquiries. Apply with wrangler before deployment.
-- Access must remain private: do not expose D1 API credentials in browser code.
CREATE TABLE IF NOT EXISTS leads (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 company TEXT NOT NULL DEFAULT '',
 country TEXT NOT NULL DEFAULT '',
 service TEXT NOT NULL,
 challenge TEXT NOT NULL,
 tools TEXT NOT NULL DEFAULT '',
 timing TEXT NOT NULL,
 budget TEXT NOT NULL DEFAULT '',
 privacy_consent INTEGER NOT NULL CHECK(privacy_consent=1),
 source TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'new',
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status,created_at);
