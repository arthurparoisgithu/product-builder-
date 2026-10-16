import { workflows, briefExamples, iconPaths } from './data.js';
import { estimateGain, briefToMarkdown } from './logic.js';

const get = id => document.getElementById(id);
const format = number => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(number);
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let selectedWorkflow = 'prospect';
let runToken = 0;

function updateGain() {
  const inputs = [get('gain-volume'), get('gain-before'), get('gain-after')];
  const valid = inputs.every(input => input.value.trim() !== '' && input.checkValidity());
  const [volume, before, after] = inputs.map(input => Number(input.value));
  const gain = valid ? estimateGain(volume, before, after) : null;
  get('volume-output').textContent = format(volume);
  if (!gain) {
    get('gain-hours').textContent = '—';
    get('gain-unit').textContent = 'Vérifiez les valeurs';
    get('gain-caption').textContent = 'Temps de 0 à 240 min, par pas de 0,5 min.';
    get('gain-formula').textContent = 'Renseignez des valeurs valides pour calculer la projection.';
    get('after-bar').style.width = '0%';
    return;
  }
  get('gain-hours').textContent = format(Math.abs(gain.hours));
  get('gain-unit').textContent = gain.hours < 0 ? 'heures de plus / mois' : 'heures / mois';
  get('gain-caption').textContent = gain.hours < 0 ? 'Dans ce scénario, l’outil ne fait pas gagner de temps.' : 'de temps potentiellement libéré';
  get('gain-formula').textContent = `${format(volume)} × (${format(before)} − ${format(after)}) min ÷ 60 = ${format(gain.hours)} h / mois`;
  get('after-bar').style.width = `${gain.ratio * 100}%`;
}

