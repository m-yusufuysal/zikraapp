import os

# Template content (simplified for script use)
TEMPLATE = """<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Islamvy Blog</title>
    <meta name="description" content="{description}">
    <meta name="keywords" content="{keywords}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{image_url}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="{title}">
    <meta property="twitter:description" content="{description}">
    <meta property="twitter:image" content="{image_url}">
    
    <link rel="stylesheet" href="../../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Kaushan+Script&display=swap" rel="stylesheet">
    <link rel="icon" href="../../assets/logo.png">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <div class="geometric-bg"></div>

    <nav class="navbar">
        <a href="../../index.html" style="text-decoration: none;">
            <div class="logo">Islamvy Blog</div>
        </a>
        <div class="nav-right">
            <a href="../../index.html" class="nav-item-link" style="color: #fff; text-decoration: none; font-weight: 500; margin-right: 1rem;">Home</a>
            <a href="../index.html" class="nav-item-link" style="color: #fff; text-decoration: none; font-weight: 500; margin-right: 1rem;">Blog</a>
            <div class="nav-store-icons">
                 <a href="https://apps.apple.com/app/islamvy" target="_blank" class="nav-store-link">
                    <svg viewBox="0 0 384 512" fill="currentColor" width="22" height="22"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-54.8-124.3-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/></svg>
                </a>
            </div>
        </div>
    </nav>

    <article class="post-container">
        <div class="breadcrumbs" data-aos="fade-down">
            <a href="../../index.html">Home</a> <span>/</span> <a href="../index.html">Blog</a> <span>/</span> {category}
        </div>

        <header class="post-header" data-aos="fade-up">
            <div class="post-meta">
                <span class="blog-category">{category}</span>
                <span>•</span>
                <span>{read_time} min read</span>
                <span>•</span>
                <span>{date}</span>
            </div>
            <h1 class="post-title">{title}</h1>
            <img src="{image_url}" alt="{title}" class="post-featured-image">
        </header>

        <div class="post-content" data-aos="fade-up" data-aos-delay="100">
            {content_body}
            
            <div class="share-buttons">
                <a href="#" class="share-btn"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="#" class="share-btn"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="#" class="share-btn"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
        </div>
    </article>

    <footer class="main-footer">
        <div class="footer-bottom-row">
            <div class="footer-brand"><span class="footer-logo-text">Islamvy Blog</span></div>
            <div class="footer-links">
                <a href="../../index.html">Home</a>
                <a href="../index.html">Blog</a>
            </div>
            <div class="footer-copyright">© 2026 Islamvy App. All rights reserved.</div>
        </div>
    </footer>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>AOS.init({{once: true, offset: 50, duration: 800}});</script>
</body>
</html>
"""

