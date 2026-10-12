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
        points: ["Un <b>coordinateur</b> au centre gère toute la communication entre sous-agents, la gestion des erreurs et le routage de l’information.", "Les sous-agents ne se parlent pas directement : tout passe par le coordinateur, pour l’<b>observabilité</b>, une gestion d’erreurs homogène et un flux d’information maîtrisé.", "<b>Contexte isolé des sous-agents</b> : un sous-agent n’hérite pas automatiquement de l’historique du coordinateur ; il ne sait que ce qu’on lui transmet."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le terme vient du transport aérien : tous les vols passent par un aéroport central. Ici, le coordinateur est ce centre. Chaque sous-agent reçoit sa mission du coordinateur et lui rend son résultat ; il ne sait même pas que les autres existent. Cette contrainte paraît limitante, mais elle rend le système lisible : il suffit de lire les échanges du coordinateur pour comprendre tout ce qui s’est passé, et une erreur n’a qu’un seul endroit où être traitée."
          },
          {
            p: "<i>Exemple :</i> dans un système de recherche, le sous-agent web trouve un article, le coordinateur le transmet au sous-agent d’analyse avec la consigne « extrais les chiffres clés et leur source », puis transmet le résultat au sous-agent de synthèse. Si l’analyse échoue, c’est le coordinateur qui décide : relancer, utiliser une autre source ou signaler une lacune."
          }
        ]
      },
      {
        h: "Rôle du coordinateur",
        lvl: "essentiel",
        points: ["Décomposer la demande, déléguer, agréger les résultats.", "<b>Sélection dynamique des sous-agents</b> : analyser la demande et n’invoquer que les sous-agents utiles, au lieu de faire passer chaque requête par tout le pipeline.", "Répartir le périmètre pour limiter les doublons : sous-thèmes distincts ou types de sources distincts par sous-agent."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le coordinateur fait quatre métiers à la fois : il <b>comprend</b> la demande, la <b>découpe</b> en missions, <b>choisit</b> qui les exécute et <b>assemble</b> les résultats en contrôlant leur qualité. Le choix dynamique est important : une question factuelle simple ne mérite pas de mobiliser tout le pipeline, alors qu’un rapport complet exige recherche, analyse et synthèse."
          },
          {
            p: "<i>Exemple :</i> « Quelle est la date de publication du rapport X ? » → le coordinateur appelle seulement le sous-agent de recherche. « Rédige un état de l’art sur X » → il découpe en sous-thèmes, lance plusieurs recherches en parallèle, fait analyser les documents, puis lance la synthèse."
          }
        ]
      },
      {
        h: "Décomposition trop étroite",
        lvl: "essentiel",
        p: "Si le coordinateur découpe un sujet large en sous-tâches trop étroites, chaque sous-agent fait bien son travail mais le rapport final a des <b>trous</b>. Exemple : un sujet sur « les industries créatives » découpé uniquement en arts visuels oublie la musique ou l’écriture. Le diagnostic se fait dans les journaux du coordinateur : la cause est la décomposition, pas les sous-agents en aval.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> C’est l’erreur la plus sournoise des systèmes multi-agents, car tout semble fonctionner : chaque sous-agent répond correctement à la question qu’on lui a posée. Le défaut est en amont, dans la liste des questions. Pour la détecter, on compare la décomposition au périmètre réel du sujet ; pour la prévenir, on demande au coordinateur de lister explicitement les dimensions du sujet (secteurs, zones, périodes, points de vue) avant de créer les sous-tâches."
          },
          {
            p: "<i>Exemple :</i> sujet « l’impact du télétravail ». Décomposition trop étroite : productivité, outils numériques, visioconférence. Oubliés : immobilier de bureau, santé mentale, transports, inégalités entre métiers. Le rapport final sera bien écrit… et incomplet."
          }
        ]
      },
      {
        h: "Boucles de raffinement itératif",
        lvl: "avancé",
        p: "Le coordinateur évalue la synthèse, repère les lacunes, relance les sous-agents de recherche et d’analyse avec des requêtes ciblées, puis relance la synthèse, jusqu’à une couverture suffisante. C’est la réponse architecturale aux trous de couverture.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Une boucle de raffinement transforme le coordinateur en relecteur exigeant. Après une première synthèse, il la compare aux critères de qualité (toutes les dimensions couvertes ? chaque affirmation sourcée ? données récentes ?) et relance des recherches ciblées sur les manques. Il faut une condition d’arrêt claire, fondée sur la couverture, pour ne pas boucler indéfiniment."
          },
          {
            p: "<i>Exemple :</i> la synthèse ne contient aucune donnée postérieure à 2024 sur la réglementation. Le coordinateur relance le sous-agent web avec « textes réglementaires européens adoptés depuis 2025 », fait analyser les deux documents trouvés, puis relance la synthèse en lui transmettant les nouveaux éléments."
          }
        ]
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
        points: ["Dans le Claude Agent SDK, un coordinateur lance un sous-agent par l’<b>outil Task</b>.", "Pour qu’il puisse le faire, sa configuration <code>allowedTools</code> doit contenir <code>\"Task\"</code> : sans cela, il ne peut invoquer aucun sous-agent.", "Chaque type de sous-agent est décrit par une <b>AgentDefinition</b> : description (quand l’utiliser), prompt système et restrictions d’outils."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Pour le coordinateur, lancer un sous-agent est une action comme une autre : elle passe par un outil, l’outil Task. Comme tout outil, il doit être autorisé. Si <code>allowedTools</code> ne contient pas <code>\"Task\"</code>, le coordinateur peut bien vouloir déléguer, il n’en a pas la possibilité, et l’agent fait tout lui-même ou échoue. L’AgentDefinition, de son côté, décrit chaque spécialiste : quand l’utiliser, avec quel prompt, avec quels outils."
          },
          {
            p: "<i>Exemple :</i> un coordinateur configuré avec <code>allowedTools: [\"Read\", \"Grep\"]</code> ne lancera jamais ses sous-agents de recherche ; l’ajout de <code>\"Task\"</code> à la liste règle le problème. Un sous-agent « relecteur » défini avec des outils en lecture seule ne pourra pas modifier de fichier, même par erreur."
          }
        ]
      },
      {
        h: "Passage explicite du contexte",
        lvl: "essentiel",
        points: ["Un sous-agent n’hérite pas du contexte parent et ne partage pas de mémoire entre invocations : tout ce dont il a besoin doit être <b>dans son prompt</b>.", "Exemple : le sous-agent de synthèse reçoit directement les résultats complets de la recherche web et de l’analyse de documents.", "Utiliser un <b>format structuré</b> qui sépare le contenu des métadonnées (URL source, nom du document, numéro de page) pour préserver l’attribution."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un sous-agent est comme un consultant externe qu’on appelle pour une mission : il ne connaît rien de ce qui s’est dit avant son arrivée. Tout ce dont il a besoin doit figurer dans sa lettre de mission. Le format compte aussi : en séparant le contenu (la citation, le chiffre) des métadonnées (la source, la page, la date), on permet au sous-agent suivant de citer correctement."
          },
          {
            p: "<i>Exemple :</i> mauvais prompt de synthèse : « Fais la synthèse de ce qu’on a trouvé. » Bon prompt : l’objectif, le public, la longueur attendue, puis la liste complète des résultats, chacun sous la forme {affirmation, extrait, source, date}."
          }
        ]
      },
      {
        h: "Sous-agents en parallèle",
        lvl: "essentiel",
        p: "Pour lancer plusieurs sous-agents en parallèle, le coordinateur émet <b>plusieurs appels de l’outil Task dans une seule réponse</b>, au lieu d’un appel par tour. Ses instructions fixent les <b>objectifs et critères de qualité</b> plutôt que des procédures pas à pas, pour laisser chaque sous-agent s’adapter à ce qu’il découvre.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le parallélisme ne se décrète pas dans le prompt : il découle de la façon dont le coordinateur émet ses appels. S’il appelle l’outil Task trois fois dans la même réponse, les trois sous-agents travaillent en même temps ; s’il les appelle un par un sur trois tours, ils s’enchaînent. Pour les tâches indépendantes, le gain de temps est direct. Les consignes du coordinateur doivent fixer des objectifs et des critères de qualité, pas une procédure figée, pour que chaque sous-agent s’adapte à ce qu’il trouve."
          },
          {
            p: "<i>Exemple :</i> trois sous-thèmes indépendants à rechercher, chacun prenant environ une minute : en séquence, trois minutes ; en parallèle, une minute environ, plus la synthèse."
          }
        ]
      },
      {
        h: "Sessions dérivées (fork)",
        lvl: "avancé",
        p: "La gestion de sessions par dérivation (<i>fork</i>) permet de partir d’une même analyse de base et d’explorer des approches divergentes dans des branches indépendantes (voir aussi <code>fork_session</code>, objectif 1.7).",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Dériver une session, c’est faire une photocopie de l’état de travail pour explorer une autre piste sans abîmer l’original. L’intérêt est double : on ne refait pas l’analyse initiale (temps et tokens économisés), et les deux pistes ne se contaminent pas mutuellement."
          },
          {
            p: "<i>Exemple :</i> une analyse de 40 minutes a cartographié un module legacy. On dérive deux sessions : l’une teste une stratégie de tests unitaires, l’autre une stratégie de tests d’intégration. On compare ensuite les deux propositions sur les mêmes critères."
          }
        ]
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
        points: ["<b>Guidage par prompt</b> : « vérifie toujours l’identité avant un remboursement ». Le modèle le respecte la plupart du temps, mais avec un <b>taux d’échec non nul</b>.", "<b>Contrôle programmatique</b> : hooks et <b>prérequis bloquants</b> qui empêchent techniquement un appel d’outil tant qu’une étape n’est pas faite.", "Règle : quand une conformité <b>déterministe</b> est exigée (opération financière, identité), le prompt seul ne suffit pas.", "Exemple type : bloquer <code>process_refund</code> (et <code>lookup_order</code> si besoin) tant que <code>get_customer</code> n’a pas renvoyé un identifiant client vérifié."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un prompt bien écrit fait respecter une règle dans l’immense majorité des cas, mais « l’immense majorité » n’est pas « toujours ». Pour une règle de confort (le ton, le format), c’est suffisant. Pour une règle dont la violation coûte de l’argent ou enfreint une obligation légale, il faut que le code rende la violation impossible. Le prompt garde son utilité : il explique au modèle l’ordre attendu, ce qui réduit les blocages."
          },
          {
            p: "<i>Exemple :</i> règle « vérifier l’identité avant toute consultation de commande ». Avec le prompt seul : quelques oublis sur des milliers de conversations. Avec un prérequis programmatique : l’outil <code>lookup_order</code> renvoie « client non vérifié : appelez d’abord get_customer » tant que l’identifiant vérifié n’est pas enregistré dans la session."
          }
        ]
      },
      {
        h: "Demandes multi-sujets",
        lvl: "essentiel",
        p: "Un client écrit pour un remboursement <i>et</i> un changement d’adresse <i>et</i> une question de facturation. L’agent décompose la demande en éléments distincts, instruit chacun (éventuellement en parallèle, avec un contexte partagé), puis <b>synthétise une réponse unique</b>.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Les clients écrivent rarement pour une seule chose. Traiter seulement le premier sujet frustre le client et provoque un second contact ; tout traiter en vrac produit des réponses confuses. La bonne méthode est de lister les sujets, de les instruire chacun avec le contexte commun (client vérifié, historique), puis de rédiger une réponse unique et structurée."
          },
          {
            p: "<i>Exemple :</i> « Ma commande 4512 est arrivée cassée, et je n’ai toujours pas reçu le remboursement de la 3987. » → sujet 1 : remplacement ou remboursement de la 4512 ; sujet 2 : état du remboursement de la 3987. Réponse : un paragraphe par sujet, avec l’action engagée pour chacun."
          }
        ]
      },
      {
        h: "Transmission structurée",
        lvl: "essentiel",
        points: ["Lors d’une escalade en cours de traitement, l’agent humain <b>n’a pas accès à la conversation</b>.", "Le résumé de transmission doit donc être autoportant : identifiant client, cause racine analysée, montant concerné, action recommandée.", "Un résumé vague (« client mécontent, à rappeler ») oblige l’humain à tout reprendre."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Une escalade réussie est celle où l’humain peut agir en trente secondes, sans relire la conversation. Le résumé de transmission est donc un document de travail, pas un récit : il donne l’identité vérifiée, ce qui s’est passé, ce qui a été tenté, ce qui bloque et ce qui est recommandé."
          },
          {
            p: "<i>Exemple :</i> « Client C-1029 (vérifié). Litige : double prélèvement de 59,90 € sur la commande 8841 (relevé bancaire fourni). Tenté : vérification des paiements, deux transactions acceptées. Bloquant : remboursement supérieur au plafond automatique. Recommandé : rembourser une transaction et confirmer au client par e-mail. »"
          }
        ]
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
        p: "Un hook <code>PostToolUse</code> intercepte le résultat d’un outil <b>avant que le modèle ne le traite</b>. Usage typique : la <b>normalisation des formats</b> hétérogènes renvoyés par différents outils MCP (timestamps Unix, dates ISO 8601, codes de statut numériques) vers un format unique, pour que le modèle ne raisonne pas sur des représentations incohérentes.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Les systèmes réels sont hétérogènes : un service renvoie des timestamps Unix, un autre des dates ISO 8601, un troisième des codes numériques. Demander au modèle de jongler avec ces formats, c’est l’exposer à des erreurs de calcul (délais, comparaisons). Le hook PostToolUse agit comme un traducteur : il reçoit chaque résultat d’outil et le met dans un format unique avant que le modèle ne le lise."
          },
          {
            p: "<i>Exemple :</i> <code>lookup_order</code> renvoie <code>{\"shipped_at\": 1709251200, \"status\": 3}</code>. Après le hook, le modèle lit <code>{\"expedie_le\": \"2024-03-01\", \"statut\": \"livré\"}</code> et peut calculer correctement que le délai de retour de 30 jours est dépassé."
          }
        ]
      },
      {
        h: "Interception des appels sortants",
        lvl: "essentiel",
        points: ["Un hook peut intercepter un appel d’outil <b>sortant</b>, avant son exécution, pour appliquer des <b>règles de conformité</b>.", "Exemple : bloquer tout remboursement de plus de 500 $ et opérer une <b>redirection vers l’escalade</b> humaine.", "Le modèle reçoit alors l’information que l’action est refusée et pourquoi, et peut poursuivre par le bon workflow."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Intercepter un appel sortant, c’est placer un contrôleur entre la décision du modèle et l’action réelle. Le contrôleur lit les paramètres, applique les règles métier et décide : laisser passer, bloquer, ou rediriger. La redirection est la clé d’une bonne expérience : au lieu d’un simple refus, le modèle apprend quelle voie suivre."
          },
          {
            p: "<i>Exemple :</i> le modèle appelle <code>process_refund</code> avec 750 $. Le hook bloque l’appel et renvoie : « Montant supérieur au plafond de 500 $ : utilisez escalate_to_human avec le motif et le montant. » Le modèle enchaîne alors sur l’escalade."
          }
        ]
      },
      {
        h: "Garanties déterministes",
        lvl: "essentiel",
        p: "Différence clé : un hook donne des <b>garanties déterministes</b> (il s’exécute à chaque fois), une consigne dans le prompt ne donne qu’une conformité <b>probabiliste</b>. Quand une règle métier exige une conformité garantie, on choisit le hook.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> « Déterministe » signifie : même situation, même résultat, à chaque fois. Un hook est du code ; s’il est correct, il bloque toujours ce qu’il doit bloquer. Une instruction de prompt est interprétée par un modèle ; elle sera suivie la plupart du temps. Le critère de choix est donc le coût d’une seule violation : s’il est inacceptable, la règle va dans un hook."
          },
          {
            p: "<i>Exemple :</i> « Réponds en français » : un oubli occasionnel est sans gravité, le prompt suffit. « Aucun remboursement sans client vérifié » : un seul oubli peut créer une fraude, il faut un hook ou un prérequis programmatique."
          }
        ]
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
        points: ["Suite d’étapes fixes et prévisibles, chacune avec un prompt ciblé.", "Adapté aux revues à plusieurs aspects connus d’avance.", "Exemple : analyser chaque fichier séparément, puis faire une passe d’intégration entre fichiers."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le prompt chaining découpe une tâche en étapes fixes, chacune avec un prompt court et ciblé. Chaque étape est plus simple à écrire, à tester et à améliorer qu’un prompt géant qui ferait tout. On peut aussi insérer des contrôles entre les étapes (valider un format, arrêter si une condition n’est pas remplie)."
          },
          {
            p: "<i>Exemple :</i> revue de pull request en trois étapes : 1) pour chaque fichier, lister les problèmes locaux ; 2) sur l’ensemble, chercher les incohérences entre fichiers ; 3) produire le rapport final en dédoublonnant et en classant par sévérité."
          }
        ]
      },
      {
        h: "Décomposition dynamique adaptative",
        lvl: "essentiel",
        points: ["Les sous-tâches sont générées selon ce qui est découvert à chaque étape : des <b>plans d’investigation adaptatifs</b>.", "Adapté aux tâches ouvertes : « ajouter des tests complets à une base de code legacy ».", "Démarche : cartographier la structure, repérer les zones à fort impact, construire un plan priorisé qui s’ajuste aux dépendances découvertes."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Quand on ne sait pas à l’avance ce qu’on va trouver, un plan figé est une illusion. La décomposition adaptative commence par une reconnaissance (cartographier, mesurer), produit un premier plan priorisé, puis le révise à chaque découverte importante. C’est la démarche d’un consultant qui découvre un système inconnu."
          },
          {
            p: "<i>Exemple :</i> mission « ajouter des tests à une base legacy ». Étape 1 : cartographie, 120 modules, dont 8 critiques pour la facturation. Étape 2 : plan, commencer par ces 8 modules. Étape 3 : découverte, deux modules dépendent d’un service externe non simulé ; on insère une tâche « créer une simulation du service » avant de continuer."
          }
        ]
      },
      {
        h: "Passes par fichier et passe d’intégration",
        lvl: "essentiel",
        p: "Une revue de nombreux fichiers en une seule passe souffre de <b>dilution de l’attention</b> : analyses inégales, bugs manqués, avis contradictoires. Le remède est structurel : des <b>passes par fichier</b> pour les problèmes locaux, puis une <b>passe d’intégration</b> séparée pour les flux de données entre fichiers.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Plus on donne de fichiers à analyser en une seule fois, plus l’attention se répartit mal : certains fichiers sont examinés en détail, d’autres survolés, et le même motif peut être jugé différemment selon l’endroit. En séparant l’analyse locale (un fichier à la fois, même grille de lecture) de l’analyse globale (les échanges entre fichiers), on obtient une qualité homogène."
          },
          {
            p: "<i>Exemple :</i> une PR modifie un service, son contrôleur et ses tests. Passes locales : erreurs dans chaque fichier. Passe d’intégration : le contrôleur appelle le service avec un paramètre renommé dans la PR, ce qu’aucune passe locale ne pouvait voir."
          }
        ]
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
        points: ["<code>--resume &lt;nom-de-session&gt;</code> reprend une conversation précise, utile pour poursuivre une investigation nommée d’une séance de travail à l’autre.", "Si des fichiers déjà analysés ont changé depuis, il faut <b>informer des fichiers modifiés</b> l’agent : il pourra faire une ré-analyse ciblée au lieu de tout ré-explorer."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Nommer une session, c’est lui donner une étiquette qu’on retrouve facilement (« audit-paiements », « migration-auth »). La reprise conserve tout le contexte accumulé : fichiers lus, conclusions, décisions. Si le code a changé entre-temps, ce contexte devient partiellement faux ; signaler précisément les fichiers modifiés permet à l’agent de mettre à jour seulement ce qui doit l’être."
          },
          {
            p: "<i>Exemple :</i> lundi, investigation « fuite-memoire » sur le service de cache. Mardi, un collègue corrige <code>cache/pool.py</code>. Reprise avec <code>--resume fuite-memoire</code> et la consigne : « pool.py a été modifié ce matin : relis-le et dis-moi si la fuite est toujours possible. »"
          }
        ]
      },
      {
        h: "Dérivation avec fork_session",
        lvl: "essentiel",
        p: "<code>fork_session</code> crée une branche indépendante à partir d’une analyse commune. Exemple : comparer deux stratégies de test ou deux approches de refactoring à partir de la même analyse du code, sans que l’une pollue l’autre.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> <code>fork_session</code> crée une nouvelle session qui part de l’état d’une session existante. L’original reste intact : on peut y revenir ou en dériver d’autres. C’est l’outil des comparaisons : mêmes connaissances de départ, choix différents, résultats comparables."
          },
          {
            p: "<i>Exemple :</i> après l’analyse d’un module de paiement, deux dérivations : l’une explore un refactoring par extraction de classes, l’autre par introduction d’une interface. Chaque dérivation produit un plan et une estimation de risque, que l’on compare côte à côte."
          }
        ]
      },
      {
        h: "Reprendre ou repartir de zéro",
        lvl: "essentiel",
        points: ["<b>Reprendre</b> quand le contexte antérieur est encore largement valide.", "Démarrer une <b>nouvelle session avec résumé structuré</b> quand les <b>résultats d’outils périmés</b> dominent (code beaucoup modifié depuis) : un résumé injecté est plus fiable qu’un historique rempli de lectures obsolètes."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> La question à se poser : « ce que l’agent a lu est-il encore vrai ? » Si oui, reprendre fait gagner du temps. Si non, l’historique devient un piège : le modèle raisonne sur l’ancienne version des fichiers, parfois sans s’en rendre compte. Repartir avec un résumé structuré (conclusions encore valides, questions ouvertes, fichiers à relire) est alors plus fiable."
          },
          {
            p: "<i>Exemple :</i> après un gros refactoring qui a renommé la moitié des classes, on démarre une nouvelle session avec : « Contexte : le module paiement est désormais organisé en trois services (liste). Conclusions encore valides : … Questions ouvertes : … »"
          }
        ]
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
        points: ["Le modèle choisit un outil d’abord d’après sa <b>description</b>. Une description minimale (« Récupère les infos client ») rend la <b>sélection des outils</b> peu fiable entre outils proches.", "Une bonne description indique : objet, <b>formats d’entrée et exemples</b> de requêtes, cas limites, sorties, et <b>quand l’utiliser plutôt qu’un outil voisin</b>.", "Améliorer les descriptions est souvent la <b>première correction</b>, la moins coûteuse, avant d’ajouter des exemples, une couche de routage ou de fusionner des outils."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le modèle ne voit pas le code de vos outils, seulement leur nom, leur description et leur schéma. Choisir un outil revient donc pour lui à lire des fiches produit. Une fiche vague (« récupère des informations ») ne permet pas de choisir ; une fiche précise (ce que fait l’outil, ce qu’il attend, ce qu’il renvoie, quand préférer un autre outil) rend le choix évident."
          },
          {
            p: "<i>Exemple :</i> <code>search_kb</code> : « Recherche dans la base de connaissances interne (articles d’aide validés). Entrée : question en langage naturel. Renvoie les 3 articles les plus pertinents avec leur titre et un extrait. Ne couvre pas les commandes des clients : pour une commande précise, utiliser lookup_order. »"
          }
        ]
      },
      {
        h: "Chevauchement fonctionnel",
        lvl: "essentiel",
        points: ["Deux outils aux descriptions presque identiques (<code>analyze_content</code> et <code>analyze_document</code>) provoquent des erreurs d’aiguillage.", "Correctif : renommer et préciser (<code>analyze_content</code> devient <code>extract_web_results</code>, avec une description propre au web)."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Deux outils qui semblent faire la même chose obligent le modèle à deviner. Le chevauchement vient souvent de l’histoire du projet : un outil ajouté pour un besoin, puis un autre presque identique pour un besoin voisin. La correction passe par un nom qui dit précisément l’usage et une description qui trace la frontière."
          },
          {
            p: "<i>Exemple :</i> <code>get_data</code> et <code>fetch_info</code> interrogent tous deux le CRM. On les renomme <code>get_customer_profile</code> (identité, coordonnées, statut) et <code>get_customer_orders</code> (historique des commandes), avec une phrase de frontière dans chaque description."
          }
        ]
      },
      {
        h: "Découpage en outils spécialisés",
        lvl: "essentiel",
        p: "Un outil générique fait tout et mal. On le scinde en outils aux contrats d’entrée et de sortie définis : par exemple <code>analyze_document</code> devient <code>extract_data_points</code>, <code>summarize_content</code> et <code>verify_claim_against_source</code>.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un outil générique avec un paramètre « mode » ou « action » cache plusieurs outils en un. Le modèle doit alors choisir l’outil puis le bon mode, et les schémas deviennent flous. Des outils spécialisés, chacun avec un contrat d’entrée et de sortie précis, sont plus simples à choisir, à valider et à tester."
          },
          {
            p: "<i>Exemple :</i> <code>manage_ticket(action, ...)</code> devient <code>create_ticket(titre, description, priorite)</code>, <code>update_ticket_status(ticket_id, statut)</code> et <code>add_ticket_comment(ticket_id, commentaire)</code>."
          }
        ]
      },
      {
        h: "Formulation du prompt système",
        lvl: "avancé",
        p: "Le prompt système peut contrecarrer de bonnes descriptions : une consigne sensible à un mot-clé (« pour toute question sur une commande, utilise… ») crée des associations involontaires. Relire le prompt système fait partie du diagnostic d’une mauvaise sélection d’outil.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le prompt système est lu à chaque décision. Une phrase comme « pour toute question sur un compte, utilise get_customer » s’applique aussi à « quel est le statut de la commande du compte de Marie ? », alors que l’outil de commande était le bon choix. Les règles d’usage d’un outil ont leur place dans sa description ; le prompt système doit éviter les associations par mot-clé trop larges."
          },
          {
            p: "<i>Exemple :</i> remplacer « Pour tout ce qui concerne un client, appelle get_customer » par « Identifie d’abord le client avec get_customer quand son identité n’est pas encore connue », plus précis et compatible avec les autres outils."
          }
        ]
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
        code: "{\n  \"isError\": true,\n  \"content\": [{ \"type\": \"text\", \"text\": \"{\\\"errorCategory\\\": \\\"transient\\\", \\\"isRetryable\\\": true, \\\"description\\\": \\\"Délai dépassé côté service commandes\\\"}\" }]\n}",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Sans drapeau d’erreur, un message comme « délai dépassé » renvoyé par l’outil ressemble à un résultat normal : le modèle peut le prendre pour une réponse et continuer sur une base fausse. Avec <code>isError</code>, le résultat est explicitement marqué comme un échec, et le contenu qui l’accompagne explique quoi en faire."
          },
          {
            p: "<i>Exemple :</i> un outil de recherche renvoie le texte « service indisponible » sans drapeau : l’agent répond au client « aucune information disponible ». Avec <code>isError: true</code> et une catégorie transitoire, l’agent réessaie ou prévient que la vérification est temporairement impossible."
          }
        ]
      },
      {
        h: "Erreurs transitoires, de validation, métier, de permission",
        lvl: "essentiel",
        points: ["<b>Transitoire</b> : délai dépassé, service indisponible ; une nouvelle tentative peut réussir.", "<b>Validation</b> : entrée invalide ; il faut corriger l’appel.", "<b>Métier</b> : violation de politique (remboursement hors délai) ; réessayer ne sert à rien.", "<b>Permission</b> : accès refusé.", "Une erreur uniforme (« Operation failed ») empêche l’agent de choisir la bonne réaction."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Ces quatre catégories appellent quatre réactions différentes, d’où l’importance de les distinguer. Transitoire : patienter et réessayer. Validation : corriger l’appel (format, valeur). Métier : expliquer la règle au client et proposer une alternative. Permission : ne pas insister, escalader si nécessaire."
          },
          {
            p: "<i>Exemple :</i> <code>process_refund</code> peut échouer pour un délai réseau (transitoire), un montant négatif (validation), une commande hors délai de retour (métier) ou un compte de service sans droit de remboursement (permission). Chaque cas doit produire un message d’erreur différent."
          }
        ]
      },
      {
        h: "Métadonnées d’erreur structurées",
        lvl: "essentiel",
        points: ["Renvoyer <code>errorCategory</code> (transient / validation / permission), un booléen <code>isRetryable</code> et une description lisible.", "Distinguer erreurs <b>réessayables ou non</b> évite des tentatives inutiles.", "Pour une règle métier : <code>retriable: false</code> et une explication compréhensible par le client, que l’agent pourra reformuler."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Des métadonnées structurées transforment un message d’erreur en décision automatisable : le champ <code>isRetryable</code> dit s’il faut réessayer, la catégorie dit quel type de réaction adopter, la description donne les mots à utiliser avec le client. Sans elles, le modèle doit interpréter un texte libre, avec le risque de réessayer une erreur définitive."
          },
          {
            p: "<i>Exemple :</i> <code>{\"errorCategory\": \"business\", \"isRetryable\": false, \"description\": \"La commande a été livrée il y a 45 jours ; le délai de retour est de 30 jours.\"}</code> : l’agent n’insiste pas et propose au client un geste commercial ou un transfert."
          }
        ]
      },
      {
        h: "Reprise locale et résultat vide valide",
        lvl: "essentiel",
        points: ["<b>Reprise locale</b> : le sous-agent gère lui-même les erreurs transitoires et ne remonte au coordinateur que ce qu’il ne peut pas résoudre, avec les résultats partiels et ce qu’il a tenté.", "Un <b>résultat vide valide</b> (requête réussie, zéro correspondance) n’est pas une erreur ; un échec d’accès en est une. Les confondre fausse les décisions de l’agent."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> La reprise locale évite d’alourdir le coordinateur avec des incidents qu’un sous-agent peut régler seul (un délai ponctuel, une page momentanément indisponible). Seuls les échecs persistants remontent, accompagnés de ce qui a été tenté. Et un résultat vide n’est pas un échec : « aucun résultat » est une information utile, qu’il ne faut pas confondre avec « impossible de chercher »."
          },
          {
            p: "<i>Exemple :</i> le sous-agent web subit un délai, réessaie deux fois avec succès : rien ne remonte. Une autre recherche ne trouve aucune publication sur un sujet très récent : elle renvoie une liste vide, sans erreur, et le coordinateur peut en conclure qu’il faut élargir la période."
          }
        ]
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
        points: ["Donner 18 outils à un agent au lieu de 4 ou 5 dégrade la fiabilité de sélection : la décision devient plus complexe.", "Un agent qui a des outils hors de sa spécialité les utilise à tort (un agent de synthèse qui se met à chercher sur le web)."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> À chaque tour, le modèle doit comparer tous ses outils pour choisir. Avec quatre outils bien distincts, le choix est rapide et fiable ; avec dix-huit outils dont certains se ressemblent, les erreurs augmentent et les descriptions consomment davantage de contexte. Un agent qui possède des outils hors de son rôle finit aussi par les utiliser à mauvais escient."
          },
          {
            p: "<i>Exemple :</i> un agent de synthèse disposant aussi de la recherche web lance des recherches pour « vérifier » chaque phrase, multiplie les appels et retarde le rapport. En lui retirant la recherche web, on le recentre sur la synthèse."
          }
        ]
      },
      {
        h: "Accès limité au rôle",
        lvl: "essentiel",
        points: ["Chaque sous-agent ne reçoit que les outils de son rôle.", "<b>Outils transverses ciblés</b> : pour un besoin fréquent, on donne un outil restreint (un <code>verify_fact</code> pour l’agent de synthèse) et on laisse les cas complexes passer par le coordinateur.", "<b>Outils contraints</b> : remplacer un outil générique par une version limitée, par exemple <code>fetch_url</code> par <code>load_document</code> qui valide les URL de documents."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Donner à chaque agent les seuls outils de son rôle applique le moindre privilège à la conception d’agents. Pour les besoins fréquents qui débordent un peu du rôle, on ajoute un outil transverse restreint plutôt que l’outil complet. Remplacer un outil générique par une version contrainte réduit aussi les risques (accès à des URL arbitraires, actions non prévues)."
          },
          {
            p: "<i>Exemple :</i> l’agent d’analyse reçoit <code>load_document</code> (qui n’accepte que les documents du corpus) au lieu de <code>fetch_url</code> (qui accepterait n’importe quelle adresse) ; l’agent de synthèse reçoit <code>verify_fact</code> pour les vérifications simples, les recherches approfondies restant confiées au coordinateur."
          }
        ]
      },
      {
        h: "tool_choice \"auto\", \"any\", outil forcé",
        lvl: "essentiel",
        points: ["<code>\"auto\"</code> : le modèle peut appeler un outil ou répondre par du texte.", "<code>\"any\"</code> : le modèle doit appeler un outil, mais choisit lequel ; garantit qu’il n’y aura pas de réponse purement textuelle.", "Outil forcé : <code>{\"type\": \"tool\", \"name\": \"extract_metadata\"}</code> ; garantit qu’un outil précis est appelé en premier, les étapes suivantes se traitant dans les tours suivants."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> <code>tool_choice</code> règle la liberté du modèle face aux outils. <code>auto</code> laisse tout ouvert (outil ou texte), <code>any</code> impose d’utiliser au moins un outil, l’outil forcé impose un outil précis. On force un outil pour garantir une étape obligatoire, puis on rend la main au modèle pour la suite."
          },
          {
            p: "<i>Exemple :</i> un pipeline d’extraction force <code>extract_metadata</code> au premier tour pour obtenir titre, auteur et date, puis repasse en <code>auto</code> pour que le modèle choisisse librement les outils d’enrichissement."
          }
        ]
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
        points: ["<b>Portée projet</b> : <code>.mcp.json</code> à la racine du dépôt, versionné, pour l’outillage partagé par l’équipe.", "<b>Portée utilisateur</b> : <code>~/.claude.json</code>, pour les serveurs personnels ou expérimentaux.", "<b>Découverte des outils à la connexion</b> : les outils de tous les serveurs configurés sont découverts quand Claude se connecte et sont disponibles simultanément."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> La portée répond à la question « pour qui ce serveur existe-t-il ? ». Un serveur utile à toute l’équipe (le gestionnaire de tickets, la documentation interne) va dans le dépôt, où chacun le récupère. Un serveur personnel ou en test (un outil que vous évaluez) reste dans votre configuration utilisateur, sans imposer quoi que ce soit aux autres. Les deux portées s’additionnent : l’agent voit les outils de tous les serveurs configurés."
          },
          {
            p: "<i>Exemple :</i> le serveur Jira de l’équipe est déclaré dans <code>.mcp.json</code> ; le serveur expérimental de recherche sémantique que vous testez est déclaré dans <code>~/.claude.json</code>. Dans Claude Code, vous disposez des deux ; vos collègues, seulement du premier."
          }
        ]
      },
      {
        h: "Expansion de variables d’environnement",
        lvl: "essentiel",
        p: "Dans <code>.mcp.json</code>, on référence un secret par une variable (<code>${GITHUB_TOKEN}</code>) : chacun fournit sa valeur dans son environnement, et aucun secret n’est commité.",
        code: "{\n  \"mcpServers\": {\n    \"github\": {\n      \"command\": \"<commande-du-serveur>\",\n      \"env\": { \"GITHUB_TOKEN\": \"${GITHUB_TOKEN}\" }\n    }\n  }\n}",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un fichier de configuration partagé ne doit jamais contenir de secret, puisqu’il est commité. L’expansion de variables résout le problème : le fichier contient une référence (<code>${GITHUB_TOKEN}</code>), et chaque développeur fournit la valeur dans son environnement. Si la variable manque, le serveur ne peut pas s’authentifier : c’est la première chose à vérifier quand un collègue n’arrive pas à se connecter."
          },
          {
            p: "<i>Exemple :</i> <code>.mcp.json</code> déclare <code>\"env\": {\"JIRA_TOKEN\": \"${JIRA_TOKEN}\"}</code> ; chaque développeur ajoute <code>export JIRA_TOKEN=…</code> à son environnement local, et la CI le fournit par un secret."
          }
        ]
      },
      {
        h: "Ressources MCP comme catalogues",
        lvl: "essentiel",
        p: "Une ressource MCP expose un <b>catalogue de contenu</b> (résumés de tickets, arborescence de documentation, schéma de base de données). L’agent voit ce qui existe sans multiplier les appels d’outils exploratoires.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Sans catalogue, un agent découvre ce qui existe en tâtonnant : il liste, cherche, ouvre, recommence. Une ressource MCP lui donne la carte d’emblée : la liste des tables et de leurs colonnes, l’arborescence de la documentation, les tickets ouverts avec leur résumé. Il peut alors aller directement à l’information utile."
          },
          {
            p: "<i>Exemple :</i> un serveur MCP de base de données expose la ressource « schéma » (tables, colonnes, relations). L’agent qui doit écrire une requête la lit une fois, au lieu de lancer cinq appels exploratoires pour découvrir la structure."
          }
        ]
      },
      {
        h: "Descriptions et serveurs communautaires",
        lvl: "essentiel",
        points: ["Un outil MCP mal décrit sera délaissé au profit d’un outil intégré (Grep) moins adapté : décrire en détail capacités et sorties.", "Pour une intégration standard (Jira…), préférer un <b>serveur communautaire</b> existant ; réserver le développement sur mesure aux workflows propres à l’équipe."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un outil MCP mal décrit est un outil inutilisé : face à un doute, le modèle se rabat sur ce qu’il connaît (comme Grep). La description doit vendre l’outil : ce qu’il sait faire de plus, ce qu’il renvoie. Quant au choix entre serveur communautaire et serveur maison : pour une intégration standard, réutiliser l’existant évite du développement et de la maintenance ; le sur-mesure se justifie pour un besoin vraiment propre à l’équipe."
          },
          {
            p: "<i>Exemple :</i> description pauvre : « Recherche dans le code. » Description utile : « Recherche sémantique dans tout le dépôt : trouve les fonctions par intention (« où est calculée la TVA ? ») même sans connaître leur nom ; renvoie les 5 extraits les plus pertinents avec leur chemin. »"
          }
        ]
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
        points: ["<b>Grep pour le contenu</b> : chercher un motif dans les fichiers (appelants d’une fonction, message d’erreur, import).", "<b>Glob pour les chemins</b> : trouver des fichiers par nom ou extension (<code>**/*.test.tsx</code>).", "Confusion classique : utiliser Glob pour trouver qui appelle une fonction (il faut Grep), ou Grep pour lister les fichiers de test (il faut Glob)."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Les deux outils répondent à deux questions différentes. Glob répond à « quels fichiers portent ce nom ou cette extension ? » ; Grep répond à « où ce texte apparaît-il dans les fichiers ? ». Les confondre fait perdre du temps : Glob ne trouvera jamais les appels d’une fonction, et Grep est un détour pour lister des fichiers par motif de nom."
          },
          {
            p: "<i>Exemple :</i> trouver tous les fichiers de migration : Glob sur <code>**/migrations/*.sql</code>. Trouver qui appelle <code>calculateTax(</code> : Grep sur ce motif. Trouver les fichiers qui importent un module : Grep sur l’instruction d’import."
          }
        ]
      },
      {
        h: "Read et Write, Edit et texte unique",
        lvl: "essentiel",
        points: ["<b>Read et Write</b> opèrent sur des fichiers entiers.", "<b>Edit</b> fait une modification ciblée par correspondance de <b>texte unique</b> : il échoue si l’ancre apparaît plusieurs fois ou pas du tout.", "<b>Repli Read + Write</b> : quand Edit ne trouve pas d’ancre unique, lire tout le fichier puis le réécrire."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Edit est l’outil chirurgical : il remplace un passage précis, identifié par un texte qui doit être unique dans le fichier. C’est économique et sûr, mais il échoue si le texte apparaît plusieurs fois (un bloc répété, une ligne courante). Dans ce cas, on lit le fichier entier avec Read et on le réécrit avec Write, ou on élargit le texte de référence pour qu’il devienne unique."
          },
          {
            p: "<i>Exemple :</i> remplacer <code>return None</code> dans un fichier qui contient cette ligne six fois : Edit échoue. Solution : inclure les deux lignes qui précèdent dans le texte recherché pour le rendre unique, ou passer par Read puis Write."
          }
        ]
      },
      {
        h: "Compréhension incrémentale",
        lvl: "essentiel",
        points: ["Commencer par Grep pour trouver les points d’entrée, puis Read pour suivre les imports et les flux, au lieu de tout lire d’emblée.", "Pour tracer une fonction à travers des modules d’enveloppe : identifier d’abord tous les noms sous lesquels elle est exportée, puis rechercher chacun."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Lire tout un dépôt « pour avoir le contexte » remplit la fenêtre de contenu inutile et dégrade la qualité. La démarche efficace ressemble à une enquête : partir d’un indice (un nom de fonction, un message d’erreur), le localiser avec Grep, lire le fichier trouvé, suivre ses imports, et s’arrêter quand le flux est compris."
          },
          {
            p: "<i>Exemple :</i> comprendre le calcul des frais de port : Grep sur « shipping » → trois fichiers ; lecture de <code>shipping/calculator.py</code> → il importe <code>rates.py</code> et <code>zones.py</code> ; lecture de ces deux fichiers → flux compris, sans avoir ouvert les 200 autres."
          }
        ]
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
        points: ["<b>Utilisateur</b> : <code>~/.claude/CLAUDE.md</code>, pour vous seul, dans tous vos projets.", "<b>Projet</b> : <code>CLAUDE.md</code> à la racine ou <code>.claude/CLAUDE.md</code>, versionné, partagé par l’équipe.", "<b>Répertoire</b> : un <code>CLAUDE.md</code> dans un sous-dossier, pour les conventions de ce dossier."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Les trois niveaux se cumulent : Claude Code charge vos préférences personnelles, puis les règles du projet, puis celles du dossier dans lequel il travaille. Plus le niveau est précis, plus la consigne est ciblée. La bonne question pour placer une instruction est « à qui s’applique-t-elle ? » : à moi seul, à toute l’équipe sur ce projet, ou seulement à cette partie du code."
          },
          {
            p: "<i>Exemple :</i> « Réponds-moi en français » → <code>~/.claude/CLAUDE.md</code>. « Lance les tests avec <code>make test</code> » → <code>CLAUDE.md</code> à la racine. « Dans <code>legacy/</code>, ne modernise pas la syntaxe » → <code>legacy/CLAUDE.md</code>."
          }
        ]
      },
      {
        h: "~/.claude/CLAUDE.md non partagé",
        lvl: "essentiel",
        p: "Les instructions du niveau utilisateur ne sont <b>pas partagées</b> via le contrôle de version. Diagnostic typique : un nouveau membre de l’équipe ne reçoit pas les consignes parce qu’elles ont été mises dans le <code>~/.claude/CLAUDE.md</code> d’un collègue au lieu du CLAUDE.md du projet.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le fichier utilisateur vit dans votre dossier personnel, hors du dépôt : il n’est donc jamais commité ni partagé. C’est voulu, pour vos préférences ; c’est un piège quand on y place, par erreur, une convention d’équipe. Le symptôme typique : « chez moi Claude respecte la règle, chez mon collègue non »."
          },
          {
            p: "<i>Exemple :</i> un développeur senior a écrit dans son fichier utilisateur « utilise toujours pytest avec l’option -x ». Les nouveaux arrivants ne reçoivent pas cette règle. La solution : la déplacer dans le CLAUDE.md du projet."
          }
        ]
      },
      {
        h: "Syntaxe @import et dossier .claude/rules/",
        lvl: "essentiel",
        points: ["<b>Syntaxe <code>@import</code></b> : un CLAUDE.md référence des fichiers externes pour rester modulaire, par exemple n’importer dans le CLAUDE.md de chaque package que les standards qui le concernent.", "<b>Dossier <code>.claude/rules/</code></b> : alternative à un CLAUDE.md monolithique, avec des fichiers thématiques (<code>testing.md</code>, <code>api-conventions.md</code>, <code>deployment.md</code>)."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un CLAUDE.md qui grossit devient difficile à maintenir et charge à chaque session des règles souvent hors sujet. Deux outils permettent de le découper : <code>@import</code> inclut un fichier externe là où il est utile (par exemple les standards d’un package), et <code>.claude/rules/</code> range les règles par thème dans des fichiers séparés."
          },
          {
            p: "<i>Exemple :</i> le CLAUDE.md du package <code>billing/</code> contient <code>@import ../docs/standards/argent.md</code> (arrondis, devises), tandis que <code>.claude/rules/</code> contient <code>tests.md</code>, <code>api.md</code> et <code>deploiement.md</code>."
          }
        ]
      },
      {
        h: "Commande /memory",
        lvl: "essentiel",
        p: "La <b>commande <code>/memory</code></b> montre quels fichiers de mémoire sont chargés. C’est l’outil de diagnostic quand Claude se comporte différemment d’une session ou d’un poste à l’autre.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Quand Claude Code ne se comporte pas comme prévu, la première question est « quelles instructions a-t-il réellement reçues ? ». <code>/memory</code> répond en montrant les fichiers de mémoire chargés. On repère ainsi un fichier absent, mal placé, ou une instruction contradictoire venant d’un autre niveau."
          },
          {
            p: "<i>Exemple :</i> une règle de nommage n’est pas appliquée dans <code>api/</code>. <code>/memory</code> montre que <code>api/CLAUDE.md</code> n’est pas chargé, car le fichier s’appelle en réalité <code>api/claude.md</code>, en minuscules."
          }
        ]
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
        points: ["<b>Projet</b> : <code>.claude/commands/</code>, versionné, disponible pour toute l’équipe dès le clone ou le pull.", "<b>Utilisateur</b> : <code>~/.claude/commands/</code>, personnel, non partagé.", "Une commande ne se définit ni dans CLAUDE.md (instructions et contexte) ni dans un fichier de configuration JSON."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Une commande slash est un prompt réutilisable, déclenché par un nom court. Placée dans le dépôt, elle devient un outil d’équipe : tout le monde l’a, et elle évolue par pull request. Placée dans votre dossier utilisateur, elle reste personnelle. CLAUDE.md, lui, ne définit pas de commandes : il contient des instructions permanentes."
          },
          {
            p: "<i>Exemple :</i> <code>.claude/commands/changelog.md</code> : « Rédige l’entrée de changelog pour les commits depuis le dernier tag, selon notre format : Ajouté / Modifié / Corrigé. » Chaque développeur l’utilise avec <code>/changelog</code>."
          }
        ]
      },
      {
        h: "Skills .claude/skills/ et SKILL.md",
        lvl: "essentiel",
        p: "Un skill est un dossier de <code>.claude/skills/</code> contenant un fichier <code>SKILL.md</code> dont le frontmatter configure son exécution. Pour une variante personnelle, on crée un skill dans <code>~/.claude/skills/</code> <b>sous un autre nom</b>, pour ne pas affecter l’équipe.",
        code: "---\nname: analyse-codebase\ndescription: Analyse l’architecture d’un module et rend une synthèse.\ncontext: fork\nallowed-tools: Read, Grep, Glob\nargument-hint: <chemin du module>\n---\nAnalyse le module indiqué et rends : couches, dépendances, risques.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un skill est plus riche qu’une commande : c’est un dossier qui peut contenir des instructions, des scripts et des fichiers de référence, avec un frontmatter qui règle son exécution. Il est chargé quand il est utile, ce qui évite d’encombrer chaque session avec des procédures rarement employées."
          },
          {
            p: "<i>Exemple :</i> le skill <code>migration-bdd</code> contient la procédure (sauvegarde, migration, vérification), un script de vérification du schéma et un modèle de rapport ; il ne pèse rien tant qu’on ne fait pas de migration."
          }
        ]
      },
      {
        h: "context: fork, allowed-tools, argument-hint",
        lvl: "essentiel",
        points: ["<code>context: fork</code> : exécute le skill dans un <b>contexte de sous-agent isolé</b> ; sa sortie verbeuse (analyse de code) ou exploratoire (brainstorming) ne pollue pas la conversation principale.", "<code>allowed-tools</code> : restreint les outils disponibles pendant le skill (par exemple pour éviter toute action destructrice).", "<code>argument-hint</code> : indique le paramètre attendu quand le skill est invoqué sans argument."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Ces trois options règlent trois aspects différents. <code>context: fork</code> règle <i>où</i> le skill s’exécute (contexte isolé, pour ne pas inonder la conversation principale). <code>allowed-tools</code> règle <i>ce qu’il peut faire</i> (liste d’outils autorisés). <code>argument-hint</code> règle <i>ce qu’il faut lui donner</i> (le paramètre attendu, affiché quand on l’invoque sans argument)."
          },
          {
            p: "<i>Exemple :</i> un skill d’audit de dépendances : <code>context: fork</code> car il produit un long rapport, <code>allowed-tools: Read, Grep, Glob, Bash</code> sans outil d’écriture, <code>argument-hint: &lt;chemin du package&gt;</code>."
          }
        ]
      },
      {
        h: "Skills ou CLAUDE.md",
        lvl: "essentiel",
        p: "Un <b>skill</b> s’invoque <b>à la demande</b> pour un workflow précis ; <b>CLAUDE.md</b> contient les standards universels, <b>toujours chargés</b>. Mettre une procédure ponctuelle dans CLAUDE.md consomme du contexte en permanence.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> CLAUDE.md coûte du contexte à chaque session : il doit contenir ce qui sert presque toujours (conventions, commandes de test, interdits). Un skill ne coûte que lorsqu’il est utilisé : il convient aux procédures ponctuelles, même longues. Mettre une procédure de mise en production de 200 lignes dans CLAUDE.md, c’est la payer dans chaque conversation."
          },
          {
            p: "<i>Exemple :</i> « les fonctions publiques ont une docstring » → CLAUDE.md. « Procédure de publication d’une nouvelle version » → skill <code>release</code>."
          }
        ]
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
        code: "---\npaths: [\"**/*.test.tsx\"]\n---\nTests : React Testing Library, un describe par composant,\npas de snapshot pour la logique métier.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le champ <code>paths</code> transforme une règle permanente en règle conditionnelle : elle n’est chargée que si le fichier édité correspond à l’un des motifs. Les motifs glob utilisent <code>*</code> (n’importe quel nom dans un dossier) et <code>**</code> (n’importe quelle profondeur de dossiers)."
          },
          {
            p: "<i>Exemple :</i> <code>paths: [\"**/*.sql\"]</code> pour les conventions SQL ; <code>paths: [\"infra/**/*\"]</code> pour l’infrastructure ; <code>paths: [\"**/*.test.ts\", \"**/*.spec.ts\"]</code> pour toutes les conventions de test."
          }
        ]
      },
      {
        h: "Chargement conditionnel et économie de contexte",
        lvl: "essentiel",
        p: "Avec le <b>chargement conditionnel</b>, une règle limitée à des chemins n’est chargée qu’à l’édition des fichiers concernés : c’est une <b>économie de contexte</b> (moins de tokens, moins de consignes hors sujet).",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Chaque règle chargée occupe de la place et peut distraire le modèle quand elle est hors sujet. Avec le chargement conditionnel, un développeur qui modifie une page web ne reçoit pas les règles de migration de base de données, et inversement. Le contexte reste léger et pertinent."
          },
          {
            p: "<i>Exemple :</i> un dépôt avec 12 fichiers de règles thématiques : quand on édite un composant React, seules les règles front-end et tests s’appliquent ; les 10 autres ne sont pas chargées."
          }
        ]
      },
      {
        h: "Conventions transverses aux dossiers",
        lvl: "essentiel",
        points: ["Un CLAUDE.md de sous-dossier est lié à un <b>répertoire</b>.", "Pour des conventions transverses aux dossiers (fichiers de test placés à côté du code dans toute la base), un motif glob comme <code>**/*.test.tsx</code> est plus adapté.", "Exemple : <code>paths: [\"terraform/**/*\"]</code> pour les conventions d’infrastructure."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Certaines conventions suivent un type de fichier, pas un dossier : les tests sont placés à côté du code qu’ils testent, dans des dizaines de dossiers. Les couvrir avec des CLAUDE.md de sous-dossiers obligerait à dupliquer la règle partout. Un seul fichier de règles avec un motif glob les couvre toutes."
          },
          {
            p: "<i>Exemple :</i> une règle « tests : un describe par composant, pas de snapshot pour la logique » avec <code>paths: [\"**/*.test.tsx\"]</code> s’applique dans <code>src/panier/</code>, <code>src/compte/</code> et tous les autres dossiers, sans duplication."
          }
        ]
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
        points: ["Changements à grande échelle, plusieurs approches valables, décisions d’architecture, modifications sur de nombreux fichiers.", "Exemples : découper un monolithe en microservices, migration d’une bibliothèque touchant plus de 45 fichiers, choix entre deux approches d’intégration aux infrastructures différentes.", "<b>Exploration sans risque</b> : on explore et conçoit avant de modifier, ce qui évite des reprises coûteuses."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le plan mode sépare la réflexion de l’action. Claude explore le code, pèse les options et propose un plan, sans rien modifier. Vous relisez, corrigez et validez. Pour une tâche complexe, une heure d’exploration et de planification évite souvent une journée de corrections après une mauvaise direction."
          },
          {
            p: "<i>Exemple :</i> migrer l’authentification vers un nouveau fournisseur : en plan mode, Claude identifie les 23 fichiers concernés, les deux stratégies possibles (migration progressive ou bascule), les risques de chacune, et propose un découpage en cinq étapes testables."
          }
        ]
      },
      {
        h: "Exécution directe pour les changements simples",
        lvl: "essentiel",
        points: ["Changement bien compris et bien délimité : corriger un bug sur un seul fichier avec une trace claire, ajouter une condition de validation de date.", "Piège : commencer en exécution directe une tâche dont la complexité est déjà connue « en espérant que la structure émerge »."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Quand le changement est clair, localisé et sans alternative crédible, planifier ajoute du délai sans valeur. L’exécution directe convient aux corrections dont la cause est connue et aux petites évolutions bien spécifiées. Le critère n’est pas la taille du code, mais l’incertitude sur la façon de faire."
          },
          {
            p: "<i>Exemple :</i> « la fonction <code>format_date</code> plante quand la date est vide ; renvoie une chaîne vide dans ce cas et ajoute un test » : exécution directe."
          }
        ]
      },
      {
        h: "Sous-agent Explore",
        lvl: "essentiel",
        p: "Le <b>sous-agent Explore</b> isole la sortie verbeuse d’une phase de découverte et ne renvoie qu’un résumé : la fenêtre de contexte principale n’est pas épuisée pendant les tâches en plusieurs phases.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Explorer un grand dépôt produit beaucoup de sorties (listes de fichiers, extraits, résultats de recherche). Si tout cela reste dans la conversation principale, le contexte se remplit avant même d’avoir commencé le travail. Le sous-agent Explore fait cette exploration dans son propre contexte et ne rend qu’un résumé."
          },
          {
            p: "<i>Exemple :</i> « Trouve où sont gérés les droits d’accès dans ce dépôt » : Explore parcourt une cinquantaine de fichiers et répond en dix lignes avec les quatre fichiers clés et leur rôle."
          }
        ]
      },
      {
        h: "Combiner plan et exécution",
        lvl: "essentiel",
        p: "Les deux modes se combinent : plan mode pour l’investigation (planifier une migration de bibliothèque), puis exécution directe pour appliquer l’approche retenue.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Les deux modes ne s’opposent pas, ils se succèdent. Le plan mode sert à décider, l’exécution directe à réaliser. On peut aussi revenir en plan mode si une étape révèle une difficulté imprévue."
          },
          {
            p: "<i>Exemple :</i> migration d’une bibliothèque de dates : plan mode pour inventorier les usages et choisir la stratégie, puis exécution directe module par module, avec les tests à chaque étape ; retour en plan mode quand un module utilise une fonctionnalité qui n’existe pas dans la nouvelle bibliothèque."
          }
        ]
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
        p: "Quand une description en prose est interprétée de façon incohérente, <b>2 ou 3 exemples concrets</b> d’entrée et de sortie communiquent la transformation attendue plus efficacement. Même logique pour un cas limite : fournir le cas de test précis (entrée, sortie attendue), par exemple pour les valeurs nulles dans un script de migration.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Une description en prose laisse toujours une marge d’interprétation ; un exemple n’en laisse presque pas. Deux ou trois paires entrée → sortie bien choisies, dont un cas limite, valent souvent mieux qu’un long paragraphe de règles."
          },
          {
            p: "<i>Exemple :</i> « normalise les numéros de téléphone » est ambigu. Avec <code>06 12 34 56 78 → +33612345678</code>, <code>+33 (0)6-12-34-56-78 → +33612345678</code> et <code>0612 → invalide</code>, la règle devient claire."
          }
        ]
      },
      {
        h: "Itération guidée par les tests",
        lvl: "essentiel",
        points: ["Écrire d’abord une suite de tests : comportement attendu, cas limites, exigences de performance.", "Puis itérer en partageant les échecs de tests avec Claude : l’amélioration est guidée par des faits."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Écrire les tests d’abord donne à Claude une définition objective du succès. Il implémente, lance les tests, lit les échecs et corrige, en boucle. Vous n’avez plus à juger chaque proposition à l’œil : les tests le font."
          },
          {
            p: "<i>Exemple :</i> pour une fonction de calcul de remise, on écrit d’abord huit tests (panier vide, seuil exact, remise cumulée, montant négatif…). Claude implémente ; trois tests échouent ; on lui transmet les messages d’échec ; il corrige jusqu’à ce que tout passe."
          }
        ]
      },
      {
        h: "Pattern d’interview",
        lvl: "essentiel",
        p: "Avant d’implémenter dans un domaine peu familier, demander à Claude de <b>vous poser des questions</b> : il fait émerger des points non anticipés (stratégie d’invalidation de cache, modes de défaillance).",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Dans un domaine que vous maîtrisez mal, le risque n’est pas que Claude se trompe sur ce que vous avez demandé, mais que vous n’ayez pas pensé à demander l’essentiel. Le pattern d’interview inverse les rôles : Claude pose les questions qu’un expert poserait avant de commencer."
          },
          {
            p: "<i>Exemple :</i> « Je veux ajouter un cache à cette API. Avant de coder, pose-moi les questions nécessaires. » → durée de vie des données ? invalidation lors des modifications ? comportement si le cache est indisponible ? données personnelles à exclure ?"
          }
        ]
      },
      {
        h: "Problèmes liés ou indépendants",
        lvl: "essentiel",
        points: ["Problèmes <b>liés</b> (les corrections interagissent) : les décrire tous dans un seul message détaillé.", "Problèmes <b>indépendants</b> : les corriger un par un, séquentiellement."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Quand plusieurs problèmes interagissent, les corriger un par un crée des allers-retours : la correction du premier change le comportement du second. Les décrire ensemble permet à Claude de concevoir une solution cohérente. Pour des problèmes indépendants, au contraire, l’itération séquentielle est plus lisible et chaque correction se vérifie seule."
          },
          {
            p: "<i>Exemple :</i> liés : le format de date d’entrée et le calcul des échéances, qui dépend de ce format. Indépendants : une faute d’orthographe dans un message et un style CSS cassé sur une autre page."
          }
        ]
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
        code: "claude -p \"Analyse cette pull request : bugs et failles uniquement\" \\\n  --output-format json --json-schema schema-revue.json",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> En CI, personne ne peut répondre à une question ni valider une action. Le mode <code>-p</code> traite la demande d’une traite et écrit le résultat sur la sortie standard, ce qui permet de l’enchaîner avec d’autres commandes du pipeline. Il faut aussi prévoir à l’avance les permissions nécessaires, puisqu’aucune validation interactive n’est possible."
          },
          {
            p: "<i>Exemple :</i> <code>claude -p \"Vérifie que chaque nouvel endpoint de cette PR a un test\" &gt; verification.txt</code>, puis une étape du pipeline publie ce fichier en commentaire."
          }
        ]
      },
      {
        h: "--output-format json et --json-schema",
        lvl: "essentiel",
        p: "<code>--output-format json</code> associé à <code>--json-schema</code> produit des résultats structurés, exploitables par une machine, par exemple pour les publier en commentaires de PR à la bonne ligne.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un texte libre est difficile à exploiter automatiquement. Avec <code>--output-format json</code>, la sortie devient structurée ; avec <code>--json-schema</code>, elle respecte un schéma précis que votre pipeline connaît. On peut alors filtrer par sévérité, publier chaque remarque à la bonne ligne, ou faire échouer le build au-delà d’un seuil."
          },
          {
            p: "<i>Exemple :</i> un schéma impose pour chaque remarque <code>fichier</code>, <code>ligne</code>, <code>severite</code> (critique, majeure, mineure) et <code>message</code> ; le pipeline bloque la fusion s’il existe au moins une remarque critique."
          }
        ]
      },
      {
        h: "CLAUDE.md comme contexte en CI",
        lvl: "essentiel",
        points: ["Claude Code lancé en CI lit le CLAUDE.md du dépôt : y documenter les standards de test, les critères d’un test utile, les fixtures disponibles et les critères de revue.", "Fournir les fichiers de test existants pour éviter les scénarios déjà couverts."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Claude Code lancé en CI lit le CLAUDE.md du dépôt comme en local. C’est donc là qu’on documente ce qui fait une bonne revue ou un bon test pour ce projet : sans ce contexte, la revue reste générique et la génération de tests produit des cas de faible valeur."
          },
          {
            p: "<i>Exemple :</i> le CLAUDE.md précise : « Les fixtures sont dans <code>tests/fixtures/</code>. Un test utile vérifie un comportement métier, pas un getter. Ne signale pas le style, PHP-CS-Fixer s’en charge. »"
          }
        ]
      },
      {
        h: "Isolation du contexte de session et résultats de revue antérieurs",
        lvl: "essentiel",
        points: ["<b>Isolation du contexte de session</b> : la session qui a généré du code relit moins bien ses propres changements qu’une instance de revue indépendante.", "<b>Résultats de revue antérieurs</b> : quand la revue est relancée après de nouveaux commits, les fournir et demander de ne signaler que les problèmes nouveaux ou non résolus, pour éviter les commentaires en double."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Une session qui a écrit du code a construit un raisonnement qui le justifie ; relire ce code dans la même session, c’est relire avec les mêmes angles morts. Une instance indépendante part de zéro et voit ce qui a échappé à l’auteur. Pour les revues répétées, transmettre les remarques déjà publiées évite de reposter les mêmes à chaque commit."
          },
          {
            p: "<i>Exemple :</i> la PR est générée par une session Claude ; une étape CI distincte lance une revue avec un contexte vierge. Au deuxième passage, la revue reçoit la liste des remarques existantes et ne signale que les nouveaux problèmes ou ceux non corrigés."
          }
        ]
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
        points: ["Vague : « vérifie que les commentaires sont exacts ».", "Explicite : « signale un commentaire seulement si le comportement décrit contredit le comportement réel du code ».", "Définir ce qu’il faut <b>signaler</b> (bugs, sécurité) et ce qu’il faut <b>ignorer</b> (style mineur, conventions locales)."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un critère explicite décrit une situation observable, que deux relecteurs jugeraient de la même façon. « Le commentaire est-il exact ? » laisse trop de place au jugement ; « le comportement décrit par le commentaire contredit-il le code ? » se vérifie. Définir aussi ce qu’il faut ignorer est aussi important que définir ce qu’il faut signaler."
          },
          {
            p: "<i>Exemple :</i> à signaler : variable utilisateur insérée dans une requête SQL sans paramètre ; exception attrapée puis ignorée sans journalisation. À ignorer : longueur des lignes, préférence entre guillemets simples et doubles."
          }
        ]
      },
      {
        h: "Consignes vagues inefficaces",
        lvl: "essentiel",
        p: "« Sois prudent » ou « ne signale que les résultats très sûrs » n’améliorent pas la précision : filtrer par niveau de confiance ne remplace pas des critères précis.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> « Sois prudent » ou « ne signale que ce dont tu es sûr » semblent raisonnables, mais le modèle ne sait pas sur quoi appliquer cette prudence. Il devient soit trop timide (vrais problèmes manqués), soit inchangé. La précision vient de critères concrets, pas d’un réglage de confiance général."
          },
          {
            p: "<i>Exemple :</i> après l’ajout de « ne signale que les problèmes certains », la revue signale toujours autant de faux positifs de style et manque un vrai problème de concurrence ; après le remplacement par des catégories précises, les faux positifs disparaissent."
          }
        ]
      },
      {
        h: "Taux de faux positifs et confiance des développeurs",
        lvl: "essentiel",
        points: ["Une catégorie au fort taux de faux positifs fait douter de toutes les autres, même fiables : la confiance des développeurs s’effondre globalement.", "<b>Désactivation temporaire de catégories</b> : couper les catégories les plus bruyantes pendant qu’on améliore leurs prompts.", "<b>Critères de sévérité</b> : définir chaque niveau avec des exemples de code concrets pour une classification cohérente."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> La confiance se perd par catégorie mais s’effondre globalement : si les remarques de nommage sont fausses une fois sur deux, les développeurs finissent par ignorer aussi les alertes de sécurité. Mieux vaut une revue qui signale peu mais juste. Désactiver temporairement une catégorie bruyante, le temps de l’améliorer, est une mesure saine."
          },
          {
            p: "<i>Exemple :</i> la catégorie « nommage » produit 70 % de faux positifs ; on la désactive, on réécrit ses critères avec des exemples de code acceptables, on la teste sur cinquante PR anciennes, puis on la réactive."
          }
        ]
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
        p: "Quand des instructions détaillées ne suffisent pas à obtenir une sortie cohérente, les <b>exemples few-shot</b> sont la technique la plus efficace. Viser <b>2 à 4 exemples ciblés</b>.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Les exemples montrent ce que les instructions décrivent mal : le ton, le niveau de détail, la façon de trancher un cas limite. Deux à quatre exemples variés suffisent ; au-delà, on consomme du contexte et le modèle risque de copier les exemples au lieu de les généraliser."
          },
          {
            p: "<i>Exemple :</i> pour un résumé de tickets, trois exemples : un ticket simple (une phrase), un ticket avec plusieurs problèmes (une puce par problème), un ticket ambigu (signalé comme tel avec la question à poser au client)."
          }
        ]
      },
      {
        h: "Cas ambigus et généralisation",
        lvl: "essentiel",
        points: ["Montrer le raisonnement sur des <b>cas ambigus</b> : pourquoi telle action plutôt qu’une autre plausible (choix d’outil, lacune de couverture de tests au niveau des branches).", "Les exemples permettent la <b>généralisation</b> du jugement à de nouveaux cas, au-delà des cas montrés.", "Montrer des motifs de code <b>acceptables</b> à côté de vrais problèmes réduit les faux positifs."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Les cas évidents n’ont pas besoin d’exemples ; ce sont les cas limites qui en profitent le plus. Un bon exemple ambigu montre le raisonnement (« ici on choisit A plutôt que B parce que… »), ce qui permet au modèle d’appliquer la même logique à des cas nouveaux qu’aucun exemple ne couvre."
          },
          {
            p: "<i>Exemple :</i> « Un utilisateur demande “annule ma commande” sans numéro. On n’appelle pas cancel_order au hasard : on appelle d’abord get_customer_orders pour lister ses commandes récentes et on lui demande laquelle annuler. »"
          }
        ]
      },
      {
        h: "Format de sortie",
        lvl: "essentiel",
        p: "Un exemple qui montre exactement le <b>format de sortie</b> voulu (emplacement, problème, sévérité, correctif proposé) donne des résultats homogènes.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Décrire un format en prose (« indique le fichier, la ligne, le problème et la correction ») donne des sorties qui varient d’une exécution à l’autre. Un exemple concret fixe l’ordre des éléments, les libellés, la longueur. Pour un format exploité par du code, on combine exemple et sortie structurée."
          },
          {
            p: "<i>Exemple :</i> exemple fourni : « <code>src/panier.py:42</code> — majeure — la remise est appliquée avant la TVA au lieu d’après. Correction : appliquer la remise sur le montant TTC. »"
          }
        ]
      },
      {
        h: "Réduction des hallucinations en extraction",
        lvl: "essentiel",
        points: ["En extraction, les exemples réduisent les valeurs inventées (mesures informelles, champs absents).", "Couvrir les <b>structures de documents variées</b> : citations dans le texte ou bibliographie, méthodologie en section ou dispersée, récit ou tableau.", "Ajouter des exemples d’extraction réussie sur des formats variés corrige les champs obligatoires renvoyés vides ou nuls."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> En extraction, le modèle invente surtout quand il ne sait pas comment traiter une information absente ou formulée inhabituellement. Des exemples qui montrent explicitement « champ absent → null » ou « mesure informelle → conversion » réduisent nettement ces inventions."
          },
          {
            p: "<i>Exemple :</i> un exemple montre « environ deux mètres » extrait comme <code>{\"longueur_m\": 2, \"approximatif\": true}</code>, et un autre montre un document sans date de signature extrait avec <code>\"date_signature\": null</code>."
          }
        ]
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
        p: "Définir un outil d’extraction dont le <b>schéma d’entrée</b> est le format voulu : <code>tool_use</code> avec schéma JSON est l’approche la plus fiable pour une sortie conforme, sans erreur de syntaxe JSON. Les données se lisent dans le bloc <code>tool_use</code> de la réponse.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Demander « réponds en JSON » laisse le modèle écrire du texte qui ressemble à du JSON, avec parfois une virgule en trop ou une phrase d’introduction. En définissant un outil dont les paramètres sont le format voulu, la sortie est structurée par construction : on lit directement les paramètres du bloc <code>tool_use</code>."
          },
          {
            p: "<i>Exemple :</i> outil <code>record_invoice</code> avec les paramètres numéro, date, montant et lignes ; le modèle « appelle » cet outil avec les valeurs extraites, et votre code lit <code>bloc.input</code> sans aucun parsing de texte."
          }
        ]
      },
      {
        h: "tool_choice \"auto\", \"any\", forcé",
        lvl: "essentiel",
        points: ["<code>\"auto\"</code> : le modèle peut répondre par du texte au lieu d’appeler l’outil.", "<code>\"any\"</code> : il doit appeler un outil ; idéal quand plusieurs schémas d’extraction existent et que le type de document est inconnu.", "Forcé (<code>{\"type\": \"tool\", \"name\": \"extract_metadata\"}</code>) : garantit qu’une extraction précise passe avant les étapes d’enrichissement."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Pour l’extraction, le risque de <code>auto</code> est que le modèle réponde par une phrase (« voici les informations… ») au lieu d’appeler l’outil. <code>any</code> garantit un appel d’outil tout en laissant choisir le bon schéma ; l’outil forcé garantit un schéma précis."
          },
          {
            p: "<i>Exemple :</i> trois schémas (facture, devis, bon de livraison) et des documents de type inconnu : <code>any</code>. Un pipeline qui doit toujours commencer par les métadonnées : outil forcé <code>extract_metadata</code>."
          }
        ]
      },
      {
        h: "Erreurs de syntaxe ou erreurs sémantiques",
        lvl: "essentiel",
        p: "Un schéma strict élimine les <b>erreurs de syntaxe</b>, pas les <b>erreurs sémantiques</b> : lignes qui ne s’additionnent pas au total, valeur placée dans le mauvais champ. Il faut une validation métier en plus (objectif 4.4).",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> La syntaxe, c’est la forme : accolades, virgules, types. La sémantique, c’est le sens : les valeurs sont-elles justes et cohérentes ? Le tool use règle la première, jamais la seconde. Un JSON parfaitement valide peut contenir un total faux ou un montant placé dans le champ de la quantité."
          },
          {
            p: "<i>Exemple :</i> <code>{\"quantite\": 89.90, \"prix_unitaire\": 1}</code> est syntaxiquement valide mais inverse deux valeurs. Seul un contrôle métier (quantité entière, prix plausible) le détecte."
          }
        ]
      },
      {
        h: "Conception du schéma",
        lvl: "essentiel",
        points: ["<b>Champs obligatoires ou facultatifs</b> : un champ obligatoire absent du document pousse le modèle à inventer.", "<b>Champs nullable</b> : quand l’information peut manquer, autoriser <code>null</code>.", "<b>Enum avec <code>\"other\"</code> et détail</b> : une valeur <code>\"other\"</code> accompagnée d’un champ texte de détail pour les catégories imprévues ; une valeur <code>\"unclear\"</code> pour les cas ambigus.", "Ajouter au prompt des règles de normalisation (dates, unités) pour les sources au format incohérent."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le schéma est une consigne : il dit au modèle ce qui doit toujours exister et ce qui peut manquer. Un champ obligatoire absent du document pousse le modèle à inventer ; un champ nullable lui permet d’avouer l’absence. Les énumérations rendent les catégories exploitables, et le couple <code>\"other\"</code> + détail accueille l’imprévu sans casser le format."
          },
          {
            p: "<i>Exemple :</i> <code>\"mode_paiement\": {\"enum\": [\"carte\", \"virement\", \"prelevement\", \"other\", \"unclear\"]}</code> et <code>\"mode_paiement_detail\": {\"type\": [\"string\", \"null\"]}</code> pour préciser « chèque » ou « crypto-monnaie » quand la valeur est <code>other</code>."
          }
        ]
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
        p: "En cas d’échec de validation, la requête de suivi contient le <b>document d’origine</b>, l’<b>extraction ratée</b> et les <b>erreurs de validation précises</b> : le modèle se corrige à partir de faits, pas d’un « réessaie ».",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Une nouvelle tentative aveugle (« réessaie ») a peu de chances de faire mieux. Une tentative informée donne au modèle les trois éléments nécessaires : le document, ce qu’il a produit, et ce qui ne va pas précisément. C’est comme rendre une copie annotée plutôt qu’une simple note."
          },
          {
            p: "<i>Exemple :</i> « Ta sortie précédente : date = “3/4/26”. Erreur : format attendu AAAA-MM-JJ, et le document indique “3 avril 2026”. Corrige uniquement ce champ. »"
          }
        ]
      },
      {
        h: "Limites des nouvelles tentatives",
        lvl: "essentiel",
        points: ["Utiles pour les erreurs de format ou de structure.", "Inutiles quand l’information est <b>absente du document</b> (par exemple présente seulement dans un document externe non fourni) : réessayer ne la fera pas apparaître."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Réessayer corrige ce que le modèle a mal formaté, pas ce qui n’existe pas. Si une information est absente du document fourni (elle figure dans une annexe non transmise, par exemple), dix tentatives produiront dix échecs, ou pire, une valeur inventée. Il faut détecter ces cas et répondre autrement : null, demande du document manquant, revue humaine."
          },
          {
            p: "<i>Exemple :</i> le numéro de marché n’apparaît que dans le bon de commande, absent du lot : on arrête après le premier échec, on renvoie <code>null</code> avec la mention « document source manquant »."
          }
        ]
      },
      {
        h: "Erreurs sémantiques ou de syntaxe et auto-correction",
        lvl: "essentiel",
        points: ["Les erreurs de syntaxe sont éliminées par le tool use ; les erreurs sémantiques demandent des contrôles.", "<b>Auto-correction</b> : extraire <code>calculated_total</code> et <code>stated_total</code> pour détecter un écart, ajouter un booléen <code>conflict_detected</code> pour une source incohérente."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> L’auto-correction consiste à faire produire au modèle des éléments de contrôle en plus des données. Extraire à la fois le total imprimé sur la facture et le total recalculé à partir des lignes permet de repérer automatiquement un écart, sans relecture humaine systématique."
          },
          {
            p: "<i>Exemple :</i> <code>stated_total: 120.00</code>, <code>calculated_total: 118.80</code> → écart détecté, la facture part en revue avec <code>conflict_detected: true</code> et le motif « total imprimé différent de la somme des lignes »."
          }
        ]
      },
      {
        h: "Champ detected_pattern",
        lvl: "avancé",
        p: "Dans une revue automatisée, ajouter un <b>champ <code>detected_pattern</code></b> à chaque signalement : quand les développeurs rejettent des résultats, on peut analyser quels motifs produisent les faux positifs et corriger systématiquement.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Quand les développeurs rejettent une remarque de revue, on veut savoir pourquoi, à grande échelle. Le champ <code>detected_pattern</code> nomme le motif qui a déclenché la remarque ; en croisant ce champ avec les rejets, on identifie les motifs qui produisent des faux positifs et on corrige les critères correspondants."
          },
          {
            p: "<i>Exemple :</i> sur un mois, 80 % des rejets concernent <code>detected_pattern: \"exception_large\"</code> sur des blocs qui relancent l’exception après journalisation ; on ajoute ce cas acceptable aux critères."
          }
        ]
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
        points: ["<b>50 % d’économie</b> par rapport aux appels synchrones.", "<b>Fenêtre de 24 heures</b> au plus pour le traitement, et <b>pas de SLA de latence</b>.", "<b>Pas d’appels d’outils multi-tours</b> dans une requête : impossible d’exécuter un outil en cours de requête et d’en renvoyer le résultat.", "<code>custom_id</code> associe chaque requête à sa réponse ; on interroge l’avancement du lot jusqu’à sa fin."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> L’API par lots est faite pour les gros volumes qui peuvent attendre : on soumet un lot de requêtes, Anthropic les traite de façon asynchrone, et on récupère les résultats plus tard, pour moitié prix. En contrepartie : jusqu’à 24 heures de traitement, pas de garantie de délai, et pas d’échanges en plusieurs tours avec des outils dans une même requête."
          },
          {
            p: "<i>Exemple :</i> chaque nuit, 30 000 avis clients sont soumis en lot pour classification ; le matin, les résultats sont associés à chaque avis grâce à son <code>custom_id</code> et chargés dans le tableau de bord."
          }
        ]
      },
      {
        h: "Choisir synchrone ou lots",
        lvl: "essentiel",
        points: ["Lots : charges non bloquantes et tolérantes à la latence (rapports de nuit, audits hebdomadaires, génération de tests nocturne).", "Synchrone : workflows bloquants (vérification avant fusion qu’un développeur attend).", "Dimensionner la fréquence de soumission selon le SLA : par exemple des fenêtres de 4 heures pour garantir 30 heures avec un traitement pouvant durer 24 heures."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> La question décisive : quelqu’un attend-il la réponse ? Si oui (utilisateur, développeur devant sa PR, pipeline bloquant), il faut l’API synchrone. Sinon, les lots divisent le coût par deux. Pour respecter un délai global, on calcule la fréquence de soumission : attente maximale avant soumission + 24 heures de traitement ≤ délai promis."
          },
          {
            p: "<i>Exemple :</i> délai promis de 30 heures : en soumettant toutes les 4 heures, un document attend au plus 4 heures, plus 24 heures de traitement, soit 28 heures."
          }
        ]
      },
      {
        h: "Gérer les échecs",
        lvl: "essentiel",
        points: ["Ne resoumettre que les documents en échec, identifiés par <code>custom_id</code>, avec les modifications nécessaires (découper un document qui dépassait la fenêtre de contexte).", "Affiner le prompt sur un échantillon avant de lancer un gros volume, pour maximiser la réussite au premier passage."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Dans un lot, chaque requête réussit ou échoue indépendamment. On ne resoumet que les échecs, identifiés par leur <code>custom_id</code>, après avoir corrigé leur cause : un document trop long est découpé, une requête invalide est corrigée. Tester le prompt sur un petit échantillon avant le gros lot évite de payer des milliers d’échecs identiques."
          },
          {
            p: "<i>Exemple :</i> sur 10 000 documents, 85 échouent car ils dépassent la fenêtre de contexte : on découpe ces 85 documents en sections, on resoumet uniquement ces requêtes, puis on fusionne les résultats par document."
          }
        ]
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
        p: "Dans la même session, le modèle garde le raisonnement qui l’a conduit à générer le code : il remet moins en cause ses propres choix. Des consignes d’auto-revue ou la réflexion étendue n’y changent pas grand-chose.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Dans la même session, le modèle a déjà justifié ses choix : il a tendance à les confirmer plutôt qu’à les remettre en cause. Lui demander « vérifie ton code » donne souvent une validation rapide. Ce n’est pas un manque de sérieux, c’est l’effet du raisonnement déjà présent dans le contexte."
          },
          {
            p: "<i>Exemple :</i> une fonction générée oublie de gérer la liste vide ; la relecture dans la même session conclut « le code est correct et gère les cas usuels ». Une instance neuve, qui reçoit seulement le code et les exigences, signale immédiatement le cas de la liste vide."
          }
        ]
      },
      {
        h: "Instance de revue indépendante",
        lvl: "essentiel",
        p: "Une <b>seconde instance</b> de Claude, sans le contexte de raisonnement du générateur, détecte mieux les problèmes subtils.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Une instance indépendante ne reçoit que ce qu’il faut pour juger : le code, les exigences, les critères de revue. Elle n’a pas le raisonnement de l’auteur, donc pas ses angles morts. C’est l’équivalent d’une relecture par un collègue qui n’a pas participé au développement."
          },
          {
            p: "<i>Exemple :</i> dans un pipeline, l’étape « génération » et l’étape « revue » sont deux appels séparés à l’API ; la revue reçoit le diff et la spécification, jamais la conversation de génération."
          }
        ]
      },
      {
        h: "Revue multi-passes",
        lvl: "essentiel",
        points: ["<b>Passes par fichier et passe d’intégration</b> : analyse locale fichier par fichier, puis passe séparée sur les flux de données entre fichiers.", "Cela évite la dilution de l’attention et les signalements contradictoires d’une revue en une seule passe.", "<b>Confiance auto-déclarée pour le routage</b> : dans une passe de vérification, le modèle indique sa confiance pour chaque signalement, ce qui permet de router la revue (humaine ou non) de façon calibrée."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> La revue multi-passes organise l’attention : d’abord chaque fichier avec la même grille, puis les interactions entre fichiers. On peut ajouter une passe de vérification où chaque remarque reçoit un niveau de confiance, pour envoyer les remarques incertaines à un humain et publier directement les plus sûres."
          },
          {
            p: "<i>Exemple :</i> PR de 18 fichiers : 18 passes locales (problèmes par fichier), 1 passe d’intégration (flux de données entre service, contrôleur et tests), 1 passe de vérification qui classe les remarques par confiance."
          }
        ]
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
        p: "En résumant au fil de l’eau, les montants, pourcentages, dates et attentes exprimées par le client deviennent flous (« le client veut un remboursement »). Parade : un <b>bloc « case facts »</b> persistant (montants, dates, numéros de commande, statuts) inclus dans chaque prompt, en dehors de l’historique résumé ; pour plusieurs problèmes, une couche de données structurées par problème.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Résumer au fil de l’eau est nécessaire pour les longues conversations, mais chaque résumé « arrondit » : les chiffres deviennent des ordres de grandeur, les dates des périodes, les demandes précises des intentions vagues. Au bout de plusieurs résumés, l’information critique a disparu. On protège donc les faits essentiels dans un bloc séparé, jamais résumé."
          },
          {
            p: "<i>Exemple :</i> début de conversation : « je veux être remboursé de 35,90 € avant le 12 mars ». Après trois résumés : « le client souhaite un geste commercial ». Avec un bloc de faits, le montant et l’échéance restent intacts dans chaque prompt."
          }
        ]
      },
      {
        h: "Effet « lost in the middle »",
        lvl: "essentiel",
        p: "Le modèle traite bien le début et la fin d’une longue entrée mais peut omettre le milieu. Parade : placer un résumé des résultats clés <b>au début</b> et organiser les détails avec des titres de section explicites.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Dans une très longue entrée, le modèle accorde plus d’attention au début et à la fin qu’au milieu. Une information cruciale noyée au milieu de 40 pages risque d’être ignorée. La parade est éditoriale : un résumé des points clés en tête, des titres de section explicites, et la question posée à la fin."
          },
          {
            p: "<i>Exemple :</i> une synthèse reçoit 25 résultats de recherche ; en plaçant en tête « Points clés : 1) … 2) … 3) … » puis les résultats détaillés sous des titres, les trois points clés figurent tous dans le rapport final."
          }
        ]
      },
      {
        h: "Accumulation des résultats d’outils",
        lvl: "essentiel",
        points: ["Un résultat d’outil verbeux (plus de 40 champs pour une commande quand 5 suffisent) consomme des tokens sans rapport avec son utilité.", "<b>Réduction des sorties d’outils</b> : ne garder que les champs utiles avant qu’ils ne s’accumulent.", "Faire renvoyer aux agents en amont des données structurées (faits clés, citations, scores de pertinence) plutôt que du texte verbeux, et des métadonnées (dates, sources, méthode)."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Chaque appel d’outil ajoute son résultat au contexte, et ce résultat reste là pour toute la suite de la conversation. Un résultat de 40 champs dont 5 sont utiles coûte donc 8 fois trop, à chaque tour. Élaguer à la source, dans l’outil ou dans un hook, est le levier le plus efficace."
          },
          {
            p: "<i>Exemple :</i> un agent de support consulte 6 commandes dans une conversation ; sans élagage, 24 000 tokens de résultats ; en ne gardant que statut, date, montant et éligibilité au retour, moins de 2 000."
          }
        ]
      },
      {
        h: "Historique complet",
        lvl: "essentiel",
        p: "L’API est sans état : chaque requête doit transmettre l’<b>historique complet</b> utile de la conversation pour garder la cohérence.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> L’API ne garde aucune mémoire entre deux appels : chaque requête doit contenir tout ce dont le modèle a besoin pour répondre de façon cohérente. Une application qui n’envoie que le dernier message obtient un assistant amnésique. Gérer la longueur de cet historique (résumé, bloc de faits, élagage) fait partie du travail."
          },
          {
            p: "<i>Exemple :</i> l’utilisateur écrit « et pour la deuxième commande ? » ; sans l’historique, le modèle ne sait pas de quelles commandes il s’agit."
          }
        ]
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
        points: ["<b>Demande explicite d’un humain</b> par le client : l’honorer immédiatement, sans investiguer d’abord.", "<b>Lacunes de politique</b> : la politique est muette ou ambiguë sur la demande (alignement sur le prix d’un concurrent quand la politique ne parle que des ajustements sur le site). Ce sont les exceptions, pas seulement la complexité, qui justifient l’escalade.", "<b>Incapacité à progresser</b>."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Escalader est une décision métier, pas un aveu d’échec. Trois situations la justifient : le client le demande, la politique ne couvre pas le cas, ou l’agent n’avance plus. En dehors de ces cas, un agent qui escalade « par prudence » coûte cher et frustre le client qui attendait une solution rapide."
          },
          {
            p: "<i>Exemple :</i> demande explicite : « Je veux parler à quelqu’un. » Lacune : « Pouvez-vous vous aligner sur le prix d’un concurrent ? » alors que la politique ne parle que des prix du site. Blocage : trois échanges sans réussir à identifier la commande."
          }
        ]
      },
      {
        h: "Frustration et cas simples",
        lvl: "essentiel",
        p: "Un client frustré mais dont le problème est simple et à la portée de l’agent : reconnaître la frustration, proposer la résolution, et n’escalader que s’il réitère sa demande.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> La frustration est une émotion, pas une mesure de complexité. Un client agacé par un colis abîmé a un problème simple : le remplacement. Lui proposer immédiatement la solution, en reconnaissant sa gêne, le satisfait mieux qu’un transfert qui le fait attendre encore. L’escalade reste possible s’il la redemande."
          },
          {
            p: "<i>Exemple :</i> « C’est inadmissible, le colis est arrivé cassé ! » → « Je suis désolé pour ce désagrément. Je peux vous envoyer un remplacement dès aujourd’hui, sans frais. Souhaitez-vous que je le fasse ? »"
          }
        ]
      },
      {
        h: "Indicateurs peu fiables",
        lvl: "essentiel",
        points: ["<b>Escalade fondée sur le sentiment peu fiable</b> : le sentiment ne reflète pas la complexité du cas.", "<b>Confiance auto-déclarée peu fiable</b> : un modèle mal calibré est justement trop confiant sur les cas difficiles.", "La parade proportionnée : des <b>critères d’escalade explicites</b> avec des exemples few-shot dans le prompt système, avant d’ajouter de l’infrastructure (classifieur)."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Il est tentant de mesurer la difficulté par des indicateurs faciles à obtenir : le sentiment du client ou la confiance annoncée par le modèle. Les deux trompent : un client poli peut avoir un cas très complexe, et un modèle peut être très confiant sur un cas qu’il traite mal. Des critères explicites, illustrés par des exemples, sont la base fiable."
          },
          {
            p: "<i>Exemple :</i> un client courtois demande l’application d’une clause contractuelle inhabituelle ; le sentiment est positif, la confiance du modèle élevée, mais c’est une exception de politique : il faut escalader."
          }
        ]
      },
      {
        h: "Correspondances multiples et identifiants supplémentaires",
        lvl: "essentiel",
        p: "Si <code>get_customer</code> renvoie plusieurs clients, l’agent demande des <b>identifiants supplémentaires</b> (e-mail, numéro de commande) au lieu de choisir par heuristique.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Choisir au hasard parmi plusieurs clients correspondants, c’est risquer d’agir sur le mauvais compte : divulguer des données, rembourser la mauvaise personne. La seule réponse sûre est de demander un identifiant discriminant."
          },
          {
            p: "<i>Exemple :</i> <code>get_customer(\"Martin Durand\")</code> renvoie trois comptes. L’agent répond : « J’ai trouvé plusieurs comptes à ce nom. Pouvez-vous me donner l’e-mail associé ou un numéro de commande récent ? »"
          }
        ]
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
        p: "Le sous-agent en échec renvoie un <b>contexte d’erreur structuré</b> : type d’échec, requête tentée, résultats partiels, alternatives possibles. Le coordinateur peut alors réessayer autrement, changer d’approche ou poursuivre avec les résultats partiels.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un coordinateur ne peut décider intelligemment que s’il sait ce qui s’est passé. « Erreur » ne lui dit rien ; « délai dépassé sur la recherche X après deux tentatives, trois résultats partiels obtenus, alternative possible : base documentaire interne » lui permet de choisir entre réessayer, changer de source ou continuer avec ce qu’il a."
          },
          {
            p: "<i>Exemple :</i> le sous-agent renvoie <code>{\"statut\": \"partiel\", \"type_echec\": \"timeout\", \"requete\": \"…\", \"resultats_partiels\": [3 éléments], \"alternatives\": [\"archive interne\"]}</code> ; le coordinateur lance l’alternative et poursuit."
          }
        ]
      },
      {
        h: "Échec d’accès ou résultat vide valide",
        lvl: "essentiel",
        p: "Un délai dépassé (échec d’accès, qui appelle une décision de nouvelle tentative) et une recherche réussie sans résultat (résultat vide valide) doivent être distingués dans le rapport d’erreur.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Ces deux situations se ressemblent (« pas de résultat ») mais n’ont rien à voir. Un échec d’accès signifie « on ne sait pas » : il faut réessayer ou chercher ailleurs. Un résultat vide signifie « on sait qu’il n’y a rien » : c’est une conclusion. Les confondre conduit soit à des tentatives inutiles, soit à de fausses certitudes."
          },
          {
            p: "<i>Exemple :</i> recherche « réglementation 2026 sur X » : délai dépassé → échec d’accès, à réessayer. Même recherche, réponse sans document → résultat vide, à mentionner dans le rapport comme « aucun texte trouvé à ce jour »."
          }
        ]
      },
      {
        h: "Anti-patterns",
        lvl: "essentiel",
        points: ["<b>Statuts d’erreur génériques</b> (« search unavailable ») : ils cachent au coordinateur l’information utile.", "<b>Erreurs supprimées en silence</b> : renvoyer un résultat vide marqué comme succès empêche toute reprise.", "<b>Arrêt complet sur un seul échec</b> : terminer tout le workflow alors qu’une reprise était possible.", "Le sous-agent traite localement les échecs transitoires et ne remonte que ce qu’il ne peut résoudre."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Les trois anti-patterns ont la même conséquence : ils privent le système d’une décision éclairée. Le statut générique cache la cause. Le succès vide masque l’échec et produit un rapport faussement complet. L’arrêt total jette le travail déjà fait pour un incident souvent récupérable."
          },
          {
            p: "<i>Exemple :</i> sur cinq sous-agents, un seul échoue ; arrêter tout le workflow perd quatre analyses valides, alors qu’il suffisait de poursuivre en signalant la lacune."
          }
        ]
      },
      {
        h: "Annotations de couverture",
        lvl: "avancé",
        p: "La synthèse finale indique, par des <b>annotations de couverture</b>, quels résultats sont bien étayés et quelles zones restent lacunaires faute de sources disponibles.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un rapport honnête dit ce qu’il sait et ce qu’il ne sait pas. Les annotations de couverture indiquent, partie par partie, si les conclusions reposent sur plusieurs sources solides ou si des sources ont manqué. Le lecteur sait ainsi où faire confiance et où rester prudent."
          },
          {
            p: "<i>Exemple :</i> « Impact économique : bien étayé (5 sources concordantes). Impact réglementaire : couverture partielle, la base juridique principale était indisponible lors de la recherche. »"
          }
        ]
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
        p: "Dans une longue session, le modèle donne des réponses incohérentes et parle de « motifs typiques » au lieu des classes précises découvertes plus tôt : c’est le signe d’une <b>dégradation du contexte</b>.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Au-delà d’un certain volume, le contexte devient un brouillard : informations anciennes, explorations abandonnées, résultats redondants. Le modèle commence à répondre de façon générique ou incohérente. Repérer ce signal est important : continuer à poser des questions dans une session dégradée produit des réponses de moins en moins fiables."
          },
          {
            p: "<i>Exemple :</i> après deux heures d’exploration, Claude répond « le service de paiement suit probablement le modèle habituel » alors qu’il avait identifié précisément <code>PaymentRetryService</code> une heure plus tôt : il est temps de résumer et de repartir."
          }
        ]
      },
      {
        h: "Fichiers scratchpad et délégation à des sous-agents",
        lvl: "essentiel",
        points: ["<b>Fichiers scratchpad</b> : l’agent consigne les résultats clés dans un fichier et s’y réfère ensuite.", "<b>Délégation à des sous-agents</b> pour les questions précises (« trouve tous les fichiers de test », « trace les dépendances du flux de remboursement ») : l’agent principal garde la vue d’ensemble.", "Résumer une phase d’exploration avant de lancer les sous-agents de la phase suivante, et injecter ce résumé dans leur contexte initial."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Le scratchpad est un carnet de notes externe : ce qui y est écrit survit aux résumés et aux nouvelles sessions. La délégation, elle, évite que les explorations verbeuses n’encombrent le contexte principal. Ensemble, elles permettent de mener de longues investigations sans perdre le fil."
          },
          {
            p: "<i>Exemple :</i> l’agent principal tient <code>NOTES.md</code> (classes clés, décisions, questions ouvertes) et délègue « liste tous les appels à l’API de paiement » à un sous-agent, qui renvoie une liste de dix lignes."
          }
        ]
      },
      {
        h: "Persistance d’état et manifeste",
        lvl: "avancé",
        p: "Pour la <b>reprise après crash</b>, chaque agent exporte son état à un emplacement connu ; le coordinateur charge un <b>manifeste</b> à la reprise et l’injecte dans les prompts des agents.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un long travail multi-agents peut être interrompu (plantage, délai, redémarrage). Si chaque agent écrit régulièrement son état dans un fichier connu, et que le coordinateur tient un manifeste (qui a fait quoi, où sont les résultats), la reprise consiste à relire le manifeste et à relancer seulement ce qui manque."
          },
          {
            p: "<i>Exemple :</i> manifeste : « exploration-tests : terminé (resultats/tests.md) ; exploration-api : terminé (resultats/api.md) ; exploration-bdd : en cours, dernier état resultats/bdd_partiel.md ». Après un plantage, seul l’agent bdd est relancé, avec son état partiel."
          }
        ]
      },
      {
        h: "/compact",
        lvl: "essentiel",
        p: "<code>/compact</code> réduit l’usage du contexte quand il se remplit de sorties de découverte verbeuses pendant une longue exploration.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> <code>/compact</code> remplace l’historique de la session par un résumé, ce qui libère de la place. C’est utile quand le contexte s’est rempli de sorties de découverte devenues inutiles. On peut orienter le résumé en précisant ce qu’il doit conserver."
          },
          {
            p: "<i>Exemple :</i> <code>/compact Conserve la liste des fichiers modifiés, les décisions d’architecture et les étapes restantes.</code>"
          }
        ]
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
        p: "97 % d’exactitude globale peut cacher un type de document ou un champ très mal traité. Il faut l’<b>exactitude par type de document et par champ</b> avant de réduire la revue humaine.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Une moyenne cache les écarts. Si 90 % des documents sont faciles et bien traités, l’exactitude globale paraît excellente même si les 10 % restants sont mal traités. Avant de réduire la revue humaine, on découpe l’exactitude par type de document et par champ, et on regarde les segments les plus faibles."
          },
          {
            p: "<i>Exemple :</i> 97 % d’exactitude globale, mais 99 % sur les factures nationales, 82 % sur les factures étrangères et 61 % sur le champ « numéro de TVA » : la revue humaine reste nécessaire pour ces deux segments."
          }
        ]
      },
      {
        h: "Échantillonnage aléatoire stratifié",
        lvl: "essentiel",
        p: "Même les extractions à haute confiance sont échantillonnées, par strates (types de documents, champs), pour mesurer le taux d’erreur en continu et détecter de nouveaux motifs d’erreur.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Ne relire que les extractions douteuses laisse passer les erreurs commises avec assurance. L’échantillonnage stratifié relit aussi, au hasard, une petite part des extractions jugées sûres, réparties par strate (type de document, fournisseur, champ). On mesure ainsi le vrai taux d’erreur et on détecte les nouveaux motifs d’erreur."
          },
          {
            p: "<i>Exemple :</i> chaque semaine, 2 % des extractions à haute confiance sont relues, en garantissant au moins 20 documents par type. Un nouveau format de facture d’un fournisseur apparaît avec 30 % d’erreurs : il est détecté en une semaine."
          }
        ]
      },
      {
        h: "Scores de confiance par champ",
        lvl: "essentiel",
        points: ["Le modèle produit un score de confiance pour chaque champ.", "Les seuils de revue sont calibrés sur des <b>jeux de validation étiquetés</b>.", "<b>Routage vers la revue humaine</b> : faible confiance, documents ambigus ou contradictoires, en priorisant une capacité de relecture limitée."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un document n’est pas « fiable » ou « douteux » en bloc : souvent, un seul champ pose problème. Les scores par champ permettent de faire relire uniquement ce champ. Les seuils se calibrent sur un jeu de documents dont on connaît les bonnes réponses, pour que « confiance 0,9 » corresponde vraiment à environ 90 % de réponses justes."
          },
          {
            p: "<i>Exemple :</i> une facture : montant 0,98, date 0,97, numéro de TVA 0,62 → seul le numéro de TVA est présenté au relecteur, avec le document source surligné."
          }
        ]
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
        p: "Quand les résultats sont compressés en résumé, le lien affirmation-source disparaît. Parade : des <b>correspondances affirmation-source</b> structurées (URL, nom du document, extrait) que chaque agent en aval préserve et fusionne.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Chaque étape de résumé est une occasion de perdre le lien entre une affirmation et sa source. Si l’agent de recherche renvoie du texte libre, l’agent de synthèse ne peut plus dire d’où vient chaque chiffre. La solution est structurelle : faire circuler des paires affirmation-source à chaque étape, et exiger leur conservation."
          },
          {
            p: "<i>Exemple :</i> le sous-agent renvoie <code>{\"affirmation\": \"Le marché a crû de 12 %\", \"extrait\": \"…grew 12%…\", \"source\": \"rapport X, p. 4\", \"date\": \"2026-01\"}</code> ; la synthèse cite « (rapport X, janvier 2026) » à côté du chiffre."
          }
        ]
      },
      {
        h: "Statistiques contradictoires",
        lvl: "essentiel",
        points: ["Deux sources crédibles donnent des chiffres différents : annoter le conflit avec l’attribution des deux sources, ne pas choisir arbitrairement.", "L’analyse des documents se termine avec les valeurs contradictoires annotées ; le coordinateur décide de la réconciliation avant la synthèse."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Deux sources crédibles qui se contredisent sont une information, pas un problème à cacher. Choisir arbitrairement une valeur trompe le lecteur ; présenter les deux avec leur source, et si possible l’explication de l’écart (méthode, périmètre), lui permet de juger."
          },
          {
            p: "<i>Exemple :</i> « Taille du marché : 12 Md€ selon l’institut A (enquête auprès des fabricants), 9,5 Md€ selon le cabinet B (données douanières) ; l’écart vient du périmètre retenu. »"
          }
        ]
      },
      {
        h: "Données temporelles",
        lvl: "essentiel",
        p: "Exiger les dates de publication ou de collecte : deux chiffres de dates différentes ne sont pas forcément contradictoires.",
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Sans date, deux chiffres différents semblent contradictoires alors qu’ils décrivent simplement deux moments. Exiger la date de publication ou de collecte dans chaque résultat permet de distinguer une évolution d’un désaccord."
          },
          {
            p: "<i>Exemple :</i> « 30 % d’adoption » (étude 2022) et « 55 % d’adoption » (étude 2025) ne se contredisent pas : ils montrent une progression, que le rapport peut présenter comme telle."
          }
        ]
      },
      {
        h: "Résultats établis ou contestés et rendu adapté au type de contenu",
        lvl: "essentiel",
        points: ["Séparer dans le rapport les résultats bien établis et les résultats contestés, en gardant la caractérisation et le contexte méthodologique des sources.", "Rendu adapté au type de contenu : données financières en tableaux, actualités en prose, résultats techniques en listes structurées."],
        blocks: [
          {
            p: "<b>Pour aller plus loin.</b> Un bon rapport aide le lecteur à doser sa confiance : ce qui fait consensus est présenté comme tel, ce qui est débattu est signalé avec les positions en présence. La forme suit le contenu : un tableau rend une comparaison de chiffres lisible, la prose convient au récit d’une actualité, une liste structure des résultats techniques."
          },
          {
            p: "<i>Exemple :</i> section « Résultats établis » (trois constats confirmés par plusieurs sources), section « Points débattus » (deux estimations divergentes avec leurs sources), tableau comparatif des chiffres clés par pays."
          }
        ]
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
