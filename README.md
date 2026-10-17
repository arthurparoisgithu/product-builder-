# Arthur Parois — Chef de Projet IA & No-Code

Portfolio entreprises en français, préparé pour `arthurparoisgithu/product-builder-`. Le dossier `new-repository` a été consulté en lecture seule : aucun de ses fichiers ni paramètres n’est modifié.

## Lancer le dossier

Node.js 20 ou plus récent suffit. Aucune dépendance à installer.

```sh
npm start
```

Le serveur écoute sur `0.0.0.0:3000` et ne sert que le dossier `site/`. Les pages statiques peuvent aussi être servies par un hébergement classique. Les chemins d’assets sont relatifs, pour fonctionner sous un sous-répertoire GitHub Pages.

```sh
npm test
```

Les tests vérifient les calculs, les exports, la structure des modèles n8n et la logique de leurs nœuds Code sur des données fictives. Ils ne remplacent pas l’import et la validation dans une instance n8n réelle.

## Organisation

`site/index.html` contient la structure et le copywriting. `site/styles.css` définit le design responsive, le focus clavier et la réduction des animations. `site/js/data.js` contient les scénarios, hypothèses et exemples fictifs. `site/js/logic.js` porte les calculs et l’export Markdown. `site/js/app.js` gère les interactions, les onglets, les animations et la validation. `site/workflows/` contient les trois modèles n8n et leur guide. `tests/` contient les tests Node natifs. `server.mjs` assure la prévisualisation ; aucune API métier n’est exposée.

## Ce qui fonctionne et ce qui est simulé

Les trois workflows du site sont des simulations de processus. Aucun clic sur « Simuler » n’appelle n8n, un CRM ou une messagerie. Les modèles JSON peuvent être importés dans n8n ; ils sont désactivés et doivent être adaptés et testés dans l’environnement cible. Le modèle de prospection appelle une source publique uniquement lorsqu’une personne l’exécute manuellement dans n8n. Il récupère au maximum 25 résultats, sans pagination, enrichissement d’emails ni contact commercial. Les deux autres modèles utilisent des jeux fictifs et préparent des sorties sans écriture externe.

BriefOps charge des extractions prédéfinies pour trois messages fictifs. La modification, la validation humaine et l’export Markdown fonctionnent réellement. Il n’y a pas d’IA en direct. Un changement de champ annule la validation et verrouille l’export. Les budgets et échéances absents restent explicitement à clarifier. Aucune donnée n’est conservée après rechargement et aucune donnée métier n’est envoyée au serveur.

Les gains sont des projections configurables : `volume × (minutes manuelles − minutes avec outil) / 60`. Les valeurs par défaut ne proviennent pas de mesures chez un client. Les hypothèses et exclusions sont visibles. Un scénario plus lent affiche un surcoût de temps au lieu de prétendre à une économie.

## Réalisations et sources

Les informations de parcours et les projets viennent du [dossier public d’Arthur](https://arthurparoisgithu.github.io/new-repository/). Le workflow d’audit est présenté comme une réalisation personnelle décrite dans ce dossier ; le rejeu source n’est pas une exécution réseau en direct. WebReset est explicitement personnel/fictif. Le site de kinésithérapie est une réalisation pour un proche ; aucun résultat de conversion n’est revendiqué. AnimApp est un projet personnel, distinct de la démo BriefOps créée ici.

Les captures `n8n-workflow.jpg` et `animapp.jpg` ont été copiées depuis les assets du dossier public ; `kine-site.jpg` est une capture réelle de la page d’accueil du site du cabinet (l’ancienne photo `kine.jpg`, issue d’une banque d’images filigranée, n’est plus affichée). Aucune photo de portrait n’est affichée : un avatar stylisé « AP » la remplace en attendant une vraie photo. La typographie DM Sans / DM Serif Display est chargée depuis Google Fonts, avec des polices de secours locales. Les schémas et icônes sont rendus de façon déterministe en HTML/CSS/SVG. Les logos d’outils (n8n, Make, Airtable, Notion, Claude, GitHub) proviennent de Simple Icons (CC0) et sont intégrés en sprite SVG inline au début de `index.html`.

La documentation officielle de l’[API Recherche d’entreprises](https://recherche-entreprises.api.gouv.fr/docs/) et du [nœud HTTP Request n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) guide le modèle de prospection.

## GitHub et mise en ligne

Le dépôt GitHub désigné par l’utilisateur est `arthurparoisgithu/product-builder-` (tiret final). La copie livrée du code se trouve dans ce dépôt ; l’aperçu de développement est géré séparément. Aucun changement de dépôt canonique de l’aperçu n’est effectué et aucun nouveau dépôt utilisateur n’est créé.

La préparation du code ne vaut pas publication. GitHub Pages n’est pas activé par ce travail et aucune action de déploiement automatique n’est ajoutée. Pour une publication ultérieure, servir `site/` comme racine statique, ou utiliser l’entrée `index.html` du dépôt qui redirige vers `site/`. Confirmer le type de contrat recherché et les derniers textes personnels avant diffusion publique.

Ne pas placer de clés API dans les fichiers du site ou dans GitHub. Une future connexion IA réelle devra passer par un service sécurisé côté serveur ; le site actuel n’en a pas besoin.

## Structure du site (V2)

1. **Hero** : nom, titre « Chef de Projet IA & No-Code », formation Oreegami (RNCP 40677, niveau 6), disponibilité en alternance dès 2027, CTA email + téléphone, carte de profil avec avatar et logos d’outils.
2. **Ce que je fais** : trois cartes (automatiser, construire l’outil utile, traduire l’IA pour les équipes non techniques).
3. **Preuves** : workflow n8n à quatre agents, BriefOps (aperçu), site du cabinet de kiné, AnimApp ; puis la section **Workflows concrets** (`#workflows`) : trois scénarios d’automatisation génériques et statiques (devis entrant, onboarding d’un collaborateur, avis Google), chacun en six étapes avec point de contrôle humain. Les anciennes démos interactives BriefOps et simulateurs de gain n8n ont été retirées de la page ; `js/data.js`, `js/logic.js` et `site/workflows/` restent dans le dépôt.
4. **Profil** : parcours, formation Oreegami (chiffres communiqués par l’école), engagement au VLIPP, outils.
5. **Contact** : bandeau CTA email + téléphone.

## Vidéo de présentation

La vidéo `site/assets/video/promo-30s.mp4` (générée avec l’IA) n’est plus affichée sur le site : le fichier reste dans le dépôt en attendant une vidéo face caméra d’Arthur. Pour l’intégrer, ajouter une section `<video>` dans `site/index.html`.
