export function estimateGain(volume, before, after) {
  const values = [volume, before, after].map(Number);
  if (values.some(n => !Number.isFinite(n) || n < 0)) return null;
  const [count, manualMinutes, assistedMinutes] = values;
  const manual = count * manualMinutes;
  const assisted = count * assistedMinutes;
  return { manual, assisted, hours: (manual - assisted) / 60, ratio: manual > 0 ? Math.min(assisted / manual, 1) : (assisted > 0 ? 1 : 0) };
}

export function briefToMarkdown(fields, questions, exampleLabel) {
  const value = field => String(fields[field] ?? '').trim() || 'Non précisé — à clarifier';
  return `# BriefOps — Brief relu et validé\n\n> Démonstration avec données fictives, sans IA en direct. La validation concerne cette version du brief, pas la véracité de données clients.\n\nExemple : ${exampleLabel}\n\n## Objectif\n\n${value('objective')}\n\n## Livrables envisagés\n\n${value('deliverables')}\n\n## Budget évoqué\n\n${value('budget')}\n\n## Échéance évoquée\n\n${value('deadline')}\n\n## Contraintes\n\n${value('constraints')}\n\n## Questions de cadrage à vérifier\n\n${questions.map(q => `- ${q}`).join('\n')}\n\n## Suite\n\nConfirmer le périmètre et les informations manquantes avec l’interlocuteur avant de construire. Aucun message n’a été envoyé.\n`;
}
