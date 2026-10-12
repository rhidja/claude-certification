// Scénarios d’examen du guide CCAR-F : 4 sont tirés au hasard parmi ces 6 à chaque examen.
// d = domaines principaux du scénario ; context = mise en situation affichée au-dessus des questions.
const SCENARIOS = [
  { id: "S1", title: "Agent de résolution du support client", d: [1, 2, 5],
    context: "Vous construisez avec le Claude Agent SDK un agent de résolution du support client. Il traite des demandes très ambiguës (retours, litiges de facturation, problèmes de compte) et accède aux systèmes internes via des outils MCP : `get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`. Objectif : plus de 80 % de résolution au premier contact, en sachant quand escalader." },
  { id: "S2", title: "Génération de code avec Claude Code", d: [3, 5],
    context: "Votre équipe utilise Claude Code pour la génération de code, le refactoring, le débogage et la documentation. Vous devez l’intégrer au workflow de développement avec des commandes slash personnalisées et des fichiers CLAUDE.md, et savoir quand utiliser le plan mode ou l’exécution directe." },
  { id: "S3", title: "Système de recherche multi-agents", d: [1, 2, 5],
    context: "Vous construisez avec le Claude Agent SDK un système de recherche multi-agents. Un agent coordinateur délègue à des sous-agents spécialisés : l’un cherche sur le web, un autre analyse des documents, un troisième synthétise les résultats, un dernier rédige les rapports. Le système produit des rapports complets et sourcés." },
  { id: "S4", title: "Productivité des développeurs", d: [2, 3, 1],
    context: "Vous construisez avec le Claude Agent SDK des outils de productivité pour les développeurs : explorer des bases de code inconnues, comprendre du code legacy, générer du code standard et automatiser des tâches répétitives. L’agent utilise les outils intégrés (Read, Write, Bash, Grep, Glob) et des serveurs MCP." },
  { id: "S5", title: "Claude Code en intégration continue", d: [3, 4],
    context: "Vous intégrez Claude Code dans votre pipeline CI/CD : revues de code automatiques, génération de cas de test et retours sur les pull requests. Les prompts doivent produire des retours actionnables et limiter les faux positifs." },
  { id: "S6", title: "Extraction de données structurées", d: [4, 5],
    context: "Vous construisez un système d’extraction de données structurées avec Claude. Il extrait des informations de documents non structurés, valide la sortie avec des schémas JSON, garde une haute précision, gère les cas limites et s’intègre aux systèmes en aval." }
];
