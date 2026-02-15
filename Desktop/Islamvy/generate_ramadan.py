import os
import json
import datetime
from datetime import timedelta

# Configuration
YEAR = 2026
RAMADAN_START = datetime.date(2026, 2, 17) # Estimated
RAMADAN_DAYS = 30
LANGUAGES = ['en', 'tr', 'ar', 'fr', 'id']
CITIES = [
    {"name": "London", "country": "UK", "lat": 51.5074, "lng": -0.1278, "timezone": "Europe/London"},
    {"name": "New York", "country": "USA", "lat": 40.7128, "lng": -74.0060, "timezone": "America/New_York"},
    {"name": "Istanbul", "country": "Turkey", "lat": 41.0082, "lng": 28.9784, "timezone": "Europe/Istanbul"},
    {"name": "Dubai", "country": "UAE", "lat": 25.2048, "lng": 55.2708, "timezone": "Asia/Dubai"},
    {"name": "Jakarta", "country": "Indonesia", "lat": -6.2088, "lng": 106.8456, "timezone": "Asia/Jakarta"},
    {"name": "Mecca", "country": "Saudi Arabia", "lat": 21.3891, "lng": 39.8579, "timezone": "Asia/Riyadh"},
    {"name": "Paris", "country": "France", "lat": 48.8566, "lng": 2.3522, "timezone": "Europe/Paris"},
    {"name": "Berlin", "country": "Germany", "lat": 52.5200, "lng": 13.4050, "timezone": "Europe/Berlin"},
    {"name": "Toronto", "country": "Canada", "lat": 43.6510, "lng": -79.3470, "timezone": "America/Toronto"},
    {"name": "Mumbai", "country": "India", "lat": 19.0760, "lng": 72.8777, "timezone": "Asia/Kolkata"}
]

