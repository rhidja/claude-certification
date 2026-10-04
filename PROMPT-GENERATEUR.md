# Prompt : générer une application d'apprentissage

Ce prompt sert à créer une application du même genre qu'**AWS Ready** ou **PASS Maths & Biostats** ou **Chimie PASS Médecine**pour un autre sujet : une autre certification (Azure, GCP, Kubernetes, Scrum…), un langage, une matière scolaire, le code de la route, etc.

**Utilisation :**

1. Crée un dossier vide et ouvre-le avec Claude Code.
2. Remplis la section « Paramètres » ci-dessous.
3. *(Optionnel mais recommandé)* Fournis ton **programme détaillé** d'une de ces deux façons :
   - colle-le dans la section « Programme détaillé » à la fin du prompt ;
   - ou dépose-le dans le dossier (ex. `programme.md`, `.txt`, ou le PDF du guide d'examen officiel) et indique son nom dans les paramètres.
4. Copie tout ce qui se trouve entre les deux lignes `=====` et colle-le dans Claude Code.

Le programme détaillé peut être le plan officiel de l'examen, le syllabus d'un cours, ou ta propre liste de notions. Tant qu'il est découpé en domaines, puis en objectifs, avec les notions de chaque objectif, l'IA s'en sert comme référence unique. Le format conseillé est décrit à la fin du prompt, mais un copier-coller brut fonctionne aussi.

Sans programme, l'IA en rédige un et te le soumet avant de produire le contenu. Pour une certification officielle sans programme, indique au moins ses domaines et leur pondération tels qu'ils figurent dans le guide d'examen. Si tu ne les connais pas, laisse le champ vide : l'IA les proposera et te demandera de les valider.

=====

Crée dans ce dossier une application web d'apprentissage selon le cahier des charges suivant.

## Paramètres

* **Sujet** : Claude Certified Architect – Foundations (CCAR-F) — concevoir des applications de production avec Claude : Claude Agent SDK, API Claude, Claude Code et Model Context Protocol (MCP).

* **Examen ou objectif visé** : réussir l’examen officiel **Claude Certified Architect – Foundations** (code CCAR-F) du Claude Certification Program d’Anthropic, selon le guide d’examen version 1.0 (juillet 2026).

* **Nom de l'application** : Architect Foundations — Préparation CCAR-F

* **Langue du contenu et de l'interface** : français. Les termes techniques (`stop_reason`, `tool_choice`, `.mcp.json`, `context: fork`…) restent en anglais, tels qu’ils apparaissent dans le guide.

* **Public** : architecte de solutions ou développeur senior qui conçoit et met en production des applications avec Claude (environ 6 mois d’expérience pratique de l’API Claude, de l’Agent SDK, de Claude Code et du MCP).

* **Domaines et pondération** (blueprint officiel) :

  1. Architecture agentique et orchestration — 27 %
  2. Conception d’outils et intégration MCP — 18 %
  3. Configuration et workflows Claude Code — 20 %
  4. Prompt engineering et sortie structurée — 20 %
  5. Gestion du contexte et fiabilité — 15 %

* **Format de l'examen réel** (connu avec certitude, section 3 du guide) : 60 questions à choix unique ou à réponses multiples (chaque question indique combien de réponses choisir), 120 minutes, **4 scénarios tirés au hasard parmi 6**, examen surveillé, score de 100 à 1 000, **réussite à 720**. L’examen blanc reproduit ce format : 60 questions, 120 minutes, 4 scénarios tirés parmi 6, score estimé sur 100–1 000 par la formule linéaire `100 + 900 × taux de bonnes réponses`, seuil 720, présenté comme une **estimation** (le vrai score est mis à l’échelle par Anthropic). Répartition (`examCount`) proportionnelle à la pondération : 16 / 11 / 12 / 12 / 9.

* **Volume visé** : 30 cours (un par objectif) + 300 questions + 30 exercices pratiques (un par objectif) + 6 missions (une par scénario d’examen) + 4 projets (les 4 exercices de préparation de la section 8 du guide).

* **Formules mathématiques** : non

* **Application installable** : oui

* **Couleur principale** : charte graphique de Claude (orange terre cuite `#d97757` sur fond crème `#faf9f5`, texte `#141413`), voir la section « Design »

* **Programme détaillé** : voir le fichier `programme-ccar-f.md` (traduction fidèle du blueprint du guide d’examen : domaines, scénarios, 30 objectifs avec notions clés, connaissances et compétences, technologies, sujets hors programme, exercices de préparation). Guide original : https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf

* **Respect du programme** : **strict pour les questions** (aucune question sur un sujet de la liste « Hors programme » du guide, ni sur une notion absente du programme) ; compléments autorisés dans les cours, étiquetés « Hors programme » (`extra: true`). Chaque notion est identifiée comme « essentiel », « avancé » ou « complément ». L’application est une **préparation indépendante** : elle ne doit jamais se présenter comme officielle ni reproduire les questions d’exemple du guide. L’en-tête, le pied de page et le README indiquent « Préparation indépendante et non officielle, non affiliée à Anthropic. Claude Certified Architect est une certification d’Anthropic ; seuls l’examen officiel et son guide font foi. »


## Plan de couverture validé

Plan calculé à partir du programme détaillé et **validé** : ne le soumets pas à nouveau, passe directement à la production du contenu. Les questions de chaque domaine sont proportionnelles à la pondération (300 au total), puis réparties entre objectifs selon le nombre de connaissances et compétences. Module Cn = objectif n dans l’ordre du programme.

| Obj. | Intitulé | Module | Q |
|---|---|---|---|
| **D1 Architecture agentique et orchestration — 27 %** ||| **81** |
| 1.1 | Concevoir et implémenter des boucles agentiques | C1 | 12 |
| 1.2 | Orchestrer des systèmes multi-agents coordinateur / sous-agents | C2 | 13 |
| 1.3 | Configurer l’invocation des sous-agents, le passage de contexte et leur lancement | C3 | 12 |
| 1.4 | Workflows multi-étapes avec contrôle et transmission | C4 | 12 |
| 1.5 | Hooks de l’Agent SDK : interception et normalisation | C5 | 11 |
| 1.6 | Stratégies de décomposition des workflows complexes | C6 | 11 |
| 1.7 | État des sessions, reprise et dérivation | C7 | 10 |
| **D2 Conception d’outils et intégration MCP — 18 %** ||| **54** |
| 2.1 | Interfaces d’outils : descriptions et limites claires | C8 | 12 |
| 2.2 | Réponses d’erreur structurées pour les outils MCP | C9 | 11 |
| 2.3 | Répartition des outils entre agents et `tool_choice` | C10 | 11 |
| 2.4 | Intégrer des serveurs MCP dans Claude Code et les agents | C11 | 11 |
| 2.5 | Outils intégrés (Read, Write, Edit, Bash, Grep, Glob) | C12 | 9 |
| **D3 Configuration et workflows Claude Code — 20 %** ||| **60** |
| 3.1 | Hiérarchie, portée et organisation des CLAUDE.md | C13 | 11 |
| 3.2 | Commandes slash et skills personnalisés | C14 | 11 |
| 3.3 | Règles par chemin et chargement conditionnel | C15 | 9 |
| 3.4 | Plan mode ou exécution directe | C16 | 10 |
| 3.5 | Raffinement itératif | C17 | 9 |
| 3.6 | Claude Code dans les pipelines CI/CD | C18 | 10 |
| **D4 Prompt engineering et sortie structurée — 20 %** ||| **60** |
| 4.1 | Critères explicites, précision et faux positifs | C19 | 10 |
| 4.2 | Few-shot prompting | C20 | 10 |
| 4.3 | Sortie structurée par tool use et schémas JSON | C21 | 12 |
| 4.4 | Validation, nouvelle tentative et boucles de retour | C22 | 10 |
| 4.5 | Traitement par lots (Message Batches API) | C23 | 9 |
| 4.6 | Revue multi-instances et multi-passes | C24 | 9 |
| **D5 Gestion du contexte et fiabilité — 15 %** ||| **45** |
| 5.1 | Préserver l’information critique dans les longues interactions | C25 | 9 |
| 5.2 | Escalade et résolution des ambiguïtés | C26 | 9 |
| 5.3 | Propagation des erreurs dans les systèmes multi-agents | C27 | 7 |
| 5.4 | Contexte et exploration d’une grande base de code | C28 | 7 |
| 5.5 | Revue humaine et calibration de la confiance | C29 | 7 |
| 5.6 | Provenance de l’information et incertitude | C30 | 6 |

**Scénarios** (`data/scenarios.js`) : les 6 scénarios du guide (S1 à S6, voir `programme-ccar-f.md`). Chaque question est rattachée à un scénario (`s`) cohérent avec les domaines principaux de ce scénario, et son énoncé est une mise en situation dans ce contexte. Viser au moins 40 questions par scénario.

**Pratique** (`data/practice.js`) : 30 exercices (un par objectif), 6 missions (une par scénario, réalisées avec l’API, l’Agent SDK ou Claude Code) et 4 projets reprenant les 4 exercices de préparation de la section 8 du guide.

**Exactitude** : le guide d’examen fait foi pour le contenu évalué (noms d’options, de champs et de fichiers : `fork_session`, `--json-schema`, `.claude/rules/` avec `paths`, `context: fork`, outil Task, `allowedTools`, `isError`…). N’invente aucun chiffre, aucune option ni aucun comportement absent du guide ou de la documentation officielle. Si la documentation actuelle diffère du guide (un outil renommé, par exemple), enseigne la version du guide et signale l’écart dans une section « complément » du cours.


## Avant de coder

1. **Si un programme détaillé est fourni**, lis-le en entier. S'il s'agit d'un fichier, lis toutes ses pages.
   - Il fait foi : les domaines, pondérations, objectifs et notions viennent de lui, et remplacent les paramètres « Domaines et pondération » s'ils se contredisent.
   - Garde les intitulés et la numérotation du programme. N'en reformule que l'orthographe ou la mise en forme.
   - S'il est ambigu, incomplet ou incohérent (pondérations dont la somme ne fait pas 100 %, objectif sans notion, domaine vide), liste-moi les problèmes et propose une correction avant de continuer.
2. **Si aucun programme n'est fourni**, rédige-en un au même format, réaliste et fidèle à l'examen visé, et soumets-le-moi.
3. Si d'autres paramètres sont vides ou imprécis (format d'examen, volume), propose des valeurs réalistes.
4. Présente ensuite un **plan de couverture** et attends ma validation avant de produire le contenu. Le plan prend la forme d'un tableau avec une ligne par objectif : identifiant, intitulé, module(s) de cours qui le traitent, nombre de questions prévues.
   - Le nombre de questions par domaine est proportionnel à la pondération.
   - Au sein d'un domaine, il est réparti entre les objectifs selon le nombre et l'importance de leurs notions.

