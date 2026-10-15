export const workflows = {
  prospect: {
    kicker: 'PROSPECTION · RECHERCHE & PRÉPARATION',
    title: 'Trouver les entreprises. Pas collectionner les onglets.',
    description: 'Définir une cible, consulter une source publique, dédupliquer et préparer une liste à vérifier. Le modèle n8n utilise l’API Recherche d’entreprises ; il ne collecte pas d’emails et ne contacte personne.',
    before: 'Rechercher les entreprises une par une, vérifier leur activité et recopier les mêmes informations dans un tableau.',
    after: 'Obtenir une première liste structurée, avec SIREN et source. Garder la vérification de pertinence et le choix du contact côté humain.',
    human: 'Une entreprise trouvée n’est pas un prospect qualifié. Vérifier la pertinence et le cadre d’usage avant tout contact.',
    download: 'prospect-research.json', volume: 100, beforeTime: 12, afterTime: 3,
    assumptions: 'Hypothèse illustrative : 12 min de recherche manuelle contre 3 min de vérification par entreprise. Le modèle récupère au maximum 25 résultats par exécution, sans pagination. Hors mise en place, maintenance, recherche de contact et prise de contact. Une source publique ne garantit ni exhaustivité ni pertinence commerciale.',
    steps: [
      {icon:'target', title:'Définir la cible', detail:'Zone + activité', status:'Cible fictive : entreprises du numérique autour de Nantes.'},
      {icon:'search', title:'Consulter la source', detail:'API publique', status:'Simulation : consultation de l’API Recherche d’entreprises.'},
      {icon:'filter', title:'Nettoyer la liste', detail:'SIREN + localisation', status:'Simulation : dédoublonnage par SIREN et contrôle de l’établissement local.'},
      {icon:'table', title:'Structurer les fiches', detail:'Nom + activité + source', status:'Simulation : fiches structurées, sans adresse email inventée.'},
      {icon:'check', title:'Vérifier la pertinence', detail:'À qualifier par l’équipe', status:'Liste illustrative prête à vérifier. Aucun contact n’a été effectué.'},
    ],
  },
  followup: {
    kicker: 'SUIVI COMMERCIAL · BROUILLONS & CONTRÔLE',
    title: 'Relancer au bon moment. Sans piloter à l’aveugle.',
    description: 'Repérer les opportunités dont l’échéance est passée, exclure celles qui ont répondu ou refusé, puis préparer un brouillon à relire. Le modèle travaille sur des données fictives et n’envoie rien.',
    before: 'Parcourir le tableau de suivi, retrouver les échanges et rédiger chaque relance depuis zéro.',
    after: 'Concentrer la revue sur les dossiers réellement à suivre et disposer d’un brouillon fondé sur les informations connues.',
    human: 'La pertinence du message et son envoi restent à valider. Une opposition, une réponse ou un dossier clos exclut la relance.',
    download: 'follow-up-drafts.json', volume: 80, beforeTime: 8, afterTime: 3,
    assumptions: 'Hypothèse illustrative : 8 min de vérification et rédaction manuelles contre 3 min de relecture par dossier. Le modèle prépare des brouillons à partir d’un jeu fictif, sans CRM connecté ni envoi. Hors intégration, maintenance et temps d’échange avec le prospect. Respecter les oppositions et vérifier la politique de contact de l’entreprise.',
    steps: [
      {icon:'table', title:'Lire le suivi', detail:'Dossiers fictifs', status:'Simulation : lecture d’opportunités commerciales fictives.'},
      {icon:'clock', title:'Vérifier l’échéance', detail:'Dates contrôlées', status:'Simulation : seuls les dossiers arrivés à échéance sont retenus.'},
      {icon:'filter', title:'Exclure les refus', detail:'Répondu ou clôturé', status:'Simulation : réponses, oppositions et dossiers clos sont exclus.'},
      {icon:'edit', title:'Préparer le brouillon', detail:'Sans information inventée', status:'Simulation : rédaction d’un brouillon à partir des données connues.'},
      {icon:'check', title:'Relire avant envoi', detail:'Validation humaine', status:'Brouillons illustratifs prêts à relire. Aucun message envoyé.'},
    ],
  },
  meeting: {
    kicker: 'COORDINATION · NOTES & ACTIONS',
    title: 'La réunion est terminée. Le travail peut commencer.',
    description: 'Passer de notes structurées à une liste d’actions : tâche, responsable, échéance et informations manquantes. Le modèle utilise des règles explicites, sans IA et sans créer de tâches dans un outil externe.',
    before: 'Relire les notes, séparer décisions et actions, puis chercher qui doit faire quoi et pour quand.',
    after: 'Disposer de propositions de tâches homogènes, avec les champs incomplets visibles avant validation par l’équipe.',
    human: 'L’équipe confirme les tâches. Un responsable ou une échéance absent reste à compléter ; la création réelle nécessite un connecteur séparé.',
    download: 'meeting-actions.json', volume: 12, beforeTime: 40, afterTime: 15,
    assumptions: 'Hypothèse illustrative : 40 min de reprise manuelle contre 15 min de préparation des notes structurées et de revue par réunion. Le modèle exige le format ACTION | tâche | responsable | date. Il ne comprend pas un compte rendu libre. Hors prise de notes initiale, mise en place et maintenance ; pas de création réelle de tâches.',
    steps: [
      {icon:'edit', title:'Structurer les notes', detail:'Format documenté', status:'Simulation : notes fictives au format ACTION et DECISION.'},
      {icon:'filter', title:'Séparer les éléments', detail:'Décisions / actions', status:'Simulation : extraction déterministe des décisions et des actions.'},
      {icon:'table', title:'Préparer les tâches', detail:'Qui · quoi · quand', status:'Simulation : chaque action devient une proposition structurée.'},
      {icon:'alert', title:'Signaler les inconnues', detail:'Champs à compléter', status:'Simulation : responsables et dates manquants restent visibles.'},
      {icon:'check', title:'Valider ensemble', detail:'Avant création réelle', status:'Actions illustratives prêtes à vérifier. Aucune tâche externe créée.'},
    ],
  },
};

