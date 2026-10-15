# Modèles n8n — portfolio entreprises

## Statut

Ces fichiers sont des **modèles préparés, non testés dans une instance n8n**. Ils sont tous inactifs, ne comportent aucun credential et ne contiennent aucun nœud d’envoi de message, de création de tâche ou d’écriture CRM.

## Import et essai prudent

1. Dans n8n, importer le fichier JSON voulu.
2. Vérifier les nœuds, critères et textes dans l’éditeur.
3. Lancer uniquement une **exécution manuelle** (par exemple avec *Test workflow*).
4. Examiner les sorties avant de brancher un stockage ou un CRM.

Aucune automatisation de production n’est active dans ces modèles.

## Modèles

| Fichier | Usage | Comportement à l’exécution |
|---|---|---|
| `prospect-research.json` | Recherche encadrée d’établissements publics | C’est le seul modèle qui appelle un service externe : l’API publique Recherche d’entreprises, et seulement lors d’une exécution manuelle. Il demande `code_postal=44000`, `activite_principale=62.01Z`, `etat_administratif=A` et `per_page=25`. Il déduplique les SIREN et sélectionne l’établissement dans `matching_etablissements`, sans supposer que le siège est à Nantes. |
| `follow-up-drafts.json` | Préparer des brouillons de suivi | Utilise exclusivement un dataset fictif. Les refus, réponses, dossiers clôturés et oppositions sont exclus ; la sortie est un brouillon à valider, jamais envoyé. |
| `meeting-actions.json` | Préparer des propositions d’actions et de décisions | Utilise exclusivement des notes fictives structurées. Aucune IA en direct et aucune tâche réelle ne sont créées. Les champs manquants sont marqués **à compléter**. |

## Adaptation après tests

- Adapter les critères du modèle de prospection avant chaque lancement manuel.
- Connecter un stockage ou un CRM uniquement après des essais contrôlés et une revue des sorties.
- Pour les brouillons de suivi et les réunions, remplacer les datasets fictifs par les connecteurs nécessaires au contexte ; conserver une validation humaine avant tout envoi ou création.
- Les données de prospection restent limitées aux données publiques exposées par le service. Le modèle n’invente aucune adresse e-mail et ne réalise pas d’enrichissement réseau supplémentaire.

> Un contrôle juridique de l’usage des données reste à effectuer selon le contexte (finalité, information, conservation, droits d’opposition, etc.). Ces modèles ne constituent pas une affirmation de conformité.
