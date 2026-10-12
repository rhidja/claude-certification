// Domaines du programme et pondération.
// examCount : nombre de questions tirées dans ce domaine pour une évaluation (40 au total).
const DOMAINS = [
  { id: 1, name: "Installation, configuration et prise en main", weight: 10, examCount: 4 },
  { id: 2, name: "Interaction avec Claude Code et commandes", weight: 10, examCount: 4 },
  { id: 3, name: "Compréhension et exploration d’un projet", weight: 15, examCount: 6 },
  { id: 4, name: "Génération, modification et refactoring de code", weight: 15, examCount: 6 },
  { id: 5, name: "Tests, debugging et correction d’erreurs", weight: 15, examCount: 6 },
  { id: 6, name: "Agents, sous-agents et workflows", weight: 10, examCount: 4 },
  { id: 7, name: "MCP, outils et intégrations", weight: 10, examCount: 4 },
  { id: 8, name: "CLAUDE.md, règles et personnalisation", weight: 5, examCount: 2 },
  { id: 9, name: "Git, sécurité et bonnes pratiques", weight: 5, examCount: 2 },
  { id: 10, name: "Automatisation et workflows avancés", weight: 5, examCount: 2 }
];
