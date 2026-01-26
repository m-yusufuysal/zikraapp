const PROHIBITED_KEYWORDS = [
    // Betting & Gambling (Extended)
    'bahis', 'kumar', 'bet', 'casino', 'slot', 'iddaa', 'canlı bahis', 'poker', 'rulet', 'black jack', 'bonus ver', 'çekim garantili', 'yatırım şartsız',
    // Adult Content (Expanded)
    'sex', 'seks', 'porn', 'porno', 'azgın', 'dul', 'escort', 'eskort', 'jigolo', 'travesti', 'fantezi', 'çıplak', 'video izle', 'şizofren', 'sapık', 'abaza',
    // Slang & Toxicity (Comprehensive)
    'küfür', 'aptal', 'salak', 'şerefsiz', 'piç', 'oç', 'aq', 'amk', 'sik', 'yarrak', 'göt', 'ibne', 'yavşak', 'gerizekalı', 'amına', 'koduğum', 'pic', 'it', 'köpek', 'it oğlu it', 'hayvan', 'öküz', 'ayı', 'manyak', 'o.ç.', 's.iktir', 'siktir', 'f*ck', 'p*rn',
    // Scam/Money/Begging
    'para kazan', 'nakit', 'kazanç', 'yatırım tavsiyesi', 'borç ver', 'iban at', 'hesabıma para', 'para lazım', 'fatura öde', 'para iste', 'dilenci', 'para yardımı',
    // Politics & Sensitive (General safety)
    'siyaset', 'terör', 'parti', 'seçim', 'oy ver'
];

/**
 * Checks text for prohibited content, links, and sensitive information.
 * @param {string} text The text to moderate
 * @returns {object} { isSafe: boolean, reason: string | null }
 */
export const moderateContent = (text) => {
    if (!text) return { isSafe: true };

    const lowerText = text.toLowerCase();

    // 1. Keyword Check
    for (const word of PROHIBITED_KEYWORDS) {
        if (lowerText.includes(word)) {
            return {
                isSafe: false,
                reason: `Lütfen topluluk adabına uygun ve nezaketli bir dil kullanalım.`
            };
        }
    }

    // 2. IBAN Check (TR IBAN format)
    const ibanRegex = /TR\d{2}\s?(\d{4}\s?){5}\d{2}/gi;
    if (ibanRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'Güvenliğiniz için hesap bilgisi paylaşımına izin veremiyoruz.'
        };
    }

    // 3. Email Check
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    if (emailRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'Güvenliğiniz adına iletişim bilgilerini gizli tutmanızı öneriyoruz.'
        };
    }

    // 4. Phone Number Check
    const phoneRegex = /(05|5)\d{9}|\d{3}[\s-]?\d{3}[\s-]?\d{4}|\+\d{10,15}/g;
    if (phoneRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'Mahremiyetinizi korumak için telefon numarası paylaşımı kısıtlanmıştır.'
        };
    }

    // 5. General URL/Site Check
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|edu|gov|io|biz|info|tr|me|tv|shop|site))/gi;
    if (urlRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'Bağlantı paylaşımı topluluk güvenliği için devre dışı bırakılmıştır.'
        };
    }

    // 6. Generic Personal Info Pattern (ID numbers, etc. simplified)
    const idRegex = /\b\d{11}\b/g; // TR ID check
    if (idRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'Kişisel verilerinizin güvenliği için bu bilgiyi paylaşamazsınız.'
        };
    }

    return { isSafe: true };
};
