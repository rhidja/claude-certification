// Cours CCDV-F : un module par objectif (compétence pondérée du guide d’examen).
// d = domaine, o = objectifs traités. lvl = « essentiel », « avancé » ou « complément » ; extra: true = hors description officielle.
// Les textes peuvent contenir <b>, <i> et <code> ; p peut être un tableau de paragraphes ; code = bloc affiché tel quel.
const COURSES = [
  // ===== D1 — Agents et workflows =====
  {
    d: 1, o: ["1.1"],
    title: "Architecture d’agent : workflow ou agent ?",
    summary: "Choisir entre un workflow à étapes fixes et un agent autonome, et structurer les rôles avec des sous-agents.",
    sections: [
      { h: "Workflow ou agent", lvl: "essentiel",
        p: [
          "Un <b>workflow</b> enchaîne des appels au modèle selon un chemin défini dans votre code : chaque étape est prévue à l’avance. Un <b>agent</b> laisse le modèle décider lui-même des étapes et des outils à utiliser, en boucle, jusqu’à atteindre l’objectif.",
          "Le workflow est plus prévisible, moins coûteux et plus facile à tester ; l’agent est plus souple face à des tâches ouvertes, mais plus coûteux et plus difficile à contrôler. Règle générale : commencer par la solution la plus simple (un appel unique, puis un workflow) et ne passer à un agent que lorsque la tâche l’exige."
        ] },
      { h: "Critères de choix", lvl: "essentiel",
        points: [
          "<b>Complexité</b> : la tâche comporte-t-elle plusieurs étapes impossibles à spécifier entièrement à l’avance ? (« transformer ce document de conception en pull request » contre « extraire le titre de ce PDF »).",
          "<b>Valeur</b> : le résultat justifie-t-il un coût et une latence plus élevés ?",
          "<b>Faisabilité</b> : Claude est-il capable de mener ce type de tâche ?",
          "<b>Coût de l’erreur</b> : les erreurs peuvent-elles être détectées et rattrapées (tests, relecture, retour arrière) ?",
          "Si une seule réponse est « non », rester sur un appel unique ou un workflow." ] },
      { h: "Hiérarchie gestionnaire / superviseur et sous-agents", lvl: "essentiel",
        points: [
          "Dans une <b>hiérarchie gestionnaire / superviseur</b>, un agent principal décompose la tâche, délègue à des agents spécialisés, contrôle leurs résultats et assemble la réponse.",
          "Les <b>sous-agents</b> améliorent l’exécution de trois façons : spécialisation (prompt et outils adaptés à un rôle), parallélisme (sous-tâches indépendantes menées en même temps) et isolement du contexte (l’exploration verbeuse reste dans le contexte du sous-agent, seul un résumé remonte).",
          "Contrepartie : chaque sous-agent ajoute du coût et de la coordination ; un sous-agent ne connaît que ce qu’on lui transmet." ] },
      { h: "Modèles de workflows courants", lvl: "complément", extra: true,
        points: [
          "<b>Enchaînement de prompts</b> : chaque étape traite la sortie de la précédente.",
          "<b>Routage</b> : une première étape classe la demande et l’oriente vers un traitement spécialisé.",
          "<b>Parallélisation</b> : plusieurs appels indépendants, puis agrégation.",
          "<b>Orchestrateur et exécutants</b> : un modèle découpe dynamiquement la tâche et répartit le travail.",
          "<b>Évaluateur et optimiseur</b> : un appel produit, un autre évalue et renvoie des corrections." ] }
    ]
  },
  {
    d: 1, o: ["1.2"],
    title: "Construire des agents avec Claude",
    summary: "Boucle manuelle, Tool Runner, Claude Agent SDK ou Managed Agents : qui fournit le harnais, qui héberge l’exécution.",
    sections: [
      { h: "Boucle d’agent sur mesure et harnais", lvl: "essentiel",
        p: [
          "Le <b>harnais</b> est le code qui fait tourner l’agent : il envoie les requêtes, exécute les outils demandés, renvoie les résultats et gère le contexte. La forme la plus simple est une <b>boucle d’agent sur mesure</b> écrite avec la Messages API : tant que <code>stop_reason</code> vaut <code>tool_use</code>, exécuter les outils et relancer.",
          "Le SDK Anthropic propose aussi un <b>Tool Runner</b> (bêta) qui automatise cette boucle pour les outils que vous définissez, tout en offrant des points d’accroche à chaque tour (validation, interception d’erreurs, journalisation)."
        ],
        code: "while True:\n    r = client.messages.create(model=MODEL, max_tokens=16000,\n                               tools=TOOLS, messages=messages)\n    messages.append({\"role\": \"assistant\", \"content\": r.content})\n    if r.stop_reason != \"tool_use\":\n        break\n    messages.append({\"role\": \"user\", \"content\": [\n        executer(b) for b in r.content if b.type == \"tool_use\"]})" },
      { h: "Claude Agent SDK", lvl: "essentiel",
        points: [
          "Le <b>Claude Agent SDK</b> (paquets <code>claude-agent-sdk</code> en Python et <code>@anthropic-ai/claude-agent-sdk</code> en TypeScript) fournit le harnais de Claude Code sous forme de bibliothèque.",
          "Il inclut des outils intégrés (lecture, écriture et modification de fichiers, Bash, Glob, Grep, recherche et lecture web), la boucle complète, la gestion du contexte, les sous-agents, les permissions, les sessions et les hooks.",
          "À ne pas confondre avec le Tool Runner : le Tool Runner boucle sur vos propres outils ; l’Agent SDK apporte un agent complet avec ses outils." ] },
      { h: "Auto-hébergé ou hébergé par Anthropic", lvl: "essentiel",
        p: "Deux questions distinguent les approches : <b>qui fournit le harnais</b>, et <b>qui fournit le déploiement</b>.",
        points: [
          "Boucle manuelle : vous écrivez le harnais et vous hébergez.",
          "Tool Runner et Agent SDK : le SDK fournit le harnais, mais vous hébergez et déployez (<b>auto-hébergé</b>).",
          "<b>Managed Agents</b> (bêta) : Anthropic fournit le harnais <b>et</b> héberge l’exécution, avec un conteneur de travail par session ; les configurations d’agent sont stockées et versionnées côté Anthropic (<b>hébergé par Anthropic</b>).",
          "Choisir l’auto-hébergement pour garder la main sur l’infrastructure ou un environnement d’exécution sur mesure ; choisir l’hébergement géré pour ne pas maintenir boucle, état et planification." ] },
      { h: "Hooks pour les actions déterministes", lvl: "essentiel",
        p: "Les <b>hooks</b> exécutent votre code à des moments précis du cycle de l’agent (par exemple avant ou après l’appel d’un outil). Ils servent aux actions qui doivent se produire <b>à coup sûr</b> : bloquer une commande dangereuse, journaliser chaque appel, formater un fichier après modification. Une consigne dans le prompt reste probabiliste ; un hook est déterministe." }
    ]
  },
  {
    d: 1, o: ["1.3"],
    title: "Modèles et frameworks d’agents",
    summary: "Les briques récurrentes d’un agent et la place des frameworks d’abstraction.",
    sections: [
      { h: "Boucle d’utilisation d’outils et sous-agents", lvl: "essentiel",
        points: [
          "<b>Boucle d’utilisation d’outils</b> : le modèle demande un outil, le harnais l’exécute, le résultat revient dans la conversation, et ainsi de suite jusqu’à la réponse finale.",
          "Quand Claude demande plusieurs outils dans la même réponse, on les exécute et on renvoie <b>tous</b> les résultats dans un seul message.",
          "<b>Sous-agents</b> : déléguer une sous-tâche à un agent au contexte séparé, qui ne renvoie qu’un résultat condensé." ] },
      { h: "Mémoire et gestion de la fenêtre de contexte", lvl: "essentiel",
        points: [
          "<b>Mémoire</b> : conserver des informations au-delà d’une conversation (fichiers de notes, base de données, outil mémoire de l’API) pour les retrouver plus tard.",
          "<b>Gestion de la fenêtre de contexte</b> : la fenêtre est limitée et chaque résultat d’outil la remplit. Techniques : élaguer les résultats d’outils, résumer (compaction), isoler les explorations dans des sous-agents.",
          "Bien choisir ce qui reste dans le contexte améliore la qualité autant que le coût." ] },
      { h: "Frameworks agentiques", lvl: "essentiel",
        points: [
          "Des <b>frameworks agentiques</b> tiers proposent des abstractions pour construire des agents et des workflows en plusieurs étapes : <b>Strands, LangGraph, PydanticAI</b>, cités par le guide.",
          "Ils accélèrent le démarrage (orchestration, état, intégrations) mais ajoutent une couche entre votre code et les requêtes réelles : prompts et réponses deviennent plus difficiles à inspecter et à déboguer.",
          "Bonne pratique : comprendre ce que le framework envoie réellement à l’API, et commencer par l’API directe quand quelques lignes suffisent." ] }
    ]
  },

  // ===== D2 — Applications et intégration =====
  {
    d: 2, o: ["2.1"],
    title: "Comprendre les exigences",
    summary: "Traduire un besoin métier en exigences fonctionnelles et d’infrastructure pour une application Claude.",
    sections: [
      { h: "Besoins métier et exigences fonctionnelles", lvl: "essentiel",
        points: [
          "Partir des <b>besoins métier</b> : quel problème résoudre, pour qui, avec quel critère de succès mesurable (taux de résolution, temps gagné, précision).",
          "Les <b>exigences fonctionnelles</b> décrivent ce que le système doit faire : entrées, sorties, comportements attendus, cas limites, actions autorisées.",
          "Pour une application d’IA, préciser aussi le niveau d’exactitude attendu et la conduite en cas de doute (refus, escalade vers un humain)." ] },
      { h: "Exigences d’infrastructure", lvl: "essentiel",
        points: [
          "<b>Exigences d’infrastructure</b> (ou non fonctionnelles) : latence acceptable, volume, disponibilité, coût, sécurité, conformité et lieu de traitement des données.",
          "Elles orientent directement les choix techniques : appels synchrones ou API par lots, modèle plus rapide ou plus capable, plateforme (Claude API, Bedrock, Vertex AI, Foundry), cache." ] },
      { h: "Architecture de la solution", lvl: "essentiel",
        p: "L’<b>architecture de la solution</b> relie les deux : composants (interface, backend, appels au modèle, outils, stockage), flux de données et points de contrôle humains. Une exigence non écrite (par exemple « réponse en moins de 2 secondes ») découverte tard peut invalider une architecture entière." }
    ]
  },
  {
    d: 2, o: ["2.2"],
    title: "Cycle de vie des systèmes",
    summary: "Développer, mettre en œuvre, exploiter et maintenir une application Claude dans la durée.",
    sections: [
      { h: "Cycle de vie des systèmes", lvl: "essentiel",
        p: "Le <b>cycle de vie des systèmes</b> décrit les phases d’un système informatique : définition des besoins, conception, <b>développer</b>, tester, <b>mettre en œuvre</b> (déployer), <b>exploiter</b> (surveiller, supporter) et <b>maintenir</b> (corriger, faire évoluer), jusqu’au retrait. Les démarches itératives (agiles) parcourent ce cycle par petits incréments." },
      { h: "Particularités des applications d’IA", lvl: "essentiel",
        points: [
          "<b>Développer</b> : prototyper vite, mais construire tôt un jeu d’évaluation (cas représentatifs et résultats attendus).",
          "<b>Mettre en œuvre</b> : déployer progressivement, avec des versions de prompts et de modèles identifiées.",
          "<b>Exploiter</b> : surveiller qualité, coûts, latence, taux d’erreur et retours des utilisateurs ; les sorties d’un modèle peuvent varier.",
          "<b>Maintenir</b> : les modèles évoluent et sont retirés ; une migration de modèle se prépare et se valide comme une montée de version." ] },
      { h: "Boucle d’amélioration", lvl: "complément", extra: true,
        p: "En exploitation, les cas d’échec observés alimentent le jeu d’évaluation ; chaque changement de prompt ou de modèle est validé sur ce jeu avant déploiement." }
    ]
  },
  {
    d: 2, o: ["2.3"],
    title: "Mécanique de l’API Claude",
    summary: "Messages, outils, streaming, vision, réflexion, cache, plateformes tierces et API par lots.",
    sections: [
      { h: "Messages API", lvl: "essentiel",
        p: [
          "Tout passe par la <b>Messages API</b> (<code>POST /v1/messages</code>) : un modèle, un nombre maximal de tokens de sortie (<code>max_tokens</code>), un prompt système facultatif et une liste de messages alternant <code>user</code> et <code>assistant</code>. La réponse contient une liste de blocs de contenu (texte, appel d’outil, réflexion…) et un <code>stop_reason</code>.",
          "L’API est <b>sans état</b> : chaque requête doit renvoyer tout l’historique utile. Pour réutiliser un fichier sans le renvoyer, on peut le téléverser une fois avec la Files API et le référencer par son identifiant."
        ],
        points: [
          "Valeurs de <code>stop_reason</code> : <code>end_turn</code> (fin naturelle), <code>max_tokens</code> (réponse coupée), <code>stop_sequence</code>, <code>tool_use</code> (outil demandé), <code>pause_turn</code> (tour suspendu, à reprendre) et <code>refusal</code> (refus pour raison de sécurité).",
          "Les outils sont décrits dans le paramètre <code>tools</code> (nom, description, schéma JSON des paramètres)." ] },
      { h: "Streaming, vision et thinking", lvl: "essentiel",
        points: [
          "<b>Streaming</b> : la réponse arrive au fil de l’eau sous forme d’événements (server-sent events). Recommandé pour les longues sorties ou un <code>max_tokens</code> élevé, afin d’afficher le texte progressivement et d’éviter les délais d’attente HTTP.",
          "<b>Vision</b> : un message peut contenir des images (en base64 ou par URL) et des documents PDF, avant le texte de la question.",
          "<b>Thinking</b> : le modèle peut raisonner avant de répondre. Sur les modèles récents, la réflexion est <b>adaptative</b> (<code>thinking: {\"type\": \"adaptive\"}</code>) : le modèle décide quand et combien réfléchir ; la profondeur se règle avec le niveau d’effort." ],
        code: "with client.messages.stream(model=MODEL, max_tokens=64000,\n                            messages=[{\"role\": \"user\", \"content\": \"Rédige le rapport\"}]) as stream:\n    for text in stream.text_stream:\n        print(text, end=\"\", flush=True)" },
      { h: "Fournisseurs tiers", lvl: "essentiel",
        points: [
          "Claude est accessible via des <b>fournisseurs tiers</b> : Amazon Bedrock, Google Vertex AI, Microsoft Foundry.",
          "On utilise alors le client dédié du SDK pour chaque plateforme (par exemple <code>AnthropicVertex</code> pour Vertex AI), qui expose la même interface <code>messages.create</code>.",
          "Points d’attention : authentification propre à la plateforme, format des identifiants de modèle qui peut différer, tarification séparée, et disponibilité des fonctionnalités qui varie selon la plateforme." ] },
      { h: "API par lots : temps réel ou lots", lvl: "essentiel",
        points: [
          "L’<b>API par lots</b> (Message Batches) traite de gros volumes de requêtes de façon asynchrone, à <b>50 % du coût</b>, avec un traitement qui peut prendre jusqu’à 24 heures.",
          "Chaque requête porte un <code>custom_id</code> ; les résultats arrivent dans un ordre quelconque et doivent être associés par cet identifiant.",
          "<b>Temps réel ou lots</b> : l’API synchrone pour tout ce qu’un utilisateur attend ; les lots pour les traitements non urgents (rapports de nuit, évaluations, enrichissement de données)." ] }
    ]
  },
  {
    d: 2, o: ["2.4"],
    title: "Fondamentaux du génie logiciel",
    summary: "REST, JSON, asynchrone, contrôle de version, cycle de développement, revue de code et refactoring.",
    sections: [
      { h: "API REST et JSON", lvl: "essentiel",
        points: [
          "Une <b>API REST</b> expose des ressources par des URL et des verbes HTTP (GET, POST, PUT, DELETE) ; les codes de statut indiquent le résultat (2xx succès, 4xx erreur du client, 5xx erreur du serveur).",
          "<b>JSON</b> est le format d’échange de l’API Claude : requêtes, réponses, schémas d’outils.",
          "Toujours analyser le JSON avec un parseur (<code>json.loads</code>, <code>JSON.parse</code>), jamais par recherche de texte." ] },
      { h: "Programmation asynchrone", lvl: "essentiel",
        p: "La <b>programmation asynchrone</b> permet de lancer plusieurs appels réseau sans bloquer (Python <code>asyncio</code> avec le client asynchrone du SDK, <code>async/await</code> en TypeScript). Elle sert à paralléliser des appels indépendants, exécuter plusieurs outils en même temps ou garder une interface réactive pendant le streaming." },
      { h: "Contrôle de version, SDLC, revue de code et refactoring", lvl: "essentiel",
        points: [
          "<b>Contrôle de version</b> (Git) : branches, commits atomiques, pull requests ; versionner aussi les prompts, schémas et configurations.",
          "<b>SDLC</b> (cycle de développement logiciel) : intégrer l’IA dans le flux existant (tests, intégration continue, revue, déploiement), sans circuit parallèle.",
          "<b>Revue de code</b> : tout code produit avec l’aide de Claude est relu comme celui d’un collègue (logique, sécurité, tests).",
          "<b>Refactoring</b> : améliorer la structure sans changer le comportement ; à petite échelle (une fonction) comme à grande échelle (migration d’une bibliothèque), avec des tests comme filet de sécurité et des étapes réversibles." ] }
    ]
  },
  {
    d: 2, o: ["2.5"],
    title: "Conception d’applications Claude",
    summary: "Comment Claude reçoit les instructions selon l’interface, limites de contenu, schémas, sessions et plugins.",
    sections: [
      { h: "Interprétation des instructions selon l’interface", lvl: "essentiel",
        points: [
          "<b>API et SDK</b> : Claude ne reçoit que ce que vous envoyez (prompt système, messages, outils). Aucune autre consigne n’est ajoutée.",
          "<b>Claude Code</b> : en plus de la demande, il charge les fichiers CLAUDE.md, les réglages, les règles et les skills du projet et de l’utilisateur.",
          "<b>claude.ai et Claude Desktop</b> : l’application ajoute ses propres instructions, et les projets peuvent porter des instructions et des documents de référence.",
          "Conséquence : une consigne qui fonctionne dans claude.ai doit être recopiée explicitement dans votre prompt système pour fonctionner via l’API." ] },
      { h: "Limites de contenu", lvl: "essentiel",
        p: "Les <b>limites de contenu</b> séparent clairement les instructions des données : encadrer les documents, entrées utilisateur et résultats d’outils par des balises (par exemple <code>&lt;document&gt;…&lt;/document&gt;</code>) et indiquer que leur contenu est à traiter comme des données. Cela améliore la compréhension et réduit le risque qu’un texte importé soit pris pour une consigne." },
      { h: "Conception de schémas", lvl: "essentiel",
        points: [
          "La <b>conception de schémas</b> concerne les paramètres d’outils et les sorties structurées : types précis, champs obligatoires seulement s’ils sont toujours disponibles, énumérations pour les valeurs fermées, descriptions de champs explicites.",
          "Un schéma clair réduit les appels invalides et les valeurs inventées." ] },
      { h: "Hygiène des sessions et gestion des plugins", lvl: "essentiel",
        points: [
          "<b>Hygiène des sessions</b> : une tâche par session, repartir d’un contexte propre entre deux tâches indépendantes, ne pas laisser s’accumuler des informations périmées ou sans rapport.",
          "<b>Gestion des plugins</b> : dans Claude Code, un plugin regroupe des commandes, agents, skills, hooks ou serveurs MCP. N’installer que des plugins de confiance, savoir ce qu’ils ajoutent, et les activer ou désactiver selon le projet." ] }
    ]
  },
  {
    d: 2, o: ["2.6"],
    title: "Gestion de configuration",
    summary: "CLAUDE.md, settings.json, versions de modèle, versions de prompts et dépendances de plugins.",
    sections: [
      { h: "CLAUDE.md et settings.json", lvl: "essentiel",
        points: [
          "<b>CLAUDE.md</b> : instructions persistantes de Claude Code, à plusieurs niveaux (utilisateur, projet, sous-dossier). Le fichier du projet est versionné et partagé par l’équipe.",
          "<b>settings.json</b> : réglages de Claude Code (permissions, hooks, variables d’environnement…), avec un niveau utilisateur (<code>~/.claude/settings.json</code>), un niveau projet partagé (<code>.claude/settings.json</code>), un niveau local personnel (<code>.claude/settings.local.json</code>) et des réglages gérés par l’organisation, prioritaires." ] },
      { h: "Épinglage de la version du modèle", lvl: "essentiel",
        p: "L’<b>épinglage de la version du modèle</b> consiste à indiquer un identifiant de modèle précis dans la configuration, et non un modèle « le plus récent » implicite. Le comportement reste ainsi stable ; le passage à un nouveau modèle devient un changement explicite, testé sur le jeu d’évaluation avant déploiement." },
      { h: "Versionnage des prompts et dépendances de plugins", lvl: "essentiel",
        points: [
          "<b>Versionnage des prompts</b> : stocker prompts système, exemples et schémas dans le contrôle de version, les relire en revue, et associer chaque version aux résultats d’évaluation.",
          "<b>Dépendances de plugins</b> : connaître les plugins dont dépend un projet, leurs versions et ce qu’ils apportent ; une mise à jour de plugin est un changement de configuration comme un autre." ] }
    ]
  },

  // ===== D3 — Claude Code =====
  {
    d: 3, o: ["3.1"],
    title: "Utiliser Claude Code",
    summary: "Composants, fonctionnalités et configuration de Claude Code.",
    sections: [
      { h: "Composants : règles, skills, commandes, agents et mémoire", lvl: "essentiel",
        points: [
          "<b>Mémoire</b> : les fichiers CLAUDE.md, chargés automatiquement, selon une hiérarchie utilisateur (<code>~/.claude/CLAUDE.md</code>), projet et sous-dossier.",
          "<b>Règles</b> : fichiers thématiques dans <code>.claude/rules/</code>, qui peuvent ne s’appliquer qu’à certains chemins.",
          "<b>Skills</b> : savoir-faire empaquetés dans <code>.claude/skills/&lt;nom&gt;/SKILL.md</code>, chargés quand ils sont utiles ou invoqués.",
          "<b>Commandes</b> : commandes slash intégrées (<code>/init</code>, <code>/clear</code>, <code>/compact</code>, <code>/memory</code>…) et personnalisées dans <code>.claude/commands/</code>.",
          "<b>Agents</b> : sous-agents spécialisés définis dans <code>.claude/agents/</code>, chacun avec son prompt et ses outils." ] },
      { h: "Sessions, mode headless, mode streaming et auto-mode", lvl: "essentiel",
        points: [
          "<b>Gestion des sessions</b> : reprendre la dernière conversation (<code>claude --continue</code>) ou en choisir une (<code>--resume</code>).",
          "<b>Mode headless</b> : <code>claude -p \"…\"</code> exécute une demande sans interface interactive, pour les scripts et l’intégration continue ; <code>--output-format json</code> donne une sortie exploitable par une machine.",
          "<b>Mode streaming</b> : <code>--output-format stream-json</code> émet les événements au fil de l’eau.",
          "<b>Auto-mode</b> : mode de permissions dans lequel Claude Code approuve lui-même les actions jugées sûres au lieu de tout demander. Son comportement exact évolue : vérifiez-le dans la documentation avant de l’utiliser sur un projet sensible." ] },
      { h: "Initialisation d’un dépôt et settings.json", lvl: "essentiel",
        points: [
          "<b>Initialisation d’un dépôt</b> : <code>/init</code> analyse le projet et génère un premier CLAUDE.md, à relire et compléter.",
          "<b>settings.json</b> configure permissions (<code>allow</code>, <code>ask</code>, <code>deny</code>), hooks et variables, aux niveaux utilisateur, projet, local et organisation." ] }
    ]
  },

  // ===== D4 — Évaluation, tests et débogage =====
  {
    d: 4, o: ["4.1"],
    title: "Débogage et gestion des erreurs",
    summary: "Identifier le type d’erreur, choisir la reprise, analyser les traces et localiser l’origine du problème.",
    sections: [
      { h: "Type d’erreur", lvl: "essentiel",
        points: [
          "<b>400</b> requête invalide (paramètre, format, schéma) : corriger la requête, réessayer à l’identique ne sert à rien.",
          "<b>401 / 403</b> authentification ou permission : vérifier la clé, l’espace de travail, les droits.",
          "<b>404</b> ressource ou modèle introuvable : vérifier l’identifiant.",
          "<b>429</b> limite de débit : attendre (en-tête <code>retry-after</code>) puis réessayer.",
          "<b>500 / 529</b> erreur ou surcharge du service : réessayer plus tard avec un délai croissant.",
          "Une réponse HTTP 200 peut aussi signaler un problème : <code>stop_reason</code> à <code>max_tokens</code> (sortie tronquée) ou <code>refusal</code>." ] },
      { h: "Stratégie de reprise", lvl: "essentiel",
        points: [
          "Réessayer avec un délai exponentiel uniquement les erreurs transitoires (429, 5xx, coupure réseau). Les SDK officiels le font déjà automatiquement, avec un nombre de tentatives limité et configurable.",
          "Ne jamais réessayer en boucle une erreur 400 : il faut changer la requête.",
          "Prévoir un repli : autre modèle, résultat partiel, message clair à l’utilisateur.",
          "Capturer les erreurs par type (classes d’exception du SDK) plutôt qu’avec un seul bloc générique." ] },
      { h: "Analyse de traces et couche d’intégration ou sortie du modèle", lvl: "essentiel",
        points: [
          "<b>Analyse de traces</b> : journaliser pour chaque requête le modèle, les paramètres, les messages envoyés, les appels d’outils, les résultats, le <code>stop_reason</code> et la consommation de tokens. Les <b>modes de défaillance</b> se repèrent en comparant les traces des cas réussis et ratés.",
          "Pour isoler l’origine : <b>couche d’intégration ou sortie du modèle</b> ? Rejouer exactement la même requête : si elle est mal formée, si un résultat d’outil manque ou si le contexte est incomplet, le problème vient de l’intégration ; si la requête est correcte et la réponse fausse, travailler le prompt, les exemples ou le modèle." ] }
    ]
  },

  // ===== D5 — Choix et optimisation du modèle =====
  {
    d: 5, o: ["5.1"],
    title: "Fondamentaux des LLM",
    summary: "Tokens, contexte, échantillonnage, réflexion, effort et techniques de prompting de base.",
    sections: [
      { h: "Tokens, fenêtre de contexte et génération du token suivant", lvl: "essentiel",
        points: [
          "Un LLM traite du texte découpé en <b>tokens</b> (fragments de mots) et génère sa réponse token par token, chaque token prédit à partir de ceux qui précèdent (génération du token suivant).",
          "La <b>fenêtre de contexte</b> est le nombre maximal de tokens (entrée et sortie) qu’une requête peut contenir ; sa taille dépend du modèle. Les tokens d’entrée et de sortie sont facturés.",
          "<code>max_tokens</code> limite la sortie : s’il est atteint, la réponse est coupée (<code>stop_reason: \"max_tokens\"</code>)." ] },
      { h: "Échantillonnage et non-déterminisme", lvl: "essentiel",
        points: [
          "L’<b>échantillonnage</b> choisit chaque token parmi les candidats probables ; des paramètres comme la température influencent ce choix.",
          "Conséquence : <b>non-déterminisme</b>. La même requête peut donner des réponses différentes ; une application robuste valide ses sorties et s’évalue sur plusieurs exécutions.",
          "<i>Complément</i> : sur plusieurs modèles récents, les paramètres d’échantillonnage ne sont plus réglables ; la qualité se pilote alors par le prompt, la réflexion et l’effort." ] },
      { h: "Fast mode, réflexion étendue, réflexion adaptative et niveaux d’effort", lvl: "essentiel",
        points: [
          "<b>Réflexion étendue</b> : le modèle raisonne avant de répondre. Les anciens modèles la configuraient par un budget fixe de tokens de réflexion ; sur les modèles récents, ce budget fixe est remplacé par la <b>réflexion adaptative</b> (<code>thinking: {\"type\": \"adaptive\"}</code>), où le modèle décide quand et combien réfléchir.",
          "<b>Niveaux d’effort</b> : <code>output_config: {\"effort\": …}</code> (<code>low</code>, <code>medium</code>, <code>high</code>, et selon le modèle <code>xhigh</code> et <code>max</code>) règle la profondeur de réflexion et la dépense de tokens. Effort bas pour les tâches simples et rapides, élevé pour le code et les tâches agentiques complexes.",
          "<b>Fast mode</b> : option en aperçu sur certains modèles et plateformes, qui génère la sortie nettement plus vite pour un prix plus élevé.",
          "La disponibilité et les valeurs par défaut varient selon le modèle : consultez la documentation du modèle choisi." ] },
      { h: "Zero-shot, single-shot et multi-shot", lvl: "essentiel",
        points: [
          "<b>Zero-shot</b> : instructions seules, sans exemple.",
          "<b>Single-shot</b> : un exemple d’entrée et de sortie attendue.",
          "<b>Multi-shot</b> (few-shot) : plusieurs exemples variés, utiles pour fixer un format ou montrer des cas limites." ] }
    ]
  },
  {
    d: 5, o: ["5.2"],
    title: "Fondamentaux techniques",
    summary: "SDK, API REST, streaming et websockets : les bases techniques d’une intégration robuste.",
    sections: [
      { h: "SDK et API REST", lvl: "essentiel",
        points: [
          "L’API Claude est une <b>API REST</b> HTTPS ; les <b>SDK</b> officiels (Python, TypeScript, Java, Go, Ruby, C#, PHP) l’encapsulent.",
          "Un SDK apporte : types pour les requêtes et réponses, nouvelles tentatives automatiques sur les erreurs transitoires, délais d’attente configurables, classes d’exception par type d’erreur, aides au streaming et au parsing.",
          "Bonne pratique : utiliser les aides du SDK plutôt que de réécrire ces mécanismes à la main." ] },
      { h: "Streaming et websockets", lvl: "essentiel",
        points: [
          "Le streaming de l’API Claude utilise des <b>server-sent events</b> sur HTTP : un flux à sens unique, du serveur vers le client.",
          "Les <b>websockets</b> ouvrent une connexion persistante et bidirectionnelle ; on les utilise par exemple entre votre serveur et le navigateur pour pousser les tokens reçus et recevoir des actions de l’utilisateur en temps réel.",
          "Architecture courante : le navigateur dialogue avec votre backend (websocket ou SSE), qui appelle l’API Claude en streaming. La clé d’API reste côté serveur." ] },
      { h: "Pratiques d’ingénierie", lvl: "essentiel",
        points: [
          "Configurer délais d’attente et nombre de tentatives selon le cas d’usage.",
          "Gérer la concurrence et les limites de débit (file d’attente, limitation côté client).",
          "Journaliser les identifiants de requête et la consommation pour le suivi et le support." ] }
    ]
  },
  {
    d: 5, o: ["5.3"],
    title: "Choix du modèle et compromis",
    summary: "Opus, Sonnet, Haiku : arbitrer qualité, latence et coût, et anticiper les changements entre versions.",
    sections: [
      { h: "Opus, Sonnet et Haiku", lvl: "essentiel",
        points: [
          "<b>Opus</b> : le plus capable de la gamme courante ; raisonnement complexe, code, tâches agentiques longues.",
          "<b>Sonnet</b> : équilibre entre capacité et rapidité ; usage quotidien et volumes importants.",
          "<b>Haiku</b> : le plus rapide et le moins cher ; tâches simples, volumineuses ou sensibles à la latence (classification, extraction, routage).",
          "La prise en charge de la réflexion adaptative et des niveaux d’effort dépend du modèle et de sa version." ] },
      { h: "Qualité, latence et coût", lvl: "essentiel",
        points: [
          "Mesurer sur des cas réels plutôt que supposer : un modèle plus capable à effort réduit peut égaler un modèle moins capable à effort élevé.",
          "Raisonner en coût par tâche réussie, pas par requête : une requête moins chère qui demande plus de tentatives n’est pas moins chère.",
          "On peut combiner les modèles (un modèle rapide pour trier, un modèle plus capable pour les cas difficiles), au prix d’une complexité accrue." ] },
      { h: "Changements incompatibles entre versions", lvl: "essentiel",
        points: [
          "Une nouvelle version de modèle peut introduire des <b>changements incompatibles</b> : paramètres retirés ou refusés, valeurs par défaut modifiées, comportement différent face au même prompt.",
          "Exemples réels : sur les modèles récents, le budget fixe de réflexion est refusé au profit de la réflexion adaptative, et le préremplissage de la réponse de l’assistant (prefill) n’est plus accepté.",
          "Parade : épingler l’identifiant du modèle, lire le guide de migration, rejouer le jeu d’évaluation avant de basculer." ] }
    ]
  },
  {
    d: 5, o: ["5.4"],
    title: "Gestion des coûts et des tokens",
    summary: "Suivre la consommation, modéliser les coûts et exploiter le prompt caching.",
    sections: [
      { h: "Suivi de la consommation de tokens", lvl: "essentiel",
        points: [
          "Chaque réponse indique sa consommation dans <code>usage</code> : <code>input_tokens</code>, <code>output_tokens</code>, et pour le cache <code>cache_creation_input_tokens</code> et <code>cache_read_input_tokens</code>.",
          "L’endpoint de comptage de tokens (<code>messages.count_tokens</code>) estime une requête avant de l’envoyer.",
          "Agréger ces chiffres par fonctionnalité et par utilisateur pour repérer les dérives." ] },
      { h: "Modélisation des coûts", lvl: "essentiel",
        points: [
          "Coût ≈ tokens d’entrée × prix d’entrée + tokens de sortie × prix de sortie, selon le modèle et la plateforme ; les tokens lus en cache sont facturés beaucoup moins cher, et l’API par lots coûte moitié prix.",
          "Leviers, dans l’ordre : cache et hygiène des entrées (gratuits), puis lots pour l’asynchrone, puis réglage de l’effort et choix du modèle, à valider sur l’évaluation." ] },
      { h: "Prompt caching et points de cache", lvl: "essentiel",
        p: "Le <b>prompt caching</b> réutilise un préfixe de requête identique d’un appel à l’autre : les tokens lus en cache coûtent une fraction du prix normal (jusqu’à 90 % d’économie), l’écriture initiale est un peu plus chère.",
        points: [
          "Un <b>point de cache</b> se pose avec <code>cache_control: {\"type\": \"ephemeral\"}</code> sur un bloc (au plus 4 par requête), ou au niveau de la requête pour un placement automatique. Durée de vie par défaut de 5 minutes, option d’une heure.",
          "Le cache est une correspondance de <b>préfixe</b> dans l’ordre outils → système → messages : tout octet modifié invalide la suite. Placer le contenu stable en premier, le variable après le dernier point de cache.",
          "Vérifier avec <code>cache_read_input_tokens</code> : s’il reste à zéro, un élément change à chaque requête (date, identifiant, outils dans un ordre différent).",
          "En dessous d’une longueur minimale (qui dépend du modèle), le préfixe n’est pas mis en cache." ],
        code: "response = client.messages.create(\n    model=MODEL, max_tokens=16000,\n    system=[{\"type\": \"text\", \"text\": LONG_DOCUMENT,\n             \"cache_control\": {\"type\": \"ephemeral\"}}],\n    messages=[{\"role\": \"user\", \"content\": question}])\nprint(response.usage.cache_read_input_tokens)" }
    ]
  },

  // ===== D6 — Prompt et ingénierie du contexte =====
  {
    d: 6, o: ["6.1"],
    title: "Ingénierie du contexte",
    summary: "Garder le contexte utile, concis et isolé : élagage, compaction, sous-agents.",
    sections: [
      { h: "Dérive du contexte et encombrement du contexte", lvl: "essentiel",
        points: [
          "<b>Encombrement du contexte</b> : des résultats d’outils volumineux, des fichiers entiers ou un long historique remplissent la fenêtre et coûtent cher, souvent pour peu d’information utile.",
          "<b>Dérive du contexte</b> : au fil d’une longue session, des informations anciennes, périmées ou contradictoires s’accumulent ; le modèle perd de vue l’objectif ou s’appuie sur un état qui n’est plus vrai." ] },
      { h: "Élagage des sorties d’outils et compaction", lvl: "essentiel",
        points: [
          "<b>Élagage des sorties d’outils</b> : ne renvoyer que les champs utiles d’un résultat, tronquer les journaux, résumer les documents longs avant de les injecter.",
          "L’API propose l’édition du contexte (bêta) pour effacer automatiquement les anciens résultats d’outils.",
          "<b>Compaction</b> : remplacer l’historique ancien par un résumé. L’API propose une compaction côté serveur (bêta) ; Claude Code dispose de <code>/compact</code>. Bien choisir ce que le résumé doit conserver (décisions, chiffres, état d’avancement)." ] },
      { h: "Isolement du contexte", lvl: "essentiel",
        p: "L’<b>isolement du contexte</b> confie une sous-tâche verbeuse (exploration de code, recherche documentaire) à un sous-agent ou à une étape séparée d’un workflow ; seul un résultat condensé revient dans le contexte principal, qui reste centré sur l’objectif." }
    ]
  },
  {
    d: 6, o: ["6.2"],
    title: "Prompt engineering",
    summary: "Des instructions claires, des exemples, le bon placement et une itération mesurée.",
    sections: [
      { h: "Clarté des instructions et exemples few-shot", lvl: "essentiel",
        points: [
          "<b>Clarté des instructions</b> : dire précisément la tâche, le contexte, le public, le format attendu et les critères de réussite ; expliquer le pourquoi d’une règle aide le modèle à l’appliquer avec discernement.",
          "<b>Exemples few-shot</b> : quelques exemples variés et représentatifs fixent un format ou montrent comment traiter des cas ambigus ; éviter des exemples tous identiques que le modèle copierait trop littéralement." ] },
      { h: "Système ou utilisateur, et placement entre composants", lvl: "essentiel",
        points: [
          "<b>Système ou utilisateur</b> : le prompt système porte le rôle, les règles stables et le contexte permanent ; le message utilisateur porte la demande du moment et les données associées.",
          "Dans une application à plusieurs composants (prompt système, descriptions d’outils, schémas, messages), placer chaque consigne là où elle s’applique : la règle d’usage d’un outil dans sa description, la règle de format dans le schéma de sortie.",
          "Pour un long document, le placer avant la question finale." ] },
      { h: "Contraintes de sortie et raffinement itératif", lvl: "essentiel",
        points: [
          "<b>Contraintes de sortie</b> : longueur, format, langue, structure ; pour un format machine, préférer les sorties structurées à une simple consigne.",
          "<b>Raffinement itératif</b> : changer une chose à la fois, mesurer sur un jeu d’évaluation, garder ce qui améliore le résultat ; ajuster le prompt plutôt que d’empiler des règles contradictoires." ] },
      { h: "Assainissement des entrées", lvl: "essentiel",
        p: "L’<b>assainissement des entrées</b> traite les données externes avant de les placer dans le prompt : supprimer les contenus inutiles, limiter la taille, encadrer l’entrée par des balises et rappeler qu’elle doit être traitée comme une donnée, pas comme une consigne." }
    ]
  },
  {
    d: 6, o: ["6.3"],
    title: "Traitement des sorties",
    summary: "Produire des sorties structurées, les valider et ne pas croire une réponse sur parole.",
    sections: [
      { h: "Sorties structurées", lvl: "essentiel",
        points: [
          "Les <b>sorties structurées</b> contraignent la réponse à un schéma JSON : paramètre <code>output_config.format</code>, ou <code>client.messages.parse()</code> avec un modèle Pydantic en Python, qui renvoie un objet validé.",
          "Pour les outils, <code>strict: true</code> garantit que les paramètres d’appel respectent exactement le schéma (qui doit déclarer <code>additionalProperties: false</code>)." ],
        code: "class Contact(BaseModel):\n    name: str\n    email: str\n\nresponse = client.messages.parse(\n    model=MODEL, max_tokens=16000,\n    messages=[{\"role\": \"user\", \"content\": texte}],\n    output_format=Contact)\ncontact = response.parsed_output" },
      { h: "Validation des réponses et analyse défensive", lvl: "essentiel",
        points: [
          "<b>Validation des réponses</b> : un schéma garantit la forme, pas la vérité ; vérifier aussi la cohérence métier (totaux, dates plausibles, valeurs dans les bornes).",
          "<b>Analyse défensive</b> : vérifier <code>stop_reason</code> avant de lire la réponse (une sortie coupée par <code>max_tokens</code> est incomplète), parcourir les blocs de contenu par type, parser le JSON avec un parseur et gérer l’échec proprement." ] },
      { h: "Scepticisme face à une sortie affirmée avec assurance", lvl: "essentiel",
        p: "Un ton assuré n’est pas une preuve. Le <b>scepticisme</b> consiste à vérifier les faits importants (sources, citations, calculs, références de code), à demander des citations des documents fournis, et à prévoir une vérification humaine ou automatique pour les décisions à enjeu." }
    ]
  },

  // ===== D7 — Sécurité et sûreté =====
  {
    d: 7, o: ["7.1"],
    title: "Sécurité des applications d’IA",
    summary: "Injection de prompt, jailbreak, entrées non fiables, fuites de données et données personnelles.",
    sections: [
      { h: "Injection de prompt et jailbreak", lvl: "essentiel",
        points: [
          "<b>Injection de prompt</b> : un contenu contient des instructions qui tentent de détourner le modèle. Directe (dans le message de l’utilisateur) ou indirecte (dans une page web, un document, un e-mail ou un résultat d’outil lu par l’application).",
          "<b>Jailbreak</b> : tentative de contourner les règles de l’application ou les garde-fous du modèle par des formulations détournées.",
          "Aucune consigne ne protège à 100 % : la défense repose sur l’architecture (séparation données / instructions, droits limités des outils, validation humaine des actions sensibles)." ] },
      { h: "Entrées non fiables et fuites de données", lvl: "essentiel",
        points: [
          "<b>Entrées non fiables</b> : tout contenu externe est une donnée ; l’encadrer, ne pas lui accorder de privilèges et ne pas laisser un texte importé déclencher seul une action sensible.",
          "<b>Fuites de données</b> : ne pas placer dans le contexte plus de données que nécessaire ; filtrer les sorties ; empêcher qu’un outil exfiltre des informations vers une destination non prévue." ] },
      { h: "Données personnelles, authentification et autorisation", lvl: "essentiel",
        points: [
          "<b>Données personnelles</b> (PII) : minimiser, masquer ou pseudonymiser avant l’envoi, respecter la durée de conservation et la réglementation applicable.",
          "<b>Authentification et autorisation</b> : l’application vérifie l’identité de l’utilisateur et ses droits ; un outil appelé par le modèle applique le contrôle d’accès côté serveur, jamais sur la seule parole du modèle.",
          "Objectifs : confidentialité, vie privée et intégrité des données." ] }
    ]
  },
  {
    d: 7, o: ["7.2"],
    title: "Garde-fous et déploiement sûr",
    summary: "Politique de contenu, défense en couches et sécurité dès la conception.",
    sections: [
      { h: "Politique de contenu", lvl: "essentiel",
        p: "Une <b>politique de contenu</b> définit ce que l’application doit accepter, refuser ou rediriger, en accord avec les conditions d’utilisation d’Anthropic. Elle se traduit dans le prompt système, dans les contrôles en entrée et en sortie, et dans les procédures d’escalade." },
      { h: "Superposition de garde-fous", lvl: "essentiel",
        points: [
          "La <b>superposition de garde-fous</b> combine plusieurs couches indépendantes : contrôle des entrées, instructions du modèle, permissions des outils, hooks, validation des sorties, revue humaine des actions sensibles, surveillance.",
          "Une couche peut échouer : la sécurité vient de leur combinaison." ] },
      { h: "Sécurité dès la conception et moindre privilège", lvl: "essentiel",
        points: [
          "<b>Sécurité dès la conception</b> : penser vie privée, gestion des identités et des accès dès l’architecture, pas après coup.",
          "<b>Moindre privilège</b> : chaque agent, outil et clé n’a que les droits nécessaires (lecture seule si possible, périmètre limité, comptes de service dédiés)." ] }
    ]
  },
  {
    d: 7, o: ["7.3"],
    title: "Hooks Claude",
    summary: "Des contrôles exécutés à coup sûr pour bloquer les actions destructrices.",
    sections: [
      { h: "Hooks et garde-fous", lvl: "essentiel",
        p: "Les <b>hooks</b> de Claude Code et de l’Agent SDK exécutent votre code à des moments précis, par exemple avant l’exécution d’un outil (<code>PreToolUse</code>) ou après (<code>PostToolUse</code>). Ce sont des <b>garde-fous</b> déterministes : ils s’exécutent à chaque fois, contrairement à une consigne." },
      { h: "Bloquer les actions destructrices", lvl: "essentiel",
        points: [
          "Exemples d’<b>actions destructrices</b> à intercepter : suppression récursive de fichiers, réécriture forcée de l’historique Git, suppression de volumes ou de tables, déploiement en production.",
          "Un hook <code>PreToolUse</code> inspecte la commande et bloque l’appel s’il correspond à une règle interdite ; dans Claude Code, un code de sortie 2 bloque l’action et renvoie le message d’erreur au modèle.",
          "Les hooks s’exécutent avec vos droits : les relire comme du code et les versionner." ],
        code: "{\n  \"hooks\": {\n    \"PreToolUse\": [{\n      \"matcher\": \"Bash\",\n      \"hooks\": [{ \"type\": \"command\", \"command\": \"./scripts/bloquer-commandes-dangereuses.sh\" }]\n    }]\n  }\n}" }
    ]
  },
  {
    d: 7, o: ["7.4"],
    title: "Identité, secrets et gestion des clés",
    summary: "Protéger les clés d’API et contrôler qui accède à quoi, en développement comme en production.",
    sections: [
      { h: "Secrets et clés d’API", lvl: "essentiel",
        points: [
          "<b>Secrets</b> et <b>clés d’API</b> : jamais dans le code, les prompts ou le dépôt ; dans des variables d’environnement ou un gestionnaire de secrets.",
          "Des clés distinctes par environnement (développement, production) et par application, pour limiter l’impact d’une fuite.",
          "Une clé exposée est révoquée et remplacée immédiatement.",
          "<i>Complément</i> : la fédération d’identité de charge de travail (Workload Identity Federation) permet à un service d’obtenir des jetons temporaires à partir de son identité, sans clé d’API longue durée." ] },
      { h: "Validation de l’identité et approbation des accès", lvl: "essentiel",
        points: [
          "<b>Validation de l’identité</b> : authentifier utilisateurs et services avant tout accès.",
          "<b>Approbation des accès</b> et vérification des niveaux : un accès sensible est demandé, approuvé et limité au niveau nécessaire (rôle, espace de travail)." ] },
      { h: "Surveillance des accès", lvl: "essentiel",
        p: "La <b>surveillance des accès</b> journalise qui utilise quelle clé, quand et pour quoi, afin de détecter un usage anormal et de pouvoir révoquer rapidement." }
    ]
  },

  // ===== D8 — Outils et MCP =====
  {
    d: 8, o: ["8.1"],
    title: "Implémentation d’outils",
    summary: "Définir, décrire, exécuter et sécuriser les outils d’une application Claude.",
    sections: [
      { h: "Tool use et descriptions d’outils", lvl: "essentiel",
        points: [
          "<b>Tool use</b> (appel de fonctions) : on déclare des outils (nom, description, schéma JSON) ; le modèle renvoie un bloc <code>tool_use</code> avec des paramètres ; votre code exécute la fonction et renvoie un bloc <code>tool_result</code> lié à l’identifiant de l’appel.",
          "<b>Descriptions d’outils</b> : le modèle choisit un outil d’après sa description ; préciser ce qu’il fait, ses entrées, ses sorties, ses limites et quand l’utiliser plutôt qu’un outil voisin.",
          "Gestion des erreurs : renvoyer un <code>tool_result</code> avec <code>is_error: true</code> et un message explicite, plutôt que d’omettre le résultat." ] },
      { h: "Outils côté client ou côté serveur", lvl: "essentiel",
        points: [
          "<b>Outils côté client</b> : définis par vous et exécutés par votre code (accès à vos systèmes, bases, API internes).",
          "<b>Outils côté serveur</b> : fournis et exécutés par Anthropic (par exemple recherche web, lecture web, exécution de code) ; il suffit de les déclarer, les résultats arrivent dans la réponse.",
          "Dispatch par le harnais : le harnais agentique reçoit les appels, les route vers la bonne fonction, exécute les appels parallèles et renvoie tous les résultats dans un seul message." ] },
      { h: "Modèles d’approbation et jeu d’outils", lvl: "essentiel",
        points: [
          "<b>Modèles d’approbation</b> : les outils sans risque s’exécutent automatiquement ; les outils sensibles (paiement, suppression, envoi de message) exigent une validation humaine avant exécution.",
          "<b>Jeu d’outils</b> : peu d’outils, bien distincts et bien nommés ; regrouper les opérations proches, éviter les doublons ; un agent avec trop d’outils choisit moins bien." ] }
    ]
  },
  {
    d: 8, o: ["8.2"],
    title: "Développement de serveurs MCP",
    summary: "Écrire, connecter et déployer un serveur Model Context Protocol.",
    sections: [
      { h: "Serveur MCP : ressources, outils et prompts", lvl: "essentiel",
        points: [
          "Le Model Context Protocol (MCP) est un protocole ouvert qui connecte des applications d’IA à des outils et des données. Un <b>serveur MCP</b> expose des capacités ; un client (Claude Code, Claude Desktop, votre application) s’y connecte.",
          "Les trois primitives : <b>ressources, outils et prompts</b>. Les outils sont des actions que le modèle peut appeler ; les ressources sont des données que l’application peut lire et ajouter au contexte ; les prompts sont des modèles réutilisables proposés à l’utilisateur.",
          "On écrit un serveur avec les SDK MCP officiels (par exemple Python ou TypeScript)." ] },
      { h: "Stdio et autres modes de communication", lvl: "essentiel",
        points: [
          "<b>Stdio</b> : le client lance le serveur comme processus local et communique par l’entrée et la sortie standard ; simple et adapté aux outils locaux.",
          "Transport HTTP (connexion réseau) : le serveur tourne à distance et sert plusieurs clients ; il faut alors gérer l’authentification et la sécurité réseau.",
          "<b>Client ou serveur</b> : le client découvre et appelle les capacités ; le serveur les implémente et les expose." ] },
      { h: "Intégration avec les applications Claude", lvl: "essentiel",
        points: [
          "Claude Code : <code>claude mcp add</code>, avec une portée locale, projet (<code>.mcp.json</code> partagé) ou utilisateur.",
          "API : un connecteur MCP (bêta) permet de déclarer un serveur MCP distant directement dans une requête.",
          "Un serveur MCP rend une intégration réutilisable par plusieurs applications et maintenable indépendamment de chacune." ] }
    ]
  },
  {
    d: 8, o: ["8.3"],
    title: "Personnalisation agentique",
    summary: "Outils intégrés, outils sur mesure, Skills ou MCP : choisir la bonne extension.",
    sections: [
      { h: "Outils intégrés et outils sur mesure", lvl: "essentiel",
        points: [
          "<b>Outils intégrés</b> : fournis par la plateforme (fichiers, Bash, recherche dans Claude Code et l’Agent SDK ; recherche web ou exécution de code côté serveur dans l’API). Aucun développement, comportement standard.",
          "<b>Outils sur mesure</b> : fonctions spécifiques à votre application (consulter un stock, créer un ticket), définies et exécutées par votre code. Contrôle total, mais à maintenir dans chaque application." ] },
      { h: "Skills et MCP", lvl: "essentiel",
        points: [
          "<b>Skills</b> : savoir-faire empaquetés (instructions, scripts, ressources) que Claude charge seulement quand ils sont utiles. Idéaux pour une procédure ou une expertise réutilisable sans écrire de nouvel outil.",
          "<b>MCP</b> : intégration standardisée avec un système externe, exposée par un serveur que plusieurs applications ou clients peuvent partager et maintenir indépendamment." ] },
      { h: "Compromis", lvl: "essentiel",
        points: [
          "Besoin couvert par un outil intégré : l’utiliser, ne rien développer.",
          "Action propre à une seule application : outil sur mesure.",
          "Connaissance ou procédure à transmettre, éventuellement avec des scripts : Skill.",
          "Système externe à partager entre plusieurs applications ou équipes : serveur MCP.",
          "Les <b>compromis</b> portent sur l’effort de développement, la réutilisabilité, la maintenance, la sécurité et le coût en contexte." ] }
    ]
  }
];
