---
name: "External Metrics Exporter"
name_en: "External Metrics Exporter"
summary: "Projet open source qui découvre les dépendances externes des workloads Kubernetes et expose un contrat Prometheus neutre vis-à-vis des fournisseurs."
summary_en: "Open source project that discovers external dependencies of Kubernetes workloads and exposes a vendor-neutral Prometheus contract."
status: "production"
type: "open-source"
role: "Auteur et mainteneur"
role_en: "Author and maintainer"
problem: "Les équipes déploient sur Kubernetes sans visibilité fiable sur les dépendances externes ni signaux comparables entre fournisseurs."
problem_en: "Teams deploy on Kubernetes without reliable visibility on external dependencies or comparable signals across vendors."
context: "Composant d’observabilité plateforme — découverte automatique, contrat Prometheus, neutralité fournisseur."
context_en: "Platform observability component — automatic discovery, Prometheus contract, vendor neutrality."
decisions:
  - "Découvrir les dépendances externes depuis les workloads, pas depuis des inventaires manuels"
  - "Exposer un contrat Prometheus neutre vis-à-vis des fournisseurs"
  - "Réduire la charge cognitive par des signaux actionnables"
decisions_en:
  - "Discover external dependencies from workloads, not manual inventories"
  - "Expose a vendor-neutral Prometheus contract"
  - "Reduce cognitive load with actionable signals"
principles:
  - "Signaux utiles, pas dashboards de plus"
  - "Neutralité fournisseur dans le contrat d’export"
  - "Découverte automatique plutôt qu’inventaire statique"
principles_en:
  - "Useful signals, not more dashboards"
  - "Vendor neutrality in the export contract"
  - "Automatic discovery rather than static inventory"
whatExists:
  - "Repository public Simplifi-ED/external-metrics-exporter"
  - "Intégration Prometheus / Kubernetes"
whatExists_en:
  - "Public repository Simplifi-ED/external-metrics-exporter"
  - "Prometheus / Kubernetes integration"
currentState: "Production — composant publié sous l’organisation GitHub historique Simplifi-ED ; contribution publique de l’écosystème Omnivya."
currentState_en: "Production — published under the historical Simplifi-ED GitHub org; public contribution of the Omnivya ecosystem."
limitations:
  - "Pas de métriques d’adoption (stars, downloads) présentées comme argument principal"
  - "Pas de promesse de couverture fournisseur exhaustive sans documentation à jour"
limitations_en:
  - "No adoption metrics (stars, downloads) presented as main argument"
  - "No promise of exhaustive vendor coverage without up-to-date documentation"
learnings:
  - "L’observabilité utile commence par les dépendances externes ignorées"
  - "Un contrat neutre évite le lock-in de la gouvernance plateforme"
learnings_en:
  - "Useful observability starts with ignored external dependencies"
  - "A neutral contract avoids platform governance lock-in"
relatedArticles:
  - "2024-09-16-managed-identities"
  - "2023-07-28-megalinter-azure-devops"
proofs:
  - label: "GitHub — Simplifi-ED/external-metrics-exporter"
    url: "https://github.com/Simplifi-ED/external-metrics-exporter"
    description: "Repository public et documentation."
proofLinks:
  - "https://github.com/Simplifi-ED/external-metrics-exporter"
repository: "https://github.com/Simplifi-ED/external-metrics-exporter"
technologies:
  - "Prometheus"
  - "Kubernetes"
  - "Exporters"
startedAt: 2023-01-01
verified: true
featured: true
draft: false
displayOrder: 3
ecosystemRole: "preuves publiques"
ecosystemRole_en: "public proof"
---

External Metrics Exporter rend visibles les dépendances externes des workloads Kubernetes.
