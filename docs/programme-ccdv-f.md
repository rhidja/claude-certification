# Programme détaillé — Claude Certified Developer – Foundations (CCDV-F)

Source : *Claude Certified Developer – Foundations, Exam Guide*, version 1.0, en vigueur depuis juillet 2026 (code d’examen CCDV-F), Claude Certification Program d’Anthropic. Fichier : `docs/claude-certified-developer-foundations-exam-guide-v1.0.pdf`. Le guide peut changer sans préavis : vérifiez toujours la dernière version officielle.

Ce document reprend le **blueprint** du guide : 8 domaines pondérés et 25 compétences pondérées. Chaque compétence devient un objectif, numéroté *domaine.rang* dans l’ordre du guide. Les intitulés sont traduits en français, avec l’intitulé anglais d’origine entre parenthèses.

Pour chaque objectif :

- **Description officielle** : traduction fidèle du paragraphe du guide, qui est la seule définition de ce qui est évalué ;
- **Notions clés** : libellés courts tirés de cette description, à utiliser comme `notions` dans `certs/ccdv-f/programme.js`.

Contrairement au guide CCAR-F, le guide CCDV-F ne détaille ni connaissances ni compétences par objectif, et ne comporte pas de scénarios. Les cours devront donc expliquer chaque notion à partir de la documentation officielle (API Claude, Claude Code, Agent SDK, MCP), en marquant comme « complément » tout ce qui va au-delà de la description officielle.

---

## Format de l’examen

| Élément | Valeur |
|---|---|
| Titre | Claude Certified Developer – Foundations |
| Code | CCDV-F |
| Nombre de questions | 53 |
| Format | Questions à choix unique et à réponses multiples ; chaque question indique combien de réponses choisir |
| Durée | 120 minutes |
| Passation | Surveillée : en ligne et/ou en centre d’examen Pearson VUE |
| Réussite | Score de 720 sur une échelle de 100 à 1 000 |
| Prix | 125 USD |
| Validité | 12 mois |
| Résultat | Réussi / non réussi avec score de 100 à 1 000, plus le pourcentage de bonnes réponses par domaine |

**Public visé** : ingénieurs IA et ML, responsables techniques et développeurs seniors qui construisent, intègrent et livrent des applications, agents et workflows avec Claude.

**Expérience recommandée** (non obligatoire) : 1 à 5 ans de développement logiciel ; au moins 6 mois de pratique de Claude ou d’un système à base de LLM ; maîtrise de Python et/ou TypeScript ; aisance avec les API REST et les outils en ligne de commande ; compréhension des fondamentaux des LLM, des agents, de la gestion du contexte et du MCP. Aucun prérequis n’est exigé.

**Hors public** : utilisateurs non techniques, et rôles limités à l’écriture de prompts sans responsabilité plus large de développement d’applications.

---

## Domaines et pondération

| Domaine | Intitulé | Poids |
|---|---|---|
| 1 | Agents et workflows (*Agents and Workflows*) | 14,7 % |
| 2 | Applications et intégration (*Applications and Integration*) | 33,1 % |
| 3 | Claude Code (*Claude Code*) | 3,1 % |
| 4 | Évaluation, tests et débogage (*Eval, Testing, and Debugging*) | 2,6 % |
| 5 | Choix et optimisation du modèle (*Model Selection and Optimization*) | 16,8 % |
| 6 | Prompt et ingénierie du contexte (*Prompt and Context Engineering*) | 11,0 % |
| 7 | Sécurité et sûreté (*Security and Safety*) | 8,1 % |
| 8 | Outils et MCP (*Tools and MCPs*) | 10,6 % |
| | **Total** | **100 %** |

Le poids de chaque objectif indique sa part de l’examen complet.

---

## Domaine 1 — Agents et workflows (14,7 %)

### 1.1 Architecture d’agent (*Agent Architecture*) — 4,5 %

**Description officielle** : principes, modèles et compromis de l’architecture des agents et des workflows, notamment les critères de choix entre un workflow et un agent, la structure des hiérarchies gestionnaire / superviseur, et le rôle des sous-agents dans l’amélioration de l’exécution des tâches.

**Notions clés** : workflow ou agent ; critères de choix ; hiérarchie gestionnaire / superviseur ; sous-agents.

### 1.2 Construire des agents avec Claude (*Agent Construction with Claude*) — 5,3 %

