import os
import json
import datetime

LANGUAGES = ['en', 'tr', 'ar', 'fr', 'id']

# --- HTML TEMPLATES (DESIGN MATCHING MAIN SITE) ---

NAVBAR_TEMPLATE = """
    <nav class="navbar" style="display: flex; justify-content: space-between; align-items: center; padding: 2rem 5%; max-width: 1200px; margin: 0 auto; position: relative; z-index: 10;">
        <a href="{root_path}index.html" style="text-decoration:none;">
            <div class="logo" style="font-family: 'Kaushan Script', cursive; font-size: 2.5rem; color: #FFFFFF; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Islamvy <span style="font-size: 1.8rem; opacity: 0.8; font-weight: 400;">{blog_suffix}</span></div>
        </a>
        <div class="nav-right" style="display: flex; align-items: center; gap: 1.5rem;">
             <div class="nav-links" style="margin-right: 1.5rem; display: flex; gap: 1.5rem;">
                <a href="{root_path}index.html" class="nav-item-link" style="color: #fff; text-decoration: none; font-weight: 500; font-size: 0.95rem; opacity: 0.9; transition: 0.3s;">{app_home}</a>
                <a href="{root_path}blog/{lang}/ramadan/index.html" class="nav-item-link" style="color: #A3D9C9; text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: 0.3s;"><i class="fa-solid fa-moon"></i> {ramadan_2026}</a>
            </div>
            
            <div class="lang-dropdown" style="position: relative;">
                <button class="lang-btn" onclick="toggleLangMenu(event)" style="display: flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); padding: 0.6rem 1.2rem; border-radius: 99px; color: #FFFFFF; cursor: pointer; transition: 0.3s; backdrop-filter: blur(8px); font-weight: 600; font-size: 0.9rem;">
                    <span>{curr_lang_upper}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                <div class="lang-menu" id="langMenu" style="display: none; position: absolute; right: 0; top: 120%; background: rgba(30, 62, 52, 0.98); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 0.5rem; min-width: 180px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); z-index: 1000; backdrop-filter: blur(12px);">
                    <a href="{root_path}blog/en/{page_path}" class="lang-option">English</a>
                    <a href="{root_path}blog/tr/{page_path}" class="lang-option">Türkçe</a>
                    <a href="{root_path}blog/ar/{page_path}" class="lang-option">العربية</a>
                    <a href="{root_path}blog/fr/{page_path}" class="lang-option">Français</a>
                    <a href="{root_path}blog/id/{page_path}" class="lang-option">Bahasa Indonesia</a>
                </div>
            </div>
        </div>
    </nav>
    <script>
    function toggleLangMenu(e) {{
        e.stopPropagation();
        var menu = document.getElementById('langMenu');
        menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
        menu.style.flexDirection = 'column';
    }}
    document.addEventListener('click', function() {{
        var menu = document.getElementById('langMenu');
        if (menu) menu.style.display = 'none';
    }});
    </script>
    <style>
        [dir="rtl"] .lang-menu {{ right: auto; left: 0; }}
        .nav-item-link:hover {{ opacity: 1; color: #A3D9C9 !important; }}
    </style>
"""

POST_TEMPLATE = """<!DOCTYPE html>
<html lang="{lang}" dir="{dir}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Islamvy Blog</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="https://islamvy.com/blog/{lang}/posts/{filename}">
    {hreflang_tags}
    <link rel="stylesheet" href="../../../styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Kaushan+Script&display=swap" rel="stylesheet">
    <script type="application/ld+json">{breadcrumb_schema}</script>
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{title}",
      "image": "{image_url}",
      "author": {{ "@type": "Organization", "name": "Islamvy" }},
      "publisher": {{ "@type": "Organization", "name": "Islamvy", "logo": {{ "@type": "ImageObject", "url": "https://islamvy.com/assets/logo.png" }} }},
      "datePublished": "2026-02-15",
      "description": "{description}"
    }}
    </script>
    <script type="application/ld+json">{faq_schema}</script>
    <style>
        .logo {{ font-family: 'Kaushan Script', cursive !important; }}
        .lang-option {{ color: white; text-decoration: none; padding: 0.8rem 1rem; border-radius: 12px; font-size: 0.95rem; transition: 0.3s; display: block; filter: none; }}
        .lang-option:hover {{ background: rgba(255, 255, 255, 0.15); color: #A3D9C9; }}
    </style>
</head>
<body>
    <div class="geometric-bg"></div>
    {navbar_html}
    <article class="post-container">
        <div class="breadcrumbs"><a href="../../index.html">Blog</a> <span>/</span> {category}</div>
        <header class="post-header">
            <span class="blog-category">{category}</span>
            <h1 class="post-title">{title}</h1>
            <div class="post-meta">{date} • {read_time} min read</div>
            <div class="scholar-badge" style="display: inline-flex; align-items:center; gap:8px; background: rgba(212, 175, 55, 0.1); border: 1px solid var(--accent-gold); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; color: var(--accent-gold); margin-top: 1rem;">
                <i class="fa-solid fa-certificate"></i> {scholar_badge}
            </div>
            <img src="{image_url}" alt="{title}" class="post-featured-image" style="margin-top: 2rem;">
        </header>
        <div class="tldr-section" style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 4px solid var(--accent-gold);">
            <h3 style="margin-top:0; color:var(--accent-gold); font-size:1.1rem;"><i class="fa-solid fa-bolt"></i> {tldr_title}</h3>
            <p style="margin-bottom:0.5rem; font-style:italic;">{tldr}</p>
        </div>
        <div class="post-content">
            {content_body}
            <div class="references-section" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
                <h2 style="font-size: 1.5rem;"><i class="fa-solid fa-book-quran"></i> {refs_title}</h2>
                {references_html}
            </div>
            <div class="ai-commentary" style="margin-top: 2rem; padding: 1rem; border-radius: 8px; background: rgba(163, 217, 201, 0.05); border: 1px solid rgba(163, 217, 201, 0.2);">
                <p style="font-size: 0.85rem; margin: 0; opacity: 0.8;">
                    <i class="fa-solid fa-robot"></i> <strong>{ai_disclosure_label}:</strong> {ai_disclosure_text}
                </p>
            </div>
            <div class="faq-section" style="margin-top: 3rem;">
                <h2>{faq_title}</h2>
                {faq_html}
            </div>
        </div>
    </article>
    <footer class="main-footer">
        <div class="footer-bottom-row">
            <div class="footer-brand"><span class="footer-logo-text" style="font-family: 'Kaushan Script', cursive;">Islamvy <span style="font-size: 1rem; opacity:0.8;">{blog_suffix}</span></span></div>
            <div class="footer-copyright">{copyright}</div>
        </div>
    </footer>
</body>
</html>
"""

INDEX_TEMPLATE = """<!DOCTYPE html>
<html lang="{lang}" dir="{dir}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_title}</title>
    <meta name="description" content="{page_desc}">
    <link rel="canonical" href="https://islamvy.com/blog/{lang}/index.html">
    <link rel="stylesheet" href="../../styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Kaushan+Script&display=swap" rel="stylesheet">
    <style>
        .logo {{ font-family: 'Kaushan Script', cursive !important; }}
        .lang-option {{ color: white; text-decoration: none; padding: 0.8rem 1rem; border-radius: 12px; font-size: 0.95rem; transition: 0.3s; display: block; filter: none; }}
        .lang-option:hover {{ background: rgba(255, 255, 255, 0.15); color: #A3D9C9; }}
        .category-filter-nav {{ display: flex; gap: 1rem; overflow-x: auto; padding: 1rem 5%; margin-bottom: 2rem; scrollbar-width: none; -ms-overflow-style: none; }}
        .category-filter-nav::-webkit-scrollbar {{ display: none; }}
        .filter-btn {{ background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: white; padding: 0.6rem 1.2rem; border-radius: 20px; cursor: pointer; white-space: nowrap; transition: 0.3s; font-size: 0.9rem; font-weight: 500; }}
        .filter-btn.active {{ background: #A3D9C9; color: #1e3e34; border-color: #A3D9C9; font-weight: 700; }}
    </style>
</head>
<body>
    <div class="geometric-bg"></div>
    {navbar_html}
    <header class="blog-hero">
        <h1>{hero_title}</h1>
        <p>{hero_desc}</p>
    </header>
    
    <nav class="category-filter-nav" id="categoryNav">
        <button class="filter-btn active" data-filter="all">{label_all}</button>
        <button class="filter-btn" data-filter="worship">{label_worship}</button>
        <button class="filter-btn" data-filter="dream">{label_dream}</button>
        <button class="filter-btn" data-filter="lifestyle">{label_lifestyle}</button>
        <button class="filter-btn" data-filter="dhikr">{label_dhikr}</button>
        <button class="filter-btn" data-filter="tech">{label_tech}</button>
    </nav>

    <main class="blog-grid" id="blogGrid">{posts_html}</main>

    <script>
    const filterBtns = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');

    filterBtns.forEach(btn => {{
        btn.addEventListener('click', () => {{
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            
            blogCards.forEach(card => {{
                if (filter === 'all' || card.getAttribute('data-category') === filter) {{
                    card.style.display = 'block';
                }} else {{
                    card.style.display = 'none';
                }}
            }});
        }});
    }});
    </script>

    <footer class="main-footer">
        <div class="footer-bottom-row">
            <div class="footer-brand" style="font-family: 'Kaushan Script', cursive; font-size: 1.5rem;">Islamvy <span style="font-size: 1rem; opacity:0.8;">{blog_suffix}</span></div>
            <div class="footer-copyright">© 2026 Islamvy. All rights reserved.</div>
        </div>
    </footer>
</body>
</html>
"""