## Contraintes techniques

- Site 100 % statique : HTML, CSS et JavaScript natif. Aucun framework, aucun build, aucune dépendance npm. On l'ouvre en double-cliquant sur `index.html`, y compris en `file://`.
- Seule ressource externe chargée depuis Internet : une police Google Fonts, avec des polices de repli.
- Si « Formules mathématiques » vaut oui : KaTeX (version 0.16 ou plus récente) est **copié dans `vendor/katex/`** (`katex.min.js`, `katex.min.css`, `auto-render.min.js`, polices `.woff2`, `LICENSE`), jamais chargé depuis un CDN, pour que l'application reste utilisable hors ligne et en `file://`. C'est la seule bibliothèque tierce autorisée.
- Si « Application installable » vaut oui : voir la section « Application installable (PWA) ». L'application doit continuer à fonctionner à l'identique en `file://`, sans service worker.
- Code lisible et commenté avec parcimonie, pas de code minifié.
- La progression est sauvegardée dans `localStorage` sous une clé versionnée (ex. `nom-app-v1`). Chaque accès doit être entouré d'un `try/catch` : l'application doit fonctionner même si le stockage est indisponible.
- Tout texte venant des données et affiché dans une question doit être échappé avant insertion en HTML.

## Structure des fichiers

```
index.html
style.css
app.js              ← logique uniquement, aucun contenu pédagogique
data/domains.js     ← domaines
data/programme.js   ← objectifs du programme détaillé
data/courses.js     ← cours
data/questions.js   ← banque de questions
data/practice.js    ← exercices, missions et projets pratiques
data/scenarios.js   ← scénarios d’examen (si l’examen est organisé en scénarios)
README.md
vendor/katex/       ← si formules : KaTeX et ses polices
manifest.webmanifest, sw.js, icons/   ← si PWA
```

