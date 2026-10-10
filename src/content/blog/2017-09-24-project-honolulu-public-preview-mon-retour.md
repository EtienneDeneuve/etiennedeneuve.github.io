---
ID: 225
title: "[update] Project Honolulu Public Preview - Mon retour"
author: etienne.deneuve
description: "Project Honolulu Public Preview"
slug: 2017/09/24/project-honolulu-public-preview-mon-retour
tags: ["test"]
img: /assets/stock-2.jpg
img_alt: "nice abstract image"
published: false
pubDate: 2017-09-24 19:12:41
draft: true
---

## Intro

Au cas ou vous auriez raté l'annonce concernant le projet Honolulu qui vise à remplacer les MMC de nos servers Windows, je vous invite à regarder les quelques liens ci-dessous pour en savoir plus :

- <https://seyfallah-it.blogspot.fr/2017/09/honolulu-project.html>
- aka.ms/honoluludownload
- <https://blogs.technet.microsoft.com/askpfeplat/2017/09/20/project-honolulu-a-new-windows-server-management-experience-for-the-software-defined-datacenter-part-1/>
- <https://gotoguy.blog/2017/09/24/secure-access-to-project-honolulu-with-azure-ad-app-proxy-and-conditional-access/>

Pour ma part, voici mon retour sur cette nouveauté, d'un prime abord, c'est excellent, un simple MSI à installer et on peut commencer à ajouter ses serveurs dans l'interface. Génial ça fonctionne depuis mon téléphone, depuis mon Mac... Bref, c'est génial!

## Quelques trucs cools

- l'affichage des VMs :
  ![VM view](https://etienne.deneuve.xyz/assets/2017/09/vm.png)

- ASR (Azure Site Recovery) Automatisé :

![Automated ASR](https://etienne.deneuve.xyz/assets/2017/09/Honolu.png)

Bon, y en a pleins d'autres, je vous laisse des surprises #nospoil

## Les trucs que j'aurais aimés

- Dans l'installer proposer directement un certificat let's encrypt plutôt qu'un auto-signé (2017!)
- Au niveau de l'import :
  - - L'import des servers depuis l'AD et le DNS (à la 2012)
  - L'import des VM (Windows) existent dans Azure
  - Ajout des machines virtuelles lors de l'ajout de serveurs avec installé Hyper V
- La création d'une vault pour stocker ses "Credentials" (à la cmdkey /add), pour sélectionner ensuite le compte que l'on souhaite.
- L'absence de centralisation (à la 2012), il aurait été cool d'avoir une overview complète comme celle-ci.
- L'absence de Powershell Launcher, ça aurait été cool de pouvoir lancer des commands Powershell depuis cette interface.
- Pas de containers, j'aime bien les containers moi, j'aurais aimé trouver une petite interface comme Cockpit sur Fedora : ![](https://bobcares.com/assets/2015/08/docker-management-ui.png)

Voici les éléments pour les quels j'ai voté sur le User Voice Honolulu : <https://windowsserver.uservoice.com/users/674735389-etienne-deneuve>

### Ma petite conclusion

Et vous ? Vous l'avez essayé déjà ? Qu'en pensez-vous ? La direction est bonne, un moteur d'extensions [lien](https://github.com/hongtao-chen/hello-honolulu) est déjà prévu, et presque en place... On va pouvoir arrêter de mettre des GUI sur tous les serveurs ?
