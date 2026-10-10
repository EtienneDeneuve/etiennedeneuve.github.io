---
title: "Obtenir le niveau d'encre des imprimantes HP avec PowerShell"
description: "Découvrez comment récupérer facilement les informations sur les cartouches d'encre pour les imprimantes HP d'entrée de gamme à l'aide de PowerShell. Accédez au snippet sur GitHub."
tags: ["PowerShell", "HP", "Imprimante", "Niveau d'encre"]
slug: 2016/01/15/get-ink-level-from-hp-printers-in-powershell
pubDate: 2016-01-15 09:58:06
img: /assets/stock-1.jpg
img_alt: "nice abstract image"
draft: true
---

J'ai découvert une méthode pour obtenir des détails sur les cartouches d'encre des imprimantes HP d'entrée de gamme !

Retrouvez le snippet sur mon GitHub ! [Snippet HP](https://github.com/EtienneDeneuve/Powershell/blob/master/HpPrinter/Snippet)

```powershell
$Web = New-object System.Net.WebClient
[xml]$stringprinter = $Web.DownloadString("http://printerhp/DevMgmt/ConsumableConfigDyn.xml")
$stringprinter.ConsumableConfigDyn.ConsumableInfo | Select ConsumableLabelCode,ConsumablePercentageLevelRemaining
```

Ce script PowerShell est un moyen rapide et efficace de surveiller le niveau d'encre de vos imprimantes HP, en particulier pour les modèles d'entrée de gamme qui ne disposent pas toujours d'une interface utilisateur facile d'accès pour ces informations. En utilisant le WebClient de .NET pour télécharger et analyser le fichier XML de configuration des consommables (`ConsumableConfigDyn.xml`) disponible sur l'interface web de l'imprimante, vous pouvez récupérer des données clés telles que le code de la cartouche (`ConsumableLabelCode`) et le pourcentage d'encre restant (`ConsumablePercentageLevelRemaining`).

Ce snippet est parfait pour les administrateurs système ou toute personne cherchant à automatiser la gestion des fournitures d'imprimantes dans un environnement de bureau.
