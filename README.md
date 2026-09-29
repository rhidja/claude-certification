# Claude Code — Certification & Practice

Application web d’apprentissage **non officielle** pour apprendre à piloter Claude Code de façon professionnelle : explorer un projet, planifier, modifier, tester, déboguer, sécuriser et automatiser, notamment sur des projets PHP/Symfony.

> **Application non officielle, non affiliée à Anthropic, qui ne délivre aucune certification.** Claude est une marque d’Anthropic. L’onglet « Évaluation » est une simulation interne dont le format n’a rien d’officiel. Claude Code évolue vite : vérifiez les commandes et les options dans la documentation officielle.

## Utilisation

Il suffit de double-cliquer sur `index.html`. L’application fonctionne en `file://` : il n’y a ni installation, ni build, ni serveur. Seule la police (Google Fonts) est chargée depuis Internet ; hors ligne, des polices de repli prennent le relais.

| Onglet | Contenu |
|---|---|
| **Programme** | Les 31 objectifs rangés par domaine, avec leurs notions, leur état (À découvrir, En cours, Maîtrisé), leur précision, un bouton « S’entraîner » et une case « Je maîtrise » |
| **Cours** | 30 modules. Chaque section porte une étiquette : essentiel, avancé ou complément |
| **Entraînement** | Les QCM, filtrables (toutes, jamais répondues, erreurs à revoir, par domaine ou par objectif). Au clavier : touches A à E pour répondre, Entrée pour valider ou passer à la suite |
| **Évaluation** | 40 questions en 60 minutes, réussite à 70 %, tirées selon la pondération des domaines. On y trouve une grille de navigation, le marquage des questions à revoir, le résultat par domaine, la correction détaillée et l’historique des 20 dernières évaluations |
| **Pratique** | 50 exercices, 10 missions et 3 projets à réaliser dans un vrai projet avec Claude Code. Chaque fiche propose un exemple de prompt à copier, un chronomètre, des critères à cocher soi-même et une démarche corrigée |
| **Progression** | Les compteurs, la précision par domaine, les priorités de révision et l’historique des évaluations |

La progression est enregistrée dans le navigateur (`localStorage`, clé `claude-code-practice-v1`). Le bouton « Réinitialiser » l’efface entièrement. Si le stockage n’est pas disponible, l’application fonctionne quand même, mais sans rien enregistrer.

L’interface suit la charte graphique de Claude : fond crème `#faf9f5`, texte `#141413` et orange `#d97757` comme couleur principale, avec les polices Poppins et Lora. Un mode sombre s’active automatiquement selon le réglage du système.

## Domaines

| Domaine | Pondération | Cours | Questions | Questions par évaluation |
|---|---|---|---|---|
| D1 · Installation, configuration et prise en main | 10 % | 3 | 27 | 4 |
| D2 · Interaction avec Claude Code et commandes | 10 % | 3 | 26 | 4 |
| D3 · Compréhension et exploration d’un projet | 15 % | 4 | 39 | 6 |
| D4 · Génération, modification et refactoring de code | 15 % | 5 | 39 | 6 |
| D5 · Tests, debugging et correction d’erreurs | 15 % | 5 | 39 | 6 |
| D6 · Agents, sous-agents et workflows | 10 % | 3 | 27 | 4 |
| D7 · MCP, outils et intégrations | 10 % | 2 | 26 | 4 |
| D8 · CLAUDE.md, règles et personnalisation | 5 % | 1 | 13 | 2 |
| D9 · Git, sécurité et bonnes pratiques | 5 % | 2 | 16 | 2 |
| D10 · Automatisation et workflows avancés | 5 % | 2 | 13 | 2 |
| **Total** | 100 % | 30 | 265 | 40 |

## Couverture du programme

Chaque objectif renvoie à sa section d’origine dans le programme détaillé (§1 à §15, voir `PROMPT-GENERATEUR.md`).

