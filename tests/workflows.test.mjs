import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const workflowsDir = path.resolve(here, '../site/workflows');
const load = (file) => JSON.parse(fs.readFileSync(path.join(workflowsDir, file), 'utf8'));
const getNode = (workflow, name) => workflow.nodes.find((node) => node.name === name);
const contientCredentials = (value) => {
  if (Array.isArray(value)) return value.some(contientCredentials);
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, child]) => key === 'credentials' || contientCredentials(child));
  }
  return false;
};

function executeCode(node, input = [], named = {}) {
  const $input = {
    all: () => input,
    first: () => input[0],
  };
  const lookup = (name) => ({
    first: () => named[name]?.[0],
    all: () => named[name] ?? [],
  });
  const context = vm.createContext({
    $input,
    $: lookup,
    Date,
    String,
    Number,
    Boolean,
    Array,
    Set,
    RegExp,
    Object,
    JSON,
    Math,
  });
  const result = vm.runInContext(`(function () {\n${node.parameters.jsCode}\n})()`, context, {
    timeout: 1000,
  });
  // Les objets produits dans une VM ont un prototype de domaine distinct :
  // sérialiser permet des assertions strictes sans altérer la logique n8n testée.
  return JSON.parse(JSON.stringify(result));
}

const expected = {
  'prospect-research.json': [
    ['Déclencheur manuel', 'Configurer les critères publics'],
    ['Configurer les critères publics', 'Rechercher dans l’API publique'],
    ['Rechercher dans l’API publique', 'Normaliser et limiter les prospects'],
  ],
  'follow-up-drafts.json': [
    ['Déclencheur manuel', 'Créer un échantillon fictif'],
    ['Créer un échantillon fictif', 'Filtrer échéances et exclusions'],
    ['Filtrer échéances et exclusions', 'Préparer les brouillons à valider'],
  ],
  'meeting-actions.json': [
    ['Déclencheur manuel', 'Créer des notes fictives structurées'],
    ['Créer des notes fictives structurées', 'Extraire actions et décisions'],
    ['Extraire actions et décisions', 'Valider les propositions humaines'],
  ],
};

for (const [file, links] of Object.entries(expected)) {
  test(`${file} : structure n8n sûre et connexions exactes`, () => {
    const workflow = load(file);
    assert.equal(workflow.active, false);
    assert.equal(workflow.settings.executionOrder, 'v1');
    assert.ok(workflow.nodes.some((node) => node.type === 'n8n-nodes-base.manualTrigger'));
    assert.ok(workflow.nodes.some((node) => node.type === 'n8n-nodes-base.stickyNote'));
    assert.ok(workflow.nodes.filter((node) => node.type === 'n8n-nodes-base.code').every((node) => (
      node.typeVersion === 2 && node.parameters.mode === 'runOnceForAllItems' && typeof node.parameters.jsCode === 'string'
    )));
    assert.ok(workflow.nodes.every((node) => !Object.hasOwn(node, 'credentials')));
    assert.equal(contientCredentials(workflow), false);

    for (const [source, target] of links) {
      assert.deepEqual(workflow.connections[source]?.main, [[{ node: target, type: 'main', index: 0 }]]);
    }
  });
}

test('prospection : HTTP GET public, SIREN dédupliqués et établissement géographique pertinent', () => {
  const workflow = load('prospect-research.json');
  const request = getNode(workflow, 'Rechercher dans l’API publique');
  const configuration = executeCode(getNode(workflow, 'Configurer les critères publics'));
  assert.deepEqual(configuration[0].json.code_postal, '44000');
  assert.deepEqual(configuration[0].json.activite_principale, '62.01Z');
  assert.deepEqual(configuration[0].json.per_page, 25);
  assert.equal(request.type, 'n8n-nodes-base.httpRequest');
  assert.equal(request.typeVersion, 4.2);
  assert.equal(request.parameters.method, 'GET');
  assert.equal(request.parameters.url, 'https://recherche-entreprises.api.gouv.fr/search');
  assert.deepEqual(request.parameters.queryParameters.parameters.map(({ name, value }) => [name, value]), [
    ['code_postal', '={{ $json.code_postal }}'],
    ['activite_principale', '={{ $json.activite_principale }}'],
    ['etat_administratif', '={{ $json.etat_administratif }}'],
    ['per_page', '={{ $json.per_page }}'],
  ]);

  const normaliser = getNode(workflow, 'Normaliser et limiter les prospects');
  const fixture = {
    results: [
      {
        siren: '123 456 789',
        nom_complet: 'Entreprise exemple',
        activite_principale: '62.01Z',
        matching_etablissements: [
          { siret: '12345678900011', code_postal: '75001', libelle_commune: 'PARIS', adresse: '1 rue Exemple, 75001 Paris' },
          { siret: '12345678900029', code_postal: '44000', libelle_commune: 'NANTES', adresse: '2 quai Public, 44000 Nantes' },
        ],
      },
      {
        siren: '123456789',
        nom_complet: 'Doublon à ignorer',
        matching_etablissements: [
          { siret: '12345678900037', code_postal: '44000', libelle_commune: 'NANTES' },
        ],
      },
      {
        siren: '987654321',
        nom_complet: 'Pas de matching Nantes',
        matching_etablissements: [
          { siret: '98765432100012', code_postal: '69001', libelle_commune: 'LYON' },
        ],
        siege: { code_postal: '44000', libelle_commune: 'NANTES' },
      },
    ],
  };
  const output = executeCode(normaliser, [{ json: fixture }], {
    'Configurer les critères publics': [{ json: { code_postal: '44000', ville_reference: 'Nantes', source_annuaire: 'Annuaire des entreprises — données publiques' } }],
  });
  assert.equal(output.length, 1);
  assert.deepEqual(output[0].json.etablissement_geographique, {
    siret: '12345678900029',
    code_postal: '44000',
    ville: 'NANTES',
    adresse_publique: '2 quai Public, 44000 Nantes',
    selection: 'matching_etablissements',
  });
  assert.equal(output[0].json.siren, '123456789');
  assert.ok(!Object.hasOwn(output[0].json, 'email'));
  assert.match(output[0].json.source.url, /123456789$/);
});

