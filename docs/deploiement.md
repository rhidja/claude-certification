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

Dans [console.firebase.google.com](https://console.firebase.google.com), projet `claude-certification-ce9be` :

1. **Activer la connexion Google**
   - **Authentication** → **Commencer** (si la page le propose).
   - **Méthode de connexion** → **Google** → **Activer**.
   - Choisir l'adresse e-mail d'assistance → **Enregistrer**.
2. **Autoriser le domaine du site**
   - **Authentication** → **Paramètres** → **Domaines autorisés** → **Ajouter un domaine**.
   - Saisir `rhidja.github.io`. `localhost` y figure déjà, pour les tests en local.
3. **Créer la base Firestore**
   - **Firestore Database** → **Créer une base de données**.
   - Choisir le **mode production** et une région européenne (par exemple `eur3`). La région ne peut plus être changée ensuite.
4. **Publier les règles de sécurité**
   - **Firestore Database** → onglet **Règles**.
   - Remplacer tout le contenu par celui du fichier [`firestore.rules`](../firestore.rules) → **Publier**.
   - Ces règles limitent chaque utilisateur à ses propres données.

> Si la console propose de passer au plan **Blaze**, refuser : tout ce que l'application utilise est inclus dans le plan Spark gratuit.

La configuration web du projet (`apiKey`, `projectId`…) est déjà dans [`sync.js`](../sync.js). Elle est publique par nature : ce sont les règles Firestore qui protègent les données.

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

## 4. Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| Bouton « ☁ Erreur » et `auth/configuration-not-found` dans l'info-bulle | Connexion Google non activée | Étape 1.2.1 |
| `auth/unauthorized-domain` | Domaine du site non autorisé | Étape 1.2.2 |
| `permission-denied` | Règles Firestore absentes ou non publiées | Étape 1.2.4 |
| La fenêtre de connexion ne s'ouvre pas (mobile) | Fenêtres surgissantes bloquées | L'application passe automatiquement par une redirection ; sinon, autoriser les fenêtres pour le site |
| Le bouton « Synchroniser » n'apparaît pas | Ancienne version en cache, ou page ouverte en `file://` | Recharger deux fois ; utiliser l'adresse `https` |
| Une modification n'apparaît pas en ligne | Publication en cours ou échouée | Onglet **Actions** du dépôt ; attendre la fin du workflow |
| Ancienne version qui persiste malgré les rechargements | Nom du cache non incrémenté après un ajout de fichier | Incrémenter `CACHE` dans `sw.js` (section 2) |

---

## 5. Revenir en arrière

- **Annuler une modification publiée** : sur GitHub, ouvrir la pull request fusionnée → **Revert**. Fusionner la pull request de retour : le site revient à la version précédente en une à deux minutes.
- **Désactiver la synchronisation sans toucher au site** : dans la console Firebase, **Authentication** → **Méthode de connexion** → désactiver **Google**. L'application continue de fonctionner, la progression reste dans chaque navigateur.

---

## 6. Limites du plan gratuit

Le plan Spark couvre largement l'usage de l'application. Une progression pèse quelques kilo-octets et se synchronise quelques fois par session.

- Firestore : 1 Go stocké, 50 000 lectures et 20 000 écritures par jour.
- Connexion Google : incluse.

Si un quota est dépassé, la synchronisation s'arrête jusqu'au lendemain, **sans facturation**. La progression reste enregistrée dans chaque navigateur.

Vérifier les quotas à jour sur [firebase.google.com/pricing](https://firebase.google.com/pricing).
