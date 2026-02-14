import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    Briefcase,
    ChevronDown,
    ChevronUp,
    Coins,
    CreditCard,
    RotateCcw,
    Share2,
    Wallet
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { getMetalPrices } from '../services/FinanceService';
import { COLORS, FONTS } from '../utils/theme';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const CURRENCIES = [
    { code: 'TRY', symbol: '₺', label: 'Türk Lirası' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'SAR', symbol: 'SR', label: 'Saudi Riyal' },
    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
    { code: 'QAR', symbol: 'QR', label: 'Qatari Riyal' },
    { code: 'KWD', symbol: 'KD', label: 'Kuwaiti Dinar' },
    { code: 'EGP', symbol: 'E£', label: 'Egyptian Pound' },
    { code: 'AZN', symbol: '₼', label: 'Azerbaijani Manat' },
    { code: 'PKR', symbol: 'Rs', label: 'Pakistani Rupee' },
    { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah' },
];

// --- EXTRACTED COMPONENTS (Fixes Keyboard Focus/Dismissal Issue) ---
const InputField = ({ label, value, onChangeText, placeholder = "0", unit }) => (
    <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
            <TextInput
                style={styles.textInput}
                placeholder={placeholder}
                keyboardType="numeric"
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#999"
            />
            <Text style={styles.inputSuffix}>
                {unit}
            </Text>
        </View>
    </View>
);

const SectionHeader = ({ icon: Icon, title, color }) => (
    <View style={styles.sectionTitleRow}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
            <Icon size={18} color={color} />
        </View>
        <Text style={styles.sectionHeader}>{title}</Text>
    </View>
);

const ZakatCalculator = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { ramadanModeEnabled } = useTheme();
    const isTr = i18n.language.startsWith('tr');

    // --- STATE MANAGEMENT ---
    const [selectedCurrency, setSelectedCurrency] = useState(isTr ? CURRENCIES[0] : CURRENCIES[1]);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

    // Market Prices
    const [goldPrice, setGoldPrice] = useState('3400');
    const [silverPrice, setSilverPrice] = useState('42');

    // Assets State (Single Object)
    const [assets, setAssets] = useState({
        cash: '',
        bank: '',
        gold24k: '',
        gold22k: '',
        gold18k: '',
        silver: '',
        business: '',
        stocks: '',
        other: '',
        receivables: '',
        debts: '',
    });

    // Calculated Results
    const [results, setResults] = useState({
        totalAssets: 0,
        netWealth: 0,
        nisabThreshold: 0,
        zakatAmount: 0,
        isEligible: false
    });

    const NISAB_GOLD_GRAMS = 85;

    // --- LIVE PRICE FETCHING ---
    useEffect(() => {
        const fetchPrices = async () => {
            const prices = await getMetalPrices(selectedCurrency.code);
            if (prices) {
                setGoldPrice(prices.gold);
                setSilverPrice(prices.silver);
            }
        };
        fetchPrices();
    }, [selectedCurrency]);

    // --- LOGIC ---
    useEffect(() => {
        calculate();
    }, [assets, goldPrice, silverPrice]);

    const calculate = () => {
        const gp = parseFloat(goldPrice) || 0;
        const sp = parseFloat(silverPrice) || 0;

        // 1. Precious Metals
        const g24_val = (parseFloat(assets.gold24k) || 0) * gp;
        const g22_val = (parseFloat(assets.gold22k) || 0) * (gp * 0.916);
        const g18_val = (parseFloat(assets.gold18k) || 0) * (gp * 0.750);
        const silver_val = (parseFloat(assets.silver) || 0) * sp;
        const metalsTotal = g24_val + g22_val + g18_val + silver_val;

        // 2. Cash & Bank
        const cashTotal = (parseFloat(assets.cash) || 0) + (parseFloat(assets.bank) || 0);

        // 3. Investments & Business
        const investmentsTotal =
            (parseFloat(assets.business) || 0) +
            (parseFloat(assets.stocks) || 0) +
            (parseFloat(assets.other) || 0) +
            (parseFloat(assets.receivables) || 0);

        // 4. Liabilities
        const liabilities = parseFloat(assets.debts) || 0;

        const totalAssets = metalsTotal + cashTotal + investmentsTotal;
        const netWealth = totalAssets - liabilities;

        const nisabThreshold = NISAB_GOLD_GRAMS * gp;
        const isEligible = netWealth >= nisabThreshold && netWealth > 0;
        const zakatAmount = isEligible ? netWealth * 0.025 : 0;

        setResults({
            totalAssets,
            netWealth,
            nisabThreshold,
            zakatAmount,
            isEligible
        });
    };

    const updateAsset = (key, value) => {
        const cleaned = value.replace(/[^0-9.]/g, '');
        setAssets(prev => ({ ...prev, [key]: cleaned }));
    };

    const handleReset = () => {
        Alert.alert(
            t('zakat.reset_title'),
            t('zakat.reset_msg'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.reset'),
                    style: "destructive",
                    onPress: () => {
                        setAssets({
                            cash: '', bank: '', gold24k: '', gold22k: '', gold18k: '',
                            silver: '', business: '', stocks: '', other: '', receivables: '', debts: ''
                        });
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            const message = t('zakat.share_msg', {
                totalAssets: formatCurrency(results.totalAssets),
                debts: formatCurrency(parseFloat(assets.debts) || 0),
                netWealth: formatCurrency(results.netWealth),
                nisabThreshold: formatCurrency(results.nisabThreshold),
                zakatAmount: formatCurrency(results.zakatAmount)
            });

            await Share.share({ message });
        } catch (error) {
            console.error(error.message);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'currency',
            currency: selectedCurrency.code,
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <RamadanBackground starCount={20}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.matteBlack} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, ramadanModeEnabled && { color: '#FFF' }]}>{t('zakat.pro_title')}</Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                        <Share2 size={20} color={COLORS.matteBlack} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleReset} style={styles.actionButton}>
                        <RotateCcw size={20} color={COLORS.matteBlack} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Result Card */}
                    <View style={styles.resultCard}>
                        <LinearGradient
                            colors={ramadanModeEnabled ? ['#1a1a1a', '#333'] : [COLORS.matteGreen, '#1a4d3e']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />

                        <View style={styles.resultHeader}>
                            <Text style={styles.resultLabel}>{t('zakat.payable_amount')}</Text>
                            <Text style={styles.resultAmount}>{formatCurrency(results.zakatAmount)}</Text>
                        </View>

                        <View style={styles.resultDivider} />

                        <View style={styles.resultDetails}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultDetailLabel}>{t('zakat.net_wealth')}</Text>
                                <Text style={styles.resultDetailValue}>{formatCurrency(results.netWealth)}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultDetailLabel}>{t('zakat.nisab_threshold')}</Text>
                                <Text style={styles.resultDetailValue}>{formatCurrency(results.nisabThreshold)}</Text>
                            </View>
                        </View>

                        {!results.isEligible && results.totalAssets > 0 && (
                            <View style={styles.nisabWarning}>
                                <Text style={styles.nisabWarningText}>
                                    {t('zakat.nisab_warning')}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Settings Section */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.currencySelector}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setShowCurrencyPicker(!showCurrencyPicker);
                            }}
                        >
                            <Text style={styles.inputLabel}>{t('zakat.currency')}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.currencyValue}>{selectedCurrency.code} ({selectedCurrency.symbol})</Text>
                                {showCurrencyPicker ? <ChevronUp size={16} color="#666" /> : <ChevronDown size={16} color="#666" />}
                            </View>
                        </TouchableOpacity>

                        {showCurrencyPicker && (
                            <View style={styles.currencyList}>
                                {CURRENCIES.map(curr => (
                                    <TouchableOpacity
                                        key={curr.code}
                                        style={[styles.currencyItem, curr.code === selectedCurrency.code && styles.currencyItemActive]}
                                        onPress={() => {
                                            setSelectedCurrency(curr);
                                            setShowCurrencyPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.currencyItemText, curr.code === selectedCurrency.code && { color: '#FFF' }]}>
                                            {curr.code} - {t(`zakat.currencies.${curr.code}`)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.divider} />

                        <Text style={[styles.inputLabel, { marginTop: 10 }]}>{t('zakat.metal_prices')}</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.subLabel}>{t('zakat.gold_24k')}</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={String(goldPrice)}
                                    onChangeText={setGoldPrice}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.subLabel}>{t('zakat.silver')}</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={String(silverPrice)}
                                    onChangeText={setSilverPrice}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Inputs */}
                    <View style={styles.section}>
                        <SectionHeader icon={Wallet} title={t('zakat.cash_bank')} color="#10B981" />
                        <InputField label={t('zakat.cash_on_hand')} value={assets.cash} onChangeText={(v) => updateAsset('cash', v)} unit={selectedCurrency.symbol} />
                        <InputField label={t('zakat.bank_accounts')} value={assets.bank} onChangeText={(v) => updateAsset('bank', v)} unit={selectedCurrency.symbol} />
                    </View>

                    <View style={styles.section}>
                        <SectionHeader icon={Coins} title={t('zakat.gold_silver')} color="#F59E0B" />
                        <InputField label={t('zakat.gold_24k')} value={assets.gold24k} onChangeText={(v) => updateAsset('gold24k', v)} unit={t('common.gram_short')} />
                        <InputField label={t('zakat.gold_22k')} value={assets.gold22k} onChangeText={(v) => updateAsset('gold22k', v)} unit={t('common.gram_short')} />
                        <InputField label={t('zakat.gold_18k')} value={assets.gold18k} onChangeText={(v) => updateAsset('gold18k', v)} unit={t('common.gram_short')} />
                        <InputField label={t('zakat.silver')} value={assets.silver} onChangeText={(v) => updateAsset('silver', v)} unit={t('common.gram_short')} />
                    </View>

                    <View style={styles.section}>
                        <SectionHeader icon={Briefcase} title={t('zakat.business_investments')} color="#3B82F6" />
                        <InputField label={t('zakat.business_goods')} value={assets.business} onChangeText={(v) => updateAsset('business', v)} unit={selectedCurrency.symbol} />
                        <InputField label={t('zakat.stocks_funds')} value={assets.stocks} onChangeText={(v) => updateAsset('stocks', v)} unit={selectedCurrency.symbol} />
                        <InputField label={t('zakat.other_investments')} value={assets.other} onChangeText={(v) => updateAsset('other', v)} unit={selectedCurrency.symbol} />
                        <InputField label={t('zakat.receivables')} value={assets.receivables} onChangeText={(v) => updateAsset('receivables', v)} unit={selectedCurrency.symbol} />
                    </View>

                    <View style={styles.section}>
                        <SectionHeader icon={CreditCard} title={t('zakat.liabilities')} color="#EF4444" />
                        <View style={[styles.inputRow, { opacity: 0.8 }]}>
                            <Text style={styles.inputLabel}>{t('zakat.immediate_debts')}</Text>
                            <View style={[styles.inputWrapper, { borderColor: '#EF4444' }]}>
                                <TextInput
                                    style={[styles.textInput, { color: '#EF4444' }]}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={assets.debts}
                                    onChangeText={(val) => updateAsset('debts', val)}
                                    placeholderTextColor="#ffb3b3"
                                />
                                <Text style={[styles.inputSuffix, { color: '#EF4444' }]}>{selectedCurrency.symbol}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.disclaimer}>
                        {t('zakat.disclaimer_msg')}
                    </Text>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15, justifyContent: 'space-between' },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    actionButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    headerTitle: { ...FONTS.h3, fontSize: 18, color: COLORS.matteBlack },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    resultCard: { borderRadius: 24, padding: 24, marginBottom: 20, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
    resultHeader: { alignItems: 'center', marginBottom: 20 },
    resultLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textAlign: 'center' },
    resultAmount: { color: '#FFF', fontSize: 36, fontWeight: '800', textAlign: 'center' },
    resultDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 15 },
    resultDetails: { flexDirection: 'row', justifyContent: 'space-between' },
    resultRow: { alignItems: 'center', flex: 1 },
    resultDetailLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 },
    resultDetailValue: { color: '#FFF', fontSize: 15, fontWeight: '600' },
    nisabWarning: { marginTop: 15, padding: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 },
    nisabWarningText: { color: '#FFD700', fontSize: 11, textAlign: 'center', fontWeight: '600' },

    section: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
    iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    sectionHeader: { fontSize: 14, fontWeight: '700', color: COLORS.matteBlack, letterSpacing: 0.5 },

    inputRow: { marginBottom: 12 },
    inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#EEE' },
    textInput: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.matteBlack },
    inputSuffix: { fontSize: 14, color: '#999', fontWeight: '600', marginLeft: 8 },

    currencySelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
    currencyValue: { fontSize: 16, fontWeight: '600', color: COLORS.matteBlack, marginRight: 8 },
    currencyList: { marginTop: 10, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 5 },
    currencyItem: { padding: 12, borderRadius: 8 },
    currencyItemActive: { backgroundColor: COLORS.matteGreen },
    currencyItemText: { fontSize: 14, fontWeight: '600', color: COLORS.matteBlack },

    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
    subLabel: { fontSize: 11, color: '#999', marginBottom: 6, fontWeight: '600' },
    priceInput: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 10, fontSize: 14, fontWeight: '600', color: COLORS.matteBlack, borderWidth: 1, borderColor: '#EEE' },

    disclaimer: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 10, fontStyle: 'italic', paddingHorizontal: 20, lineHeight: 16 }
});

export default ZakatCalculator;
