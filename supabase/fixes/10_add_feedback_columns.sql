-- Add feedback column to dream_interpretations
ALTER TABLE dream_interpretations 
ADD COLUMN IF NOT EXISTS feedback text CHECK (feedback IN ('good', 'bad'));

-- Add feedback column to dhikr_sessions
ALTER TABLE dhikr_sessions 
ADD COLUMN IF NOT EXISTS feedback text CHECK (feedback IN ('good', 'bad'));
