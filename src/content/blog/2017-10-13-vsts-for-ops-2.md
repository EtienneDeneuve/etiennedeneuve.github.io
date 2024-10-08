---
ID: 335
title: >
  Microsoft Expérience 17 – VSTS For
  OPS part 2 !
author: etienne.deneuve
description: ""
tags: [""]
img: /assets/stock-1.jpg
img_alt: "nice abstract image"
slug: 2017/10/13/vsts-for-ops-2
published: true
pubDate: 2017-10-13 12:15:42
---

Dans cet article, je vous détaille la partie (cachée) de ma démo lors de ma session au Microsoft Expérience 17 avec Stanislas Quastana. Le but de cet article est de préparer les éléments nécessaire a notre usine à images systèmes. Les prochains arriverons rapidement, avec dans l'idée, de vous aider à mieux appréhendez le CI/CD en tant qu'OPS, pour des sujets qui nous concernent, l'infra as code.
Voici le chemin que nous allons suivre :

1. Préparation de l'environnement [nous sommes ici, toujours]
2. Préparation d'une image de base Linux
3. Préparation d'une image de base Windows
4. Utilisation des images de base pour les spécialiser, afin de les rendre "Immutables"
5. Déploiement d'image en CI/CD avec Packer et Terraform depuis VSTS
   Nous utiliserons des technologies Microsoft (VSTS, Azure, Windows Server...) mais aussi HashiCorp (Packer, Terraform) ainsi que des technologies Open Source (Linux..). Il n'est normalement pas nécessaire d’être, ni un maître du cloud, ni un demi dieu de l'infra as code pour suivre cette mini séries de 4 articles.

## Introduction

Avant de foncer dans le code de notre infra, nous allons devoir réflechir à l'organisation de nos dossier de "Code".

![](https://etienne.deneuve.xyz/assets/2017/10/mirror-frame-2407289_960_720-195x300.png)
Ok, maintenant qu'on à réflechi, on y va !

Nous allons générer deux images de base Ubuntu et Windows Server, utiliser des scripts "commun" et des scripts spécifiques, puis spécialiser nos images.

## Let's Git

### Dolly, ou Clone, comme vous voulez

Ouvrez donc Visual Studio Code ([Quoi ? Il est pas déjà installé?](https://etienne.deneuve.xyz/2017/01/26/visual-studio-code-pour-ansible-terraform/)) et ajoutez votre repository Git VSTS dans VS Code (Vous devez installer [Git](http://lmgtfy.com/?q=install+git) sur votre poste avant).

C'est assez simple, cliquez sur "Clone Git Repository":

![](https://etienne.deneuve.xyz/assets/2017/10/Git-Clone-300x217.png)

Récupérez l'url de votre repository dans VSTS :

![](https://etienne.deneuve.xyz/assets/2017/10/Git-Clone-2-1.png)

Puis collez le dans la barre de VS code :

![](https://etienne.deneuve.xyz/assets/2017/10/Git-Clone-3.png)

Entrez votre destination, par example `c:\Users\vous\Documents\git` (la racine, le dossier sera créer automatiquement) , puis indiquez vos credentials VSTS, et enfin lorsque le clone est terminé, cliquez sur "Open This repository":

![](https://etienne.deneuve.xyz/assets/2017/10/Git-Clone-4.png)

Félicitations, vous avez réussi a cloner votre git vsts sur votre poste!

> Ouais, mais moi j'y comprends rien à Git, j'vais jamais m'en sortir !

### Git, comment ça marche

---

Bon, on va faire simple, Git en usage basique comme on va le faire, ce n'est que quelques opérations :

1. Git clone -> On récupère un git distant sur notre poste de travail
2. Git Add -> on ajoute les fichiers dans le git "local"
3. Git Commit -> on valide nos modification (en local)
4. Git pull -> on va chercher les modifications coté remote
5. Git push -> on pousse nos modifciation vers remote

Vous inquiétez pas, VS Code va faire beaucoup à notre place !

### Création des dossiers

> Il faut quand même savoir une petite chose de plus, Git ne gère pas les dossiers vide, il faut donc créer un petit fichier readme.md pour les synchroniser correctement.

Pour créer les dossiers, soit vous le faite en "graphique" :

![](https://etienne.deneuve.xyz/assets/2017/10/addfolder-1.png)

Soit via le terminal intégrer avec vos commands préférées (`View -> Integrated Terminal`).

Personnellement j'ai créer 4 dossiers à la racine  : scripts, windows, ubuntu et specialized, puis dans les dossiers Windows et Ubuntu un sous-dossier scripts. dans chacun de ces dossiers ajouter donc un fichier vide readme.md (et sauvegardez-les). Vous verrez plus tard le "pourquoi" cette arborescence :).

### Commit

Maintenant on va "commit" nos modifications en cliquant sur les boutons (et en écrivant le pourquoi du commit :)) :

<img class="alignnone size-full wp-image-346" src="https://etienne.deneuve.xyz/assets/2017/10/Git-Commit.png" alt="" width="549" height="396" />

Youpi! votre premier commit ! (c’était dur?)

### Push

Avec notre premier commit, en bas de notre fenêtre VS Code, nous avons désormais un commit à envoyer :

![](https://etienne.deneuve.xyz/assets/2017/10/Push.png) Le chiffre de gauche correspond aux modifications distante (vos collègues), celui de droite, les locales (les votre quoi :))

Pour savoir ce qui se passe, ouvre la console "Output" (View, Output, puis sélectionnez Git dans le menu déroulant à gauche)

![](https://etienne.deneuve.xyz/assets/2017/10/Git-Push.png)
Allez dans VSTS sur votre navigateur, vous avez tous vos fichiers qui se trouvent désormais sur le Server.

## Conclusion

Désormais, vous avez un beau Projet VSTS, cloner en local, et vous savez envoyer vos fichiers dans le repository git distant. Nous allons pouvoir passer a la suite !

N'hésitez pas à commenter ou à me contacter en cas de soucis avec ces deux premières parties !
