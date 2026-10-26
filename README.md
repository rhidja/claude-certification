# Préparation aux certifications Claude

Application web de préparation à plusieurs certifications Claude. Chacune propose des cours, une banque de questions, une épreuve d’entraînement chronométrée et des fiches pratiques, avec une progression enregistrée séparément.

> **Préparation indépendante et non officielle, non affiliée à Anthropic.** Claude est une marque d’Anthropic. Les certifications officielles (Claude Certified Architect, Claude Certified Developer…) sont délivrées uniquement par Anthropic ; seuls les examens officiels et leurs guides font foi.

## Certifications

| Certification | Statut | Contenu | Épreuve d’entraînement |
|---|---|---|---|
| **Claude Certified Architect – Foundations** (CCAR-F) | Disponible | 5 domaines, 30 objectifs, 30 cours, 300 questions sur 6 scénarios, 40 fiches pratiques | Examen blanc : 60 questions, 120 min, 4 scénarios sur 6, score estimé sur 100–1 000, seuil 720 |
| **Claude Code — Certification & Practice** | Disponible (parcours interne, non officiel) | 10 domaines, 31 objectifs, 30 cours, 265 questions, 63 fiches pratiques | Évaluation : 40 questions, 60 min, seuil 70 % |
| **Claude Certified Developer – Foundations** (CCDV-F) | Disponible | 8 domaines, 25 objectifs, 25 cours, 253 questions, 31 fiches pratiques | Examen blanc : 53 questions, 120 min, score estimé sur 100–1 000, seuil 720 |

## Utilisation

Double-cliquez sur `index.html`. L’application fonctionne en `file://`, sans installation ni build ; seule la police Google Fonts est chargée depuis Internet.

- La **page d’accueil** liste les certifications, avec l’état de votre progression et un raccourci « Reprendre » vers la dernière utilisée.
- Le **sélecteur** de l’en-tête permet de changer de certification à tout moment. L’adresse d’une certification est `index.html?cert=<id>` (`ccar-f`, `ccdv-f`, `claude-code`).
- Dans une certification, six onglets : **Programme**, **Cours**, **Entraînement**, **Examen blanc** (ou **Évaluation**), **Pratique**, **Progression**. Au clavier : A à E pour répondre, Entrée pour valider ou passer à la suite.

La progression est enregistrée dans le navigateur (`localStorage`), avec une clé par certification : `ccar-f-prep-v1`, `ccdv-f-prep-v1`, `claude-code-practice-v1`. Les progressions des anciennes versions sont donc conservées. Le bouton « Réinitialiser » n’efface que la certification ouverte (et, si la synchronisation est active, sur tous les appareils).

## Structure

```
index.html, style.css, app.js     ← moteur commun (aucun contenu pédagogique)
sync.js, firestore.rules          ← synchronisation facultative entre appareils (Firebase)
certs/index.js                    ← registre des certifications
certs/ccar-f/                     ← domains, programme, courses, questions, practice, scenarios
certs/ccdv-f/                     ← domains, programme, courses, questions, practice
certs/claude-code/                ← domains, programme, courses, questions, practice
docs/                             ← guides d’examen officiels (CCAR-F, CCDV-F) et programmes détaillés traduits
prompts/                          ← prompts remplis qui ont servi à générer chaque certification
PROMPT-GENERATEUR.md              ← modèle de prompt pour ajouter une certification
manifest.webmanifest, sw.js, icons/
```

`app.js` ne charge que les fichiers de la certification choisie, listés dans son entrée `files` de `certs/index.js`.

## Ajouter une certification

1. Créez une branche, remplissez les paramètres de [`PROMPT-GENERATEUR.md`](PROMPT-GENERATEUR.md) et placez le guide ou le programme dans `docs/`.
2. Donnez le prompt à Claude Code : il produit `certs/<id>/` et l’entrée du registre.
3. Ajoutez les nouveaux fichiers à la liste `ASSETS` de `sw.js` et incrémentez le nom du cache (`claude-certs-v2` → `v3`).