**Description officielle** : méthodes, outils et plateformes pour construire des agents Claude, notamment le Claude Agent SDK, les boucles et harnais d’agent sur mesure, les modèles de déploiement d’agents gérés (auto-hébergé ou hébergé par Anthropic) et les hooks pour les actions déterministes.

**Notions clés** : Claude Agent SDK ; boucle d’agent sur mesure ; harnais ; auto-hébergé ou hébergé par Anthropic ; hooks pour les actions déterministes.

### 1.3 Modèles et frameworks d’agents (*Agent Patterns and Frameworks*) — 4,9 %

**Description officielle** : modèles courants de conception d’agents (boucles d’utilisation d’outils, sous-agents, mémoire, gestion de la fenêtre de contexte) et frameworks d’abstraction agentique (par exemple Strands, LangGraph, PydanticAI) pour construire des agents et des workflows de tâches en plusieurs étapes.

**Notions clés** : boucle d’utilisation d’outils ; mémoire ; gestion de la fenêtre de contexte ; frameworks agentiques ; Strands, LangGraph, PydanticAI.

---

## Domaine 2 — Applications et intégration (33,1 %)

### 2.1 Comprendre les exigences (*Understanding Requirements*) — 3,4 %

**Description officielle** : exigences fonctionnelles et d’infrastructure fondées sur les besoins métier et l’architecture de la solution.

**Notions clés** : exigences fonctionnelles ; exigences d’infrastructure ; besoins métier ; architecture de la solution.

### 2.2 Cycle de vie des systèmes (*Systems Life Cycle*) — 2,8 %

**Description officielle** : concepts et cadres de gestion du cycle de vie des systèmes, utilisés pour développer, mettre en œuvre, exploiter et maintenir des systèmes informatiques.

**Notions clés** : cycle de vie des systèmes ; développer ; mettre en œuvre ; exploiter ; maintenir.

### 2.3 Mécanique de l’API Claude (*Claude API Mechanics*) — 6,8 %

**Description officielle** : comportement et mécanique de l’API Claude, notamment les messages, les outils, le streaming, la vision, la réflexion (thinking), le cache, l’appel de Claude via des fournisseurs tiers, les modes d’accès aux données de la Messages API, l’usage de l’API par lots et les compromis entre API temps réel et API par lots.

**Notions clés** : Messages API ; streaming ; vision ; thinking ; fournisseurs tiers ; API par lots ; temps réel ou lots.

### 2.4 Fondamentaux du génie logiciel (*Software Engineering Foundations*) — 7,4 %

**Description officielle** : principes et pratiques fondamentaux du génie logiciel, notamment les API REST, JSON, la programmation asynchrone, le contrôle de version, l’intégration au cycle de développement (SDLC), la revue de code et le refactoring à petite et grande échelle.

**Notions clés** : API REST ; JSON ; programmation asynchrone ; contrôle de version ; SDLC ; revue de code ; refactoring.

### 2.5 Conception d’applications Claude (*Claude Application Design*) — 8,6 %

**Description officielle** : considérations de conception pour construire des applications Claude, notamment la façon dont Claude interprète les instructions selon l’interface (Claude Code, Desktop, claude.ai, API, SDK), les limites de contenu, la conception de schémas, l’hygiène des sessions et la gestion des plugins.

**Notions clés** : interprétation des instructions selon l’interface ; limites de contenu ; conception de schémas ; hygiène des sessions ; gestion des plugins.

### 2.6 Gestion de configuration (*Configuration Management*) — 4,1 %

**Description officielle** : gestion de configuration des composants d’un système Claude, notamment les fichiers CLAUDE.md, settings.json, l’épinglage des versions de modèle, le versionnage des prompts et les dépendances de plugins.

**Notions clés** : CLAUDE.md ; settings.json ; épinglage de la version du modèle ; versionnage des prompts ; dépendances de plugins.

---

## Domaine 3 — Claude Code (3,1 %)

### 3.1 Utilisation de Claude Code (*Claude Code Operation*) — 3,1 %

**Description officielle** : composants clés de Claude Code (règles, skills, commandes, agents, mémoire d’agent), fonctionnalités (gestion des sessions, commandes slash intégrées et personnalisées, mode headless, mode streaming, auto-mode), hiérarchie CLAUDE.md, initialisation d’un dépôt et configuration de settings.json.

**Notions clés** : règles ; skills ; commandes ; mémoire ; mode headless ; auto-mode ; initialisation d’un dépôt.

---

## Domaine 4 — Évaluation, tests et débogage (2,6 %)

