# Profil vérifié — Etienne Deneuve

**Source primaire :** export LinkedIn `Profile-2.pdf` (consulté 2026-07-21)  
**Usage :** source de vérité pour bios, expérience, certifications, contacts — **pas** pour reprendre le résumé LinkedIn tel quel  
**Documents liés :** [`site-strategy.md`](./site-strategy.md), [`site-audit.md`](./site-audit.md)

> **Règle d’attribution (v1.1)** — LinkedIn mélange souvent **employeur / ESN / cabinet** et **client final** sur une même ligne d’expérience. Ne jamais publier un nom de client sans préciser **via quelle structure** et **à quelle période**. Un même client peut apparaître plusieurs fois (ex. mission Cellenza puis mission Omnivya).

---

## 0. Modèle d’attribution — structure vs client final

### Trois niveaux à distinguer

| Niveau                                    | Définition                                         | Exemples                                                          | Sur le site personnel                               |
| ----------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| **A. Employeur ou structure d’exécution** | Entité qui te paie, te facture ou porte le contrat | Cellenza, Dell Technologies, Exaduo, **Omnivya Expert** (hub **Omnivya** ; historiquement Simplifi’ED) | OK comme contexte de carrière                       |
| **B. Client final**                       | Organisation où le travail est réalisé             | Société Générale, SNCF, L’Oréal, Cegid                            | OK **seulement** avec A + période + accord si nommé |
| **C. Secteur / type de contexte**         | Quand B n’est pas publiable                        | « Grand compte finance », « santé numérique publique »            | Préféré pour bios générales                         |

### Types de structures (historique)

| Structure                        | Nature                           | Période clé  | Ne pas confondre avec                                                              |
| -------------------------------- | -------------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| **Cellenza**                     | ESN / cabinet                    | ~2017–2018   | Les clients SG, SNCF, Netatmo — ce sont des **B**, pas des employeurs              |
| **Dell Technologies**            | Éditeur + avant-vente / delivery | ~2018–2020   | Missions **pour les clients Dell**, pas « client Dell » au sens mission conseil    |
| **Exaduo, NetApp**               | ESN / alliance éditeur           | ~2018–2020   | Idem — structure A                                                                 |
| **Omnivya** (ex-**Simplifi’ED** comme marque historique Europe) | Hub / ombrelle ; services via **Omnivya Expert** | 2020 fondation Simplifi’ED ; marque Omnivya 2025–présent | Cegid, L’Oréal, ANS sur LinkedIn = souvent **B via Omnivya Expert**, pas embauche directe |
| **Thales DIS, ITESOFT, etc.**    | À clarifier cas par cas          | 2020–2024    | Vérifier si **A** = Omnivya ou employeur direct avant publication                  |

### Formulations autorisées vs interdites

| ❌ Interdit (mélange)                                 | ✅ Correct                                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| « J’ai conseillé L’Oréal » (sans structure)           | « Via Omnivya, j’accompagne des équipes plateforme chez L’Oréal (depuis 2020). »                    |
| « Client : Cegid » dans un case study                 | « Contexte : mission conseil via Omnivya — secteur software/finance — client : Cegid (si accord). » |
| Lister Cegid, L’Oréal, Dell comme clients équivalents | Dell = **employeur** ; L’Oréal = **client via Omnivya** — catégories différentes                    |
| « Chez Société Générale » sans Cellenza               | « Mission via Cellenza — Société Générale (OS Factory, 2017). »                                     |
| Fusionner deux passages chez le même client           | Deux lignes distinctes ou phrase explicite : « …puis à nouveau via Omnivya en 20XX »                |

### Continuité Simplifi’ED → Omnivya

- **Simplifi’ED** créée le **4 août 2020** (conseil / ingénierie Europe). Marque publique historique.
- **Marque Omnivya** introduite en **2025** : hub / ombrelle — **pas** un simple renommage juridique inventé ici.
- Sur le site : parler d’**Omnivya** (hub) et d’**Omnivya Expert** (services Europe et Afrique) ; mentionner Simplifi’ED **uniquement** pour faits historiques (blog, repos GitHub `Simplifi-ED`, chronologie).
- **IT Challenge** : SARL algérienne toujours active ; nom public legacy (surtout facturation). En récit public, préférer Omnivya Expert.
- Ne pas inventer de « même structure juridique » sans validation explicite.

