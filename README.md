# Zikra - Islamic Lifestyle App 🕌

A comprehensive Islamic lifestyle companion app built with React Native and Expo.

## Features

- 📿 **AI-Powered Dhikr**: Personalized dhikr plans Islamic numerology analysis using AI (GPT-4o mini).
- 🌙 **AI-Dream Interpretation**: Deep personalized Islamic dream analysis using AI (GPT-4o mini).
- 👥 **Spiritual Community**: Share dualar, zikirler, and hatimler. Interact with others via "Amen" and "Prayed".
- 🛒 **Shop**: Curated Islamic lifestyle products with Amazon affiliate integration.
- 📜 **AI-Word of the Day**: Contextual Daily Quotes (Verse/Hadith) generated via AI, considering Islamic special days and world agenda.
- 📖 **Hatim System**: Participate in group hatims with automated slot management.
- 🕌 **Prayer Times**: Accurate prayer times with adhan notifications (Location-based).
- 🔔 **Intelligent Notifications**: Sunrise-triggered daily quotes and prayer time reminders tailored to user location.
- 🧭 **Qibla Compass**: Accurate Qibla direction finder with haptic feedback.
- 🎥 **Live Kaaba**: Watch live broadcasts from Mecca (High Quality).
- 🕋 **Quran**: Full Quran with Arabic text, translations (multi-language), and background audio.
- 🕌 **Mosque Finder**: Locate nearby mosques using your device location.
- 💰 **Zakat Calculator**: Calculate your zakat easily based on gold, cash, and other assets.
- 📢 **Referral System**: Influencer dashboard for tracking clicks, registrations, and conversions.
- ⭐ **Zikra Premium**:
  - **Tiers**: Starter ($3.99), Pro ($7.99), Unlimited ($14.99).
  - **Features**: Ad-Free, Background Audio, Daily Limits (3/10/Unlimited).

## Project Structure

```
zikra-app/
├── App.js                 # Main entry point & Navigation
├── app.json               # Expo configuration (Env & Permissions)
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Core Screens
│   │   ├── CommunityScreen.js  # Spiritual Community Hub
│   │   ├── HatimDetailScreen.js # Group Hatim Management
│   │   ├── InfluencerDashboard.js # Referral Dashboard
│   │   ├── DhikrCounter.js    # AI Dhikr & Onboarding
│   │   ├── DreamInterpretation.js # AI Dream Analysis
│   │   ├── QuranScreen.js     # Quran & Audio Player
│   │   ├── SettingsScreen.js  # Profiles, Reminders & Security
│   │   ├── MosqueFinderScreen.js
│   │   ├── ZakatCalculator.js
│   │   └── ...
│   ├── services/          # Business Logic (adService, LimitService, supabase)
│   ├── i18n/              # Translations (en, tr, ar, id)
│   └── utils/             # Helpers (Notifications, Theme, Audio)
├── supabase/
│   ├── functions/         # Edge Functions (get-daily-quote, generate-dhikr, interpret-dream)
│   └── fixes/             # Database Migrations & Security Hardening
└── assets/                # Images and media files
```

## Tech Stack

- **Frontend**: React Native, Expo SDK (Managed Workflow)
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Edge Functions)
- **AI**: OpenAI (GPT-4o-mini via Supabase Edge Functions)
- **Ads**: AdMob (react-native-google-mobile-ads)
- **State**: React Context + AsyncStorage
- **Localization**: react-i18next

## Setup & Running

1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Environment**: Create `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3.  **Run**:
    ```bash
    npx expo start
    ```
    *Note: Use a Development Build (`eas build --profile development`) to test Ads and Background Audio.*

## Privacy & Security

Zikra takes user privacy seriously:
- **AES-256 Encryption**: For all sensitive user data.
- **Row Level Security (RLS)**: Strict data isolation for community and personal profile data.
- **Minimal Tracking**: Location used only for prayer times and mosque finding.

## License

© 2026 Zikra App. All rights reserved.