### 4.1 Débogage et gestion des erreurs (*Debugging and Error Handling*) — 2,6 %

**Description officielle** : techniques de débogage et de gestion des erreurs pour les applications Claude, notamment l’identification du type d’erreur, le choix d’une stratégie de reprise, l’analyse de traces pour identifier les modes de défaillance et l’isolement de l’origine d’un problème entre la couche d’intégration et la sortie du modèle.

**Notions clés** : type d’erreur ; stratégie de reprise ; analyse de traces ; modes de défaillance ; couche d’intégration ou sortie du modèle.

---

## Domaine 5 — Choix et optimisation du modèle (16,8 %)

### 5.1 Fondamentaux des LLM (*LLM Fundamentals*) — 5,2 %

**Description officielle** : compréhension de base des LLM (tokens, fenêtres de contexte, échantillonnage, non-déterminisme, génération du token suivant), options des modèles (fast mode, réflexion étendue, réflexion adaptative, niveaux d’effort) et techniques fondamentales de prompting (zero-shot, single-shot, multi-shot).

**Notions clés** : tokens ; fenêtre de contexte ; échantillonnage ; non-déterminisme ; fast mode ; réflexion adaptative ; niveaux d’effort ; zero-shot.

### 5.2 Fondamentaux techniques (*Technical Fundamentals*) — 6,1 %

**Description officielle** : concepts techniques fondamentaux du développement d’applications d’IA, notamment les pratiques d’ingénierie de base (intégration avec des SDK qui encapsulent des API REST, websockets).

**Notions clés** : SDK ; API REST ; websockets ; pratiques d’ingénierie.

### 5.3 Choix du modèle et compromis (*Model Selection and Tradeoffs*) — 2,7 %

**Description officielle** : capacités des modèles Claude (cas d’usage d’Opus, Sonnet et Haiku, prise en charge de la réflexion adaptative), compromis entre qualité, latence et coût, et changements de comportement incompatibles entre versions de modèles lors du choix d’un modèle pour une tâche.

**Notions clés** : Opus ; Sonnet ; Haiku ; qualité, latence et coût ; changements incompatibles.

### 5.4 Gestion des coûts et des tokens (*Cost and Token Management*) — 2,8 %

**Description officielle** : techniques de budget de tokens et de maîtrise des coûts pour les applications Claude, notamment le suivi de la consommation de tokens, la modélisation des coûts et les techniques de cache (prompt caching, points de cache) pour optimiser les coûts.

**Notions clés** : suivi de la consommation de tokens ; modélisation des coûts ; prompt caching ; points de cache.

---

## Domaine 6 — Prompt et ingénierie du contexte (11,0 %)

### 6.1 Ingénierie du contexte (*Context Engineering*) — 3,8 %

**Description officielle** : techniques de gestion du contexte et de la mémoire pour les applications Claude, notamment la gestion de la fenêtre de contexte, la prévention de la dérive et de l’encombrement du contexte (élagage des sorties d’outils, compaction) et l’isolement du contexte par des sous-agents ou des workflows agentiques en plusieurs étapes.

**Notions clés** : dérive du contexte ; encombrement du contexte ; élagage des sorties d’outils ; compaction ; isolement du contexte.

### 6.2 Prompt engineering (*Prompt Engineering*) — 4,6 %

**Description officielle** : principes et méthodes de prompt engineering (clarté des instructions, exemples few-shot, placement système ou utilisateur, contraintes de sortie, placement des prompts et instructions entre composants, raffinement itératif, ajustement des prompts, assainissement des entrées) pour écrire et améliorer des prompts pour Claude.

**Notions clés** : clarté des instructions ; exemples few-shot ; système ou utilisateur ; contraintes de sortie ; raffinement itératif ; assainissement des entrées.

### 6.3 Traitement des sorties (*Output Handling*) — 2,6 %

**Description officielle** : modèles et techniques établis pour produire, valider et consommer les sorties de Claude, notamment les sorties structurées, la validation des réponses, l’analyse défensive et le scepticisme face à une sortie affirmée avec assurance.

**Notions clés** : sorties structurées ; validation des réponses ; analyse défensive ; scepticisme.

---

## Domaine 7 — Sécurité et sûreté (8,1 %)

### 7.1 Sécurité des applications d’IA (*AI Application Security*) — 3,2 %

