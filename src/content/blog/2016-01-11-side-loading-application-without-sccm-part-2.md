---
title: Side loading application without SCCM - Part 2
description: "Automatisez le déploiement des applications avec Powershell : simplifiez le sideloading d'Appx et gérez les certificats. Découvrez le script complet sur GitHub."
draft: false
img_alt: nice abstract image
img: /assets/stock-3.jpg
lastModified: 2024-09-16T20:12:19.554Z
pubDate: 2016-01-11 18:25:02
slug: 2016/01/11/side-loading-application-without-sccm-part-2
tags:
  - Automatisation des tâches
  - Déploiement d'applications
  - Développement logiciel
  - PowerShell
---

Normalement, vous avez lu le premier article de cette petite série (partie 1 [ici :](2016/01/11/side-loading-application-without-sccm-part-1)>

## Powershell

Avec Powershell, nous pouvons automatiser des tâches et gérer nos serveurs. Quelqu'un m'a demandé de publier un AppxBundle avec un certificat nécessaire (un bon, signé par un fournisseur tiers, pas un auto-signé de mauvaise qualité) pour un client, afin de charger latéralement l'Appx et de ne pas avoir à renouveler le certificat chaque année. Il n'est pas très amusant de reconstruire un package chaque année pour un certificat, et il n'est pas possible de publier les applications sur le marché car personne ne s'en souciera et il n'y aura aucun intérêt pour les autres. Avant de créer un script pour cela, j'ai effectué une fois le processus manuellement et j'ai trouvé que c'était trop long et pas très intéressant. J'ai donc commencé mes scripts par une fonction pour effectuer les modifications XML. Powershell gère mieux les fichiers XML que moi, donc je n'ai besoin que de faire `[xml]$variable = Get-Content $myappxfile`. Mais je me suis rendu compte que mes fichiers étaient différents et nécessitaient plusieurs modifications, j'ai donc créé un Switch (astuce : utilisez Powershell ISE et appuyez sur Ctrl + J pour obtenir l'Intellisense qui fait le travail pour vous) et ajouté des paramètres à la fonction ainsi que la possibilité de choisir entre plusieurs valeurs, avec "ValidateSet", utile pour l'autocomplétion. (Je ne publie pas la fonction actuelle pour le moment) :

```powershell
Function Update-AppxXML{
param(
[ValidateSet("Option1","Option2","Option3")]
$param1,
$param2,
)
switch($param1){
"Option1" { faire cela }
"Option2" { faire cela }
"Option3" { faire cela }
}
}
```

Quand j'ai écrit mon script, je l'ai divisé en plusieurs fonctions. C'est plutôt cool d'avoir un script presque prêt, où vous n'avez pas à le réécrire complètement à partir de zéro. Vous pouvez également avoir une fonction "Main" pour appeler toutes les fonctions au lieu d'utiliser intensivement le tube magique.

Dans la partie 3, j'approfondirai les scripts. Restez à l'écoute...

Autres parties  :

- [Partie 1](/2016/01/11/side-loading-application-without-sccm-part-1)
- [Partie 2](/2016/01/11/side-loading-application-without-sccm-part-2) (vous êtes ici)
- [Partie 3](/2016/01/11/side-loading-application-without-sccm-part-3)

- Le script complet est sur mon dépôt GitHub : [Allez sur Git !](https://github.com/EtienneDeneuve/Powershell)
