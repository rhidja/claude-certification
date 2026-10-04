# Architect Foundations — Préparation CCAR-F

Application web de préparation à la certification **Claude Certified Architect – Foundations** (code CCAR-F) d’Anthropic. Elle comprend des cours, une banque de questions organisée par scénarios, un examen blanc au format officiel et des fiches pratiques.

> **Préparation indépendante et non officielle, non affiliée à Anthropic.** Claude Certified Architect est une certification d’Anthropic : seuls l’examen officiel et son guide font foi. Le contenu suit le guide d’examen version 1.0 (juillet 2026), qui peut changer sans préavis. Le programme complet traduit est dans [`programme-ccar-f.md`](programme-ccar-f.md).

## Utilisation

Double-cliquez sur `index.html`. L’application fonctionne en `file://`, sans installation ni build ; seule la police Google Fonts est chargée depuis Internet.

| Onglet | Contenu |
|---|---|
| **Programme** | Les 30 objectifs (*task statements*) par domaine, avec leurs notions clés, leur intitulé anglais, leur état (À découvrir, En cours, Maîtrisé), un bouton « S’entraîner » et une case « Je maîtrise » |
| **Cours** | 30 modules, un par objectif. Chaque section porte une étiquette : essentiel, avancé, complément ou « Hors programme » |
| **Entraînement** | 300 questions, filtrables par statut (jamais répondues, erreurs à revoir), par domaine, par scénario ou par objectif. Chaque question affiche la mise en situation de son scénario. Au clavier : A à E pour répondre, Entrée pour valider ou passer à la suite |
| **Examen blanc** | 60 questions en 120 minutes, 4 scénarios tirés parmi 6, questions regroupées par scénario. Le score estimé suit la formule `100 + 900 × taux de bonnes réponses` sur l’échelle 100–1 000, avec un seuil à 720 (le score officiel est mis à l’échelle par Anthropic). Résultat par domaine, correction détaillée et historique des 20 derniers examens |
| **Pratique** | 30 exercices (un par objectif), 6 missions (une par scénario) et 4 projets (les exercices de préparation du guide). Chaque fiche propose une consigne d’exemple, un chronomètre, des critères à cocher et une démarche corrigée |
| **Progression** | Les compteurs, la précision par domaine, les priorités de révision et l’historique des examens blancs |

La progression est enregistrée dans le navigateur (`localStorage`, clé `ccar-f-prep-v1`). Le bouton « Réinitialiser » l’efface entièrement.

## Domaines (blueprint officiel)

| Domaine | Poids | Cours | Questions | Questions par examen blanc |
|---|---|---|---|---|
| D1 · Architecture agentique et orchestration | 27 % | 7 | 81 | 16 |
| D2 · Conception d’outils et intégration MCP | 18 % | 5 | 54 | 11 |
| D3 · Configuration et workflows Claude Code | 20 % | 6 | 60 | 12 |
| D4 · Prompt engineering et sortie structurée | 20 % | 6 | 60 | 12 |
| D5 · Gestion du contexte et fiabilité | 15 % | 6 | 45 | 9 |
| **Total** | 100 % | 30 | 300 | 60 |

## Scénarios

Quatre scénarios sont tirés au hasard à chaque examen blanc. Les questions de chaque domaine sont prises en priorité dans ces scénarios, puis complétées par d’autres si un domaine n’y est pas assez représenté.

| Scénario | Domaines principaux | Questions |
|---|---|---|
| S1 · Agent de résolution du support client | 1, 2, 5 | 60 |
| S2 · Génération de code avec Claude Code | 3, 5 | 55 |
| S3 · Système de recherche multi-agents | 1, 2, 5 | 59 |
| S4 · Productivité des développeurs | 2, 3, 1 | 49 |
| S5 · Claude Code en intégration continue | 3, 4 | 40 |
| S6 · Extraction de données structurées | 4, 5 | 37 |

## Couverture du programme

