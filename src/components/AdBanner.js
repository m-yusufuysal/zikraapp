import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// AdMob disabled for development - will be re-enabled for production build
const AdBanner = () => {
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const checkPremium = async () => {
            const status = await AsyncStorage.getItem('isPremium');
            setIsPremium(status === 'true');
        };
        checkPremium();
    }, []);

    if (isPremium) return null;

    // Return empty view to maintain layout spacing if needed in dev, 
    // or actual AdMob component in prod.
    return null;
};

export default AdBanner;
