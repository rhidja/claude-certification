# Programme détaillé — Claude Certified Architect – Foundations (CCAR-F)

Source : *Claude Certified Architect – Foundations, Exam Guide*, version 1.0, en vigueur depuis juillet 2026 (code d’examen CCAR-F), publié par le Claude Certification Program d’Anthropic. Le guide peut changer sans préavis : vérifiez toujours la dernière version officielle.

Ce document reprend le **blueprint** du guide (domaines, pondérations, *task statements*, connaissances et compétences) pour servir de programme détaillé au générateur d’application. La numérotation et le découpage sont ceux du guide. Les intitulés sont traduits en français, avec l’intitulé anglais d’origine entre parenthèses. Les termes techniques (`stop_reason`, `tool_choice`, `.mcp.json`, etc.) sont gardés tels quels.

Pour chaque objectif :

- **Notions clés** : libellés courts à utiliser comme `notions` dans `data/programme.js` ;
- **Connaissances** (*Knowledge of*) et **Compétences** (*Skills in*) : ce que mesurent les questions.
- **En pratique** : explication, exemples concrets et piège classique. Ces blocs sont des **compléments pédagogiques** qui ne font pas partie du guide officiel : ils servent à rédiger les cours, mais seuls les connaissances et compétences ci-dessus définissent ce qui est évalué.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Une boucle agentique n’est rien d’autre qu’un `while` : tant que Claude demande des outils (`stop_reason == "tool_use"`), votre code les exécute et lui renvoie les résultats ; dès qu’il répond `end_turn`, la boucle s’arrête. Le modèle décide *quoi* faire, votre code décide *comment* l’exécuter.

*Exemple (Python, SDK `anthropic`) :*

```python
import anthropic

client = anthropic.Anthropic()          # lit ANTHROPIC_API_KEY dans l’environnement
MODEL = "<identifiant du modèle>"
TOOLS = [{
    "name": "lookup_order",
    "description": "Recherche une commande par numéro (4 à 8 chiffres). Renvoie statut et date de livraison.",
    "input_schema": {"type": "object",
                     "properties": {"order_id": {"type": "string"}},
                     "required": ["order_id"]}
}]

def executer(bloc):
    resultat = ma_base.lookup_order(bloc.input["order_id"])   # votre code métier
    return {"type": "tool_result", "tool_use_id": bloc.id, "content": str(resultat)}

messages = [{"role": "user", "content": "Où en est ma commande 7781 ?"}]
for _ in range(20):                                   # garde-fou, pas mécanisme d’arrêt
    r = client.messages.create(model=MODEL, max_tokens=1024, tools=TOOLS, messages=messages)
    messages.append({"role": "assistant", "content": r.content})
    if r.stop_reason != "tool_use":
        break
    messages.append({"role": "user",
                     "content": [executer(b) for b in r.content if b.type == "tool_use"]})
```

*Piège classique :* arrêter la boucle parce que la réponse « contient du texte » ou dit « j’ai terminé ». Claude écrit souvent une phrase *et* demande un outil dans la même réponse.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Le coordinateur est un chef de projet : il découpe, distribue, vérifie et assemble. Les sous-agents sont des spécialistes qui ne voient que leur dossier. Toute communication passe par le chef, ce qui permet de tracer qui a demandé quoi et de gérer les échecs au même endroit.

*Exemple :* pour « l’IA dans les industries créatives », une bonne décomposition couvre arts visuels, musique, écriture, cinéma, jeu vidéo et aspects juridiques (droit d’auteur). Si le coordinateur ne crée que trois sous-tâches sur les arts visuels, le rapport sera propre mais incomplet, et aucun sous-agent n’aura commis d’erreur.

*Piège classique :* chercher la cause d’un rapport incomplet du côté de la synthèse ou de la recherche web, alors que les journaux du coordinateur montrent que la décomposition était trop étroite.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Un sous-agent démarre « amnésique » : il ne connaît que son prompt. Le coordinateur doit donc lui transmettre explicitement les résultats utiles, idéalement dans un format structuré qui garde les sources. Pour paralléliser, le coordinateur émet plusieurs appels de l’outil Task dans la même réponse.

*Exemple de contexte transmis au sous-agent de synthèse :*

