import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { ArrowLeft, Map as MapIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

const MosqueFinderScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { ramadanModeEnabled } = useTheme();

    const [location, setLocation] = useState(null);
    const [mosques, setMosques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg(t('mosque_finder.error_loc'));
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });

            fetchMosques(loc.coords.latitude, loc.coords.longitude);
        })();
    }, []);

    const fetchMosques = async (lat, lon) => {
        try {
            // Overpass API Query for Mosques within 5km radius
            const radius = 5000;
            const query = `
                [out:json];
                (
                  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
                  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
                  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
                );
                out center;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });

            const data = await response.json();

            const places = data.elements.map(el => ({
                id: el.id,
                name: el.tags?.name || (el.tags?.["name:en"] || "Mosque"),
                lat: el.lat || el.center.lat,
                lon: el.lon || el.center.lon
            })).filter(p => p.lat && p.lon);

            setMosques(places);
        } catch (error) {
            console.error("Error fetching mosques:", error);
            setErrorMsg(t('mosque_finder.error_load'));
        } finally {
            setLoading(false);
        }
    };

    const openMapsApp = (lat, lon, label) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lon}`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: ramadanModeEnabled ? '#1a1a1a' : '#FFF' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={ramadanModeEnabled ? '#FFF' : COLORS.matteBlack} />
                </TouchableOpacity>
                <Text style={[styles.title, ramadanModeEnabled && { color: '#FFF' }]}>
                    {t('mosque_finder.title')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.matteGreen} />
                    <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>{t('loading')}</Text>
                </View>
            ) : location ? (
                <MapView
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={location}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {mosques.map((mosque) => (
                        <Marker
                            key={mosque.id}
                            coordinate={{ latitude: mosque.lat, longitude: mosque.lon }}
                            title={mosque.name}
                            description={t('mosque_finder.tap_for_directions')}
                            onCalloutPress={() => openMapsApp(mosque.lat, mosque.lon, mosque.name)}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.markerBubble}>
                                    <LinearGradient
                                        colors={[COLORS.matteGreen, COLORS.primaryDark]}
                                        style={styles.markerGradient}
                                    >
                                        <MapIcon size={16} color="#FFF" />
                                    </LinearGradient>
                                </View>
                                <View style={styles.markerArrow} />
                            </View>
                        </Marker>
                    ))}
                </MapView>
            ) : (
                <View style={styles.center}>
                    <Text style={{ color: 'red' }}>{errorMsg || t('location_error')}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 10
    },
    backButton: { padding: 4 },
    title: { fontSize: 18, fontWeight: 'bold', color: COLORS.matteBlack },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    map: { width: '100%', height: '100%' },
    markerContainer: { alignItems: 'center' },
    markerBubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
        padding: 2,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
    },
    markerGradient: {
        flex: 1,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center'
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 0,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFF',
        marginTop: -1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    callout: {
        width: 140,
        padding: 5,
        alignItems: 'center'
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 5,
        textAlign: 'center'
    },
    directionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginTop: 2
    },
    directionText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 4
    }
});

export default MosqueFinderScreen;
