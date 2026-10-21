from pathlib import Path
from tempfile import TemporaryDirectory
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:3000'

def launch(playwright):
    for options in ({}, {'executable_path': '/usr/bin/chromium'}, {'channel': 'chrome'}):
        try:
            return playwright.chromium.launch(**options)
        except Exception:
            continue
    raise RuntimeError('Chromium indisponible')

with sync_playwright() as playwright, TemporaryDirectory() as temp:
    browser = launch(playwright)
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce', accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE, wait_until='networkidle')
    page.locator('.skip').focus()
    page.keyboard.press('Enter')
    assert page.evaluate("document.activeElement.id") == 'main'
    # Structure : hero (avec le profil), services, méthode, workflows concrets, FAQ, vidéo, contact
    for section_id in ('accueil', 'services', 'workflows', 'video', 'contact'):
        assert page.locator(f'#{section_id}').count() == 1, section_id
    for removed in ('demo', 'impact', 'profil', 'realisations'):
        assert page.locator(f'#{removed}').count() == 0, removed
    assert page.locator('a[href="#demo"], a[href="#impact"], a[href="#realisations"]').count() == 0
    assert page.locator('nav a[href="#workflows"]').inner_text() == 'Workflows'
    assert 'Chef de Projet IA & No-Code' in page.locator('h1').inner_text()
    assert 'RNCP 40677' in page.locator('#accueil').inner_text()
    assert page.locator('.service-card').count() == 3
    assert page.locator('#workflows .wf-card').count() == 3
    for card in page.locator('#workflows .wf-card').all():
        assert card.locator('.wf-step').count() == 6
        assert card.locator('.wf-step.trigger').count() == 1 and card.locator('.wf-step.human').count() == 1
    assert page.locator('a[href^="mailto:"]').count() >= 3
    downloads = page.locator('#workflows .wf-card .wf-footer a.wf-download[download]')
    assert downloads.count() == 3
    assert [downloads.nth(i).get_attribute('href') for i in range(3)] == ['./workflows/qualification-leads-b2b.json', './workflows/recyclage-contenu.json', './workflows/prescreening-rh.json']
    # CV téléchargeable (hero, contact) et FAQ
    cv = page.locator('a[href="./assets/cv-arthur-parois.pdf"][download]')
    assert cv.count() == 2
    for zone in ('#accueil .hero2-actions', '#contact .contact-actions'):
        assert page.locator(f'{zone} a[href="./assets/cv-arthur-parois.pdf"][download]').count() == 1, zone
    assert page.locator('#workflows .wf-cta').count() == 0
    assert page.locator('#faq').count() == 0
    assert page.locator('#methode').count() == 0
    assert page.locator('nav a[href="#video"]').count() == 1
    assert page.locator('a[href*="linkedin"], source[src*="promo-30s"]').count() == 0
    assert page.locator('#video video source[src="./assets/video/promo-60s.mp4"]').count() == 1
    assert page.locator('#video video source[src="./assets/video/presentation-arthur.mp4"]').count() == 1
    # la section vidéos suit directement les workflows
    assert page.evaluate("document.querySelector('#workflows').nextElementSibling.id === 'video'")
    assert page.locator('svg use[href="#i-n8n"]').count() >= 1
    assert page.evaluate("document.querySelector('#i-n8n path').getAttribute('d').length > 50")
    page.locator('nav a[href="#workflows"]').click()
    page.wait_for_timeout(400)
    assert page.locator('nav a[href="#workflows"]').get_attribute('class') == 'current'
    for width in (1440, 1024, 768, 390, 320):
        page.set_viewport_size({'width': width, 'height': 900})
        overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
        if overflow:
            offending = page.evaluate("Array.from(document.querySelectorAll('body *')).filter(e => e.getBoundingClientRect().right > innerWidth+1).map(e => ({tag:e.tagName, cls:e.className, right:e.getBoundingClientRect().right})).slice(0,12)")
            raise AssertionError(f'Débordement à {width}px : {offending}')
    assert not errors, errors
    for asset in ('/assets/n8n-workflow.jpg', '/assets/animapp.jpg', '/assets/kine-site.jpg', '/workflows/prospect-research.json', '/workflows/follow-up-drafts.json', '/workflows/meeting-actions.json', '/workflows/devis-entrant.json', '/workflows/onboarding-collaborateur.json', '/workflows/avis-google.json', '/workflows/qualification-leads-b2b.json', '/workflows/recyclage-contenu.json', '/workflows/prescreening-rh.json', '/manus-routes.json', '/assets/cv-arthur-parois.pdf'):
        response = context.request.get(BASE + asset)
        assert response.status == 200, (asset, response.status)
    browser.close()
    print('Interface vérifiée : sections, 3 workflows concrets, CV, CTA, FAQ, navigation active, assets et aucun débordement de 320 à 1440 px.')