```json
{
  "objectif": "Synthèse de 800 mots sur l’adoption des véhicules électriques en Europe",
  "resultats": [
    {"affirmation": "Les ventes ont progressé de 12 % en 2025",
     "extrait": "…sales grew 12% year over year…",
     "source": "https://exemple.org/rapport-2025", "date": "2026-01-15"}
  ]
}
```

*Piège classique :* écrire au sous-agent « utilise ce qu’on a trouvé plus tôt ». Il ne voit pas la conversation du coordinateur et ne sait pas de quoi on parle.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Un prompt est une consigne, un contrôle programmatique est une serrure. Si une erreur d’ordre peut coûter de l’argent ou violer une obligation, il faut une serrure : le code refuse d’exécuter l’étape tant que la précédente n’est pas validée.

*Exemple (pseudo-code) :*

```python
def avant_appel_outil(nom, args, etat):
    if nom in ("process_refund", "lookup_order") and not etat.get("client_verifie"):
        return refuser("Vérifiez d’abord le client avec get_customer.")
    return autoriser()
```

*Exemple de résumé de transmission vers un humain :* « Client C-1029 (vérifié) — Double prélèvement sur la commande 8841 (cause : deux tentatives de paiement acceptées) — Montant : 59,90 € — Action recommandée : rembourser un des deux prélèvements. »

*Piège classique :* ajouter des majuscules ou des exemples au prompt pour « renforcer » une règle financière : cela réduit les oublis sans jamais les supprimer.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Les hooks sont des points d’ancrage où votre code s’exécute automatiquement : *avant* un appel d’outil (pour l’autoriser ou le bloquer) ou *après* (pour transformer le résultat avant que Claude le lise). Ils servent à la conformité et à la normalisation, pas au style des réponses.

*Exemple de normalisation (avant / après un hook `PostToolUse`) :*

| Source | Valeur brute | Après normalisation |
|---|---|---|
| Service commandes | `1709251200` | `2024-03-01` |
| Service livraisons | `01/03/2024` | `2024-03-01` |
| Service retours | `{"status": 3}` | `{"status": "remboursé"}` |

*Exemple de conformité :* un hook placé avant `process_refund` lit le montant ; au-delà de 500 $, il bloque l’appel et renvoie au modèle « Montant supérieur au plafond : utiliser escalate_to_human ».

*Piège classique :* confondre les deux moments. Pour *empêcher* une action, il faut agir avant l’appel ; `PostToolUse` arrive trop tard.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Deux familles de découpage : le pipeline fixe (on sait d’avance quelles étapes faire) et le plan adaptatif (on découvre les étapes en avançant). Le choix dépend de la prévisibilité de la tâche, pas de sa taille.

*Exemples :*

| Tâche | Stratégie |
|---|---|
| Revoir chaque PR selon sécurité, performance, tests | Pipeline fixe : une passe par aspect, ou une passe par fichier puis une passe d’intégration |
| « Ajoute des tests à ce code legacy » | Plan adaptatif : cartographier, prioriser les zones critiques, réviser le plan quand on découvre une dépendance |
| « Pourquoi les ventes ont-elles baissé en mars ? » | Plan adaptatif : chaque découverte oriente la recherche suivante |

*Piège classique :* analyser 25 fichiers en une seule passe. L’attention se dilue : certains fichiers sont bien relus, d’autres survolés, et les avis se contredisent.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Reprendre une session, c’est rouvrir le même cahier ; dériver (fork), c’est photocopier le cahier pour essayer deux pistes ; repartir de zéro avec un résumé, c’est recopier au propre uniquement ce qui est encore vrai.

*Arbre de décision :*

- Le code a peu changé → reprendre (`--resume <nom>`) et signaler les fichiers modifiés.
- Deux approches à comparer à partir de la même analyse → `fork_session`.
- Le code a beaucoup changé et l’historique contient des lectures obsolètes → nouvelle session avec un résumé structuré.

*Exemple de consigne à la reprise :* « Depuis hier, `src/billing/invoice.ts` a été réécrit et `src/billing/tax.ts` supprimé. Mets à jour uniquement les conclusions qui en dépendent. »