| Objectif | Intitulé | Module | Questions | Fiches pratiques |
|---|---|---|---|---|
| 1.1 | Concevoir et implémenter des boucles agentiques pour l’exécution autonome de tâches | C1 | 12 | 3 |
| 1.2 | Orchestrer des systèmes multi-agents avec le modèle coordinateur / sous-agents | C2 | 13 | 3 |
| 1.3 | Configurer l’invocation des sous-agents, le passage de contexte et leur lancement | C3 | 12 | 3 |
| 1.4 | Implémenter des workflows multi-étapes avec contrôle et transmission | C4 | 12 | 2 |
| 1.5 | Utiliser les hooks de l’Agent SDK pour intercepter les appels d’outils et normaliser les données | C5 | 11 | 2 |
| 1.6 | Concevoir des stratégies de décomposition pour les workflows complexes | C6 | 11 | 1 |
| 1.7 | Gérer l’état des sessions, leur reprise et leur dérivation | C7 | 10 | 2 |
| 2.1 | Concevoir des interfaces d’outils avec des descriptions et des limites claires | C8 | 12 | 2 |
| 2.2 | Implémenter des réponses d’erreur structurées pour les outils MCP | C9 | 11 | 3 |
| 2.3 | Répartir les outils entre agents et configurer le choix d’outil | C10 | 11 | 2 |
| 2.4 | Intégrer des serveurs MCP dans Claude Code et dans les workflows d’agents | C11 | 11 | 3 |
| 2.5 | Choisir et utiliser efficacement les outils intégrés (Read, Write, Edit, Bash, Grep, Glob) | C12 | 9 | 2 |
| 3.1 | Configurer les fichiers CLAUDE.md avec la bonne hiérarchie, portée et organisation modulaire | C13 | 11 | 3 |
| 3.2 | Créer et configurer des commandes slash et des skills personnalisés | C14 | 11 | 3 |
| 3.3 | Appliquer des règles par chemin pour charger les conventions de façon conditionnelle | C15 | 9 | 2 |
| 3.4 | Choisir entre plan mode et exécution directe | C16 | 10 | 4 |
| 3.5 | Appliquer des techniques de raffinement itératif | C17 | 9 | 1 |
| 3.6 | Intégrer Claude Code dans les pipelines CI/CD | C18 | 10 | 2 |
| 4.1 | Concevoir des prompts aux critères explicites pour gagner en précision et réduire les faux positifs | C19 | 10 | 2 |
| 4.2 | Utiliser le few-shot prompting pour améliorer la cohérence et la qualité des sorties | C20 | 10 | 2 |
| 4.3 | Imposer une sortie structurée avec le tool use et les schémas JSON | C21 | 12 | 3 |
| 4.4 | Implémenter des boucles de validation, de nouvelle tentative et de retour pour la qualité d’extraction | C22 | 10 | 4 |
| 4.5 | Concevoir des stratégies de traitement par lots efficaces | C23 | 9 | 3 |
| 4.6 | Concevoir des architectures de revue multi-instances et multi-passes | C24 | 9 | 2 |
| 5.1 | Gérer le contexte de conversation pour préserver les informations critiques dans les longues interactions | C25 | 9 | 1 |
| 5.2 | Concevoir des schémas d’escalade et de résolution des ambiguïtés | C26 | 9 | 3 |
| 5.3 | Implémenter des stratégies de propagation des erreurs dans les systèmes multi-agents | C27 | 7 | 3 |
| 5.4 | Gérer efficacement le contexte lors de l’exploration d’une grande base de code | C28 | 7 | 2 |
| 5.5 | Concevoir des workflows de revue humaine et calibrer la confiance | C29 | 7 | 3 |
| 5.6 | Préserver la provenance de l’information et gérer l’incertitude dans une synthèse multi-sources | C30 | 6 | 3 |

## Fiches pratiques

