import * as Keychain from 'react-native-keychain';

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const SERVICE_NAME = 'islamvy_device_id';

/**
 * Gets or generates a stable unique identifier for this device.
 * Stored in the native Keychain so it survives app re-installs.
 */
export const getMachineId = async () => {
    try {
        const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });

        if (credentials) {
            return credentials.password;
        }

        // Generate a new one if not found
        const newMachineId = generateUUID();
        await Keychain.setGenericPassword('device', newMachineId, { service: SERVICE_NAME });
        return newMachineId;
    } catch (error) {
        console.error("Machine ID retrieval failed:", error);
        // Fallback to a temporary ID (less safe but prevents crashing)
        return 'unknown_device_' + Date.now();
    }
};
