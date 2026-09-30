/* Claude Code — Certification & Practice
   Logique de l'application. Aucun contenu pédagogique ici : tout vient de data/. */
(function () {
  "use strict";

  var STORE_KEY = "claude-code-practice-v1";
  var EXAM_MINUTES = 60;
  var PASS_RATE = 70;
  var LETTERS = "ABCDE";

  // ---------- Utilitaires ----------

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Texte issu des données : échappé, puis `code` rendu en <code>.
  function fmt(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function fmtDate(ts) {
    try {
      return new Date(ts).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
    } catch (e) { return new Date(ts).toISOString().slice(0, 16).replace("T", " "); }
  }

  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var s = a.slice().sort().join(","), t = b.slice().sort().join(",");
    return s === t;
  }

  // ---------- Données préparées ----------

  var DOMAIN_BY_ID = {};
  DOMAINS.forEach(function (d) { DOMAIN_BY_ID[d.id] = d; });

  var OBJ_BY_ID = {};
  OBJECTIVES.forEach(function (o) { OBJ_BY_ID[o.id] = o; });

  var QS = QUESTIONS.map(function (q) {
    return {
      id: "q" + hash(q.q), d: q.d, o: q.o, q: q.q, a: q.a, e: q.e,
      c: Array.isArray(q.c) ? q.c : [q.c], multi: Array.isArray(q.c)
    };
  });
  var Q_BY_ID = {};
  QS.forEach(function (q) { Q_BY_ID[q.id] = q; });

  var COURSE_KEYS = COURSES.map(function (c) { return "c" + hash(c.title); });

  function coursesForObjective(oid) {
    var list = [];
    COURSES.forEach(function (c, i) { if (c.o.indexOf(oid) !== -1) list.push(i); });
    return list;
  }

  // ---------- Stockage ----------

  function emptyState() {
    return { answers: {}, read: {}, mastered: {}, exams: [], practice: {}, streak: 0 };
  }

  function load() {
    var s = emptyState();
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        Object.keys(s).forEach(function (k) { if (data && data[k] != null) s[k] = data[k]; });
      }
    } catch (e) { /* stockage indisponible : on garde un état vide */ }
    return s;
  }

  function save() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignoré */ }
  }

  var state = load();

  function recordAnswer(qid, ok) {
    var prev = state.answers[qid];
    state.answers[qid] = { ok: ok, n: (prev ? prev.n : 0) + 1, t: Date.now() };
  }

  // ---------- Statistiques ----------

  function statsFor(list) {
    var seen = 0, ok = 0;
    list.forEach(function (q) {
      var r = state.answers[q.id];
      if (r) { seen++; if (r.ok) ok++; }
    });
    return { total: list.length, seen: seen, ok: ok, acc: seen ? ok / seen : 0 };
  }

  function objQuestions(oid) { return QS.filter(function (q) { return q.o === oid; }); }
  function domainQuestions(did) { return QS.filter(function (q) { return q.d === did; }); }

  function objStatus(oid) {
    var st = statsFor(objQuestions(oid));
    var computed = st.seen >= 3 && st.acc >= 0.8;
    var read = coursesForObjective(oid).some(function (i) { return state.read[COURSE_KEYS[i]]; });
    if (computed || state.mastered[oid]) return { key: "done", label: "Maîtrisé", st: st };
    if (read || st.seen > 0) return { key: "progress", label: "En cours", st: st };
    return { key: "todo", label: "À découvrir", st: st };
  }

  function practiceStatus(p) {
    var r = state.practice[p.id];
    var n = r && r.c ? r.c.length : 0;
    if (n >= p.criteria.length) return "done";
    if (n > 0) return "progress";
    return "todo";
  }

  // ---------- Interface : état ----------

  var ui = {
    tab: "programme",
    course: null,
    trainFilter: "all",
    trainDomain: null,
    trainObj: null,
    practice: null,
    prFilter: { type: "all", d: "all", lvl: "all", status: "all" }
  };

  var train = null;   // session d'entraînement
  var exam = null;    // examen en cours ou résultat
  var prTimer = null; // chronomètre de la fiche pratique
  var tick = null;

  var view = document.getElementById("view");

  function setTab(tab, keepScroll) {
    ui.tab = tab;
    try { history.replaceState(null, "", "#" + tab); } catch (e) { /* file:// selon navigateurs */ }
    render();
    if (!keepScroll) window.scrollTo(0, 0);
  }

  function render() {
    document.querySelectorAll(".tabs [data-tab]").forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-tab") === ui.tab ? "true" : "false");
    });
    var html = "";
    if (ui.tab === "programme") html = viewProgramme();
    else if (ui.tab === "courses") html = ui.course == null ? viewCourses() : viewCourse(ui.course);
    else if (ui.tab === "train") html = viewTrain();
    else if (ui.tab === "exam") html = viewExam();
    else if (ui.tab === "practice") html = ui.practice == null ? viewPracticeList() : viewPractice(ui.practice);
    else if (ui.tab === "progress") html = viewProgress();
    view.innerHTML = html;
  }

  function levelPill(lvl) {
    lvl = lvl || "essentiel";
    return '<span class="pill lvl-' + esc(lvl) + '">' + esc(lvl) + "</span>";
  }

  function bar(value, cls) {
    return '<div class="bar ' + (cls || "") + '"><span style="width:' + Math.max(0, Math.min(100, value)) + '%"></span></div>';
  }

  // ---------- Programme ----------

  function viewProgramme() {
    var mastered = OBJECTIVES.filter(function (o) { return objStatus(o.id).key === "done"; }).length;
    var h = '<div class="card"><div class="obj-head"><h2 style="margin:0">Programme</h2>' +
      '<span class="small muted">' + mastered + " / " + OBJECTIVES.length + " objectifs maîtrisés</span></div>" +
      '<div style="margin-top:12px">' + bar(pct(mastered, OBJECTIVES.length), "good") + "</div>" +
      '<p class="small muted" style="margin:12px 0 0">Un objectif est « Maîtrisé » avec au moins 80 % de bonnes réponses sur au moins 3 de ses questions, ou si vous cochez « Je maîtrise ». Chaque objectif renvoie à la section d’origine du programme détaillé (§1 à §15).</p></div>';

    DOMAINS.forEach(function (d) {
      h += '<div class="section-head"><span class="dnum">D' + d.id + '</span><h2>' + esc(d.name) +
        '</h2><span class="muted small">' + d.weight + " % · " + domainQuestions(d.id).length + " questions</span></div>";
      h += '<div class="card">';
      OBJECTIVES.filter(function (o) { return o.d === d.id; }).forEach(function (o) {
        var s = objStatus(o.id);
        var courses = coursesForObjective(o.id).map(function (i) {
          return '<button type="button" class="link-btn" data-action="open-course" data-i="' + i + '">C' + (i + 1) + " · " + esc(COURSES[i].title) + "</button>";
        }).join(" · ");
        h += '<div class="obj"><div class="obj-head"><div class="obj-title"><span class="obj-id">' + esc(o.id) + "</span>" + esc(o.title) +
          (o.src ? ' <span class="muted small">(Prog. ' + esc(o.src) + ")</span>" : "") + "</div>" +
          '<span class="pill pill-' + s.key + '">' + s.label + "</span></div>" +
          '<ul class="notions">' + o.notions.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>" +
          '<div class="obj-meta"><span>Cours : ' + (courses || "—") + "</span></div>" +
          '<div class="obj-meta" style="margin-top:8px"><span>Précision : ' + (s.st.seen ? pct(s.st.ok, s.st.seen) + " %" : "—") +
          "</span><span>Questions vues : " + s.st.seen + " / " + s.st.total + "</span>" +
          '<label class="check"><input type="checkbox" data-action="toggle-mastered" data-o="' + esc(o.id) + '"' + (state.mastered[o.id] ? " checked" : "") + "> Je maîtrise</label>" +
          '<button type="button" class="btn btn-small" data-action="train-obj" data-o="' + esc(o.id) + '">S’entraîner</button></div></div>';
      });
      h += "</div>";
    });
    return h;
  }

  // ---------- Cours ----------

  function viewCourses() {
    var read = COURSE_KEYS.filter(function (k) { return state.read[k]; }).length;
    var h = '<div class="obj-head" style="margin-bottom:6px"><h2 style="margin:0">Cours</h2><span class="small muted">' + read + " / " + COURSES.length + " modules lus</span></div>";
    h += '<p class="small muted">Étiquettes : <span class="pill lvl-essentiel">essentiel</span> <span class="pill lvl-avancé">avancé</span> <span class="pill lvl-complément">complément</span> <span class="pill tag-extra">Hors programme</span></p>';
    DOMAINS.forEach(function (d) {
      var list = [];
      COURSES.forEach(function (c, i) { if (c.d === d.id) list.push(i); });
      if (!list.length) return;
      h += '<div class="section-head"><span class="dnum">D' + d.id + '</span><h2>' + esc(d.name) + '</h2><span class="muted small">' + d.weight + " %</span></div>";
      h += '<div class="grid">';
      list.forEach(function (i) {
        var c = COURSES[i];
        h += '<button type="button" class="card card-click course-card" data-action="open-course" data-i="' + i + '">' +
          '<div class="pr-meta"><span class="course-num">MODULE ' + (i + 1) + "</span>" +
          (state.read[COURSE_KEYS[i]] ? '<span class="badge badge-read">LU</span>' : "") + "</div>" +
          "<h3>" + esc(c.title) + '</h3><div class="small muted">' + esc(c.summary) + "</div>" +
          '<div class="course-objs">' + c.o.map(esc).join(" · ") + "</div></button>";
      });
      h += "</div>";
    });
    return h;
  }

  function viewCourse(i) {
    var c = COURSES[i];
    var d = DOMAIN_BY_ID[c.d];
    var h = '<div class="course-detail">';
    h += '<p class="small muted" style="margin:0 0 6px"><span class="dnum">D' + d.id + "</span> " + esc(d.name) + " · Module " + (i + 1) + " / " + COURSES.length + "</p>";
    h += "<h2>" + esc(c.title) + '</h2><p class="muted">' + esc(c.summary) + "</p>";
    h += '<div class="recall"><strong>Objectifs du programme couverts</strong><ul>' +
      c.o.map(function (oid) {
        var o = OBJ_BY_ID[oid];
        return "<li><b>" + esc(oid) + "</b> " + esc(o ? o.title : "") + "</li>";
      }).join("") + "</ul></div>";
    c.sections.forEach(function (s) {
      h += '<div class="card section"><h3>' + esc(s.h) + " " + levelPill(s.lvl) +
        (s.extra ? ' <span class="pill tag-extra">Hors programme</span>' : "") + "</h3>";
      // Le texte des cours est rédigé par l'auteur et peut contenir <b> et <code>.
      if (s.p) h += "<p>" + s.p + "</p>";
      if (s.points) h += "<ul>" + s.points.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>";
      if (s.code) h += "<pre>" + esc(s.code) + "</pre>";
      h += "</div>";
    });
    h += '<div class="btn-row"><button type="button" class="btn btn-ghost" data-action="courses-home">← Tous les cours</button>' +
      '<button type="button" class="btn btn-primary" data-action="train-course" data-i="' + i + '">S’entraîner sur ces objectifs</button>' +
      (i + 1 < COURSES.length ? '<button type="button" class="btn" data-action="open-course" data-i="' + (i + 1) + '">Module suivant →</button>' : "") +
      "</div></div>";
    return h;
  }

  function openCourse(i) {
    ui.course = i;
    state.read[COURSE_KEYS[i]] = true;
    save();
    setTab("courses");
  }

  // ---------- Entraînement ----------

  function trainPool(base) {
    var list = QS;
    if (ui.trainObj) {
      var objs = ui.trainObj;
      list = list.filter(function (q) { return objs.indexOf(q.o) !== -1; });
    } else if (ui.trainDomain) {
      list = list.filter(function (q) { return q.d === ui.trainDomain; });
    }
    base = base || ui.trainFilter;
    if (base === "never") list = list.filter(function (q) { return !state.answers[q.id]; });
    if (base === "errors") list = list.filter(function (q) { var r = state.answers[q.id]; return r && !r.ok; });
    return list;
  }

  function newTrain() {
    var ids = shuffle(trainPool().map(function (q) { return q.id; }));
    train = { queue: ids, pos: 0, cur: null };
    nextTrainQuestion(true);
  }

  function nextTrainQuestion(first) {
    if (!first) train.pos++;
    if (train.pos >= train.queue.length) {
      // Fin de série : on recalcule la liste et on la mélange à nouveau.
      train.queue = shuffle(trainPool().map(function (q) { return q.id; }));
      train.pos = 0;
    }
    var id = train.queue[train.pos];
    if (!id) { train.cur = null; return; }
    var q = Q_BY_ID[id];
    train.cur = { id: id, perm: shuffle(q.a.map(function (_, k) { return k; })), sel: [], done: false, ok: false };
  }

  function setTrainFilter(f, d) {
    ui.trainFilter = f;
    ui.trainDomain = d || null;
    newTrain();
    setTab("train", true);
  }

  function trainOn(objs) {
    ui.trainObj = objs;
    ui.trainFilter = "all";
    ui.trainDomain = null;
    newTrain();
    setTab("train");
  }

  function questionBlock(q, cur, mode) {
    var o = OBJ_BY_ID[q.o];
    var h = '<div class="q-obj">Objectif ' + esc(q.o) + " · " + esc(o ? o.title : "") + "</div>";
    h += '<p class="q-text">' + fmt(q.q) + "</p><div class=\"answers\">";
    cur.perm.forEach(function (orig, k) {
      var cls = "answer";
      var chosen = cur.sel.indexOf(k) !== -1;
      if (mode === "review") {
        if (q.c.indexOf(orig) !== -1) cls += " correct";
        else if (chosen) cls += " wrong";
      } else if (chosen) cls += " selected";
      h += '<button type="button" class="' + cls + '" data-action="' + (mode === "exam" ? "exam-answer" : "answer") + '" data-k="' + k + '"' +
        (mode === "review" ? " disabled" : "") + '><span class="letter">' + LETTERS[k] + '</span><span class="txt">' + fmt(q.a[orig]) + "</span></button>";
    });
    h += "</div>";
    return h;
  }

  function correctLetters(q, perm) {
    var out = [];
    perm.forEach(function (orig, k) { if (q.c.indexOf(orig) !== -1) out.push(LETTERS[k]); });
    return out.join(", ");
  }

  function viewTrain() {
    if (!train) newTrain();
    var all = statsFor(QS);
    var h = '<div class="stats"><div class="stat"><b>' + all.seen + '</b><span>questions différentes répondues</span></div>' +
      '<div class="stat"><b>' + (all.seen ? pct(all.ok, all.seen) + " %" : "—") + '</b><span>précision</span></div>' +
      '<div class="stat streak"><b>' + state.streak + '</b><span>série de bonnes réponses</span></div></div>';

    if (ui.trainObj) {
      h += '<div class="active-filter"><span>Filtre actif : objectif' + (ui.trainObj.length > 1 ? "s " : " ") + "<b>" +
        ui.trainObj.map(function (id) { return esc(id) + (ui.trainObj.length === 1 && OBJ_BY_ID[id] ? " · " + esc(OBJ_BY_ID[id].title) : ""); }).join(", ") +
        '</b></span><button type="button" class="btn btn-small btn-ghost" data-action="clear-obj">Retirer le filtre ✕</button></div>';
    }

    var chip = function (label, f, d, n) {
      var on = ui.trainFilter === f && (ui.trainDomain || null) === (d || null);
      return '<button type="button" class="chip" aria-pressed="' + on + '" data-action="train-filter" data-f="' + f + '" data-d="' + (d || "") + '">' +
        esc(label) + '<span class="n">' + n + "</span></button>";
    };
    var savedDomain = ui.trainDomain;
    ui.trainDomain = null;
    h += '<div class="filters">' + chip("Toutes", "all", null, trainPool("all").length) +
      chip("Jamais répondues", "never", null, trainPool("never").length) +
      chip("Erreurs à revoir", "errors", null, trainPool("errors").length);
    if (!ui.trainObj) {
      DOMAINS.forEach(function (d) { h += chip("D" + d.id + " · " + d.name, "all", d.id, domainQuestions(d.id).length); });
    }
    ui.trainDomain = savedDomain;
    h += "</div>";

    if (!train.cur) {
      if (ui.trainFilter === "errors") {
        h += '<div class="card empty"><h3>Bravo, aucune erreur à revoir !</h3><p class="muted">Toutes vos réponses récentes sont justes dans cette sélection. Continuez avec « Jamais répondues » ou passez une évaluation.</p></div>';
      } else {
        h += '<div class="card empty"><h3>Aucune question dans cette sélection</h3><p class="muted">Changez de filtre pour continuer.</p></div>';
      }
      return h;
    }

    var q = Q_BY_ID[train.cur.id];
    var cur = train.cur;
    h += '<div class="card"><div class="small muted" style="margin-bottom:6px">Question ' + (train.pos + 1) + " / " + train.queue.length +
      (q.multi ? " · réponses multiples" : "") + "</div>";
    h += questionBlock(q, cur, cur.done ? "review" : "train");
    if (!cur.done && q.multi) {
      h += '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="validate"' + (cur.sel.length === q.c.length ? "" : " disabled") +
        ">Valider (" + cur.sel.length + " / " + q.c.length + ")</button></div>";
    }
    if (cur.done) {
      h += '<div class="feedback ' + (cur.ok ? "ok" : "ko") + '"><strong>' + (cur.ok ? "Bonne réponse" : "À revoir") + "</strong> — réponse" +
        (q.multi ? "s attendues" : " attendue") + " : <b>" + correctLetters(q, cur.perm) + "</b><p style=\"margin:8px 0 0\">" + fmt(q.e) + "</p></div>";
      h += '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="next">Question suivante →</button>' +
        coursesForObjective(q.o).slice(0, 1).map(function (i) {
          return '<button type="button" class="btn btn-ghost" data-action="open-course" data-i="' + i + '">Revoir le cours C' + (i + 1) + "</button>";
        }).join("") + "</div>";
    }
    h += '<div class="kbd-hint">Clavier : touches A à ' + LETTERS[q.a.length - 1] + " pour répondre, Entrée pour valider ou passer à la suite.</div></div>";
    return h;
  }

  function trainAnswer(k) {
    var cur = train && train.cur;
    if (!cur || cur.done) return;
    var q = Q_BY_ID[cur.id];
    if (k >= q.a.length) return;
    if (!q.multi) { cur.sel = [k]; validateTrain(); return; }
    var at = cur.sel.indexOf(k);
    if (at !== -1) cur.sel.splice(at, 1);
    else if (cur.sel.length < q.c.length) cur.sel.push(k);
    render();
  }

  function validateTrain() {
    var cur = train.cur;
    var q = Q_BY_ID[cur.id];
    if (cur.sel.length !== q.c.length) return;
    var chosen = cur.sel.map(function (k) { return cur.perm[k]; });
    cur.ok = sameSet(chosen, q.c);
    cur.done = true;
    recordAnswer(q.id, cur.ok);
    state.streak = cur.ok ? state.streak + 1 : 0;
    save();
    render();
  }

  // ---------- Évaluation (examen blanc) ----------

  function examTotal() { return DOMAINS.reduce(function (s, d) { return s + d.examCount; }, 0); }

  function viewExam() {
    if (exam && !exam.done) return viewExamRunning();
    if (exam && exam.done) return viewExamResult();
    var total = examTotal();
    var h = '<div class="card"><h2>Évaluation — simulation interne</h2>' +
      '<p><b>Format non officiel.</b> Anthropic ne propose pas d’examen correspondant à cette évaluation : il s’agit d’un entraînement interne à l’application, qui ne délivre aucune certification.</p>' +
      "<ul><li><b>" + total + " questions</b> tirées au hasard selon la pondération des domaines</li><li><b>" + EXAM_MINUTES + " minutes</b>, chronomètre décroissant, fin automatique à zéro</li>" +
      "<li>Seuil de réussite : <b>" + PASS_RATE + " %</b> (score estimé = pourcentage de bonnes réponses)</li>" +
      "<li>Aucune correction pendant l’évaluation ; vous pouvez marquer des questions pour y revenir</li>" +
      "<li>Une question à réponses multiples n’est juste que si toutes les bonnes réponses sont choisies</li></ul>" +
      '<div class="table-wrap"><table><thead><tr><th>Domaine</th><th>Poids</th><th>Questions</th></tr></thead><tbody>' +
      DOMAINS.map(function (d) { return "<tr><td>D" + d.id + " · " + esc(d.name) + "</td><td>" + d.weight + " %</td><td>" + d.examCount + "</td></tr>"; }).join("") +
      '</tbody></table></div><div class="btn-row"><button type="button" class="btn btn-primary" data-action="exam-start">Commencer l’évaluation</button></div></div>';
    h += examHistory();
    return h;
  }

  function examHistory() {
    if (!state.exams.length) return '<div class="card"><h3>Historique</h3><p class="muted" style="margin:0">Aucune évaluation passée pour l’instant.</p></div>';
    return '<div class="card"><h3>Historique des évaluations</h3><div class="table-wrap"><table><thead><tr><th>Date</th><th>Score</th><th>Bonnes réponses</th><th>Résultat</th></tr></thead><tbody>' +
      state.exams.slice().reverse().map(function (x) {
        return "<tr><td>" + fmtDate(x.date) + "</td><td>" + x.score + " %</td><td>" + x.correct + " / " + x.total + '</td><td class="' +
          (x.passed ? "result-pass" : "result-fail") + '">' + (x.passed ? "Réussi" : "Non réussi") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
  }

  function startExam() {
    var ids = [];
    DOMAINS.forEach(function (d) {
      shuffle(domainQuestions(d.id)).slice(0, d.examCount).forEach(function (q) { ids.push(q.id); });
    });
    ids = shuffle(ids);
    exam = {
      ids: ids,
      perms: ids.map(function (id) { return shuffle(Q_BY_ID[id].a.map(function (_, k) { return k; })); }),
      sel: ids.map(function () { return []; }),
      flags: ids.map(function () { return false; }),
      cur: 0,
      end: Date.now() + EXAM_MINUTES * 60 * 1000,
      done: false
    };
    startTick();
    render();
    window.scrollTo(0, 0);
  }

  function viewExamRunning() {
    var i = exam.cur, q = Q_BY_ID[exam.ids[i]];
    var left = (exam.end - Date.now()) / 1000;
    var answered = exam.sel.filter(function (s) { return s.length; }).length;
    var h = '<div class="exam-layout"><div><div class="card"><div class="small muted" style="margin-bottom:6px">Question ' + (i + 1) + " / " + exam.ids.length +
      (q.multi ? " · réponses multiples (" + exam.sel[i].length + " / " + q.c.length + ")" : "") + (exam.flags[i] ? " · marquée pour révision" : "") + "</div>";
    h += questionBlock(q, { perm: exam.perms[i], sel: exam.sel[i] }, "exam");
    h += '<div class="exam-nav"><button type="button" class="btn btn-ghost" data-action="exam-prev"' + (i === 0 ? " disabled" : "") + '>← Précédente</button>' +
      '<button type="button" class="btn btn-ghost" data-action="exam-flag">' + (exam.flags[i] ? "Retirer la marque" : "Marquer pour révision") + "</button>" +
      (i + 1 < exam.ids.length ? '<button type="button" class="btn" data-action="exam-next">Suivante →</button>' :
        '<button type="button" class="btn btn-primary" data-action="exam-finish">Terminer</button>') + "</div>" +
      '<div class="kbd-hint">Clavier : A à ' + LETTERS[q.a.length - 1] + " pour répondre, Entrée pour la question suivante.</div></div></div>";
    h += '<aside class="exam-side"><div class="card"><div class="small muted">Temps restant</div><div class="timer' + (left < 300 ? " warn" : "") + '" id="exam-timer">' + fmtTime(left) + "</div>" +
      '<div class="small muted">' + answered + " / " + exam.ids.length + " répondues</div><div class=\"qgrid\">";
    exam.ids.forEach(function (_, k) {
      var cls = "qnum" + (exam.sel[k].length ? " answered" : "") + (exam.flags[k] ? " flagged" : "") + (k === i ? " current" : "");
      h += '<button type="button" class="' + cls + '" data-action="exam-go" data-k="' + k + '" aria-label="Question ' + (k + 1) + '">' + (k + 1) + "</button>";
    });
    h += '</div><div class="legend"><span>▣ répondue</span><span style="color:var(--orange-text)">● marquée</span><span>▢ en cours (bordure orange)</span></div>' +
      '<div class="btn-row" style="margin-top:12px"><button type="button" class="btn btn-primary btn-small" data-action="exam-finish">Terminer l’évaluation</button></div></div></aside></div>';
    return h;
  }

  function examAnswer(k) {
    if (!exam || exam.done) return;
    var q = Q_BY_ID[exam.ids[exam.cur]];
    if (k >= q.a.length) return;
    var sel = exam.sel[exam.cur];
    if (!q.multi) { exam.sel[exam.cur] = sel[0] === k ? [] : [k]; }
    else {
      var at = sel.indexOf(k);
      if (at !== -1) sel.splice(at, 1);
      else if (sel.length < q.c.length) sel.push(k);
    }
    render();
  }

  function confirmFinish() {
    var unanswered = [], flagged = [];
    exam.ids.forEach(function (id, k) {
      var q = Q_BY_ID[id];
      if (exam.sel[k].length < q.c.length) unanswered.push(k + 1);
      if (exam.flags[k]) flagged.push(k + 1);
    });
    var msg = "Terminer l’évaluation ?";
    if (unanswered.length) msg += "\n\nQuestions sans réponse complète (" + unanswered.length + ") : " + unanswered.join(", ");
    if (flagged.length) msg += "\n\nQuestions marquées pour révision (" + flagged.length + ") : " + flagged.join(", ");
    if (window.confirm(msg)) finishExam();
  }

  function finishExam() {
    stopTick();
    var correct = 0, byDomain = {}, wrong = [];
    exam.ids.forEach(function (id, k) {
      var q = Q_BY_ID[id];
      var chosen = exam.sel[k].map(function (x) { return exam.perms[k][x]; });
      var ok = chosen.length === q.c.length && sameSet(chosen, q.c);
      if (!byDomain[q.d]) byDomain[q.d] = { ok: 0, total: 0 };
      byDomain[q.d].total++;
      if (ok) { correct++; byDomain[q.d].ok++; } else wrong.push(k);
      if (chosen.length) recordAnswer(id, ok);
    });
    var score = pct(correct, exam.ids.length);
    exam.done = true;
    exam.result = { correct: correct, score: score, passed: score >= PASS_RATE, byDomain: byDomain, wrong: wrong };
    state.exams.push({ date: Date.now(), score: score, correct: correct, total: exam.ids.length, passed: score >= PASS_RATE });
    state.exams = state.exams.slice(-20);
    save();
    render();
    window.scrollTo(0, 0);
  }

  function viewExamResult() {
    var r = exam.result;
    var h = '<div class="card"><div class="small muted">Résultat de l’évaluation (simulation interne, non officielle)</div>' +
      '<div class="score-big ' + (r.passed ? "result-pass" : "result-fail") + '">' + r.score + " %</div>" +
      "<p><b class=\"" + (r.passed ? "result-pass" : "result-fail") + '">' + (r.passed ? "Réussi" : "Non réussi") + "</b> — " + r.correct + " / " + exam.ids.length +
      " bonnes réponses. Seuil : " + PASS_RATE + " %. Ce score est une estimation linéaire (pourcentage de bonnes réponses), sans valeur officielle.</p></div>";

    h += '<div class="card"><h3>Résultat par domaine</h3>';
    DOMAINS.forEach(function (d) {
      var b = r.byDomain[d.id] || { ok: 0, total: 0 };
      var p = pct(b.ok, b.total);
      h += '<div class="bar-row"><div><div class="label">D' + d.id + " · " + esc(d.name) + "</div>" + bar(p, p >= 70 ? "good" : "bad") +
        '</div><div class="val">' + b.ok + " / " + b.total + "</div></div>";
    });
    h += "</div>";

    var missed = {};
    r.wrong.forEach(function (k) { missed[Q_BY_ID[exam.ids[k]].o] = true; });
    var missedIds = Object.keys(missed).sort(function (a, b) { return a.localeCompare(b, "fr", { numeric: true }); });
    h += '<div class="card"><h3>Objectifs à retravailler</h3>';
    if (!missedIds.length) h += '<p class="muted" style="margin:0">Aucune erreur : bravo !</p>';
    else {
      h += "<ul>" + missedIds.map(function (oid) {
        var o = OBJ_BY_ID[oid];
        var links = coursesForObjective(oid).map(function (i) {
          return '<button type="button" class="link-btn" data-action="open-course" data-i="' + i + '">C' + (i + 1) + " · " + esc(COURSES[i].title) + "</button>";
        }).join(", ");
        return "<li><b>" + esc(oid) + "</b> " + esc(o ? o.title : "") + " — " + links + "</li>";
      }).join("") + "</ul>";
    }
    h += "</div>";

    if (r.wrong.length) {
      h += '<details class="card"><summary>Voir les ' + r.wrong.length + " erreurs et leur correction</summary>";
      r.wrong.forEach(function (k) {
        var q = Q_BY_ID[exam.ids[k]];
        var chosen = exam.sel[k].map(function (x) { return LETTERS[x]; }).join(", ") || "aucune";
        h += '<div class="err-item"><div class="small muted">Question ' + (k + 1) + "</div>" +
          questionBlock(q, { perm: exam.perms[k], sel: exam.sel[k] }, "review") +
          '<div class="feedback ko"><strong>Votre réponse : ' + chosen + " · Attendue : " + correctLetters(q, exam.perms[k]) + '</strong><p style="margin:8px 0 0">' + fmt(q.e) + "</p></div></div>";
      });
      h += "</details>";
    }
    h += '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="exam-start">Nouvelle évaluation</button>' +
      '<button type="button" class="btn btn-ghost" data-action="exam-home">Retour à l’accueil de l’évaluation</button>' +
      '<button type="button" class="btn btn-ghost" data-action="train-errors">Revoir mes erreurs</button></div>';
    return h;
  }

  function startTick() {
    stopTick();
    tick = setInterval(onTick, 500);
  }
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }

  function onTick() {
    if (exam && !exam.done) {
      var left = (exam.end - Date.now()) / 1000;
      if (left <= 0) { finishExam(); return; }
      var el = document.getElementById("exam-timer");
      if (el) { el.textContent = fmtTime(left); el.classList.toggle("warn", left < 300); }
    }
    if (prTimer && prTimer.running) {
      var t = document.getElementById("pr-timer");
      if (t) {
        var el2 = prElapsed();
        t.textContent = fmtTime(el2);
        var p = PRACTICE_BY_ID[prTimer.id];
        t.classList.toggle("warn", p && el2 > p.minutes * 60);
      }
    }
  }

  window.addEventListener("beforeunload", function (e) {
    if (exam && !exam.done) { e.preventDefault(); e.returnValue = ""; return ""; }
  });

  // ---------- Pratique ----------

  var PRACTICE_BY_ID = {};
  PRACTICE.forEach(function (p) { PRACTICE_BY_ID[p.id] = p; });
  var TYPE_LABELS = { exercice: "Exercices", mission: "Missions", projet: "Projets" };
  var TYPE_SINGULAR = { exercice: "Exercice", mission: "Mission", projet: "Projet" };

  function practiceFiltered() {
    var f = ui.prFilter;
    return PRACTICE.filter(function (p) {
      return (f.type === "all" || p.type === f.type) && (f.d === "all" || String(p.d) === String(f.d)) &&
        (f.lvl === "all" || p.level === f.lvl) && (f.status === "all" || practiceStatus(p) === f.status);
    });
  }

  function viewPracticeList() {
    var h = '<div class="obj-head" style="margin-bottom:10px"><h2 style="margin:0">Pratique</h2></div>';
    h += '<div class="note">Ces fiches se réalisent dans un vrai projet, avec Claude Code ouvert dans votre terminal ou votre IDE. Évaluez-vous sur votre capacité à <b>piloter</b> l’outil (contexte, contraintes, plan, vérification du diff et des tests), pas seulement sur le résultat obtenu.</div>';
    h += '<div class="stats">';
    ["exercice", "mission", "projet"].forEach(function (t) {
      var list = PRACTICE.filter(function (p) { return p.type === t; });
      var done = list.filter(function (p) { return practiceStatus(p) === "done"; }).length;
      h += '<div class="stat"><b>' + done + " / " + list.length + "</b><span>" + TYPE_LABELS[t].toLowerCase() + " terminés</span></div>";
    });
    h += "</div>";

    var f = ui.prFilter;
    var chip = function (key, val, label) {
      return '<button type="button" class="chip" aria-pressed="' + (String(f[key]) === String(val)) + '" data-action="pr-filter" data-key="' + key + '" data-val="' + esc(val) + '">' + esc(label) + "</button>";
    };
    h += '<div class="filters">' + chip("type", "all", "Tous types") + chip("type", "exercice", "Exercices") + chip("type", "mission", "Missions") + chip("type", "projet", "Projets") + "</div>";
    h += '<div class="filters">' + chip("status", "all", "Tous statuts") + chip("status", "todo", "À faire") + chip("status", "progress", "En cours") + chip("status", "done", "Terminés") +
      chip("lvl", "all", "Tous niveaux") + chip("lvl", "essentiel", "Essentiel") + chip("lvl", "avancé", "Avancé") + chip("lvl", "complément", "Complément") + "</div>";
    h += '<div class="filters">' + chip("d", "all", "Tous domaines") + DOMAINS.map(function (d) { return chip("d", d.id, "D" + d.id + " · " + d.name); }).join("") + "</div>";

    var list = practiceFiltered();
    if (!list.length) return h + '<div class="card empty"><p class="muted">Aucune fiche ne correspond à ces filtres.</p></div>';
    ["exercice", "mission", "projet"].forEach(function (t) {
      var sub = list.filter(function (p) { return p.type === t; });
      if (!sub.length) return;
      h += '<div class="section-head"><h2>' + TYPE_LABELS[t] + '</h2><span class="muted small">' + sub.length + " fiche" + (sub.length > 1 ? "s" : "") + "</span></div><div class=\"grid\">";
      sub.forEach(function (p) {
        var st = practiceStatus(p);
        h += '<button type="button" class="card card-click" data-action="open-practice" data-id="' + esc(p.id) + '"><div class="pr-meta">' +
          '<span class="course-num">' + TYPE_SINGULAR[p.type].toUpperCase() + "</span>" + levelPill(p.level) + '<span class="pill">' + p.minutes + " min</span>" +
          (st === "done" ? '<span class="badge badge-read">TERMINÉ</span>' : st === "progress" ? '<span class="pill pill-progress">en cours</span>' : "") + "</div>" +
          "<h3>" + esc(p.title) + '</h3><div class="small muted">' + fmt(p.context) + '</div><div class="course-objs">D' + p.d + " · " + p.o.map(esc).join(" · ") + "</div></button>";
      });
      h += "</div>";
    });
    return h;
  }

  function prElapsed() {
    if (!prTimer) return 0;
    return prTimer.elapsed + (prTimer.running ? (Date.now() - prTimer.startedAt) / 1000 : 0);
  }

  function viewPractice(id) {
    var p = PRACTICE_BY_ID[id];
    var r = state.practice[id] || { c: [] };
    var d = DOMAIN_BY_ID[p.d];
    if (!prTimer || prTimer.id !== id) prTimer = { id: id, elapsed: 0, running: false, startedAt: 0 };
    var el = prElapsed();
    var h = '<p class="small muted" style="margin:0 0 6px">' + TYPE_SINGULAR[p.type] + " · <span class=\"dnum\">D" + d.id + "</span> " + esc(d.name) + "</p>";
    h += "<h2>" + esc(p.title) + '</h2><div class="pr-meta" style="margin-bottom:14px">' + levelPill(p.level) + '<span class="pill">' + p.minutes + " min conseillées</span>" +
      '<span class="pill">Objectifs ' + p.o.map(esc).join(" · ") + "</span></div>";
    h += '<div class="card"><h3>Mise en situation</h3><p style="margin:0">' + fmt(p.context) + "</p></div>";
    h += '<div class="card"><h3>Étapes</h3><ol class="steps">' + p.steps.map(function (s) { return "<li>" + fmt(s) + "</li>"; }).join("") + "</ol></div>";
    h += '<div class="card"><h3>Exemple de prompt</h3><div class="prompt-box"><button type="button" class="btn btn-small btn-ghost" data-action="copy-prompt">Copier</button><pre id="pr-prompt">' +
      esc(p.prompt) + "</pre></div></div>";
    h += '<div class="card"><h3>Chronomètre</h3><div class="pr-timer"><span class="timer' + (el > p.minutes * 60 ? " warn" : "") + '" id="pr-timer">' + fmtTime(el) + "</span>" +
      '<span class="muted small">/ ' + p.minutes + " min</span>" +
      '<button type="button" class="btn btn-small" data-action="pr-timer-toggle">' + (prTimer.running ? "Pause" : el > 0 ? "Reprendre" : "Démarrer") + "</button>" +
      '<button type="button" class="btn btn-small btn-ghost" data-action="pr-timer-reset">Réinitialiser</button></div></div>';
    h += '<div class="card"><h3>Critères de réussite <span class="small muted">(' + r.c.length + " / " + p.criteria.length + ")</span></h3><ul class=\"criteria\">" +
      p.criteria.map(function (c, k) {
        return '<li><label><input type="checkbox" data-action="pr-criterion" data-id="' + esc(id) + '" data-k="' + k + '"' + (r.c.indexOf(k) !== -1 ? " checked" : "") + "><span>" + fmt(c) + "</span></label></li>";
      }).join("") + "</ul>" + (practiceStatus(p) === "done" ? '<p class="result-pass" style="margin:10px 0 0"><b>Fiche terminée.</b></p>' : "") + "</div>";
    h += '<details class="card"><summary>Voir la démarche corrigée</summary><div style="margin-top:12px">' +
      p.solution.split("\n").map(function (line) { return "<p>" + fmt(line) + "</p>"; }).join("") + "</div></details>";
    var courseLinks = [];
    p.o.forEach(function (oid) { coursesForObjective(oid).forEach(function (i) { if (courseLinks.indexOf(i) === -1) courseLinks.push(i); }); });
    h += '<div class="card"><h3>Cours associés</h3>' + courseLinks.map(function (i) {
      return '<button type="button" class="link-btn" data-action="open-course" data-i="' + i + '">C' + (i + 1) + " · " + esc(COURSES[i].title) + "</button>";
    }).join("<br>") + "</div>";
    var idx = PRACTICE.indexOf(p);
    h += '<div class="btn-row"><button type="button" class="btn btn-ghost" data-action="practice-home">← Toutes les fiches</button>' +
      (idx + 1 < PRACTICE.length ? '<button type="button" class="btn" data-action="open-practice" data-id="' + esc(PRACTICE[idx + 1].id) + '">Fiche suivante →</button>' : "") + "</div>";
    return h;
  }

  function copyPrompt(btn) {
    var p = PRACTICE_BY_ID[ui.practice];
    var done = function () { btn.textContent = "Copié ✓"; setTimeout(function () { btn.textContent = "Copier"; }, 1500); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(p.prompt).then(done, function () { selectPrompt(); });
      } else selectPrompt();
    } catch (e) { selectPrompt(); }
  }

  // Repli : on sélectionne le texte pour une copie manuelle.
  function selectPrompt() {
    try {
      var el = document.getElementById("pr-prompt");
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* ignoré */ }
  }

  // ---------- Progression ----------

  function viewProgress() {
    var mastered = OBJECTIVES.filter(function (o) { return objStatus(o.id).key === "done"; }).length;
    var read = COURSE_KEYS.filter(function (k) { return state.read[k]; }).length;
    var all = statsFor(QS);
    var prDone = PRACTICE.filter(function (p) { return practiceStatus(p) === "done"; }).length;
    var best = state.exams.reduce(function (m, x) { return Math.max(m, x.score); }, -1);
    var h = '<div class="stats">' +
      '<div class="stat"><b>' + mastered + " / " + OBJECTIVES.length + "</b><span>objectifs maîtrisés</span></div>" +
      '<div class="stat"><b>' + read + " / " + COURSES.length + "</b><span>cours lus</span></div>" +
      '<div class="stat"><b>' + all.seen + " / " + QS.length + "</b><span>questions vues</span></div>" +
      '<div class="stat"><b>' + prDone + " / " + PRACTICE.length + "</b><span>fiches pratiques terminées</span></div>" +
      '<div class="stat"><b>' + (best >= 0 ? best + " %" : "—") + "</b><span>meilleur score d’évaluation</span></div></div>";

    h += '<div class="card"><h3>Précision par domaine</h3>';
    DOMAINS.forEach(function (d) {
      var s = statsFor(domainQuestions(d.id));
      var p = pct(s.ok, s.seen);
      h += '<div class="bar-row"><div><div class="label">D' + d.id + " · " + esc(d.name) + ' <span class="muted small">(' + s.seen + " / " + s.total + " vues)</span></div>" +
        bar(s.seen ? p : 0, p >= 70 ? "good" : "bad") + '</div><div class="val">' + (s.seen ? p + " %" : "—") + "</div></div>";
    });
    h += "</div>";

    var worked = [], fresh = [];
    OBJECTIVES.forEach(function (o) {
      var s = objStatus(o.id);
      if (s.st.seen > 0 && s.key !== "done") worked.push({ o: o, acc: s.st.acc });
      else if (s.st.seen === 0 && s.key !== "done") fresh.push({ o: o });
    });
    worked.sort(function (a, b) { return a.acc - b.acc; });
    var prio = worked.slice(0, 3).concat(fresh.slice(0, Math.max(0, 5 - Math.min(3, worked.length))));
    h += '<div class="card"><h3>Priorité de révision</h3>';
    if (!prio.length) h += '<p class="muted" style="margin:0">Tous les objectifs sont maîtrisés. Passez une évaluation pour le confirmer.</p>';
    else {
      h += '<ul class="priority">' + prio.map(function (x) {
        return "<li><b>" + esc(x.o.id) + "</b> " + esc(x.o.title) + ' <span class="muted small">' + (x.acc != null ? "— précision " + pct(x.acc * 100, 100) + " %" : "— jamais abordé") +
          '</span> <button type="button" class="btn btn-small" data-action="train-obj" data-o="' + esc(x.o.id) + '">S’entraîner</button></li>';
      }).join("") + "</ul>";
    }
    h += "</div>";
    h += examHistory();
    return h;
  }

  // ---------- Événements ----------

  document.addEventListener("click", function (e) {
    var tabBtn = e.target.closest("[data-tab]");
    if (tabBtn) {
      var t = tabBtn.getAttribute("data-tab");
      if (t === "courses") ui.course = null;
      if (t === "practice") ui.practice = null;
      setTab(t);
      return;
    }
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var a = el.getAttribute("data-action");
    if (el.type === "checkbox") return; // géré par l'événement change

    switch (a) {
      case "reset":
        if (window.confirm("Effacer toute votre progression (réponses, cours lus, évaluations, fiches pratiques) ?")) {
          state = emptyState();
          save();
          exam = null; train = null; prTimer = null; stopTick();
          render();
        }
        break;
      case "open-course": openCourse(+el.getAttribute("data-i")); break;
      case "courses-home": ui.course = null; setTab("courses"); break;
      case "train-obj": trainOn([el.getAttribute("data-o")]); break;
      case "train-course": trainOn(COURSES[+el.getAttribute("data-i")].o.slice()); break;
      case "clear-obj": ui.trainObj = null; newTrain(); render(); break;
      case "train-filter": {
        var d = el.getAttribute("data-d");
        setTrainFilter(el.getAttribute("data-f"), d ? +d : null);
        break;
      }
      case "train-errors": ui.trainObj = null; setTrainFilter("errors", null); break;
      case "answer": trainAnswer(+el.getAttribute("data-k")); break;
      case "validate": validateTrain(); break;
      case "next": nextTrainQuestion(false); render(); break;
      case "exam-start": startExam(); break;
      case "exam-home": exam = null; render(); break;
      case "exam-answer": examAnswer(+el.getAttribute("data-k")); break;
      case "exam-prev": if (exam.cur > 0) { exam.cur--; render(); } break;
      case "exam-next": if (exam.cur + 1 < exam.ids.length) { exam.cur++; render(); } break;
      case "exam-go": exam.cur = +el.getAttribute("data-k"); render(); break;
      case "exam-flag": exam.flags[exam.cur] = !exam.flags[exam.cur]; render(); break;
      case "exam-finish": confirmFinish(); break;
      case "open-practice": ui.practice = el.getAttribute("data-id"); setTab("practice"); break;
      case "practice-home": ui.practice = null; setTab("practice"); break;
      case "pr-filter": ui.prFilter[el.getAttribute("data-key")] = el.getAttribute("data-val"); render(); break;
      case "copy-prompt": copyPrompt(el); break;
      case "pr-timer-toggle":
        if (prTimer.running) { prTimer.elapsed = prElapsed(); prTimer.running = false; }
        else { prTimer.running = true; prTimer.startedAt = Date.now(); if (!tick) startTick(); }
        render();
        break;
      case "pr-timer-reset": prTimer = { id: ui.practice, elapsed: 0, running: false, startedAt: 0 }; render(); break;
    }
  });

  document.addEventListener("change", function (e) {
    var el = e.target;
    var a = el.getAttribute && el.getAttribute("data-action");
    if (a === "toggle-mastered") {
      var o = el.getAttribute("data-o");
      if (el.checked) state.mastered[o] = true; else delete state.mastered[o];
      save();
      render();
    } else if (a === "pr-criterion") {
      var id = el.getAttribute("data-id"), k = +el.getAttribute("data-k");
      var r = state.practice[id] || { c: [] };
      var at = r.c.indexOf(k);
      if (el.checked && at === -1) r.c.push(k);
      if (!el.checked && at !== -1) r.c.splice(at, 1);
      state.practice[id] = r;
      save();
      render();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    var key = e.key.toUpperCase();
    var k = LETTERS.indexOf(key);

    if (ui.tab === "train" && train && train.cur) {
      if (k !== -1 && key.length === 1) { e.preventDefault(); trainAnswer(k); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (train.cur.done) { nextTrainQuestion(false); render(); }
        else if (Q_BY_ID[train.cur.id].multi) validateTrain();
      }
    } else if (ui.tab === "exam" && exam && !exam.done) {
      if (k !== -1 && key.length === 1) { e.preventDefault(); examAnswer(k); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (exam.cur + 1 < exam.ids.length) { exam.cur++; render(); } else confirmFinish();
      }
    }
  });

  // ---------- Application installable (PWA) ----------

  // En file://, Chrome refuse le manifeste (erreur CORS) et les service workers : on ne les active qu'en http(s).
  if (location.protocol === "http:" || location.protocol === "https:") {
    var link = document.createElement("link");
    link.rel = "manifest";
    link.href = "manifest.webmanifest";
    document.head.appendChild(link);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () { /* sans service worker, l'app reste utilisable */ });
      });
    }
  }

  var installBtn = document.getElementById("install-btn");
  var deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener("click", function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        installBtn.hidden = true;
      }, function () { /* ignoré */ });
    });
  }

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    if (installBtn) installBtn.hidden = true;
  });

  // ---------- Démarrage ----------

  var initial = (location.hash || "").replace("#", "");
  if (["programme", "courses", "train", "exam", "practice", "progress"].indexOf(initial) !== -1) ui.tab = initial;
  render();
})();
