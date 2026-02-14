import { MMKV } from "react-native-mmkv";
/**
 * Secure Storage Utility
 * 
 * Purpose: Security-hardened storage for sensitive and non-sensitive data.
 * - Keychain (iOS) / Keystore (Android) for tokens and secrets
 * - MMKV (encrypted) for settings and non-sensitive fast-access data
 */
import * as Keychain from 'react-native-keychain';

// === MMKV (Fast, Encrypted for Settings) ===
const storage = new MMKV({
    id: 'zikra-secure-settings',
    encryptionKey: 'zikra-mmkv-key-v1', // In production, derive from device secret
});

/**
 * Store non-sensitive setting
 */
export const setSetting = (key, value) => {
    if (typeof value === 'string') {
        storage.set(key, value);
    } else if (typeof value === 'number') {
        storage.set(key, value);
    } else if (typeof value === 'boolean') {
        storage.set(key, value);
    } else {
        storage.set(key, JSON.stringify(value));
    }
};

/**
 * Get non-sensitive setting
 */
export const getSetting = (key, defaultValue = null) => {
    const value = storage.getString(key);
    if (value === undefined) return defaultValue;

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

/**
 * Delete setting
 */
export const deleteSetting = (key) => {
    storage.delete(key);
};

// === KEYCHAIN (For Secrets like Tokens) ===

const KEYCHAIN_SERVICE = 'com.zikraapp.secrets';

/**
 * Store secret in Keychain/Keystore (e.g., auth tokens)
 */
export const setSecret = async (key, value) => {
    try {
        await Keychain.setGenericPassword(key, value, {
            service: `${KEYCHAIN_SERVICE}.${key}`,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        });
        return true;
    } catch (error) {
        console.error('[SecureStorage] Failed to save secret:', error);
        return false;
    }
};

/**
 * Get secret from Keychain/Keystore
 */
export const getSecret = async (key) => {
    try {
        const result = await Keychain.getGenericPassword({
            service: `${KEYCHAIN_SERVICE}.${key}`,
        });
        if (result) {
            return result.password;
        }
        return null;
    } catch (error) {
        console.error('[SecureStorage] Failed to get secret:', error);
        return null;
    }
};

/**
 * Delete secret from Keychain/Keystore
 */
export const deleteSecret = async (key) => {
    try {
        await Keychain.resetGenericPassword({
            service: `${KEYCHAIN_SERVICE}.${key}`,
        });
        return true;
    } catch (error) {
        console.error('[SecureStorage] Failed to delete secret:', error);
        return false;
    }
};

/**
 * Check if secret exists
 */
export const hasSecret = async (key) => {
    const secret = await getSecret(key);
    return secret !== null;
};
