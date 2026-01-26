import { useCallback, useEffect, useState } from 'react';
import { generateDhikrWithAI, interpretDreamWithAI } from '../services/aiService';
import { supabase } from '../services/supabase';

/**
 * Custom hook for AI-powered dhikr generation with real-time updates
 * 
 * Usage:
 * const { generateDhikr, result, loading, error } = useAIDhikr();
 * 
 * const handleSubmit = async () => {
 *   await generateDhikr({ name: 'Ahmet', intention: 'İç huzur' }, 'tr');
 * };
 */
export const useAIDhikr = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // Subscribe to real-time updates for dhikr sessions
    useEffect(() => {
        let channel = null;

        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            channel = supabase
                .channel('dhikr-ai-updates')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'dhikr_sessions',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        setResult(payload.new);
                        setLoading(false);
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    const generateDhikr = useCallback(async (payload, language = 'tr') => {
        setLoading(true);
        setError(null);

        const response = await generateDhikrWithAI(payload, language);

        if (!response.success) {
            setError(response.error);
            setLoading(false);
        }
        // Note: Loading will be set to false when real-time update arrives

        return response;
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setLoading(false);
    }, []);

    return { generateDhikr, result, loading, error, reset };
};

/**
 * Custom hook for AI-powered dream interpretation with real-time updates
 * 
 * Usage:
 * const { interpretDream, result, loading, error } = useAIDream();
 * 
 * const handleSubmit = async () => {
 *   await interpretDream({ 
 *     name: 'Ahmet', 
 *     dreamText: 'Rüyamda bir bahçe gördüm...' 
 *   }, 'tr');
 * };
 */
export const useAIDream = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // Subscribe to real-time updates for dream interpretations
    useEffect(() => {
        let channel = null;

        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            channel = supabase
                .channel('dream-ai-updates')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'dream_interpretations',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        setResult(payload.new);
                        setLoading(false);
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    const interpretDream = useCallback(async (payload, language = 'tr') => {
        setLoading(true);
        setError(null);

        const response = await interpretDreamWithAI(payload, language);

        if (!response.success) {
            setError(response.error);
            setLoading(false);
        }
        // Note: Loading will be set to false when real-time update arrives

        return response;
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setLoading(false);
    }, []);

    return { interpretDream, result, loading, error, reset };
};

/**
 * Generic hook for subscribing to AI updates from any table
 * 
 * Usage:
 * const latestData = useAISubscription('dhikr_sessions');
 */
export const useAISubscription = (table) => {
    const [latestData, setLatestData] = useState(null);

    useEffect(() => {
        let channel = null;

        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            channel = supabase
                .channel(`ai-updates-${table}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: table,
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        setLatestData(payload.new);
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [table]);

    return latestData;
};