posts = [
    # DREAM INTERPRETATION
    {
        "filename": "dream-interpretation-teeth-falling.html",
        "title": "Teeth Falling Out in a Dream: Islamic Explanation",
        "category": "Dream Interpretation",
        "keywords": "teeth falling out dream islam, ibn sirin teeth dream, lose teeth dream meaning islam",
        "description": "Dreaming of teeth falling out can be alarming. In Islam, it often relates to longevity, family, or debts. Find out the specific meanings.",
        "image_url": "https://images.unsplash.com/photo-1626260113645-802521c7fa15?auto=format&fit=crop&q=80&w=1200",
        "read_time": "4",
        "date": "Feb 16, 2026",
        "content_body": """
            <p>One of the most frequently asked questions in dream interpretation is about teeth falling out. While Western psychology might link this to anxiety about appearance, Islamic interpretation (Ta'bir) offers a deep, family-centric view.</p>
            <h2>General Meaning</h2>
            <p>According to scholars like Al-Nabulsi and Ibn Sirin, teeth in a dream represent the dreamer's family members. The upper teeth usually symbolize male relatives on the father's side, while lower teeth represent female relatives on the mother's side.</p>
            <h3>Positive Interpretations</h3>
            <ul>
                <li><strong>Longevity:</strong> If you see your teeth falling out but gathering them in your lap or hand, it can signify a long life—living long enough to see your family grow.</li>
                <li><strong>Paying Debts:</strong> If a debtor sees his teeth falling out without pain, it may indicate the repayment of debts.</li>
            </ul>
            <h3>Warnings</h3>
            <p>If teeth fall out with pain or disappear (you can't find them), it might indicate the loss of a relative or a severance of family ties. It is a reminder to uphold kinship (Silat ar-Rahim).</p>
        """
    },
    {
        "filename": "dream-interpretation-snakes.html",
        "title": "Snakes in Dreams: An Islamic Perspective",
        "category": "Dream Interpretation",
        "keywords": "snake dream islam, serpent dream meaning muslim, killing snake dream islam",
        "description": "Snakes often represent enemies or hidden fears in Islamic dream interpretation. Learn how to interpret the context of your dream.",
        "image_url": "https://images.unsplash.com/photo-1596752009249-14a938c35390?auto=format&fit=crop&q=80&w=1200",
        "read_time": "5",
        "date": "Feb 14, 2026",
        "content_body": """
            <p>Snakes are complex symbols in dreams. In general, a snake represents an enemy. Exploring the details of the snake's behavior reveals the nature of this enmity.</p>
            <h2>Size and Venom</h2>
            <p>A large, venomous snake indicates a powerful enemy, whereas a small, non-venomous snake might represent a weaker foe or merely temptation.</p>
            <h3>Killing the Snake</h3>
            <p>If you dream that you fight and kill the snake, it is a very positive sign indicating victory over an enemy or overcoming a personal vice (nafs).</p>
            <h3>Snake in the House</h3>
            <p>Seeing a snake inside your house often points to enmity from within one's close circle or family, whereas a snake outside represents a stranger.</p>
        """
    },
    {
        "filename": "dream-interpretation-flying.html",
        "title": "What Does Dreaming of Flying Mean in Islam?",
        "category": "Dream Interpretation",
        "keywords": "flying dream islam, spiritual elevation dream, flying without wings dream meaning",
        "description": "Flying in a dream signifies travel, status, or spiritual elevation. Discover the nuances of this liberating dream symbol.",
        "image_url": "https://images.unsplash.com/photo-1549557404-5f5697205244?auto=format&fit=crop&q=80&w=1200",
        "read_time": "3",
        "date": "Feb 13, 2026",
        "content_body": """
            <p>Flying is often associated with freedom and high status. In Islamic interpretation, it can have several meanings depending on how you are flying.</p>
            <h2>Travel and Movement</h2>
            <p>Flying from one roof to another or from one land to another usually signifies travel or a change in one's situation, often for the better.</p>
            <h2>Spiritual Elevation</h2>
            <p>Flying into the sky can represent a rise in religious or worldly status. However, if one flies and disappears into the heavens without returning, it can sometimes be interpreted as the end of one's term, so one should increase in good deeds.</p>
            <h3>Flying with Wings vs. Without</h3>
            <p>Flying with wings confirms the means to achieve one's goals (like wealth or knowledge), while flying without wings is considered a miraculous change in state.</p>
        """
    },
     {
        "filename": "dream-interpretation-water.html",
        "title": "Water and Drowning in Dreams",
        "category": "Dream Interpretation",
        "keywords": "water dream islam, drowning dream meaning, pure water dream",
        "description": "Water is the source of life, but drowning can be a warning. Understand the duality of water in Islamic dream interpretation.",
        "image_url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=1200",
        "read_time": "4",
        "date": "Feb 12, 2026",
        "content_body": """
            <p>Water symbolizes knowledge, Islam, life, and fertility. However, its state (clear vs. murky) changes the meaning entirely.</p>
            <h2>Clear vs. Murky Water</h2>
            <p>Drinking fresh, clear water signifies a good life and vast knowledge. Murky or stagnant water, however, can suggest illness or earning haram wealth.</p>
            <h2>Meaning of Drowning</h2>
            <p>Drowning in the sea can mean being consumed by worldly life and forgetting the Hereafter. However, if one drowns but survives or floats, it can mean indulging in knowledge but eventually engaging in repentance.</p>
        """
    },
    {
        "filename": "dream-interpretation-marriage.html",
        "title": "Dreaming of Marriage: Good News?",
        "category": "Dream Interpretation",
        "keywords": "marriage dream islam, wedding dream meaning, marrying a stranger dream",
        "description": "Does dreaming of marriage mean you will get married soon? It often symbolizes honor, a new job, or responsibility.",
        "image_url": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1200",
        "read_time": "3",
        "date": "Feb 11, 2026",
        "content_body": """
            <p>Marriage in a dream is generally a symbol of providence (inaya) from Allah. It represents honor, dignity, and wealth.</p>
            <h2>Marrying a Known vs. Unknown Person</h2>
            <p>Marrying a known person often signifies deriving benefit from them. Marrying an unknown person can symbolize the imminent end of life or moving to a new house, representing the 'final home'.</p>
            <h3>Responsibility</h3>
            <p>Marriage is also a covenant. Dreaming of it can mean taking on a new responsibility, such as a job promotion or leadership role.</p>
        """
    },

    # DHIKR AND DUA
    {
        "filename": "dhikr-morning-evening.html",
        "title": "Benefits of Morning and Evening Adhkar",
        "category": "Dhikr & Dua",
        "keywords": "morning adhkar benefits, evening adhkar, protection dua islam",
        "description": "The Morning and Evening Adhkar are your fortress against anxiety, evil eye, and laziness. Learn why you should never skip them.",
        "image_url": "https://images.unsplash.com/photo-1605389441160-c11451f2f84b?auto=format&fit=crop&q=80&w=1200",
        "read_time": "6",
        "date": "Feb 10, 2026",
        "content_body": """
            <p>The Prophet Muhammad (SAW) was consistent in his morning and evening remembrances (Adhkar). They are a spiritual shield and a means of tranquility.</p>
            <h2>Protection from Evil</h2>
            <p>Reciting the 'Mu'awwidhatayn' (Surah Al-Falaq and An-Nas) and Ayat al-Kursi protects one from the evil eye, magic, and physical harm throughout the day.</p>
            <h2>Peace of Heart</h2>
            <blockquote>"Unquestionably, by the remembrance of Allah hearts are assured." (Quran 13:28)</blockquote>
            <p>Starting the day with gratitude sets a positive psychological tone, reducing anxiety and stress.</p>
        """
    },
    {
        "filename": "dhikr-subhanallah.html",
        "title": "The Weight of SubhanAllah",
        "category": "Dhikr & Dua",
        "keywords": "subhanallah meaning, tasbih benefits, heavy on scales dhikr",
        "description": "Two words are light on the tongue but heavy on the scales: SubhanAllah wa Bihamdihi. Discover the immense reward of this dhikr.",
        "image_url": "https://images.unsplash.com/photo-1597937583689-1317ed663c76?auto=format&fit=crop&q=80&w=1200",
        "read_time": "3",
        "date": "Feb 09, 2026",
        "content_body": """
            <p>There is a Hadith where the Prophet (SAW) said: "Two words are light on the tongue, weigh heavily in the scales, and are loved by the Most Merciful: SubhanAllah wa Bihamdihi, SubhanAllahil Azeem."</p>
            <h2>What it Means</h2>
            <p>SubhanAllah means "Glory be to Allah," acknowledging His perfection and freedom from any deficiency. It is a declaration of awe.</p>
            <h3>100 Times a Day</h3>
            <p>Whoever says 'SubhanAllah wa Bihamdihi' 100 times a day, his sins will be forgiven even if they were like the foam of the sea. Use the Islamvy Smart Tasbih to keep track!</p>
        """
    },
     {
        "filename": "dhikr-istighfar.html",
        "title": "The Miracle of Istighfar (Seeking Forgiveness)",
        "category": "Dhikr & Dua",
        "keywords": "istighfar benefits, astaghfirullah meaning, dua for sustenance, opening doors dhikr",
        "description": "Istighfar is not just for erasing sins; it is the key to opening doors of sustenance (Rizq) and relief from sadness.",
        "image_url": "https://images.unsplash.com/photo-1594902094251-5121338870df?auto=format&fit=crop&q=80&w=1200",
        "read_time": "5",
        "date": "Feb 08, 2026",
        "content_body": """
            <p>Often we think of 'Astaghfirullah' only when we sin. But the Quran tells us that Istighfar brings rain, wealth, and children.</p>
            <h2>The Promise of Nuh (AS)</h2>
            <p>Prophet Nuh told his people: "Ask forgiveness of your Lord. Indeed, He is ever a Perpetual Forgiver. He will send [rain from] the sky upon you in showers and give you increase in wealth and children..." (Quran 71:10-12).</p>
            <h3>Relief from Anxiety</h3>
            <p>The Prophet (SAW) said: "If anyone constantly seeks pardon (from Allah), Allah will appoint for him a way out of every distress and a relief from every anxiety, and will provide for him from where he did not reckon."</p>
        """
    },
    {
        "filename": "dhikr-salawat.html",
        "title": "Sending Salawat upon the Prophet (SAW)",
        "category": "Dhikr & Dua",
        "keywords": "salawat benefits, durood sharif, blessings on prophet",
        "description": "Allah and His angels send blessings upon the Prophet. Learn why you should too, and how it lifts your burdens.",
        "image_url": "https://images.unsplash.com/photo-1579782500000-000000000000?auto=format&fit=crop&q=80&w=1200", # Placeholder check
        "read_time": "4",
        "date": "Feb 07, 2026",
        "content_body": """
            <p>Sending blessings (Salawat) upon Prophet Muhammad (SAW) is a command from Allah in the Quran (33:56).</p>
            <h2>One Salawat = Ten Blessings</h2>
            <p>The Prophet (SAW) said: "Whoever sends blessings upon me once, Allah will send blessings upon him tenfold." Imagine Allah mentioning you and blessing you ten times for one small act.</p>
            <h3>Friday Salawat</h3>
            <p>Increase your Salawat on Fridays, as it is presented to him (SAW). It is a way to show gratitude for the guidance he brought to us.</p>
        """
    },

    # GENERAL / APP FEATURES
    {
        "filename": "lifestyle-tech-spirituality.html",
        "title": "Can Technology Enhance Spirituality?",
        "category": "Islamic Knowledge",
        "keywords": "islamic apps, technology and islam, digital quran, prayer times app",
        "description": "From accurate prayer times to AI-driven insights, technology is changing how we practice Islam. Is it a distraction or a tool?",
        "image_url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
        "read_time": "5",
        "date": "Feb 06, 2026",
        "content_body": """
            <p>In a world of distractions, our phones are often the enemy of khushoo (focus). However, apps like Islamvy are turning these devices into tools for remembrance.</p>
            <h2>Precision in Worship</h2>
            <p>Knowing the exact prayer times and Qibla direction, no matter where you are in the world, allows Muslims to maintain their prayers with confidence.</p>
            <h2>Access to Knowledge</h2>
            <p>With features like 'Hatim' tracking and instant Quran translations, knowledge is more accessible than ever. The key is to use these tools mindfully—setting intentions before opening the app.</p>
        """
    },
    {
        "filename": "lifestyle-tahajjud.html",
        "title": "The Magic of Tahajjud Prayer",
        "category": "Islamic Knowledge",
        "keywords": "tahajjud benefits, night prayer islam, qiyam al layl, dua at night",
        "description": "The arrow that implies does not miss. Tahajjud is the prayer of the righteous. Here is how to perform it.",
        "image_url": "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=1200",
        "read_time": "4",
        "date": "Feb 05, 2026",
        "content_body": """
            <p>Tahajjud is the voluntary night prayer performed after sleeping. It is known as the believer's honor.</p>
            <h2>The Last Third of the Night</h2>
            <p>Allah descends to the lowest heaven in the last third of the night and asks: "Who is calling upon Me that I may answer him? Who is asking of Me that I may give him?"</p>
            <h3>How to Pray</h3>
            <p>Wake up anytime before Fajr (preferably the last third), perform Wudu, and pray 2 rakats. You can pray as many 2-rakat cycles as you wish. It is the best time to pour your heart out in Dua.</p>
        """
    },
    {
        "filename": "lifestyle-wudu-benefits.html",
        "title": "Physical and Spiritual Benefits of Wudu",
        "category": "Islamic Knowledge",
        "keywords": "wudu benefits, ablution islam, spiritual cleansing, hygiene in islam",
        "description": "Wudu is more than just washing; it is a ritual purification that washes away sins and refreshes the mind.",
        "image_url": "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=1200",
        "read_time": "3",
        "date": "Feb 04, 2026",
        "content_body": """
            <p>Muslims perform Wudu (ablution) at least 5 times a day. It is the key to Salah, but it also carries immense rewards.</p>
            <h2>Washing Away Sins</h2>
            <p>The Prophet (SAW) said that when a believer washes his face during Wudu, every sin he contemplated with his eyes is washed away with the water. The same applies to his hands, feet, and so on.</p>
            <h2>Scientific Benefits</h2>
            <p>Washing exposed parts of the body removes dust, germs, and sweat. Rinsing the mouth and nose maintains hygiene and prevents infections. It refreshes the body and helps wake you up for prayer.</p>
        """
    }
]

output_dir = "islamvy-web/blog/posts"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for post in posts:
    file_content = TEMPLATE.format(
        title=post["title"],
        description=post["description"],
        keywords=post["keywords"],
        image_url=post["image_url"],
        category=post["category"],
        read_time=post["read_time"],
        date=post["date"],
        content_body=post["content_body"]
    )
    
    file_path = os.path.join(output_dir, post["filename"])
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(file_content)
    print(f"Generated {file_path}")

print("All posts generated successfully.")