*Piège classique :* reprendre une session dont les résultats d’outils décrivent un code qui n’existe plus : Claude raisonne alors sur une version périmée.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Pour Claude, un outil *est* sa description : c’est le seul texte qui lui dit à quoi il sert. Une bonne description répond à quatre questions : que fait l’outil, qu’attend-il, que renvoie-t-il, et quand faut-il plutôt utiliser un autre outil ?

*Avant / après :*

- Avant : `get_customer` — « Récupère les infos client. »
- Après : `get_customer` — « Recherche un client par e-mail ou numéro de téléphone (ex. `jean@exemple.fr`). Renvoie identifiant, nom et statut du compte. À utiliser pour identifier la personne. Pour une question sur une commande précise dont on connaît le numéro, utiliser `lookup_order`. »

*Piège classique :* corriger une mauvaise sélection en ajoutant une couche de routage ou en fusionnant les outils avant d’avoir simplement amélioré les descriptions.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Une erreur bien formée dit à l’agent *quoi faire ensuite* : réessayer, corriger son appel, expliquer un refus ou abandonner cette piste. « Operation failed » ne dit rien de tout cela.

*Exemple de réponse d’erreur MCP :*

```json
{
  "isError": true,
  "content": [{"type": "text",
               "text": "{\"errorCategory\": \"business\", \"isRetryable\": false, \"description\": \"Délai de retour de 30 jours dépassé (commande du 2 janvier).\"}"}]
}
```

| Situation | Catégorie | Réessayer ? |
|---|---|---|
| Service indisponible, délai dépassé | transitoire | oui |
| Numéro de commande mal formé | validation | après correction de l’appel |
| Hors politique de remboursement | métier | non, expliquer au client |
| Accès refusé | permission | non |
| Recherche réussie, zéro résultat | pas une erreur | — |

*Piège classique :* renvoyer `isError` pour une recherche qui ne trouve rien : l’agent croit à une panne et réessaie inutilement.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Chaque outil supplémentaire est une option de plus à évaluer à chaque tour. Un agent spécialisé avec 4 ou 5 outils choisit mieux qu’un généraliste avec 18. `tool_choice` permet en plus d’imposer qu’un outil soit appelé.

*Les trois modes de `tool_choice` :*

```python
tool_choice={"type": "auto"}                               # outil ou texte, au choix du modèle
tool_choice={"type": "any"}                                # un outil obligatoire, au choix du modèle
tool_choice={"type": "tool", "name": "extract_metadata"}   # cet outil précis
```

*Exemple de répartition :* sous-agent de recherche (recherche web, chargement de document), sous-agent d’analyse (extraction, résumé), sous-agent de synthèse (rédaction + un `verify_fact` limité pour les vérifications simples).

*Piège classique :* donner tous les outils à tous les agents « pour la souplesse » : l’agent de synthèse se met à chercher sur le web au lieu de synthétiser.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Le MCP branche Claude sur vos systèmes. La question clé est la portée : ce qui sert à toute l’équipe va dans le dépôt (`.mcp.json`), ce qui est personnel ou expérimental va dans votre configuration utilisateur (`~/.claude.json`). Les secrets ne sont jamais écrits en clair : on référence une variable d’environnement.

*Exemple de `.mcp.json` partagé :*

```json
{
  "mcpServers": {
    "tickets": {
      "command": "<commande-du-serveur>",
      "env": { "TICKETS_TOKEN": "${TICKETS_TOKEN}" }
    }
  }
}
```

*Exemple de ressource utile :* exposer « liste des tickets ouverts avec leur résumé » en ressource MCP évite à l’agent dix appels exploratoires pour découvrir ce qui existe.

*Piège classique :* une description d’outil MCP trop pauvre ; l’agent lui préfère alors Grep, moins adapté mais mieux connu.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Les outils intégrés se choisissent selon la question posée : *où est ce texte ?* (Grep), *où sont ces fichiers ?* (Glob), *que contient ce fichier ?* (Read), *modifier un passage précis* (Edit), *réécrire tout le fichier* (Write), *exécuter une commande* (Bash).

| Besoin | Outil |
|---|---|
| Tous les appels à `calculateTax` | Grep |
| Tous les fichiers `**/*.test.tsx` | Glob |
| Comprendre un fichier trouvé | Read |
| Remplacer une ligne unique | Edit |
| Edit échoue (texte présent plusieurs fois) | Read puis Write |

