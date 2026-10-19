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

La section **Vidéo** (`#video`, juste avant le bandeau contact) affiche `site/assets/video/promo-60s.mp4` (nom de fichier conservé) : une animation de 90 secondes en 1080p/60 i/s, aux couleurs et typographies du site, avec une musique originale. Elle pitche le problème (le travail répétitif et son coût), les trois workflows (commercial, marketing, RH), le principe « l’outil prépare, l’humain décide », la méthode, le profil et le contact. Tout le message passe par le texte à l’écran, donc elle reste compréhensible sans le son. Chaque slide marque une pause une fois construite pour laisser le temps de lire. `promo-poster.jpg` sert d’image d’aperçu avant lecture. Ce n’est pas une vidéo face caméra ; si Arthur en tourne une plus tard, elle peut remplacer ce fichier ou s’ajouter à côté.

Passe motion design (v2) : révélations de texte masquées (wipe) plutôt que simples fondus, easing avec léger rebond (overshoot) sur les pop-ins, montage à rythme croissant pendant la partie « agitation » (coupes de plus en plus courtes), zoom caméra continu, grain filmique et vignette en overlay.

Passe v3 : inspirée des principes documentés dans un dépôt public de méthode « motion design avec Claude Code » (script en 6 temps, lisibilité sans son, point focal unique, rythme soutenu, pivot en noir, carte de clôture avec un bouton cliqué) — sans accès possible à la vidéo YouTube elle-même pour cette session. Le flash coloré du pivot est remplacé par un vrai temps de noir total, les particules sont atténuées pendant les moments de lecture de texte, et la carte de fin montre un curseur qui vient cliquer sur le bouton Calendly plutôt qu’un CTA statique.

Passe v4 (actuelle, 60s) : nouveau langage visuel qui emprunte les codes de la finance (graphique boursier qui s’arrache à la hausse, bougies qui passent du rouge au vert, bandeau ticker défilant) croisés avec ceux d’un terminal de développeur (fenêtre type macOS, commandes tapées caractère par caractère, curseur clignotant), sur la palette de l’app Claude Code (fond mat charcoal/taupe, accent terracotta, vert de croissance). Structure étendue avec un bloc dédié « Ce que vous gagnez » entre la solution et les chiffres, pour nommer explicitement le bénéfice plutôt que de le laisser implicite. Rendu : capture temps réel recalée au ratio mesuré sur l’enregistrement (`setpts`), puis découpe en deux passes pour exclure le flash blanc de chargement des polices en tout début de clip. 1280×720, 25 fps, 60.000 s pile, sans son.
