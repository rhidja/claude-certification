// Objectifs du programme détaillé.
// src : section(s) d’origine du programme détaillé (§1 à §15).
// notions : notions à maîtriser, reprises du programme.
const OBJECTIVES = [
  { id: "1.1", d: 1, src: "§1", title: "Présentation, cas d’utilisation et fonctionnement agentique",
    notions: ["Présentation de Claude Code", "Cas d’utilisation", "Fonctionnement agentique", "Différence entre conversation et agent de développement"] },
  { id: "1.2", d: 1, src: "§1", title: "Installation, authentification et configuration",
    notions: ["Installation", "Authentification", "Configuration"] },
  { id: "1.3", d: 1, src: "§1", title: "Première session, interaction avec un projet, permissions",
    notions: ["Première session", "Interaction avec un projet", "Permissions et validation des actions"] },

  { id: "2.1", d: 2, src: "§2", title: "Prompts efficaces et contraintes",
    notions: ["Prompts efficaces", "Instructions précises", "Contexte", "Questions et réponses", "Donner des contraintes à Claude"] },
  { id: "2.2", d: 2, src: "§2", title: "Commandes slash et raccourcis",
    notions: ["Commandes slash disponibles", "Raccourcis clavier"] },
  { id: "2.3", d: 2, src: "§2", title: "Sessions, contexte et plan avant modification",
    notions: ["Gestion des sessions", "Reprise d’une session", "Gestion du contexte", "Demander un plan avant modification"] },

  { id: "3.1", d: 3, src: "§3", title: "Exploration d’un repository et architecture",
    notions: ["Exploration d’un repository", "Architecture du projet", "Identification des points d’entrée"] },
  { id: "3.2", d: 3, src: "§3", title: "Recherche de fichiers, de symboles et dépendances",
    notions: ["Recherche de fichiers", "Recherche de symboles", "Compréhension des dépendances"] },
  { id: "3.3", d: 3, src: "§3", title: "Analyse du code existant, des tests et de la configuration",
    notions: ["Analyse du code existant", "Compréhension des tests", "Compréhension de la configuration"] },
  { id: "3.4", d: 3, src: "§12", title: "Comprendre un environnement Docker",
    notions: ["Comprendre un environnement Docker", "Dockerfile", "Docker Compose", "Services", "Réseaux", "Volumes"] },

  { id: "4.1", d: 4, src: "§4", title: "Créer et modifier du code dans le respect des conventions",
    notions: ["Création de fichiers", "Modification de fichiers existants", "Ajout de fonctionnalités", "Respect des conventions existantes"] },
  { id: "4.2", d: 4, src: "§4, §14", title: "Refactoring, suppression et migration de code",
    notions: ["Refactoring", "Suppression de code", "Migration de code"] },
  { id: "4.3", d: 4, src: "§4", title: "Revue des modifications et bonnes pratiques",
    notions: ["Revue des modifications avant validation", "Faire analyser avant de modifier", "Modifier progressivement", "Tester après chaque changement important", "Vérifier le diff Git"] },
  { id: "4.4", d: 4, src: "§11", title: "Claude Code avec Symfony",
    notions: ["PHP", "Composer", "Symfony Console", "Doctrine", "API", "Messenger", "Security"] },

  { id: "5.1", d: 5, src: "§5", title: "Diagnostiquer un bug",
    notions: ["Lecture des erreurs", "Analyse des logs", "Recherche de la cause racine", "Reproduction d’un bug"] },
  { id: "5.2", d: 5, src: "§5", title: "Corriger et prévenir les régressions",
    notions: ["Correction", "Vérification de la correction", "Prévention des régressions"] },
  { id: "5.3", d: 5, src: "§6, §11", title: "Types de tests et génération de tests",
    notions: ["Tests unitaires", "Tests fonctionnels", "Tests d’intégration", "Tests end-to-end", "Génération de tests", "PHPUnit"] },
  { id: "5.4", d: 5, src: "§6", title: "Exécuter les tests et analyser la couverture",
    notions: ["Exécution des tests", "Analyse de couverture", "Correction des tests cassés"] },
  { id: "5.5", d: 5, src: "§12", title: "Déboguer un environnement Docker",
    notions: ["Debugging d’un environnement Docker", "Logs", "Containers"] },

  { id: "6.1", d: 6, src: "§9", title: "Concept d’agent et décomposition d’une tâche",
    notions: ["Concept d’agent", "Décomposition d’une tâche"] },
  { id: "6.2", d: 6, src: "§9", title: "Sous-agents et spécialisation",
    notions: ["Sous-agents", "Spécialisation des agents"] },
  { id: "6.3", d: 6, src: "§9", title: "Recherche parallèle et workflows multi-agents",
    notions: ["Recherche parallèle", "Analyse du code", "Tests", "Revue", "Documentation"] },

  { id: "7.1", d: 7, src: "§10", title: "Concepts du MCP",
    notions: ["Concept de MCP", "Serveur MCP", "Outils MCP", "Ressources MCP"] },
  { id: "7.2", d: 7, src: "§10", title: "Connecter et utiliser des outils externes",
    notions: ["Connexion à des services externes", "Utilisation d’outils externes depuis Claude Code", "Authentification"] },
  { id: "7.3", d: 7, src: "§10", title: "Sécurité des outils MCP",
    notions: ["Sécurité des outils", "Permissions", "Limitation des capacités"] },

  { id: "8.1", d: 8, src: "§8", title: "Rôle de CLAUDE.md et instructions du projet",
    notions: ["Rôle de CLAUDE.md", "Instructions du projet", "Instructions spécifiques aux sous-projets"] },
  { id: "8.2", d: 8, src: "§8", title: "Contenu d’un CLAUDE.md professionnel",
    notions: ["Conventions de développement", "Architecture", "Commandes utiles", "Standards de code", "Règles de tests", "Contraintes de sécurité"] },

  { id: "9.1", d: 9, src: "§7", title: "Git et workflow professionnel",
    notions: ["Git avec Claude Code", "Lecture des diffs", "Branches", "Commits", "Pull requests", "Revue de code", "Identification des modifications dangereuses", "Résolution de conflits", "Bonnes pratiques avant commit"] },
  { id: "9.2", d: 9, src: "§7, §13", title: "Sécurité",
    notions: ["Secrets", "Variables d’environnement", "Clés API", "Données sensibles", "Commandes destructives", "Validation humaine", "Principe du moindre privilège", "Risques liés aux outils externes", "Injection de contexte", "Vérification du code généré"] },

  { id: "10.1", d: 10, src: "§14, §15", title: "Planification, workflows avancés et méthodologie",
    notions: ["Planification d’une fonctionnalité", "Analyse → implémentation → tests → review", "Refactoring complexe", "Analyse de dette technique", "Méthodologie professionnelle"] },
  { id: "10.2", d: 10, src: "§14", title: "Automatisation",
    notions: ["Documentation automatique", "Génération de scripts", "Automatisation répétitive", "Mode non interactif", "Hooks", "Commandes personnalisées"] }
];