Les fichiers de `data/` sont chargés par des balises `<script>` classiques, avant `app.js`, et déclarent des constantes globales. Utilise des chaînes entre guillemets doubles et l'apostrophe typographique ’ dans les textes, pour éviter les problèmes d'échappement.

### Formats de données

```js
// data/domains.js
// examCount : nombre de questions tirées dans ce domaine pour un examen blanc.
const DOMAINS = [
  { id: 1, name: "Nom du domaine", weight: 25, examCount: 11 }
];

// data/programme.js
// Un objectif par entrée, avec l'identifiant et l'intitulé du programme.
// notions : notions à maîtriser, reprises du programme.
const OBJECTIVES = [
  { id: "1.1", d: 1, title: "Intitulé de l’objectif", notions: ["Notion A", "Notion B"] }
];

// data/courses.js
// d = id du domaine, o = objectifs traités par le module.
// Les textes de cours peuvent contenir du <b> pour les notions clés.
const COURSES = [
  {
    d: 1,
    o: ["1.1", "1.2"],
    title: "Titre du module",
    summary: "Une phrase de résumé.",
    sections: [
      { h: "Sous-titre", p: "Paragraphe explicatif." },
      { h: "Points clés", points: ["<b>Notion</b> : définition.", "…"] }
    ]
  }
];

// data/questions.js
// o = objectif évalué par la question ; s = scénario de la question (si scénarios).
// c = index de la bonne réponse, ou tableau d'index pour une question à réponses multiples.
const QUESTIONS = [
  { d: 1, o: "1.1", s: "S1", q: "Énoncé ?", a: ["A", "B", "C", "D"], c: 2, e: "Explication." },
  { d: 2, o: "2.3", s: "S3", q: "Énoncé ? (Choisissez 2 réponses)", a: ["A", "B", "C", "D", "E"], c: [0, 3], e: "Explication." }
];

// data/scenarios.js (si l’examen est organisé en scénarios)
// d = domaines principaux du scénario ; context = mise en situation affichée au-dessus des questions.
const SCENARIOS = [
  { id: "S1", title: "Titre du scénario", d: [1, 2, 5], context: "Mise en situation commune à toutes les questions du scénario." }
];
```

