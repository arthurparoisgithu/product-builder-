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
    # Structure V2 : hero, services, preuves, démos, profil, contact
    for section_id in ('accueil', 'services', 'realisations', 'demo', 'impact', 'profil', 'contact'):
        assert page.locator(f'#{section_id}').count() == 1, section_id
    assert 'Chef de Projet IA & No-Code' in page.locator('h1').inner_text()
    assert 'RNCP 40677' in page.locator('#accueil').inner_text()
    assert page.locator('.service-card').count() == 3
    assert page.locator('#video').count() == 0
    assert page.locator('a[href^="mailto:"]').count() >= 3
    assert page.locator('svg use[href="#i-n8n"]').count() >= 1
    assert page.evaluate("document.querySelector('#i-n8n path').getAttribute('d').length > 50")
    assert page.locator('#workflow-nodes li').count() == 5
    assert page.locator('#gain-hours').inner_text() == '15'
    page.locator('#tab-followup').click()
    assert 'Relancer' in page.locator('#workflow-title').inner_text()
    page.locator('#play-workflow').click()
    page.wait_for_function("document.querySelectorAll('.workflow-node.done').length === 5")
    assert 'Aucun message envoyé' in page.locator('#workflow-status').inner_text()
    page.locator('#tab-followup').focus()
    page.keyboard.press('ArrowRight')
    assert page.locator('#tab-meeting').get_attribute('aria-selected') == 'true'
    assert page.locator('#gain-hours').inner_text() == '5'
    page.locator('#gain-before').fill('3')
    page.locator('#gain-after').fill('8')
    assert 'heures de plus' in page.locator('#gain-unit').inner_text()
    page.locator('#gain-before').fill('')
    assert 'Vérifiez' in page.locator('#gain-unit').inner_text()
    page.locator('#gain-before').fill('40')
    page.locator('#gain-after').fill('15')
    page.locator('#structure-brief').click()
    assert page.locator('#brief-form').is_visible()
    assert page.locator('#export-brief').is_disabled()
    page.locator('#brief-approval').check()
    page.locator('#brief-form button[type=submit]').click()
    assert page.locator('#export-brief').is_enabled()
    with page.expect_download() as download_event:
        page.locator('#export-brief').click()
    download = download_event.value
    destination = Path(temp) / download.suggested_filename
    download.save_as(destination)
    exported = destination.read_text()
    assert 'données fictives, sans IA en direct' in exported
    assert '## Objectif' in exported
    page.locator('#brief-objective').fill('Objectif modifié après validation')
    assert page.locator('#export-brief').is_disabled()
    assert not page.locator('#brief-approval').is_checked()
    page.locator('#brief-example').select_option('incomplete')
    assert page.locator('#brief-form').is_hidden()
    page.locator('#structure-brief').click()
    assert page.locator('#brief-deliverables').input_value() == ''
    page.locator('#brief-deliverables').fill('   ')
    page.locator('#brief-approval').check()
    page.locator('#brief-form button[type=submit]').click()
    assert page.locator('#export-brief').is_disabled()
    page.locator('#brief-deliverables').fill('Atelier de cadrage à confirmer')
    page.locator('#brief-approval').check()
    page.locator('#brief-form button[type=submit]').click()
    assert page.locator('#export-brief').is_enabled()
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
    print('Interface vérifiée : onglets clavier, simulations, projections défavorables, validation/export/édition, cas incomplet, assets et aucun débordement de 320 à 1440 px.')