*Exemple de démarche incrémentale :* Grep sur `refund(` pour trouver les points d’entrée, Read des deux fichiers trouvés, puis suivre leurs imports, au lieu de lire 300 fichiers d’emblée.

*Piège classique :* chercher les usages d’une fonction réexportée sous un alias en ne cherchant que son nom d’origine.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

CLAUDE.md est la mémoire permanente de Claude Code. Où le placer détermine qui le reçoit : vous seul (`~/.claude/CLAUDE.md`), toute l’équipe (CLAUDE.md du projet), ou seulement ceux qui travaillent dans un dossier (CLAUDE.md de sous-dossier).

*Exemple d’organisation modulaire :*

```
CLAUDE.md                     # standards communs + @import ciblés
.claude/rules/testing.md
.claude/rules/api-conventions.md
.claude/rules/deployment.md
packages/billing/CLAUDE.md    # @import ../../docs/standards/money.md
```

*Exemple de diagnostic :* « La nouvelle développeuse ne reçoit pas les règles de test » → `/memory` montre que les règles sont dans le `~/.claude/CLAUDE.md` de son collègue, pas dans le projet.

*Piège classique :* mettre les conventions d’équipe dans le CLAUDE.md utilisateur : elles fonctionnent chez leur auteur et nulle part ailleurs.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Une commande slash est un raccourci de prompt que l’on déclenche à la main ; un skill est un savoir-faire empaqueté que l’on invoque à la demande, avec son propre réglage (outils autorisés, contexte isolé). CLAUDE.md, lui, est toujours chargé.

*Exemple de `SKILL.md` :*

```markdown
---
name: audit-dependances
description: Analyse les dépendances d’un package et liste les risques.
context: fork
allowed-tools: Read, Grep, Glob, Bash
argument-hint: <chemin du package>
---
Pour le package indiqué : lister les dépendances, signaler les versions
majeures en retard et les paquets non maintenus. Rendre un tableau.
```

*Quand utiliser quoi :* une règle valable tout le temps → CLAUDE.md ; un workflow ponctuel → skill ou commande ; une sortie verbeuse → skill avec `context: fork`.

*Piège classique :* modifier le skill partagé pour ses besoins personnels au lieu de créer une variante sous un autre nom dans `~/.claude/skills/`.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Une règle par chemin est une consigne qui ne s’active que lorsqu’on touche certains fichiers. Elle suit le *type* de fichier, pas son dossier, ce qui la rend idéale pour les tests, les migrations ou l’infrastructure dispersés dans le dépôt.

*Exemple :*

```markdown
---
paths: ["**/migrations/**/*.sql"]
---
Migrations : toujours réversibles, jamais de DROP sans sauvegarde,
une seule modification de schéma par fichier.
```

*Comparaison :* un CLAUDE.md dans `db/` ne couvrirait pas les migrations rangées dans `services/*/migrations/` ; la règle glob, si.

*Piège classique :* tout mettre dans le CLAUDE.md racine « sous des titres » en comptant sur Claude pour deviner quelle section s’applique.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Le plan mode, c’est « réfléchir avant de toucher ». Il coûte un peu de temps au départ et en économise beaucoup quand la tâche est grosse ou ambiguë. Pour un petit changement évident, il ralentit inutilement.

| Tâche | Mode |
|---|---|
| Corriger une division par zéro signalée par une trace précise | Exécution directe |
| Ajouter une validation de format d’e-mail dans un formulaire | Exécution directe |
| Remplacer l’ORM dans 40 fichiers | Plan mode, puis exécution |
| Choisir entre file de messages et appels synchrones | Plan mode |

*Exemple d’enchaînement :* plan mode pour cartographier la migration (avec le sous-agent Explore pour ne pas saturer le contexte), validation du plan, puis exécution directe étape par étape.

*Piège classique :* partir en exécution directe sur une refonte « pour voir ce qui émerge » et découvrir les dépendances après avoir modifié vingt fichiers.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Quand Claude ne comprend pas ce que vous voulez, décrire davantage aide moins que *montrer*. Trois leviers : des exemples d’entrée / sortie, des tests écrits à l’avance, et des questions que Claude vous pose avant de coder.