| Objectif | Intitulé | Programme | Modules | Questions | Fiches pratiques |
|---|---|---|---|---|---|
| 1.1 | Présentation, cas d’utilisation et fonctionnement agentique | §1 | C1 | 8 | 1 |
| 1.2 | Installation, authentification et configuration | §1 | C2 | 9 | 3 |
| 1.3 | Première session, interaction avec un projet, permissions | §1 | C3 | 10 | 4 |
| 2.1 | Prompts efficaces et contraintes | §2 | C4 | 9 | 3 |
| 2.2 | Commandes slash et raccourcis | §2 | C5 | 8 | 1 |
| 2.3 | Sessions, contexte et plan avant modification | §2 | C6 | 9 | 3 |
| 3.1 | Exploration d’un repository et architecture | §3 | C7 | 10 | 4 |
| 3.2 | Recherche de fichiers, de symboles et dépendances | §3 | C8 | 10 | 3 |
| 3.3 | Analyse du code existant, des tests et de la configuration | §3 | C9 | 9 | 3 |
| 3.4 | Comprendre un environnement Docker | §12 | C10 | 10 | 2 |
| 4.1 | Créer et modifier du code dans le respect des conventions | §4 | C11 | 10 | 3 |
| 4.2 | Refactoring, suppression et migration de code | §4, §14 | C12 | 10 | 2 |
| 4.3 | Revue des modifications et bonnes pratiques | §4 | C13 | 9 | 2 |
| 4.4 | Claude Code avec Symfony | §11 | C14, C15 | 10 | 4 |
| 5.1 | Diagnostiquer un bug | §5 | C16 | 10 | 4 |
| 5.2 | Corriger et prévenir les régressions | §5 | C17 | 7 | 3 |
| 5.3 | Types de tests et génération de tests | §6, §11 | C18 | 10 | 6 |
| 5.4 | Exécuter les tests et analyser la couverture | §6 | C19 | 6 | 2 |
| 5.5 | Déboguer un environnement Docker | §12 | C20 | 6 | 2 |
| 6.1 | Concept d’agent et décomposition d’une tâche | §9 | C21 | 8 | 2 |
| 6.2 | Sous-agents et spécialisation | §9 | C22 | 11 | 3 |
| 6.3 | Recherche parallèle et workflows multi-agents | §9 | C23 | 8 | 3 |
| 7.1 | Concepts du MCP | §10 | C24 | 9 | 1 |
| 7.2 | Connecter et utiliser des outils externes | §10 | C25 | 9 | 3 |
| 7.3 | Sécurité des outils MCP | §10 | C25 | 8 | 3 |
| 8.1 | Rôle de CLAUDE.md et instructions du projet | §8 | C26 | 6 | 4 |
| 8.2 | Contenu d’un CLAUDE.md professionnel | §8 | C26 | 7 | 2 |
| 9.1 | Git et workflow professionnel | §7 | C27 | 7 | 3 |
| 9.2 | Sécurité | §7, §13 | C28 | 9 | 3 |
| 10.1 | Planification, workflows avancés et méthodologie | §14, §15 | C29 | 6 | 2 |
| 10.2 | Automatisation | §14 | C30 | 7 | 3 |

## Fiches pratiques

