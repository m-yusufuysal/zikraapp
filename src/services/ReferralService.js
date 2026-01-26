import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const REFERRAL_STORAGE_KEY = 'pending_referral_code';

/**
 * Referral Service
 * Handles capturing, storing and linking referral codes.
 */
export const saveReferralCode = async (code) => {
    if (!code) return;
    try {
        await AsyncStorage.setItem(REFERRAL_STORAGE_KEY, code);
        // Track the click anonymously in Supabase
        await recordClick(code);
    } catch (e) {
        console.error('Error saving referral code:', e);
    }
};

export const getReferralCode = async () => {
    try {
        return await AsyncStorage.getItem(REFERRAL_STORAGE_KEY);
    } catch (e) {
        console.error('Error getting referral code:', e);
        return null;
    }
};

export const linkUserToReferral = async (userId, code) => {
    if (!userId || !code) return;
    try {
        // 1. Find influencer by code
        const { data: influencer, error: infError } = await supabase
            .from('influencers')
            .select('id')
            .eq('referral_code', code)
            .single();

        if (infError || !influencer) {
            console.warn('Influencer not found for code:', code);
            return;
        }

        // 2. Insert or Update referral record
        const { error: refError } = await supabase
            .from('referrals')
            .insert({
                influencer_id: influencer.id,
                referred_user_id: userId,
                status: 'registered'
            });

        if (refError) {
            console.error('Error linking referral:', refError);
        } else {
            // Clean up stored code after successful link
            await AsyncStorage.removeItem(REFERRAL_STORAGE_KEY);
        }
    } catch (e) {
        console.error('linkUserToReferral Catch:', e);
    }
};

export const recordClick = async (code) => {
    try {
        const { data: influencer } = await supabase
            .from('influencers')
            .select('id')
            .eq('referral_code', code)
            .single();

        if (influencer) {
            await supabase
                .from('referrals')
                .insert({
                    influencer_id: influencer.id,
                    status: 'clicked'
                });
        }
    } catch (e) {
        // Silent fail for clicks
    }
};

export const getInfluencerDashboardData = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('influencer_dashboard_stats')
            .select('*')
            .eq('owner_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('getInfluencerDashboardData Error:', e);
        return null;
    }
};

export const getDetailedReferrals = async (influencerId) => {
    try {
        const { data, error } = await supabase
            .from('referrals')
            .select(`
                id,
                status,
                created_at,
                converted_at,
                profiles:referred_user_id (
                    full_name
                )
            `)
            .eq('influencer_id', influencerId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Mask names for privacy
        return data.map(ref => ({
            ...ref,
            userName: ref.profiles?.full_name
                ? maskName(ref.profiles.full_name)
                : 'Misafir Kullanıcı'
        }));
    } catch (e) {
        console.error('getDetailedReferrals Error:', e);
        return [];
    }
};

const maskName = (name) => {
    if (!name) return '***';
    const parts = name.split(' ');
    return parts.map(p => {
        if (p.length <= 2) return p;
        return p.substring(0, 2) + '*'.repeat(p.length - 2);
    }).join(' ');
};
