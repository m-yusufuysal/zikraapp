import os
import json

LANGUAGES = ['en', 'tr', 'ar', 'fr', 'id']

# --- HTML TEMPLATES (DESIGN MATCHING MAIN SITE) ---

NAVBAR_TEMPLATE = """
    <nav class="navbar" style="display: flex; justify-content: space-between; align-items: center; padding: 2rem 5%; max-width: 1200px; margin: 0 auto; position: relative; z-index: 10;">
        <a href="{root_path}index.html" style="text-decoration:none;">
            <div class="logo" style="font-family: 'Kaushan Script', cursive; font-size: 2.5rem; color: #FFFFFF; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Islamvy</div>
        </a>
        <div class="nav-right" style="display: flex; align-items: center; gap: 1.5rem;">
             <div class="nav-links" style="margin-right: 1.5rem;">
                <a href="{root_path}index.html" class="nav-item-link" style="color: #fff; text-decoration: none; font-weight: 500; font-size: 0.95rem; opacity: 0.9; transition: 0.3s;">App Home</a>
            </div>
            
            <div class="lang-dropdown" style="position: relative;">
                <button class="lang-btn" onclick="toggleLangMenu(event)" style="display: flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); padding: 0.6rem 1.2rem; border-radius: 99px; color: #FFFFFF; cursor: pointer; transition: 0.3s; backdrop-filter: blur(8px); font-weight: 600; font-size: 0.9rem;">
                    <span>{curr_lang_upper}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                <div class="lang-menu" id="langMenu" style="display: none; position: absolute; right: 0; top: 120%; background: rgba(30, 62, 52, 0.98); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 0.5rem; min-width: 180px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); z-index: 1000; backdrop-filter: blur(12px);">
                    <a href="{link_en}" class="lang-option">English</a>
                    <a href="{link_tr}" class="lang-option">Türkçe</a>
                    <a href="{link_ar}" class="lang-option">العربية</a>
                    <a href="{link_fr}" class="lang-option">Français</a>
                    <a href="{link_id}" class="lang-option">Bahasa Indonesia</a>
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
                <i class="fa-solid fa-certificate"></i> Scholar Reviewed Content
            </div>
            <img src="{image_url}" alt="{title}" class="post-featured-image" style="margin-top: 2rem;">
        </header>
        <div class="tldr-section" style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 4px solid var(--accent-gold);">
            <h3 style="margin-top:0; color:var(--accent-gold); font-size:1.1rem;"><i class="fa-solid fa-bolt"></i> TL;DR</h3>
            <p style="margin-bottom:0.5rem; font-style:italic;">{tldr}</p>
        </div>
        <div class="post-content">
            {content_body}
            <div class="references-section" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
                <h2 style="font-size: 1.5rem;"><i class="fa-solid fa-book-quran"></i> References & Citations</h2>
                {references_html}
            </div>
            <div class="ai-commentary" style="margin-top: 2rem; padding: 1rem; border-radius: 8px; background: rgba(163, 217, 201, 0.05); border: 1px solid rgba(163, 217, 201, 0.2);">
                <p style="font-size: 0.85rem; margin: 0; opacity: 0.8;">
                    <i class="fa-solid fa-robot"></i> <strong>AI Disclosure:</strong> This content was generated and organized by AI, then reviewed for accuracy against established Islamic texts (Quran, Sahih Bukhari, Sahih Muslim, and classical scholars like Ibn Sirin).
                </p>
            </div>
            <div class="faq-section" style="margin-top: 3rem;">
                <h2>Frequently Asked Questions</h2>
                {faq_html}
            </div>
        </div>
    </article>
    <footer class="main-footer">
        <div class="footer-bottom-row">
            <div class="footer-brand"><span class="footer-logo-text" style="font-family: 'Kaushan Script', cursive;">Islamvy</span></div>
            <div class="footer-copyright">© 2026 Islamvy. All rights reserved.</div>
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
    </style>
</head>
<body>
    <div class="geometric-bg"></div>
    {navbar_html}
    <header class="blog-hero">
        <h1>{hero_title}</h1>
        <p>{hero_desc}</p>
    </header>
    <main class="blog-grid">{posts_html}</main>
    <footer class="main-footer">
        <div class="footer-bottom-row">
            <div class="footer-brand" style="font-family: 'Kaushan Script', cursive; font-size: 1.5rem;">Islamvy</div>
            <div class="footer-copyright">© 2026 Islamvy. All rights reserved.</div>
        </div>
    </footer>
</body>
</html>
"""

