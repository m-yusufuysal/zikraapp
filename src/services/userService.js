import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

/**
 * User Profile Service
 * Handles persisting and loading user profile data
 */

export const getCurrentProfile = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Try cache first
        const cached = await AsyncStorage.getItem(`profile_${user.id}`);
        if (cached) {
            // Return cached but still fetch fresh in background
            const profile = JSON.parse(cached);
            getUserProfile(user.id).then(fresh => {
                if (fresh) {
                    AsyncStorage.setItem(`profile_${user.id}`, JSON.stringify(fresh));
                }
            });
            return profile;
        }

        // No cache, fetch and save
        const profile = await getUserProfile(user.id);
        if (profile) {
            await AsyncStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
        }
        return profile;
    } catch (error) {
        console.error('getCurrentProfile Error:', error);
        return null;
    }
};

export const getUserProfile = async (userId) => {
    try {
        // 1. Fetch public profile
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (pError) {
            console.error('Error fetching public profile:', pError);
            return null;
        }

        // 2. Fetch private profile (only for the owner)
        const { data: privateProfile, error: prError } = await supabase
            .from('profiles_private')
            .select('*')
            .eq('id', userId)
            .single();

        // If private profile doesn't exist, we just return public one
        if (prError && prError.code !== 'PGRST116') {
            console.warn('Error fetching private profile:', prError);
        }

        return {
            ...profile,
            ...(privateProfile || {})
        };
    } catch (error) {
        console.error('getUserProfile Catch:', error);
        return null;
    }
};

export const updateUserProfile = async (userId, updates) => {
    try {
        const privateFields = ['birth_date', 'birth_time', 'birth_place', 'machine_id'];

        const publicUpdates = {};
        const privateUpdates = {};

        Object.keys(updates).forEach(key => {
            if (privateFields.includes(key)) {
                privateUpdates[key] = updates[key];
            } else {
                publicUpdates[key] = updates[key];
            }
        });

        const promises = [];

        // Update public profiles
        if (Object.keys(publicUpdates).length > 0) {
            promises.push(
                supabase
                    .from('profiles')
                    .update({
                        ...publicUpdates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId)
            );
        }

        // Update private profiles
        if (Object.keys(privateUpdates).length > 0) {
            promises.push(
                supabase
                    .from('profiles_private')
                    .update({
                        ...privateUpdates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId)
            );
        }

        const results = await Promise.all(promises);
        const error = results.find(r => r.error);

        if (error) {
            console.error('Error updating profile:', error.error);
            return false;
        }

        // Invalidate cache
        await AsyncStorage.removeItem(`profile_${userId}`);

        return true;
    } catch (error) {
        console.error('updateUserProfile Catch:', error);
        return false;
    }
};

export const syncMachineId = async (userId, machineId) => {
    try {
        const { error } = await supabase
            .from('profiles_private')
            .update({ machine_id: machineId })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("syncMachineId error:", e);
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