```js
// data/practice.js
// type : "exercice" | "mission" | "projet" ; level : "essentiel" | "avancé" | "complément".
// minutes : durée conseillée (chronomètre). steps : étapes ; criteria : critères de réussite auto-évalués.
// prompt : exemple de prompt à donner à Claude Code ; solution : démarche corrigée (affichée à la demande).
const PRACTICE = [
  {
    id: "ex-1-1", type: "exercice", d: 1, o: ["1.3"], level: "essentiel", minutes: 15,
    title: "Titre", context: "Mise en situation.",
    steps: ["Étape 1", "Étape 2"],
    prompt: "Exemple de prompt.",
    criteria: ["Critère vérifiable 1", "Critère vérifiable 2"],
    solution: "Démarche corrigée, pièges à éviter."
  }
];
```

Le domaine d'une fiche pratique doit correspondre au domaine de ses objectifs (pour une mission ou un projet transversal, `d` est le domaine principal). Les identifiants `id` des fiches sont stables et servent de clé de progression.

Le domaine d'un cours ou d'une question doit correspondre au domaine de ses objectifs. En mode « compléments autorisés », une section de cours hors programme porte `extra: true` et s'affiche avec une étiquette « Hors programme ».

L'identifiant de chaque question est calculé dans `app.js` par un hachage de son énoncé. Ajouter ou réordonner des questions ne casse donc pas la progression enregistrée.

### Formules mathématiques (si activées)

- Toute formule, dans les cours, le programme, les énoncés, les réponses et les explications, s'écrit en LaTeX entre `\\(` et `\\)` dans les chaînes JavaScript (barre oblique inverse doublée). Pas d'affichage en bloc `$$` : uniquement des formules en ligne.
  ```js
  { d: 4, o: "4.2", q: "Que vaut \\(P(A \\mid B)\\) si \\(P(A \\cap B) = 0{,}12\\) ?", … }
  ```
- Conventions françaises : virgule décimale `0{,}5` (sans accolades, LaTeX ajoute une espace), pourcentage dans une formule `5\\,\\%`. Les nombres et pourcentages isolés restent en texte courant.
- Notations : contraire `\\overline{A}`, moyenne `\\bar{x}`, indices et exposants en LaTeX. Pas de caractères Unicode combinants (M̄) ni de surlignement CSS pour simuler une notation.
- Dans `app.js`, une fonction `math(el)` appelle `renderMathInElement` (délimiteurs `\\(` `\\)`, `throwOnError: false`) après chaque rendu d'une vue ou d'une question. Elle ne fait rien si KaTeX n'est pas chargé. Une formule invalide s'affiche en rouge au lieu de bloquer la page.
- L'échappement HTML des textes se fait avant le rendu KaTeX ; il ne doit pas altérer les délimiteurs ni les commandes LaTeX.
- Les formules longues ne doivent pas provoquer de défilement horizontal de la page sur mobile.

## Exigences sur le contenu

