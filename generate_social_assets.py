import os
import random
import textwrap
import datetime
from PIL import Image, ImageDraw, ImageFont

# Import data from our shared module
from content_data import (
    LANGUAGES, TRANSLATIONS, topics, format_title, TOPIC_TRANSLATIONS,
    worship_data, dhikr_data, lifestyle_data, dream_interpretations, fallbacks
)

# Configuration
OUTPUT_DIR = "islamvy-web/social_assets"
DATE_STR = datetime.datetime.now().strftime("%Y-%m-%d")

# Design Config
THEMES = [
    {"bg": "#1e3e34", "text": "#E0F2F1", "accent": "#D4AF37", "name": "Forest Gold"},
    {"bg": "#263238", "text": "#ECEFF1", "accent": "#80CBC4", "name": "Midnight Teal"},
    {"bg": "#3E2723", "text": "#EFEBE9", "accent": "#FFAB00", "name": "Deep Earth"},
    {"bg": "#0D47A1", "text": "#E3F2FD", "accent": "#64B5F6", "name": "Royal Blue"},
    {"bg": "#311B92", "text": "#EDE7F6", "accent": "#B39DDB", "name": "Deep Purple"}
]

def load_font(size):
    # Try common system fonts
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "arial.ttf"
    ]
    for path in font_paths:
        try:
            return ImageFont.truetype(path, size)
        except IOError:
            continue
    return ImageFont.load_default()

def get_content_for_asset(slug, cat_key, lang):
    # Simplified content resolution logic
    is_dream = "dream" in slug
    
    # 1. Base Content resolution
    data_source = None
    if slug in worship_data: data_source = worship_data[slug]
    elif slug in dhikr_data: data_source = dhikr_data[slug]
    elif slug in lifestyle_data: data_source = lifestyle_data[slug]
    
    # Start with fallback
    content = fallbacks.get(lang, fallbacks["en"]).copy()
    
    # Update title
    content["title"] = TOPIC_TRANSLATIONS.get(slug, {}).get(lang, format_title(slug))
    
    # Merge specific data
    if data_source:
        if lang in data_source:
            content.update(data_source[lang])
        elif "en" in data_source:
            # Use English data but keep translated title
            en_data = data_source["en"].copy()
            en_data["title"] = content["title"]
            content.update(en_data)

    # Dream logic
    if is_dream:
        intr = dream_interpretations.get(slug, dream_interpretations.get("dream-cat", {}))
        final_intr = intr.get(lang, intr.get("en", ""))
        content["body"] = final_intr
        content["tldr"] = final_intr # Dreams are short, use body as TLDR
        
    return content

def wrap_text(text, font, max_width, draw):
    """Wrap text to fit within max_width."""
    lines = []
    # If text is HTML, strip simple tags for image
    text = text.replace("<p>", "").replace("</p>", "\n").replace("<strong>", "").replace("</strong>", "")
    
    paragraphs = text.split('\n')
    for paragraph in paragraphs:
        if not paragraph.strip():
            continue
        words = paragraph.split()
        current_line = []
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            w = bbox[2] - bbox[0]
            if w <= max_width:
                current_line.append(word)
            else:
                lines.append(' '.join(current_line))
                current_line = [word]
        if current_line:
            lines.append(' '.join(current_line))
    return lines

def generate_asset(size_type, content, lang, theme, slug):
    width, height = (1080, 1920) if size_type == "story" else (1080, 1080)
    img = Image.new('RGB', (width, height), color=theme["bg"])
    draw = ImageDraw.Draw(img)
    
    margin = 80
    max_text_width = width - (2 * margin)
    
    # Load Fonts
    title_font_size = 70 if size_type == "story" else 60
    body_font_size = 40 if size_type == "story" else 35
    meta_font_size = 30
    
    font_title = load_font(title_font_size)
    font_body = load_font(body_font_size)
    font_meta = load_font(meta_font_size)
    
    # --- DRAWING ---
    current_y = 250 if size_type == "story" else 150
    
    # 1. Category Pill
    cat_text = content.get("category", "Islamvy Daily").upper()
    cat_bbox = draw.textbbox((0, 0), cat_text, font=font_meta)
    cat_w = cat_bbox[2] - cat_bbox[0]
    cat_h = cat_bbox[3] - cat_bbox[1]
    
    # Center pill
    pill_x = (width - cat_w) / 2
    draw.rectangle([pill_x - 20, current_y - 10, pill_x + cat_w + 20, current_y + cat_h + 10], outline=theme["accent"], width=2)
    draw.text((pill_x, current_y), cat_text, font=font_meta, fill=theme["accent"])
    
    current_y += 120
    
    # 2. Title
    title_lines = wrap_text(content["title"], font_title, max_text_width, draw)
    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=font_title)
        line_w = bbox[2] - bbox[0]
        draw.text(((width - line_w) / 2, current_y), line, font=font_title, fill=theme["text"])
        current_y += title_font_size + 15
        
    current_y += 60 # Spacer
    
    # 3. Body (TLDR or Short Body)
    body_text = content.get("tldr", "")
    if len(body_text) < 50: # If TLDR is too short or empty, try body summary
        body_text = content.get("summary", "")
        
    body_lines = wrap_text(body_text, font_body, max_text_width, draw)
    # Limit lines to prevent overflow
    max_lines = 14 if size_type == "story" else 8
    body_lines = body_lines[:max_lines]
    
    for line in body_lines:
        bbox = draw.textbbox((0, 0), line, font=font_body)
        line_w = bbox[2] - bbox[0]
        draw.text(((width - line_w) / 2, current_y), line, font=font_body, fill=theme["text"])
        current_y += body_font_size + 15
        
    # 4. Footer / Logo
    footer_y = height - 150
    draw.line((margin, footer_y, width - margin, footer_y), fill=theme["accent"], width=1)
    footer_text = "Download Islamvy App"
    bbox = draw.textbbox((0, 0), footer_text, font=font_meta)
    fw = bbox[2] - bbox[0]
    draw.text(((width - fw) / 2, footer_y + 30), footer_text, font=font_meta, fill=theme["accent"])
    
    # Save
    out_path = f"{OUTPUT_DIR}/{DATE_STR}/{lang}/{slug}_{size_type}.png"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path)
    return out_path

def main():
    print("Generating Social Media Assets...")
    
    # Select 3 random topics for today
    todays_topics = random.sample(topics, 3)
    
    generated_count = 0
    for lang in LANGUAGES:
        print(f"Processing {lang}...")
        for slug, cat_key in todays_topics:
            content = get_content_for_asset(slug, cat_key, lang)
            content["category"] = TRANSLATIONS[lang].get(cat_key, "Islamvy")
            
            theme = random.choice(THEMES)
            
            # Generate Story and Feed
            generate_asset("story", content, lang, theme, slug)
            generate_asset("feed", content, lang, theme, slug)
            generated_count += 2
            
    print(f"Successfully generated {generated_count} assets in {OUTPUT_DIR}/{DATE_STR}")

if __name__ == "__main__":
    main()
