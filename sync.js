/* Synchronisation facultative de la progression entre appareils (Firebase : connexion Google + Firestore).
   La progression reste enregistrée dans localStorage ; Firestore en garde une copie par utilisateur et par
   certification (users/{uid}/progress/{storeKey}). En cas de conflit, la version la plus récente l'emporte.
   Le SDK Firebase n'est chargé qu'après un clic sur « Synchroniser » (ou si l'utilisateur s'est déjà connecté).
   Inactif en file:// : la connexion Google exige une page servie en http(s). */
(function () {
  "use strict";
  if (location.protocol !== "http:" && location.protocol !== "https:") return;

  var SDK = "https://www.gstatic.com/firebasejs/13.1.0/";
  // Configuration web publique : la sécurité repose sur les règles Firestore (firestore.rules), pas sur ces valeurs.
  var CONFIG = {
    apiKey: "AIzaSyAe9gyVBIh0YbYFJfZjttvxJSDtA6GQFqo",
    authDomain: "claude-certification-ce9be.firebaseapp.com",
    projectId: "claude-certification-ce9be",
    storageBucket: "claude-certification-ce9be.firebasestorage.app",
    messagingSenderId: "249729533511",
    appId: "1:249729533511:web:46154c953b935a3c151362"
  };
  var ENABLED_KEY = "claude-certs-sync";   // "1" : l'utilisateur s'est connecté sur cet appareil
  var PUSH_DELAY = 1500;

  var fb = null;         // { auth, db, a: module auth, f: module firestore }
  var loading = null;
  var user = null;
  var watched = {};      // storeKey -> fonction qui recharge l'état depuis localStorage
  var listeners = [];
  var timers = {};
  var btn = null;

  // ---------- Stockage local ----------

  function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignoré */ } }
  function del(k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignoré */ } }
  function stamp(key) { return Number(get(key + ":t")) || 0; }

  function storeKeys() {
    return (window.CERTS || []).filter(function (c) { return c.status === "available"; }).map(function (c) { return c.storeKey; });
  }

  // ---------- Firebase ----------

  function loadSdk() {
    if (!loading) {
      loading = Promise.all([
        import(SDK + "firebase-app.js"),
        import(SDK + "firebase-auth.js"),
        import(SDK + "firebase-firestore.js")
      ]).then(function (m) {
        var app = m[0].initializeApp(CONFIG);
        fb = { auth: m[1].getAuth(app), db: m[2].getFirestore(app), a: m[1], f: m[2] };
        fb.a.onAuthStateChanged(fb.auth, function (u) {
          user = u;
          if (u) { set(ENABLED_KEY, "1"); syncAll(); } else del(ENABLED_KEY);
          updateButton();
        });
        return fb;
      }).catch(function (e) { loading = null; fail(e); throw e; });
    }
    return loading;
  }

  function docRef(key) { return fb.f.doc(fb.db, "users", user.uid, "progress", key); }

  function push(key) {
    var raw = get(key);
    if (!user || raw == null) return Promise.resolve();
    return fb.f.setDoc(docRef(key), { data: raw, updatedAt: stamp(key) || Date.now() });
  }

  // Compare la copie distante et la copie locale ; renvoie true si la copie locale a été remplacée.
  function syncKey(key) {
    return fb.f.getDoc(docRef(key)).then(function (snap) {
      var remote = snap.exists() ? snap.data() : null;
      var local = stamp(key);
      if (remote && remote.updatedAt > local) {
        set(key, remote.data);
        set(key + ":t", String(remote.updatedAt));
        return true;
      }
      if (get(key) != null && (!remote || local > remote.updatedAt)) return push(key).then(function () { return false; });
      return false;
    });
  }

  function syncAll() {
    if (!user) return;
    setStatus("…", "Synchronisation en cours");
    Promise.all(storeKeys().map(function (k) { return syncKey(k).then(function (changed) { return changed ? k : null; }); }))
      .then(function (changed) {
        changed.forEach(function (k) { if (k && watched[k]) watched[k](); });
        if (changed.some(Boolean)) listeners.forEach(function (fn) { fn(); });
        updateButton();
      })
      .catch(fail);
  }

  function flush() {
    Object.keys(timers).forEach(function (k) { clearTimeout(timers[k]); delete timers[k]; push(k).catch(fail); });
  }

  // ---------- Bouton de l'en-tête ----------

  function setStatus(label, title) {
    if (!btn) return;
    btn.textContent = label;
    btn.title = title;
  }

  function updateButton() {
    if (user) setStatus("☁ Synchronisé", "Progression synchronisée avec " + (user.email || "votre compte") + ". Cliquer pour se déconnecter.");
    else setStatus("Synchroniser", "Se connecter avec Google pour retrouver sa progression sur tous ses appareils");
  }

  function fail(e) {
    if (window.console) console.warn("Synchronisation :", e);
    setStatus("☁ Erreur", "La synchronisation a échoué (" + (e && (e.code || e.message) || e) + "). La progression reste enregistrée sur cet appareil.");
  }

  function onClick() {
    if (user) {
      if (window.confirm("Se déconnecter ? La progression reste sur cet appareil, mais ne sera plus synchronisée.")) {
        flush();
        fb.a.signOut(fb.auth).catch(fail);
      }
      return;
    }
    setStatus("…", "Connexion en cours");
    loadSdk().then(function () {
      var provider = new fb.a.GoogleAuthProvider();
      return fb.a.signInWithPopup(fb.auth, provider).catch(function (e) {
        // Fenêtre bloquée (fréquent sur mobile) : connexion par redirection.
        if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
          set(ENABLED_KEY, "1"); // au retour sur la page, le SDK doit être rechargé pour finaliser la connexion
          return fb.a.signInWithRedirect(fb.auth, provider);
        }
        if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") { updateButton(); return; }
        throw e;
      });
    }).catch(fail);
  }

  function setup() {
    btn = document.getElementById("sync-btn");
    if (!btn) return;
    btn.hidden = false;
    updateButton();
    btn.addEventListener("click", onClick);
    if (get(ENABLED_KEY) === "1") loadSdk().catch(function () { /* hors ligne : on réessaiera au prochain chargement */ });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush();
    else syncAll();
  });
  window.addEventListener("pagehide", flush);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setup();

  // ---------- Interface utilisée par app.js ----------

  window.CloudSync = {
    // Appelé après chaque enregistrement local d'une certification.
    saved: function (key) {
      set(key + ":t", String(Date.now()));
      if (!user) return;
      clearTimeout(timers[key]);
      timers[key] = setTimeout(function () { delete timers[key]; push(key).catch(fail); }, PUSH_DELAY);
    },
    // reload() relit localStorage et réaffiche, quand une version plus récente arrive d'un autre appareil.
    watch: function (key, reload) { watched[key] = reload; },
    // Appelé quand au moins une certification a été mise à jour (page d'accueil).
    onChange: function (fn) { listeners.push(fn); }
  };
})();