| Id | Type | Domaine | Niveau | Durée | Titre |
|---|---|---|---|---|---|
| ex-1-1 | exercice | D1 | essentiel | 15 min | Installer et vérifier Claude Code |
| ex-1-2 | exercice | D1 | essentiel | 15 min | Organiser ses fichiers de configuration |
| ex-1-3 | exercice | D1 | essentiel | 20 min | Première session sur un projet existant |
| ex-1-4 | exercice | D1 | essentiel | 15 min | Explorer les modes de permission |
| ex-1-5 | exercice | D1 | essentiel | 20 min | Chat ou agent : comparer |
| ex-2-1 | exercice | D2 | essentiel | 15 min | Réécrire un prompt vague |
| ex-2-2 | exercice | D2 | essentiel | 15 min | Faire poser les questions par Claude |
| ex-2-3 | exercice | D2 | essentiel | 20 min | Créer une commande slash personnalisée |
| ex-2-4 | exercice | D2 | essentiel | 20 min | Gérer le contexte d’une longue session |
| ex-2-5 | exercice | D2 | essentiel | 15 min | Reprendre une session |
| ex-3-1 | exercice | D3 | essentiel | 25 min | Cartographier un projet inconnu |
| ex-3-2 | exercice | D3 | essentiel | 15 min | Identifier les points d’entrée |
| ex-3-3 | exercice | D3 | essentiel | 15 min | Tracer les usages d’un symbole |
| ex-3-4 | exercice | D3 | essentiel | 20 min | Auditer les dépendances |
| ex-3-5 | exercice | D3 | essentiel | 20 min | Comprendre la configuration par environnement |
| ex-3-6 | exercice | D3 | essentiel | 20 min | Évaluer la couverture fonctionnelle des tests |
| ex-3-7 | exercice | D3 | essentiel | 20 min | Lire un environnement Docker |
| ex-4-1 | exercice | D4 | essentiel | 30 min | Créer un service sur le modèle existant |
| ex-4-2 | exercice | D4 | essentiel | 30 min | Ajouter une fonctionnalité par étapes |
| ex-4-3 | exercice | D4 | essentiel | 30 min | Refactorer avec un filet de tests |
| ex-4-4 | exercice | D4 | essentiel | 20 min | Supprimer du code mort en sécurité |
| ex-4-5 | exercice | D4 | essentiel | 15 min | Relire un diff comme un reviewer |
| ex-4-6 | exercice | D4 | essentiel | 30 min | Optimiser une requête Doctrine (N+1) |
| ex-4-7 | exercice | D4 | avancé | 30 min | Déplacer un traitement lent dans Messenger |
| ex-5-1 | exercice | D5 | essentiel | 20 min | Lire une trace d’erreur |
| ex-5-2 | exercice | D5 | essentiel | 20 min | Analyser des logs en mode non interactif |
| ex-5-3 | exercice | D5 | essentiel | 30 min | Corriger un bug avec un test de reproduction |
| ex-5-4 | exercice | D5 | essentiel | 30 min | Générer des tests utiles |
| ex-5-5 | exercice | D5 | avancé | 30 min | Écrire un test fonctionnel Symfony |
| ex-5-6 | exercice | D5 | essentiel | 25 min | Mesurer et exploiter la couverture |
| ex-5-7 | exercice | D5 | essentiel | 25 min | Diagnostiquer une connexion base refusée dans Docker |
| ex-6-1 | exercice | D6 | essentiel | 20 min | Décomposer une fonctionnalité |
| ex-6-2 | exercice | D6 | essentiel | 25 min | Créer un sous-agent relecteur |
| ex-6-3 | exercice | D6 | avancé | 25 min | Créer un sous-agent testeur |
| ex-6-4 | exercice | D6 | essentiel | 20 min | Recherche parallèle |
| ex-6-5 | exercice | D6 | avancé | 40 min | Workflow analyse → implémentation → tests → revue |
| ex-7-1 | exercice | D7 | essentiel | 15 min | Explorer un serveur MCP |
| ex-7-2 | exercice | D7 | essentiel | 20 min | Ajouter un serveur MCP local |
| ex-7-3 | exercice | D7 | essentiel | 20 min | Partager un serveur MCP avec l’équipe |
| ex-7-4 | exercice | D7 | essentiel | 20 min | Restreindre les outils MCP |
| ex-7-5 | exercice | D7 | avancé | 20 min | Repérer une injection de prompt |
| ex-8-1 | exercice | D8 | essentiel | 15 min | Générer et épurer un CLAUDE.md |
| ex-8-2 | exercice | D8 | avancé | 20 min | Instructions par sous-projet |
| ex-8-3 | exercice | D8 | essentiel | 20 min | Rendre les règles vérifiables |
| ex-9-1 | exercice | D9 | essentiel | 20 min | Préparer une pull request |
| ex-9-2 | exercice | D9 | avancé | 25 min | Résoudre un conflit de fusion |
| ex-9-3 | exercice | D9 | essentiel | 20 min | Protéger les secrets du projet |
| ex-10-1 | exercice | D10 | essentiel | 25 min | Appliquer la méthodologie en 10 étapes |
| ex-10-2 | exercice | D10 | avancé | 25 min | Créer un hook de formatage |
| ex-10-3 | exercice | D10 | essentiel | 25 min | Automatiser avec le mode non interactif |
| mi-01 | mission | D1 | essentiel | 45 min | Mission 1 — Prise en main sur un projet existant |
| mi-02 | mission | D3 | essentiel | 60 min | Mission 2 — Audit d’un projet inconnu |
| mi-03 | mission | D5 | avancé | 90 min | Mission 3 — Chasse aux bugs |
| mi-04 | mission | D5 | avancé | 90 min | Mission 4 — Améliorer la couverture de tests |
| mi-05 | mission | D8 | essentiel | 45 min | Mission 5 — CLAUDE.md professionnel pour Symfony |
| mi-06 | mission | D6 | avancé | 90 min | Mission 6 — Workflow multi-agents |
| mi-07 | mission | D7 | avancé | 60 min | Mission 7 — Outil externe via MCP |
| mi-08 | mission | D4 | avancé | 120 min | Mission 8 — Fonctionnalité Symfony complète |
| mi-09 | mission | D5 | avancé | 60 min | Mission 9 — Diagnostic Docker |
| mi-10 | mission | D9 | avancé | 45 min | Mission 10 — Identifier les actions à risque |
| pj-1 | projet | D1 | essentiel | 120 min | Projet 1 — Fondamentaux |
| pj-2 | projet | D4 | avancé | 240 min | Projet 2 — Développement Symfony |
| pj-3 | projet | D10 | avancé | 360 min | Projet final — Reprendre un projet Symfony défectueux |


