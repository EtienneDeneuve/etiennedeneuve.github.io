---
title: Zero Trust - Un aperçu
pubDate: "Jul 28 2023"
description: "Un petit tour d'horizon sur la sécurité sans périmètre"
tags:
  - Zero Trust
  - Azure
  - GCP
  - Open Source
slug: 2024/02/11/zero-trust-overview
img: /assets/stock-1.jpg
img_alt: "nice abstract image"
draft: true
---

## Zero trust - C'est quoi en gros ?

Le modèle Zero Trust (ou architecture Zero Trust, également connu sous le nom de sécurité sans périmètre) est une approche moderne de la conception et de la mise en œuvre des systèmes informatiques dont les principes fondamentaux sont :

1. Vérification explicite : Authentifier et autoriser toujours en fonction de toutes les informations disponibles, telles que l’identité de l’utilisateur, la localisation, l’état de l’appareil, le service ou la charge de travail, la classification des données et les anomalies.
2. Accès en privilège minimal : Limiter l’accès des utilisateurs en utilisant des stratégies d’accès juste-à-temps (JIT) et juste-assez (JEA), ainsi que la protection des données pour sécuriser à la fois les données et la productivité.
3. Supposer une violation : Réduire la portée des incidents de sécurité et segmenter l’accès. Vérifier le chiffrement de bout en bout et utiliser l’analyse pour détecter les menaces et améliorer les défenses.

Le modèle Zero Trust remplace l’idée que tout derrière le pare-feu d’entreprise est sûr. Au lieu de cela, il considère chaque demande comme si elle provenait d’un réseau ouvert, vérifiant chaque accès.

## L’écosystème Zero Trust

Le Zero Trust, ou « zéro confiance », est un concept selon lequel toute architecture, conçue ou à concevoir, doit reposer sur un principe de sécurité fondamental : aucune interaction n’est fiable au départ. Contrairement aux architectures traditionnelles où une communication est considérée comme fiable dès lors qu’elle est émise derrière un pare-feu, le modèle Zero Trust remet en question cette confiance implicite et incite les entreprises à vérifier systématiquement chaque interaction.

Ce principe du “Zero Trust” s’applique partout, dans les clouds publics et privés, les applications SaaS, les environnements DevOps, l’automatisation des processus par la robotique et bien d’autres aspects. Il existe des solutions pour toutes les entreprises et services publics, quelles que soient leurs tailles.

- [x] Il s’agit d’un principe de cybersécurité visant à protéger l’environnement numérique moderne des entreprises.
- [x] Il suppose que la sécurité d’un réseau est toujours exposée aux menaces externes et internes.
- [x] Il vise à combler les failles des architectures de sécurité traditionnelles et à mieux protéger les entreprises contre les menaces croissantes et imprévisibles.

Les grands acteurs du marché (propriétaires ou open source) proposent des ressources pour aider les entreprises à adopter le Zero Trust via la mise en place de bonnes pratiques, des tendances et d’un cadre basé sur des déploiements réels. S’adaptant à la complexité des environnements modernes, le but est de protéger les personnes, les appareils, les applications et les données, où qu’ils se trouvent, et de proposer des réponses permettant d’avoir une organisation structurée et la plus fiable possible, peu importe le budget.

