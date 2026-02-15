import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

// REVENUECAT API KEYS - TO BE FILLED BY USER
const API_KEYS = {
    apple: "appl_mNkJUOEFBzktGDrWphFPoxMhXkB", // Production Key
    google: "" // Android key not provided yet
};

const RevenueCatContext = createContext(null);

export const RevenueCatProvider = ({ children }) => {
    const { t } = useTranslation();
    const [currentOffering, setCurrentOffering] = useState(null);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [isPro, setIsPro] = useState(false);
    const [premiumTier, setPremiumTier] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initRevenueCat();
    }, []);

    const initRevenueCat = async () => {
        try {
            if (Platform.OS === 'ios') {
                Purchases.configure({ apiKey: API_KEYS.apple });
            } else if (Platform.OS === 'android') {
                Purchases.configure({ apiKey: API_KEYS.google });
            }

            // Get initial info
            const info = await Purchases.getCustomerInfo();
            setCustomerInfo(info);
            await checkProStatus(info);

            // Load offerings
            await loadOfferings();

        } catch (error) {
            console.log("RevenueCat Init Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();

            // === DEEP DEBUG LOGGING ===
            console.log("========== REVENUECAT DEBUG ==========");
            console.log("offerings.current:", offerings.current ? "EXISTS" : "NULL");
            console.log("offerings.all keys:", Object.keys(offerings.all));

            // Log each offering and its packages
            Object.entries(offerings.all).forEach(([key, offering]) => {
                console.log(`\n--- Offering: "${key}" ---`);
                console.log(`  identifier: ${offering.identifier}`);
                console.log(`  availablePackages count: ${offering.availablePackages?.length || 0}`);
                offering.availablePackages?.forEach((pkg, i) => {
                    console.log(`  Package[${i}]:`);
                    console.log(`    identifier: "${pkg.identifier}"`);
                    console.log(`    packageType: "${pkg.packageType}"`);
                    console.log(`    product.identifier: "${pkg.product?.identifier}"`);
                    console.log(`    product.title: "${pkg.product?.title}"`);
                    console.log(`    product.priceString: "${pkg.product?.priceString}"`);
                });
            });
            console.log("========== END DEBUG ==========");

            if (offerings.current !== null) {
                setCurrentOffering(offerings.current);
            } else {
                // FALLBACK: Try to find 'default' (as requested) or 'Default' provided by user
                // Also adding a smarter search for any case-insensitive match
                let fallback = offerings.all['default'] || offerings.all['Default'];

                if (!fallback) {
                    // Search case-insensitive
                    const key = Object.keys(offerings.all).find(k => k.toLowerCase() === 'default');
                    if (key) fallback = offerings.all[key];
                }

                if (fallback) {
                    setCurrentOffering(fallback);
                } else {
                    console.log("No current or Default offering found. Available streams:", Object.keys(offerings.all));
                    // Supressed alert to avoid user annoyance if fallback fails
                    if (__DEV__) {
                        console.log("RevenueCat Debug: No 'current' offering found.");
                    }
                }
            }
        } catch (error) {
            console.error("Error loading offerings:", error);
            // Alert suppressed. Check logs for details.
        }
    };

    const checkProStatus = async (info) => {
        console.log("RevenueCat Checking Status:", JSON.stringify(info?.entitlements?.active, null, 2));

        // Check for any common entitlement names if 'pro' is missing
        const activeEntitlements = info?.entitlements?.active || {};
        const hasPro = activeEntitlements["pro"] || activeEntitlements["premium"] || activeEntitlements["starter"] || activeEntitlements["com.esat.islamvy.pro"];

        if (hasPro) {
            setIsPro(true);
            await AsyncStorage.setItem('isPremium', 'true');

            // Detect specific tier from active entitlements
            let detectedTier = 'starter'; // default
            if (activeEntitlements["unlimited"] || activeEntitlements["com.esat.islamvy.unlimited"]) {
                detectedTier = 'unlimited';
            } else if (activeEntitlements["pro"] || activeEntitlements["com.esat.islamvy.pro"]) {
                detectedTier = 'pro';
            } else if (activeEntitlements["starter"] || activeEntitlements["com.esat.islamvy.starter"]) {
                detectedTier = 'starter';
            } else if (activeEntitlements["premium"]) {
                detectedTier = 'pro'; // Map generic "premium" to pro
            }

            setPremiumTier(detectedTier);
            await AsyncStorage.setItem('premiumTier', detectedTier);
        } else {
            setIsPro(false);
            setPremiumTier(null);
            await AsyncStorage.setItem('isPremium', 'false');
            await AsyncStorage.removeItem('premiumTier');
        }
    };

    const purchasePackage = async (packageToPurchase) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
            setCustomerInfo(customerInfo);
            await checkProStatus(customerInfo);
            return true;
        } catch (error) {
            if (!error.userCancelled) {
                Alert.alert(t('premium.purchase_error_title'), error.message);
            }
            return false;
        }
    };

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            await checkProStatus(info);

            if (info?.entitlements?.active?.["pro"]) {
                Alert.alert(t('premium.restore_success_title'), t('premium.restore_success_msg'));
                return true;
            } else {
                Alert.alert(t('premium.restore_info_title'), t('premium.restore_fail_msg'));
                return false;
            }
        } catch (error) {
            Alert.alert(t('premium.restore_error_title'), t('premium.restore_error_prefix') + error.message);
            return false;
        }
    };

    return (
        <RevenueCatContext.Provider value={{
            currentOffering,
            customerInfo,
            isPro,
            premiumTier,
            purchasePackage,
            restorePurchases,
            loading
        }}>
            {children}
        </RevenueCatContext.Provider>
    );
};

export const useRevenueCat = () => {
    const context = useContext(RevenueCatContext);
    if (!context) {
        throw new Error('useRevenueCat must be used within a RevenueCatProvider');
    }
    return context;
};