*Exemple d’exemples d’entrée / sortie :*

```
"12 rue des Lilas 75011 paris"   → {"rue": "12 rue des Lilas", "cp": "75011", "ville": "Paris"}
"BP 45, 69002 LYON CEDEX"        → {"rue": "BP 45", "cp": "69002", "ville": "Lyon"}
"Lieu-dit Le Moulin, 24200"      → {"rue": "Lieu-dit Le Moulin", "cp": "24200", "ville": null}
```

*Exemple de pattern d’interview :* « Avant d’écrire le cache, pose-moi les questions nécessaires. » Claude demande alors : durée de vie des entrées, invalidation à la modification, comportement si le cache est indisponible…

*Piège classique :* envoyer cinq problèmes liés un par un ; chaque correction en casse une autre. Les problèmes liés se décrivent ensemble.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

En CI, personne ne peut répondre à Claude : il faut le mode non interactif (`-p`), une sortie lisible par une machine (`--output-format json` et `--json-schema`) et un contexte de projet fourni par CLAUDE.md.

*Exemple d’étape de pipeline :*

```bash
claude -p "Revois les fichiers modifiés de cette PR. Signale uniquement bugs et failles. \
Voici les commentaires des revues précédentes : ne répète pas ceux déjà traités." \
  --output-format json --json-schema .ci/revue.schema.json > revue.json
```

*Exemple de schéma attendu (extrait) :* chaque commentaire contient `fichier`, `ligne`, `categorie`, `severite`, `message`, ce qui permet de les publier automatiquement à la bonne ligne de la PR.

*Piège classique :* faire relire le code par la session qui l’a généré ; une instance indépendante, sans ce raisonnement préalable, trouve davantage de problèmes.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

« Sois prudent » ne dit pas à Claude *quoi* signaler. Un bon prompt de revue définit des catégories précises, ce qu’il faut ignorer, et des exemples de chaque niveau de sévérité.

*Avant / après :*

- Avant : « Fais une revue sérieuse et ne signale que ce dont tu es sûr. »
- Après : « Signale uniquement : (1) données utilisateur insérées sans paramètre dans une requête SQL ; (2) secret écrit en clair ; (3) route sans contrôle d’accès. Ignore le style, le nommage et les conventions propres à l’équipe. Sévérité *critique* = exploitable à distance (ex. injection SQL) ; *majeure* = fuite de données internes ; *mineure* = mauvaise pratique sans impact direct. »

*Piège classique :* garder active une catégorie qui produit 70 % de faux positifs ; les développeurs finissent par ignorer aussi les alertes justes.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Un exemple vaut mieux qu’un paragraphe d’instructions : il montre le format attendu, la façon de trancher les cas ambigus et la conduite à tenir quand une information manque. 2 à 4 exemples bien choisis suffisent.

*Exemple few-shot pour une revue :*

```
Code : password = "admin123"
Sortie : {"ligne": 12, "probleme": "Secret en clair", "severite": "critique",
          "correctif": "Lire la valeur depuis une variable d’environnement"}

Code : const MAX_RETRY = 3
Sortie : aucun signalement (constante nommée, pratique acceptable)
```

Le second exemple compte autant que le premier : il apprend à Claude ce qu’il ne faut *pas* signaler.

*Piège classique :* ne donner que des exemples « faciles ». Ce sont les cas ambigus et les structures inhabituelles (tableau, bibliographie, note de bas de page) qu’il faut illustrer.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Pour obtenir un JSON fiable, on ne demande pas « réponds en JSON » : on déclare un outil dont le schéma *est* le format voulu, et Claude remplit ses paramètres. La syntaxe est alors garantie ; la cohérence des valeurs reste à vérifier.

*Exemple de schéma d’extraction :*

```json
{
  "name": "extract_invoice",
  "description": "Extrait les données d’une facture.",
  "input_schema": {
    "type": "object",
    "properties": {
      "numero": {"type": "string"},
      "date": {"type": "string", "description": "Format AAAA-MM-JJ"},
      "numero_tva": {"type": ["string", "null"], "description": "null si absent du document"},
      "categorie": {"type": "string", "enum": ["materiel", "service", "abonnement", "other", "unclear"]},
      "categorie_detail": {"type": ["string", "null"], "description": "Précision si categorie = other"},
      "total_ttc": {"type": "number"}
    },
    "required": ["numero", "date", "categorie", "total_ttc"]
  }
}
```