| Id | Type | Domaine | Niveau | Durée | Titre |
|---|---|---|---|---|---|
| ex-1-1 | exercice | D1 | essentiel | 45 min | Écrire une boucle agentique minimale |
| ex-1-2 | exercice | D1 | essentiel | 40 min | Concevoir la décomposition d’un coordinateur |
| ex-1-3 | exercice | D1 | avancé | 50 min | Lancer des sous-agents en parallèle avec le contexte explicite |
| ex-1-4 | exercice | D1 | essentiel | 40 min | Imposer une étape prérequise par le code |
| ex-1-5 | exercice | D1 | avancé | 45 min | Écrire deux hooks : normalisation et conformité |
| ex-1-6 | exercice | D1 | essentiel | 35 min | Choisir entre prompt chaining et décomposition adaptative |
| ex-1-7 | exercice | D1 | essentiel | 30 min | Reprendre, dériver ou repartir de zéro |
| ex-2-1 | exercice | D2 | essentiel | 35 min | Réécrire des descriptions d’outils ambiguës |
| ex-2-2 | exercice | D2 | essentiel | 40 min | Renvoyer des erreurs MCP structurées |
| ex-2-3 | exercice | D2 | essentiel | 35 min | Répartir les outils et régler tool_choice |
| ex-2-4 | exercice | D2 | essentiel | 35 min | Configurer des serveurs MCP partagés et personnels |
| ex-2-5 | exercice | D2 | essentiel | 30 min | Tracer une fonction avec les outils intégrés |
| ex-3-1 | exercice | D3 | essentiel | 30 min | Organiser la hiérarchie CLAUDE.md |
| ex-3-2 | exercice | D3 | essentiel | 35 min | Créer une commande de projet et un skill isolé |
| ex-3-3 | exercice | D3 | essentiel | 25 min | Écrire des règles par chemin |
| ex-3-4 | exercice | D3 | essentiel | 40 min | Plan mode ou exécution directe : trois tâches |
| ex-3-5 | exercice | D3 | essentiel | 35 min | Raffiner par exemples, tests et interview |
| ex-3-6 | exercice | D3 | avancé | 45 min | Revue de PR en CI avec sortie structurée |
| ex-4-1 | exercice | D4 | essentiel | 30 min | Réécrire un prompt de revue trop vague |
| ex-4-2 | exercice | D4 | essentiel | 35 min | Écrire des exemples few-shot ciblés |
| ex-4-3 | exercice | D4 | essentiel | 45 min | Définir un outil d’extraction par schéma JSON |
| ex-4-4 | exercice | D4 | avancé | 45 min | Boucle de validation et nouvelle tentative |
| ex-4-5 | exercice | D4 | avancé | 40 min | Concevoir une stratégie de traitement par lots |
| ex-4-6 | exercice | D4 | avancé | 40 min | Mettre en place une revue multi-passes indépendante |
| ex-5-1 | exercice | D5 | essentiel | 35 min | Mettre en place un bloc « case facts » |
| ex-5-2 | exercice | D5 | essentiel | 30 min | Écrire des critères d’escalade |
| ex-5-3 | exercice | D5 | avancé | 40 min | Propager une erreur structurée |
| ex-5-4 | exercice | D5 | essentiel | 35 min | Explorer une grande base de code sans dégradation |
| ex-5-5 | exercice | D5 | avancé | 40 min | Calibrer la revue humaine |
| ex-5-6 | exercice | D5 | essentiel | 35 min | Préserver la provenance dans une synthèse |
| mi-s1 | mission | D1 | avancé | 120 min | Mission S1 — Agent de résolution du support client |
| mi-s2 | mission | D3 | avancé | 90 min | Mission S2 — Claude Code dans le workflow de l’équipe |
| mi-s3 | mission | D1 | avancé | 150 min | Mission S3 — Système de recherche multi-agents |
| mi-s4 | mission | D2 | avancé | 90 min | Mission S4 — Outil de productivité pour développeurs |
| mi-s5 | mission | D3 | avancé | 90 min | Mission S5 — Claude Code en intégration continue |
| mi-s6 | mission | D4 | avancé | 120 min | Mission S6 — Extraction de données structurées |
| pj-1 | projet | D1 | avancé | 240 min | Projet 1 — Agent multi-outils avec logique d’escalade |
| pj-2 | projet | D3 | avancé | 180 min | Projet 2 — Configurer Claude Code pour une équipe |
| pj-3 | projet | D4 | avancé | 240 min | Projet 3 — Pipeline d’extraction de données structurées |
| pj-4 | projet | D1 | avancé | 240 min | Projet 4 — Pipeline de recherche multi-agents |

## Structure des fichiers

```
index.html
style.css
app.js                ← logique uniquement, aucun contenu pédagogique
data/domains.js       ← domaines, pondération, examCount
data/programme.js     ← 30 objectifs et notions clés
data/courses.js       ← cours
data/questions.js     ← banque de questions (avec scénario s)
data/practice.js      ← exercices, missions, projets
data/scenarios.js     ← 6 scénarios d’examen
programme-ccar-f.md   ← programme détaillé traduit du guide d’examen
PROMPT-GENERATEUR.md  ← prompt qui a servi à générer l’application
manifest.webmanifest, sw.js, icons/   ← application installable
```

## Ajouter du contenu

Les fichiers de `data/` déclarent des constantes globales. Écrivez les chaînes entre guillemets doubles et utilisez l’apostrophe typographique ’.

```js
// Question à choix unique, puis à réponses multiples
{ d: 2, o: "2.3", s: "S3", q: "Énoncé ?", a: ["A", "B", "C", "D"], c: 1, e: "Explication." }
{ d: 4, o: "4.3", s: "S6", q: "Énoncé ? (Choisissez 2 réponses)", a: ["A", "B", "C", "D", "E"], c: [0, 3], e: "Explication." }
```

- `o` doit appartenir au domaine `d`, et `s` doit être un scénario dont `d` fait partie des domaines principaux (`data/scenarios.js`).
- Les sujets listés comme « Hors programme » dans le guide ne doivent faire l’objet d’aucune question.
- Le texte entre accents graves `` `…` `` s’affiche comme du code ; tout le reste est échappé.
- L’identifiant d’une question est calculé à partir de son énoncé : modifier un énoncé revient à créer une nouvelle question.
- Chaque domaine doit compter au moins deux fois son `examCount` en questions.

## Application installable (PWA)

L’installation nécessite une adresse **https** (ou `localhost`). En `file://`, l’application fonctionne mais ne peut pas s’installer.

- **Publier** : GitHub Pages (Settings → Pages → branche, dossier racine), Netlify ou Cloudflare Pages, sans commande de build.
- **Android (Chrome)** et **ordinateur (Chrome, Edge)** : bouton « Installer l’app » de l’en-tête, ou le menu du navigateur.
- **iPhone / iPad (Safari)** : Partager → « Sur l’écran d’accueil ».
- **Tester en local** : `python3 -m http.server 8000`, puis `http://localhost:8000/`.
- **Ajout ou suppression d’un fichier** : mettez à jour la liste `ASSETS` de `sw.js` et incrémentez le nom du cache (`ccar-f-prep-v1` → `v2`).
