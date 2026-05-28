CREATE TABLE IF NOT EXISTS sms_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL DEFAULT 'INBOUND' CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_created ON sms_messages(created_at DESC);
