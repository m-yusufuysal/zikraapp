import os
import datetime

# Configuration
BASE_URL = "https://islamvy.com"
ROOT_DIR = "/Users/yusufsmacbook/Desktop/Islamvy/islamvy-web"
BLOG_DIR = os.path.join(ROOT_DIR, "blog")

# Regional targets for specific languages to maximize localized SEO
REGIONS = {
    "ar": ["ar", "ar-SA", "ar-EG", "ar-AE", "ar-KW", "ar-QA", "ar-BH", "ar-OM", "ar-JO", "ar-LB", "ar-DZ", "ar-MA", "ar-IQ", "ar-YE", "ar-SD"],
    "fr": ["fr", "fr-FR", "fr-BE", "fr-CA", "fr-CH", "fr-MA", "fr-DZ", "fr-TN"],
    "id": ["id", "id-ID"],
    "tr": ["tr", "tr-TR"],
    "en": ["en", "en-US", "en-GB", "en-CA", "en-AU"]
}

def generate_sitemap():
    urls = []
    
    # Add Homepage
    urls.append({
        "loc": f"{BASE_URL}/",
        "lastmod": datetime.date.today().isoformat(),
        "priority": "1.0",
        "changefreq": "daily",
        "hreflangs": [] 
    })

    # Walk through the blog directory
    for root, dirs, files in os.walk(BLOG_DIR):
        for file in files:
            if file.endswith(".html"):
                # Get relative path
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, ROOT_DIR)
                
                # Determine language from path part (e.g. blog/ar/...)
                parts = rel_path.split(os.sep)
                lang = "en" # default
                if len(parts) > 1 and parts[1] in REGIONS:
                    lang = parts[1]
                
                # Construct URL
                url = f"{BASE_URL}/{rel_path.replace(os.sep, '/')}"
                
                # Prepare hreflang entries
                # Since we are mapping the SAME file to multiple regions for improved discovery
                hreflangs = []
                if lang in REGIONS:
                    for region_code in REGIONS[lang]:
                        hreflangs.append({
                            "rel": "alternate",
                            "hreflang": region_code,
                            "href": url
                        })

                urls.append({
                    "loc": url,
                    "lastmod": datetime.date.today().isoformat(),
                    "priority": "0.8" if "index.html" in file else "0.7",
                    "changefreq": "weekly",
                    "hreflangs": hreflangs
                })

    # Build XML
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">')
    
    for entry in urls:
        xml_content.append('  <url>')
        xml_content.append(f'    <loc>{entry["loc"]}</loc>')
        xml_content.append(f'    <lastmod>{entry["lastmod"]}</lastmod>')
        xml_content.append(f'    <changefreq>{entry["changefreq"]}</changefreq>')
        xml_content.append(f'    <priority>{entry["priority"]}</priority>')
        
        # Add hreflang tags for regional targeting
        for link in entry["hreflangs"]:
             xml_content.append(f'    <xhtml:link rel="{link["rel"]}" hreflang="{link["hreflang"]}" href="{link["href"]}"/>')
             
        xml_content.append('  </url>')

    xml_content.append('</urlset>')
    
    return "\n".join(xml_content)

if __name__ == "__main__":
    content = generate_sitemap()
    output_path = os.path.join(ROOT_DIR, "sitemap.xml")
    with open(output_path, "w") as f:
        f.write(content)
    print(f"Sitemap generated at {output_path} with {len(content.splitlines())} lines.")