**Description officielle** : bonnes pratiques de confidentialité et de sécurité des données, notamment la connaissance et la prévention de l’injection de prompt, la défense contre le jailbreak, le traitement des entrées non fiables, la prévention des fuites de données, le traitement des données personnelles (PII), et la garantie de l’authentification, de l’autorisation, de la confidentialité, de la vie privée et de l’intégrité.

**Notions clés** : injection de prompt ; jailbreak ; entrées non fiables ; fuites de données ; données personnelles ; authentification et autorisation.

### 7.2 Garde-fous et déploiement sûr (*Guardrails and Safe Deployment*) — 2,3 %

**Description officielle** : pratiques de déploiement sûr et responsable (politique de contenu, superposition de garde-fous) et principes de sécurité dès la conception (vie privée, gestion des identités et des accès, moindre privilège).

**Notions clés** : politique de contenu ; superposition de garde-fous ; sécurité dès la conception ; moindre privilège.

### 7.3 Hooks Claude (*Claude Hooks*) — 1,0 %

**Description officielle** : utiliser les hooks pour mettre en place des garde-fous et des contrôles de sécurité qui empêchent les actions destructrices dans les applications Claude.

**Notions clés** : hooks ; garde-fous ; actions destructrices.

### 7.4 Identité, secrets et gestion des clés (*Identity, Secrets, and Key Management*) — 1,6 %

**Description officielle** : gestion des secrets, identifiants et clés d’API dans les environnements de développement et de production de Claude, notamment la validation de l’identité et l’authentification, l’approbation des accès et la vérification des niveaux, et la surveillance des accès autorisés.

**Notions clés** : secrets ; clés d’API ; validation de l’identité ; approbation des accès ; surveillance des accès.

---

## Domaine 8 — Outils et MCP (10,6 %)

### 8.1 Implémentation d’outils (*Tool Implementation*) — 4,4 %

**Description officielle** : pratiques d’implémentation d’outils pour les applications Claude, notamment le tool use et l’appel de fonctions, la configuration pour l’interaction avec des systèmes externes, la rédaction des descriptions d’outils, la gestion des erreurs, les modes d’utilisation des outils (dispatch par le harnais agentique, outils côté client ou côté serveur, modèles d’approbation) et les bonnes pratiques de construction d’un jeu d’outils.

**Notions clés** : tool use ; descriptions d’outils ; outils côté client ou côté serveur ; modèles d’approbation ; jeu d’outils.

### 8.2 Développement de serveurs MCP (*MCP Server Development*) — 2,1 %

**Description officielle** : pratiques de développement de serveurs MCP, notamment l’écriture et le déploiement de serveurs, l’intégration avec les applications Claude, les ressources, outils et prompts MCP, et les modes de communication (stdio, sockets, client ou serveur).

**Notions clés** : serveur MCP ; ressources, outils et prompts ; stdio ; client ou serveur.

### 8.3 Personnalisation agentique (*Agentic Customization*) — 4,1 %

**Description officielle** : compromis entre outils intégrés, outils sur mesure, Skills et MCP pour choisir et appliquer l’approche adaptée à un cas d’usage.

**Notions clés** : outils intégrés ; outils sur mesure ; Skills ; MCP ; compromis.

---

## Préparation recommandée par le guide (section 7)

- Étudier le blueprint et s’auto-évaluer objectif par objectif.
- Lire la documentation officielle d’Anthropic sur l’API Claude, les modèles, le prompt engineering, Claude Code, les Skills et le MCP.
- Construire et faire tourner au moins une application Claude qui utilise l’API, intègre un ou plusieurs outils, applique des bases de prompt et d’ingénierie du contexte, et inclut des pratiques simples de sécurité et d’évaluation.
- S’exercer aux compétences du développeur : prompts et instructions système, agents et workflows, configuration de Claude Code, gestion des tokens et des coûts, garde-fous, outils sur mesure ou serveurs MCP.
- Faire les questions d’exemple de la section 8 pour se familiariser avec le style des questions (elles ne sont pas reprises ici).

## Note sur l’actualité des faits

Le guide décrit des fonctionnalités qui évoluent vite (modèles, réflexion, effort, fast mode, cache, outils serveur). Les cours s’appuient sur la documentation officielle à jour et signalent les points dont la disponibilité varie selon le modèle ou la plateforme (Claude API, Amazon Bedrock, Google Vertex AI, Microsoft Foundry). Aucun prix ni aucune limite chiffrée n’est enseigné comme matière d’examen, sauf ceux que le guide mentionne.