# --- CITY DATA FOR RAMADAN HUB ---
CITIES_CONFIG = {
    "Turkey": ["Adana", "Adiyaman", "Afyonkarahisar", "Agri", "Amasya", "Ankara", "Antalya", "Artvin", "Aydin", "Balikesir", "Bilecik", "Bingol", "Bitlis", "Bolu", "Burdur", "Bursa", "Canakkale", "Cankiri", "Corum", "Denizli", "Diyarbakir", "Edirne", "Elazig", "Erzincan", "Erzurum", "Eskisehir", "Gaziantep", "Giresun", "Gumushane", "Hakkari", "Hatay", "Isparta", "Mersin", "Istanbul", "Izmir", "Kars", "Kastamonu", "Kayseri", "Kirklareli", "Kirsehir", "Kocaeli", "Konya", "Kutahya", "Malatya", "Manisa", "Kahramanmaras", "Mardin", "Mugla", "Mus", "Nevsehir", "Nigde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdag", "Tokat", "Trabzon", "Tunceli", "Sanliurfa", "Usak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kirikkale", "Batman", "Sirnak", "Bartin", "Ardahan", "Igdir", "Yalova", "Karabuk", "Kilis", "Osmaniye", "Duzce"],
    "Indonesia": ["Jakarta", "Surabaya", "Bandung", "Medan", "Bekasi", "Semarang", "Tangerang", "Depok", "Palembang", "Makassar", "Batam", "Pekanbaru", "Bogor", "Bandar Lampung", "Padang", "Denpasar", "Malang", "Samarinda", "Tasikmalaya", "Banjarmasin", "Balikpapan", "Serang", "Jambi", "Pontianak", "Cimahi", "Surakarta", "Manado", "Kupang", "Jayapura"],
    "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk", "Buraidah", "Khamis Mushait", "Abha", "Al-Khobar", "Najran", "Ha'il", "Jizan", "Al-Jubail", "Al-Hofuf", "Yanbu"],
    "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Mansoura", "Tanta", "Asyut"],
    "Qatar": ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"],
    "Kuwait": ["Kuwait City", "Salmiya", "Hawally", "Farwaniya"],
    "Gulf": [("Dubai", "AE"), ("Abu Dhabi", "AE"), ("Muscat", "OM"), ("Manama", "BH"), ("Sharjah", "AE")],
    "Europe & Others": [("London", "UK"), ("Paris", "FR"), ("Marseille", "FR"), ("Lyon", "FR"), ("Brussels", "BE"), ("Geneva", "CH"), ("Berlin", "DE"), ("New York", "US"), ("Toronto", "CA"), ("Sydney", "AU")],
    "North Africa": [("Casablanca", "MA"), ("Marrakech", "MA"), ("Algiers", "DZ"), ("Oran", "DZ"), ("Tunis", "TN"), ("Tripoli", "LY")]
}

COUNTRY_CODES = {
    "Turkey": "TR", "Indonesia": "ID", "Saudi Arabia": "SA", "Egypt": "EG",
    "Qatar": "QA", "Kuwait": "KW"
}

RAMADAN_HUB_TEMPLATE = """<!DOCTYPE html>
<html lang="{lang}" dir="{dir}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ramadan 2026 | Islamvy</title>
    <meta name="description" content="Iftar, Sahur, and prayer times for Ramadan 2026.">
    <link rel="stylesheet" href="../../../styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Kaushan+Script&display=swap" rel="stylesheet">
    <style>
        .logo {{ font-family: 'Kaushan Script', cursive !important; }}
        .ramadan-hero {{ text-align: center; padding: 4rem 5%; background: rgba(163, 217, 201, 0.05); border-radius: 0 0 50px 50px; border-bottom: 1px solid rgba(163, 217, 201, 0.2); }}
        .ramadan-hero i {{ font-size: 3rem; color: #A3D9C9; margin-bottom: 1.5rem; display: block; }}
        .ramadan-hero h1 {{ font-size: 3.5rem; margin-bottom: 1rem; }}
        .times-container {{ max-width: 800px; margin: 3rem auto; padding: 0 5%; }}
        .city-card {{ background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 2.5rem; backdrop-filter: blur(12px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }}
        .city-selector {{ margin-bottom: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }}
        .city-selector select {{ background: rgba(30, 62, 52, 0.9); border: 1px solid rgba(163, 217, 201, 0.3); color: white; padding: 1rem; border-radius: 12px; font-size: 1.1rem; outline: none; transition: 0.3s; cursor: pointer; }}
        .city-selector select:focus {{ border-color: #A3D9C9; }}
        .times-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 2rem; }}
        .time-box {{ background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(163, 217, 201, 0.2); padding: 1.5rem; border-radius: 20px; text-align: center; transition: 0.3s; }}
        .time-box:hover {{ background: rgba(163, 217, 201, 0.1); border-color: #A3D9C9; transform: translateY(-5px); }}
        .time-label {{ font-size: 0.9rem; opacity: 0.7; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; }}
        .time-value {{ font-size: 2rem; font-weight: 700; color: #A3D9C9; font-family: 'Amiri', serif; }}
        .countdown-banner {{ background: linear-gradient(135deg, #1e3e34, #2d5a4c); padding: 1.5rem; border-radius: 16px; margin-top: 2rem; text-align: center; border: 1px solid rgba(163, 217, 201, 0.3); }}
        optgroup {{ background: #1e3e34; color: #fff; font-weight: 600; font-family: 'Inter', sans-serif; }}
        option {{ background: rgba(30, 62, 52, 0.9); }}
    </style>
</head>
<body>
    <div class="geometric-bg"></div>
    {navbar_html}
    
    <header class="ramadan-hero">
        <i class="fa-solid fa-moon"></i>
        <h1>{ramadan_2026}</h1>
        <p style="font-size: 1.2rem; opacity: 0.8;">{ramadan_hero_subtitle}</p>
    </header>
 
    <div class="times-container">
        <div class="city-card">
            <div class="selection-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="city-selector">
                    <label style="font-weight: 600; font-size: 0.8rem; opacity:0.8; display: block; margin-bottom: 0.4rem;">{select_country}</label>
                    <select id="countrySelect" onchange="populateCities()">
                        {country_options_html}
                    </select>
                </div>
                <div class="city-selector">
                    <label style="font-weight: 600; font-size: 0.8rem; opacity:0.8; display: block; margin-bottom: 0.4rem;">{select_city}</label>
                    <select id="citySelect" onchange="updateTimes()">
                        <option value="">{select_city}</option>
                    </select>
                </div>
            </div>
 
            <div class="countdown-banner" id="countdown">
                <span style="font-size: 0.9rem; opacity: 0.8;">{first_day_approx}</span><br>
                <strong style="font-size: 1.5rem; color: #A3D9C9;">February 18, 2026</strong>
            </div>
 
            <div class="times-grid">
                <div class="time-box">
                    <div class="time-label">{label_sahur}</div>
                    <div class="time-value" id="sahurTime">--:--</div>
                </div>
                <div class="time-box" style="border-color: #D4AF37;">
                    <div class="time-label" style="color: #D4AF37;">{label_iftar}</div>
                    <div class="time-value" id="iftarTime" style="color: #D4AF37;">--:--</div>
                </div>
                <div class="time-box" style="grid-column: span 2;">
                    <div style="display:flex; justify-content: space-around; font-size: 0.9rem;">
                        <div>
                            <span class="time-label">{label_dhuhr}</span>
                            <div id="dhuhrTime">--:--</div>
                        </div>
                        <div>
                            <span class="time-label">{label_asr}</span>
                            <div id="asrTime">--:--</div>
                        </div>
                        <div>
                            <span class="time-label">{label_isha}</span>
                            <div id="ishaTime">--:--</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <p style="margin-top: 2rem; font-size: 0.8rem; text-align: center; opacity: 0.6;">
                <i class="fa-solid fa-circle-info"></i> {times_calc_info}
            </p>
        </div>
        
        <div style="margin-top: 4rem;">
            <h2 style="text-align:center; margin-bottom: 2rem;">{ramadan_essentials}</h2>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <a href="../posts/ramadan-patience.html" style="text-decoration:none; color:inherit;">
                    <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <h3>{spiritual_prep_title}</h3>
                        <p style="font-size:0.9rem; opacity:0.8;">{spiritual_prep_desc}</p>
                    </div>
                </a>
                <a href="../posts/zakat-calculator-meaning.html" style="text-decoration:none; color:inherit;">
                    <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <h3>{zakat_guide_title}</h3>
                        <p style="font-size:0.9rem; opacity:0.8;">{zakat_guide_desc}</p>
                    </div>
                </a>
            </div>
        </div>
    </div>

    <script>
        const CITIES_DATA = {cities_json};

        function populateCities() {{
            const country = document.getElementById('countrySelect').value;
            const citySelect = document.getElementById('citySelect');
            citySelect.innerHTML = '<option value="">{select_city}</option>';
            
            if (CITIES_DATA[country]) {{
                CITIES_DATA[country].forEach(city => {{
                    const opt = document.createElement('option');
                    opt.value = city.id;
                    opt.textContent = city.name;
                    citySelect.appendChild(opt);
                }});
                
                // Select first city by default
                if (CITIES_DATA[country].length > 0) {{
                    citySelect.value = CITIES_DATA[country][0].id;
                    updateTimes();
                }}
            }}
        }}

        async function updateTimes() {{
            const cityId = document.getElementById('citySelect').value;
            if (!cityId) return;
            
            const country = document.getElementById('countrySelect').value;
            const cityData = CITIES_DATA[country].find(c => c.id === cityId);
            if (!cityData) return;

            try {{
                const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${{cityData.name}}&country=${{country}}&method=3`);
                const data = await response.json();
                const timings = data.data.timings;

                document.getElementById('sahurTime').textContent = timings.Fajr;
                document.getElementById('iftarTime').textContent = timings.Maghrib;
                document.getElementById('dhuhrTime').textContent = timings.Dhuhr;
                document.getElementById('asrTime').textContent = timings.Asr;
                document.getElementById('ishaTime').textContent = timings.Isha;
            }} catch (error) {{
                console.error('Error fetching prayer times:', error);
            }}
        }}

        // Initial population
        window.onload = populateCities;
    </script>

    <footer class="main-footer">
        <div class="footer-bottom-row">
            <div class="footer-brand" style="font-family: 'Kaushan Script', cursive; font-size: 1.5rem;">Islamvy <span style="font-size: 1rem; opacity:0.8;">{blog_suffix}</span></div>
            <div class="footer-copyright">{copyright}</div>
        </div>
    </footer>
</body>
</html>
"""