export const briefExamples = {
  website: {
    request: 'Bonjour, je voudrais refaire le site de mon cabinet de kinésithérapie. Il faudrait présenter les soins et faciliter la prise de contact sur mobile. Je dispose d’environ 2 000 €. Je souhaite conserver mon nom de domaine et pouvoir changer les textes moi-même.',
    fields: {objective:'Faciliter la découverte du cabinet et la prise de contact sur mobile.',deliverables:'Site du cabinet, présentation des soins, parcours de contact adapté au mobile.',budget:'Environ 2 000 €',deadline:'',constraints:'Conserver le nom de domaine ; permettre la modification des textes.'},
    questions:['Quelle est la date souhaitée de mise en ligne ?','Qui fournira et validera les contenus ?','Quel outil de contact ou de rendez-vous faut-il intégrer ?'],
  },
  automation: {
    request: 'Nos demandes arrivent par email et formulaire. On les recopie dans un tableau et certaines restent sans réponse. Je voudrais centraliser le suivi avant la fin du trimestre. Il faudra garder une validation avant toute réponse envoyée au client.',
    fields:{objective:'Centraliser les demandes entrantes et rendre leur suivi visible.',deliverables:'Liste de demandes structurées, statuts de traitement, brouillons de réponse à valider.',budget:'',deadline:'Avant la fin du trimestre (date exacte à confirmer)',constraints:'Conserver une validation humaine avant toute réponse au client.'},
    questions:['Quel budget et quel volume de demandes faut-il prévoir ?','Quels outils sont déjà utilisés et accessibles ?','Qui sera responsable de la validation et du suivi ?'],
  },
  incomplete: {
    request:'Bonjour, nous aimerions mettre un peu d’IA dans notre entreprise. Vous pourriez nous aider ? Il faudrait quelque chose de simple pour l’équipe.',
    fields:{objective:'Identifier un premier besoin métier pour lequel un outil pourrait être utile.',deliverables:'',budget:'',deadline:'',constraints:'La solution doit rester simple à prendre en main.'},
    questions:['Quel problème concret l’équipe cherche-t-elle à résoudre ?','Qui utilisera la solution et avec quels outils ?','Quels livrables, budget et délai sont envisagés ?'],
  },
};

export const iconPaths = {
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
  search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  filter:'<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
  table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M3 15h18"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  edit:'<path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5"/>',
  alert:'<path d="M12 3 2 21h20Z"/><path d="M12 9v5M12 17v1"/>',
};
