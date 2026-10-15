import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateGain, briefToMarkdown } from '../site/js/logic.js';
import { workflows, briefExamples } from '../site/js/data.js';

test('Les projections proviennent de la formule affichée', () => {
  for (const workflow of Object.values(workflows)) {
    const gain = estimateGain(workflow.volume,workflow.beforeTime,workflow.afterTime);
    assert.equal(gain.hours,workflow.volume*(workflow.beforeTime-workflow.afterTime)/60);
    assert.equal(workflow.steps.length,5);
    assert.ok(workflow.assumptions.includes('Hypothèse illustrative'));
  }
});
test('Les cas zéro, surcoût et saisies incorrectes ne produisent pas de faux gains', () => {
  assert.equal(estimateGain(0,12,3).hours,0);
  assert.equal(estimateGain(60,3,8).hours,-5);
  assert.equal(estimateGain(100,0,0).ratio,0);
  assert.equal(estimateGain(100,0,8).ratio,1);
  assert.equal(estimateGain(-1,12,3),null);
  assert.equal(estimateGain(100,NaN,3),null);
});
test('Export de brief : données fictives, inconnues et absence d’envoi explicites', () => {
  const example = briefExamples.website;
  const result = briefToMarkdown(example.fields,example.questions,'Un site pour un cabinet');
  assert.ok(result.includes('données fictives, sans IA en direct'));
  assert.ok(result.includes('Non précisé — à clarifier'));
  assert.ok(result.includes('Aucun message n’a été envoyé'));
  assert.ok(result.endsWith('\n'));
});
test('Les trois cas BriefOps sont présents et distincts', () => {
  assert.deepEqual(Object.keys(briefExamples),['website','automation','incomplete']);
  assert.equal(briefExamples.incomplete.fields.deliverables,'');
  assert.equal(briefExamples.automation.fields.budget,'');
});