function chooseWorkflow(key) {
  if (!workflows[key]) return;
  runToken += 1;
  selectedWorkflow = key;
  const workflow = workflows[key];
  document.querySelectorAll('[data-workflow]').forEach(button => {
    const active = button.dataset.workflow === key;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  get('workflow-panel').setAttribute('aria-labelledby', `tab-${key}`);
  const texts = { 'workflow-kicker':workflow.kicker, 'workflow-title':workflow.title, 'workflow-description':workflow.description, 'workflow-before':workflow.before, 'workflow-after':workflow.after, 'workflow-human':workflow.human, 'gain-assumptions':workflow.assumptions };
  Object.entries(texts).forEach(([id,value]) => { get(id).textContent = value; });
  get('workflow-nodes').replaceChildren(...workflow.steps.map((step,index) => {
    const node = document.createElement('li');
    node.className = 'workflow-node';
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.setAttribute('aria-hidden','true');
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${iconPaths[step.icon]}</svg>`;
    const text = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = step.title;
    const detail = document.createElement('small');
    detail.textContent = step.detail;
    text.append(title,detail);
    const number = document.createElement('span');
    number.className = 'node-number';
    number.textContent = `0${index+1}`;
    node.append(icon,text,number);
    return node;
  }));
  get('gain-volume').value = String(workflow.volume);
  get('gain-before').value = String(workflow.beforeTime);
  get('gain-after').value = String(workflow.afterTime);
  get('workflow-download').href = `./workflows/${workflow.download}`;
  get('workflow-status').textContent = 'Simulation illustrative : aucune connexion externe ni envoi de message.';
  get('workflow-progress').textContent = '0 / 5';
  get('play-workflow').disabled = false;
  updateGain();
}

const sleep = delay => new Promise(resolve => window.setTimeout(resolve,delay));
async function playWorkflow() {
  const token = ++runToken;
  const workflow = workflows[selectedWorkflow];
  const nodes = [...get('workflow-nodes').children];
  nodes.forEach(node => node.classList.remove('done','running'));
  get('play-workflow').disabled = true;
  for (let index=0; index<nodes.length; index++) {
    if (token !== runToken) return;
    nodes[index].classList.add('running');
    get('workflow-status').textContent = workflow.steps[index].status;
    get('workflow-progress').textContent = `${index+1} / 5`;
    await sleep(motion.matches ? 30 : 700);
    if (token !== runToken) return;
    nodes[index].classList.remove('running');
    nodes[index].classList.add('done');
  }
  get('play-workflow').disabled = false;
}

const tabs = [...document.querySelectorAll('[data-workflow]')];
tabs.forEach((tab,index) => {
  tab.addEventListener('click', () => chooseWorkflow(tab.dataset.workflow));
  tab.addEventListener('keydown', event => {
    let next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index+1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index+tabs.length-1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length-1;
    if (next !== null) {
      event.preventDefault();
      chooseWorkflow(tabs[next].dataset.workflow);
      tabs[next].focus();
    }
  });
});
get('play-workflow').addEventListener('click',playWorkflow);
['gain-volume','gain-before','gain-after'].forEach(id => get(id).addEventListener('input',updateGain));
chooseWorkflow('prospect');

let briefStructured = false;
let briefValidated = false;
function setBriefState(text,validated=false) {
  get('brief-state').textContent = text;
  get('brief-state').classList.toggle('valid',validated);
  get('export-brief').disabled = !validated;
}
function resetBrief() {
  briefStructured = false;
  briefValidated = false;
  get('brief-request').textContent = briefExamples[get('brief-example').value].request;
  get('brief-form').hidden = true;
  get('brief-empty').hidden = false;
  get('brief-empty').style.display = '';
  get('brief-approval').checked = false;
  get('brief-feedback').textContent = '';
  setBriefState('À structurer');
}
function structureBrief() {
  const example = briefExamples[get('brief-example').value];
  Object.entries(example.fields).forEach(([key,value]) => { get(`brief-${key}`).value = value; });
  get('brief-questions').replaceChildren(...example.questions.map(question => {
    const li = document.createElement('li');
    li.textContent = question;
    return li;
  }));
  briefStructured = true;
  briefValidated = false;
  get('brief-form').hidden = false;
  get('brief-empty').hidden = true;
  get('brief-empty').style.display = 'none';
  get('brief-approval').checked = false;
  setBriefState('À relire');
  get('brief-feedback').textContent = 'Extraction prédéfinie chargée. Relisez et corrigez les champs avant validation.';
  get('brief-objective').focus({preventScroll:true});
}
get('brief-example').addEventListener('change',resetBrief);
get('structure-brief').addEventListener('click',structureBrief);
get('brief-form').addEventListener('input', event => {
  if (!briefStructured) return;
  briefValidated = false;
  if (event.target !== get('brief-approval')) get('brief-approval').checked = false;
  setBriefState('À relire');
  get('brief-feedback').textContent = 'Cette version doit être validée avant l’export.';
});
get('brief-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!briefStructured || !get('brief-approval').checked || !get('brief-form').checkValidity()) return;
  const required = [get('brief-objective'),get('brief-deliverables')];
  if (required.some(field => !field.value.trim())) {
    get('brief-feedback').textContent = 'L’objectif et les livrables doivent contenir une information, pas uniquement des espaces.';
    required.find(field => !field.value.trim())?.focus();
    return;
  }
  briefValidated = true;
  setBriefState('Validé',true);
  get('brief-feedback').textContent = 'Brief validé. Vous pouvez exporter cette version ; les questions de cadrage restent à confirmer.';
});
get('export-brief').addEventListener('click', () => {
  if (!briefValidated || !get('brief-approval').checked) return;
  const fields = Object.fromEntries(new FormData(get('brief-form')).entries());
  const example = briefExamples[get('brief-example').value];
  const label = get('brief-example').selectedOptions[0].textContent;
  const markdown = briefToMarkdown(fields,example.questions,label);
  const url = URL.createObjectURL(new Blob([markdown], {type:'text/markdown;charset=utf-8'}));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'briefops-brief-valide.md';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url),1000);
  get('brief-feedback').textContent = 'Export téléchargé. Aucun message n’a été envoyé et aucune donnée n’a été collectée.';
});
resetBrief();

// Les deux démos (#demo et #impact) partagent le lien « Démos » de la navigation.
const navAlias = { impact:'demo' };
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const id = navAlias[entry.target.id] || entry.target.id;
    document.querySelectorAll('.header nav a').forEach(link => link.classList.toggle('current',link.hash === `#${id}`));
  }
},{rootMargin:'-20% 0px -60% 0px'});
['services','realisations','demo','impact','profil','contact'].forEach(id => { const el = get(id); if (el) observer.observe(el); });