### Nom client publiable ?

| Situation               | Publication du nom (B)                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| Bio générale / speaking | Secteur ou « grands comptes » — **pas** liste de logos                 |
| Page expérience curated | Nom **si** structure (A) + période visibles                            |
| Case study              | Nom ou anonymisation **contractuelle** — jamais « Client A » générique |
| Article blog historique | Conserver tel quel (preuve datée)                                      |

---

## 1. Identité & contact

| Champ                 | Valeur vérifiée                                       | Publiable | Notes                                               |
| --------------------- | ----------------------------------------------------- | --------- | --------------------------------------------------- |
| Nom                   | Etienne Deneuve                                       | ✅        |                                                     |
| Titre LinkedIn (2026) | Platform Reliability Architect                        | ✅        | Aligner `site.ts` sur refonte                       |
| Sous-titre LinkedIn   | Kubernetes · OpenTelemetry · FinOps · DevSecOps · IDP | ✅        |                                                     |
| Localisation          | Clamart, Île-de-France, France                        | ✅        | Déjà dans `site.ts`                                 |
| Mobile                | 0782458101                                            | ⚠️        | Privé — ne pas publier sans accord                  |
| Email LinkedIn        | etienne.linkedin@deneuve.xy                           | ⚠️        | Différent de `etienne@omnivya.fr` — clarifier usage |
| Email professionnel   | etienne@omnivya.fr                                    | ✅        | Déjà dans `site.ts`                                 |
| Site                  | https://etienne.deneuve.xyz                           | ✅        |                                                     |
| LinkedIn              | https://www.linkedin.com/in/etiennedeneuve            | ✅        |                                                     |
| GitHub                | https://github.com/EtienneDeneuve                     | ✅        | Handle **EtienneDeneuve** — distinct de Twitter     |
| X (Twitter)           | https://twitter.com/EtienneDinfo                      | ✅        | Handle **@EtienneDinfo** (pas EtienneDeneuve)       |
| YouTube               | https://www.youtube.com/@EtienneDeneuve               | ✅        |                                                     |
| Entreprise LinkedIn   | www.simplified.fr                                     | ❌ Legacy | Remplacer par Omnivya dans toute publication        |

---

## 2. Langues

| Langue   | Niveau (LinkedIn)             | Usage site                                    |
| -------- | ----------------------------- | --------------------------------------------- |
| Français | Langue maternelle (implicite) | Contenu principal                             |
| Anglais  | Full Professional             | Pages EN, conférences internationales         |
| Allemand | Limited Working               | Mention optionnelle — pas de contenu DE prévu |

---

## 3. Ancienneté — calcul factuel

| Période      | Rôle type                             | Durée (au 2026-07) |
| ------------ | ------------------------------------- | ------------------ |
| 2009–2011    | Support / admin SI                    | ~2 ans             |
| 2011–2016    | Admin, avant-vente, formateur         | ~5 ans             |
| 2016–2018    | Architect cloud & DevOps (consulting) | ~2 ans             |
| 2018–2020    | Cloud Solution Architect (Dell, etc.) | ~2 ans             |
| 2020–présent | CTO Omnivya + missions conseil        | ~6 ans             |

**Formulations autorisées (site strategy compliant) :**

- ✅ « Plus de quinze ans dans l'infrastructure et les systèmes d'information » (2009 → 2026)
- ✅ « Environ six ans comme CTO d'Omnivya » (juillet 2020 → présent)
- ✅ « Consultant et architecte plateforme depuis 2016 » (Cellenza, ISI Expert)
- ❌ « Expert reconnu » — non sourcé par une tierce partie
- ❌ « Visionnaire », « excellence », « innovant » — résumé LinkedIn, interdit §7 strategy

---

## 4. Rôle actuel & structure Omnivya

### Omnivya — CTO (juillet 2020 – présent) — **structure A**

- Direction technique et initiatives cloud, DevSecOps, platform engineering.
- **Preuve :** LinkedIn + site Omnivya (à lier).
- **Voix site perso :** « Je suis CTO d'Omnivya ; les missions conseil et delivery passent par cette structure. »

### Missions **client final (B)** via Omnivya — **structure A = Omnivya**

LinkedIn affiche parfois le **client** comme « employeur » ; ci-dessous la lecture corrigée :

