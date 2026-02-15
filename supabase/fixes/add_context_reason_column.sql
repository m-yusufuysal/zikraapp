-- Add context_reason column to daily_quotes table
-- This column stores WHY a particular quote was selected (e.g., "Islamic New Year", "Mother's Day", etc.)
-- It is nullable since older quotes don't have this field.

ALTER TABLE daily_quotes ADD COLUMN IF NOT EXISTS context_reason TEXT;

-- Optional: Add comment for documentation
COMMENT ON COLUMN daily_quotes.context_reason IS 'Reason why this quote was selected for this date (e.g., special Islamic day, world event, seasonal theme)';
