# Programme détaillé — Claude Certified Architect – Foundations (CCAR-F)

Source : *Claude Certified Architect – Foundations, Exam Guide*, version 1.0, en vigueur depuis juillet 2026 (code d’examen CCAR-F), publié par le Claude Certification Program d’Anthropic. Le guide peut changer sans préavis : vérifiez toujours la dernière version officielle.

Ce document reprend le **blueprint** du guide (domaines, pondérations, *task statements*, connaissances et compétences) pour servir de programme détaillé au générateur d’application. La numérotation et le découpage sont ceux du guide. Les intitulés sont traduits en français, avec l’intitulé anglais d’origine entre parenthèses. Les termes techniques (`stop_reason`, `tool_choice`, `.mcp.json`, etc.) sont gardés tels quels.

Pour chaque objectif :

- **Notions clés** : libellés courts à utiliser comme `notions` dans `data/programme.js` ;
- **Connaissances** (*Knowledge of*) et **Compétences** (*Skills in*) : ce que mesurent les questions.

---

## Format de l’examen

| Élément | Valeur |
|---|---|
| Titre | Claude Certified Architect – Foundations |
| Code | CCAR-F |
| Nombre de questions | 60 |
| Format | Questions à choix unique et à réponses multiples ; chaque question indique combien de réponses choisir |
| Structure | 4 scénarios tirés au hasard parmi 6 |
| Durée | 120 minutes |
| Passation | Surveillée : en ligne et/ou en centre d’examen Pearson VUE |
| Réussite | Score de 720 sur une échelle de 100 à 1 000 |
| Prix | 125 USD |
| Validité | 12 mois |
| Résultat | Réussi / non réussi avec score de 100 à 1 000, plus le pourcentage de bonnes réponses par domaine |

**Public visé** : architecte de solutions qui conçoit et met en production des applications avec Claude, avec environ 6 mois ou plus d’expérience pratique de l’API Claude, du Claude Agent SDK, de Claude Code et du MCP.

---

## Domaines et pondération

| Domaine | Intitulé | Poids |
|---|---|---|
| 1 | Architecture agentique et orchestration (*Agentic Architecture & Orchestration*) | 27 % |
| 2 | Conception d’outils et intégration MCP (*Tool Design & MCP Integration*) | 18 % |
| 3 | Configuration et workflows Claude Code (*Claude Code Configuration & Workflows*) | 20 % |
| 4 | Prompt engineering et sortie structurée (*Prompt Engineering & Structured Output*) | 20 % |
| 5 | Gestion du contexte et fiabilité (*Context Management & Reliability*) | 15 % |
| | **Total** | **100 %** |

---

## Scénarios d’examen

Les questions sont posées dans le cadre de scénarios réalistes. L’examen en présente 4, tirés au hasard parmi ces 6.