test('suivi : dates invalides, oppositions et statuts exclus ne produisent aucun brouillon', () => {
  const workflow = load('follow-up-drafts.json');
  const echantillon = executeCode(getNode(workflow, 'Créer un échantillon fictif'));
  const filtrer = getNode(workflow, 'Filtrer échéances et exclusions');
  const preparer = getNode(workflow, 'Préparer les brouillons à valider');
  assert.equal(echantillon.length, 3);
  assert.ok(echantillon.every((item) => item.json.organisation_fictive.includes('fictif')));
  const output = executeCode(filtrer, [
    { json: { id: 'DUE', organisation_fictive: 'Exemple', statut: 'à relancer', opposition: false, echeance: '2020-01-01' } },
    { json: { id: 'OPT-OUT', organisation_fictive: 'Exemple', statut: 'à relancer', opposition: true, echeance: '2020-01-01' } },
    { json: { id: 'REFUS', organisation_fictive: 'Exemple', statut: 'refus', opposition: false, echeance: '2020-01-01' } },
    { json: { id: 'BAD-DATE', organisation_fictive: 'Exemple', statut: 'à relancer', opposition: false, echeance: '2026-02-30' } },
  ]);
  assert.equal(output.find((item) => item.json.id === 'DUE').json.controle_suivi.brouillon_autorise, true);
  assert.equal(output.find((item) => item.json.id === 'OPT-OUT').json.controle_suivi.etat, 'exclu');
  assert.equal(output.find((item) => item.json.id === 'REFUS').json.controle_suivi.etat, 'exclu');
  assert.equal(output.find((item) => item.json.id === 'BAD-DATE').json.controle_suivi.etat, 'à compléter');

  const drafts = executeCode(preparer, output);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].json.id_source, 'DUE');
  assert.equal(drafts[0].json.action, 'brouillon non envoyé');
  assert.equal(drafts[0].json.etat, 'à valider humainement');
});

test('réunion : extraction déterministe et champs manquants marqués à compléter', () => {
  const workflow = load('meeting-actions.json');
  const notesFictives = executeCode(getNode(workflow, 'Créer des notes fictives structurées'));
  const extraire = getNode(workflow, 'Extraire actions et décisions');
  const valider = getNode(workflow, 'Valider les propositions humaines');
  assert.match(notesFictives[0].json.notes_fictives, /^ACTION \| .+ \| .+ \| \d{4}-\d{2}-\d{2}/);
  const extrait = executeCode(extraire, [{
    json: {
      reunion_id: 'REU-TEST',
      titre: 'Test',
      notes_fictives: [
        'ACTION | Finaliser la synthèse | Alex | 2026-12-01',
        'ACTION | Documenter le risque | À définir | 2026-02-30',
        'DECISION | La validation humaine reste obligatoire.',
      ].join('\n'),
    },
  }]);
  assert.equal(extrait.length, 3);
  assert.deepEqual(extrait[0].json, {
    type: 'action',
    reunion_id: 'REU-TEST',
    titre_reunion: 'Test',
    tache: 'Finaliser la synthèse',
    responsable: 'Alex',
    echeance: '2026-12-01',
    ligne_source: 'ACTION | Finaliser la synthèse | Alex | 2026-12-01',
    proposition_uniquement: true,
  });

  const valides = executeCode(valider, extrait);
  assert.equal(valides[0].json.etat_validation, 'prêt à valider');
  assert.equal(valides[0].json.creation_reelle, false);
  assert.equal(valides[1].json.etat_validation, 'à compléter');
  assert.deepEqual(valides[1].json.champs_a_completer, ['responsable', 'échéance YYYY-MM-DD valide']);
  assert.equal(valides[2].json.etat_validation, 'prêt à valider');
});
