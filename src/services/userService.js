import { supabase } from './supabase';

/**
 * User Profile Service
 * Handles persisting and loading user profile data
 */

export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('getUserProfile Catch:', error);
        return null;
    }
};

export const updateUserProfile = async (userId, updates) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('updateUserProfile Catch:', error);
        return false;
    }
};

/**
 * Settings Service
 */
export const getUserSettings = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('getUserSettings Catch:', error);
        return null;
    }
};

export const updateUserSettings = async (userId, updates) => {
    try {
        const { error } = await supabase
            .from('settings')
            .update(updates)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating settings:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('updateUserSettings Catch:', error);
        return false;
    }
};