- Contenu exact et à jour. N'invente jamais de service, de commande, de chiffre ou de règle. En cas de doute sur une information, ne l'utilise pas plutôt que de risquer une erreur.
- Si le format officiel de l'examen (nombre de questions, durée, barème) n'est pas connu avec certitude, l'examen blanc est présenté partout comme une **simulation interne** (« format non officiel »), avec un renvoi aux modalités officielles.
- **Cours** : chaque module a 2 à 5 sections. On y trouve des définitions claires, des exemples concrets, les pièges classiques et les distinctions souvent testées (ex. « A vs B »).
- **Questions** :
  - Respecte le style de l'examen réel : questions de connaissance directe, mais surtout des mises en situation (« Une entreprise veut… Quelle solution choisir ? »).
  - 4 réponses par question, 5 pour les questions à réponses multiples. Les mauvaises réponses doivent être plausibles et réelles, pas absurdes.
  - Environ 8 % de questions à réponses multiples, avec « (Choisissez N réponses) » dans l'énoncé.
  - L'explication dit pourquoi la bonne réponse est juste et, si utile, pourquoi un piège fréquent est faux. Pour une question de calcul, elle détaille le calcul.
  - Aucune mauvaise réponse ne doit être elle aussi juste : pour chaque question de calcul, refais le calcul et vérifie que seule la bonne réponse donne le résultat (attention aux valeurs équivalentes écrites autrement : 0,5 et 1/2, 10⁻² et 0,01).
  - Aucun doublon d'énoncé. Chaque domaine contient au moins 2 fois `examCount` questions, pour que les examens blancs varient.
- **Couverture du programme** :
  - chaque objectif est traité par au moins un module de cours ;
  - chaque objectif est évalué par au moins 3 questions, davantage pour les objectifs riches ;
  - chaque notion listée dans le programme est expliquée dans un cours et testée par au moins une question ;
  - en mode « strict », aucune question ne porte sur une notion absente du programme.

## Fonctionnalités

Navigation par onglets : **Programme**, **Cours**, **Entraînement**, **Examen blanc**, **Pratique**, **Progression**. Si aucun examen officiel n’est visé, l’onglet « Examen blanc » s’appelle « Évaluation » et se présente comme une simulation interne, non officielle. Un bouton « Réinitialiser » dans l'en-tête efface toute la progression, après confirmation. Si l'application est installable, un bouton « Installer l’app » apparaît à côté (voir plus bas).

### 1. Programme
- Le programme complet, par domaine (numéro, nom, pondération), puis par objectif (identifiant, intitulé, liste des notions).
- Pour chaque objectif :
  - les modules de cours qui le traitent, sous forme de liens qui ouvrent le module ;
  - une pastille d'état : « À découvrir » (rien fait), « En cours » (cours lu ou questions commencées), « Maîtrisé » (au moins 80 % de bonnes réponses sur au moins 3 questions de l'objectif) ;
  - la précision obtenue et le nombre de questions vues sur le total ;
  - un bouton « S’entraîner » qui ouvre l'entraînement filtré sur cet objectif.
- En haut, une barre de progression globale : nombre d'objectifs maîtrisés sur le total.
- Pour une révision en autonomie, une case à cocher « Je maîtrise » par objectif, enregistrée, qui s'ajoute à l'état calculé.

