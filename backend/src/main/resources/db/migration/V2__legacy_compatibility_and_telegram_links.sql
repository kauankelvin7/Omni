-- V2 is additive so verified existing databases can be explicitly baselined at V1.
-- Existing data is preserved. Resolve inconsistent legacy data before baseline.
ALTER TABLE patients ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;

CREATE TABLE IF NOT EXISTS clinic_settings (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    open_time VARCHAR(255) NOT NULL,
    close_time VARCHAR(255) NOT NULL,
    work_days JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_settings_tenant ON clinic_settings (tenant_id);

-- An emailed sign-in identifies a global account. Refuse ambiguous legacy
-- accounts rather than silently choosing one tenant. An operator must reconcile
-- duplicates before running this migration on an existing production database.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users GROUP BY LOWER(email) HAVING COUNT(*) > 1) THEN
        RAISE EXCEPTION 'Duplicate global email identities found; reconcile before applying V2';
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_global_lower ON users (LOWER(email));

-- Raw Telegram deep-link tokens are NEVER stored. Even database-only read access
-- cannot reconstruct an active link. Short-lived, consumable per-clinic credentials.
CREATE TABLE IF NOT EXISTS patient_telegram_link_tokens (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_telegram_tokens_tenant_patient
    ON patient_telegram_link_tokens (tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_telegram_tokens_expiry
    ON patient_telegram_link_tokens (expires_at);