TRANSLATIONS = {
    "en": {
        "dir": "ltr", "blog_suffix": "Blog", "label_all": "All", "label_worship": "Worship", "label_dream": "Dreams", "label_lifestyle": "Lifestyle", "label_dhikr": "Dhikr & Dua", "label_tech": "Tech", 
        "page_title": "Islamvy Blog", "page_desc": "Islamic Insights", "hero_title": "Islamic Insights & Wisdom", "hero_desc": "Get answers to your spiritual questions with scholarly references.", 
        "read_more": "Read More", "category_dream": "Dream Interpretation", "category_dhikr": "Dhikr & Dua", "category_lifestyle": "Islamic Lifestyle", "category_tech": "Islamic Tech", "category_worship": "Worship Guide",
        "app_home": "App Home", "ramadan_2026": "Ramadan 2026", "scholar_badge": "Scholar Reviewed Content", "tldr_title": "TL;DR", "refs_title": "References & Citations", "ai_disclosure_label": "AI Disclosure",
        "ai_disclosure_text": "This content was generated and organized by AI, then reviewed for accuracy against established Islamic texts (Quran, Sahih Bukhari, Sahih Muslim, and classical scholars like Ibn Sirin).",
        "faq_title": "Frequently Asked Questions", "copyright": "© 2026 Islamvy. All rights reserved.", "ramadan_hero_subtitle": "Countdown to Mercy and Blessings", "select_city": "Select your city",
        "first_day_approx": "First Day of Ramadan (approx):", "ramadan_essentials": "Ramadan Essentials", "spiritual_prep_title": "Spiritual Preparation", "spiritual_prep_desc": "How to prepare your heart for the month of the Quran.",
        "zakat_guide_title": "Zakat Guide", "zakat_guide_desc": "Understand the purification of wealth during this blessed month.", "times_calc_info": "Times are calculated using the Muslim World League method. Please consult your local mosque for exact timings.",
        "label_sahur": "Sahur (Fajr)", "label_iftar": "Iftar (Maghrib)", "label_dhuhr": "Dhuhr", "label_asr": "Asr", "label_isha": "Isha",
        "select_country": "Select your country", "country_tr": "Turkey", "country_id": "Indonesia", "country_sa": "Saudi Arabia", "country_eg": "Egypt", "country_qa": "Qatar", "country_kw": "Kuwait", "country_gulf": "Gulf", "country_eu": "Europe & Others", "country_na": "North Africa"
    },
    "tr": {
        "dir": "ltr", "blog_suffix": "Blog", "label_all": "Tümü", "label_worship": "İbadet", "label_dream": "Rüya", "label_lifestyle": "Yaşam", "label_dhikr": "Zikir & Dua", "label_tech": "Teknoloji", 
        "page_title": "Islamvy Blog", "page_desc": "İslami İçgörüler", "hero_title": "İslami İçgörüler & Hikmet", "hero_desc": "Manevi sorularınıza alim referanslarıyla cevap bulun.", 
        "read_more": "Devamını Oku", "category_dream": "Rüya Tabirleri", "category_dhikr": "Zikir ve Dua", "category_lifestyle": "İslami Yaşam", "category_tech": "İslami Teknoloji", "category_worship": "İbadet Rehberi",
        "app_home": "Uygulama Ana Sayfa", "ramadan_2026": "Ramazan 2026", "scholar_badge": "Alim Onaylı İçerik", "tldr_title": "Özet (Önemli Notlar)", "refs_title": "Referanslar ve Kaynakça", "ai_disclosure_label": "Yapay Zeka Bildirimi",
        "ai_disclosure_text": "Bu içerik yapay zeka tarafından oluşturulmuş ve düzenlenmiş, ardından Kur'an, Sahih-i Buhari, Sahih-i Müslim ve İbn Şirin gibi klasik alimlerin eserlerine dayalı olarak doğruluk açısından incelenmiştir.",
        "faq_title": "Sıkça Sorulan Sorular", "copyright": "© 2026 Islamvy. Tüm hakları saklıdır.", "ramadan_hero_subtitle": "Rahmet ve Bereket Ayına Geri Sayım", "select_city": "Şehrinizi seçin",
        "first_day_approx": "Ramazan'ın İlk Günü (tahmini):", "ramadan_essentials": "Ramazan Hazırlıkları", "spiritual_prep_title": "Manevi Hazırlık", "spiritual_prep_desc": "Kalbinizi Kur'an ayına nasıl hazırlayabilirsiniz?",
        "zakat_guide_title": "Zekat Rehberi", "zakat_guide_desc": "Bu mübarek ayda malın temizlenmesini kavrayın.", "times_calc_info": "Vakitler Dünya Müslümanlar Birliği yöntemiyle hesaplanmaktadır. Kesin vakitler için yerel camiinize danışın.",
        "label_sahur": "Sahur (İmsak)", "label_iftar": "İftar (Akşam)", "label_dhuhr": "Öğle", "label_asr": "İkindi", "label_isha": "Yatsı",
        "select_country": "Ülki seçin", "country_tr": "Türkiye", "country_id": "Endonezya", "country_sa": "Suudi Arabistan", "country_eg": "Mısır", "country_qa": "Katar", "country_kw": "Kuveyt", "country_gulf": "Körfez", "country_eu": "Avrupa ve Diğerleri", "country_na": "Kuzey Afrika"
    },
    "ar": {
        "dir": "rtl", "blog_suffix": "مدونة", "label_all": "الكل", "label_worship": "العبادة", "label_dream": "الأحلام", "label_lifestyle": "نمط الحياة", "label_dhikr": "الذكر والدعاء", "label_tech": "التكنولوجيا", 
        "page_title": "مدونة Islamvy", "page_desc": "رؤى إسلامية", "hero_title": "رؤى وبصائر إسلامية", "hero_desc": "احصل على إجابات لأسئلتك الروحية مع مراجع علمية.", 
        "read_more": "اقرأ المزيد", "category_dream": "تفسير الأحلام", "category_dhikr": "الذكر والدعاء", "category_lifestyle": "نمط الحياة الإسلامي", "category_tech": "تكنولوجيا إسلامية", "category_worship": "دليل العبادة",
        "app_home": "الرئيسية", "ramadan_2026": "رمضان 2026", "scholar_badge": "محتوى راجعه العلماء", "tldr_title": "ملخص سريع", "refs_title": "المراجع والمصادر", "ai_disclosure_label": "إفصاح الذكاء الاصطناعي",
        "ai_disclosure_text": "تم إنشاء هذا المحتوى وتنظيمه بواسطة الذكاء الاصطناعي، ثم مراجعته للتأكد من دقته مقابل النصوص الإسلامية المعتمدة (القرآن، صحيح البخاري، صحيح مسلم، وعلماء التراث مثل ابن سيرين).",
        "faq_title": "الأسئلة الشائعة", "copyright": "© 2026 Islamvy. جميع الحقوق محفوظة.", "ramadan_hero_subtitle": "العد التنازلي لشهور الرحمة والبركات", "select_city": "اختر مدينتك",
        "first_day_approx": "أول أيام رمضان (تقريباً):", "ramadan_essentials": "أساسيات رمضان", "spiritual_prep_title": "الاستعداد الروحي", "spiritual_prep_desc": "كيف تهيئ قلبك لشهر القرآن.",
        "zakat_guide_title": "دليل الزكاة", "zakat_guide_desc": "افهم تزكية المال خلال هذا الشهر الفضيل.", "times_calc_info": "يتم حساب الأوقات باستخدام طريقة رابطة العالم الإسلامي. يرجى استشارة المسجد المحلي لمعرفة الأوقات الدقيقة.",
        "label_sahur": "السحور (الفجر)", "label_iftar": "الإفطار (المغرب)", "label_dhuhr": "الظهر", "label_asr": "العصر", "label_isha": "العشاء",
        "select_country": "اختر بلدك", "country_tr": "تركيا", "country_id": "إندونيسيا", "country_sa": "المملكة العربية السعودية", "country_eg": "مصر", "country_qa": "قطر", "country_kw": "الكويت", "country_gulf": "الخليج", "country_eu": "أوروبا وأخرى", "country_na": "شمال أفريقيا"
    },
    "fr": {
        "dir": "ltr", "blog_suffix": "Blog", "label_all": "Tous", "label_worship": "Culte", "label_dream": "Rêves", "label_lifestyle": "Vie", "label_dhikr": "Dhikr", "label_tech": "Tech", 
        "page_title": "Blog Islamvy", "page_desc": "Perspectives", "hero_title": "Sagesse Islamique", "hero_desc": "Obtenez des réponses basées sur des sources authentiques.", 
        "read_more": "Lire la suite", "category_dream": "Interprétation des rêves", "category_dhikr": "Dhikr & Dua", "category_lifestyle": "Mode de vie", "category_tech": "Technologie Islamique", "category_worship": "Guide de Culte",
        "app_home": "Accueil App", "ramadan_2026": "Ramadan 2026", "scholar_badge": "Contenu révisé par des savants", "tldr_title": "En résumé", "refs_title": "Références & Citations", "ai_disclosure_label": "Divulgation IA",
        "ai_disclosure_text": "Ce contenu a été généré et organisé par l'IA, puis vérifié par rapport aux textes islamiques établis (Coran, Sahih Al-Bukhari, Sahih Muslim et savants classiques comme Ibn Sirin).",
        "faq_title": "Questions Fréquemment Posées", "copyright": "© 2026 Islamvy. Tous droits réservés.", "ramadan_hero_subtitle": "Compte à rebours vers la miséricorde et les bénédictions", "select_city": "Sélectionnez votre ville",
        "first_day_approx": "Premier jour du Ramadan (environ) :", "ramadan_essentials": "Essentiels du Ramadan", "spiritual_prep_title": "Préparation Spirituelle", "spiritual_prep_desc": "Comment préparer son cœur pour le mois du Coran.",
        "zakat_guide_title": "Guide de la Zakat", "zakat_guide_desc": "Comprendre la purification des richesses pendant ce mois béni.", "times_calc_info": "Les horaires sont calculés selon la méthode de la Ligue Islamique Mondiale. Consultez votre mosquée locale pour les horaires exacts.",
        "label_sahur": "Sahur (Fajr)", "label_iftar": "Iftar (Maghrib)", "label_dhuhr": "Dhuhr", "label_asr": "Asr", "label_isha": "Isha",
        "select_country": "Choisissez votre pays", "country_tr": "Turquie", "country_id": "Indonésie", "country_sa": "Arabie Saoudite", "country_eg": "Égypte", "country_qa": "Qatar", "country_kw": "Koweït", "country_gulf": "Golfe", "country_eu": "Europe et autres", "country_na": "Afrique du Nord"
    },
    "id": {
        "dir": "ltr", "blog_suffix": "Blog", "label_all": "Semua", "label_worship": "Ibadah", "label_dream": "Mimpi", "label_lifestyle": "Gaya Hidup", "label_dhikr": "Dzikir", "label_tech": "Teknologi", 
        "page_title": "Blog Islamvy", "page_desc": "Wawasan Islam", "hero_title": "Wawasan & Hikmah Islam", "hero_desc": "Dapatkan jawaban spiritual berdasarkarn referensi shahih.", 
        "read_more": "Baca Selengkapnya", "category_dream": "Tafsir Mimpi", "category_dhikr": "Dzikir & Doa", "category_lifestyle": "Gaya Hidup", "category_tech": "Technologi Islam", "category_worship": "Panduan Ibadah",
        "app_home": "Beranda Aplikasi", "ramadan_2026": "Ramadan 2026", "scholar_badge": "Konten Tinjauan Ulama", "tldr_title": "Ringkasan", "refs_title": "Referensi & Kutipan", "ai_disclosure_label": "Pengungkapan AI",
        "ai_disclosure_text": "Konten ini dibuat dan diatur oleh AI, kemudian ditinjau keakuratannya berdasarkan teks-teks Islam (Al-Quran, Sahih Bukhari, Sahih Muslim, dan ulama klasik seperti Ibnu Sirin).",
        "faq_title": "Pertanyaan yang Sering Diajukan", "copyright": "© 2026 Islamvy. Hak cipta dilindungi undang-undang.", "ramadan_hero_subtitle": "Hitung Mundur Menuju Rahmat dan Keberkahan", "select_city": "Pilih kota Anda",
        "first_day_approx": "Hari Pertama Ramadhan (perkiraan):", "ramadan_essentials": "Esensi Ramadhan", "spiritual_prep_title": "Persiapan Spiritual", "spiritual_prep_desc": "Cara mempersiapkan hati menyambut bulan Al-Quran.",
        "zakat_guide_title": "Panduan Zakat", "zakat_guide_desc": "Pahami penyucian harta selama bulan penuh berkah ini.", "times_calc_info": "Waktu dihitung menggunakan metode Liga Muslim Dunia. Silakan konsultasikan dengan masjid setempat untuk waktu yang tepat.",
        "label_sahur": "Sahur (Fajr)", "label_iftar": "Iftar (Maghrib)", "label_dhuhr": "Dhuhur", "label_asr": "Ashar", "label_isha": "Isya",
        "select_country": "Pilih negara Anda", "country_tr": "Turki", "country_id": "Indonesia", "country_sa": "Arab Saudi", "country_eg": "Mesir", "country_qa": "Qatar", "country_kw": "Kuwait", "country_gulf": "Teluk", "country_eu": "Eropa & Lainnya", "country_na": "Afrika Utara"
    }
}

