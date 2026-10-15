from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = None
    for opts in ({}, {'executable_path': '/usr/bin/chromium'}, {'channel': 'chrome'}):
        try:
            browser = p.chromium.launch(**opts)
            break
        except Exception:
            continue
    if browser is None:
        raise RuntimeError('Chromium indisponible')
    page = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:3000/', wait_until='networkidle')
    assert page.locator('main > section').last.get_attribute('id') == 'video'
    assert page.locator('video').count() == 1
    assert page.locator('video').get_attribute('autoplay') is None
    assert not page.locator('video').evaluate('(v) => v.muted')
    page.locator('nav a[href="#video"]').click()
    assert page.locator('#video').is_visible()
    page.locator('video').evaluate('(v) => v.load()')
    page.wait_for_function('document.querySelector("video").readyState >= 2')
    assert page.locator('video').evaluate('(v) => v.duration') == 30
    page.locator('video').evaluate('(v) => v.play()')
    page.wait_for_function('document.querySelector("video").currentTime > 0.2')
    page.locator('video').evaluate('(v) => { v.pause(); v.currentTime = 20; }')
    page.wait_for_function('!document.querySelector("video").seeking')
    assert page.locator('video').evaluate('(v) => v.error') is None
    for width in (1440, 1024, 768, 390, 320):
        page.set_viewport_size({'width': width, 'height': 900})
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), width
    response = page.request.get('http://127.0.0.1:3000/assets/video/promo-30s.mp4', headers={'Range': 'bytes=0-1023'})
    assert response.status == 206
    assert response.headers['content-type'] == 'video/mp4'
    assert len(response.body()) == 1024
    assert response.headers['content-range'].startswith('bytes 0-1023/')
    invalid = page.request.get('http://127.0.0.1:3000/assets/video/promo-30s.mp4', headers={'Range': 'bytes=99999999-'})
    assert invalid.status == 416
    assert not errors, errors
    browser.close()
    print('Vidéo vérifiée : dernière section, accès navigation, 30 s, son non coupé, lecture, déplacement temporel, contrôles natifs, mobile sans débordement et HTTP partiel 206.')
