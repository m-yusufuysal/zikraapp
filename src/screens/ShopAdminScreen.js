import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

const ShopAdminScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // New Product Form State
    const [newItem, setNewItem] = useState({
        name_tr: '',
        name_en: '',
        price: '',
        category: 'books', // default
        link: '',
        image: null // holds the local uri
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const pickImageForProduct = async (product) => {
        try {
            console.log("Picking image for product:", product.id);
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('İzin Gerekli', 'Resim seçmek için galeri erişim izni vermeniz gerekiyor.');
                return;
            }

            console.log("Permission granted, launching library...");
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images', // Using string for better compatibility
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            console.log("Picker result:", result.canceled ? "Canceled" : "Selected");

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedUri = result.assets[0].uri;
                console.log("Selected URI:", selectedUri);
                uploadImage(selectedUri, product);
            }
        } catch (error) {
            console.error("Picker Error:", error);
            Alert.alert('Hata', 'Galeri açılırken bir sorun oluştu: ' + error.message);
        }
    };

    const uploadImage = async (uri, product) => {
        try {
            setUploading(true);
            console.log("Starting upload for URI:", uri);
            const ext = uri.substring(uri.lastIndexOf('.') + 1).toLowerCase();
            const fileName = `product_${product.id}_${Date.now()}.${ext}`;

            // Use ArrayBuffer instead of Blob - Blob uploads 0 bytes in React Native!
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();

            console.log("ArrayBuffer created, byte length:", arrayBuffer.byteLength);

            const { data, error } = await supabase.storage
                .from('products')
                .upload(fileName, arrayBuffer, {
                    contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
                    upsert: true
                });

            if (error) {
                console.error("Supabase Storage Error:", error);
                throw error;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(fileName);

            console.log("File uploaded successfully. Public URL:", publicUrl);

            // Update Product in DB
            const { data: updateData, error: dbError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('id', product.id)
                .select();

            if (dbError) throw dbError;

            if (updateData && updateData.length > 0) {
                Alert.alert('Başarılı', 'Görsel güncellendi!');
                fetchProducts();
            }

        } catch (error) {
            console.error("Upload process failed:", error);
            Alert.alert('Yükleme Hatası', error.message);
        } finally {
            setUploading(false);
        }
    };

    // --- Create New Product Logic (Simplified) ---
    const handleCreateProduct = async () => {
        if (!newItem.name_tr || !newItem.price) {
            Alert.alert('Error', 'Name (TR) and Price are required.');
            return;
        }

        try {
            setUploading(true);
            let imageUrl = null;

            // 1. Upload Image if selected
            if (newItem.image) {
                const uri = newItem.image;
                const ext = uri.substring(uri.lastIndexOf('.') + 1);
                const fileName = `new_${Date.now()}.${ext}`;
                const arrayBuffer = await fetch(uri).then(res => res.arrayBuffer());

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, arrayBuffer, {
                        contentType: `image/${ext}`,
                        upsert: true
                    });

                if (uploadError) {
                    console.error("New Product Upload Error:", uploadError);
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // 2. Insert into DB
            const { error: insertError } = await supabase
                .from('products')
                .insert([{
                    name_tr: newItem.name_tr,
                    name_en: newItem.name_en || newItem.name_tr,
                    price: parseFloat(newItem.price),
                    category: newItem.category,
                    product_url: newItem.link,
                    image_url: imageUrl,
                    name: newItem.name_tr // Fallback legacy col
                }]);

            if (insertError) throw insertError;

            Alert.alert('Success', 'Product created!');
            setModalVisible(false);
            setNewItem({ name_tr: '', name_en: '', price: '', category: 'books', link: '', image: null });
            fetchProducts();

        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setUploading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => pickImageForProduct(item)}>
                {item.image_url || item.image ? (
                    <Image source={{ uri: item.image_url || item.image }} style={styles.itemImage} />
                ) : (
                    <View style={[styles.itemImage, styles.placeholderImage]}>
                        <Ionicons name="camera" size={24} color="#666" />
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name_tr || item.name}</Text>
                <Text style={styles.itemSub}>{item.category} • {item.price} TL</Text>
                <Text style={styles.itemId}>ID: {item.id}</Text>
            </View>

            <TouchableOpacity
                style={styles.editButton}
                onPress={() => pickImageForProduct(item)}
            >
                <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shop Admin (Secret)</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                    <Ionicons name="add" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {uploading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={{ color: '#FFF', marginTop: 10 }}>Uploading...</Text>
                </View>
            )}

            {/* Create Product Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>New Product</Text>

                    <TouchableOpacity
                        onPress={async () => {
                            let r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images });
                            if (!r.canceled) setNewItem({ ...newItem, image: r.assets[0].uri });
                        }}
                    >
                        {newItem.image ? (
                            <Image source={{ uri: newItem.image }} style={{ width: 100, height: 100, borderRadius: 10 }} />
                        ) : (
                            <Text>Select Image</Text>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        placeholder="Name (TR)"
                        style={styles.input}
                        value={newItem.name_tr}
                        onChangeText={t => setNewItem({ ...newItem, name_tr: t })}
                    />
                    <TextInput
                        placeholder="Name (EN)"
                        style={styles.input}
                        value={newItem.name_en}
                        onChangeText={t => setNewItem({ ...newItem, name_en: t })}
                    />
                    <TextInput
                        placeholder="Price"
                        style={styles.input}
                        keyboardType="numeric"
                        value={newItem.price}
                        onChangeText={t => setNewItem({ ...newItem, price: t })}
                    />
                    <TextInput
                        placeholder="Link (Amazon/Trendyol...)"
                        style={styles.input}
                        value={newItem.link}
                        onChangeText={t => setNewItem({ ...newItem, link: t })}
                    />
                    <TextInput
                        placeholder="Category (books, clothing, home...)"
                        style={styles.input}
                        value={newItem.category}
                        autoCapitalize="none"
                        onChangeText={t => setNewItem({ ...newItem, category: t })}
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.btn, { backgroundColor: '#ccc' }]}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCreateProduct} style={[styles.btn, { backgroundColor: COLORS.primary }]}>
                            <Text style={{ color: '#FFF' }}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 8 },
    addBtn: { backgroundColor: COLORS.primary, padding: 8, borderRadius: 20 },
    listContent: { padding: 16 },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
    },
    itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
    placeholderImage: { justifyContent: 'center', alignItems: 'center' },
    addPhotoText: { fontSize: 8, marginTop: 2 },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { fontWeight: 'bold', fontSize: 14 },
    itemSub: { fontSize: 12, color: '#666' },
    itemId: { fontSize: 10, color: '#999', marginTop: 2 },
    editButton: { padding: 10 },
    loadingOverlay: {
        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
    },
    modalContainer: { flex: 1, padding: 20, paddingTop: 50 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { backgroundColor: '#EEE', padding: 12, borderRadius: 8, marginBottom: 12 },
    imagePickerBtn: { alignItems: 'center', marginBottom: 20, padding: 20, backgroundColor: '#eee', borderRadius: 10 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    btn: { padding: 15, borderRadius: 10, minWidth: 100, alignItems: 'center' }
});

export default ShopAdminScreen;
