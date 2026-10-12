// Registre des certifications.
// Chaque certification disponible a ses données dans certs/<id>/ (domains, programme, courses,
// questions, practice et, si l’examen est organisé en scénarios, scenarios).
// exam.scoring : "percent" (score en %, seuil en %) ou "scaled" (estimation linéaire 100–1 000).
const CERTS = [
  {
    id: "ccar-f",
    status: "available",
    official: true,
    code: "CCAR-F",
    name: "Claude Certified Architect – Foundations",
    short: "Architect Foundations",
    storeKey: "ccar-f-prep-v1",
    files: ["domains", "programme", "courses", "questions", "practice", "scenarios"],
    summary: "Concevoir des applications de production avec l’API Claude, l’Agent SDK, Claude Code et le MCP.",
    hero: {
      kicker: "Claude Certified Architect – Foundations · Préparation",
      title: "Concevoir. Orchestrer. Fiabiliser.",
      lead: "Préparez l’examen CCAR-F : architecture agentique, conception d’outils et MCP, configuration de Claude Code, prompt engineering et sortie structurée, gestion du contexte et fiabilité.",
      format: "Examen : 60 questions · 120 min · 4 scénarios sur 6 · réussite à 720 / 1 000 — préparation indépendante, non affiliée à Anthropic"
    },
    exam: {
      label: "Examen blanc", title: "Examen blanc CCAR-F", minutes: 120, scoring: "scaled", pass: 720, scenarioCount: 4,
      intro: "Cet examen blanc reproduit le format décrit dans le guide d’examen officiel (version 1.0, juillet 2026). Il reste un <b>entraînement non officiel</b> : seul l’examen surveillé d’Anthropic délivre la certification."
    },
    programmeNote: "Chaque objectif correspond à un <i>task statement</i> du guide d’examen CCAR-F.",
    practiceNote: "Ces fiches se réalisent pour de vrai : avec l’API Claude, le Claude Agent SDK, Claude Code et des serveurs MCP. Évaluez-vous sur vos <b>décisions d’architecture</b> (choix et compromis, garde-fous, vérification), pas seulement sur le fait que « ça marche ».",
    footer: "Claude Certified Architect est une certification d’Anthropic ; seuls l’examen officiel et son guide font foi. Contenu fondé sur le guide d’examen CCAR-F version 1.0 (juillet 2026), susceptible d’évoluer.",
    facts: ["60 questions", "120 min", "4 scénarios sur 6", "Réussite 720 / 1 000"]
  },
  {
    id: "claude-code",
    status: "available",
    official: false,
    code: "Claude Code",
    name: "Claude Code — Certification & Practice",
    short: "Claude Code Practice",
    storeKey: "claude-code-practice-v1",
    files: ["domains", "programme", "courses", "questions", "practice"],
    summary: "Maîtriser Claude Code au quotidien : explorer, planifier, modifier, tester, déboguer et sécuriser, notamment en PHP/Symfony.",
    hero: {
      kicker: "Claude Code — Certification & Practice",
      title: "Comprendre. Piloter. Livrer.",
      lead: "Apprenez à piloter Claude Code comme un développeur professionnel : explorer un projet, planifier, modifier, tester, déboguer et sécuriser, notamment sur des projets PHP/Symfony.",
      format: "Évaluation : 40 questions · 60 min · réussite à 70 % — simulation interne, non officielle"
    },
    exam: {
      label: "Évaluation", title: "Évaluation — simulation interne", minutes: 60, scoring: "percent", pass: 70, scenarioCount: 0,
      intro: "<b>Format non officiel.</b> Anthropic ne propose pas d’examen correspondant à cette évaluation : il s’agit d’un entraînement interne à l’application, qui ne délivre aucune certification."
    },
    programmeNote: "Chaque objectif renvoie à la section d’origine du programme détaillé (§1 à §15).",
    practiceNote: "Ces fiches se réalisent dans un vrai projet, avec Claude Code ouvert dans votre terminal ou votre IDE. Évaluez-vous sur votre capacité à <b>piloter</b> l’outil (contexte, contraintes, plan, vérification du diff et des tests), pas seulement sur le résultat obtenu.",
    footer: "Parcours interne à l’application : aucune certification officielle ne correspond à ce programme. Vérifiez les commandes et options dans la documentation officielle de Claude Code, qui évolue rapidement.",
    facts: ["Programme interne", "40 questions", "60 min", "Réussite 70 %"]
  },
  {
    id: "ccdv-f",
    status: "soon",
    official: true,
    code: "CCDV-F",
    name: "Claude Certified Developer – Foundations",
    short: "Developer Foundations",
    summary: "Construire, intégrer et livrer des applications, agents et workflows avec Claude. Le guide d’examen est disponible dans docs/ ; le contenu de préparation reste à produire.",
    facts: ["53 questions", "120 min", "8 domaines", "Réussite 720 / 1 000"]
  }
];