*Piège classique :* rendre obligatoire un champ souvent absent des documents ; Claude invente alors une valeur pour respecter le schéma.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Quand une extraction échoue à la validation, la nouvelle tentative doit dire *exactement* ce qui ne va pas. Mais réessayer ne fait jamais apparaître une information absente du document.

*Exemple de message de nouvelle tentative :*

```
Ton extraction précédente ne passe pas la validation :
- "date" vaut "3 mars 2026" : format attendu AAAA-MM-JJ.
- "total_ttc" (120,00) ≠ somme des lignes (118,80).
Voici le document et ta sortie précédente : corrige uniquement ces points.
```

*Exemple d’auto-contrôle dans le schéma :* extraire `stated_total` (le total imprimé) et `calculated_total` (la somme des lignes) ; si les deux diffèrent, positionner `conflict_detected: true` et envoyer en revue.

*Piège classique :* relancer dix fois une extraction pour un champ qui n’existe que dans une annexe non fournie.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

La Message Batches API, c’est le « tarif de nuit » : moitié prix, mais résultat dans les 24 heures, sans garantie de délai. Parfait pour ce qui peut attendre, inadapté à ce que quelqu’un attend.

*Exemple de calcul de fréquence :* SLA de 30 h, traitement d’un lot jusqu’à 24 h → un document ne doit pas attendre plus de 6 h avant d’être soumis. En soumettant toutes les 4 heures, on garde 2 h de marge.

| Charge | API |
|---|---|
| Rapport de dette technique pour le lendemain matin | Lots |
| Extraction de 50 000 archives | Lots |
| Vérification avant fusion, développeur en attente | Synchrone |
| Agent qui doit appeler des outils en cours de route | Synchrone (les lots ne font pas d’appels d’outils multi-tours) |

*Piège classique :* resoumettre tout le lot après quelques échecs, au lieu de reprendre uniquement les documents en échec grâce à leur `custom_id`.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Un auteur relit mal son propre texte : il lit ce qu’il voulait écrire. Pour Claude, c’est pareil dans une même session. La parade : une instance de relecture indépendante, et un découpage de la revue en passes ciblées.

*Exemple d’architecture de revue pour une PR de 20 fichiers :*

1. Passes locales : une par fichier, avec les critères de revue.
2. Passe d’intégration : flux de données et contrats entre fichiers.
3. Passe de vérification : chaque signalement reçoit une confiance ; les signalements peu sûrs vont à un humain.

*Piège classique :* croire qu’un modèle à plus grande fenêtre de contexte, ou trois revues identiques avec vote, résout la dilution de l’attention. Le vote supprime même des vrais bugs détectés une seule fois.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Plus une conversation est longue, plus les résumés successifs « arrondissent » les détails : 35,90 € devient « un petit montant », le 12 mars devient « bientôt ». On protège donc les faits critiques en dehors des résumés.

*Exemple de bloc « case facts » injecté dans chaque prompt :*

```
FAITS DU DOSSIER (ne pas résumer)
- Client : C-1029 (vérifié)
- Commande 8841 : double prélèvement, 2 × 59,90 €
- Commande 8850 : colis abîmé, photo reçue le 2026-03-04
- Attente du client : remboursement avant le 2026-03-12
```

*Exemple d’élagage :* d’une réponse `lookup_order` de 42 champs, ne garder que `order_id`, `status`, `delivery_date`, `amount`, `return_window`.

*Piège classique :* placer l’information clé au milieu d’un long document agrégé ; elle risque d’être ignorée (effet « lost in the middle »).

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Escalader trop souvent fait perdre l’intérêt de l’agent ; pas assez, et il prend des décisions qui ne lui reviennent pas. Les bons déclencheurs sont des faits (demande explicite, trou dans la politique, blocage), pas des impressions (ton du client, confiance annoncée par le modèle).

*Exemples :*

