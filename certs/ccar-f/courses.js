// Cours : un module par objectif (task statement) du guide CCAR-F.
// d = id du domaine, o = objectifs traités. lvl = « essentiel », « avancé » ou « complément » ; extra: true = hors programme.
// Les textes peuvent contenir <b>, <i> et <code> ; code = bloc de code affiché tel quel.
// blocks = contenu ordonné de la section (paragraphes p, listes points, code), dans l’ordre de lecture.
const COURSES = [
  {
    d: 1,
    o: ["1.1"],
    title: "Boucles agentiques",
    summary: "Le cycle requête → outil → résultat → requête, piloté par stop_reason, avec un exemple complet et la trace des messages.",
    sections: [
      {
        h: "Cycle de la boucle agentique",
        lvl: "essentiel",
        p: ["Une boucle agentique répète quatre temps : <b>envoyer la requête</b> à Claude avec la liste des outils, <b>inspecter <code>stop_reason</code></b>, <b>exécuter les outils demandés</b>, puis <b>renvoyer leurs résultats</b> pour l’itération suivante. Les deux valeurs à connaître sont <code>tool_use</code> et <code>end_turn</code> : <code>\"tool_use\"</code> signifie que le modèle attend le résultat d’un ou plusieurs outils, <code>\"end_turn\"</code> qu’il a terminé sa réponse.", "Point essentiel : <b>Claude n’exécute jamais lui-même un outil</b>. Il produit une <i>demande</i> d’appel (un bloc <code>tool_use</code> avec un nom et des paramètres conformes au schéma) ; c’est votre code qui l’exécute, puis lui renvoie le résultat. C’est ce qui permet de contrôler, journaliser ou bloquer chaque action.", "Le code ci-dessous est un exemple complet et exécutable (SDK Python <code>anthropic</code>) avec un outil de recherche de commande. Seuls l’identifiant du modèle et la « base » <code>COMMANDES</code> sont à remplacer par les vôtres."],
        points: ["<b>1. Envoyer</b> : <code>client.messages.create(model, max_tokens, tools, messages)</code>. La liste <code>tools</code> décrit chaque outil ; <code>messages</code> contient tout l’historique, car l’API ne garde aucun état entre deux appels.", "<b>2. Inspecter</b> <code>r.stop_reason</code> : s’il vaut <code>\"tool_use\"</code>, la réponse contient un ou plusieurs blocs <code>tool_use</code> ; sinon (<code>\"end_turn\"</code>), c’est la réponse finale.", "<b>3. Exécuter</b> chaque bloc <code>tool_use</code> : lire <code>b.name</code> et <code>b.input</code>, appeler votre fonction, produire un bloc <code>tool_result</code> qui reprend <code>b.id</code> dans <code>tool_use_id</code>.", "<b>4. Renvoyer</b> : ajouter d’abord la réponse de l’assistant telle quelle à l’historique, puis <b>un seul</b> message <code>user</code> contenant tous les blocs <code>tool_result</code> de ce tour, et recommencer."],
        code: "import json\nimport anthropic\n\nclient = anthropic.Anthropic()          # lit la clé dans ANTHROPIC_API_KEY\nMODEL = \"<identifiant du modèle>\"\n\n# 1. Les outils : nom, description (lue par le modèle), schéma des paramètres\nTOOLS = [{\n    \"name\": \"lookup_order\",\n    \"description\": \"Recherche une commande par numéro (4 à 8 chiffres). \"\n                   \"Renvoie le statut et la date de livraison prévue.\",\n    \"input_schema\": {\n        \"type\": \"object\",\n        \"properties\": {\n            \"order_id\": {\"type\": \"string\", \"description\": \"Numéro de commande, ex. 7781\"}\n        },\n        \"required\": [\"order_id\"],\n    },\n}]\n\nCOMMANDES = {\"7781\": {\"statut\": \"expédiée\", \"livraison\": \"2026-03-14\"}}\n\n# 2. L’exécution : votre code, jamais le modèle, lance réellement l’outil\ndef executer(bloc):\n    \"\"\"Reçoit un bloc tool_use, renvoie le bloc tool_result correspondant.\"\"\"\n    if bloc.name == \"lookup_order\":\n        commande = COMMANDES.get(bloc.input[\"order_id\"])\n        contenu = json.dumps(commande, ensure_ascii=False) if commande else \"Aucune commande avec ce numéro.\"\n        return {\"type\": \"tool_result\", \"tool_use_id\": bloc.id, \"content\": contenu}\n    return {\"type\": \"tool_result\", \"tool_use_id\": bloc.id,\n            \"is_error\": True, \"content\": f\"Outil inconnu : {bloc.name}\"}\n\n# 3. La boucle\ndef agent(demande, max_iterations=20):\n    messages = [{\"role\": \"user\", \"content\": demande}]\n    for _ in range(max_iterations):            # garde-fou, pas le mécanisme d’arrêt\n        r = client.messages.create(model=MODEL, max_tokens=2048,\n                                   tools=TOOLS, messages=messages)\n        messages.append({\"role\": \"assistant\", \"content\": r.content})\n        if r.stop_reason != \"tool_use\":        # \"end_turn\" : réponse finale\n            return \"\".join(b.text for b in r.content if b.type == \"text\")\n        resultats = [executer(b) for b in r.content if b.type == \"tool_use\"]\n        messages.append({\"role\": \"user\", \"content\": resultats})   # un seul message\n    raise RuntimeError(\"Plafond d’itérations atteint : comportement à analyser\")\n\nprint(agent(\"Où en est ma commande 7781 ?\"))"
      },
      {
        h: "Exemple pas à pas : ce qui circule dans messages",
        lvl: "essentiel",
        p: ["Voici le contenu de <code>messages</code> pour la question « Où en est ma commande 7781 ? ». Deux allers-retours suffisent : un pour l’appel d’outil, un pour la réponse finale.", "Si Claude demande plusieurs outils dans la même réponse (par exemple <code>get_customer</code> et <code>lookup_order</code>), votre code les exécute tous et renvoie <b>tous les <code>tool_result</code> dans le même message</b>, chacun avec son <code>tool_use_id</code>. Une erreur d’outil se signale par un <code>tool_result</code> avec <code>\"is_error\": true</code> et un message explicite : le modèle peut alors corriger son appel ou changer d’approche."],
        points: ["La réponse 1 contient <b>à la fois du texte et un appel d’outil</b> : c’est pourquoi la présence de texte ne signifie pas que la tâche est terminée.", "Le <code>tool_use_id</code> du tour 2 doit reprendre exactement l’<code>id</code> du bloc <code>tool_use</code> : c’est ainsi que le modèle relie chaque résultat à sa demande.", "On ajoute la réponse de l’assistant à l’historique <b>avant</b> les résultats : l’ordre des messages doit rester assistant (appel) puis user (résultat)."],
        code: "# Tour 1 : la demande\n{\"role\": \"user\", \"content\": \"Où en est ma commande 7781 ?\"}\n\n# Réponse 1 : stop_reason = \"tool_use\"\n{\"role\": \"assistant\", \"content\": [\n  {\"type\": \"text\", \"text\": \"Je consulte votre commande.\"},\n  {\"type\": \"tool_use\", \"id\": \"toolu_01\", \"name\": \"lookup_order\",\n   \"input\": {\"order_id\": \"7781\"}}\n]}\n\n# Tour 2 : votre code renvoie le résultat, rattaché à l’id de l’appel\n{\"role\": \"user\", \"content\": [\n  {\"type\": \"tool_result\", \"tool_use_id\": \"toolu_01\",\n   \"content\": \"{\\\"statut\\\": \\\"expédiée\\\", \\\"livraison\\\": \\\"2026-03-14\\\"}\"}\n]}\n\n# Réponse 2 : stop_reason = \"end_turn\"\n{\"role\": \"assistant\", \"content\": [\n  {\"type\": \"text\", \"text\": \"Votre commande 7781 a été expédiée, livraison prévue le 14 mars.\"}\n]}"
      },
      {
        h: "Résultats d’outils dans l’historique",
        lvl: "essentiel",
        points: ["Chaque résultat est renvoyé comme bloc <code>tool_result</code> rattaché au <code>tool_use_id</code> de l’appel, dans un message <code>user</code> ajouté à l’historique.", "C’est ce qui permet au modèle de <b>raisonner sur l’action suivante</b> à partir d’informations nouvelles.", "Oublier d’ajouter un résultat ou repartir d’un historique tronqué casse le raisonnement : le modèle redemande l’outil ou invente."]
      },
      {
        h: "Décision pilotée par le modèle",
        lvl: "essentiel",
        p: "Dans une boucle agentique, c’est <b>Claude qui choisit</b> l’outil suivant selon le contexte. C’est la différence avec un arbre de décision ou une séquence d’outils préconfigurée, où le code impose l’ordre. Les deux approches coexistent : on laisse le modèle décider, et on n’impose un ordre par le code que là où une règle métier l’exige (voir l’objectif 1.4)."
      },
      {
        h: "Anti-patterns de termination",
        lvl: "essentiel",
        points: ["Analyser le <b>texte</b> de la réponse (« j’ai fini », « terminé ») pour décider d’arrêter : fragile, le signal fiable est <code>stop_reason</code>.", "Utiliser un <b>plafond arbitraire d’itérations</b> comme mécanisme d’arrêt principal : il coupe des tâches légitimes ; un plafond n’est qu’un garde-fou de sécurité, dont l’atteinte doit être traitée comme une anomalie.", "Considérer la <b>présence de texte</b> de l’assistant comme signe de fin : une réponse peut contenir du texte <i>et</i> un appel d’outil (voir l’exemple pas à pas).", "<i>Complément</i> : <code>stop_reason</code> peut prendre d’autres valeurs, comme <code>max_tokens</code> quand la réponse a été coupée par la limite de longueur. En production, traitez ce cas explicitement (augmenter <code>max_tokens</code> ou relancer) au lieu de le confondre avec une réponse terminée."]
      }
    ]
  },
  {
    d: 1,
    o: ["1.2"],
    title: "Orchestration coordinateur / sous-agents",
    summary: "Architecture en étoile, contexte isolé des sous-agents, rôle du coordinateur et raffinement itératif.",
    sections: [
      {
        h: "Architecture hub-and-spoke",
        lvl: "essentiel",
        points: ["Un <b>coordinateur</b> au centre gère toute la communication entre sous-agents, la gestion des erreurs et le routage de l’information.", "Les sous-agents ne se parlent pas directement : tout passe par le coordinateur, pour l’<b>observabilité</b>, une gestion d’erreurs homogène et un flux d’information maîtrisé.", "<b>Contexte isolé des sous-agents</b> : un sous-agent n’hérite pas automatiquement de l’historique du coordinateur ; il ne sait que ce qu’on lui transmet."]
      },
      {
        h: "Rôle du coordinateur",
        lvl: "essentiel",
        points: ["Décomposer la demande, déléguer, agréger les résultats.", "<b>Sélection dynamique des sous-agents</b> : analyser la demande et n’invoquer que les sous-agents utiles, au lieu de faire passer chaque requête par tout le pipeline.", "Répartir le périmètre pour limiter les doublons : sous-thèmes distincts ou types de sources distincts par sous-agent."]
      },
      {
        h: "Décomposition trop étroite",
        lvl: "essentiel",
        p: "Si le coordinateur découpe un sujet large en sous-tâches trop étroites, chaque sous-agent fait bien son travail mais le rapport final a des <b>trous</b>. Exemple : un sujet sur « les industries créatives » découpé uniquement en arts visuels oublie la musique ou l’écriture. Le diagnostic se fait dans les journaux du coordinateur : la cause est la décomposition, pas les sous-agents en aval."
      },
      {
        h: "Boucles de raffinement itératif",
        lvl: "avancé",
        p: "Le coordinateur évalue la synthèse, repère les lacunes, relance les sous-agents de recherche et d’analyse avec des requêtes ciblées, puis relance la synthèse, jusqu’à une couverture suffisante. C’est la réponse architecturale aux trous de couverture."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Le coordinateur est un chef de projet : il découpe, distribue, vérifie et assemble. Les sous-agents sont des spécialistes qui ne voient que leur dossier. Toute communication passe par le chef, ce qui permet de tracer qui a demandé quoi et de gérer les échecs au même endroit."
          },
          {
            p: "<i>Exemple :</i> pour « l’IA dans les industries créatives », une bonne décomposition couvre arts visuels, musique, écriture, cinéma, jeu vidéo et aspects juridiques (droit d’auteur). Si le coordinateur ne crée que trois sous-tâches sur les arts visuels, le rapport sera propre mais incomplet, et aucun sous-agent n’aura commis d’erreur."
          },
          {
            p: "<i>Piège classique :</i> chercher la cause d’un rapport incomplet du côté de la synthèse ou de la recherche web, alors que les journaux du coordinateur montrent que la décomposition était trop étroite."
          }
        ]
      }
    ]
  },
  {
    d: 1,
    o: ["1.3"],
    title: "Invocation des sous-agents et passage de contexte",
    summary: "Outil Task, allowedTools, AgentDefinition, contexte explicite, lancement en parallèle et sessions dérivées.",
    sections: [
      {
        h: "Outil Task et allowedTools",
        lvl: "essentiel",
        points: ["Dans le Claude Agent SDK, un coordinateur lance un sous-agent par l’<b>outil Task</b>.", "Pour qu’il puisse le faire, sa configuration <code>allowedTools</code> doit contenir <code>\"Task\"</code> : sans cela, il ne peut invoquer aucun sous-agent.", "Chaque type de sous-agent est décrit par une <b>AgentDefinition</b> : description (quand l’utiliser), prompt système et restrictions d’outils."]
      },
      {
        h: "Passage explicite du contexte",
        lvl: "essentiel",
        points: ["Un sous-agent n’hérite pas du contexte parent et ne partage pas de mémoire entre invocations : tout ce dont il a besoin doit être <b>dans son prompt</b>.", "Exemple : le sous-agent de synthèse reçoit directement les résultats complets de la recherche web et de l’analyse de documents.", "Utiliser un <b>format structuré</b> qui sépare le contenu des métadonnées (URL source, nom du document, numéro de page) pour préserver l’attribution."]
      },
      {
        h: "Sous-agents en parallèle",
        lvl: "essentiel",
        p: "Pour lancer plusieurs sous-agents en parallèle, le coordinateur émet <b>plusieurs appels de l’outil Task dans une seule réponse</b>, au lieu d’un appel par tour. Ses instructions fixent les <b>objectifs et critères de qualité</b> plutôt que des procédures pas à pas, pour laisser chaque sous-agent s’adapter à ce qu’il découvre."
      },
      {
        h: "Sessions dérivées (fork)",
        lvl: "avancé",
        p: "La gestion de sessions par dérivation (<i>fork</i>) permet de partir d’une même analyse de base et d’explorer des approches divergentes dans des branches indépendantes (voir aussi <code>fork_session</code>, objectif 1.7)."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Un sous-agent démarre « amnésique » : il ne connaît que son prompt. Le coordinateur doit donc lui transmettre explicitement les résultats utiles, idéalement dans un format structuré qui garde les sources. Pour paralléliser, le coordinateur émet plusieurs appels de l’outil Task dans la même réponse."
          },
          {
            p: "<i>Exemple de contexte transmis au sous-agent de synthèse :</i>"
          },
          {
            code: "{\n  \"objectif\": \"Synthèse de 800 mots sur l’adoption des véhicules électriques en Europe\",\n  \"resultats\": [\n    {\"affirmation\": \"Les ventes ont progressé de 12 % en 2025\",\n     \"extrait\": \"…sales grew 12% year over year…\",\n     \"source\": \"https://exemple.org/rapport-2025\", \"date\": \"2026-01-15\"}\n  ]\n}"
          },
          {
            p: "<i>Piège classique :</i> écrire au sous-agent « utilise ce qu’on a trouvé plus tôt ». Il ne voit pas la conversation du coordinateur et ne sait pas de quoi on parle."
          },
          {
            p: "<b>Note sur le nommage :</b> Le guide d’examen parle de l’outil <b>Task</b>. Dans certaines versions récentes de Claude Code et du SDK, l’outil de délégation aux sous-agents porte un autre nom (par exemple <code>Agent</code>). Pour l’examen, retenez la terminologie du guide."
          }
        ]
      }
    ]
  },
  {
    d: 1,
    o: ["1.4"],
    title: "Workflows multi-étapes : contrôle et transmission",
    summary: "Imposer l’ordre des étapes par le code quand la conformité doit être garantie, et transmettre proprement à un humain.",
    sections: [
      {
        h: "Contrôle programmatique ou guidage par prompt",
        lvl: "essentiel",
        points: ["<b>Guidage par prompt</b> : « vérifie toujours l’identité avant un remboursement ». Le modèle le respecte la plupart du temps, mais avec un <b>taux d’échec non nul</b>.", "<b>Contrôle programmatique</b> : hooks et <b>prérequis bloquants</b> qui empêchent techniquement un appel d’outil tant qu’une étape n’est pas faite.", "Règle : quand une conformité <b>déterministe</b> est exigée (opération financière, identité), le prompt seul ne suffit pas.", "Exemple type : bloquer <code>process_refund</code> (et <code>lookup_order</code> si besoin) tant que <code>get_customer</code> n’a pas renvoyé un identifiant client vérifié."]
      },
      {
        h: "Demandes multi-sujets",
        lvl: "essentiel",
        p: "Un client écrit pour un remboursement <i>et</i> un changement d’adresse <i>et</i> une question de facturation. L’agent décompose la demande en éléments distincts, instruit chacun (éventuellement en parallèle, avec un contexte partagé), puis <b>synthétise une réponse unique</b>."
      },
      {
        h: "Transmission structurée",
        lvl: "essentiel",
        points: ["Lors d’une escalade en cours de traitement, l’agent humain <b>n’a pas accès à la conversation</b>.", "Le résumé de transmission doit donc être autoportant : identifiant client, cause racine analysée, montant concerné, action recommandée.", "Un résumé vague (« client mécontent, à rappeler ») oblige l’humain à tout reprendre."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Un prompt est une consigne, un contrôle programmatique est une serrure. Si une erreur d’ordre peut coûter de l’argent ou violer une obligation, il faut une serrure : le code refuse d’exécuter l’étape tant que la précédente n’est pas validée."
          },
          {
            p: "<i>Exemple (pseudo-code) :</i>"
          },
          {
            code: "def avant_appel_outil(nom, args, etat):\n    if nom in (\"process_refund\", \"lookup_order\") and not etat.get(\"client_verifie\"):\n        return refuser(\"Vérifiez d’abord le client avec get_customer.\")\n    return autoriser()"
          },
          {
            p: "<i>Exemple de résumé de transmission vers un humain :</i> « Client C-1029 (vérifié) — Double prélèvement sur la commande 8841 (cause : deux tentatives de paiement acceptées) — Montant : 59,90 € — Action recommandée : rembourser un des deux prélèvements. »"
          },
          {
            p: "<i>Piège classique :</i> ajouter des majuscules ou des exemples au prompt pour « renforcer » une règle financière : cela réduit les oublis sans jamais les supprimer."
          }
        ]
      }
    ]
  },
  {
    d: 1,
    o: ["1.5"],
    title: "Hooks de l’Agent SDK",
    summary: "Intercepter les résultats et les appels d’outils pour normaliser les données et garantir les règles métier.",
    sections: [
      {
        h: "Hook PostToolUse : normaliser les résultats",
        lvl: "essentiel",
        p: "Un hook <code>PostToolUse</code> intercepte le résultat d’un outil <b>avant que le modèle ne le traite</b>. Usage typique : la <b>normalisation des formats</b> hétérogènes renvoyés par différents outils MCP (timestamps Unix, dates ISO 8601, codes de statut numériques) vers un format unique, pour que le modèle ne raisonne pas sur des représentations incohérentes."
      },
      {
        h: "Interception des appels sortants",
        lvl: "essentiel",
        points: ["Un hook peut intercepter un appel d’outil <b>sortant</b>, avant son exécution, pour appliquer des <b>règles de conformité</b>.", "Exemple : bloquer tout remboursement de plus de 500 $ et opérer une <b>redirection vers l’escalade</b> humaine.", "Le modèle reçoit alors l’information que l’action est refusée et pourquoi, et peut poursuivre par le bon workflow."]
      },
      {
        h: "Garanties déterministes",
        lvl: "essentiel",
        p: "Différence clé : un hook donne des <b>garanties déterministes</b> (il s’exécute à chaque fois), une consigne dans le prompt ne donne qu’une conformité <b>probabiliste</b>. Quand une règle métier exige une conformité garantie, on choisit le hook."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Les hooks sont des points d’ancrage où votre code s’exécute automatiquement : <i>avant</i> un appel d’outil (pour l’autoriser ou le bloquer) ou <i>après</i> (pour transformer le résultat avant que Claude le lise). Ils servent à la conformité et à la normalisation, pas au style des réponses."
          },
          {
            p: "*Exemple de normalisation (avant / après un hook <code>PostToolUse</code>) :*"
          },
          {
            points: ["<b>Service commandes</b> — Valeur brute : <code>1709251200</code> ; Après normalisation : <code>2024-03-01</code>", "<b>Service livraisons</b> — Valeur brute : <code>01/03/2024</code> ; Après normalisation : <code>2024-03-01</code>", "<b>Service retours</b> — Valeur brute : <code>{\"status\": 3}</code> ; Après normalisation : <code>{\"status\": \"remboursé\"}</code>"]
          },
          {
            p: "<i>Exemple de conformité :</i> un hook placé avant <code>process_refund</code> lit le montant ; au-delà de 500 $, il bloque l’appel et renvoie au modèle « Montant supérieur au plafond : utiliser escalate_to_human »."
          },
          {
            p: "<i>Piège classique :</i> confondre les deux moments. Pour <i>empêcher</i> une action, il faut agir avant l’appel ; <code>PostToolUse</code> arrive trop tard."
          }
        ]
      }
    ]
  },
  {
    d: 1,
    o: ["1.6"],
    title: "Stratégies de décomposition",
    summary: "Pipelines séquentiels fixes ou décomposition adaptative : choisir selon la nature de la tâche.",
    sections: [
      {
        h: "Pipelines séquentiels (prompt chaining)",
        lvl: "essentiel",
        points: ["Suite d’étapes fixes et prévisibles, chacune avec un prompt ciblé.", "Adapté aux revues à plusieurs aspects connus d’avance.", "Exemple : analyser chaque fichier séparément, puis faire une passe d’intégration entre fichiers."]
      },
      {
        h: "Décomposition dynamique adaptative",
        lvl: "essentiel",
        points: ["Les sous-tâches sont générées selon ce qui est découvert à chaque étape : des <b>plans d’investigation adaptatifs</b>.", "Adapté aux tâches ouvertes : « ajouter des tests complets à une base de code legacy ».", "Démarche : cartographier la structure, repérer les zones à fort impact, construire un plan priorisé qui s’ajuste aux dépendances découvertes."]
      },
      {
        h: "Passes par fichier et passe d’intégration",
        lvl: "essentiel",
        p: "Une revue de nombreux fichiers en une seule passe souffre de <b>dilution de l’attention</b> : analyses inégales, bugs manqués, avis contradictoires. Le remède est structurel : des <b>passes par fichier</b> pour les problèmes locaux, puis une <b>passe d’intégration</b> séparée pour les flux de données entre fichiers."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Deux familles de découpage : le pipeline fixe (on sait d’avance quelles étapes faire) et le plan adaptatif (on découvre les étapes en avançant). Le choix dépend de la prévisibilité de la tâche, pas de sa taille."
          },
          {
            p: "<i>Exemples :</i>"
          },
          {
            points: ["<b>Revoir chaque PR selon sécurité, performance, tests</b> : Pipeline fixe : une passe par aspect, ou une passe par fichier puis une passe d’intégration", "<b>« Ajoute des tests à ce code legacy »</b> : Plan adaptatif : cartographier, prioriser les zones critiques, réviser le plan quand on découvre une dépendance", "<b>« Pourquoi les ventes ont-elles baissé en mars ? »</b> : Plan adaptatif : chaque découverte oriente la recherche suivante"]
          },
          {
            p: "<i>Piège classique :</i> analyser 25 fichiers en une seule passe. L’attention se dilue : certains fichiers sont bien relus, d’autres survolés, et les avis se contredisent."
          }
        ]
      }
    ]
  },
  {
    d: 1,
    o: ["1.7"],
    title: "Sessions : reprise et dérivation",
    summary: "Reprendre une session nommée, la dériver avec fork_session, ou repartir de zéro avec un résumé structuré.",
    sections: [
      {
        h: "Reprise d’une session nommée",
        lvl: "essentiel",
        points: ["<code>--resume &lt;nom-de-session&gt;</code> reprend une conversation précise, utile pour poursuivre une investigation nommée d’une séance de travail à l’autre.", "Si des fichiers déjà analysés ont changé depuis, il faut <b>informer des fichiers modifiés</b> l’agent : il pourra faire une ré-analyse ciblée au lieu de tout ré-explorer."]
      },
      {
        h: "Dérivation avec fork_session",
        lvl: "essentiel",
        p: "<code>fork_session</code> crée une branche indépendante à partir d’une analyse commune. Exemple : comparer deux stratégies de test ou deux approches de refactoring à partir de la même analyse du code, sans que l’une pollue l’autre."
      },
      {
        h: "Reprendre ou repartir de zéro",
        lvl: "essentiel",
        points: ["<b>Reprendre</b> quand le contexte antérieur est encore largement valide.", "Démarrer une <b>nouvelle session avec résumé structuré</b> quand les <b>résultats d’outils périmés</b> dominent (code beaucoup modifié depuis) : un résumé injecté est plus fiable qu’un historique rempli de lectures obsolètes."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Reprendre une session, c’est rouvrir le même cahier ; dériver (fork), c’est photocopier le cahier pour essayer deux pistes ; repartir de zéro avec un résumé, c’est recopier au propre uniquement ce qui est encore vrai."
          },
          {
            p: "<i>Arbre de décision :</i>"
          },
          {
            points: ["Le code a peu changé → reprendre (<code>--resume &lt;nom&gt;</code>) et signaler les fichiers modifiés.", "Deux approches à comparer à partir de la même analyse → <code>fork_session</code>.", "Le code a beaucoup changé et l’historique contient des lectures obsolètes → nouvelle session avec un résumé structuré."]
          },
          {
            p: "<i>Exemple de consigne à la reprise :</i> « Depuis hier, <code>src/billing/invoice.ts</code> a été réécrit et <code>src/billing/tax.ts</code> supprimé. Mets à jour uniquement les conclusions qui en dépendent. »"
          },
          {
            p: "<i>Piège classique :</i> reprendre une session dont les résultats d’outils décrivent un code qui n’existe plus : Claude raisonne alors sur une version périmée."
          }
        ]
      }
    ]
  },
  {
    d: 2,
    o: ["2.1"],
    title: "Interfaces d’outils : descriptions et limites",
    summary: "La description est le principal levier de sélection d’un outil : la rendre précise, distincte et sans chevauchement.",
    sections: [
      {
        h: "Descriptions d’outils et sélection des outils",
        lvl: "essentiel",
        points: ["Le modèle choisit un outil d’abord d’après sa <b>description</b>. Une description minimale (« Récupère les infos client ») rend la <b>sélection des outils</b> peu fiable entre outils proches.", "Une bonne description indique : objet, <b>formats d’entrée et exemples</b> de requêtes, cas limites, sorties, et <b>quand l’utiliser plutôt qu’un outil voisin</b>.", "Améliorer les descriptions est souvent la <b>première correction</b>, la moins coûteuse, avant d’ajouter des exemples, une couche de routage ou de fusionner des outils."]
      },
      {
        h: "Chevauchement fonctionnel",
        lvl: "essentiel",
        points: ["Deux outils aux descriptions presque identiques (<code>analyze_content</code> et <code>analyze_document</code>) provoquent des erreurs d’aiguillage.", "Correctif : renommer et préciser (<code>analyze_content</code> devient <code>extract_web_results</code>, avec une description propre au web)."]
      },
      {
        h: "Découpage en outils spécialisés",
        lvl: "essentiel",
        p: "Un outil générique fait tout et mal. On le scinde en outils aux contrats d’entrée et de sortie définis : par exemple <code>analyze_document</code> devient <code>extract_data_points</code>, <code>summarize_content</code> et <code>verify_claim_against_source</code>."
      },
      {
        h: "Formulation du prompt système",
        lvl: "avancé",
        p: "Le prompt système peut contrecarrer de bonnes descriptions : une consigne sensible à un mot-clé (« pour toute question sur une commande, utilise… ») crée des associations involontaires. Relire le prompt système fait partie du diagnostic d’une mauvaise sélection d’outil."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Pour Claude, un outil <i>est</i> sa description : c’est le seul texte qui lui dit à quoi il sert. Une bonne description répond à quatre questions : que fait l’outil, qu’attend-il, que renvoie-t-il, et quand faut-il plutôt utiliser un autre outil ?"
          },
          {
            p: "<i>Avant / après :</i>"
          },
          {
            points: ["Avant : <code>get_customer</code> — « Récupère les infos client. »", "Après : <code>get_customer</code> — « Recherche un client par e-mail ou numéro de téléphone (ex. <code>jean@exemple.fr</code>). Renvoie identifiant, nom et statut du compte. À utiliser pour identifier la personne. Pour une question sur une commande précise dont on connaît le numéro, utiliser <code>lookup_order</code>. »"]
          },
          {
            p: "<i>Piège classique :</i> corriger une mauvaise sélection en ajoutant une couche de routage ou en fusionnant les outils avant d’avoir simplement amélioré les descriptions."
          }
        ]
      }
    ]
  },
  {
    d: 2,
    o: ["2.2"],
    title: "Réponses d’erreur structurées pour les outils MCP",
    summary: "isError, catégories d’erreurs, erreurs réessayables ou non, et distinction entre échec et résultat vide.",
    sections: [
      {
        h: "Drapeau isError",
        lvl: "essentiel",
        p: "Dans le MCP, un outil signale un échec à l’agent avec le drapeau <code>isError</code> dans son résultat. Le contenu du résultat doit alors expliquer l’erreur de façon exploitable.",
        code: "{\n  \"isError\": true,\n  \"content\": [{ \"type\": \"text\", \"text\": \"{\\\"errorCategory\\\": \\\"transient\\\", \\\"isRetryable\\\": true, \\\"description\\\": \\\"Délai dépassé côté service commandes\\\"}\" }]\n}"
      },
      {
        h: "Erreurs transitoires, de validation, métier, de permission",
        lvl: "essentiel",
        points: ["<b>Transitoire</b> : délai dépassé, service indisponible ; une nouvelle tentative peut réussir.", "<b>Validation</b> : entrée invalide ; il faut corriger l’appel.", "<b>Métier</b> : violation de politique (remboursement hors délai) ; réessayer ne sert à rien.", "<b>Permission</b> : accès refusé.", "Une erreur uniforme (« Operation failed ») empêche l’agent de choisir la bonne réaction."]
      },
      {
        h: "Métadonnées d’erreur structurées",
        lvl: "essentiel",
        points: ["Renvoyer <code>errorCategory</code> (transient / validation / permission), un booléen <code>isRetryable</code> et une description lisible.", "Distinguer erreurs <b>réessayables ou non</b> évite des tentatives inutiles.", "Pour une règle métier : <code>retriable: false</code> et une explication compréhensible par le client, que l’agent pourra reformuler."]
      },
      {
        h: "Reprise locale et résultat vide valide",
        lvl: "essentiel",
        points: ["<b>Reprise locale</b> : le sous-agent gère lui-même les erreurs transitoires et ne remonte au coordinateur que ce qu’il ne peut pas résoudre, avec les résultats partiels et ce qu’il a tenté.", "Un <b>résultat vide valide</b> (requête réussie, zéro correspondance) n’est pas une erreur ; un échec d’accès en est une. Les confondre fausse les décisions de l’agent."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Une erreur bien formée dit à l’agent <i>quoi faire ensuite</i> : réessayer, corriger son appel, expliquer un refus ou abandonner cette piste. « Operation failed » ne dit rien de tout cela."
          },
          {
            p: "<i>Exemple de réponse d’erreur MCP :</i>"
          },
          {
            code: "{\n  \"isError\": true,\n  \"content\": [{\"type\": \"text\",\n               \"text\": \"{\\\"errorCategory\\\": \\\"business\\\", \\\"isRetryable\\\": false, \\\"description\\\": \\\"Délai de retour de 30 jours dépassé (commande du 2 janvier).\\\"}\"}]\n}"
          },
          {
            points: ["<b>Service indisponible, délai dépassé</b> — Catégorie : transitoire ; Réessayer ? oui", "<b>Numéro de commande mal formé</b> — Catégorie : validation ; Réessayer ? après correction de l’appel", "<b>Hors politique de remboursement</b> — Catégorie : métier ; Réessayer ? non, expliquer au client", "<b>Accès refusé</b> — Catégorie : permission ; Réessayer ? non", "<b>Recherche réussie, zéro résultat</b> — Catégorie : pas une erreur ; Réessayer ? —"]
          },
          {
            p: "<i>Piège classique :</i> renvoyer <code>isError</code> pour une recherche qui ne trouve rien : l’agent croit à une panne et réessaie inutilement."
          }
        ]
      }
    ]
  },
  {
    d: 2,
    o: ["2.3"],
    title: "Répartir les outils et configurer tool_choice",
    summary: "Moins d’outils par agent, accès limité au rôle, outils transverses ciblés et les trois modes de tool_choice.",
    sections: [
      {
        h: "Trop d’outils par agent",
        lvl: "essentiel",
        points: ["Donner 18 outils à un agent au lieu de 4 ou 5 dégrade la fiabilité de sélection : la décision devient plus complexe.", "Un agent qui a des outils hors de sa spécialité les utilise à tort (un agent de synthèse qui se met à chercher sur le web)."]
      },
      {
        h: "Accès limité au rôle",
        lvl: "essentiel",
        points: ["Chaque sous-agent ne reçoit que les outils de son rôle.", "<b>Outils transverses ciblés</b> : pour un besoin fréquent, on donne un outil restreint (un <code>verify_fact</code> pour l’agent de synthèse) et on laisse les cas complexes passer par le coordinateur.", "<b>Outils contraints</b> : remplacer un outil générique par une version limitée, par exemple <code>fetch_url</code> par <code>load_document</code> qui valide les URL de documents."]
      },
      {
        h: "tool_choice \"auto\", \"any\", outil forcé",
        lvl: "essentiel",
        points: ["<code>\"auto\"</code> : le modèle peut appeler un outil ou répondre par du texte.", "<code>\"any\"</code> : le modèle doit appeler un outil, mais choisit lequel ; garantit qu’il n’y aura pas de réponse purement textuelle.", "Outil forcé : <code>{\"type\": \"tool\", \"name\": \"extract_metadata\"}</code> ; garantit qu’un outil précis est appelé en premier, les étapes suivantes se traitant dans les tours suivants."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Chaque outil supplémentaire est une option de plus à évaluer à chaque tour. Un agent spécialisé avec 4 ou 5 outils choisit mieux qu’un généraliste avec 18. <code>tool_choice</code> permet en plus d’imposer qu’un outil soit appelé."
          },
          {
            p: "*Les trois modes de <code>tool_choice</code> :*"
          },
          {
            code: "tool_choice={\"type\": \"auto\"}                               # outil ou texte, au choix du modèle\ntool_choice={\"type\": \"any\"}                                # un outil obligatoire, au choix du modèle\ntool_choice={\"type\": \"tool\", \"name\": \"extract_metadata\"}   # cet outil précis"
          },
          {
            p: "<i>Exemple de répartition :</i> sous-agent de recherche (recherche web, chargement de document), sous-agent d’analyse (extraction, résumé), sous-agent de synthèse (rédaction + un <code>verify_fact</code> limité pour les vérifications simples)."
          },
          {
            p: "<i>Piège classique :</i> donner tous les outils à tous les agents « pour la souplesse » : l’agent de synthèse se met à chercher sur le web au lieu de synthétiser."
          }
        ]
      }
    ]
  },
  {
    d: 2,
    o: ["2.4"],
    title: "Intégrer des serveurs MCP",
    summary: "Portée projet ou utilisateur, variables d’environnement, découverte des outils et ressources comme catalogues.",
    sections: [
      {
        h: "Portée projet .mcp.json, portée utilisateur ~/.claude.json",
        lvl: "essentiel",
        points: ["<b>Portée projet</b> : <code>.mcp.json</code> à la racine du dépôt, versionné, pour l’outillage partagé par l’équipe.", "<b>Portée utilisateur</b> : <code>~/.claude.json</code>, pour les serveurs personnels ou expérimentaux.", "<b>Découverte des outils à la connexion</b> : les outils de tous les serveurs configurés sont découverts quand Claude se connecte et sont disponibles simultanément."]
      },
      {
        h: "Expansion de variables d’environnement",
        lvl: "essentiel",
        p: "Dans <code>.mcp.json</code>, on référence un secret par une variable (<code>${GITHUB_TOKEN}</code>) : chacun fournit sa valeur dans son environnement, et aucun secret n’est commité.",
        code: "{\n  \"mcpServers\": {\n    \"github\": {\n      \"command\": \"<commande-du-serveur>\",\n      \"env\": { \"GITHUB_TOKEN\": \"${GITHUB_TOKEN}\" }\n    }\n  }\n}"
      },
      {
        h: "Ressources MCP comme catalogues",
        lvl: "essentiel",
        p: "Une ressource MCP expose un <b>catalogue de contenu</b> (résumés de tickets, arborescence de documentation, schéma de base de données). L’agent voit ce qui existe sans multiplier les appels d’outils exploratoires."
      },
      {
        h: "Descriptions et serveurs communautaires",
        lvl: "essentiel",
        points: ["Un outil MCP mal décrit sera délaissé au profit d’un outil intégré (Grep) moins adapté : décrire en détail capacités et sorties.", "Pour une intégration standard (Jira…), préférer un <b>serveur communautaire</b> existant ; réserver le développement sur mesure aux workflows propres à l’équipe."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Le MCP branche Claude sur vos systèmes. La question clé est la portée : ce qui sert à toute l’équipe va dans le dépôt (<code>.mcp.json</code>), ce qui est personnel ou expérimental va dans votre configuration utilisateur (<code>~/.claude.json</code>). Les secrets ne sont jamais écrits en clair : on référence une variable d’environnement."
          },
          {
            p: "*Exemple de <code>.mcp.json</code> partagé :*"
          },
          {
            code: "{\n  \"mcpServers\": {\n    \"tickets\": {\n      \"command\": \"<commande-du-serveur>\",\n      \"env\": { \"TICKETS_TOKEN\": \"${TICKETS_TOKEN}\" }\n    }\n  }\n}"
          },
          {
            p: "<i>Exemple de ressource utile :</i> exposer « liste des tickets ouverts avec leur résumé » en ressource MCP évite à l’agent dix appels exploratoires pour découvrir ce qui existe."
          },
          {
            p: "<i>Piège classique :</i> une description d’outil MCP trop pauvre ; l’agent lui préfère alors Grep, moins adapté mais mieux connu."
          }
        ]
      }
    ]
  },
  {
    d: 2,
    o: ["2.5"],
    title: "Outils intégrés : Read, Write, Edit, Bash, Grep, Glob",
    summary: "Choisir le bon outil intégré et construire la compréhension d’une base de code progressivement.",
    sections: [
      {
        h: "Grep pour le contenu, Glob pour les chemins",
        lvl: "essentiel",
        points: ["<b>Grep pour le contenu</b> : chercher un motif dans les fichiers (appelants d’une fonction, message d’erreur, import).", "<b>Glob pour les chemins</b> : trouver des fichiers par nom ou extension (<code>**/*.test.tsx</code>).", "Confusion classique : utiliser Glob pour trouver qui appelle une fonction (il faut Grep), ou Grep pour lister les fichiers de test (il faut Glob)."]
      },
      {
        h: "Read et Write, Edit et texte unique",
        lvl: "essentiel",
        points: ["<b>Read et Write</b> opèrent sur des fichiers entiers.", "<b>Edit</b> fait une modification ciblée par correspondance de <b>texte unique</b> : il échoue si l’ancre apparaît plusieurs fois ou pas du tout.", "<b>Repli Read + Write</b> : quand Edit ne trouve pas d’ancre unique, lire tout le fichier puis le réécrire."]
      },
      {
        h: "Compréhension incrémentale",
        lvl: "essentiel",
        points: ["Commencer par Grep pour trouver les points d’entrée, puis Read pour suivre les imports et les flux, au lieu de tout lire d’emblée.", "Pour tracer une fonction à travers des modules d’enveloppe : identifier d’abord tous les noms sous lesquels elle est exportée, puis rechercher chacun."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Les outils intégrés se choisissent selon la question posée : <i>où est ce texte ?</i> (Grep), <i>où sont ces fichiers ?</i> (Glob), <i>que contient ce fichier ?</i> (Read), <i>modifier un passage précis</i> (Edit), <i>réécrire tout le fichier</i> (Write), <i>exécuter une commande</i> (Bash)."
          },
          {
            points: ["<b>Tous les appels à <code>calculateTax</code></b> : Grep", "<b>Tous les fichiers <code>**/*.test.tsx</code></b> : Glob", "<b>Comprendre un fichier trouvé</b> : Read", "<b>Remplacer une ligne unique</b> : Edit", "<b>Edit échoue (texte présent plusieurs fois)</b> : Read puis Write"]
          },
          {
            p: "<i>Exemple de démarche incrémentale :</i> Grep sur <code>refund(</code> pour trouver les points d’entrée, Read des deux fichiers trouvés, puis suivre leurs imports, au lieu de lire 300 fichiers d’emblée."
          },
          {
            p: "<i>Piège classique :</i> chercher les usages d’une fonction réexportée sous un alias en ne cherchant que son nom d’origine."
          }
        ]
      }
    ]
  },
  {
    d: 3,
    o: ["3.1"],
    title: "CLAUDE.md : hiérarchie, portée et modularité",
    summary: "Où placer chaque instruction, comment la partager, la découper et vérifier ce qui est chargé.",
    sections: [
      {
        h: "Hiérarchie utilisateur / projet / répertoire",
        lvl: "essentiel",
        points: ["<b>Utilisateur</b> : <code>~/.claude/CLAUDE.md</code>, pour vous seul, dans tous vos projets.", "<b>Projet</b> : <code>CLAUDE.md</code> à la racine ou <code>.claude/CLAUDE.md</code>, versionné, partagé par l’équipe.", "<b>Répertoire</b> : un <code>CLAUDE.md</code> dans un sous-dossier, pour les conventions de ce dossier."]
      },
      {
        h: "~/.claude/CLAUDE.md non partagé",
        lvl: "essentiel",
        p: "Les instructions du niveau utilisateur ne sont <b>pas partagées</b> via le contrôle de version. Diagnostic typique : un nouveau membre de l’équipe ne reçoit pas les consignes parce qu’elles ont été mises dans le <code>~/.claude/CLAUDE.md</code> d’un collègue au lieu du CLAUDE.md du projet."
      },
      {
        h: "Syntaxe @import et dossier .claude/rules/",
        lvl: "essentiel",
        points: ["<b>Syntaxe <code>@import</code></b> : un CLAUDE.md référence des fichiers externes pour rester modulaire, par exemple n’importer dans le CLAUDE.md de chaque package que les standards qui le concernent.", "<b>Dossier <code>.claude/rules/</code></b> : alternative à un CLAUDE.md monolithique, avec des fichiers thématiques (<code>testing.md</code>, <code>api-conventions.md</code>, <code>deployment.md</code>)."]
      },
      {
        h: "Commande /memory",
        lvl: "essentiel",
        p: "La <b>commande <code>/memory</code></b> montre quels fichiers de mémoire sont chargés. C’est l’outil de diagnostic quand Claude se comporte différemment d’une session ou d’un poste à l’autre."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "CLAUDE.md est la mémoire permanente de Claude Code. Où le placer détermine qui le reçoit : vous seul (<code>~/.claude/CLAUDE.md</code>), toute l’équipe (CLAUDE.md du projet), ou seulement ceux qui travaillent dans un dossier (CLAUDE.md de sous-dossier)."
          },
          {
            p: "<i>Exemple d’organisation modulaire :</i>"
          },
          {
            code: "CLAUDE.md                     # standards communs + @import ciblés\n.claude/rules/testing.md\n.claude/rules/api-conventions.md\n.claude/rules/deployment.md\npackages/billing/CLAUDE.md    # @import ../../docs/standards/money.md"
          },
          {
            p: "<i>Exemple de diagnostic :</i> « La nouvelle développeuse ne reçoit pas les règles de test » → <code>/memory</code> montre que les règles sont dans le <code>~/.claude/CLAUDE.md</code> de son collègue, pas dans le projet."
          },
          {
            p: "<i>Piège classique :</i> mettre les conventions d’équipe dans le CLAUDE.md utilisateur : elles fonctionnent chez leur auteur et nulle part ailleurs."
          }
        ]
      }
    ]
  },
  {
    d: 3,
    o: ["3.2"],
    title: "Commandes slash et skills personnalisés",
    summary: "Commandes de projet ou personnelles, skills et leur frontmatter : context: fork, allowed-tools, argument-hint.",
    sections: [
      {
        h: ".claude/commands/ projet ou utilisateur",
        lvl: "essentiel",
        points: ["<b>Projet</b> : <code>.claude/commands/</code>, versionné, disponible pour toute l’équipe dès le clone ou le pull.", "<b>Utilisateur</b> : <code>~/.claude/commands/</code>, personnel, non partagé.", "Une commande ne se définit ni dans CLAUDE.md (instructions et contexte) ni dans un fichier de configuration JSON."]
      },
      {
        h: "Skills .claude/skills/ et SKILL.md",
        lvl: "essentiel",
        p: "Un skill est un dossier de <code>.claude/skills/</code> contenant un fichier <code>SKILL.md</code> dont le frontmatter configure son exécution. Pour une variante personnelle, on crée un skill dans <code>~/.claude/skills/</code> <b>sous un autre nom</b>, pour ne pas affecter l’équipe.",
        code: "---\nname: analyse-codebase\ndescription: Analyse l’architecture d’un module et rend une synthèse.\ncontext: fork\nallowed-tools: Read, Grep, Glob\nargument-hint: <chemin du module>\n---\nAnalyse le module indiqué et rends : couches, dépendances, risques."
      },
      {
        h: "context: fork, allowed-tools, argument-hint",
        lvl: "essentiel",
        points: ["<code>context: fork</code> : exécute le skill dans un <b>contexte de sous-agent isolé</b> ; sa sortie verbeuse (analyse de code) ou exploratoire (brainstorming) ne pollue pas la conversation principale.", "<code>allowed-tools</code> : restreint les outils disponibles pendant le skill (par exemple pour éviter toute action destructrice).", "<code>argument-hint</code> : indique le paramètre attendu quand le skill est invoqué sans argument."]
      },
      {
        h: "Skills ou CLAUDE.md",
        lvl: "essentiel",
        p: "Un <b>skill</b> s’invoque <b>à la demande</b> pour un workflow précis ; <b>CLAUDE.md</b> contient les standards universels, <b>toujours chargés</b>. Mettre une procédure ponctuelle dans CLAUDE.md consomme du contexte en permanence."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Une commande slash est un raccourci de prompt que l’on déclenche à la main ; un skill est un savoir-faire empaqueté que l’on invoque à la demande, avec son propre réglage (outils autorisés, contexte isolé). CLAUDE.md, lui, est toujours chargé."
          },
          {
            p: "*Exemple de <code>SKILL.md</code> :*"
          },
          {
            code: ""
          }
        ]
      }
    ]
  },
  {
    d: 3,
    o: ["3.3"],
    title: "Règles par chemin",
    summary: "Charger une convention seulement quand on édite les fichiers concernés, où qu’ils soient.",
    sections: [
      {
        h: "Frontmatter paths et motifs glob",
        lvl: "essentiel",
        p: "Un fichier de <code>.claude/rules/</code> peut porter un <b>frontmatter <code>paths</code></b> listant des <b>motifs glob</b>. La règle ne s’active que pour les fichiers correspondants.",
        code: "---\npaths: [\"**/*.test.tsx\"]\n---\nTests : React Testing Library, un describe par composant,\npas de snapshot pour la logique métier."
      },
      {
        h: "Chargement conditionnel et économie de contexte",
        lvl: "essentiel",
        p: "Avec le <b>chargement conditionnel</b>, une règle limitée à des chemins n’est chargée qu’à l’édition des fichiers concernés : c’est une <b>économie de contexte</b> (moins de tokens, moins de consignes hors sujet)."
      },
      {
        h: "Conventions transverses aux dossiers",
        lvl: "essentiel",
        points: ["Un CLAUDE.md de sous-dossier est lié à un <b>répertoire</b>.", "Pour des conventions transverses aux dossiers (fichiers de test placés à côté du code dans toute la base), un motif glob comme <code>**/*.test.tsx</code> est plus adapté.", "Exemple : <code>paths: [\"terraform/**/*\"]</code> pour les conventions d’infrastructure."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Une règle par chemin est une consigne qui ne s’active que lorsqu’on touche certains fichiers. Elle suit le <i>type</i> de fichier, pas son dossier, ce qui la rend idéale pour les tests, les migrations ou l’infrastructure dispersés dans le dépôt."
          },
          {
            p: "<i>Exemple :</i>"
          },
          {
            code: ""
          }
        ]
      }
    ]
  },
  {
    d: 3,
    o: ["3.4"],
    title: "Plan mode ou exécution directe",
    summary: "Évaluer la complexité d’une tâche pour choisir la bonne approche, et préserver le contexte avec Explore.",
    sections: [
      {
        h: "Plan mode pour les tâches complexes",
        lvl: "essentiel",
        points: ["Changements à grande échelle, plusieurs approches valables, décisions d’architecture, modifications sur de nombreux fichiers.", "Exemples : découper un monolithe en microservices, migration d’une bibliothèque touchant plus de 45 fichiers, choix entre deux approches d’intégration aux infrastructures différentes.", "<b>Exploration sans risque</b> : on explore et conçoit avant de modifier, ce qui évite des reprises coûteuses."]
      },
      {
        h: "Exécution directe pour les changements simples",
        lvl: "essentiel",
        points: ["Changement bien compris et bien délimité : corriger un bug sur un seul fichier avec une trace claire, ajouter une condition de validation de date.", "Piège : commencer en exécution directe une tâche dont la complexité est déjà connue « en espérant que la structure émerge »."]
      },
      {
        h: "Sous-agent Explore",
        lvl: "essentiel",
        p: "Le <b>sous-agent Explore</b> isole la sortie verbeuse d’une phase de découverte et ne renvoie qu’un résumé : la fenêtre de contexte principale n’est pas épuisée pendant les tâches en plusieurs phases."
      },
      {
        h: "Combiner plan et exécution",
        lvl: "essentiel",
        p: "Les deux modes se combinent : plan mode pour l’investigation (planifier une migration de bibliothèque), puis exécution directe pour appliquer l’approche retenue."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Le plan mode, c’est « réfléchir avant de toucher ». Il coûte un peu de temps au départ et en économise beaucoup quand la tâche est grosse ou ambiguë. Pour un petit changement évident, il ralentit inutilement."
          },
          {
            points: ["<b>Corriger une division par zéro signalée par une trace précise</b> : Exécution directe", "<b>Ajouter une validation de format d’e-mail dans un formulaire</b> : Exécution directe", "<b>Remplacer l’ORM dans 40 fichiers</b> : Plan mode, puis exécution", "<b>Choisir entre file de messages et appels synchrones</b> : Plan mode"]
          },
          {
            p: "<i>Exemple d’enchaînement :</i> plan mode pour cartographier la migration (avec le sous-agent Explore pour ne pas saturer le contexte), validation du plan, puis exécution directe étape par étape."
          },
          {
            p: "<i>Piège classique :</i> partir en exécution directe sur une refonte « pour voir ce qui émerge » et découvrir les dépendances après avoir modifié vingt fichiers."
          }
        ]
      }
    ]
  },
  {
    d: 3,
    o: ["3.5"],
    title: "Raffinement itératif",
    summary: "Exemples d’entrée / sortie, itération par les tests, pattern d’interview et regroupement des problèmes.",
    sections: [
      {
        h: "Exemples d’entrée / sortie",
        lvl: "essentiel",
        p: "Quand une description en prose est interprétée de façon incohérente, <b>2 ou 3 exemples concrets</b> d’entrée et de sortie communiquent la transformation attendue plus efficacement. Même logique pour un cas limite : fournir le cas de test précis (entrée, sortie attendue), par exemple pour les valeurs nulles dans un script de migration."
      },
      {
        h: "Itération guidée par les tests",
        lvl: "essentiel",
        points: ["Écrire d’abord une suite de tests : comportement attendu, cas limites, exigences de performance.", "Puis itérer en partageant les échecs de tests avec Claude : l’amélioration est guidée par des faits."]
      },
      {
        h: "Pattern d’interview",
        lvl: "essentiel",
        p: "Avant d’implémenter dans un domaine peu familier, demander à Claude de <b>vous poser des questions</b> : il fait émerger des points non anticipés (stratégie d’invalidation de cache, modes de défaillance)."
      },
      {
        h: "Problèmes liés ou indépendants",
        lvl: "essentiel",
        points: ["Problèmes <b>liés</b> (les corrections interagissent) : les décrire tous dans un seul message détaillé.", "Problèmes <b>indépendants</b> : les corriger un par un, séquentiellement."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Quand Claude ne comprend pas ce que vous voulez, décrire davantage aide moins que <i>montrer</i>. Trois leviers : des exemples d’entrée / sortie, des tests écrits à l’avance, et des questions que Claude vous pose avant de coder."
          },
          {
            p: "<i>Exemple d’exemples d’entrée / sortie :</i>"
          },
          {
            code: "\"12 rue des Lilas 75011 paris\"   → {\"rue\": \"12 rue des Lilas\", \"cp\": \"75011\", \"ville\": \"Paris\"}\n\"BP 45, 69002 LYON CEDEX\"        → {\"rue\": \"BP 45\", \"cp\": \"69002\", \"ville\": \"Lyon\"}\n\"Lieu-dit Le Moulin, 24200\"      → {\"rue\": \"Lieu-dit Le Moulin\", \"cp\": \"24200\", \"ville\": null}"
          },
          {
            p: "<i>Exemple de pattern d’interview :</i> « Avant d’écrire le cache, pose-moi les questions nécessaires. » Claude demande alors : durée de vie des entrées, invalidation à la modification, comportement si le cache est indisponible…"
          },
          {
            p: "<i>Piège classique :</i> envoyer cinq problèmes liés un par un ; chaque correction en casse une autre. Les problèmes liés se décrivent ensemble."
          }
        ]
      }
    ]
  },
  {
    d: 3,
    o: ["3.6"],
    title: "Claude Code dans les pipelines CI/CD",
    summary: "Mode non interactif, sortie JSON validée par schéma, contexte de projet et revues indépendantes.",
    sections: [
      {
        h: "Option -p / --print",
        lvl: "essentiel",
        p: "En CI, lancer Claude Code avec l’option <b><code>-p</code> / <code>--print</code></b> : il traite le prompt, écrit le résultat sur la sortie standard et se termine. Sans elle, le job reste bloqué en attente d’une saisie interactive.",
        code: "claude -p \"Analyse cette pull request : bugs et failles uniquement\" \\\n  --output-format json --json-schema schema-revue.json"
      },
      {
        h: "--output-format json et --json-schema",
        lvl: "essentiel",
        p: "<code>--output-format json</code> associé à <code>--json-schema</code> produit des résultats structurés, exploitables par une machine, par exemple pour les publier en commentaires de PR à la bonne ligne."
      },
      {
        h: "CLAUDE.md comme contexte en CI",
        lvl: "essentiel",
        points: ["Claude Code lancé en CI lit le CLAUDE.md du dépôt : y documenter les standards de test, les critères d’un test utile, les fixtures disponibles et les critères de revue.", "Fournir les fichiers de test existants pour éviter les scénarios déjà couverts."]
      },
      {
        h: "Isolation du contexte de session et résultats de revue antérieurs",
        lvl: "essentiel",
        points: ["<b>Isolation du contexte de session</b> : la session qui a généré du code relit moins bien ses propres changements qu’une instance de revue indépendante.", "<b>Résultats de revue antérieurs</b> : quand la revue est relancée après de nouveaux commits, les fournir et demander de ne signaler que les problèmes nouveaux ou non résolus, pour éviter les commentaires en double."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "En CI, personne ne peut répondre à Claude : il faut le mode non interactif (<code>-p</code>), une sortie lisible par une machine (<code>--output-format json</code> et <code>--json-schema</code>) et un contexte de projet fourni par CLAUDE.md."
          },
          {
            p: "<i>Exemple d’étape de pipeline :</i>"
          },
          {
            code: "claude -p \"Revois les fichiers modifiés de cette PR. Signale uniquement bugs et failles. \\\nVoici les commentaires des revues précédentes : ne répète pas ceux déjà traités.\" \\\n  --output-format json --json-schema .ci/revue.schema.json > revue.json"
          },
          {
            p: "<i>Exemple de schéma attendu (extrait) :</i> chaque commentaire contient <code>fichier</code>, <code>ligne</code>, <code>categorie</code>, <code>severite</code>, <code>message</code>, ce qui permet de les publier automatiquement à la bonne ligne de la PR."
          },
          {
            p: "<i>Piège classique :</i> faire relire le code par la session qui l’a généré ; une instance indépendante, sans ce raisonnement préalable, trouve davantage de problèmes."
          }
        ]
      }
    ]
  },
  {
    d: 4,
    o: ["4.1"],
    title: "Critères explicites contre les faux positifs",
    summary: "Remplacer les consignes vagues par des critères catégoriels précis pour restaurer la confiance des développeurs.",
    sections: [
      {
        h: "Critères explicites",
        lvl: "essentiel",
        points: ["Vague : « vérifie que les commentaires sont exacts ».", "Explicite : « signale un commentaire seulement si le comportement décrit contredit le comportement réel du code ».", "Définir ce qu’il faut <b>signaler</b> (bugs, sécurité) et ce qu’il faut <b>ignorer</b> (style mineur, conventions locales)."]
      },
      {
        h: "Consignes vagues inefficaces",
        lvl: "essentiel",
        p: "« Sois prudent » ou « ne signale que les résultats très sûrs » n’améliorent pas la précision : filtrer par niveau de confiance ne remplace pas des critères précis."
      },
      {
        h: "Taux de faux positifs et confiance des développeurs",
        lvl: "essentiel",
        points: ["Une catégorie au fort taux de faux positifs fait douter de toutes les autres, même fiables : la confiance des développeurs s’effondre globalement.", "<b>Désactivation temporaire de catégories</b> : couper les catégories les plus bruyantes pendant qu’on améliore leurs prompts.", "<b>Critères de sévérité</b> : définir chaque niveau avec des exemples de code concrets pour une classification cohérente."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "« Sois prudent » ne dit pas à Claude <i>quoi</i> signaler. Un bon prompt de revue définit des catégories précises, ce qu’il faut ignorer, et des exemples de chaque niveau de sévérité."
          },
          {
            p: "<i>Avant / après :</i>"
          },
          {
            points: ["Avant : « Fais une revue sérieuse et ne signale que ce dont tu es sûr. »", "Après : « Signale uniquement : (1) données utilisateur insérées sans paramètre dans une requête SQL ; (2) secret écrit en clair ; (3) route sans contrôle d’accès. Ignore le style, le nommage et les conventions propres à l’équipe. Sévérité <i>critique</i> = exploitable à distance (ex. injection SQL) ; <i>majeure</i> = fuite de données internes ; <i>mineure</i> = mauvaise pratique sans impact direct. »"]
          },
          {
            p: "<i>Piège classique :</i> garder active une catégorie qui produit 70 % de faux positifs ; les développeurs finissent par ignorer aussi les alertes justes."
          }
        ]
      }
    ]
  },
  {
    d: 4,
    o: ["4.2"],
    title: "Few-shot prompting",
    summary: "Des exemples ciblés pour la cohérence du format, les cas ambigus et la fiabilité de l’extraction.",
    sections: [
      {
        h: "Exemples few-shot",
        lvl: "essentiel",
        p: "Quand des instructions détaillées ne suffisent pas à obtenir une sortie cohérente, les <b>exemples few-shot</b> sont la technique la plus efficace. Viser <b>2 à 4 exemples ciblés</b>."
      },
      {
        h: "Cas ambigus et généralisation",
        lvl: "essentiel",
        points: ["Montrer le raisonnement sur des <b>cas ambigus</b> : pourquoi telle action plutôt qu’une autre plausible (choix d’outil, lacune de couverture de tests au niveau des branches).", "Les exemples permettent la <b>généralisation</b> du jugement à de nouveaux cas, au-delà des cas montrés.", "Montrer des motifs de code <b>acceptables</b> à côté de vrais problèmes réduit les faux positifs."]
      },
      {
        h: "Format de sortie",
        lvl: "essentiel",
        p: "Un exemple qui montre exactement le <b>format de sortie</b> voulu (emplacement, problème, sévérité, correctif proposé) donne des résultats homogènes."
      },
      {
        h: "Réduction des hallucinations en extraction",
        lvl: "essentiel",
        points: ["En extraction, les exemples réduisent les valeurs inventées (mesures informelles, champs absents).", "Couvrir les <b>structures de documents variées</b> : citations dans le texte ou bibliographie, méthodologie en section ou dispersée, récit ou tableau.", "Ajouter des exemples d’extraction réussie sur des formats variés corrige les champs obligatoires renvoyés vides ou nuls."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Un exemple vaut mieux qu’un paragraphe d’instructions : il montre le format attendu, la façon de trancher les cas ambigus et la conduite à tenir quand une information manque. 2 à 4 exemples bien choisis suffisent."
          },
          {
            p: "<i>Exemple few-shot pour une revue :</i>"
          },
          {
            code: "Code : password = \"admin123\"\nSortie : {\"ligne\": 12, \"probleme\": \"Secret en clair\", \"severite\": \"critique\",\n          \"correctif\": \"Lire la valeur depuis une variable d’environnement\"}\n\nCode : const MAX_RETRY = 3\nSortie : aucun signalement (constante nommée, pratique acceptable)"
          },
          {
            p: "Le second exemple compte autant que le premier : il apprend à Claude ce qu’il ne faut <i>pas</i> signaler."
          },
          {
            p: "<i>Piège classique :</i> ne donner que des exemples « faciles ». Ce sont les cas ambigus et les structures inhabituelles (tableau, bibliographie, note de bas de page) qu’il faut illustrer."
          }
        ]
      }
    ]
  },
  {
    d: 4,
    o: ["4.3"],
    title: "Sortie structurée : tool use et schémas JSON",
    summary: "Le tool use garantit la syntaxe, pas la sémantique ; concevoir le schéma pour éviter les valeurs inventées.",
    sections: [
      {
        h: "tool_use avec schéma JSON",
        lvl: "essentiel",
        p: "Définir un outil d’extraction dont le <b>schéma d’entrée</b> est le format voulu : <code>tool_use</code> avec schéma JSON est l’approche la plus fiable pour une sortie conforme, sans erreur de syntaxe JSON. Les données se lisent dans le bloc <code>tool_use</code> de la réponse."
      },
      {
        h: "tool_choice \"auto\", \"any\", forcé",
        lvl: "essentiel",
        points: ["<code>\"auto\"</code> : le modèle peut répondre par du texte au lieu d’appeler l’outil.", "<code>\"any\"</code> : il doit appeler un outil ; idéal quand plusieurs schémas d’extraction existent et que le type de document est inconnu.", "Forcé (<code>{\"type\": \"tool\", \"name\": \"extract_metadata\"}</code>) : garantit qu’une extraction précise passe avant les étapes d’enrichissement."]
      },
      {
        h: "Erreurs de syntaxe ou erreurs sémantiques",
        lvl: "essentiel",
        p: "Un schéma strict élimine les <b>erreurs de syntaxe</b>, pas les <b>erreurs sémantiques</b> : lignes qui ne s’additionnent pas au total, valeur placée dans le mauvais champ. Il faut une validation métier en plus (objectif 4.4)."
      },
      {
        h: "Conception du schéma",
        lvl: "essentiel",
        points: ["<b>Champs obligatoires ou facultatifs</b> : un champ obligatoire absent du document pousse le modèle à inventer.", "<b>Champs nullable</b> : quand l’information peut manquer, autoriser <code>null</code>.", "<b>Enum avec <code>\"other\"</code> et détail</b> : une valeur <code>\"other\"</code> accompagnée d’un champ texte de détail pour les catégories imprévues ; une valeur <code>\"unclear\"</code> pour les cas ambigus.", "Ajouter au prompt des règles de normalisation (dates, unités) pour les sources au format incohérent."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Pour obtenir un JSON fiable, on ne demande pas « réponds en JSON » : on déclare un outil dont le schéma <i>est</i> le format voulu, et Claude remplit ses paramètres. La syntaxe est alors garantie ; la cohérence des valeurs reste à vérifier."
          },
          {
            p: "<i>Exemple de schéma d’extraction :</i>"
          },
          {
            code: "{\n  \"name\": \"extract_invoice\",\n  \"description\": \"Extrait les données d’une facture.\",\n  \"input_schema\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"numero\": {\"type\": \"string\"},\n      \"date\": {\"type\": \"string\", \"description\": \"Format AAAA-MM-JJ\"},\n      \"numero_tva\": {\"type\": [\"string\", \"null\"], \"description\": \"null si absent du document\"},\n      \"categorie\": {\"type\": \"string\", \"enum\": [\"materiel\", \"service\", \"abonnement\", \"other\", \"unclear\"]},\n      \"categorie_detail\": {\"type\": [\"string\", \"null\"], \"description\": \"Précision si categorie = other\"},\n      \"total_ttc\": {\"type\": \"number\"}\n    },\n    \"required\": [\"numero\", \"date\", \"categorie\", \"total_ttc\"]\n  }\n}"
          },
          {
            p: "<i>Piège classique :</i> rendre obligatoire un champ souvent absent des documents ; Claude invente alors une valeur pour respecter le schéma."
          }
        ]
      }
    ]
  },
  {
    d: 4,
    o: ["4.4"],
    title: "Validation, nouvelle tentative et boucles de retour",
    summary: "Réessayer avec les erreurs précises quand c’est utile, savoir quand c’est inutile, et analyser les rejets.",
    sections: [
      {
        h: "Nouvelle tentative avec retour d’erreur",
        lvl: "essentiel",
        p: "En cas d’échec de validation, la requête de suivi contient le <b>document d’origine</b>, l’<b>extraction ratée</b> et les <b>erreurs de validation précises</b> : le modèle se corrige à partir de faits, pas d’un « réessaie »."
      },
      {
        h: "Limites des nouvelles tentatives",
        lvl: "essentiel",
        points: ["Utiles pour les erreurs de format ou de structure.", "Inutiles quand l’information est <b>absente du document</b> (par exemple présente seulement dans un document externe non fourni) : réessayer ne la fera pas apparaître."]
      },
      {
        h: "Erreurs sémantiques ou de syntaxe et auto-correction",
        lvl: "essentiel",
        points: ["Les erreurs de syntaxe sont éliminées par le tool use ; les erreurs sémantiques demandent des contrôles.", "<b>Auto-correction</b> : extraire <code>calculated_total</code> et <code>stated_total</code> pour détecter un écart, ajouter un booléen <code>conflict_detected</code> pour une source incohérente."]
      },
      {
        h: "Champ detected_pattern",
        lvl: "avancé",
        p: "Dans une revue automatisée, ajouter un <b>champ <code>detected_pattern</code></b> à chaque signalement : quand les développeurs rejettent des résultats, on peut analyser quels motifs produisent les faux positifs et corriger systématiquement."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Quand une extraction échoue à la validation, la nouvelle tentative doit dire <i>exactement</i> ce qui ne va pas. Mais réessayer ne fait jamais apparaître une information absente du document."
          },
          {
            p: "<i>Exemple de message de nouvelle tentative :</i>"
          },
          {
            code: "Ton extraction précédente ne passe pas la validation :\n- \"date\" vaut \"3 mars 2026\" : format attendu AAAA-MM-JJ.\n- \"total_ttc\" (120,00) ≠ somme des lignes (118,80).\nVoici le document et ta sortie précédente : corrige uniquement ces points."
          },
          {
            p: "<i>Exemple d’auto-contrôle dans le schéma :</i> extraire <code>stated_total</code> (le total imprimé) et <code>calculated_total</code> (la somme des lignes) ; si les deux diffèrent, positionner <code>conflict_detected: true</code> et envoyer en revue."
          },
          {
            p: "<i>Piège classique :</i> relancer dix fois une extraction pour un champ qui n’existe que dans une annexe non fournie."
          }
        ]
      }
    ]
  },
  {
    d: 4,
    o: ["4.5"],
    title: "Traitement par lots",
    summary: "Message Batches API : quand l’utiliser, comment dimensionner la fréquence et gérer les échecs.",
    sections: [
      {
        h: "Message Batches API",
        lvl: "essentiel",
        points: ["<b>50 % d’économie</b> par rapport aux appels synchrones.", "<b>Fenêtre de 24 heures</b> au plus pour le traitement, et <b>pas de SLA de latence</b>.", "<b>Pas d’appels d’outils multi-tours</b> dans une requête : impossible d’exécuter un outil en cours de requête et d’en renvoyer le résultat.", "<code>custom_id</code> associe chaque requête à sa réponse ; on interroge l’avancement du lot jusqu’à sa fin."]
      },
      {
        h: "Choisir synchrone ou lots",
        lvl: "essentiel",
        points: ["Lots : charges non bloquantes et tolérantes à la latence (rapports de nuit, audits hebdomadaires, génération de tests nocturne).", "Synchrone : workflows bloquants (vérification avant fusion qu’un développeur attend).", "Dimensionner la fréquence de soumission selon le SLA : par exemple des fenêtres de 4 heures pour garantir 30 heures avec un traitement pouvant durer 24 heures."]
      },
      {
        h: "Gérer les échecs",
        lvl: "essentiel",
        points: ["Ne resoumettre que les documents en échec, identifiés par <code>custom_id</code>, avec les modifications nécessaires (découper un document qui dépassait la fenêtre de contexte).", "Affiner le prompt sur un échantillon avant de lancer un gros volume, pour maximiser la réussite au premier passage."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "La Message Batches API, c’est le « tarif de nuit » : moitié prix, mais résultat dans les 24 heures, sans garantie de délai. Parfait pour ce qui peut attendre, inadapté à ce que quelqu’un attend."
          },
          {
            p: "<i>Exemple de calcul de fréquence :</i> SLA de 30 h, traitement d’un lot jusqu’à 24 h → un document ne doit pas attendre plus de 6 h avant d’être soumis. En soumettant toutes les 4 heures, on garde 2 h de marge."
          },
          {
            points: ["<b>Rapport de dette technique pour le lendemain matin</b> : Lots", "<b>Extraction de 50 000 archives</b> : Lots", "<b>Vérification avant fusion, développeur en attente</b> : Synchrone", "<b>Agent qui doit appeler des outils en cours de route</b> : Synchrone (les lots ne font pas d’appels d’outils multi-tours)"]
          },
          {
            p: "<i>Piège classique :</i> resoumettre tout le lot après quelques échecs, au lieu de reprendre uniquement les documents en échec grâce à leur <code>custom_id</code>."
          }
        ]
      }
    ]
  },
  {
    d: 4,
    o: ["4.6"],
    title: "Revue multi-instances et multi-passes",
    summary: "Pourquoi l’auto-revue est faible, et comment structurer une revue fiable.",
    sections: [
      {
        h: "Limites de l’auto-revue",
        lvl: "essentiel",
        p: "Dans la même session, le modèle garde le raisonnement qui l’a conduit à générer le code : il remet moins en cause ses propres choix. Des consignes d’auto-revue ou la réflexion étendue n’y changent pas grand-chose."
      },
      {
        h: "Instance de revue indépendante",
        lvl: "essentiel",
        p: "Une <b>seconde instance</b> de Claude, sans le contexte de raisonnement du générateur, détecte mieux les problèmes subtils."
      },
      {
        h: "Revue multi-passes",
        lvl: "essentiel",
        points: ["<b>Passes par fichier et passe d’intégration</b> : analyse locale fichier par fichier, puis passe séparée sur les flux de données entre fichiers.", "Cela évite la dilution de l’attention et les signalements contradictoires d’une revue en une seule passe.", "<b>Confiance auto-déclarée pour le routage</b> : dans une passe de vérification, le modèle indique sa confiance pour chaque signalement, ce qui permet de router la revue (humaine ou non) de façon calibrée."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Un auteur relit mal son propre texte : il lit ce qu’il voulait écrire. Pour Claude, c’est pareil dans une même session. La parade : une instance de relecture indépendante, et un découpage de la revue en passes ciblées."
          },
          {
            p: "<i>Exemple d’architecture de revue pour une PR de 20 fichiers :</i>"
          },
          {
            points: ["Passes locales : une par fichier, avec les critères de revue.", "Passe d’intégration : flux de données et contrats entre fichiers.", "Passe de vérification : chaque signalement reçoit une confiance ; les signalements peu sûrs vont à un humain."]
          },
          {
            p: "<i>Piège classique :</i> croire qu’un modèle à plus grande fenêtre de contexte, ou trois revues identiques avec vote, résout la dilution de l’attention. Le vote supprime même des vrais bugs détectés une seule fois."
          }
        ]
      }
    ]
  },
  {
    d: 5,
    o: ["5.1"],
    title: "Préserver l’information critique",
    summary: "Résumés qui perdent les chiffres, effet de position, résultats d’outils envahissants : les parades.",
    sections: [
      {
        h: "Risques de la synthèse progressive",
        lvl: "essentiel",
        p: "En résumant au fil de l’eau, les montants, pourcentages, dates et attentes exprimées par le client deviennent flous (« le client veut un remboursement »). Parade : un <b>bloc « case facts »</b> persistant (montants, dates, numéros de commande, statuts) inclus dans chaque prompt, en dehors de l’historique résumé ; pour plusieurs problèmes, une couche de données structurées par problème."
      },
      {
        h: "Effet « lost in the middle »",
        lvl: "essentiel",
        p: "Le modèle traite bien le début et la fin d’une longue entrée mais peut omettre le milieu. Parade : placer un résumé des résultats clés <b>au début</b> et organiser les détails avec des titres de section explicites."
      },
      {
        h: "Accumulation des résultats d’outils",
        lvl: "essentiel",
        points: ["Un résultat d’outil verbeux (plus de 40 champs pour une commande quand 5 suffisent) consomme des tokens sans rapport avec son utilité.", "<b>Réduction des sorties d’outils</b> : ne garder que les champs utiles avant qu’ils ne s’accumulent.", "Faire renvoyer aux agents en amont des données structurées (faits clés, citations, scores de pertinence) plutôt que du texte verbeux, et des métadonnées (dates, sources, méthode)."]
      },
      {
        h: "Historique complet",
        lvl: "essentiel",
        p: "L’API est sans état : chaque requête doit transmettre l’<b>historique complet</b> utile de la conversation pour garder la cohérence."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Plus une conversation est longue, plus les résumés successifs « arrondissent » les détails : 35,90 € devient « un petit montant », le 12 mars devient « bientôt ». On protège donc les faits critiques en dehors des résumés."
          },
          {
            p: "<i>Exemple de bloc « case facts » injecté dans chaque prompt :</i>"
          },
          {
            code: "FAITS DU DOSSIER (ne pas résumer)\n- Client : C-1029 (vérifié)\n- Commande 8841 : double prélèvement, 2 × 59,90 €\n- Commande 8850 : colis abîmé, photo reçue le 2026-03-04\n- Attente du client : remboursement avant le 2026-03-12"
          },
          {
            p: "<i>Exemple d’élagage :</i> d’une réponse <code>lookup_order</code> de 42 champs, ne garder que <code>order_id</code>, <code>status</code>, <code>delivery_date</code>, <code>amount</code>, <code>return_window</code>."
          },
          {
            p: "<i>Piège classique :</i> placer l’information clé au milieu d’un long document agrégé ; elle risque d’être ignorée (effet « lost in the middle »)."
          }
        ]
      }
    ]
  },
  {
    d: 5,
    o: ["5.2"],
    title: "Escalade et résolution des ambiguïtés",
    summary: "Escalader pour les bonnes raisons, honorer la demande du client et demander plutôt que deviner.",
    sections: [
      {
        h: "Déclencheurs d’escalade",
        lvl: "essentiel",
        points: ["<b>Demande explicite d’un humain</b> par le client : l’honorer immédiatement, sans investiguer d’abord.", "<b>Lacunes de politique</b> : la politique est muette ou ambiguë sur la demande (alignement sur le prix d’un concurrent quand la politique ne parle que des ajustements sur le site). Ce sont les exceptions, pas seulement la complexité, qui justifient l’escalade.", "<b>Incapacité à progresser</b>."]
      },
      {
        h: "Frustration et cas simples",
        lvl: "essentiel",
        p: "Un client frustré mais dont le problème est simple et à la portée de l’agent : reconnaître la frustration, proposer la résolution, et n’escalader que s’il réitère sa demande."
      },
      {
        h: "Indicateurs peu fiables",
        lvl: "essentiel",
        points: ["<b>Escalade fondée sur le sentiment peu fiable</b> : le sentiment ne reflète pas la complexité du cas.", "<b>Confiance auto-déclarée peu fiable</b> : un modèle mal calibré est justement trop confiant sur les cas difficiles.", "La parade proportionnée : des <b>critères d’escalade explicites</b> avec des exemples few-shot dans le prompt système, avant d’ajouter de l’infrastructure (classifieur)."]
      },
      {
        h: "Correspondances multiples et identifiants supplémentaires",
        lvl: "essentiel",
        p: "Si <code>get_customer</code> renvoie plusieurs clients, l’agent demande des <b>identifiants supplémentaires</b> (e-mail, numéro de commande) au lieu de choisir par heuristique."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Escalader trop souvent fait perdre l’intérêt de l’agent ; pas assez, et il prend des décisions qui ne lui reviennent pas. Les bons déclencheurs sont des faits (demande explicite, trou dans la politique, blocage), pas des impressions (ton du client, confiance annoncée par le modèle)."
          },
          {
            p: "<i>Exemples :</i>"
          },
          {
            points: ["<b>« Passez-moi un humain. »</b> : Escalade immédiate", "<b>« C’est la troisième fois que ça arrive, j’en ai marre ! » (article abîmé, cas standard)</b> : Reconnaître l’agacement, proposer le remplacement ; escalader s’il redemande un humain", "<b>« Vous pouvez vous aligner sur le prix de votre concurrent ? » (politique muette)</b> : Escalade : la politique ne couvre pas ce cas", "<b><code>get_customer</code> renvoie trois « Martin Durand »</b> : Demander l’e-mail ou un numéro de commande"]
          },
          {
            p: "<i>Piège classique :</i> escalader dès qu’un sentiment négatif est détecté ; la colère n’indique pas la complexité."
          }
        ]
      }
    ]
  },
  {
    d: 5,
    o: ["5.3"],
    title: "Propagation des erreurs entre agents",
    summary: "Remonter des erreurs riches et exploitables, sans les masquer ni tout arrêter.",
    sections: [
      {
        h: "Contexte d’erreur structuré",
        lvl: "essentiel",
        p: "Le sous-agent en échec renvoie un <b>contexte d’erreur structuré</b> : type d’échec, requête tentée, résultats partiels, alternatives possibles. Le coordinateur peut alors réessayer autrement, changer d’approche ou poursuivre avec les résultats partiels."
      },
      {
        h: "Échec d’accès ou résultat vide valide",
        lvl: "essentiel",
        p: "Un délai dépassé (échec d’accès, qui appelle une décision de nouvelle tentative) et une recherche réussie sans résultat (résultat vide valide) doivent être distingués dans le rapport d’erreur."
      },
      {
        h: "Anti-patterns",
        lvl: "essentiel",
        points: ["<b>Statuts d’erreur génériques</b> (« search unavailable ») : ils cachent au coordinateur l’information utile.", "<b>Erreurs supprimées en silence</b> : renvoyer un résultat vide marqué comme succès empêche toute reprise.", "<b>Arrêt complet sur un seul échec</b> : terminer tout le workflow alors qu’une reprise était possible.", "Le sous-agent traite localement les échecs transitoires et ne remonte que ce qu’il ne peut résoudre."]
      },
      {
        h: "Annotations de couverture",
        lvl: "avancé",
        p: "La synthèse finale indique, par des <b>annotations de couverture</b>, quels résultats sont bien étayés et quelles zones restent lacunaires faute de sources disponibles."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Dans un système multi-agents, une erreur doit voyager avec son contexte : ce qui a échoué, ce qui a été tenté, ce qui a quand même été obtenu. Le coordinateur peut alors décider : réessayer autrement, poursuivre avec des résultats partiels ou signaler une lacune."
          },
          {
            p: "<i>Exemple de rapport d’erreur d’un sous-agent :</i>"
          },
          {
            code: "{\n  \"statut\": \"partiel\",\n  \"type_echec\": \"timeout\",\n  \"requete\": \"réglementation européenne IA 2025\",\n  \"tentatives\": 2,\n  \"resultats_partiels\": [{\"affirmation\": \"…\", \"source\": \"…\"}],\n  \"alternatives\": [\"chercher dans la base documentaire interne\", \"élargir à 2024\"]\n}"
          },
          {
            p: "<i>Piège classique :</i> renvoyer <code>[]</code> avec un statut « succès » après un délai dépassé ; le coordinateur conclut qu’il n’existe aucune donnée sur le sujet."
          }
        ]
      }
    ]
  },
  {
    d: 5,
    o: ["5.4"],
    title: "Contexte et exploration d’une grande base de code",
    summary: "Détecter la dégradation du contexte et la contrer : scratchpad, sous-agents, manifestes, /compact.",
    sections: [
      {
        h: "Dégradation du contexte",
        lvl: "essentiel",
        p: "Dans une longue session, le modèle donne des réponses incohérentes et parle de « motifs typiques » au lieu des classes précises découvertes plus tôt : c’est le signe d’une <b>dégradation du contexte</b>."
      },
      {
        h: "Fichiers scratchpad et délégation à des sous-agents",
        lvl: "essentiel",
        points: ["<b>Fichiers scratchpad</b> : l’agent consigne les résultats clés dans un fichier et s’y réfère ensuite.", "<b>Délégation à des sous-agents</b> pour les questions précises (« trouve tous les fichiers de test », « trace les dépendances du flux de remboursement ») : l’agent principal garde la vue d’ensemble.", "Résumer une phase d’exploration avant de lancer les sous-agents de la phase suivante, et injecter ce résumé dans leur contexte initial."]
      },
      {
        h: "Persistance d’état et manifeste",
        lvl: "avancé",
        p: "Pour la <b>reprise après crash</b>, chaque agent exporte son état à un emplacement connu ; le coordinateur charge un <b>manifeste</b> à la reprise et l’injecte dans les prompts des agents."
      },
      {
        h: "/compact",
        lvl: "essentiel",
        p: "<code>/compact</code> réduit l’usage du contexte quand il se remplit de sorties de découverte verbeuses pendant une longue exploration."
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Sur une grande base de code, le contexte se remplit vite de sorties de recherche. Signe d’alerte : Claude parle de « services typiques » au lieu de citer <code>PaymentRetryService</code>, qu’il avait pourtant trouvé. Il faut alors externaliser la mémoire et déléguer."
          },
          {
            p: "*Exemple de fichier scratchpad (<code>NOTES.md</code>) :*"
          },
          {
            code: ""
          }
        ]
      }
    ]
  },
  {
    d: 5,
    o: ["5.5"],
    title: "Revue humaine et calibration de la confiance",
    summary: "Ne pas se fier à une exactitude globale : segmenter, échantillonner et calibrer avant d’automatiser.",
    sections: [
      {
        h: "Métriques d’exactitude agrégées trompeuses",
        lvl: "essentiel",
        p: "97 % d’exactitude globale peut cacher un type de document ou un champ très mal traité. Il faut l’<b>exactitude par type de document et par champ</b> avant de réduire la revue humaine."
      },
      {
        h: "Échantillonnage aléatoire stratifié",
        lvl: "essentiel",
        p: "Même les extractions à haute confiance sont échantillonnées, par strates (types de documents, champs), pour mesurer le taux d’erreur en continu et détecter de nouveaux motifs d’erreur."
      },
      {
        h: "Scores de confiance par champ",
        lvl: "essentiel",
        points: ["Le modèle produit un score de confiance pour chaque champ.", "Les seuils de revue sont calibrés sur des <b>jeux de validation étiquetés</b>.", "<b>Routage vers la revue humaine</b> : faible confiance, documents ambigus ou contradictoires, en priorisant une capacité de relecture limitée."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Une exactitude globale élevée peut cacher un point faible. Avant de retirer les humains de la boucle, on vérifie segment par segment, et on continue à échantillonner même ce qui semble sûr."
          },
          {
            p: "<i>Exemple :</i>"
          },
          {
            points: ["<b>Factures françaises</b> — Volume : 9 000 ; Exactitude : 99 %", "<b>Factures étrangères</b> — Volume : 800 ; Exactitude : 81 %", "<b>Notes de frais manuscrites</b> — Volume : 200 ; Exactitude : 64 %", "<b><b>Global</b></b> — Volume : 10 000 ; Exactitude : <b>97 %</b>"]
          },
          {
            p: "Le 97 % global masque deux segments qui exigent encore une revue humaine."
          },
          {
            p: "<i>Exemple de routage :</i> champ <code>montant</code> avec confiance &lt; 0,85 (seuil calibré sur un jeu étiqueté) → revue humaine ; document marqué contradictoire → revue prioritaire ; un échantillon aléatoire stratifié des extractions à haute confiance → contrôle qualité continu."
          },
          {
            p: "<i>Piège classique :</i> se fier à la confiance que le modèle annonce sans l’avoir calibrée sur des données dont on connaît la bonne réponse."
          }
        ]
      }
    ]
  },
  {
    d: 5,
    o: ["5.6"],
    title: "Provenance de l’information et incertitude",
    summary: "Garder le lien entre chaque affirmation et sa source, et présenter honnêtement les désaccords.",
    sections: [
      {
        h: "Perte d’attribution lors de la synthèse",
        lvl: "essentiel",
        p: "Quand les résultats sont compressés en résumé, le lien affirmation-source disparaît. Parade : des <b>correspondances affirmation-source</b> structurées (URL, nom du document, extrait) que chaque agent en aval préserve et fusionne."
      },
      {
        h: "Statistiques contradictoires",
        lvl: "essentiel",
        points: ["Deux sources crédibles donnent des chiffres différents : annoter le conflit avec l’attribution des deux sources, ne pas choisir arbitrairement.", "L’analyse des documents se termine avec les valeurs contradictoires annotées ; le coordinateur décide de la réconciliation avant la synthèse."]
      },
      {
        h: "Données temporelles",
        lvl: "essentiel",
        p: "Exiger les dates de publication ou de collecte : deux chiffres de dates différentes ne sont pas forcément contradictoires."
      },
      {
        h: "Résultats établis ou contestés et rendu adapté au type de contenu",
        lvl: "essentiel",
        points: ["Séparer dans le rapport les résultats bien établis et les résultats contestés, en gardant la caractérisation et le contexte méthodologique des sources.", "Rendu adapté au type de contenu : données financières en tableaux, actualités en prose, résultats techniques en listes structurées."]
      },
      {
        h: "En pratique : explications, exemples et pièges",
        lvl: "complément",
        blocks: [
          {
            p: "Chaque résumé est une occasion de perdre une source. On conçoit donc les sorties des sous-agents pour que chaque affirmation garde son origine et sa date jusqu’au rapport final, et on montre les désaccords au lieu de les cacher."
          },
          {
            p: "<i>Exemple de présentation d’un conflit dans le rapport :</i>"
          },
          {
            p: "<i>Taille du marché européen en 2025 : <b>12 Md€</b> selon l’Institut A (rapport publié en janvier 2026, méthode : enquête auprès des fabricants) ; <b>9,5 Md€</b> selon le Cabinet B (octobre 2025, méthode : données douanières). L’écart s’explique en partie par le périmètre retenu.</i>"
          },
          {
            p: "<i>Exemple de rendu adapté :</i> chiffres financiers en tableau, actualité en prose courte, résultats techniques en liste."
          },
          {
            p: "<i>Piège classique :</i> faire la moyenne des deux chiffres, ou garder le plus récent sans le dire ; le lecteur perd l’information qu’il existe un désaccord."
          }
        ]
      }
    ]
  }
];
