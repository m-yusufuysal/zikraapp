import os
import json
import datetime

# Import data from shared module
from content_data import (
    LANGUAGES, TRANSLATIONS, topics, format_title, TOPIC_TRANSLATIONS,
    worship_data, dhikr_data, lifestyle_data, dream_interpretations, fallbacks,
    CITIES_CONFIG, COUNTRY_CODES, UI_TRANSLATIONS
)

def get_image_url(slug, cat_key):
    # Specific dream images
    if "dream-snake" in slug: return "https://images.unsplash.com/photo-1555677284-6a6f971639e0?w=800&q=80" # Green Snake (Clearer)
    if "dream-water" in slug or "dream-sea" in slug: return "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80" # Ocean/Water
    if "dream-gold" in slug or "dream-money" in slug: return "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&q=80" # Money/Gold
    if "dream-cat" in slug: return "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80" # Cat
    if "dream-baby" in slug: return "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80" # Baby
    if "dream-house" in slug: return "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80" # House
    if "dream-fire" in slug: return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" # Fire (Cozy)
    if "dream-shoes" in slug: return "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80" # Shoes
    if "dream-crying" in slug: return "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=800&q=80" # Sad/Moody
    if "dream-car" in slug: return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80" # Car
    if "dream-fish" in slug: return "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80" # Fish
    if "dream-teeth" in slug: return "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80" # Teeth/Dentist (Clearer)
    if "dream-marriage" in slug: return "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80" # Wedding Rings
    if "dream-sun" in slug: return "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80" # Sun/Nature
    if "dream-falling" in slug: return "https://images.unsplash.com/photo-1531149463994-39f28df611a5?w=800&q=80" # Falling/Heights/Perspective
    if "dream-death" in slug: return "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800&q=80" # Sunset/Path
    if "dream-rain" in slug: return "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&q=80" # Rain
    if "dream-flying" in slug: return "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80" # Bird flying
    if "dream-prayer" in slug or "salah" in slug or "prayer" in slug or "worship" in cat_key:
        return "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80" # Mosque/Prayer
    if "dream-prophet" in slug: return "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80" # Madinah Green Dome (Standard)

    # Generic category mappings
    if "dream" in slug:
        return "https://images.unsplash.com/photo-1511289133649-14a57f6b9077?w=800&q=80" # Moon/Night
    if "quran" in slug:
        return "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80" # Quran
    if "money" in slug or "zakat" in slug or "finance" in slug:
        return "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80" # Finance
    if "tech" in cat_key or "ai" in slug:
        return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80" # Tech
    return "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80"

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
                    <span>{curr_lang_name}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                <div class="lang-menu" id="langMenu" style="display: none; position: absolute; right: 0; top: 120%; background: rgba(30, 62, 52, 0.98); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 0.5rem; min-width: 180px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); z-index: 1000; backdrop-filter: blur(12px);">
                    {lang_options_html}
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

