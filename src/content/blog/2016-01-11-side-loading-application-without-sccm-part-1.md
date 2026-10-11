---
title: Side loading application without SCCM - Part 1
description: ""
tags:
  - PowerShell
  - Windows
  - Sideloading
  - SCCM
slug: 2016/01/11/side-loading-app
pubDate: 2016-01-11 17:20:38
updateDate: 2024-02-12 11:16:00
img: /assets/stock-2.jpg
img_alt: nice abstract image
draft: true
---

Je publie ma méthode pour installer des applications `sideload` sur Windows 8 et versions ultérieures. J'ai cherché sur Internet et n'ai rien trouvé pour installer ces applications sur des ordinateurs dans une entreprise qui n'a pas SCCM. J'ai écrit un script PowerShell qui fera le travail, mais je veux partager la manière dont je l'ai construit, au lieu de le partager sans aucune explication. Ce billet de blog est le premier d'une série visant à passer d'une tâche longue et peu intéressante à une tâche presque entièrement automatisée. Vous devrez avoir makeappx et signtool sur l'ordinateur pour exécuter le script ou effectuer le processus manuellement. Il est préférable de réaliser le processus une fois avant de lancer le script. Il est plus facile de déboguer quelque chose que l'on connaît (oui ! ;)).

## Applications pour l'interface utilisateur moderne de Windows

Commençons ce billet par une petite explication sur le fonctionnement du chargement latéral de Windows. Lorsque vous construisez une application avec des outils comme Adobe DPS, vous obtenez un "appxbundle". Pour le chargement latéral, vous devez signer l'appxbundle et l'appx dans le bundle. Ainsi, vous devez "débundler" le bundle, puis décompresser l'appx. Malheureusement, vous devez modifier le fichier AppManifest.xml et le fichier BlockMap.xml (un fichier où tous les hachages sont stockés), et ces deux fichiers existent à la fois pour AppxBundle et Appx.

L'arborescence d'un AppxBundle ressemble à ceci :

- / (racine de l'AppxBundle)
- /AppManifest
- /AppManifest/AppxManifest.xml
- /BlockMaps.xml
- /ARM.appx
- /x86.appx
- /x64.appx
- (toutes les architectures sont dans le bundle, j'ai supprimé les fichiers non essentiels)

Pour le chargement latéral et le changement de certificat pour un bon certificat, voici les étapes dont nous avons besoin :

1. Débundler l'appxbundle
2. Décompresser tous les appx
3. Modifier le fichier AppManifest.xml, pour chacun d'eux. Nous devons changer les attributs "Éditeur" dans le XML.
4. Modifier le fichier BlockMaps.xml, pour chacun d'eux. Nous devons supprimer le hachage et la taille du fichier AppManifest.xml modifié.
5. Compresser l'appx et le signer
6. Créer le bundle et le signer
7. Créer un script PowerShell pour installer les dépendances et le bundle.
8. Trouver un moyen de lancer le script PowerShell sur tous nos clients.

La partie 2 arrive bientôt...

Autres parties :

- [Part 2](/2016/01/11/side-loading-application-without-sccm-part-2)
- [Part 3](/2016/01/11/side-loading-application-without-sccm-part-3)
- The full script is on my (New) Git : [Go to Git !](https://github.com/EtienneDeneuve/Powershell)