## Structure des fichiers

```
index.html
style.css
app.js              ← logique uniquement, aucun contenu pédagogique
data/domains.js     ← domaines, pondération, examCount
data/programme.js   ← objectifs et notions
data/courses.js     ← cours
data/questions.js   ← banque de questions
data/practice.js    ← exercices, missions, projets
icons/icon.svg      ← favicon
```

## Ajouter du contenu

Les fichiers de `data/` sont de simples scripts qui déclarent des constantes globales. Écrivez les chaînes entre guillemets doubles et utilisez l’apostrophe typographique ’ dans les textes.

**Question** (`data/questions.js`) :

```js
{ d: 2, o: "2.2", q: "Énoncé ?", a: ["A", "B", "C", "D"], c: 1, e: "Explication." }
{ d: 2, o: "2.2", q: "Énoncé ? (Choisissez 2 réponses)", a: ["A", "B", "C", "D", "E"], c: [0, 3], e: "Explication." }
```

- `d` est le domaine, `o` l’objectif (il doit appartenir au domaine `d`), `c` l’index de la bonne réponse, ou un tableau d’index pour une question à réponses multiples.
- Une question simple a 4 réponses, une question multiple en a 5, avec la mention « (Choisissez N réponses) » dans l’énoncé.
- Le texte placé entre accents graves `` `…` `` s’affiche comme du code. Tout le reste est échappé avant d’être affiché.
- L’identifiant d’une question est calculé à partir de son énoncé : ajouter ou réordonner des questions ne perd pas la progression, mais modifier un énoncé revient à créer une nouvelle question.

**Cours** (`data/courses.js`) :

```js
{ d: 1, o: ["1.1"], title: "Titre", summary: "Résumé.", sections: [
  { h: "Sous-titre", lvl: "essentiel", p: "Texte avec <b>notion</b> et <code>commande</code>." },
  { h: "Points clés", lvl: "avancé", points: ["…"], code: "bloc de code affiché tel quel" },
  { h: "Hors programme", lvl: "complément", extra: true, p: "…" }
] }
```

**Fiche pratique** (`data/practice.js`) : `id` (unique et stable), `type` (`exercice`, `mission` ou `projet`), `d`, `o`, `level`, `minutes`, `title`, `context`, `steps`, `prompt`, `criteria`, `solution` (paragraphes séparés par `\n`).

**Évaluation** : le nombre de questions tirées dans chaque domaine est fixé par `examCount` dans `data/domains.js`. Chaque domaine doit contenir au moins deux fois `examCount` questions pour que les évaluations varient.