topics = [
    # Worship (20)
    ("steps-of-salah", "category_worship"), ("how-to-do-wudu", "category_worship"), ("ghusl-guide", "category_worship"), 
    ("ramadan-patience", "category_worship"), ("zakat-calculator-meaning", "category_worship"), ("tahajjud-prayer", "category_worship"),
    ("istikhara-guide", "category_worship"), ("jummah-friday-prayer", "category_worship"), ("hajj-basics", "category_worship"), 
    ("power-of-dua", "category_dhikr"), ("morning-dhikr", "category_dhikr"), ("evening-dhikr", "category_dhikr"),
    ("ayatul-kursi-benefits", "category_dhikr"), ("istighfar-benefits", "category_dhikr"), ("salawat-importance", "category_dhikr"),
    ("tawheed-meaning", "category_dhikr"), ("hasbunallah-trust", "category_dhikr"), ("sleep-adhkar", "category_dhikr"),
    ("dhikr-for-peace", "category_dhikr"), ("quran-recitation-tips", "category_worship"),
    # Lifestyle (15)
    ("sabr-patience", "category_lifestyle"), ("parents-respect", "category_lifestyle"), ("finance-halal", "category_lifestyle"),
    ("modesty-hijab", "category_lifestyle"), ("animal-rights", "category_lifestyle"), ("anxiety-islamic-tips", "category_lifestyle"),
    ("halal-food", "category_lifestyle"), ("marriage-rights", "category_lifestyle"), ("seeking-knowledge", "category_lifestyle"),
    ("time-management", "category_lifestyle"), ("social-media-ethics", "category_lifestyle"), ("best-apps-2026", "category_tech"),
    ("ai-future-islam", "category_tech"), ("smart-rug-tech", "category_tech"), ("qibla-tools", "category_tech"),
    # Dreams (20)
    ("dream-cat", "category_dream"), ("dream-snake", "category_dream"), ("dream-gold", "category_dream"),
    ("dream-water", "category_dream"), ("dream-flying", "category_dream"), ("dream-baby", "category_dream"),
    ("dream-death", "category_dream"), ("dream-rain", "category_dream"), ("dream-shoes", "category_dream"),
    ("dream-crying", "category_dream"), ("dream-car", "category_dream"), ("dream-money", "category_dream"),
    ("dream-sea", "category_dream"), ("dream-house", "category_dream"), ("dream-fish", "category_dream"),
    ("dream-teeth", "category_dream"), ("dream-fire", "category_dream"), ("dream-marriage", "category_dream"),
    ("dream-sun", "category_dream"), ("dream-prophet", "category_dream")
]

def format_title(slug):
    return slug.replace("-", " ").title().replace("Of", "of").replace("Ai", "AI")

def get_image_url(slug, cat_key):
    # Mapping certain categories or keywords to better images
    if "dream" in slug:
        return "https://images.unsplash.com/photo-1511289133649-14a57f6b9077?w=800&q=80" # Moon/Night
    if "salah" in slug or "prayer" in slug or "worship" in cat_key:
        return "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80" # Mosque
    if "quran" in slug:
        return "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80" # Quran
    if "money" in slug or "zakat" in slug or "finance" in slug:
        return "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80" # Finance
    if "tech" in cat_key or "ai" in slug:
        return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80" # Tech
    return "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80"

# Title Translations for better localization
TOPIC_TRANSLATIONS = {
    "steps-of-salah": {"tr": "Namazın Kılınışı", "ar": "خطوات الصلاة", "fr": "Étapes de la prière", "id": "Tata Cara Shalat"},
    "how-to-do-wudu": {"tr": "Abdest Nasıl Alınır?", "ar": "كيفية الوضوء", "fr": "Comment faire le Wudu", "id": "Cara Berwudhu"},
    "ghusl-guide": {"tr": "Boy Abdesti (Gusül) Rehberi", "ar": "دليل الغسل", "fr": "Guide du Ghusl", "id": "Panduan Mandi Wajib"},
    "tahajjud-prayer": {"tr": "Teheccüd Namazı", "ar": "صلاة التهجد", "fr": "Prière de Tahajjud", "id": "Shalat Tahajjud"},
    "istikhara-guide": {"tr": "İstihare Namazı Rehberi", "ar": "دليل صلاة الاستخارة", "fr": "Guide de l'Istikhara", "id": "Panduan Shalat Istikharah"},
    "power-of-dua": {"tr": "Duanın Gücü", "ar": "قوة الدعاء", "fr": "Le pouvoir de la Doua", "id": "Kekuatan Doa"},
    "morning-dhikr": {"tr": "Sabah Zikirleri", "ar": "أذكار الصباح", "fr": "Dhikr du matin", "id": "Dzikir Pagi"},
    "evening-dhikr": {"tr": "Akşam Zikirleri", "ar": "أذكار المساء", "fr": "Dhikr du soir", "id": "Dzikir Petang"},
    "ayatul-kursi-benefits": {"tr": "Ayetel Kürsi Faziletleri", "ar": "فضائل آية الكرسي", "fr": "Bienfaits d'Ayatul Kursi", "id": "Manfaat Ayat Kursi"},
    "dream-cat": {"tr": "Rüyada Kedi Görmek", "ar": "حلم القطة", "fr": "Rêver d'un chat", "id": "Mimpi Kucing"},
    "dream-snake": {"tr": "Rüyada Yılan Görmek", "ar": "حلم الثعبان", "fr": "Rêver d'un serpent", "id": "Mimpi Ular"},
    "dream-baby": {"tr": "Rüyada Bebek Görmek", "ar": "حلم الطفل", "fr": "Rêver d'un bébé", "id": "Mimpi Bayi"},
    "dream-water": {"tr": "Rüyada Su Görmek", "ar": "حلم الماء", "fr": "Rêver d'eau", "id": "Mimpi Air"},
    "dream-gold": {"tr": "Rüyada Altın Görmek", "ar": "حلم الذهب", "fr": "Rêver d'or", "id": "Mimpi Emas"},
    # Add more as needed
}