[Forester Report](https://reprints2.forrester.com/#/assets/2/108/RES179872/report)

## Comment démarrer ?

Pour entamer cette démarche, j'ai identifié 4 éléments technique importants dans cette transition vers le Zero Trust.

Vous aurez besoin de :

- Gérer les identités avec des protocoles modernes (oAuth2, OIDC)
- Gérer les accès réseaux depuis l'extérieur et l'intérieur
- Gérer les journaux et l'accès à vos systèmes, avec la possibilité d'interagir sur les incidents de sécurité
- Gérer les accès aux ressources, sans exposer vos serveurs, y compris pour leur administration.

#### Gestion des Identités

Pour mettre en place une architecture "Zero Trust", la gestion des identités est primordiale.

Keycloak est un gestionnaire d’identités et d’accès open source qui simplifie le processus d’authentification pour les applications et les services informatiques.

Voici quelques points clés à retenir sur Keycloak :

1. Authentification unique (SSO) : Les utilisateurs s’authentifient une seule fois avec Keycloak, plutôt qu’avec chaque application individuelle. Cela signifie que vos applications n’ont pas à gérer les formulaires de connexion, l’authentification des utilisateurs et le stockage des informations d’identification. Une fois connectés à Keycloak, les utilisateurs n’ont pas besoin de se reconnecter pour accéder à une autre application. Cela s’applique également à la déconnexion, car Keycloak propose une déconnexion unique.
2. Fédération d’identité et connexion sociale : Keycloak permet d’ajouter facilement la connexion via des réseaux sociaux via la console d’administration. Vous pouvez configurer des fournisseurs d’identité existants tels que OpenID Connect ou SAML 2.0. Aucun code ni modification de votre application n’est nécessaire.
3. Fédération d’utilisateurs : Keycloak prend en charge la connexion à des annuaires LDAP ou Active Directory existants. Vous pouvez également implémenter votre propre fournisseur si vous avez des utilisateurs dans d’autres systèmes de stockage, tels qu’une base de données relationnelle.
4. Console d’administration : Les administrateurs peuvent gérer tous les aspects du serveur Keycloak via la console d’administration. Ils peuvent configurer la fédération d’identité, gérer les applications, définir des politiques d’autorisation fines et gérer les utilisateurs.
5. Protocoles standard : Keycloak est basé sur des protocoles standard tels qu’OpenID Connect, OAuth 2.0 et SAML.

En résumé, Keycloak centralise la gestion des identités de vos utilisateurs et contrôle l’accès à vos applications et services en ligne. Il offre une solution robuste et personnalisable pour l’authentification et l’autorisation.

#### Gestion du Réseau

En 2024, les VPN traditionnels ne sont plus suffisamment flexibles. Un nouveau protocole viens remplacer progressivement les standards Ike V2, PPTP, ou OpenVPN.

WireGuard permet d'interconnecter et de gérer les différents appareils, tels que les serveurs, les clients, les appareils mobiles, etc. Des solutions comme TailScale, NetBird émergent.

Pour ceux qui souhaitent un équivalent, qui ne dépend pas du cloud et d'une souscription, Headscale est une solution qui devrait répondre à vos problématiques.

Headscale est une implémentation open source et auto-hébergée du serveur de contrôle de Tailscale.

Si vous vous souvenez de Tailscale, c’est un outil basé sur le protocole VPN WireGuard qui permet à tout le monde de créer un réseau sécurisé entre différents ordinateurs, serveurs ou même des instances dans le cloud.

L’avantage est que ce type de protocole reste simple, avec assez peu de réglages de pare-feu ou de routage compliqués.

Voici ce que vous devez savoir sur Headscale :

1. Fonctionnalités similaires à Tailscale : Headscale propose les mêmes fonctionnalités que le serveur de contrôle Tailscale, mais il est limité à la gestion d’un seul réseau Tailscale. Cela convient parfaitement à une petite entreprise ou à un usage personnel.
2. Fonctionnement : Le serveur de contrôle Headscale fonctionne de manière similaire à celui de Tailscale. Il permet aux clients Tailscale officiels de s’y connecter. Headscale gère les règles du pare-feu pour vous et fonctionne sur divers systèmes d’exploitation.
3. Objectif de conception : Headscale vise à fournir une alternative auto-hébergée et open source au serveur de contrôle Tailscale. Il s’adresse aux auto-hébergeurs et aux passionnés qui souhaitent disposer d’un serveur pour leurs projets et laboratoires. Il est conçu pour un usage personnel ou pour de petites organisations open source.
4. Fonctionnalités : Headscale prend en charge les fonctionnalités de base de Tailscale, notamment la configuration DNS, le partage de fichiers, les listes de contrôle d’accès, le support IPv4 et IPv6, la publicité des routes et bien plus encore.

Si vous souhaitez en savoir plus, vous pouvez consulter la page GitHub du projet Headscale. Profitez-en ! 🚀

#### XDR/EDR

[Site de Wazuh](https://wazuh.com)

Wazuh est une plateforme open source de détection de menaces et de réponse aux incidents, reconnue pour sa flexibilité et ses capacités d’intégration. Voici quelques points clés à retenir :

1. Unified XDR et SIEM : Wazuh unifie des fonctions historiquement séparées en un seul agent et une architecture de plateforme. Il offre une protection pour les clouds publics, les clouds privés et les centres de données sur site. Voici certaines des fonctionnalités :
   - Évaluation de la configuration de sécurité des endpoints
   - Détection de logiciels malveillants
   - Surveillance de l’intégrité des fichiers
   - Chasse aux menaces
   - Analyse des données de logs
   - Détection de vulnérabilités
   - Réponse aux incidents
   - Conformité réglementaire
   - Sécurité des conteneurs
   - Gestion de la posture de sécurité des workloads
2. SIEM complet : La solution SIEM de Wazuh assure la surveillance, la détection et l’alerte des événements de sécurité et des incidents.
3. Wazuh Cloud : Ce service offre des environnements cloud gérés, prêts à l’emploi et hautement évolutifs pour la surveillance de la sécurité et la protection des endpoints.
4. Wazuh est apprécié pour sa grande communauté, sa scalabilité, son absence de verrouillage fournisseur et son coût de licence nul.

### PAM
