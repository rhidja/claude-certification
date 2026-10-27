# Déploiement

Ce guide décrit comment mettre en ligne l'application de préparation aux certifications Claude, activer la synchronisation entre appareils et publier les mises à jour.

- **Site** : https://rhidja.github.io/claude-certification/
- **Hébergement** : GitHub Pages, branche `main`, dossier racine. Aucun build.
- **Synchronisation** (facultative) : Firebase, projet `claude-certification-ce9be`, plan gratuit Spark.
- **Coût** : 0 €. Aucune carte bancaire n'est nécessaire.

---

## 1. Mise en place initiale (une seule fois)

### 1.1 GitHub Pages

1. Sur GitHub, ouvrir le dépôt `rhidja/claude-certification` → **Settings** → **Pages**.
2. **Source** : *Deploy from a branch*.
3. **Branch** : `main`, dossier `/ (root)` → **Save**.
4. Une à deux minutes plus tard, le site est disponible à l'adresse ci-dessus.

> Déjà fait : le site répond actuellement sur cette adresse.

### 1.2 Firebase (synchronisation entre appareils)

Dans [console.firebase.google.com](https://console.firebase.google.com), projet `claude-certification-ce9be`. Les cinq étapes sont **obligatoires** : il en suffit d'une manquante pour que la synchronisation échoue.

1. **Activer l'authentification**
   - Ouvrir https://console.firebase.google.com/project/claude-certification-ce9be/authentication
   - Cliquer sur **Commencer** (*Get started*) si le bouton s'affiche. **Indispensable** : sans ce clic, l'authentification n'existe pas pour le projet et le site obtient l'erreur `auth/configuration-not-found`.
2. **Activer la connexion Google**
   - Onglet **Méthode de connexion** → **Ajouter un fournisseur** → **Google** → **Activer**.
   - Choisir l'adresse e-mail d'assistance → **Enregistrer**.
   - Google doit apparaître avec l'état **Activé**.
3. **Autoriser le domaine du site**
   - Onglet **Paramètres** → **Domaines autorisés** → **Ajouter un domaine**.
   - Saisir `rhidja.github.io`. `localhost` y figure déjà, pour les tests en local.
4. **Créer la base Firestore**
   - **Firestore Database** → **Créer une base de données**.
   - Garder l'identifiant **`(default)`** : le site n'utilise que cette base.
   - Choisir une région européenne (par exemple `eur3`). La région ne peut plus être changée ensuite.
   - Choisir le **mode production**.
5. **Publier les règles de sécurité**
   - En mode production, Firestore crée des règles qui **refusent tout** (`allow read, write: if false;`). Tant qu'elles ne sont pas remplacées, le site obtient l'erreur `Missing or insufficient permissions`.
   - Ouvrir https://console.firebase.google.com/project/claude-certification-ce9be/firestore/rules
   - Effacer tout le contenu de l'éditeur et coller celui du fichier [`firestore.rules`](../firestore.rules) :

     ```
     rules_version = '2';

     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{uid}/progress/{storeKey} {
           allow read, delete: if request.auth != null && request.auth.uid == uid;
           allow create, update: if request.auth != null && request.auth.uid == uid
             && request.resource.data.keys().hasOnly(['data', 'updatedAt'])
             && request.resource.data.data is string
             && request.resource.data.data.size() < 500000
             && request.resource.data.updatedAt is int;
         }
       }
     }
     ```

   - Cliquer sur **Publier**. Coller le texte ne suffit pas. Les règles s'appliquent en une trentaine de secondes.
   - Ces règles limitent chaque utilisateur à ses propres données.

> Si la console propose de passer au plan **Blaze**, refuser : tout ce que l'application utilise est inclus dans le plan Spark gratuit.

La configuration web du projet (`apiKey`, `projectId`…) est déjà dans [`sync.js`](../sync.js). Elle est publique par nature : ce sont les règles Firestore qui protègent les données.

#### Contrôle rapide de la configuration

Ces deux commandes, en lecture seule, vérifient la configuration sans se connecter :

```bash
K=AIzaSyAe9gyVBIh0YbYFJfZjttvxJSDtA6GQFqo
# Authentification : doit lister les domaines autorisés, dont rhidja.github.io
curl -s "https://identitytoolkit.googleapis.com/v1/projects?key=$K" -H "Referer: https://rhidja.github.io/"
# Base Firestore : PERMISSION_DENIED = la base existe ; NOT_FOUND = elle n'est pas créée
curl -s "https://firestore.googleapis.com/v1/projects/claude-certification-ce9be/databases/(default)/documents/users/test?key=$K"
```

---

## 2. Publier une modification

Toute modification passe par une branche et une pull request vers `main`. GitHub Pages republie automatiquement après chaque fusion.

```bash
git switch main && git pull
git switch -c ma-modification
# … modifications …
git add -A && git commit -m "Décrit la modification"
git push -u origin ma-modification
```

Ensuite :

1. Sur GitHub, ouvrir une pull request de `ma-modification` vers `main`.
2. Relire le diff, puis **Merge pull request**.
3. Suivre la publication dans l'onglet **Actions** (workflow *pages build and deployment*). Elle prend une à deux minutes.

### Règle à ne pas oublier : le cache de l'application

L'application est installable et fonctionne hors ligne grâce au service worker [`sw.js`](../sw.js).

- **Ajout, suppression ou renommage d'un fichier** :
  - mettre à jour la liste `ASSETS` de `sw.js` ;
  - **incrémenter** le nom du cache (`claude-certs-v3` → `claude-certs-v4`).
- **Simple modification de contenu** (cours, questions) : rien à faire. Le service worker récupère d'abord la version en ligne.

---

## 3. Vérifier après chaque déploiement

1. Ouvrir le site. Si l'ancienne version s'affiche encore, **recharger la page une ou deux fois** : la nouvelle version s'installe en arrière-plan.
2. Vérifier que l'accueil et les trois certifications s'ouvrent : CCAR-F, CCDV-F, Claude Code.
3. Vérifier la synchronisation :
   1. Cliquer sur **Synchroniser** dans l'en-tête et se connecter avec Google. Le bouton doit afficher **☁ Synchronisé**.
   2. Répondre à quelques questions.
   3. Ouvrir le site sur un autre appareil et se connecter avec le même compte : la progression doit apparaître.
   4. Dans la console Firebase, **Firestore Database** → **Données** doit montrer `users/<identifiant>/progress/<certification>`.

### Tester en local avant de fusionner

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/
```

En ouvrant directement `index.html` (adresse `file://`), l'application fonctionne mais ne s'installe pas, et le bouton **Synchroniser** est masqué. La connexion Google exige `https` ou `localhost`.

---

## 4. Où trouver les données

### Les utilisateurs

**Authentication** → onglet **Utilisateurs**. Chaque compte Google connecté au moins une fois apparaît avec son adresse e-mail et son **UID utilisateur**, un identifiant unique et permanent, le même sur tous ses appareils.

### La progression

**Firestore Database** → onglet **Données** :

```
users
└── <UID de l'utilisateur>
    └── progress
        ├── ccar-f-prep-v1
        ├── ccdv-f-prep-v1
        └── claude-code-practice-v1
```

Chaque document correspond à une certification commencée et contient deux champs :

- `data` : la progression (réponses, cours lus, examens, fiches pratiques), en texte JSON ;
- `updatedAt` : la date de la dernière modification, en millisecondes. Elle sert à choisir la version la plus récente.

La collection `users` n'apparaît qu'après le **premier envoi réussi**. Firestore n'affiche pas une collection vide. Un envoi a lieu environ 1,5 seconde après une action (réponse, cours lu…), une fois connecté.

### Séparation entre utilisateurs

Chaque utilisateur est distingué par son UID. Les règles n'autorisent la lecture et l'écriture de `users/{uid}/…` qu'à l'utilisateur connecté qui porte ce UID : personne ne peut lire ni modifier la progression d'un autre.

> Limite connue : la progression locale appartient au navigateur. Si deux comptes se succèdent sur le même navigateur, la progression du premier peut être envoyée dans le compte du second.

---

## 5. Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Bouton « ☁ Erreur », `auth/configuration-not-found` ou `CONFIGURATION_NOT_FOUND` dans la console | Authentification jamais initialisée | Étapes 1.2.1 et 1.2.2 (bouton **Commencer**, puis Google) |
| `auth/unauthorized-domain` | Domaine du site non autorisé | Étape 1.2.3 |
| `Missing or insufficient permissions` / `permission-denied` | Règles par défaut (« tout refuser ») encore en place, ou non publiées | Étape 1.2.5 : coller les règles **et** cliquer sur **Publier** |
| `database (default) does not exist` / `NOT_FOUND` | Base Firestore non créée, ou créée sous un autre identifiant | Étape 1.2.4 |
| Collection `users` absente alors que le bouton affiche « ☁ Synchronisé » | Aucune progression encore envoyée | Répondre à une question, attendre deux secondes, recharger l'onglet **Données** |
| Messages « Cross-Origin-Opener-Policy policy would block the window.closed call » | Avertissements de Chrome pendant la fenêtre de connexion Google | Sans gravité : la connexion fonctionne quand même. Ils ne peuvent pas être supprimés depuis GitHub Pages |
| La fenêtre de connexion ne s'ouvre pas (mobile) | Fenêtres surgissantes bloquées | L'application passe automatiquement par une redirection ; sinon, autoriser les fenêtres pour le site |
| Le bouton « Synchroniser » n'apparaît pas | Ancienne version en cache, ou page ouverte en `file://` | Recharger deux fois ; utiliser l'adresse `https` |
| Une modification n'apparaît pas en ligne | Publication en cours ou échouée | Onglet **Actions** du dépôt ; attendre la fin du workflow |
| Ancienne version qui persiste malgré les rechargements | Nom du cache non incrémenté après un ajout de fichier | Incrémenter `CACHE` dans `sw.js` (section 2) |

---

## 6. Revenir en arrière

- **Annuler une modification publiée** : sur GitHub, ouvrir la pull request fusionnée → **Revert**. Fusionner la pull request de retour : le site revient à la version précédente en une à deux minutes.
- **Désactiver la synchronisation sans toucher au site** : dans la console Firebase, **Authentication** → **Méthode de connexion** → désactiver **Google**. L'application continue de fonctionner, la progression reste dans chaque navigateur.

---

## 7. Limites du plan gratuit

Le plan Spark couvre largement l'usage de l'application. Une progression pèse quelques kilo-octets et se synchronise quelques fois par session.

- Firestore : 1 Go stocké, 50 000 lectures et 20 000 écritures par jour.
- Connexion Google : incluse.

Si un quota est dépassé, la synchronisation s'arrête jusqu'au lendemain, **sans facturation**. La progression reste enregistrée dans chaque navigateur.

Vérifier les quotas à jour sur [firebase.google.com/pricing](https://firebase.google.com/pricing).