def get_content(slug, cat_key, lang):
    is_dream = "dream" in slug
    title = TOPIC_TRANSLATIONS.get(slug, {}).get(lang, format_title(slug))
    
    # Accurate Islamic content based on research
    # Worship Guides
    worship_data = {
        "steps-of-salah": {
            "en": {
                "summary": "A comprehensive guide to performing Salah according to the Sunnah.",
                "tldr": "Salah is the second pillar of Islam and follows a specific prophetic method from Takbir to Taslim.",
                "body": """
                    <p>Salah begins with <strong>Takbiratul Ihram</strong>, raising your hands to your ears and saying 'Allahu Akbar'. This marks the start of your sacred connection with Allah. Following this, you recite the opening supplication (Sana) and Surah Al-Fatihah.</p>
                    <p>Each Rakat (unit) includes <strong>Ruku</strong> (bowing) where you say 'Subhana Rabbiy-al-Adheem' thrice, <strong>Sujood</strong> (prostration) where you say 'Subhana Rabbiy-al-A'la' thrice, and sitting sessions known as <strong>Jalsah</strong> and <strong>Tashahhud</strong>.</p>
                    <p>The Prophet Muhammad (PBUH) instructed: 'Pray as you have seen me praying' (Sahih Bukhari).</p>
                """,
                "faqs": [{"q": "Can women pray differently?", "a": "The general steps are the same, though women should cover everything except face and hands."}],
                "refs": ["Sahih Bukhari", "Sahih Muslim"]
            },
            "tr": {
                "summary": "Sünnete göre namaz kılma rehberi.",
                "tldr": "Namaz İslam'ın ikinci şartıdır ve Tekbir'den Selam'a kadar belirli bir peygamberi yöntemi izler.",
                "body": """
                    <p>Namaz, ellerinizi kulaklarınıza kaldırarak ve 'Allahu Ekber' diyerek <strong>İftitah Tekbiri</strong> ile başlar. Bu, Allah ile kutsal bağınızın başlangıcıdır. Ardından Sübhaneke ve Fatiha Suresi okunur.</p>
                    <p>Her rekat, 'Sübhane Rabbiyel-Azim' dediğiniz <strong>Rükû</strong>, 'Sübhane Rabbiyel-Ala' dediğiniz <strong>Secde</strong> ve <strong>Ka'de-i Ahire</strong> (son oturuş) gibi bölümleri içerir.</p>
                    <p>Peygamberimiz (S.A.V) şöyle buyurmuştur: 'Beni nasıl namaz kılıyor gördüyseniz, siz de öyle kılın' (Buhari).</p>
                """,
                "faqs": [{"q": "Namazda niyet nasıl edilir?", "a": "Niyet kalben yapılır, dil ile söylenmesi zorunlu değildir."}],
                "refs": ["Sahih-i Buhari", "Sahih-i Müslim"]
            }
        },
        "how-to-do-wudu": {
            "en": {
                "summary": "Authentic step-by-step guide to Wudu (Ablution).",
                "tldr": "Wudu is required before Salah and includes washing hands, mouth, nose, face, arms, head, and feet.",
                "body": """
                    <p>Wudu starts with <strong>Niyyah</strong> (intention) and saying 'Bismillah'. You wash your hands thrice, then rinse your <strong>mouth and nose</strong>. Next, wash your <strong>face</strong> and your <strong>arms</strong> up to the elbows.</p>
                    <p><strong>Masah</strong> involves wiping your head with wet hands once, including the ears. Finally, wash your <strong>feet</strong> up to the ankles, ensuring water reaches between the toes.</p>
                    <p>The Prophet (PBUH) said: 'The wudu of the one who does not say Bismillah is invalid' (Abu Dawud).</p>
                """,
                "faqs": [{"q": "What breaks Wudu?", "a": "Passing wind, deep sleep, or using the bathroom break wudu."}],
                "refs": ["Abu Dawud", "Sahih Muslim"]
            },
            "tr": {
                "summary": "Adım adım abdest alma rehberi.",
                "tldr": "Namazdan önce abdest farzdır; eller, ağız, burun, yüz, kollar, baş ve ayakların yıkanmasını içerir.",
                "body": "<p>Abdest <strong>Niyet</strong> ve 'Besmele' ile başlar. Elleri üç kez yıkayın, ardından <strong>ağız ve burnu</strong> temizleyin. Sonra <strong>yüzü</strong> ve dirseklere kadar <strong>kolları</strong> yıkayın.</p><p><strong>Mesh</strong>, ıslak ellerle başın ve kulakların bir kez silinmesini içerir. Son olarak <strong>ayakları</strong> bileklere kadar yıkayın.</p>",
                "faqs": [{"q": "Abdesti neler bozar?", "a": "Yellenmek, derin uyku veya tuvalet ihtiyacı abdesti bozar."}],
                "refs": ["Ebu Davud", "Sahih-i Müslim"]
            },
            "ar": {
                "summary": "دليل خطوة بخطوة للوضوء (الطهارة).",
                "tldr": "الوضوء مطلوب قبل الصلاة ويشمل غسل اليدين والفم والأنف والوجه والذراعين والرأس والقدمين.",
                "body": "<p>يبدأ الوضوء <strong>بالنية</strong> وقول 'بسم الله'. تغسل يديك ثلاث مرات، ثم تشطف <strong>فمك وأنفك</strong>. بعد ذلك، تغسل <strong>وجهك</strong> و<strong>ذراعيك</strong> حتى المرفقين.</p><p>يشمل <strong>المسح</strong> مسح رأسك بيدين مبللتين مرة واحدة، بما في ذلك الأذنين. أخيرًا، تغسل <strong>قدميك</strong> حتى الكعبين.</p>",
                "faqs": [{"q": "ما الذي يبطل الوضوء؟", "a": "خروج الريح، النوم العميق، أو استخدام الحمام يبطل الوضوء."}],
                "refs": ["أبو داود", "صحيح مسلم"]
            },
            "fr": {
                "summary": "Guide authentique étape par étape pour le Wudu (ablution).",
                "tldr": "Le Wudu est requis avant la Salah et comprend le lavage des mains, de la bouche, du nez, du visage, des bras, de la tête et des pieds.",
                "body": "<p>Le Wudu commence par la <strong>Niyyah</strong> (intention) et en disant 'Bismillah'. Lavez vos mains trois fois, puis rincez votre <strong>bouche et votre nez</strong>. Ensuite, lavez votre <strong>visage</strong> et vos <strong>bras</strong> jusqu'aux coudes.</p><p>Le <strong>Masah</strong> implique d'essuyer votre tête avec des mains mouillées une fois, y compris les oreilles. Enfin, lavez vos <strong>pieds</strong> jusqu'aux chevilles.</p>",
                "faqs": [{"q": "Qu'est-ce qui annule le Wudu ?", "a": "Émettre des gaz, un sommeil profond ou l'utilisation des toilettes annulent le Wudu."}],
                "refs": ["Abu Dawud", "Sahih Muslim"]
            },
            "id": {
                "summary": "Panduan wudu (bersuci) langkah demi langkah yang otentik.",
                "tldr": "Wudu diperlukan sebelum shalat dan meliputi mencuci tangan, mulut, hidung, wajah, lengan, kepala, dan kaki.",
                "body": "<p>Wudu dimulai dengan <strong>Niat</strong> dan mengucapkan 'Bismillah'. Cuci tangan Anda tiga kali, lalu berkumur dan membersihkan <strong>hidung</strong>. Selanjutnya, cuci <strong>wajah</strong> dan <strong>lengan</strong> Anda hingga siku.</p><p><strong>Masah</strong> melibatkan mengusap kepala dengan tangan basah sekali, termasuk telinga. Terakhir, cuci <strong>kaki</strong> Anda hingga mata kaki.</p>",
                "faqs": [{"q": "Apa yang membatalkan Wudu?", "a": "Buang angin, tidur nyenyak, atau buang air membatalkan wudu."}],
                "refs": ["Abu Dawud", "Sahih Muslim"]
            }
        },
        "ghusl-guide": {
            "en": {
                "summary": "How to perform the ritual purification of Ghusl.",
                "tldr": "Ghusl is obligatory after major impurity and follows a complete washing of the entire body.",
                "body": """
                    <p>Ghusl starts with the <strong>intention</strong> and washing your hands. Wash the private parts, then perform <strong>Wudu</strong> (some scholars say feet can be washed at the end). Pour water thrice over the <strong>head</strong>, then the <strong>right side</strong> of the body, and finally the <strong>left side</strong>.</p>
                    <p>Ensure that water reaches every single part of the skin and hair roots.</p>
                """,
                "faqs": [{"q": "Is washing the mouth necessary?", "a": "Yes, rinsing the mouth and nose is part of the complete Ghusl."}],
                "refs": ["Sahih Muslim", "Bulugh al-Maram"]
            }
        },
        "tahajjud-prayer": {
            "en": {
                "summary": "The virtues and method of the Night Prayer.",
                "tldr": "Tahajjud is prayed in the last third of the night and is one of the most beloved prayers to Allah.",
                "body": """
                    <p>The best time for <strong>Tahajjud</strong> is after waking up from sleep in the <strong>last third</strong> of the night. It is prayed in units of two (two by two). The minimum is two rakats, and the maximum is not strictly limited, though the Prophet usually prayed 8 or 11 including Witr.</p>
                    <p>Allah descends to the lowest heaven and asks: 'Who is calling upon Me, that I may answer him?' (Sahih Bukhari).</p>
                """,
                "faqs": [{"q": "Do I have to sleep first?", "a": "While waking up after sleep is ideal (the meaning of Tahajjud), praying after Isha is also valid as Qiyam-al-Layl."}],
                "refs": ["Sahih Bukhari", "Surah Al-Muzzammil"]
            }
        },
        "jummah-friday-prayer": {
            "en": {
                "summary": "The virtues and etiquette of the Friday prayer.",
                "tldr": "Friday is the best day of the week, and Jummah prayer is obligatory for men.",
                "body": "<p>Prophet Muhammad (PBUH) said: 'The best day on which the sun has risen is Friday.' (Sahih Muslim). Etiquettes include taking a bath (Ghusl), wearing clean clothes, coming early to the mosque, and listening attentively to the Khutbah.</p>",
                "faqs": [{"q": "When should I recite Surah Kahf?", "a": "It is recommended to recite it anytime on Friday, from sunset on Thursday until sunset on Friday."}],
                "refs": ["Sahih Muslim", "Surah Al-Jumu'ah"]
            }
        },
        "hajj-basics": {
            "en": {
                "summary": "A brief overview of the pillars of Hajj.",
                "tldr": "Hajj is the fifth pillar of Islam, performed once in a lifetime for those who are able.",
                "body": "<p>Hajj involves specific rituals in Mecca, Mina, Arafat, and Muzdalifah. The main pillars are: 1. Ihram, 2. Standing at Arafat, 3. Tawaf al-Ifadah, 4. Sa'i between Safa and Marwa.</p>",
                "faqs": [{"q": "When is Hajj performed?", "a": "In the month of Dhu al-Hijjah, the 12th month of the Islamic calendar."}],
                "refs": ["The Holy Quran", "Sahih Bukhari"]
            }
        },
        "istikhara-guide": {
            "en": {
                "summary": "How to perform Salat al-Istikhara for guidance.",
                "tldr": "Istikhara is a 2-rakat prayer followed by a specific dua to seek Allah's counsel in decisions.",
                "body": """
                    <p>When facing a decision, perform two non-obligatory rakats. After finishing, recite the <strong>Istikhara Dua</strong> where you ask Allah to decree what is good for your religion and livelihood.</p>
                    <p>You don't need a dream; rather, Allah will make the right choice easy and turn you away from the wrong one.</p>
                """,
                "faqs": [{"q": "Can I pray it for marriage?", "a": "Yes, it is highly recommended for all major life decisions including marriage."}],
                "refs": ["Sahih Bukhari", "Tirmidhi"]
            }
        }
    }

    # Dhikr and Dua Data
    dhikr_data = {
        "evening-dhikr": {
            "en": {
                "summary": "Protecting the soul through evening remembrance.",
                "tldr": "Evening Adhkar (after Asr) provide a shield for the night ahead.",
                "body": "<p>Evening remembrance is essential for spiritual safety. The Prophet (PBUH) taught us to seek refuge from the evils of the night and to thank Allah for the blessings of the day.</p>",
                "faqs": [{"q": "When is the best time?", "a": "Between Asr and Maghrib."}],
                "refs": ["Sahih Muslim", "Hisnul Muslim"]
            }
        },
        "tawheed-meaning": {
            "en": {
                "summary": "The core of Islamic belief: The Oneness of Allah.",
                "tldr": "Tawheed is the foundation of Islam and the purpose of creation.",
                "body": "<p>Tawheed involves believing in Allah's Oneness in His Lordship, His Worship, and His Names and Attributes. It is the message of all Prophets from Adam to Muhammad (PBUH).</p>",
                "faqs": [{"q": "What is Shirk?", "a": "Shirk is associating partners with Allah, which is the opposite of Tawheed."}],
                "refs": ["The Holy Quran", "Kitab at-Tawheed"]
            }
        },
        "hasbunallah-trust": {
            "en": {
                "summary": "The power of relying solely on Allah.",
                "tldr": "Saying 'Hasbunallahu wa ni'mal wakeel' is the ultimate declaration of trust.",
                "body": "<p>When the believers were threatened, they said: 'Sufficient for us is Allah, and [He is] the best Disposer of affairs.' (3:173). This phrase brings peace during hardships.</p>",
                "faqs": [{"q": "Is it from the Quran?", "a": "Yes, it is mentioned in Surah Ali 'Imran, verse 173."}],
                "refs": ["Surah Ali 'Imran", "Sahih Bukhari"]
            }
        },
        "power-of-dua": {
            "en": {
                "summary": "Understanding Dua as the essence of worship.",
                "tldr": "Dua is a direct link to Allah and can change destiny.",
                "body": "<p>The Prophet (PBUH) said: 'Dua is the essence of worship' (Tirmidhi). It is the weapon of the believer. Whether answered immediately, delayed, or used to avert a calamity, no sincere Dua is ever lost.</p>",
                "faqs": [{"q": "When is the best time for Dua?", "a": "Between Adhan and Iqamah, during Sujood, and in the last third of the night."}],
                "refs": ["Tirmidhi", "Al-Adab Al-Mufrad"]
            }
        },
        "morning-dhikr": {
            "en": {
                "summary": "The importance of starting the day with remembrance.",
                "tldr": "Starting the day with Masnun Adhkar provides protection and barakah.",
                "body": "<p>Morning Adhkar (after Fajr) are a shield for the believer. Reciting 'Subhanallahi wa bihamdihi' 100 times wipes away sins even if they are like the foam of the sea.</p>",
                "faqs": [{"q": "What is the time frame?", "a": "From Fajr until sunrise is the optimal time."}],
                "refs": ["Hisnul Muslim", "Sahih Muslim"]
            }
        },
        "istighfar-benefits": {
            "en": {
                "summary": "The amazing doors opened by seeking forgiveness.",
                "tldr": "Istighfar brings sustenance, strength, and joy to the heart.",
                "body": "<p>Allah says in the Quran: 'Ask forgiveness of your Lord... He will send [rain from] the sky upon you in abundance and give you increase in wealth and children' (71:10-12).</p>",
                "faqs": [{"q": "What is the best form of Istighfar?", "a": "Sayyid-ul-Istighfar is the most superior form."}],
                "refs": ["Surah Nuh", "Sahih Bukhari"]
            }
        }
    }

    # Lifestyle Data
    lifestyle_data = {
        "sabr-patience": {
            "en": {
                "summary": "Cultivating patience in the face of trials.",
                "tldr": "Sabr is not just waiting, but how we behave while we wait.",
                "body": "<p>Allah is with the patient (Innallaha ma'as-sabirin). Sabr is mentioned over 90 times in the Quran. It involves restraining the soul from despair and the tongue from complaining against Allah's decree.</p>",
                "faqs": [{"q": "Is crying allowed?", "a": "Yes, crying is a natural mercy; Sabr is about not questioning Allah's wisdom."}],
                "refs": ["Surah Al-Baqarah", "Sahih Muslim"]
            }
        },
        "parents-respect": {
            "en": {
                "summary": "The high status of parents in Islamic ethics.",
                "tldr": "Kindness to parents is ranked immediately after the worship of Allah.",
                "body": "<p>The Quran says: 'And your Lord has decreed that you worship none but Him, and that you be dutiful to your parents' (17:23). Even saying 'Uff' to them is forbidden.</p>",
                "faqs": [{"q": "What if they are non-Muslim?", "a": "You must still treat them with utmost kindness and respect in worldly matters."}],
                "refs": ["Surah Al-Isra", "Sahih Bukhari"]
            }
        },
        "finance-halal": {
            "en": {
                "summary": "Principles of ethical and halal wealth.",
                "tldr": "Seeking halal sustenance is an obligation upon every Muslim.",
                "body": "<p>Riba (usury) is strictly forbidden. A believer should ensure their income is pure, as a body nourished by haram will not have its Duas answered.</p>",
                "faqs": [{"q": "Is investing allowed?", "a": "Yes, as long as the business and the contract are shariah-compliant."}],
                "refs": ["Sahih Muslim", "Surah Al-Baqarah"]
            }
        },
        "anxiety-islamic-tips": {
            "en": {
                "summary": "Finding peace through faith during anxious times.",
                "tldr": "Islamic practices like Dhikr, Salah, and Tawakkul are powerful tools against anxiety.",
                "body": "<p>Allah says: 'Verily, in the remembrance of Allah do hearts find rest.' (13:28). Anxiety is often a result of worrying about the future, which is in Allah's hands. Focus on the present moment and entrust your affairs to Al-Wakil.</p>",
                "faqs": [{"q": "Is it okay to seek professional help?", "a": "Yes, seeking medical or psychological help is a form of taking action (Tavakkul), as the Prophet taught us to seek cures."}],
                "refs": ["Surah Ar-Ra'd", "Sahih Bukhari"]
            }
        },
        "marriage-rights": {
            "en": {
                "summary": "The foundations of a healthy Islamic marriage.",
                "tldr": "Marriage in Islam is built on tranquility, love, and mercy.",
                "body": "<p>The Quran describes the relationship between spouses as a source of peace (Mawaddah and Rahmah). Both husband and wife have rights and responsibilities designed to create a harmonious home environment based on mutual respect and fear of Allah.</p>",
                "faqs": [{"q": "What is the key to a long marriage?", "a": "Patience, communication, and making Allah the center of the household."}],
                "refs": ["Surah Ar-Rum", "Tirmidhi"]
            }
        },
        "seeking-knowledge": {
            "en": {
                "summary": "The obligation and virtue of learning.",
                "tldr": "Seeking knowledge is a path to Paradise for every Muslim.",
                "body": "<p>The Prophet (PBUH) said: 'Seeking knowledge is an obligation upon every Muslim.' (Ibn Majah). This includes both religious knowledge and worldly knowledge that benefits the Ummah.</p>",
                "faqs": [{"q": "Where should I start?", "a": "Start with the basics of Aqidah (beliefs) and Fiqh of worship (Salah, Wudu)."}],
                "refs": ["Ibn Majah", "Sahih Muslim"]
            }
        },
        "time-management": {
            "en": {
                "summary": "An Islamic perspective on the value of time.",
                "tldr": "Our time is a trust from Allah that we will be questioned about.",
                "body": "<p>Surah Al-Asr reminds us that mankind is in loss except those who have faith and do righteous deeds. A Muslim should structure their day around the five daily prayers, ensuring a balance between dunya and akhirah.</p>",
                "faqs": [{"q": "How to avoid procrastination?", "a": "Start tasks with Bismillah, make a plan after Fajr, and avoid idle talk."}],
                "refs": ["Surah Al-Asr", "Tirmidhi"]
            }
        }
    }

    # Dream interpretations based on Ibn Sirin
    dream_interpretations = {
        "dream-cat": {
            "en": "A cat in a dream often signifies a corrupted thief or a deceitful person. If the cat is aggressive, it warns of potential betrayal or envy.",
            "tr": "Rüyada kedi görmek genellikle hırsıza veya hilekar bir kimseye işaret eder. Kedinin saldırgan olması, ihanet veya haset konusunda bir uyarıdır.",
            "ar": "القطة في الحلم غالباً ما ترمز إلى لص أو شخص مخادع. إذا كانت القطة عدوانية، فهي تحذر من خيانة محتملة أو حسد.",
            "fr": "Un chat dans un rêve signifie souvent un voleur corrompu ou une personne trompeuse. Si le chat est agressif, il avertit d'une trahison potentielle.",
            "id": "Kucing dalam mimpi seringkali melambangkan pencuri atau orang yang licik. Jika kucing itu agresif, itu memperingatkan pengkhianatan atau rasa iri."
        },
        "dream-snake": {
            "en": "A snake represents an enemy. The larger the snake, the more powerful the enemy. Killing it means victory.",
            "tr": "Yılan düşmanı temsil eder. Yılan ne kadar büyükse, düşman o kadar güçlüdür. Onu öldürmek zafer demektir.",
            "ar": "الثعبان يمثل العدو. كلما كان الثعبان أكبر، كان العدو أقوى. قتله يعني النصر.",
            "fr": "Un serpent représente un ennemi. Plus le serpent est gros, plus l'ennemi est puissant. Le tuer signifie la victoire.",
            "id": "Ular melambangkan musuh. Semakin besar ularnya, semakin kuat musuhnya. Membunuhnya berarti kemenangan."
        },
        "dream-gold": {
            "en": "Gold can symbolize wealth and joy, but also heavy burdens or worries depending on the context. Finding gold coins is better than finding raw gold.",
            "tr": "Altın zenginlik ve sevinci simgeleyebilir ancak bağlama göre ağır yükleri veya endişeleri de temsil edebilir. Altın para bulmak, işlenmemiş altın bulmaktan daha hayırlıdır.",
            "ar": "الذهب يمكن أن يرمز إلى الثروة والفرح، ولكن أيضاً إلى الأعباء الثقيلة أو الهموم حسب السياق. العثور على عملات ذهبية خير من العثور على ذهب خام.",
            "fr": "L'or peut symboliser la richesse et la joie, mais aussi de lourds fardeaux ou des soucis selon le contexte. Trouver des pièces d'or vaut mieux que trouver de l'or brut.",
            "id": "Emas dapat melambangkan kekayaan dan kegembiraan, tetapi juga beban berat atau kekhawatiran tergantung pada konteksnya. Menemukan koin emas lebih baik daripada menemukan emas mentah."
        },
        "dream-water": {
            "en": "Clear water represents knowledge, life, and purity. Muddy or turbulent water signifies trials, sickness, or difficulties.",
            "tr": "Berrak su ilim, hayat ve saflığı temsil eder. Bulanık veya türbülanslı su ise imtihan, hastalık veya zorluklara işaret eder.",
            "ar": "الماء الصافي يمثل العلم والحياة والطهارة. أما الماء العكر أو المضطرب فيرمز إلى الفتن أو المرض أو الصعوبات.",
            "fr": "L'eau claire représente la connaissance, la vie et la pureté. L'eau boueuse ou turbulente signifie des épreuves, la maladie ou des difficultés.",
            "id": "Air jernih melambangkan ilmu, kehidupan, dan kemurnian. Air berlumpur atau bergolak menandakan ujian, penyakit, atau kesulitan."
        },
        "dream-flying": {
            "en": "Flying signifies travel, mobility, or a rise in status and rank. If you fly high without falling, it's a very positive sign of success.",
            "tr": "Uçmak yolculuk, hareketlilik veya statü ve rütbe artışına işaret eder. Düşmeden yüksekte uçmak, başarının çok olumlu bir işaretidir.",
            "ar": "الطيران يرمز إلى السفر أو التنقل أو العلو في المكانة والرتبة. إذا طرت عالياً دون سقوط، فهذه علامة إيجابية جداً على النجاح.",
            "fr": "Voler signifie un voyage, la mobilité ou une ascension dans le statut et le rang. Si vous volez haut sans tomber, c'est un signe de succès très positif.",
            "id": "Terbang melambangkan perjalanan, mobilitas, atau peningkatan status dan jabatan. Jika Anda terbang tinggi tanpa jatuh, itu pertanda kesuksesan yang sangat positif."
        },
        "dream-baby": {
            "en": "A baby often signifies new beginnings, a project, or a responsibility. A baby girl is usually seen as a sign of joy and ease, while a baby boy can sometimes represent trials.",
            "tr": "Bebek genellikle yeni başlangıçları, bir projeyi veya bir sorumluluğu simgeler. Kız bebek sevinç ve kolaylık, erkek bebek ise bazen imtihan olarak görülür.",
            "ar": "الطفل غالباً ما يرمز إلى البدايات الجديدة أو مشروع أو مسؤولية. الطفلة عادة ما تكون بشرى فرح ويسر، بينما الطفل الذكر قد يمثل أحياناً بعض الهموم.",
            "fr": "Un bébé signifie souvent de nouveaux départs, un projet ou une responsabilité. Une petite fille est signe de joie, tandis qu'un petit garçon peut représenter des épreuves.",
            "id": "Bayi seringkali melambangkan awal yang baru, proyek, atau tanggung jawab. Bayi perempuan biasanya pertanda kegembiraan, sedangkan bayi laki-laki bisa mewakili ujian."
        },
        "dream-water": {
            "en": "Clear water represents knowledge, life, and purity. Muddy or turbulent water signifies trials, sickness, or difficulties.",
            "tr": "Berrak su ilim, hayat ve saflığı temsil eder. Bulanık veya türbülanslı su ise imtihan, hastalık veya zorluklara işaret eder.",
            "ar": "الماء الصافي يمثل العلم والحياة والطهارة. أما الماء العكر أو المضطرب فيرمز إلى الفتن أو المرض أو الصعوبات.",
            "fr": "L'eau claire représente la connaissance, la vie et la pureté. L'eau boueuse ou turbulente signifie des épreuves, la maladie ou des difficultés.",
            "id": "Air jernih melambangkan ilmu, kehidupan, dan kemurnian. Air berlumpur atau bergolak menandakan ujian, penyakit, atau kesulitan."
        }
    }

    # Fallback and common content
    fallbacks = {
        "en": {
            "summary": f"Authentic Islamic perspective on {title}.",
            "tldr": f"{title} provides essential guidance for a balanced spiritual life.",
            "body": f"<p>{title} is explored through the lenses of Quran and authentic Sunnah. Understanding this helps strengthen your Iman.</p>",
            "faqs": [{"q": f"What is the significance of {title}?", "a": f"It is a key concept defined by scholars based on prophetic traditions."}],
            "refs": ["The Holy Quran", "Sahih Al-Bukhari", "Sahih Muslim"]
        },
        "tr": {
            "summary": f"{title} hakkında İslami bilgiler.",
            "tldr": f"{title} manevi hayat için önemli rehberlik sunar.",
            "body": f"<p>{title} konusu Kur'an ve Sünnet ışığında ele alınmıştır. Bu konuyu anlamak inancınızı güçlendirmeye yardımcı olur.</p>",
            "faqs": [{"q": f"{title} nedir?", "a": "İslami kaynaklara göre önemli bir kavramdır."}],
            "refs": ["Kur'an-ı Kerim", "Hadis Kaynakları"]
        },
        "ar": {
            "summary": f"منظور إسلامي أصيل حول {title}.",
            "tldr": f"يوفر {title} إرشادات أساسية لحياة روحية متوازنة.",
            "body": f"<p>يتم استكشاف {title} من خلال عدسات القرآن والسنة الصحيحة. فهم هذا يساعد في تقوية الإيمان.</p>",
            "faqs": [{"q": f"ما هي أهمية {title}؟", "a": "إنه مفهوم أساسي حدده العلماء بناءً على التقاليد النبوية."}],
            "refs": ["القرآن الكريم", "صحيح البخاري", "صحيح مسلم"]
        },
        "fr": {
            "summary": f"Perspective islamique authentique sur {title}.",
            "tldr": f"{title} fournit des conseils essentiels pour une vie spirituelle équilibrée.",
            "body": f"<p>{title} est exploré à travers le Coran et la Sunna authentique. Comprendre cela aide à renforcer votre foi.</p>",
            "faqs": [{"q": f"Quelle est la signification de {title}?", "a": "C'est un concept clé défini par les savants sur la base des traditions prophétiques."}],
            "refs": ["Le Saint Coran", "Sahih Al-Bukhari", "Sahih Muslim"]
        },
        "id": {
            "summary": f"Perspektif Islam otentik tentang {title}.",
            "tldr": f"{title} memberikan panduan penting untuk kehidupan spiritual yang seimbang.",
            "body": f"<p>{title} dijelajahi melalui lensa Al-Quran dan Sunnah otentik. Memahami hal ini membantu memperkuat Iman Anda.</p>",
            "faqs": [{"q": f"Apa pentingnya {title}?", "a": "Ini adalah konsep kunci yang didefinisikan oleh para ulama berdasarkan tradisi kenabian."}],
            "refs": ["Al-Quran", "Sahih Al-Bukhari", "Sahih Muslim"]
        }
    }

    # Tech-specific content
    if "tech" in cat_key or "ai" in slug:
        fallbacks["en"].update({
            "summary": f"Exploring {title} in the modern Islamic world.",
            "tldr": "Technology should serve our spiritual journey while adhering to ethical Islamic frameworks.",
            "body": f"<p>{title} is part of the evolving landscape of Islamic Tech. From AI ethics to smart tools, we explore how tech empowers the Ummah while maintaining tradition.</p>",
            "faqs": [{"q": "Is using AI allowed in Islam?", "a": "Yes, as long as it is used for beneficial purposes and does not violate moral principles."}],
            "refs": ["Islamic Ethics in Technology", "Contemporary Fatawa"]
        })

    # Apply data if exists
    data_source = None
    if slug in worship_data: data_source = worship_data[slug]
    elif slug in dhikr_data: data_source = dhikr_data[slug]
    elif slug in lifestyle_data: data_source = lifestyle_data[slug]

    res_map = {}
    for l in LANGUAGES:
        # Start with the general fallback for the current language
        l_content = fallbacks.get(l, fallbacks["en"]).copy()
        
        # Always use the translated title if available, otherwise the formatted slug
        l_content["title"] = TOPIC_TRANSLATIONS.get(slug, {}).get(l, format_title(slug))

        # If specific data exists for this slug and language, update with it
        if data_source and l in data_source:
            l_content.update(data_source[l])
            # Ensure title from data_source doesn't override TOPIC_TRANSLATIONS
            l_content["title"] = TOPIC_TRANSLATIONS.get(slug, {}).get(l, format_title(slug))
        # If specific data exists for this slug but not for the current language, use English data
        elif data_source and "en" in data_source:
            # Update with English data, but keep the current language's title and potentially other translated fallbacks
            # This is a partial override: English body/summary/faqs/refs, but translated title
            en_data = data_source["en"].copy()
            en_data["title"] = l_content["title"] # Keep the translated title
            l_content.update(en_data)
        
        res_map[l] = l_content

    res = res_map.get(lang, res_map["en"])

    # Apply dream logic overrides
    if is_dream:
        intr = dream_interpretations.get(slug, dream_interpretations["dream-cat"])
        final_intr = intr.get(lang, intr["en"])
        res["body"] = f"<p><strong>Ibn Sirin's Interpretation:</strong> {final_intr}</p>"
        res["summary"] = final_intr[:120] + "..."
    
    return res