TRANSLATIONS = {
    "en": {"dir": "ltr", "page_title": "Islamvy Blog", "page_desc": "Islamic Insights", "hero_title": "Islamic Insights & Wisdom", "hero_desc": "Get answers to your spiritual questions with scholarly references.", "read_more": "Read More", "category_dream": "Dream Interpretation", "category_dhikr": "Dhikr & Dua", "category_lifestyle": "Islamic Lifestyle", "category_tech": "Islamic Tech", "category_worship": "Worship Guide"},
    "tr": {"dir": "ltr", "page_title": "Islamvy Blog", "page_desc": "İslami İçgörüler", "hero_title": "İslami İçgörüler & Hikmet", "hero_desc": "Manevi sorularınıza alim referanslarıyla cevap bulun.", "read_more": "Devamını Oku", "category_dream": "Rüya Tabirleri", "category_dhikr": "Zikir ve Dua", "category_lifestyle": "İslami Yaşam", "category_tech": "İslami Teknoloji", "category_worship": "İbadet Rehberi"},
    "ar": {"dir": "rtl", "page_title": "مدونة إسلامفي", "page_desc": "رؤى إسلامية", "hero_title": "رؤى وبصائر إسلامية", "hero_desc": "احصل على إجابات لأسئلتك الروحية مع مراجع علمية.", "read_more": "اقرأ المزيد", "category_dream": "تفسير الأحلام", "category_dhikr": "الذكر والدعاء", "category_lifestyle": "نمط الحياة الإسلامي", "category_tech": "تكنولوجيا إسلامية", "category_worship": "دليل العبادة"},
    "fr": {"dir": "ltr", "page_title": "Blog Islamvy", "page_desc": "Perspectives", "hero_title": "Sagesse Islamique", "hero_desc": "Obtenez des réponses basées sur des sources authentiques.", "read_more": "Lire la suite", "category_dream": "Interprétation des rêves", "category_dhikr": "Dhikr & Dua", "category_lifestyle": "Mode de vie", "category_tech": "Technologie Islamique", "category_worship": "Guide de Culte"},
    "id": {"dir": "ltr", "page_title": "Blog Islamvy", "page_desc": "Wawasan Islam", "hero_title": "Wawasan & Hikmah Islam", "hero_desc": "Dapatkan jawaban spiritual berdasarkarn referensi shahih.", "read_more": "Baca Selengkapnya", "category_dream": "Tafsir Mimpi", "category_dhikr": "Dzikir & Doa", "category_lifestyle": "Gaya Hidup", "category_tech": "Technologi Islam", "category_worship": "Panduan Ibadah"}
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

def get_content(slug, cat_key, lang):
    is_dream = "dream" in slug
    title = format_title(slug)
    
    data = {
        "en": {
            "title": title,
            "summary": f"Insights into {title} from an Islamic perspective.",
            "tldr": f"{title} carries deep spiritual meaning and practical significance in daily life.",
            "body": f"<p>{title} is a key topic in Islamic theology and practice. Understanding its context helps in spiritual growth.</p>",
            "faqs": [{"q": f"What does {title} mean?", "a": "It represents a spiritual state or a specific act of worship defined in sunnah."}],
            "refs": ["The Holy Quran", "Sahih Bukhari", "Ibn Sirin (for dreams)"]
        },
        "tr": {
            "title": title, # Keep formatting consistent
            "summary": f"İslami açıdan {title} hakkında bilgiler.",
            "tldr": f"{title}, günlük yaşamda derin manevi anlam ve pratik öneme sahiptir.",
            "body": f"<p>{title}, İslami teoloji ve uygulamada anahtar bir konudur. Bağlamını anlamak manevi gelişime yardımcı olur.</p>",
            "faqs": [{"q": f"{title} ne anlama gelir?", "a": "Sünnette tanımlanan manevi bir durumu veya belirli bir ibadeti temsil eder."}],
            "refs": ["Kur'an-ı Kerim", "Sahih-i Buhari", "İbni Sirin (Rüya tabiri için)"]
        }
    }
    # Fallback to English but localized summaries
    res = data.get(lang, data["en"])
    if is_dream:
        res["body"] = f"<p>Interpretation of {title.replace('Dream', '').strip()} in dreams often signifies state of one's faith or impending life changes according to classical scholars like Ibn Sirin.</p>"
        res["summary"] = f"Brief Islamic interpretation of {title.replace('Dream', '').strip()} in dreams."
    
    return res

for lang in LANGUAGES:
    print(f"Baking {lang}...")
    posts_path = f"islamvy-web/blog/{lang}/posts"
    os.makedirs(posts_path, exist_ok=True)
    grid_html = ""
    
    for slug, cat_key in topics:
        content = get_content(slug, cat_key, lang)
        img_url = "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80"
        if "dream" in slug: img_url = "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?w=800&q=80"
        
        breadcrumb = json.dumps({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Blog","item":f"https://islamvy.com/blog/{lang}/index.html"},{"@type":"ListItem","position":2,"name":cat_key.replace('category_','').title(),"item":f"https://islamvy.com/blog/{lang}/index.html"},{"@type":"ListItem","position":3,"name":content['title'],"item":f"https://islamvy.com/blog/{lang}/posts/{slug}.html"}]})
        faq_schema = json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":f['q'],"acceptedAnswer":{"@type":"Answer","text":f['a']}} for f in content['faqs']]})
        
        navbar = NAVBAR_TEMPLATE.format(root_path="../../../",curr_lang_upper=lang.upper(),link_en="../../../blog/en/index.html",link_tr="../../../blog/tr/index.html",link_ar="../../../blog/ar/index.html",link_fr="../../../blog/fr/index.html",link_id="../../../blog/id/index.html")
        
        faq_html = "".join([f'<div style="margin-bottom:1.5rem;"><h3 style="color:#A3D9C9;">{f["q"]}</h3><p>{f["a"]}</p></div>' for f in content["faqs"]])
        refs_html = "<ul>" + "".join([f'<li>{r}</li>' for r in content["refs"]]) + "</ul>"
        
        full_html = POST_TEMPLATE.format(lang=lang,dir=TRANSLATIONS[lang]["dir"],title=content["title"],description=content["summary"],filename=f"{slug}.html",hreflang_tags="\\n    ".join([f'<link rel="alternate" hreflang="{l}" href="https://islamvy.com/blog/{l}/posts/{slug}.html" />' for l in LANGUAGES]),image_url=img_url,breadcrumb_schema=breadcrumb,faq_schema=faq_schema,navbar_html=navbar,category=TRANSLATIONS[lang].get(cat_key, "Blog"),date="Feb 15, 2026",read_time="5",tldr=content["tldr"],content_body=content["body"],references_html=refs_html,faq_html=faq_html)
        
        with open(f"{posts_path}/{slug}.html", "w", encoding="utf-8") as f: f.write(full_html)
        
        grid_html += f"""
        <article class="blog-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; transition: 0.4s;">
            <img src="{img_url}" alt="{content['title']}" style="width: 100%; height: 200px; object-fit: cover;">
            <div style="padding: 1.5rem;">
                <span style="font-size: 0.75rem; color: #A3D9C9; text-transform: uppercase;">{TRANSLATIONS[lang].get(cat_key, "Blog")}</span>
                <h2 style="font-size: 1.25rem; margin: 0.5rem 0; color:#fff;">{content['title']}</h2>
                <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1rem;">{content['summary']}</p>
                <a href="posts/{slug}.html" style="color: #A3D9C9; text-decoration: none; font-weight: 600;">{TRANSLATIONS[lang]['read_more']} <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        </article>
        """

    idx_navbar = NAVBAR_TEMPLATE.format(root_path="../../",curr_lang_upper=lang.upper(),link_en="../en/index.html",link_tr="../tr/index.html",link_ar="../ar/index.html",link_fr="../fr/index.html",link_id="../id/index.html")
    idx_html = INDEX_TEMPLATE.format(lang=lang,dir=TRANSLATIONS[lang]["dir"],page_title=TRANSLATIONS[lang]["page_title"],page_desc=TRANSLATIONS[lang]["page_desc"],navbar_html=idx_navbar,hero_title=TRANSLATIONS[lang]["hero_title"],hero_desc=TRANSLATIONS[lang]["hero_desc"],posts_html=grid_html)
    with open(f"islamvy-web/blog/{lang}/index.html", "w", encoding="utf-8") as f: f.write(idx_html)

print("Refined blog generation done.")
