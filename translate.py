import re

def update_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. html lang="ru"
    html = re.sub(r'<html lang="en"', r'<html lang="ru"', html)

    # 3 & 4. meta tags & og:image
    html = re.sub(
        r'<meta name="description" content="[^"]+">',
        r'<meta name="description" content="Разработка MVP, экосистем на Python и AI-решений">',
        html
    )
    html = re.sub(
        r'<meta property="og:title" content="[^"]+">',
        r'<meta property="og:title" content="Евгений Нестеров | Портфолио">',
        html
    )
    
    # insert og:image before og:description
    og_desc_pattern = r'<meta property="og:description" content=".*?">'
    og_desc_new = r'<meta property="og:image" content="https://YOUR_DOMAIN/og-image.jpg">\n    <meta property="og:description" content="Профессиональный Fullstack разработчик. Создание MVP и масштабируемых цифровых продуктов.">'
    html = re.sub(og_desc_pattern, og_desc_new, html)

    # 5. JS switcher logic
    html = html.replace("let currentLang = 'en';", "let currentLang = 'ru';")
    html = html.replace("switchLanguage('en'); // Initial call", "switchLanguage('ru'); // Initial call")

    # Flag Opacities in HTML
    # RU flag should be opacity-100, EN should be opacity-50
    # Original:
    # <button class="text-2xl opacity-50 hover:opacity-100 transition-opacity flex items-center" id="lang-ru" ... 
    # <button class="text-2xl opacity-100 hover:opacity-100 transition-opacity flex items-center" id="lang-en" ...
    
    html = re.sub(
        r'(<button class="text-2xl) opacity-50 (hover:opacity-100[^"]*" id="lang-ru")',
        r'\1 opacity-100 \2',
        html
    )
    html = re.sub(
        r'(<button class="text-2xl) opacity-100 (hover:opacity-100[^"]*" id="lang-en")',
        r'\1 opacity-50 \2',
        html
    )

    # 2. Swap inner HTML to data-ru default
    # Matches:
    # group 1: entire opening tag
    # group 2: tag name (span, p, a, button, h1, etc.)
    # group 3: data-ru value
    # group 4: closing tag matching group 2
    # The non-greedy .*? matches everything in between.
    pattern = re.compile(r'(<([a-zA-Z0-9]+)[^>]*?data-ru="([^"]*)"[^>]*>).*?(</\2>)', re.DOTALL)
    
    # We loop replacing because there might be nested cases (though unlikely based on observation).
    new_html = html
    prev_html = ""
    while new_html != prev_html:
        prev_html = new_html
        new_html = pattern.sub(r'\1\3\4', new_html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)

update_html('c:/Users/ACER/Desktop/portfolio 2/index.html')
print("Done!")