# --- MAIN GENERATION LOOP ---

for lang in LANGUAGES:
    print(f"Generating {lang} Blog...")
    posts_path = f"islamvy-web/blog/{lang}/posts"
    os.makedirs(posts_path, exist_ok=True)
    grid_html = ""
    trans = TRANSLATIONS[lang]
    
    for slug, cat_key in topics:
        content = get_content(slug, cat_key, lang)
        img_url = get_image_url(slug, cat_key)
        
        breadcrumb = json.dumps({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Blog","item":f"https://islamvy.com/blog/{lang}/index.html"},{"@type":"ListItem","position":2,"name":cat_key.replace('category_','').title(),"item":f"https://islamvy.com/blog/{lang}/index.html"},{"@type":"ListItem","position":3,"name":content['title'],"item":f"https://islamvy.com/blog/{lang}/posts/{slug}.html"}]})
        faq_schema = json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":f['q'],"acceptedAnswer":{"@type":"Answer","text":f['a']}} for f in content['faqs']]})
        
        # Smart Navbar with dynamic language switcher
        navbar = NAVBAR_TEMPLATE.format(
            root_path="../../../",
            lang=lang,
            page_path=f"posts/{slug}.html",
            blog_suffix=trans['blog_suffix'],
            curr_lang_upper=lang.upper(),
            app_home=trans['app_home'],
            ramadan_2026=trans['ramadan_2026']
        )
        
        faq_html = "".join([f'<div style="margin-bottom:1.5rem;"><h3 style="color:#A3D9C9;">{f["q"]}</h3><p>{f["a"]}</p></div>' for f in content["faqs"]])
        refs_html = "<ul>" + "".join([f'<li>{r}</li>' for r in content["refs"]]) + "</ul>"
        
        full_html = POST_TEMPLATE.format(
            lang=lang,
            dir=trans["dir"],
            blog_suffix=trans['blog_suffix'],
            title=content["title"],
            description=content["summary"],
            filename=f"{slug}.html",
            hreflang_tags="\n    ".join([f'<link rel="alternate" hreflang="{l}" href="https://islamvy.com/blog/{l}/posts/{slug}.html" />' for l in LANGUAGES]),
            image_url=img_url,
            breadcrumb_schema=breadcrumb,
            faq_schema=faq_schema,
            navbar_html=navbar,
            category=trans.get(cat_key, "Blog"),
            date="Feb 15, 2026",
            read_time="5",
            tldr=content["tldr"],
            content_body=content["body"],
            references_html=refs_html,
            faq_html=faq_html,
            scholar_badge=trans['scholar_badge'],
            tldr_title=trans['tldr_title'],
            refs_title=trans['refs_title'],
            ai_disclosure_label=trans['ai_disclosure_label'],
            ai_disclosure_text=trans['ai_disclosure_text'],
            faq_title=trans['faq_title'],
            copyright=trans['copyright']
        )
        
        with open(f"{posts_path}/{slug}.html", "w", encoding="utf-8") as f:
            f.write(full_html)
        
        short_cat = cat_key.replace('category_','')
        grid_html += f"""
        <article class="blog-card" data-category="{short_cat}" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; transition: 0.4s;">
            <div style="position: relative;">
                <img src="{img_url}" alt="{content['title']}" style="width: 100%; height: 200px; object-fit: cover;">
                <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(30, 62, 52, 0.9); padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; color: #A3D9C9; backdrop-filter: blur(4px); border: 1px solid rgba(163, 217, 201, 0.2);">{trans.get(cat_key, "Blog")}</span>
            </div>
            <div style="padding: 1.5rem;">
                <h2 style="font-size: 1.25rem; margin: 0 0 0.5rem 0; color:#fff;">{content['title']}</h2>
                <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1.5rem;">{content['summary']}</p>
                <a href="posts/{slug}.html" style="color: #A3D9C9; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px;">{trans['read_more']} <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        </article>
        """

    # Index Page
    idx_navbar = NAVBAR_TEMPLATE.format(
        root_path="../../",
        lang=lang,
        page_path="index.html",
        blog_suffix=trans['blog_suffix'],
        curr_lang_upper=lang.upper(),
        app_home=trans['app_home'],
        ramadan_2026=trans['ramadan_2026']
    )
    idx_html = INDEX_TEMPLATE.format(
        lang=lang,
        dir=trans["dir"],
        blog_suffix=trans['blog_suffix'],
        page_title=trans["page_title"],
        page_desc=trans["page_desc"],
        navbar_html=idx_navbar,
        hero_title=trans["hero_title"],
        hero_desc=trans["hero_desc"],
        posts_html=grid_html,
        label_all=trans['label_all'],
        label_worship=trans['label_worship'],
        label_dream=trans['label_dream'],
        label_lifestyle=trans['label_lifestyle'],
        label_dhikr=trans['label_dhikr'],
        label_tech=trans['label_tech'],
        copyright=trans['copyright']
    )
    with open(f"islamvy-web/blog/{lang}/index.html", "w", encoding="utf-8") as f:
        f.write(idx_html)

    # Ramadan Hub
    print(f"Generating {lang} Ramadan Hub...")
    ramadan_path = f"islamvy-web/blog/{lang}/ramadan"
    os.makedirs(ramadan_path, exist_ok=True)
    
    # Sort and Group Cities for JSON
    import json
    cities_for_js = {}
    for country, cities in CITIES_CONFIG.items():
        cities_for_js[country] = []
        sorted_cities = sorted(cities, key=lambda x: x[0] if isinstance(x, tuple) else x)
        for item in sorted_cities:
            if isinstance(item, tuple):
                name, cc = item
            else:
                name = item
                cc = COUNTRY_CODES.get(country, "Global")
            cities_for_js[country].append({"id": f"{name},{cc}", "name": name})

    # Generate Country Options
    country_options_html = ""
    # Map country names to translation keys
    country_map = {
        "Turkey": "country_tr", "Indonesia": "country_id", "Saudi Arabia": "country_sa",
        "Egypt": "country_eg", "Qatar": "country_qa", "Kuwait": "country_kw",
        "Gulf": "country_gulf", "Europe & Others": "country_eu", "North Africa": "country_na"
    }
    for country_en in sorted(CITIES_CONFIG.keys()):
        key = country_map.get(country_en)
        label = trans.get(key, country_en) if key else country_en
        country_options_html += f'                        <option value="{country_en}">{label}</option>\n'

    ramadan_navbar = NAVBAR_TEMPLATE.format(
        root_path="../../../",
        lang=lang,
        page_path="ramadan/index.html",
        blog_suffix=trans['blog_suffix'],
        curr_lang_upper=lang.upper(),
        app_home=trans['app_home'],
        ramadan_2026=trans['ramadan_2026']
    )
    
    ramadan_html = RAMADAN_HUB_TEMPLATE.format(
        lang=lang,
        dir=trans["dir"],
        blog_suffix=trans['blog_suffix'],
        navbar_html=ramadan_navbar,
        cities_json=json.dumps(cities_for_js, ensure_ascii=False),
        country_options_html=country_options_html,
        ramadan_2026=trans['ramadan_2026'],
        ramadan_hero_subtitle=trans['ramadan_hero_subtitle'],
        select_country=trans['select_country'],
        select_city=trans['select_city'],
        first_day_approx=trans['first_day_approx'],
        ramadan_essentials=trans['ramadan_essentials'],
        spiritual_prep_title=trans['spiritual_prep_title'],
        spiritual_prep_desc=trans['spiritual_prep_desc'],
        zakat_guide_title=trans['zakat_guide_title'],
        zakat_guide_desc=trans['zakat_guide_desc'],
        times_calc_info=trans['times_calc_info'],
        label_sahur=trans['label_sahur'],
        label_iftar=trans['label_iftar'],
        label_dhuhr=trans['label_dhuhr'],
        label_asr=trans['label_asr'],
        label_isha=trans['label_isha'],
        copyright=trans['copyright']
    )
    with open(f"{ramadan_path}/index.html", "w", encoding="utf-8") as f:
        f.write(ramadan_html)

print("Blog & Ramadan Hub Generation complete.")
