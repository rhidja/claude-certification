// Domaines du blueprint CCDV-F et pondération officielle.
// examCount : nombre de questions tirées dans ce domaine pour un examen blanc (53 au total,
// répartition proportionnelle au poids, arrondie au plus fort reste).
const DOMAINS = [
  { id: 1, name: "Agents et workflows", weight: 14.7, examCount: 8 },
  { id: 2, name: "Applications et intégration", weight: 33.1, examCount: 17 },
  { id: 3, name: "Claude Code", weight: 3.1, examCount: 2 },
  { id: 4, name: "Évaluation, tests et débogage", weight: 2.6, examCount: 1 },
  { id: 5, name: "Choix et optimisation du modèle", weight: 16.8, examCount: 9 },
  { id: 6, name: "Prompt et ingénierie du contexte", weight: 11.0, examCount: 6 },
  { id: 7, name: "Sécurité et sûreté", weight: 8.1, examCount: 4 },
  { id: 8, name: "Outils et MCP", weight: 10.6, examCount: 6 }
];