| Structure (A) | Client final (B)                 | Période              | Rôle                                             | Périmètre (LinkedIn)                      | Même client ailleurs ?                                                   |
| ------------- | -------------------------------- | -------------------- | ------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------ |
| Omnivya       | **Cegid**                        | juil. 2020 – présent | Cloud Infrastructure & Platform Strategy Advisor | DevSecOps, Zero Trust, Flux/SOPS, FinOps  | Entrée distincte juil. 2025 « Innovation » = **même B**, mission élargie |
| Omnivya       | **Cegid**                        | juil. 2025 – présent | Cloud Strategy & Innovation Advisor              | NATS/Python/K8s, plateforme temps réel    | ⚠️ Ne pas compter comme deux clients                                     |
| Omnivya       | **L'Oréal**                      | déc. 2020 – présent  | Cloud Strategy Consultant                        | AKS, OS Factory, Ansible/Terraform/Packer | —                                                                        |
| Omnivya       | **Agence du numérique en santé** | juil. 2025 – présent | Cloud Transformation Strategy Advisor            | Cloud souverain, Zero Trust, IaC          | —                                                                        |

### Missions récentes — **structure (A) à confirmer** avant publication nominale

LinkedIn les liste sous le nom du client ; hypothèse par défaut : **via Omnivya** sauf preuve d’embauche directe.

| Client final (B) (LinkedIn) | Période                 | Rôle probable via Omnivya     | Confirmer |
| --------------------------- | ----------------------- | ----------------------------- | --------- |
| ITESOFT                     | nov. 2022 – juil. 2024  | Principal Solutions Architect | ☐         |
| digikare                    | avr. 2022 – nov. 2023   | Principal Solutions Architect | ☐         |
| Visiativ                    | nov. 2022 – mars 2023   | Principal Solutions Architect | ☐         |
| Thales DIS                  | sept. 2020 – sept. 2022 | Senior Solutions Architect    | ☐         |
| CMA CGM                     | sept. 2021 – fév. 2022  | Senior Solution Architect     | ☐         |