### 2. Cours
- Modules regroupés par domaine, avec un en-tête indiquant le numéro, le nom et la pondération du domaine.
- Chaque carte a un numéro, un résumé, les identifiants des objectifs traités (ex. « 1.1 · 1.2 »), et le badge « LU » si le module a été ouvert.
- Vue détaillée d'un module :
  - en haut, un rappel des objectifs du programme couverts par le module ;
  - en bas, trois boutons : « ← Tous les cours », « S’entraîner sur ces objectifs » (qui ouvre l'entraînement filtré) et « Module suivant ».

### 3. Entraînement
- Trois compteurs : questions différentes répondues, précision, série de bonnes réponses en cours.
- Filtres avec leur nombre de questions : Toutes, Jamais répondues, Erreurs à revoir, puis un filtre par domaine. Un filtre par objectif est accessible depuis les onglets Programme et Cours, et s'affiche comme filtre actif avec un bouton pour le retirer.
- Chaque question affiche l'identifiant et l'intitulé de l'objectif évalué.
- Ordre des questions et des réponses mélangé. Les lettres A, B, C… suivent l'ordre affiché.
- **Question à une réponse** : le clic valide immédiatement.
- **Question à réponses multiples** : on sélectionne le nombre de réponses demandé, puis on clique sur « Valider ».
- Après la réponse :
  - bonnes réponses en vert, mauvaise réponse choisie en rouge brique (`--error`) ;
  - encadré « Bonne réponse » ou « À revoir » avec la ou les lettres attendues et l'explication.
- Le résultat de chaque question (juste ou faux, dernière tentative) est enregistré.
- En fin de série, la liste est recalculée et mélangée à nouveau.
- Si « Erreurs à revoir » est vide, un message de félicitations s'affiche.
- Raccourcis clavier : touches A à E pour répondre, Entrée pour valider ou passer à la suite.

### 4. Examen blanc
*(Si aucun examen n'est visé, remplace-le par un « Défi » de 20 questions chronométré, sur le même principe.)*

- **Écran d'accueil** : règles de l'examen (nombre de questions, durée, répartition par domaine, seuil de réussite), bouton « Commencer », historique des examens passés.
- **Pendant l'examen** :
  - questions tirées selon `examCount` de chaque domaine, puis mélangées ;
  - si l’examen est organisé en scénarios : tirer au hasard le nombre de scénarios de l’examen réel, puis prendre les questions de chaque domaine parmi celles de ces scénarios (en complétant avec d’autres scénarios si un domaine n’en a pas assez) ; regrouper les questions par scénario et afficher la mise en situation du scénario au-dessus de chaque question ;
  - chronomètre décroissant, qui passe en `--error` sous 5 minutes ; l'examen se termine automatiquement à zéro ;
  - boutons Précédente et Suivante, et bouton « Marquer pour révision » ;
  - grille de numéros cliquables : répondue, marquée, question en cours ;
  - aucune correction affichée avant la fin ;
  - avant de terminer, une confirmation signale les questions sans réponse et les questions marquées ;
  - avertissement si on ferme l'onglet pendant l'examen.
- **Résultat** :
  - score sur l'échelle de l'examen réel (formule linéaire, présentée comme une estimation) ;
  - mention réussi ou non réussi ;
  - barres de résultat par domaine ;
  - liste des objectifs ratés (au moins une erreur), avec un lien vers le module de cours correspondant ;
  - liste repliable des erreurs, avec l'objectif évalué, les réponses choisies, la correction et l'explication.
- Les réponses données pendant l'examen alimentent aussi la progression et la liste « Erreurs à revoir ».
- Les 20 derniers examens sont enregistrés.

### 4 bis. Pratique
- Trois sections : **Exercices**, **Missions**, **Projets** (volumes fixés par le paramètre « Volume visé »), avec un compteur « terminés / total » pour chacune.
- Filtres : type, domaine, niveau (« essentiel », « avancé », « complément »), statut (à faire, en cours, terminé).
- Chaque carte affiche le type, le niveau, la durée conseillée, le domaine et les objectifs (« 1.3 · 2.1 »), et un badge « TERMINÉ ».
- Vue détaillée d’une fiche :
  - mise en situation, étapes numérotées, exemple de prompt dans un bloc de code avec un bouton « Copier » (repli silencieux si le presse-papiers est indisponible) ;
  - chronomètre facultatif (démarrer, pause, réinitialiser) sur la durée conseillée, qui passe en `--error` une fois dépassée, sans rien bloquer ;
  - liste de critères à cocher, enregistrée : la fiche est « en cours » dès un critère coché, « terminée » quand tous le sont ;
  - bouton « Voir la démarche corrigée », replié par défaut ;
  - liens vers les modules de cours des objectifs, et boutons « ← Toutes les fiches » et « Fiche suivante ».
- Un encadré rappelle que ces fiches se réalisent dans un vrai projet avec Claude Code, et que l’auto-évaluation doit porter sur la capacité à **piloter** l’outil (plan, contraintes, vérification du diff et des tests), pas seulement sur le résultat.

### 5. Progression
- Compteurs : objectifs maîtrisés, cours lus, questions vues, fiches pratiques terminées, meilleur score d'évaluation.
- Barres de précision par domaine : vertes à partir de 70 %, `--error` en dessous.
- Encadré « Priorité de révision » avec les 3 objectifs les plus faibles parmi ceux déjà travaillés, puis les objectifs jamais abordés. Chacun a un bouton pour s'entraîner dessus.
- Historique des examens (date, score, bonnes réponses, résultat).

### 6. Application installable (PWA)
*(Uniquement si « Application installable » vaut oui.)*

- `manifest.webmanifest` : `name`, `short_name` (12 caractères max.), `description`, `lang`, `id`, `start_url` et `scope` à `./` (chemins relatifs, pour fonctionner dans un sous-dossier), `display: standalone`, `background_color` et `theme_color` cohérents avec le design, catégories.
- Icônes dans `icons/` : `icon.svg` (favicon), `icon-192.png`, `icon-512.png`, `maskable-512.png` (motif dans la zone de sécurité centrale de 80 %), `apple-touch-icon.png` (180 px, fond opaque). Génère les PNG à partir du SVG avec un script (Python, ImageMagick ou Chromium sans interface).
- `index.html` : `theme-color`, métadonnées `apple-mobile-web-app-*`, `apple-touch-icon`. Le `<link rel="manifest">` n'est ajouté par script que hors `file://` (en `file://`, Chrome le refuse et affiche une erreur CORS).
- `sw.js` :
  - à l'installation, met en cache une liste `ASSETS` de **tous** les fichiers de l'application (HTML, CSS, JS, `data/`, icônes, KaTeX et chacune de ses polices) ;
  - fichiers de l'application en « réseau d'abord, cache en secours », pour qu'une mise à jour du contenu soit visible au prochain chargement en ligne ; navigation hors ligne vers `index.html` ;
  - polices Google en « cache d'abord », dans un cache séparé ;
  - à l'activation, suppression des anciens caches ; nom de cache versionné (`nom-app-v1`), à incrémenter quand la liste `ASSETS` change.
- `app.js` : enregistre `sw.js` seulement si `serviceWorker` est disponible et hors `file://`, sans erreur visible en cas d'échec. Intercepte `beforeinstallprompt` pour afficher le bouton « Installer l’app » (caché par défaut), le cache après installation (`appinstalled`).

## Design

- Style éditorial sobre et chaleureux, **inspiré de la charte graphique de Claude** :
  - fond crème légèrement texturé (grille de points très discrète en `--mid-gray` à faible opacité), cartes `#ffffff` ou `--light` à bordure fine `--light-gray`, coins arrondis modérés (8 à 12 px), ombres très légères ou absentes ;
  - beaucoup d'espace blanc, hiérarchie typographique marquée, pas de dégradés criards ni d'effets néon.
- **Palette** (variables CSS dans `:root`, noms imposés) :

  | Variable | Valeur | Usage |
  |---|---|---|
  | `--dark` | `#141413` | texte principal, en-tête, fonds sombres |
  | `--light` | `#faf9f5` | fond de page, texte sur fond sombre |
  | `--mid-gray` | `#b0aea5` | textes secondaires décoratifs, bordures marquées |
  | `--light-gray` | `#e8e6dc` | bordures fines, fonds de pastilles, barres vides |
  | `--orange` | `#d97757` | couleur principale : onglet actif, boutons principaux, barres de progression, liens |
  | `--blue` | `#6a9bcc` | couleur vive de la série en cours, informations |
  | `--green` | `#788c5d` | bonnes réponses, « Maîtrisé », barres ≥ 70 % |
  | `--error` | `#b5412e` | mauvaise réponse choisie, alertes, chronomètre < 5 min (complément hors charte, plus rouge que `--orange` pour ne pas être confondu avec la couleur principale) |

  - Contraste : `--orange`, `--green` et `--blue` n'atteignent pas 4,5:1 sur fond clair. Pour le **texte** coloré, définis des variantes foncées (`--orange-text`, `--green-text`, `--blue-text`) et vérifie un contraste ≥ 4,5:1. Sur un bouton `--orange`, le texte est `--dark` ou en gras ≥ 18,66 px en blanc.
- **Typographie** (Google Fonts, seule ressource externe) : titres en **Poppins** (500–600), texte en **Lora** (400, 600, italique), avec repli `Arial, sans-serif` pour les titres et `Georgia, serif` pour le texte. Les éléments d'interface compacts (onglets, boutons, compteurs, pastilles) peuvent utiliser Poppins. Le code et les commandes (`/init`, `claude -p`…) s'affichent en police monospace système (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`) sur fond `--light-gray`.
- **Mode sombre** : via `@media (prefers-color-scheme: dark)`, fond `--dark`, texte `--light`, cartes `#1f1e1d` à bordure `#3a3935` ; `--orange` reste la couleur principale.
- **Marque** : ne reproduis ni le logo de Claude ou d'Anthropic, ni leur symbole « étincelle » ; l'icône de l'application est un motif générique (ex. chevron de terminal `>_` en `--orange` sur fond `--dark`). Le pied de page et le README indiquent : « Application non officielle, non affiliée à Anthropic. Claude est une marque d’Anthropic. »
- En-tête de page : petit sur-titre en capitales espacées (Poppins, `--orange-text`), grand titre en trois temps (ex. « Apprendre. Répondre. Progresser. »), une phrase de présentation, et une ligne résumant le format de l'examen.
- Responsive jusqu'à 390 px de large :
  - aucun défilement horizontal de la page ;
  - onglets et filtres défilants sur une ligne ;
  - pendant l'examen, sur mobile, grille des questions sur une seule ligne défilante et chronomètre compact au-dessus de la question.
- Accessibilité : vrais `<button>` pour tout ce qui est cliquable, contrastes suffisants, attribut `lang` correct sur `<html>`.

## Vérifications avant de terminer

1. Charge les fichiers de `data/` avec Node et vérifie :
   - le nombre de cours et de questions par domaine ;
   - chaque domaine contient au moins `examCount` questions ;
   - chaque index de `c` est valide ;
   - aucun énoncé en double ;
   - chaque question a une explication ;
   - si formules : chaque `\(` a son `\)` dans chaque chaîne, et chaque formule se compile avec `katex.renderToString` (`throwOnError: true`) chargé depuis `vendor/katex/`.
2. Vérifie la couverture du programme avec un script Node et affiche un tableau (objectif, nombre de modules, nombre de questions) :
   - chaque `o` des cours et des questions existe dans `OBJECTIVES` ;
   - le domaine d'un cours ou d'une question correspond à celui de ses objectifs ;
   - chaque objectif a au moins un module et au moins 3 questions ;
   - aucun objectif du programme fourni ne manque dans `OBJECTIVES` ;
   - pour chaque notion, cherche sa présence (sans tenir compte de la casse) dans les textes des cours et des questions de son objectif ; liste les notions introuvables et vérifie-les une par une.
   - pour `PRACTICE` : `id` uniques, `type` et `level` valides, chaque `o` existe et correspond à `d`, `steps`, `criteria` et `solution` non vides, volumes par type conformes au paramètre « Volume visé » et répartition des exercices par domaine.
   - si scénarios : chaque `s` existe dans `SCENARIOS`, chaque scénario a assez de questions, et un examen blanc tiré au hasard (simulé 100 fois) respecte toujours `examCount` par domaine.
3. Lance `node --check app.js`.
4. Si Playwright ou Chromium est disponible, teste l'application dans un navigateur sans interface :
   - parcours chaque onglet ;
   - depuis l'onglet Programme, lance l'entraînement sur un objectif et vérifie que seules ses questions apparaissent ;
   - réponds à des questions simples et multiples ;
   - passe une évaluation jusqu'au résultat ;
   - dans l'onglet Pratique, ouvre une fiche, coche tous ses critères et vérifie qu'elle passe à « terminée » et que le compteur de l'onglet Progression est mis à jour ;
   - vérifie qu'aucune erreur n'apparaît dans la console ;
   - si formules : vérifie qu'aucun élément `.katex-error` n'apparaît et qu'aucun délimiteur `\(` brut ne reste visible dans les cours, le programme et un échantillon de questions ;
   - si PWA : sers le dossier en local (`python3 -m http.server`), vérifie que le service worker s'active, que le manifeste est chargé sans erreur, que chaque fichier de `ASSETS` répond 200 et que chaque fichier de l'application figure dans `ASSETS` ; recharge ensuite la page hors ligne et vérifie qu'elle s'affiche avec ses formules ; vérifie aussi qu'en `file://` l'application fonctionne sans erreur ;
   - fais des captures d'écran en 1280 px et en 390 px, et vérifie que `document.documentElement.scrollWidth` ne dépasse pas la largeur de l'écran.
5. Corrige ce qui ne va pas.
6. Rédige le `README.md` : utilisation, mention « non officiel, non affilié à Anthropic », tableau des domaines, tableau de couverture du programme (avec le renvoi vers la source de chaque objectif), tableau des scénarios si l’examen en comporte, liste des fiches pratiques, format des données pour ajouter du contenu. Si formules : conventions d'écriture LaTeX. Si PWA : installation sur Android, iPhone/iPad et ordinateur, publication sur un hébergement statique en https (GitHub Pages, Netlify…), test local, et procédure quand on ajoute ou supprime un fichier (mettre à jour `ASSETS` et incrémenter le cache).
7. Termine par :
   - un résumé de ce qui a été créé (volumes par domaine et par objectif) ;
   - les écarts éventuels avec le programme fourni ;
   - les points de contenu que je devrais vérifier moi-même.

## Programme détaillé

Voir le fichier **`programme-ccar-f.md`** à la racine du dossier. Lis-le en entier : il contient le format de l’examen, les 5 domaines et leur pondération, les 6 scénarios, les 30 objectifs (*task statements*) avec leurs notions clés, connaissances et compétences, l’annexe des technologies, la liste des sujets hors programme et les 4 exercices de préparation.

- Les `notions` de `data/programme.js` reprennent les **Notions clés** de chaque objectif.
- Les blocs **En pratique** (explications, exemples, pièges classiques) sont des compléments pédagogiques hors guide : utilise-les pour enrichir les cours et les explications des questions, mais ils ne définissent pas ce qui est évalué.
- Chaque connaissance et chaque compétence doit être expliquée dans le cours de l’objectif et testée par au moins une question.
- Aucun sujet de la liste « Hors programme » ne doit faire l’objet d’une question.

=====