Entrée minimale du registre (voir les entrées complètes dans `certs/index.js`) :

```js
{
  id: "ccdv-f", status: "available", official: true, code: "CCDV-F",
  name: "Claude Certified Developer – Foundations", short: "Developer Foundations",
  storeKey: "ccdv-f-prep-v1", files: ["domains", "programme", "courses", "questions", "practice"],
  summary: "…", hero: { kicker: "…", title: "…", lead: "…", format: "…" },
  exam: { label: "Examen blanc", title: "…", minutes: 120, scoring: "scaled", pass: 720, scenarioCount: 0, intro: "…" },
  programmeNote: "…", practiceNote: "…", footer: "…", facts: ["53 questions", "120 min"]
}
```

## Format des données

Les fichiers de `certs/<id>/` déclarent des constantes globales. Écrivez les chaînes entre guillemets doubles et utilisez l’apostrophe typographique ’.

```js
// questions.js — s (scénario) seulement si la certification a un scenarios.js
{ d: 2, o: "2.3", s: "S3", q: "Énoncé ?", a: ["A", "B", "C", "D"], c: 1, e: "Explication." }
{ d: 4, o: "4.3", q: "Énoncé ? (Choisissez 2 réponses)", a: ["A", "B", "C", "D", "E"], c: [0, 3], e: "Explication." }
```

- `o` doit appartenir au domaine `d` ; le texte entre accents graves `` `…` `` s’affiche comme du code, tout le reste est échappé.
- L’identifiant d’une question est calculé à partir de son énoncé : modifier un énoncé revient à créer une nouvelle question.
- Chaque domaine doit compter au moins deux fois son `examCount` en questions.
- Les sections de cours acceptent `p` (texte ou tableau de paragraphes), `points`, `code`, `blocks` (contenu ordonné : liste d’objets `{p}`, `{points}` ou `{code}`, affichés dans l’ordre), `lvl` (« essentiel », « avancé », « complément ») et `extra: true` (« Hors programme »).
- Les sections « En pratique » des cours CCAR-F et CCDV-F sont générées à partir des blocs du même nom dans `docs/programme-*.md` : modifiez d’abord le programme, puis régénérez les cours.

## Application installable (PWA)

L’installation nécessite une adresse **https** (ou `localhost`) ; en `file://`, l’application fonctionne mais ne s’installe pas. Une seule installation donne accès à toutes les certifications, y compris hors ligne.

- **Publier** : GitHub Pages (Settings → Pages → branche, dossier racine), Netlify ou Cloudflare Pages, sans build.
- **Android / ordinateur (Chrome, Edge)** : bouton « Installer l’app » de l’en-tête ou menu du navigateur.
- **iPhone / iPad (Safari)** : Partager → « Sur l’écran d’accueil ».
- **Tester en local** : `python3 -m http.server 8000`, puis `http://localhost:8000/`.

## Synchronisation entre appareils (Firebase, plan gratuit Spark)

Le bouton « Synchroniser » de l’en-tête connecte un compte Google et copie la progression dans Firestore (`users/{uid}/progress/{clé de la certification}`). `localStorage` reste la source principale : l’application fonctionne sans compte et hors ligne. À chaque connexion, retour sur l’onglet ou enregistrement, la version la plus récente de chaque certification l’emporte.

- Inactif en `file://` : la connexion Google exige `https` (GitHub Pages) ou `localhost`.
- Le SDK Firebase n’est chargé qu’après le premier clic sur « Synchroniser ».
- La configuration web dans `sync.js` est publique par nature ; la sécurité repose sur `firestore.rules`.

Mise en place dans la console Firebase (une seule fois, sans carte bancaire) :

1. **Authentication** → Méthode de connexion → activer **Google**.
2. **Authentication** → Paramètres → Domaines autorisés → ajouter `rhidja.github.io` (`localhost` y est par défaut).
3. **Firestore Database** → Créer une base (mode production), puis **Règles** → coller le contenu de `firestore.rules` → Publier.