> **Case studies :** métriques LinkedIn (ex. « -50% » OS Factory chez L'Oréal) **non** republiables sans accord **client final (B)** et structure (A) documentée.

### Entités absentes du PDF

| Entité     | Statut                                       |
| ---------- | -------------------------------------------- |
| Scalion AI | Non mentionné — données à fournir séparément |
| Sanad      | Non mentionné                                |
| My Dare    | Non mentionné                                |

---

## 5. Expérience — tableau structure (A) × client (B)

Lecture **corrigée** du CV LinkedIn. Colonne **Pub.** = nom du client final sur le site perso (sans accord = secteur seulement).

### Période Omnivya / Simplifi’ED (structure A)

| Structure (A) | Client final (B) | Période      | Rôle                            | Thèmes                       | Pub. nom B |
| ------------- | ---------------- | ------------ | ------------------------------- | ---------------------------- | ---------- |
| Omnivya       | Cegid            | 2020–présent | Advisor plateforme / innovation | K8s, DevSecOps, NATS, FinOps | ☐ accord   |
| Omnivya       | L'Oréal          | 2020–présent | Consultant cloud                | AKS, OS Factory, IaC         | ☐ accord   |
| Omnivya       | ANS              | 2025–présent | Advisor transformation cloud    | Souveraineté, Zero Trust     | ☐ accord   |
| Omnivya (?)   | ITESOFT          | 2022–2024    | Principal SA                    | AKS multi-zone, GitOps       | ☐ accord   |
| Omnivya (?)   | digikare         | 2022–2023    | Principal SA                    | Santé, Azure, AKS            | ☐ accord   |
| Omnivya (?)   | Visiativ         | 2022–2023    | Principal SA                    | NX, 12-factor, K6            | ☐ accord   |
| Omnivya (?)   | Thales DIS       | 2020–2022    | Senior SA                       | Virtual WAN, Terraform       | ☐ accord   |
| Omnivya (?)   | CMA CGM          | 2021–2022    | Senior SA                       | Azure Stack Hub              | ☐ accord   |

### Période ESN / éditeur (structure A — pas confondre avec B)

| Structure (A)         | Client final (B)                               | Période    | Rôle                     | Thèmes                                            | Pub. nom B                               |
| --------------------- | ---------------------------------------------- | ---------- | ------------------------ | ------------------------------------------------- | ---------------------------------------- |
| **Dell Technologies** | _(clients Dell — non listés individuellement)_ | 2018–2020  | Cloud Solution Architect | Azure Stack (6 stacks), audit migration, AzDO/AKS | N/A — parler de **Dell** comme employeur |
| **Dell Technologies** | —                                              | 2018–2020  | Employeur                | Pré-sales & architecture cloud **chez Dell**      | ✅ « Période Dell »                      |
| **Cellenza**          | **Société Générale**                           | ~2017      | Architect cloud & DevOps | OS Factory (open source), AWS→Azure               | ✅ blog + accord SG si nominatif         |
| **Cellenza**          | **SNCF Réseau**                                | 2017–2018  | POC hybridation Azure    | Sécurisation, appliances virtuelles               | ☐ accord                                 |
| **Cellenza**          | Netatmo                                        | ~2017      | Mission Azure            | Architecture, Terraform                           | ☐ accord                                 |
| **Cellenza**          | NeoCase                                        | ~2017–2018 | Ansible, sécurité        | Déploiement, IPSec Azure                          | ☐ accord                                 |
| **Exaduo**            | _(clients non détaillés)_                      | 2018       | Architect cloud & DevOps | CI/CD mobile, coaching Agile                      | N/A                                      |
| **NetApp**            | _(alliance Microsoft — clients)_               | 2020       | Cloud SA alliance Azure  | Azure NetApp Files, avant-vente                   | N/A                                      |

### Employeur direct (hors modèle ESN→client, structure A seule)

| Structure (A) | Période   | Rôle                       | Pub.         |
| ------------- | --------- | -------------------------- | ------------ |
| ISI Expert    | 2016–2017 | Technical Evangelist Cloud | ✅ employeur |
| Nomadvantage  | 2015–2016 | Resp. informatique / admin | ✅ employeur |

### Open source — attribution correcte

| Projet         | Client final (B) | Structure (A) à l'époque   | Preuve                           |
| -------------- | ---------------- | -------------------------- | -------------------------------- |
| **OS Factory** | Société Générale | **Cellenza** (pas Omnivya) | Articles blog 2018, mission 2017 |

> **Erreur fréquente à éviter :** présenter OS Factory comme preuve Omnivya — c’était une mission **Cellenza → SG**.

---

## 6. Distinctions et certifications (vérifiables)

### Microsoft MVP — Cloud and Datacenter Management

| Champ                                 | Valeur                                                     | Source                                                                       |
| ------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Programme                             | Microsoft MVP Award Program                                | LinkedIn Honors, blog, attestations Etienne                                  |
| Catégorie                             | **Cloud and Datacenter Management**                        | Blog 2017-10-01, LinkedIn                                                    |
| Award cycles                          | **2017-2018, 2018-2019, 2019-2020** (3 cycles consécutifs) | Voir tableau ci-dessous                                                      |
| Annonce initiale                      | **1er octobre 2017**                                       | [Article blog `/2017/10/01/mvp`](https://etienne.deneuve.xyz/2017/10/01/mvp) |
| Badge / visuel                        | `/assets/2017/10/MVP.png`                                  | Repo `public/assets/` — preuve visuelle 2017 trouvée                         |
| Handle social (preuve renouvellement) | **@EtienneDinfo**                                          | Distinct de GitHub `EtienneDeneuve`                                          |

**Détail par award year :**

| Award cycle   | Statut                    | Source                                                                                     | Publiable            |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| **2017-2018** | ✅ Confirmé               | Blog 2017-10-01, LinkedIn Honors (oct. 2017), badge `/assets/2017/10/MVP.png`              | ✅                   |
| **2018-2019** | ✅ Confirmé (attestation) | Etienne (2026-07-21) ; annonce historique attendue sur **@EtienneDinfo**                   | ✅                   |
| **2019-2020** | ✅ Confirmé (attestation) | Etienne (2026-07-21) ; fin de cycle juste après la période Dell et lors de la phase NetApp | ✅                   |
| 2020+         | ❌ Non revendiqué         | —                                                                                          | ❌ Ne pas mentionner |

> **Note recherche (2026-07-21) :** X/Twitter exige une authentification — les tweets @EtienneDinfo n'ont pas pu être archivés automatiquement. **Action recommandée :** capturer ou lier les tweets de renouvellement 2018-2019 et 2019-2020 dans le repo (ex. `docs/assets/mvp-2018-2019-tweet.png`, `docs/assets/mvp-2019-2020-tweet.png`) pour solidifier la preuve tierce.

**Formulations autorisées :**

- ✅ « Microsoft MVP — Cloud and Datacenter Management (cycles 2017-2018 à 2019-2020) »
- ✅ « Ancien Microsoft MVP — Cloud and Datacenter Management (3 cycles consécutifs) »
- ✅ « Reconnu Microsoft MVP en 2017-2018, puis renouvelé en 2018-2019 et 2019-2020 »

**Formulations interdites :**

- ❌ « Microsoft MVP » sans catégorie ni période
- ❌ « MVP actuel » — Sessionize mentionne encore MVP ; profil **obsolète** (à mettre à jour)
- ❌ « MVP actuel » ou toute période après 2019-2020

### Autres distinctions (LinkedIn — hors PDF Profile-2)

| Distinction                       | Date      | Publiable                                |
| --------------------------------- | --------- | ---------------------------------------- |
| Microsoft P-Seller Cloud Platform | nov. 2016 | ✅ Contexte Microsoft France / avant MVP |
| Microsoft Certified Trainer (MCT) | 2014      | ✅ Formation historique                  |

### Certifications techniques

| Certification                               | Émetteur | Publiable                      |
| ------------------------------------------- | -------- | ------------------------------ |
| Kaseya Certified Administrator (KCA)        | Kaseya   | ✅ Historique                  |
| KEMP LoadMaster                             | KEMP     | ✅                             |
| Certifications Dell                         | Dell     | ✅ (détail non listé dans PDF) |
| Veeam VMSP7 — Sales Professional            | Veeam    | ✅                             |
| Veeam VMTSP7 — Technical Sales Professional | Veeam    | ✅                             |

> Certifications **Veeam/Dell/Kaseya** = historique 2018–2020 ; les mentionner en contexte « parcours » plutôt qu'en hero skills actuels (Kubernetes/OTEL).

---

## 7. Interventions & publications (preuves croisées)

### Documentées — publiables dans Speaking « Interventions passées »

| Événement                                              | Date              | Format           | Preuve                                                                                                                                                                   |
| ------------------------------------------------------ | ----------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Microsoft Experience 2017** — IaC Terraform & Packer | oct. 2017         | Session          | [Article blog](https://etienne.deneuve.xyz/2017/10/01/microsoft-experience-17-infrastructure-code-modelisez-et-provisionnez-vos-services-azure-avec-terraform-et-packer) |
| **FRPSUG — French PowerShell Saturday**                | 16 sept. 2017     | Session + slides | [Article blog](https://etienne.deneuve.xyz/2017/09/26/frpsug-powershell-saturday-et-contenu-de-la-session-de-lutile-ou-pas) + slides FRPSUG.pptx                         |
| **ITCast podcast** — épisode 48                        | 2017              | Podcast          | [Article blog](https://etienne.deneuve.xyz/2017/09/29/mon-premier-itcast) → itcast.io                                                                                    |
| **Paris Container Day**                                | Non daté dans PDF | Conférence       | LinkedIn Publications — **lien programme à compléter**                                                                                                                   |

### Formateur (LinkedIn — ISI Expert, IB Formation, SQLi, 2014–2017)

Sujets : Office 365, PowerShell, Active Directory, Yammer, SharePoint — **preuve CV**, pas événements unitaires.  
→ Section « Formation / mentoring » future, pas « conférences ».

---

## 8. Bios recommandées (dé-marketing + attribution correcte)

**Principe :** ne pas lister des clients finaux sans structure. Préférer secteurs + Omnivya ; noms propres seulement si accord + contexte « via Omnivya » ou « via Cellenza ».

### Bio courte (FR) — media kit / speaking — **sans noms clients**

> Etienne Deneuve est Platform Reliability Architect et CTO d'Omnivya, basé à Clamart. Via cette structure, il conçoit et sécurise des plateformes cloud et Kubernetes — observabilité (OpenTelemetry), FinOps, DevSecOps et platform engineering — pour des organisations en finance, luxe et santé numérique. Il publie sur etienne.deneuve.xyz.

### Bio courte (FR) — variante **avec noms** (accord client requis)

> … Via Omnivya, il accompagne notamment Cegid, L'Oréal et l'Agence du numérique en santé sur leurs trajectoires plateforme et cloud.

### Bio courte (EN) — sans noms clients

> Etienne Deneuve is a Platform Reliability Architect and CTO at Omnivya, based near Paris. Through Omnivya, he designs and secures cloud and Kubernetes platforms — OpenTelemetry, FinOps, DevSecOps, and platform engineering — for organisations in finance, luxury, and public digital health. He writes at etienne.deneuve.xyz.

### Bio longue (FR) — paragraphe 1 (factuel, structures explicites)

> Depuis plus de quinze ans, Etienne Deneuve construit et modernise des infrastructures — d'abord en exploitation et avant-vente, puis en mission via des ESN et éditeurs (Cellenza, Dell Technologies), et depuis 2020 comme CTO d'Omnivya. Ancien Microsoft MVP — Cloud and Datacenter Management (cycles 2017-2018, 2018-2019, 2019-2020). Son périmètre couvre Kubernetes (AKS), l'infrastructure as code (Terraform, Flux), la sécurité intégrée au delivery et la gouvernabilité des plateformes. Il a présenté à Microsoft Experience 2017 et au French PowerShell User Group ; il a contribué à l'open source OS Factory dans une mission via Cellenza.

**Ne pas reprendre** le résumé LinkedIn (entrepreneur visionnaire, excellence, IoT/domotique, etc.).

**Ne pas écrire** « clients : Dell, Cegid, L'Oréal » — Dell = employeur ; L'Oréal = client via Omnivya.

---

## 9. Titre & tagline — alignement `site.ts`

| Champ              | Valeur actuelle `site.ts`                        | Valeur recommandée (PDF + strategy)       |
| ------------------ | ------------------------------------------------ | ----------------------------------------- |
| `jobTitle`         | Cloud Infrastructure & Platform Strategy Advisor | Platform Reliability Architect            |
| `tagline`          | Expert Kubernetes & Azure… (liste skills)        | Énoncé strategy §1 ou sous-titre LinkedIn |
| `site.description` | …chez Omnivya                                    | Doctrine + Omnivya secondaire             |

---

## 10. Ce que le PDF ne résout pas

| Besoin                           | Statut                                                                                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Case studies avec métriques      | Missions réelles identifiées ; chiffres LinkedIn **non** republiables sans accord                                                                              |
| Scalion AI, Sanad, My Dare       | Absents du PDF                                                                                                                                                 |
| Booking Omnivya définitif        | Absent — toujours Simplifi’ED dans le site                                                                                                                     |
| Paris Container Day — date & URL | Mention seulement                                                                                                                                              |
| Témoignages clients              | Absents                                                                                                                                                        |
| Chaîne YouTube — stats           | PDF ne contient pas ; audit : 0 abonnés dans social-stats.json                                                                                                 |
| Microsoft MVP — années complètes | **2017-2018, 2018-2019, 2019-2020** (3 cycles) — 2017 via blog + LinkedIn ; renouvellements suivants via attestation Etienne + tweets @EtienneDinfo à archiver |

---

## 11. Résumé LinkedIn — phrases à ne pas publier

Extraits du PDF **interdits** par [`site-strategy.md`](./site-strategy.md) §7 :

- « Visionnaire et collaboratif »
- « mène mes équipes vers l'excellence »
- « Expert en Docker, Terraform… » (liste techno sans contexte)
- « toujours en quête d'innovations »
- « j'aide les CTO à réduire incidents, TTM et coûts cloud » (claim chiffré non sourci sur le site)

---

## 12. Actions dérivées pour la refonte

| Priorité | Action                                                          | Source                |
| -------- | --------------------------------------------------------------- | --------------------- |
| P1       | Remplacer bios speaking / media-kit par §8                      | Ce doc                |
| P1       | Alimenter `pastAppearances` avec §7                             | Blog + PDF            |
| P1       | Mettre à jour `jobTitle` / tagline dans `site.ts`               | §9                    |
| P2       | Page « Expérience » ou timeline curated (sans métriques client) | §5                    |
| P2       | Section certifications (optionnelle, bas de About)              | §6                    |
| P3       | Fiches Scalion / Sanad / My Dare                                | Hors PDF — en attente |

---

_Profil vérifié v1.1 — dérivé de Profile-2.pdf ; modèle structure (A) / client (B) ; réviser si LinkedIn ou accords clients évoluent._
