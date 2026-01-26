import { supabase } from './supabase';

// Get credentials from the already initialized supabase client
const SUPABASE_URL = supabase.supabaseUrl;
const SUPABASE_ANON_KEY = supabase.supabaseKey;

export const getDailyQuote = async (language = 'en', date = null) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/get-daily-quote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ language, date })
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching daily quote:', error);
        return null;
    }
};
