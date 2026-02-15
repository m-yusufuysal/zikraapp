import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

const AdminSettingsScreen = () => {
    const navigation = useNavigation();

    const handleAction = (action) => {
        Alert.alert('Admin İşlemi', `${action} işlemi henüz aktif değil.`);
    };

    const settingsGroups = [
        {
            title: 'Sistem',
            items: [
                { id: 'cache', label: 'Önbelliği Temizle', icon: 'trash-outline', action: () => handleAction('Önbellek Temizleme') },
                { id: 'logs', label: 'Sistem Logları', icon: 'list-outline', action: () => handleAction('Log Görüntüleme') },
            ]
        },
        {
            title: 'Kullanıcı',
            items: [
                { id: 'roles', label: 'Rol Yönetimi', icon: 'people-outline', action: () => handleAction('Rol Yönetimi') },
                { id: 'bans', label: 'Yasaklı Kullanıcılar', icon: 'ban-outline', action: () => handleAction('Yasaklı Listesi') },
            ]
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Ayarları</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {settingsGroups.map((group, index) => (
                    <View key={index} style={styles.group}>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        <View style={styles.card}>
                            {group.items.map((item, idx) => (
                                <View key={item.id}>
                                    <TouchableOpacity
                                        style={styles.item}
                                        onPress={item.action}
                                    >
                                        <View style={styles.itemLeft}>
                                            <Ionicons name={item.icon} size={22} color={COLORS.primary} style={styles.icon} />
                                            <Text style={styles.itemLabel}>{item.label}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                                    </TouchableOpacity>
                                    {idx < group.items.length - 1 && <View style={styles.divider} />}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 8 },
    content: { padding: 20 },
    group: { marginBottom: 24 },
    groupTitle: { fontSize: 14, color: '#666', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
    card: { backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    itemLeft: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 12 },
    itemLabel: { fontSize: 16, color: '#333' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 50 }
});

export default AdminSettingsScreen;