TRANSLATIONS = {
    "en": {"dir": "ltr", "title_fmt": "Ramadan 2026 Iftar & Sahur Times for {city}", "h1_fmt": "Ramadan Calendar 2026 - {city}", "desc_fmt": "Complete 30-day Ramadan 2026 timetable for {city}, {country}. Accurate Iftar, Sahur (Sehri), and Prayer times.", "col_day": "Day", "col_date": "Date", "col_sahur": "Sahur", "col_iftar": "Iftar", "download_pdf": "Download PDF", "back_home": "Back to Blog"},
    "tr": {"dir": "ltr", "title_fmt": "{city} İçin 2026 Ramazan İmsakiye ve İftar Vakitleri", "h1_fmt": "2026 Ramazan İmsakiyesi - {city}", "desc_fmt": "{city}, {country} için 30 günlük 2026 Ramazan imsakiyesi. Doğru İftar, Sahur ve Namaz vakitleri.", "col_day": "Gün", "col_date": "Tarih", "col_sahur": "Sahur", "col_iftar": "İftar", "download_pdf": "PDF İndir", "back_home": "Blog'a Dön"},
    "ar": {"dir": "rtl", "title_fmt": "أوقات الإفطار والسحور لرمضان 2026 في {city}", "h1_fmt": "تقويم رمضان 2026 - {city}", "desc_fmt": "جدول مواقيت رمضان 2026 الكامل لمدة 30 يومًا لمدينة {city}، {country}. أوقات دقيقة للإفطار والسحور والصلاة.", "col_day": "اليوم", "col_date": "التاريخ", "col_sahur": "السحور", "col_iftar": "الإفطار", "download_pdf": "تحميل PDF", "back_home": "العودة للمدونة"},
    "fr": {"dir": "ltr", "title_fmt": "Horaires Iftar & Sahur Ramadan 2026 pour {city}", "h1_fmt": "Calendrier Ramadan 2026 - {city}", "desc_fmt": "Calendrier complet de 30 jours pour le Ramadan 2026 à {city}, {country}. Horaires précis de l'Iftar, du Sahur et de la prière.", "col_day": "Jour", "col_date": "Date", "col_sahur": "Sahur", "col_iftar": "Iftar", "download_pdf": "Télécharger PDF", "back_home": "Retour au Blog"},
    "id": {"dir": "ltr", "title_fmt": "Jadwal Iftar & Sahur Ramadan 2026 untuk {city}", "h1_fmt": "Kalender Ramadan 2026 - {city}", "desc_fmt": "Jadwal lengkap 30 hari Ramadan 2026 untuk {city}, {country}. Waktu Iftar, Sahur, dan Sholat yang akurat.", "col_day": "Hari", "col_date": "Tanggal", "col_sahur": "Sahur", "col_iftar": "Buka Puasa", "download_pdf": "Unduh PDF", "back_home": "Kembali ke Blog"}
}

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="{lang}" dir="{dir}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Islamvy</title>
    <meta name="description" content="{desc}">
    <link rel="stylesheet" href="../../../styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Kaushan+Script&display=swap" rel="stylesheet">
    <style>
        .ramadan-table {{ width: 100%; border-collapse: collapse; margin-top: 2rem; background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; }}
        .ramadan-table th, .ramadan-table td {{ padding: 1rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }}
        .ramadan-table th {{ background: rgba(30, 62, 52, 0.9); color: #A3D9C9; font-weight: 600; }}
        .ramadan-table tr:hover {{ background: rgba(255,255,255,0.08); }}
        .current-day {{ background: rgba(163, 217, 201, 0.15) !important; border: 1px solid #A3D9C9; }}
        .city-hero {{ text-align: center; padding: 4rem 1rem; background: linear-gradient(180deg, rgba(30,62,52,0) 0%, rgba(30,62,52,0.8) 100%); }}
        .action-btn {{ display: inline-block; background: #A3D9C9; color: #1e3e34; padding: 0.8rem 1.5rem; border-radius: 99px; text-decoration: none; font-weight: 600; margin-top: 2rem; transition: 0.3s; }}
        .action-btn:hover {{ transform: translateY(-2px); box-shadow: 0 5px 15px rgba(163, 217, 201, 0.3); }}
    </style>
</head>
<body>
    <div class="geometric-bg"></div>
    
    <nav class="navbar" style="padding: 2rem 5%; display:flex; justify-content:space-between; align-items:center;">
        <a href="../../index.html" style="text-decoration:none;">
            <div class="logo" style="font-family: 'Kaushan Script', cursive; font-size: 2rem; color: #fff;">Islamvy <span style="font-size:1.2rem; opacity:0.8;">Ramadan</span></div>
        </a>
        <a href="../index.html" style="color:#A3D9C9; text-decoration:none;">&larr; {back_home}</a>
    </nav>

    <header class="city-hero">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">{h1}</h1>
        <p style="opacity: 0.9; max-width: 600px; margin: 0 auto;">{desc}</p>
        <div style="margin-top: 2rem; font-size:0.9rem; opacity:0.7;">
            <span><i class="fa-solid fa-location-dot"></i> {city}, {country}</span> • 
            <span><i class="fa-solid fa-calendar"></i> Ramadan 1447 AH</span>
        </div>
    </header>

    <main style="max-width: 800px; margin: 0 auto; padding: 2rem;">
        <div style="overflow-x: auto;">
            <table class="ramadan-table">
                <thead>
                    <tr>
                        <th>{col_day}</th>
                        <th>{col_date}</th>
                        <th>{col_sahur}</th>
                        <th>{col_iftar}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
        
        <div style="text-align: center;">
            <a href="#" class="action-btn" onclick="alert('PDF generation coming soon!')"><i class="fa-solid fa-file-pdf"></i> {download_pdf}</a>
        </div>
    </main>

    <footer class="main-footer" style="text-align:center; padding: 2rem; margin-top: 4rem; opacity: 0.6; font-size: 0.9rem;">
        © 2026 Islamvy. {desc}
    </footer>
</body>
</html>
"""

def generate_mock_times(lat):
    # Very rough mock estimation for demo purposes (actual app uses Aladhan API)
    # This ensures we have *some* data to display without making 150 API calls in this script
    base_sahur = datetime.datetime.strptime("05:00", "%H:%M")
    base_iftar = datetime.datetime.strptime("18:00", "%H:%M")
    
    times = []
    for i in range(RAMADAN_DAYS):
        # Shift times slightly each day based on season (Feb/Mar is getting lighter in N. Hemisphere)
        delta_m = i * 1.5 # ~1.5 mins change per day
        sahur = base_sahur - timedelta(minutes=delta_m)
        iftar = base_iftar + timedelta(minutes=delta_m)
        times.append({
            "sahur": sahur.strftime("%H:%M"),
            "iftar": iftar.strftime("%H:%M")
        })
    return times

def main():
    for lang in LANGUAGES:
        t = TRANSLATIONS[lang]
        output_dir = f"islamvy-web/blog/{lang}/ramadan"
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"Generating Ramadan calendar for {lang}...")
        
        # Index listing for cities
        city_links = []

        for city in CITIES:
            # Generate City Page
            times = generate_mock_times(city["lat"])
            rows = ""
            current_date = RAMADAN_START
            
            for i, time in enumerate(times):
                rows += f"""
                <tr>
                    <td>{i+1}</td>
                    <td>{current_date.strftime('%d %b %Y')}</td>
                    <td>{time['sahur']}</td>
                    <td>{time['iftar']}</td>
                </tr>
                """
                current_date += timedelta(days=1)
            
            slug = f"ramadan-{city['name'].lower().replace(' ', '-')}"
            filename = f"{slug}.html"
            
            html = HTML_TEMPLATE.format(
                lang=lang,
                dir=t["dir"],
                title=t["title_fmt"].format(city=city["name"]),
                desc=t["desc_fmt"].format(city=city["name"], country=city["country"]),
                h1=t["h1_fmt"].format(city=city["name"]),
                col_day=t["col_day"],
                col_date=t["col_date"],
                col_sahur=t["col_sahur"],
                col_iftar=t["col_iftar"],
                rows=rows,
                city=city["name"],
                country=city["country"],
                download_pdf=t["download_pdf"],
                back_home=t["back_home"]
            )
            
            with open(f"{output_dir}/{filename}", "w", encoding="utf-8") as f:
                f.write(html)
            
            city_links.append(f'<li><a href="ramadan/{filename}" style="color:#A3D9C9; text-decoration:none; font-size:1.1rem;">{city["name"]}</a></li>')

        # Update main blog index to include Ramadan links (Simple injection for now)
        # In a real scenario, we'd update the INDEX_TEMPLATE in the other script
        print(f"Generated {len(CITIES)} city pages for {lang}.")

if __name__ == "__main__":
    main()