| # | Scénario | Contexte | Domaines principaux |
|---|---|---|---|
| S1 | Agent de résolution du support client (*Customer Support Resolution Agent*) | Agent construit avec le Claude Agent SDK, qui traite des demandes ambiguës (retours, litiges de facturation, problèmes de compte) via des outils MCP (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`). Objectif : plus de 80 % de résolution au premier contact, en sachant quand escalader. | 1, 2, 5 |
| S2 | Génération de code avec Claude Code (*Code Generation with Claude Code*) | Utilisation de Claude Code pour la génération, le refactoring, le débogage et la documentation, avec des commandes slash personnalisées, une configuration CLAUDE.md, et le choix entre plan mode et exécution directe. | 3, 5 |
| S3 | Système de recherche multi-agents (*Multi-Agent Research System*) | Un agent coordinateur délègue à des sous-agents spécialisés (recherche web, analyse de documents, synthèse, rédaction de rapport) pour produire des rapports complets et sourcés. | 1, 2, 5 |
| S4 | Productivité des développeurs (*Developer Productivity with Claude*) | Outils construits avec le Claude Agent SDK pour explorer des bases de code inconnues, comprendre du code legacy, générer du code standard et automatiser des tâches, avec les outils intégrés (Read, Write, Bash, Grep, Glob) et des serveurs MCP. | 2, 3, 1 |
| S5 | Claude Code en intégration continue (*Claude Code for Continuous Integration*) | Intégration de Claude Code dans un pipeline CI/CD : revues de code automatiques, génération de tests, retours sur les pull requests, avec des prompts qui donnent des retours actionnables et limitent les faux positifs. | 3, 4 |
| S6 | Extraction de données structurées (*Structured Data Extraction*) | Système qui extrait des informations de documents non structurés, valide la sortie avec des schémas JSON, garde une haute précision, gère les cas limites et s’intègre aux systèmes en aval. | 4, 5 |

---

## Domaine 1 — Architecture agentique et orchestration (27 %)

### 1.1 Concevoir et implémenter des boucles agentiques pour l’exécution autonome de tâches (*Design and implement agentic loops for autonomous task execution*)

**Notions clés** : cycle de la boucle agentique ; `stop_reason` ; `tool_use` et `end_turn` ; résultats d’outils dans l’historique ; décision pilotée par le modèle ; anti-patterns de termination.

**Connaissances**
- Le cycle de vie de la boucle agentique : envoyer la requête à Claude, inspecter `stop_reason` (`"tool_use"` ou `"end_turn"`), exécuter les outils demandés, renvoyer les résultats pour l’itération suivante.
- Comment les résultats d’outils sont ajoutés à l’historique de conversation pour que le modèle raisonne sur l’action suivante.
- La différence entre une décision pilotée par le modèle (Claude choisit l’outil suivant selon le contexte) et des arbres de décision ou séquences d’outils préconfigurés.

**Compétences**
- Implémenter un contrôle de boucle qui continue quand `stop_reason` vaut `"tool_use"` et s’arrête quand il vaut `"end_turn"`.
- Ajouter les résultats d’outils au contexte entre les itérations pour que le modèle intègre les nouvelles informations.
- Éviter les anti-patterns : analyser du langage naturel pour décider de la fin de boucle, utiliser un plafond arbitraire d’itérations comme mécanisme d’arrêt principal, ou considérer la présence de texte de l’assistant comme signe de fin.

### 1.2 Orchestrer des systèmes multi-agents avec le modèle coordinateur / sous-agents (*Orchestrate multi-agent systems with coordinator-subagent patterns*)

**Notions clés** : architecture hub-and-spoke ; contexte isolé des sous-agents ; rôle du coordinateur ; décomposition trop étroite ; sélection dynamique des sous-agents ; boucles de raffinement itératif.

**Connaissances**
- L’architecture en étoile (*hub-and-spoke*) : un coordinateur gère toute la communication entre sous-agents, la gestion des erreurs et le routage de l’information.
- Les sous-agents ont un contexte isolé : ils n’héritent pas automatiquement de l’historique du coordinateur.
- Le rôle du coordinateur : décomposer, déléguer, agréger les résultats et choisir les sous-agents à invoquer selon la complexité de la demande.
- Le risque d’une décomposition trop étroite par le coordinateur, qui laisse des pans d’un sujet large non couverts.

**Compétences**
- Concevoir des coordinateurs qui analysent la demande et choisissent dynamiquement les sous-agents, plutôt que de toujours passer par tout le pipeline.
- Répartir le périmètre de recherche entre sous-agents pour limiter les doublons (sous-thèmes ou types de sources distincts).
- Implémenter des boucles de raffinement : le coordinateur évalue la synthèse, détecte les lacunes, relance recherche et analyse avec des requêtes ciblées, puis relance la synthèse jusqu’à une couverture suffisante.
- Faire passer toute communication entre sous-agents par le coordinateur, pour l’observabilité, une gestion d’erreurs homogène et un flux d’information maîtrisé.

### 1.3 Configurer l’invocation des sous-agents, le passage de contexte et leur lancement (*Configure subagent invocation, context passing, and spawning*)

**Notions clés** : outil Task ; `allowedTools` ; passage explicite du contexte ; AgentDefinition ; sessions dérivées (fork) ; sous-agents en parallèle.

**Connaissances**
- L’outil Task comme mécanisme de lancement des sous-agents, et l’obligation que `allowedTools` contienne `"Task"` pour qu’un coordinateur puisse invoquer des sous-agents.
- Le contexte d’un sous-agent doit être fourni explicitement dans son prompt : il n’hérite pas du contexte parent et ne partage pas de mémoire entre invocations.
- La configuration `AgentDefinition` : description, prompt système et restrictions d’outils pour chaque type de sous-agent.
- La gestion de sessions par dérivation (*fork*) pour explorer des approches divergentes à partir d’une analyse commune.

**Compétences**
- Inclure directement dans le prompt du sous-agent les résultats complets des agents précédents (par exemple les résultats de recherche web et d’analyse de documents pour le sous-agent de synthèse).
- Utiliser des formats structurés pour séparer le contenu des métadonnées (URL sources, noms de documents, numéros de page) et préserver l’attribution.
- Lancer des sous-agents en parallèle en émettant plusieurs appels de l’outil Task dans une seule réponse du coordinateur, plutôt que sur des tours séparés.
- Rédiger des prompts de coordinateur qui fixent les objectifs et critères de qualité plutôt que des instructions procédurales pas à pas, pour laisser les sous-agents s’adapter.

### 1.4 Implémenter des workflows multi-étapes avec contrôle et transmission (*Implement multi-step workflows with enforcement and handoff patterns*)

**Notions clés** : contrôle programmatique ; prérequis bloquants ; guidage par prompt ; taux d’échec non nul ; transmission structurée ; demandes multi-sujets.

**Connaissances**
- La différence entre contrôle programmatique (hooks, étapes prérequises bloquantes) et guidage par le prompt pour l’ordre des étapes d’un workflow.
- Quand une conformité déterministe est exigée (vérification d’identité avant une opération financière, par exemple), les instructions du prompt seules ont un taux d’échec non nul.
- Les protocoles de transmission structurés pour l’escalade en cours de traitement : informations client, analyse de la cause racine, actions recommandées.

**Compétences**
- Implémenter des prérequis programmatiques qui bloquent les appels d’outils en aval tant que les étapes préalables ne sont pas terminées (bloquer `process_refund` tant que `get_customer` n’a pas renvoyé un identifiant client vérifié).
- Décomposer une demande client à plusieurs sujets en éléments distincts, les instruire en parallèle avec un contexte partagé, puis synthétiser une réponse unique.
- Rédiger des résumés de transmission structurés (identifiant client, cause racine, montant du remboursement, action recommandée) pour les agents humains, qui n’ont pas accès à la conversation.

### 1.5 Utiliser les hooks de l’Agent SDK pour intercepter les appels d’outils et normaliser les données (*Apply Agent SDK hooks for tool call interception and data normalization*)

**Notions clés** : hook `PostToolUse` ; interception des appels sortants ; règles de conformité ; garanties déterministes ; normalisation des formats ; redirection vers l’escalade.

**Connaissances**
- Les hooks (comme `PostToolUse`) qui interceptent les résultats d’outils pour les transformer avant que le modèle ne les traite.
- Les hooks qui interceptent les appels d’outils sortants pour appliquer des règles de conformité (bloquer les remboursements au-delà d’un seuil, par exemple).
- La différence entre les hooks, qui donnent des garanties déterministes, et les instructions du prompt, dont la conformité n’est que probabiliste.

**Compétences**
- Implémenter des hooks `PostToolUse` qui normalisent des formats hétérogènes (timestamps Unix, ISO 8601, codes de statut numériques) venant de différents outils MCP.
- Implémenter des hooks d’interception qui bloquent les actions contraires à la politique (remboursements de plus de 500 $, par exemple) et redirigent vers un autre workflow (escalade humaine).
- Choisir les hooks plutôt que le prompt quand les règles métier exigent une conformité garantie.

### 1.6 Concevoir des stratégies de décomposition pour les workflows complexes (*Design task decomposition strategies for complex workflows*)

**Notions clés** : pipelines séquentiels (prompt chaining) ; décomposition dynamique adaptative ; passes par fichier ; passe d’intégration ; dilution de l’attention ; plans d’investigation adaptatifs.

**Connaissances**
- Quand utiliser des pipelines séquentiels fixes (*prompt chaining*) et quand préférer une décomposition dynamique fondée sur les résultats intermédiaires.
- Les enchaînements de prompts qui découpent une revue en étapes (analyser chaque fichier, puis faire une passe d’intégration entre fichiers).
- L’intérêt des plans d’investigation adaptatifs qui génèrent des sous-tâches selon ce qui est découvert à chaque étape.

**Compétences**
- Choisir le schéma de décomposition adapté : prompt chaining pour des revues prévisibles à plusieurs aspects, décomposition dynamique pour les investigations ouvertes.
- Découper une grosse revue de code en passes locales par fichier plus une passe d’intégration séparée, pour éviter la dilution de l’attention.
- Décomposer une tâche ouverte (« ajouter des tests complets à une base de code legacy ») : cartographier la structure, repérer les zones à fort impact, puis bâtir un plan priorisé qui s’adapte aux dépendances découvertes.

### 1.7 Gérer l’état des sessions, leur reprise et leur dérivation (*Manage session state, resumption, and forking*)

**Notions clés** : `--resume <nom-de-session>` ; `fork_session` ; informer des fichiers modifiés ; résultats d’outils périmés ; nouvelle session avec résumé structuré.

**Connaissances**
- La reprise d’une session nommée avec `--resume <session-name>` pour continuer une conversation précise.
- `fork_session` pour créer des branches indépendantes à partir d’une analyse commune et explorer des approches divergentes.
- L’importance d’informer l’agent des modifications apportées aux fichiers déjà analysés quand on reprend une session après des changements de code.
- Pourquoi démarrer une nouvelle session avec un résumé structuré est plus fiable que reprendre une session aux résultats d’outils périmés.

**Compétences**
- Utiliser `--resume` avec des noms de session pour poursuivre des investigations nommées d’une séance de travail à l’autre.
- Utiliser `fork_session` pour créer des branches d’exploration parallèles (comparer deux stratégies de test ou deux refactorings à partir de la même analyse).
- Choisir entre reprendre une session (contexte encore largement valide) et repartir de zéro avec un résumé injecté (résultats d’outils périmés).
- Signaler à une session reprise les fichiers modifiés, pour une ré-analyse ciblée plutôt qu’une ré-exploration complète.

---

## Domaine 2 — Conception d’outils et intégration MCP (18 %)

### 2.1 Concevoir des interfaces d’outils avec des descriptions et des limites claires (*Design effective tool interfaces with clear descriptions and boundaries*)

**Notions clés** : descriptions d’outils ; sélection des outils ; formats d’entrée et exemples ; chevauchement fonctionnel ; découpage en outils spécialisés ; formulation du prompt système.

**Connaissances**
- Les descriptions d’outils sont le principal mécanisme qu’utilise le modèle pour choisir un outil ; des descriptions minimales rendent la sélection peu fiable entre outils proches.
- L’importance d’inclure dans les descriptions les formats d’entrée, des exemples de requêtes, les cas limites et les frontières d’usage.
- Comment des descriptions ambiguës ou qui se recoupent provoquent des erreurs d’aiguillage (`analyze_content` contre `analyze_document` aux descriptions presque identiques).
- L’effet de la formulation du prompt système sur le choix des outils : des instructions sensibles à certains mots-clés peuvent créer des associations involontaires.

**Compétences**
- Rédiger des descriptions qui distinguent clairement l’objet de chaque outil, ses entrées, ses sorties, et quand l’utiliser plutôt qu’un outil proche.
- Renommer des outils et réécrire leur description pour supprimer un chevauchement (renommer `analyze_content` en `extract_web_results` avec une description propre au web).
- Découper un outil générique en outils spécialisés aux contrats d’entrée et de sortie définis (scinder `analyze_document` en `extract_data_points`, `summarize_content` et `verify_claim_against_source`).
- Relire le prompt système à la recherche d’instructions sensibles aux mots-clés qui pourraient prendre le pas sur des descriptions d’outils bien écrites.

### 2.2 Implémenter des réponses d’erreur structurées pour les outils MCP (*Implement structured error responses for MCP tools*)

**Notions clés** : drapeau `isError` ; erreurs transitoires, de validation, métier, de permission ; erreurs réessayables ou non ; métadonnées d’erreur structurées ; reprise locale ; résultat vide valide.

**Connaissances**
- Le motif du drapeau `isError` du MCP pour signaler l’échec d’un outil à l’agent.
- La différence entre erreurs transitoires (délai dépassé, service indisponible), erreurs de validation (entrée invalide), erreurs métier (violation de politique) et erreurs de permission.
- Pourquoi des réponses d’erreur uniformes (« Operation failed ») empêchent l’agent de prendre la bonne décision de reprise.
- La différence entre erreurs réessayables et non réessayables, et comment des métadonnées structurées évitent des tentatives inutiles.

**Compétences**
- Renvoyer des métadonnées d’erreur structurées : `errorCategory` (transient / validation / permission), booléen `isRetryable` et description lisible.
- Ajouter `retriable: false` et une explication compréhensible par le client pour les violations de règles métier, afin que l’agent communique correctement.
- Implémenter une reprise locale des erreurs transitoires dans les sous-agents, et ne remonter au coordinateur que les erreurs non résolues, avec les résultats partiels et ce qui a été tenté.
- Distinguer un échec d’accès (qui appelle une décision de nouvelle tentative) d’un résultat vide valide (requête réussie sans correspondance).

### 2.3 Répartir les outils entre agents et configurer le choix d’outil (*Distribute tools appropriately across agents and configure tool choice*)

**Notions clés** : trop d’outils par agent ; accès limité au rôle ; outils transverses ciblés ; `tool_choice` `"auto"`, `"any"`, outil forcé ; outils contraints.

**Connaissances**
- Donner trop d’outils à un agent (18 au lieu de 4 ou 5) dégrade la fiabilité du choix en augmentant la complexité de décision.
- Un agent qui dispose d’outils hors de sa spécialité a tendance à les utiliser à tort (un agent de synthèse qui lance des recherches web).
- L’accès limité au rôle : chaque agent ne reçoit que les outils de son rôle, plus quelques outils transverses ciblés pour des besoins fréquents.
- Les options de `tool_choice` : `"auto"`, `"any"` et la sélection forcée (`{"type": "tool", "name": "..."}`).

**Compétences**
- Restreindre l’ensemble d’outils de chaque sous-agent à ceux de son rôle pour éviter les mauvais usages.
- Remplacer des outils génériques par des alternatives contraintes (remplacer `fetch_url` par `load_document`, qui valide les URL de documents).
- Fournir des outils transverses limités pour les besoins fréquents (un outil `verify_fact` pour l’agent de synthèse) tout en faisant passer les cas complexes par le coordinateur.
- Forcer un outil précis avec `tool_choice` pour qu’il soit appelé en premier (`extract_metadata` avant les outils d’enrichissement), puis traiter la suite dans les tours suivants.
- Utiliser `tool_choice: "any"` pour garantir que le modèle appelle un outil plutôt que de répondre par du texte.

### 2.4 Intégrer des serveurs MCP dans Claude Code et dans les workflows d’agents (*Integrate MCP servers into Claude Code and agent workflows*)

**Notions clés** : portée projet `.mcp.json` ; portée utilisateur `~/.claude.json` ; expansion de variables d’environnement ; découverte des outils à la connexion ; ressources MCP comme catalogues ; serveurs communautaires.

**Connaissances**
- La portée des serveurs MCP : niveau projet (`.mcp.json`) pour l’outillage partagé de l’équipe, niveau utilisateur (`~/.claude.json`) pour les serveurs personnels ou expérimentaux.
- L’expansion de variables d’environnement dans `.mcp.json` (`${GITHUB_TOKEN}`, par exemple) pour gérer les identifiants sans commiter de secrets.
- Les outils de tous les serveurs MCP configurés sont découverts à la connexion et disponibles simultanément pour l’agent.
- Les ressources MCP comme moyen d’exposer des catalogues de contenu (résumés de tickets, arborescences de documentation, schémas de base) pour réduire les appels d’outils exploratoires.

**Compétences**
- Configurer des serveurs MCP partagés dans le `.mcp.json` du projet, avec expansion de variables d’environnement pour les jetons d’authentification.
- Configurer des serveurs personnels ou expérimentaux dans `~/.claude.json`.
- Enrichir les descriptions des outils MCP (capacités et sorties) pour que l’agent ne leur préfère pas des outils intégrés moins adaptés (comme Grep).
- Préférer les serveurs MCP communautaires existants pour les intégrations standard (Jira, par exemple) et réserver les serveurs sur mesure aux workflows propres à l’équipe.
- Exposer des catalogues de contenu en ressources MCP pour donner à l’agent une vue des données disponibles sans appels exploratoires.

### 2.5 Choisir et utiliser efficacement les outils intégrés (Read, Write, Edit, Bash, Grep, Glob) (*Select and apply built-in tools effectively*)

**Notions clés** : Grep pour le contenu ; Glob pour les chemins ; Read et Write ; Edit et texte unique ; repli Read + Write ; compréhension incrémentale.

**Connaissances**
- Grep pour la recherche de contenu (noms de fonctions, messages d’erreur, instructions d’import).
- Glob pour la recherche de chemins par motif (fichiers par nom ou extension).
- Read et Write pour les opérations sur des fichiers entiers ; Edit pour des modifications ciblées par correspondance de texte unique.
- Quand Edit échoue faute de correspondance unique, utiliser Read puis Write comme repli fiable.

**Compétences**
- Choisir Grep pour chercher dans le code (tous les appelants d’une fonction, l’origine d’un message d’erreur).
- Choisir Glob pour trouver des fichiers selon un motif de nom (`**/*.test.tsx`).
- Utiliser Read pour charger un fichier entier puis Write quand Edit ne trouve pas d’ancre unique.
- Construire la compréhension d’une base de code progressivement : Grep pour trouver les points d’entrée, puis Read pour suivre les imports et les flux, plutôt que tout lire d’emblée.
- Tracer l’usage d’une fonction à travers des modules d’enveloppe : identifier d’abord tous les noms exportés, puis rechercher chacun dans la base de code.

---

## Domaine 3 — Configuration et workflows Claude Code (20 %)

### 3.1 Configurer les fichiers CLAUDE.md avec la bonne hiérarchie, portée et organisation modulaire (*Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization*)

**Notions clés** : hiérarchie utilisateur / projet / répertoire ; `~/.claude/CLAUDE.md` non partagé ; syntaxe `@import` ; dossier `.claude/rules/` ; commande `/memory`.

**Connaissances**
- La hiérarchie de configuration CLAUDE.md : niveau utilisateur (`~/.claude/CLAUDE.md`), niveau projet (`.claude/CLAUDE.md` ou `CLAUDE.md` à la racine) et niveau répertoire (CLAUDE.md dans les sous-dossiers).
- Les réglages de niveau utilisateur ne s’appliquent qu’à cet utilisateur : les instructions de `~/.claude/CLAUDE.md` ne sont pas partagées avec l’équipe via le contrôle de version.
- La syntaxe `@import` pour référencer des fichiers externes et garder un CLAUDE.md modulaire (importer les standards propres à chaque package).
- Le dossier `.claude/rules/` pour organiser des fichiers de règles par thème, en alternative à un CLAUDE.md monolithique.

**Compétences**
- Diagnostiquer les problèmes de hiérarchie (un nouveau membre de l’équipe ne reçoit pas les instructions parce qu’elles sont au niveau utilisateur et non projet).
- Utiliser `@import` pour inclure sélectivement les standards pertinents dans le CLAUDE.md de chaque package.
- Découper un gros CLAUDE.md en fichiers thématiques dans `.claude/rules/` (`testing.md`, `api-conventions.md`, `deployment.md`).
- Utiliser la commande `/memory` pour vérifier quels fichiers de mémoire sont chargés et diagnostiquer un comportement incohérent d’une session à l’autre.

### 3.2 Créer et configurer des commandes slash et des skills personnalisés (*Create and configure custom slash commands and skills*)

**Notions clés** : `.claude/commands/` projet ou utilisateur ; skills `.claude/skills/` et `SKILL.md` ; `context: fork` ; `allowed-tools` ; `argument-hint` ; skills ou CLAUDE.md.

**Connaissances**
- Les commandes de projet dans `.claude/commands/` (partagées via le contrôle de version) et les commandes utilisateur dans `~/.claude/commands/` (personnelles).
- Les skills dans `.claude/skills/`, avec des fichiers `SKILL.md` dont le frontmatter accepte notamment `context: fork`, `allowed-tools` et `argument-hint`.
- L’option `context: fork`, qui exécute un skill dans un contexte de sous-agent isolé pour que sa sortie ne pollue pas la conversation principale.
- La personnalisation : créer des variantes personnelles dans `~/.claude/skills/` sous d’autres noms pour ne pas affecter l’équipe.

**Compétences**
- Créer des commandes slash de projet dans `.claude/commands/` pour les mettre à disposition de toute l’équipe via le contrôle de version.
- Utiliser `context: fork` pour isoler les skills à sortie verbeuse (analyse de code) ou exploratoire (brainstorming d’alternatives).
- Configurer `allowed-tools` dans le frontmatter pour restreindre les outils pendant l’exécution d’un skill (le limiter à l’écriture de fichiers pour éviter les actions destructrices, par exemple).
- Utiliser `argument-hint` pour demander les paramètres requis quand un développeur invoque le skill sans arguments.
- Choisir entre skills (invocation à la demande pour des workflows précis) et CLAUDE.md (standards universels toujours chargés).

### 3.3 Appliquer des règles par chemin pour charger les conventions de façon conditionnelle (*Apply path-specific rules for conditional convention loading*)

**Notions clés** : frontmatter `paths` ; motifs glob ; chargement conditionnel ; économie de contexte ; conventions transverses aux dossiers.

**Connaissances**
- Les fichiers de `.claude/rules/` avec un champ YAML `paths` contenant des motifs glob pour activer une règle de façon conditionnelle.
- Une règle limitée à des chemins ne se charge qu’à l’édition des fichiers correspondants, ce qui réduit le contexte inutile et les tokens consommés.
- L’avantage des règles par motif glob sur les CLAUDE.md de sous-dossiers pour des conventions qui couvrent plusieurs dossiers (fichiers de test répartis dans toute la base).

**Compétences**
- Créer des fichiers `.claude/rules/` avec un frontmatter `paths` (par exemple `paths: ["terraform/**/*"]`) pour qu’ils ne se chargent qu’à l’édition des fichiers concernés.
- Utiliser des motifs glob pour appliquer des conventions par type de fichier, quel que soit le dossier (`**/*.test.tsx` pour tous les fichiers de test).
- Préférer les règles par chemin aux CLAUDE.md de sous-dossiers quand les conventions concernent des fichiers dispersés dans la base.

### 3.4 Choisir entre plan mode et exécution directe (*Determine when to use plan mode vs direct execution*)

**Notions clés** : plan mode pour les tâches complexes ; exécution directe pour les changements simples ; exploration sans risque ; sous-agent Explore ; combiner plan et exécution.

**Connaissances**
- Le plan mode est fait pour les tâches complexes : changements à grande échelle, plusieurs approches valables, décisions d’architecture, modifications sur plusieurs fichiers.
- L’exécution directe convient aux changements simples et bien délimités (ajouter une validation à une fonction).
- Le plan mode permet d’explorer la base et de concevoir sans risque avant de s’engager, ce qui évite des reprises coûteuses.
- Le sous-agent Explore isole la sortie verbeuse de la phase de découverte et ne renvoie qu’un résumé, pour préserver le contexte principal.

**Compétences**
- Choisir le plan mode pour les tâches aux implications architecturales (restructuration en microservices, migration de bibliothèque touchant plus de 45 fichiers, choix entre approches d’intégration aux exigences d’infrastructure différentes).
- Choisir l’exécution directe pour des changements bien compris et délimités (correction d’un bug sur un seul fichier avec une trace claire, ajout d’une condition de validation de date).
- Utiliser le sous-agent Explore pour les phases de découverte verbeuses, afin d’éviter d’épuiser la fenêtre de contexte dans les tâches en plusieurs phases.
- Combiner plan mode pour l’investigation et exécution directe pour l’implémentation (planifier une migration de bibliothèque, puis exécuter l’approche retenue).

### 3.5 Appliquer des techniques de raffinement itératif (*Apply iterative refinement techniques for progressive improvement*)

**Notions clés** : exemples d’entrée / sortie ; itération guidée par les tests ; pattern d’interview ; problèmes liés ou indépendants.

**Connaissances**
- Des exemples concrets d’entrée et de sortie sont le moyen le plus efficace de communiquer une transformation attendue quand une description en prose est interprétée de façon incohérente.
- L’itération guidée par les tests : écrire d’abord les suites de tests, puis itérer en partageant les échecs pour guider l’amélioration.
- Le pattern d’interview : faire poser des questions à Claude pour faire émerger des points que le développeur n’avait pas anticipés avant l’implémentation.
- Quand signaler tous les problèmes dans un seul message (problèmes qui interagissent) ou les corriger un par un (problèmes indépendants).

**Compétences**
- Fournir 2 ou 3 exemples concrets d’entrée et de sortie pour préciser une transformation quand la description en langage naturel donne des résultats incohérents.
- Écrire des suites de tests couvrant le comportement attendu, les cas limites et les exigences de performance avant l’implémentation, puis itérer en partageant les échecs.
- Utiliser le pattern d’interview pour faire émerger des choix de conception (stratégies d’invalidation de cache, modes de défaillance) avant d’implémenter dans un domaine peu familier.
- Fournir des cas de test précis, avec entrée et sortie attendue, pour corriger la gestion d’un cas limite (valeurs nulles dans des scripts de migration).
- Traiter plusieurs problèmes liés dans un seul message détaillé quand les corrections interagissent, et itérer séquentiellement pour des problèmes indépendants.

### 3.6 Intégrer Claude Code dans les pipelines CI/CD (*Integrate Claude Code into CI/CD pipelines*)

**Notions clés** : option `-p` / `--print` ; `--output-format json` ; `--json-schema` ; CLAUDE.md comme contexte en CI ; isolation du contexte de session ; résultats de revue antérieurs.

**Connaissances**
- L’option `-p` (ou `--print`) pour exécuter Claude Code en mode non interactif dans un pipeline automatisé.
- Les options CLI `--output-format json` et `--json-schema` pour imposer une sortie structurée en CI.
- CLAUDE.md comme moyen de fournir le contexte du projet (standards de test, conventions de fixtures, critères de revue) à Claude Code lancé en CI.
- L’isolation du contexte de session : la session qui a généré le code est moins efficace pour relire ses propres changements qu’une instance de revue indépendante.

**Compétences**
- Lancer Claude Code en CI avec l’option `-p` pour éviter les blocages en attente d’une saisie interactive.
- Utiliser `--output-format json` avec `--json-schema` pour produire des résultats structurés exploitables par une machine et publiés en commentaires de PR.
- Inclure les résultats de revue précédents dans le contexte quand la revue est relancée après de nouveaux commits, en demandant de ne signaler que les problèmes nouveaux ou non résolus pour éviter les commentaires en double.
- Fournir les fichiers de test existants dans le contexte pour que la génération de tests évite de proposer des scénarios déjà couverts.
- Documenter dans CLAUDE.md les standards de test, les critères d’un test utile et les fixtures disponibles, pour améliorer la qualité des tests générés et limiter ceux de faible valeur.

---

## Domaine 4 — Prompt engineering et sortie structurée (20 %)

### 4.1 Concevoir des prompts aux critères explicites pour gagner en précision et réduire les faux positifs (*Design prompts with explicit criteria to improve precision and reduce false positives*)

**Notions clés** : critères explicites ; consignes vagues inefficaces ; taux de faux positifs ; confiance des développeurs ; désactivation temporaire de catégories ; critères de sévérité.

**Connaissances**
- L’importance de critères explicites plutôt que de consignes vagues (« signaler un commentaire seulement si le comportement décrit contredit le comportement réel du code » plutôt que « vérifier que les commentaires sont exacts »).
- Les consignes générales comme « sois prudent » ou « ne signale que les résultats très sûrs » n’améliorent pas la précision, contrairement à des critères catégoriels précis.
- L’effet du taux de faux positifs sur la confiance des développeurs : les catégories qui génèrent beaucoup de faux positifs font douter des catégories fiables.

**Compétences**
- Rédiger des critères de revue précis qui définissent ce qu’il faut signaler (bugs, sécurité) et ignorer (style mineur, conventions locales) plutôt que de filtrer par niveau de confiance.
- Désactiver temporairement les catégories à fort taux de faux positifs pour restaurer la confiance pendant l’amélioration des prompts correspondants.
- Définir des critères de sévérité explicites, avec des exemples de code concrets pour chaque niveau, afin d’obtenir une classification cohérente.

### 4.2 Utiliser le few-shot prompting pour améliorer la cohérence et la qualité des sorties (*Apply few-shot prompting to improve output consistency and quality*)

**Notions clés** : exemples few-shot ; cas ambigus ; format de sortie ; généralisation ; réduction des hallucinations en extraction ; structures de documents variées.

**Connaissances**
- Les exemples few-shot sont la technique la plus efficace pour obtenir une sortie au format cohérent et actionnable quand des instructions détaillées ne suffisent pas.
- Le rôle des exemples pour montrer le traitement des cas ambigus (choix d’outil pour une demande ambiguë, lacunes de couverture de tests au niveau des branches).
- Les exemples permettent au modèle de généraliser son jugement à de nouveaux cas, au-delà des seuls cas présentés.
- L’efficacité des exemples pour réduire les hallucinations en extraction (mesures informelles, structures de documents variées).

**Compétences**
- Créer 2 à 4 exemples ciblés pour les scénarios ambigus, qui montrent pourquoi une action a été choisie plutôt qu’une autre plausible.
- Inclure des exemples qui montrent le format de sortie voulu (emplacement, problème, sévérité, correctif proposé).
- Fournir des exemples qui distinguent les motifs de code acceptables des vrais problèmes, pour réduire les faux positifs tout en permettant la généralisation.
- Utiliser des exemples pour montrer le bon traitement de structures de documents variées (citations dans le texte ou bibliographie, section méthodologie ou détails intégrés).
- Ajouter des exemples d’extraction réussie sur des documents de formats variés pour corriger les champs obligatoires extraits vides ou nuls.

### 4.3 Imposer une sortie structurée avec le tool use et les schémas JSON (*Enforce structured output using tool use and JSON schemas*)

**Notions clés** : `tool_use` avec schéma JSON ; `tool_choice` `"auto"`, `"any"`, forcé ; erreurs de syntaxe ou erreurs sémantiques ; champs obligatoires ou facultatifs ; champs nullable ; enum avec `"other"` et détail.

**Connaissances**
- Le tool use (`tool_use`) avec des schémas JSON est l’approche la plus fiable pour une sortie conforme à un schéma, sans erreur de syntaxe JSON.
- La différence entre `tool_choice: "auto"` (le modèle peut répondre par du texte au lieu d’appeler un outil), `"any"` (il doit appeler un outil mais choisit lequel) et la sélection forcée (il doit appeler l’outil nommé).
- Un schéma JSON strict via le tool use élimine les erreurs de syntaxe mais pas les erreurs sémantiques (lignes qui ne s’additionnent pas au total, valeurs dans le mauvais champ).
- La conception du schéma : champs obligatoires ou facultatifs, champs enum avec `"other"` plus une chaîne de détail pour des catégories extensibles.

**Compétences**
- Définir des outils d’extraction avec un schéma JSON comme paramètres d’entrée et récupérer les données structurées dans la réponse `tool_use`.
- Utiliser `tool_choice: "any"` pour garantir une sortie structurée quand plusieurs schémas d’extraction existent et que le type de document est inconnu.
- Forcer un outil avec `tool_choice: {"type": "tool", "name": "extract_metadata"}` pour qu’une extraction précise ait lieu avant les étapes d’enrichissement.
- Rendre les champs facultatifs (nullable) quand les documents sources peuvent ne pas contenir l’information, pour éviter que le modèle invente des valeurs afin de remplir des champs obligatoires.
- Ajouter des valeurs d’enum comme `"unclear"` pour les cas ambigus et `"other"` avec un champ de détail pour une catégorisation extensible.
- Inclure des règles de normalisation de format dans les prompts, en plus de schémas stricts, pour gérer les sources au format incohérent.

### 4.4 Implémenter des boucles de validation, de nouvelle tentative et de retour pour la qualité d’extraction (*Implement validation, retry, and feedback loops for extraction quality*)

**Notions clés** : nouvelle tentative avec retour d’erreur ; limites des nouvelles tentatives ; champ `detected_pattern` ; erreurs sémantiques ou de syntaxe ; auto-correction ; `calculated_total` et `stated_total`.

**Connaissances**
- La nouvelle tentative avec retour d’erreur : ajouter au prompt les erreurs de validation précises pour guider la correction.
- Les limites de la nouvelle tentative : elle est inutile quand l’information est absente du document source (contrairement aux erreurs de format ou de structure).
- La conception de boucles de retour : suivre quels motifs de code déclenchent des signalements (champ `detected_pattern`) pour analyser systématiquement les rejets.
- La différence entre erreurs de validation sémantique (valeurs qui ne s’additionnent pas, champ mal placé) et erreurs de syntaxe du schéma (éliminées par le tool use).

**Compétences**
- Implémenter des requêtes de suivi qui incluent le document d’origine, l’extraction ratée et les erreurs de validation précises pour que le modèle se corrige.
- Repérer quand une nouvelle tentative sera inutile (information présente seulement dans un document externe non fourni) et quand elle réussira (format inadapté, erreur de structure).
- Ajouter des champs `detected_pattern` aux signalements structurés pour analyser les motifs de faux positifs quand les développeurs rejettent des résultats.
- Concevoir des flux d’auto-correction : extraire `"calculated_total"` en plus de `"stated_total"` pour signaler les écarts, ajouter un booléen `"conflict_detected"` pour les sources incohérentes.

### 4.5 Concevoir des stratégies de traitement par lots efficaces (*Design efficient batch processing strategies*)

**Notions clés** : Message Batches API ; 50 % d’économie ; fenêtre de 24 heures ; pas de SLA de latence ; pas d’appels d’outils multi-tours ; `custom_id`.

**Connaissances**
- La Message Batches API : 50 % d’économie, traitement en 24 heures au plus, aucune garantie de latence (SLA).
- Le traitement par lots convient aux charges non bloquantes et tolérantes à la latence (rapports de nuit, audits hebdomadaires, génération de tests nocturne), pas aux workflows bloquants (vérifications avant fusion).
- L’API par lots ne permet pas d’appels d’outils multi-tours dans une même requête (impossible d’exécuter des outils en cours de requête et d’en renvoyer les résultats).
- Les champs `custom_id` pour associer chaque requête du lot à sa réponse.

**Compétences**
- Adapter l’approche aux contraintes de latence : API synchrone pour les vérifications bloquantes avant fusion, API par lots pour les analyses de nuit ou hebdomadaires.
- Calculer la fréquence de soumission des lots selon les contraintes de SLA (fenêtres de 4 heures pour garantir un SLA de 30 heures avec un traitement en 24 heures).
- Gérer les échecs : ne resoumettre que les documents en échec (identifiés par `custom_id`), avec les modifications nécessaires (découper les documents qui dépassaient la fenêtre de contexte).
- Affiner le prompt sur un échantillon avant de traiter de gros volumes, pour maximiser le taux de réussite au premier passage et réduire le coût des resoumissions.

### 4.6 Concevoir des architectures de revue multi-instances et multi-passes (*Design multi-instance and multi-pass review architectures*)

**Notions clés** : limites de l’auto-revue ; instance de revue indépendante ; revue multi-passes ; passes par fichier et passe d’intégration ; confiance auto-déclarée pour le routage.

**Connaissances**
- Les limites de l’auto-revue : le modèle garde le raisonnement de la génération, ce qui le rend moins enclin à remettre en cause ses propres choix dans la même session.
- Une instance de revue indépendante (sans le raisonnement précédent) détecte mieux les problèmes subtils que des consignes d’auto-revue ou la réflexion étendue.
- La revue multi-passes : découper une grosse revue en passes d’analyse locale par fichier plus des passes d’intégration entre fichiers, pour éviter la dilution de l’attention et les signalements contradictoires.

**Compétences**
- Utiliser une seconde instance de Claude, indépendante, pour relire le code généré sans le contexte de raisonnement du générateur.
- Découper une revue multi-fichiers en passes ciblées par fichier pour les problèmes locaux, plus des passes d’intégration pour l’analyse des flux de données entre fichiers.
- Lancer des passes de vérification où le modèle indique sa confiance pour chaque signalement, afin de router la revue de façon calibrée.

---

## Domaine 5 — Gestion du contexte et fiabilité (15 %)

### 5.1 Gérer le contexte de conversation pour préserver les informations critiques dans les longues interactions (*Manage conversation context to preserve critical information across long interactions*)

**Notions clés** : risques de la synthèse progressive ; effet « lost in the middle » ; accumulation des résultats d’outils ; historique complet ; bloc « case facts » ; réduction des sorties d’outils.

**Connaissances**
- Les risques de la synthèse progressive : montants, pourcentages, dates et attentes exprimées par le client deviennent des résumés vagues.
- L’effet « lost in the middle » : le modèle traite bien le début et la fin des longues entrées mais peut omettre ce qui se trouve au milieu.
- Les résultats d’outils s’accumulent dans le contexte et consomment des tokens sans rapport avec leur utilité (plus de 40 champs par recherche de commande quand 5 suffisent).
- L’importance de transmettre l’historique complet de la conversation dans les requêtes API suivantes pour garder la cohérence.

**Compétences**
- Extraire les faits transactionnels (montants, dates, numéros de commande, statuts) dans un bloc persistant « case facts » inclus dans chaque prompt, hors de l’historique résumé.
- Extraire et conserver les données structurées de chaque problème (identifiants de commande, montants, statuts) dans une couche de contexte séparée pour les sessions à plusieurs problèmes.
- Réduire les sorties d’outils verbeuses aux seuls champs utiles avant qu’elles ne s’accumulent (ne garder que les champs utiles au retour dans une recherche de commande).
- Placer les résumés des résultats clés au début des entrées agrégées et organiser les détails avec des titres de section explicites pour limiter les effets de position.
- Exiger des sous-agents des métadonnées (dates, emplacements des sources, contexte méthodologique) dans leurs sorties structurées pour une synthèse fiable en aval.
- Modifier les agents en amont pour qu’ils renvoient des données structurées (faits clés, citations, scores de pertinence) plutôt que du contenu verbeux quand les agents en aval ont un budget de contexte limité.

### 5.2 Concevoir des schémas d’escalade et de résolution des ambiguïtés (*Design effective escalation and ambiguity resolution patterns*)

**Notions clés** : déclencheurs d’escalade ; demande explicite d’un humain ; lacunes de politique ; escalade fondée sur le sentiment peu fiable ; confiance auto-déclarée peu fiable ; correspondances multiples et identifiants supplémentaires.

**Connaissances**
- Les bons déclencheurs d’escalade : demande d’un humain par le client, exceptions ou lacunes de la politique (pas seulement les cas complexes), incapacité à progresser.
- La différence entre escalader immédiatement quand le client l’exige explicitement et proposer de résoudre quand le problème est simple.
- Pourquoi l’escalade fondée sur le sentiment et les scores de confiance auto-déclarés sont des indicateurs peu fiables de la complexité réelle.
- Quand un outil renvoie plusieurs clients correspondants, il faut demander des identifiants supplémentaires plutôt que choisir par heuristique.

**Compétences**
- Ajouter au prompt système des critères d’escalade explicites, avec des exemples few-shot, qui montrent quand escalader et quand résoudre en autonomie.
- Honorer immédiatement la demande explicite d’un agent humain, sans tenter d’abord d’investiguer.
- Reconnaître la frustration tout en proposant une résolution quand le problème est à la portée de l’agent, et n’escalader que si le client réitère sa demande.
- Escalader quand la politique est ambiguë ou muette sur la demande (alignement sur le prix d’un concurrent alors que la politique ne couvre que les ajustements sur le site).
- Demander à l’agent de solliciter des identifiants supplémentaires quand les résultats d’outils renvoient plusieurs correspondances, plutôt que de choisir par heuristique.

### 5.3 Implémenter des stratégies de propagation des erreurs dans les systèmes multi-agents (*Implement error propagation strategies across multi-agent systems*)

**Notions clés** : contexte d’erreur structuré ; échec d’accès ou résultat vide valide ; statuts d’erreur génériques ; erreurs supprimées en silence ; arrêt complet sur un seul échec ; annotations de couverture.

**Connaissances**
- Le contexte d’erreur structuré (type d’échec, requête tentée, résultats partiels, alternatives) permet au coordinateur de décider intelligemment de la reprise.
- La différence entre échec d’accès (délai dépassé, qui appelle une décision de nouvelle tentative) et résultat vide valide (requête réussie sans correspondance).
- Pourquoi des statuts d’erreur génériques (« search unavailable ») privent le coordinateur d’un contexte utile.
- Pourquoi supprimer une erreur en silence (renvoyer un résultat vide comme un succès) et arrêter tout le workflow sur un seul échec sont deux anti-patterns.

**Compétences**
- Renvoyer un contexte d’erreur structuré (type d’échec, ce qui a été tenté, résultats partiels, alternatives possibles) pour permettre la reprise par le coordinateur.
- Distinguer les échecs d’accès des résultats vides valides dans les rapports d’erreur, pour que le coordinateur prenne la bonne décision.
- Faire gérer localement par les sous-agents les échecs transitoires, et ne remonter que les erreurs non résolues, avec ce qui a été tenté et les résultats partiels.
- Structurer la sortie de synthèse avec des annotations de couverture qui indiquent les résultats bien étayés et les zones lacunaires faute de sources disponibles.

### 5.4 Gérer efficacement le contexte lors de l’exploration d’une grande base de code (*Manage context effectively in large codebase exploration*)

**Notions clés** : dégradation du contexte ; fichiers scratchpad ; délégation à des sous-agents ; persistance d’état et manifeste ; reprise après crash ; `/compact`.

**Connaissances**
- La dégradation du contexte dans les sessions longues : le modèle donne des réponses incohérentes et évoque des « motifs typiques » au lieu des classes précises découvertes plus tôt.
- Le rôle des fichiers scratchpad pour conserver les résultats clés au-delà des limites du contexte.
- La délégation à des sous-agents pour isoler la sortie verbeuse de l’exploration pendant que l’agent principal garde la vue d’ensemble.
- La persistance d’état structurée pour la reprise après crash : chaque agent exporte son état à un emplacement connu et le coordinateur charge un manifeste à la reprise.

**Compétences**
- Lancer des sous-agents pour des questions précises (« trouve tous les fichiers de test », « trace les dépendances du flux de remboursement ») pendant que l’agent principal coordonne.
- Faire tenir aux agents des fichiers scratchpad avec les résultats clés, et s’y référer pour les questions suivantes afin de contrer la dégradation du contexte.
- Résumer les résultats clés d’une phase d’exploration avant de lancer les sous-agents de la phase suivante, en injectant ces résumés dans leur contexte initial.
- Concevoir la reprise après crash avec des exports d’état structurés (manifestes) que le coordinateur charge à la reprise et injecte dans les prompts des agents.
- Utiliser `/compact` pour réduire l’usage du contexte pendant les longues sessions d’exploration quand le contexte se remplit de sorties verbeuses.

### 5.5 Concevoir des workflows de revue humaine et calibrer la confiance (*Design human review workflows and confidence calibration*)

**Notions clés** : métriques d’exactitude agrégées trompeuses ; échantillonnage aléatoire stratifié ; scores de confiance par champ ; jeux de validation étiquetés ; exactitude par type de document et par champ ; routage vers la revue humaine.

**Connaissances**
- Le risque que des métriques agrégées (97 % d’exactitude globale, par exemple) masquent de mauvaises performances sur certains types de documents ou certains champs.
- L’échantillonnage aléatoire stratifié pour mesurer le taux d’erreur des extractions à haute confiance et détecter de nouveaux motifs d’erreur.
- Les scores de confiance par champ, calibrés sur des jeux de validation étiquetés, pour orienter l’attention des relecteurs.
- L’importance de valider l’exactitude par type de document et par segment de champ avant d’automatiser les extractions à haute confiance.

**Compétences**
- Mettre en place un échantillonnage aléatoire stratifié des extractions à haute confiance pour mesurer le taux d’erreur en continu et détecter de nouveaux motifs.
- Analyser l’exactitude par type de document et par champ pour vérifier une performance homogène sur tous les segments avant de réduire la revue humaine.
- Faire produire au modèle des scores de confiance par champ, puis calibrer les seuils de revue sur des jeux de validation étiquetés.
- Router vers la revue humaine les extractions à faible confiance ou issues de documents ambigus ou contradictoires, en priorisant une capacité de relecture limitée.

### 5.6 Préserver la provenance de l’information et gérer l’incertitude dans une synthèse multi-sources (*Preserve information provenance and handle uncertainty in multi-source synthesis*)

**Notions clés** : perte d’attribution lors de la synthèse ; correspondances affirmation-source ; statistiques contradictoires ; données temporelles ; résultats établis ou contestés ; rendu adapté au type de contenu.

**Connaissances**
- L’attribution des sources se perd lors des étapes de synthèse quand les résultats sont compressés sans garder les correspondances affirmation-source.
- L’importance des correspondances structurées affirmation-source que l’agent de synthèse doit préserver et fusionner.
- Le traitement des statistiques contradictoires issues de sources crédibles : annoter le conflit avec l’attribution des sources plutôt que choisir arbitrairement une valeur.
- Les données temporelles : exiger les dates de publication ou de collecte dans les sorties structurées pour qu’une différence dans le temps ne soit pas prise pour une contradiction.

**Compétences**
- Exiger des sous-agents des correspondances structurées affirmation-source (URL, noms de documents, extraits pertinents) que les agents en aval préservent pendant la synthèse.
- Structurer les rapports avec des sections qui distinguent les résultats bien établis des résultats contestés, en préservant la caractérisation et le contexte méthodologique des sources.
- Terminer l’analyse des documents en incluant les valeurs contradictoires, annotées explicitement, pour laisser le coordinateur décider de la réconciliation avant la synthèse.
- Exiger des sous-agents les dates de publication ou de collecte dans leurs sorties structurées pour une interprétation temporelle correcte.
- Adapter le rendu au type de contenu dans la synthèse (données financières en tableaux, actualités en prose, résultats techniques en listes structurées) plutôt que tout uniformiser.

---

## Technologies et concepts (annexe du guide)

- **Claude Agent SDK** : définitions d’agents, boucles agentiques, gestion de `stop_reason`, hooks (`PostToolUse`, interception des appels d’outils), lancement de sous-agents via l’outil Task, configuration `allowedTools`.
- **Model Context Protocol (MCP)** : serveurs, outils et ressources MCP, drapeau `isError`, descriptions d’outils, répartition des outils, configuration `.mcp.json`, expansion de variables d’environnement.
- **Claude Code** : hiérarchie CLAUDE.md (utilisateur / projet / répertoire), `.claude/rules/` avec frontmatter de chemins, `.claude/commands/` pour les commandes slash, `.claude/skills/` avec frontmatter `SKILL.md` (`context: fork`, `allowed-tools`, `argument-hint`), plan mode, exécution directe, `/memory`, `/compact`, `--resume`, `fork_session`, sous-agent Explore.
- **Claude Code CLI** : `-p` / `--print` pour le mode non interactif, `--output-format json`, `--json-schema` pour une sortie structurée en CI.
- **Claude API** : `tool_use` avec schémas JSON, options `tool_choice` (`"auto"`, `"any"`, outil forcé), valeurs de `stop_reason` (`"tool_use"`, `"end_turn"`), `max_tokens`, prompts système.
- **Message Batches API** : 50 % d’économie, fenêtre de traitement jusqu’à 24 heures, `custom_id`, suivi de l’avancement par interrogation, pas d’appels d’outils multi-tours.
- **JSON Schema** : champs obligatoires ou facultatifs, types enum, champs nullable, motif `"other"` + chaîne de détail, mode strict contre les erreurs de syntaxe.
- **Pydantic** : validation de schéma, erreurs de validation sémantique, boucles de validation et nouvelle tentative.
- **Outils intégrés** : Read, Write, Edit, Bash, Grep, Glob, leur rôle et leurs critères de choix.
- **Few-shot prompting** : exemples ciblés pour les cas ambigus, démonstration du format, généralisation à de nouveaux cas.
- **Prompt chaining** : décomposition séquentielle en passes ciblées.
- **Gestion de la fenêtre de contexte** : budgets de tokens, synthèse progressive, effet « lost in the middle », extraction du contexte, fichiers scratchpad.
- **Gestion des sessions** : reprise, `fork_session`, sessions nommées, isolation du contexte de session.
- **Scores de confiance** : confiance par champ, calibration sur jeux de validation étiquetés, échantillonnage stratifié pour mesurer le taux d’erreur.

## Hors programme (ne pas évaluer)

Le guide précise que ces sujets **ne sont pas évalués** :

- fine-tuning ou entraînement de modèles ;
- authentification, facturation ou gestion de compte de l’API Claude ;
- implémentation détaillée de langages ou frameworks particuliers (au-delà de ce qu’exige la configuration des outils et des schémas) ;
- déploiement ou hébergement de serveurs MCP (infrastructure, réseau, orchestration de conteneurs) ;
- architecture interne de Claude, processus d’entraînement, poids du modèle ;
- Constitutional AI, RLHF, méthodes d’entraînement à la sécurité ;
- modèles d’embedding, bases vectorielles ;
- computer use (automatisation de navigateur ou de bureau) ;
- vision, analyse d’images ;
- implémentation du streaming, server-sent events ;
- limites de débit, quotas, calcul des tarifs de l’API ;
- OAuth, rotation des clés API, détails des protocoles d’authentification ;
- configurations propres à un fournisseur cloud (AWS, GCP, Azure) ;
- benchmarks et comparaisons de modèles ;
- détails d’implémentation du prompt caching (au-delà de savoir qu’il existe) ;
- algorithmes de comptage de tokens, tokenisation.

## Exercices de préparation (section 8 du guide)

| # | Exercice | Objectif | Domaines |
|---|---|---|---|
| 1 | Construire un agent multi-outils avec logique d’escalade | Boucle agentique avec 3 ou 4 outils MCP bien décrits (dont deux proches), gestion de `stop_reason`, erreurs structurées (`errorCategory`, `isRetryable`), hook d’interception d’une règle métier, test avec des demandes à plusieurs sujets | 1, 2, 5 |
| 2 | Configurer Claude Code pour une équipe | CLAUDE.md de projet, `.claude/rules/` avec motifs glob, skill de projet avec `context: fork` et `allowed-tools`, serveur MCP dans `.mcp.json` avec variables d’environnement plus un serveur personnel dans `~/.claude.json`, comparaison plan mode et exécution directe | 3, 2 |
| 3 | Construire un pipeline d’extraction de données structurées | Outil d’extraction avec schéma JSON (champs obligatoires, facultatifs, nullable, enum `"other"` + détail), boucle de validation et nouvelle tentative, exemples few-shot, lot de 100 documents via la Message Batches API avec gestion des échecs par `custom_id`, routage vers la revue humaine selon la confiance par champ | 4, 5 |
| 4 | Concevoir et déboguer un pipeline de recherche multi-agents | Coordinateur avec `"Task"` dans `allowedTools`, sous-agents en parallèle, sorties structurées séparant contenu et métadonnées, propagation d’erreur structurée avec résultats partiels et annotations de couverture, traitement de sources contradictoires avec attribution | 1, 2, 5 |
