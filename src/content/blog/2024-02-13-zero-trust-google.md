---
title: Zero Trust - Google
pubDate: "Jul 28 2023"
description: "Un petit tour d'horizon sur la sécurité sans périmètre, chez Google"
tags:
  - Zero Trust
  - Azure
  - GCP
  - Open Source
slug: 2024/02/13/zero-trust-google
img: /assets/stock-1.jpg
img_alt: "nice abstract image"
draft: true
---

## BeyondCorp (Google)

[BeyondCorp](https://cloud.google.com/security/products/beyondcorp-enterprise?hl=fr)

Google Cloud propose une solution Zero Trust robuste appelée BeyondCorp. Ce modèle de sécurité d’entreprise permet aux employés de travailler en toute sécurité depuis n’importe quel endroit sans dépendre d’un VPN traditionnel.

Voici les points clés concernant BeyondCorp :

1. Architecture BeyondCorp : Contrairement à l’approche de sécurité basée sur le périmètre traditionnel, BeyondCorp suppose que chaque interaction n’est pas intrinsèquement digne de confiance. Il se concentre sur la vérification de chaque interaction, quelle que soit son origine. Les employés peuvent accéder aux ressources en toute sécurité, qu’ils soient dans le réseau d’entreprise ou en télétravail.
2. Pas de VPN requis : BeyondCorp élimine le besoin d’un réseau privé virtuel (VPN). Au lieu de cela, il exploite des contrôles d’accès contextuels basés sur des facteurs tels que l’état de l’appareil, l’identité de l’utilisateur et le contexte de l’application.
3. XDR et SIEM unifiés : BeyondCorp unifie diverses fonctions de sécurité en une seule plateforme. Il offre des fonctionnalités telles que l’évaluation de la sécurité des endpoints, la détection de logiciels malveillants, la surveillance de l’intégrité des fichiers, la chasse aux menaces, l’analyse des journaux, la détection de vulnérabilités et la réponse aux incidents. Il couvre à la fois les clouds publics et privés, ainsi que les centres de données sur site.
4. Approche de Google : Google a également publié un livre blanc sur son modèle BeyondProd, qui explique comment ils protègent leur architecture cloud native. Ce modèle aide les organisations à appliquer les principes de sécurité Zero Trust à leurs propres environnements.

En résumé, BeyondCorp est la réponse de Google au paradigme Zero Trust, mettant l’accent sur la vérification continue et la sécurité dans des environnements diversifiés.