# Duplicate cities config removed (imported from content_data)

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
        .times-container {{ max-width: 1000px; margin: 3rem auto; padding: 0 5%; }}
        .city-card {{ background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 2.5rem; backdrop-filter: blur(12px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }}
        .city-selector {{ margin-bottom: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }}
        .city-selector select {{ background: rgba(30, 62, 52, 0.9); border: 1px solid rgba(163, 217, 201, 0.3); color: white; padding: 1rem; border-radius: 12px; font-size: 1.1rem; outline: none; transition: 0.3s; cursor: pointer; }}
        .city-selector select:focus {{ border-color: #A3D9C9; }}
        
        .calendar-container {{ overflow-x: auto; margin-top: 2rem; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); }}
        .ramadan-calendar {{ width: 100%; border-collapse: collapse; min-width: 600px; }}
        .ramadan-calendar th, .ramadan-calendar td {{ padding: 1rem; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }}
        .ramadan-calendar th {{ background: rgba(30, 62, 52, 0.8); color: #A3D9C9; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; position: sticky; top: 0; }}
        .ramadan-calendar tr:hover {{ background: rgba(255, 255, 255, 0.05); }}
        .ramadan-calendar td {{ font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums; }}
        .time-val {{ font-family: 'Amiri', serif; font-weight: 700; font-size: 1.2rem; }}
        .current-day {{ background: rgba(163, 217, 201, 0.15) !important; border-left: 4px solid #A3D9C9; }}
        
        .countdown-banner {{ background: linear-gradient(135deg, #1e3e34, #2d5a4c); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; text-align: center; border: 1px solid rgba(163, 217, 201, 0.3); }}
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
                <span style="font-size: 0.9rem; opacity: 0.8;">{first_day_approx}</span>
            </div>
 
            <div id="loading" style="display:none; text-align:center; padding: 2rem; color: #A3D9C9;">
                <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i>
            </div>
 
            <div class="calendar-container">
                <table class="ramadan-calendar">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>{label_sahur}</th>
                            <th>{label_dhuhr}</th>
                            <th>{label_asr}</th>
                            <th>{label_iftar}</th>
                            <th>{label_isha}</th>
                        </tr>
                    </thead>
                    <tbody id="calendarBody">
                        <!-- Rows generated by JS -->
                    </tbody>
                </table>
            </div>
            
            <p style="margin-top: 2rem; font-size: 0.8rem; text-align: center; opacity: 0.6;">
                <i class="fa-solid fa-circle-info"></i> {times_calc_info} <span id="methodName"></span>
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
        
        // Method IDs for Aladhan API based on Country Code
        const METHOD_MAP = {{
            "TR": 13, // Turkey: Diyanet
            "SA": 4,  // Saudi Arabia: Umm al-Qura
            "EG": 5,  // Egypt: Egyptian General Authority of Survey
            "ID": 20, // Indonesia: Sihat/Kemenag
            "QA": 10, // Qatar
            "KW": 9,  // Kuwait
            "AE": 16, // UAE: Dubai
            "FR": 12, // France: UOIF
            "US": 2,  // USA: ISNA
            "CA": 2,  // Canada: ISNA
            "MA": 21, // Morocco: Moroccan Ministry of Habous
            "DZ": 19, // Algeria: Algerian Minister of Religious Affairs
            "TN": 22, // Tunisia: Ministry of Religious Affairs
            "GB": 3,  // UK: Muslim World League (or 2 ISNA)
            "DE": 13, // Germany: Diyanet (popular) or 3
            "BE": 12, // Belgium: UOIF (or 3)
            "DEFAULT": 3 // Muslim World League
        }};

        function populateCities() {{
            const country = document.getElementById('countrySelect').value;
            const citySelect = document.getElementById('citySelect');
            citySelect.innerHTML = '<option value="">{select_city}</option>';
            
            if (CITIES_DATA[country]) {{
                CITIES_DATA[country].forEach(city => {{
                    const opt = document.createElement('option');
                    opt.value = city.id; // Format: "CityName,CountryCode"
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
            
            // Extract Country Code from cityId "Name,Code"
            const countryCode = cityId.split(',')[1] || "DEFAULT";
            
            const country = document.getElementById('countrySelect').value;
            const cityData = CITIES_DATA[country].find(c => c.id === cityId);
            if (!cityData) return;

            const loading = document.getElementById('loading');
            const tbody = document.getElementById('calendarBody');
            
            loading.style.display = 'block';
            tbody.innerHTML = ''; // Clear table
            
            const method = METHOD_MAP[countryCode] || METHOD_MAP["DEFAULT"];
            document.getElementById('methodName').textContent = `(Method ID: ${{method}})`;

            try {{
                // Fetch Feb and March 2026
                const [feb, mar] = await Promise.all([
                    fetch(`https://api.aladhan.com/v1/calendarByCity?city=${{cityData.name}}&country=${{countryCode}}&method=${{method}}&month=02&year=2026`).then(r => r.json()),
                    fetch(`https://api.aladhan.com/v1/calendarByCity?city=${{cityData.name}}&country=${{countryCode}}&method=${{method}}&month=03&year=2026`).then(r => r.json())
                ]);

                const allDays = [...(feb.data || []), ...(mar.data || [])];
                
                // Approximate Ramadan 2026 Start: Feb 18
                // We will display 30 days starting from Feb 18
                const ramadanStart = "18-02-2026"; 
                let startIndex = allDays.findIndex(d => d.date.gregorian.date === ramadanStart);
                if (startIndex === -1) startIndex = 17; // Fallback index

                // Show 30 days
                let ramadanDays = allDays.slice(startIndex, startIndex + 30);
                
                if (ramadanDays.length === 0) {{
                     ramadanDays = allDays.filter(d => {{
                        const [day, month, year] = d.date.gregorian.date.split('-').map(Number);
                        if (year !== 2026) return false;
                        if (month === 2 && day >= 18) return true;
                        if (month === 3 && day <= 19) return true;
                        return false;
                     }});
                }}

                ramadanDays.forEach((day, index) => {{
                    const row = document.createElement('tr');
                    const timings = day.timings;
                    
                    // Highlight current day
                    const today = new Date();
                    const isToday = day.date.gregorian.day == today.getDate() && day.date.gregorian.month.number == (today.getMonth() + 1) && day.date.gregorian.year == today.getFullYear();
                    if (isToday) row.classList.add('current-day');

                    // Clean time format (remove (EEST) etc)
                    const cleanTime = (t) => t.split(' ')[0];

                    row.innerHTML = `
                        <td>${{index + 1}}</td>
                        <td style="font-size:0.9rem;">${{day.date.gregorian.day}} ${{day.date.gregorian.month.en}}</td>
                        <td class="time-val">${{cleanTime(timings.Fajr)}}</td>
                        <td class="time-val">${{cleanTime(timings.Dhuhr)}}</td>
                        <td class="time-val">${{cleanTime(timings.Asr)}}</td>
                        <td class="time-val" style="color: #D4AF37;">${{cleanTime(timings.Maghrib)}}</td>
                        <td class="time-val">${{cleanTime(timings.Isha)}}</td>
                    `;
                    tbody.appendChild(row);
                }});

            }} catch (error) {{
                console.error('Error fetching prayer times:', error);
                tbody.innerHTML = '<tr><td colspan="7" style="color:salmon;">Error loading data. Please try again later.</td></tr>';
            }} finally {{
                loading.style.display = 'none';
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





def get_content(slug, cat_key, lang):
    is_dream = "dream" in slug
    title = TOPIC_TRANSLATIONS.get(slug, {}).get(lang, format_title(slug))
    ui = UI_TRANSLATIONS.get(lang, UI_TRANSLATIONS["en"])
    
    # 1. Resolve Data Source
    data_source = {}
    if slug in worship_data: data_source = worship_data[slug]
    elif slug in dhikr_data: data_source = dhikr_data[slug]
    elif slug in lifestyle_data: data_source = lifestyle_data[slug]
    
    # 2. Start with Fallback
    fallback_base = fallbacks.get(lang, fallbacks["en"])
    content = fallback_base.copy()
    
    for k, v in content.items():
        if isinstance(v, str):
            content[k] = v.replace("{title}", title)
            
    content["title"] = title
    content["category"] = TRANSLATIONS[lang].get(cat_key, "Islamvy")
    
    # 3. Merge Specific Data
    if lang in data_source:
        content.update(data_source[lang])
    elif "en" in data_source:
        en_data = data_source["en"].copy()
        if "title" in content: en_data["title"] = content["title"]
        content.update(en_data)

    # 4. Dream Logic (Special Case)
    if is_dream:
        interpretation = dream_interpretations.get(slug, {}).get(lang)
        if interpretation:
            content["body"] = f"<h3>{ui['interpretation_label']}</h3><p>{interpretation}</p>"
            content["tldr"] = interpretation
            content["summary"] = interpretation[:150] + "..." if len(interpretation) > 150 else interpretation
        else:
            content["body"] = f"<p>Interpretation for '{title}' is coming soon.</p>"
            
    # 5. Dynamic Dates and Reading Time
    content["date"] = datetime.datetime.now().strftime("%B %d, %Y")
    word_count = len(content.get("body", "").split())
    content["read_time"] = max(1, round(word_count / 200))
    
    # 6. Image
    content["image_url"] = get_image_url(slug, cat_key)
    
    return content

# --- MAIN GENERATION LOOP ---

for lang in LANGUAGES:
    print(f"Generating {lang} Blog...")
    posts_path = f"blog/{lang}/posts"
    os.makedirs(posts_path, exist_ok=True)
    grid_html = ""
    trans = TRANSLATIONS[lang]
    ui = UI_TRANSLATIONS.get(lang, UI_TRANSLATIONS["en"])
    
    # Generate common language options for the navbar
    def get_lang_options(page_depth_path):
        opts = ""
        for l in LANGUAGES:
            l_ui = UI_TRANSLATIONS.get(l, UI_TRANSLATIONS["en"])
            opts += f'<a href="{{root_path}}blog/{l}/{page_depth_path}" class="lang-option">{l_ui["language_name"]}</a>\n'
        return opts

    for slug, cat_key in topics:
        content = get_content(slug, cat_key, lang)
        img_url = content["image_url"]
        
        # Localize category name for breadcrumbs
        cat_name = trans.get(cat_key, "Blog")
        
        breadcrumb = json.dumps({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Blog","item":f"https://islamvy.com/blog/{lang}/index.html"},{"@type":"ListItem","position":2,"name":cat_name,"item":f"https://islamvy.com/blog/{lang}/index.html"},{"@type":"ListItem","position":3,"name":content['title'],"item":f"https://islamvy.com/blog/{lang}/posts/{slug}.html"}]})
        
        # Ensure {title} is replaced in FAQs
        faq_data = []
        for faq in content.get('faqs', []):
            faq_data.append({
                "q": faq['q'].replace("{title}", content['title']),
                "a": faq['a'].replace("{title}", content['title'])
            })
        
        faq_schema = json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":f['q'],"acceptedAnswer":{"@type":"Answer","text":f['a']}} for f in faq_data]})
        
        # Smart Navbar with dynamic language switcher
        navbar = NAVBAR_TEMPLATE.format(
            root_path="../../../",
            lang=lang,
            page_path=f"posts/{slug}.html",
            blog_suffix=trans['blog_suffix'],
            curr_lang_name=ui["language_name"],
            lang_options_html=get_lang_options(f"posts/{slug}.html").format(root_path="../../../"),
            app_home=trans['app_home'],
            ramadan_2026=trans['ramadan_2026']
        )
        
        faq_html = "".join([f'<div style="margin-bottom:1.5rem;"><h3 style="color:#A3D9C9;">{f["q"]}</h3><p>{f["a"]}</p></div>' for f in faq_data])
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
            date=content["date"],
            read_time=content["read_time"],
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
        curr_lang_name=ui["language_name"],
        lang_options_html=get_lang_options("index.html").format(root_path="../../"),
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
    with open(f"blog/{lang}/index.html", "w", encoding="utf-8") as f:
        f.write(idx_html)

    # Ramadan Hub
    print(f"Generating {lang} Ramadan Hub...")
    ramadan_path = f"blog/{lang}/ramadan"
    os.makedirs(ramadan_path, exist_ok=True)
    
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

    country_options_html = ""
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
        curr_lang_name=ui["language_name"],
        lang_options_html=get_lang_options("ramadan/index.html").format(root_path="../../../"),
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
        first_day_approx=f"{trans['first_day_approx']} {ui['ramadan_start']}",
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
        copyright=trans['copyright'],
        search_city_placeholder=ui["search_city"]
    )
    with open(f"{ramadan_path}/index.html", "w", encoding="utf-8") as f:
        f.write(ramadan_html)

print("Blog & Ramadan Hub Generation complete.")