| Message du client | Conduite |
|---|---|
| « Passez-moi un humain. » | Escalade immédiate |
| « C’est la troisième fois que ça arrive, j’en ai marre ! » (article abîmé, cas standard) | Reconnaître l’agacement, proposer le remplacement ; escalader s’il redemande un humain |
| « Vous pouvez vous aligner sur le prix de votre concurrent ? » (politique muette) | Escalade : la politique ne couvre pas ce cas |
| `get_customer` renvoie trois « Martin Durand » | Demander l’e-mail ou un numéro de commande |

*Piège classique :* escalader dès qu’un sentiment négatif est détecté ; la colère n’indique pas la complexité.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Dans un système multi-agents, une erreur doit voyager avec son contexte : ce qui a échoué, ce qui a été tenté, ce qui a quand même été obtenu. Le coordinateur peut alors décider : réessayer autrement, poursuivre avec des résultats partiels ou signaler une lacune.

*Exemple de rapport d’erreur d’un sous-agent :*

```json
{
  "statut": "partiel",
  "type_echec": "timeout",
  "requete": "réglementation européenne IA 2025",
  "tentatives": 2,
  "resultats_partiels": [{"affirmation": "…", "source": "…"}],
  "alternatives": ["chercher dans la base documentaire interne", "élargir à 2024"]
}
```

*Piège classique :* renvoyer `[]` avec un statut « succès » après un délai dépassé ; le coordinateur conclut qu’il n’existe aucune donnée sur le sujet.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Sur une grande base de code, le contexte se remplit vite de sorties de recherche. Signe d’alerte : Claude parle de « services typiques » au lieu de citer `PaymentRetryService`, qu’il avait pourtant trouvé. Il faut alors externaliser la mémoire et déléguer.

*Exemple de fichier scratchpad (`NOTES.md`) :*

```
## Flux de remboursement
- Entrée : RefundController::create (src/api/refund.ts)
- Calcul : RefundPolicy (src/domain/refund-policy.ts) — plafond 500 $
- Paiement : PaymentRetryService (src/infra/payment/retry.ts)
## Questions ouvertes
- Où sont gérés les remboursements partiels ?
```

*Exemple de délégation :* « Sous-agent : trouve tous les fichiers de test qui couvrent le remboursement et renvoie la liste avec une ligne par fichier. »

*Piège classique :* continuer à poser des questions dans une session saturée au lieu de résumer, compacter (`/compact`) ou repartir avec les notes.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Une exactitude globale élevée peut cacher un point faible. Avant de retirer les humains de la boucle, on vérifie segment par segment, et on continue à échantillonner même ce qui semble sûr.

*Exemple :*

| Type de document | Volume | Exactitude |
|---|---|---|
| Factures françaises | 9 000 | 99 % |
| Factures étrangères | 800 | 81 % |
| Notes de frais manuscrites | 200 | 64 % |
| **Global** | 10 000 | **97 %** |

Le 97 % global masque deux segments qui exigent encore une revue humaine.

*Exemple de routage :* champ `montant` avec confiance < 0,85 (seuil calibré sur un jeu étiqueté) → revue humaine ; document marqué contradictoire → revue prioritaire ; un échantillon aléatoire stratifié des extractions à haute confiance → contrôle qualité continu.

*Piège classique :* se fier à la confiance que le modèle annonce sans l’avoir calibrée sur des données dont on connaît la bonne réponse.

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

**En pratique** *(complément pédagogique, ne fait pas partie du guide)*

Chaque résumé est une occasion de perdre une source. On conçoit donc les sorties des sous-agents pour que chaque affirmation garde son origine et sa date jusqu’au rapport final, et on montre les désaccords au lieu de les cacher.

*Exemple de présentation d’un conflit dans le rapport :*

> Taille du marché européen en 2025 : **12 Md€** selon l’Institut A (rapport publié en janvier 2026, méthode : enquête auprès des fabricants) ; **9,5 Md€** selon le Cabinet B (octobre 2025, méthode : données douanières). L’écart s’explique en partie par le périmètre retenu.

*Exemple de rendu adapté :* chiffres financiers en tableau, actualité en prose courte, résultats techniques en liste.

*Piège classique :* faire la moyenne des deux chiffres, ou garder le plus récent sans le dire ; le lecteur perd l’information qu’il existe un désaccord.

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
