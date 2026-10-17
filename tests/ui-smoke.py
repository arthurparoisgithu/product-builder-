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
    # Structure : hero, services, preuves, workflows concrets, profil, contact
    for section_id in ('accueil', 'services', 'methode', 'workflows', 'profil', 'contact'):
        assert page.locator(f'#{section_id}').count() == 1, section_id
    for removed in ('demo', 'impact', 'video', 'realisations'):
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
    assert page.locator('#methode .process-step').count() == 4
    assert page.locator('nav a[href="#methode"]').count() == 0
    assert page.evaluate("document.querySelector('#services').compareDocumentPosition(document.querySelector('#methode')) & 4")
    assert page.evaluate("document.querySelector('#methode').compareDocumentPosition(document.querySelector('#workflows')) & 4")
    downloads = page.locator('#workflows .wf-card .wf-footer a.wf-download[download]')
    assert downloads.count() == 3
    assert [downloads.nth(i).get_attribute('href') for i in range(3)] == ['./workflows/prospect-research.json', './workflows/follow-up-drafts.json', './workflows/meeting-actions.json']
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
    for asset in ('/assets/n8n-workflow.jpg', '/assets/animapp.jpg', '/assets/kine-site.jpg', '/workflows/prospect-research.json', '/workflows/follow-up-drafts.json', '/workflows/meeting-actions.json', '/manus-routes.json'):
        response = context.request.get(BASE + asset)
        assert response.status == 200, (asset, response.status)
    browser.close()
    print('Interface vérifiée : sections, 3 workflows concrets, navigation active, assets et aucun débordement de 320 à 1440 px.')
