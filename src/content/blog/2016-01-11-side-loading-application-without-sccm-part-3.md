---
title: "Side loading application without SCCM - Part 3"
description: "Automatisez le déploiement des applications avec Powershell : simplifiez le sideloading d'Appx et gérez les certificats. Découvrez le script complet sur GitHub."
tags:
  [
    "Powershell",
    "Automatisation des tâches",
    "Développement logiciel",
    "Déploiement d'applications",
  ]
slug: 2016/01/11/side-loading-application-without-sccm-part-3
pubDate: 2016-01-11 19:57:23
img: /assets/stock-4.jpg
img_alt: "image abstraite intéressante"
---

Si vous avez suivi les parties précédentes de cette série, vous êtes prêt à approfondir l'automatisation du déploiement d'applications sans SCCM. Dans cette troisième partie, nous nous concentrons sur un script PowerShell essentiel pour le chargement latéral d'applications Appx.

## Première Fonction: Set-Manifest

La fonction `Set-Manifest` que j'ai créée permet de modifier le fichier XML et la BlockMap selon les besoins. Voici comment elle se présente :

```powershell
Function Set-Manifest {
    param(
        [String]
        [ValidateSet("Bundle", "Block", "Manifest", "BlockAppx")]
        $Mode,
        [XML] $xmlfile,
        [String] $CertificateSAN,
        [String] $filename,
        [String] $BlockMap
    )

    switch ($Mode) {
        'Bundle' {
            $xmlfile.Bundle.Identity.Publisher = $CertificateSAN
            $xmlfile.Save($filename)
        }
        'Block' {
            $xmlfile.BlockMap.File.RemoveAttribute("Size")
            $xmlfile.BlockMap.File.RemoveAttribute("LfhSize")
            $xmlfile.BlockMap.File.RemoveChild($xmlfile.BlockMap.File.Block)
            $xmlfile.Save($filename)
        }
        'Manifest' {
            $xmlfile.Package.Identity.Publisher = $CertificateSAN
            $xmlfile.Save($filename)
        }
        'BlockAppx' {
            $xmltemp = $xmlfile.BlockMap.File |? { $_.Name -eq "AppxManifest.xml" }
            $xmlfile.BlockMap.RemoveChild($xmltemp)
            $xmltemp.RemoveChild($xmltemp.Block)
            $xmltemp.RemoveAttribute("Size")
            $xmltemp.RemoveAttribute("LfhSize")
            $xmlfile.BlockMap.AppendChild($xmltemp)
            $xmlfile.Save($filename)
        }
    }
}
```

### Utilisation dans le Script Principal

Le script "principal" utilise `Set-Manifest` pour ajuster les manifestes et les cartes de blocage des applications. Le processus est détaillé ci-dessous :

```powershell
# Manifeste
Write-Host "Récupération du manifeste dans :`t $($destinationroot)\expanded\` !" -ForegroundColor Green
$ManifestBundle = Get-ChildItem -Filter AppxBundleManifest.xml -Path "$($destinationroot)\expanded\bundle" -Recurse
$ManifestAppxs = Get-ChildItem -Filter AppxManifest.xml -Path "$($destinationroot)\expanded\Appx\" -Recurse

# Configuration du manifeste de bundle
Write-Host "Paramétrage du manifeste de bundle dans :`t $($destinationroot)\expanded\` !" -ForegroundColor Green
foreach ($Manifest in $ManifestBundle) {
    [xml]$manifestxml = Get-Content $Manifest.FullName
    Set-Manifest -Mode Bundle -certificate $certificateSAN -filename $Manifest.fullname -xmlfile $manifestxml | Out-Null
}

# Configuration du manifeste d'Appx
Write-Host "Paramétrage du manifeste d'Appx dans :`t $($destinationroot)\expanded\` !" -ForegroundColor Green
foreach ($ManifestAppx in $ManifestAppxs) {
    [xml]$manifestxml = Get-Content $ManifestAppx.FullName
    Set-Manifest -Mode Manifest -certificate $certificateSAN -filename $ManifestAppx.fullname -xmlfile $manifestxml | Out-Null
}

# Cartes de Blocage de bundle
$ManifestBundleBlockMaps = Get-ChildItem -Filter AppxBlockMap.xml -Path "$($destinationroot)\expanded\bundle" -Recurse
Write-Host "Paramétrage des Cartes de Blocage de bundle dans :`t $($destinationroot)\expanded\` !" -ForegroundColor Green
foreach ($BlockMap in $ManifestBundleBlockMaps) {
    [xml]$blockmapxml = Get-Content $BlockMap.FullName
    Set-Manifest -Mode Block -certificate $certificateSAN -filename $BlockMap.fullname -xmlfile $blockmapxml | Out-Null
}

# Cartes de Blocage d'Appx
$ManifestAppxBlockMaps = Get-ChildItem -Filter AppxBlockMap.xml -Path "$($destinationroot)\expanded\Appx\" -Recurse
Write-Host "Paramétrage des Cartes de Blocage d'Appx dans :`t $($destinationroot)\expanded\` !" -ForegroundColor Green
foreach ($BlockMap in $ManifestAppxBlockMaps) {
    [xml]$blockmapxml = Get-Content $BlockMap.FullName
    Set-Manifest -Mode BlockAppx -certificate $certificateSAN -filename $BlockMap.fullname -xmlfile $blockmapxml | Out-Null
}
```

Cette méthode simplifie le déploiement d'applications en ajustant automatiquement les fichiers nécessaires à l'aide de PowerShell, rendant le chargement latéral d'Appx plus accessible et moins dépendant d'outils externes comme SCCM.

Restez à l'écoute pour la partie 4, qui viendra compléter cette série en vous fournissant encore plus d'outils et de techniques pour l'automatisation de vos déploiements d'applications.

Pour plus d'informations et pour accéder au script complet, consultez [mon GitHub](https://github.com/E).

_Autres parties de la série :_

- [Partie 1](/2016/01/11/side-loading-application-without-sccm-part-1)
- [Partie 2](/2016/01/11/side-loading-application-without-sccm-part-2)
- [Partie 3 (Vous êtes ici)](/2016/01/11/side-loading-application-without-sccm-part-3)
