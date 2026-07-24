export const githubProjectCategories = [
  "kubernetes-platform",
  "finops",
  "devsecops",
  "developer-tooling",
  "historical",
] as const;

export type GitHubProjectCategory = (typeof githubProjectCategories)[number];

export const githubProjectCategoryLabels: Record<
  GitHubProjectCategory,
  { fr: string; en: string; description: { fr: string; en: string } }
> = {
  "kubernetes-platform": {
    fr: "Kubernetes & platform",
    en: "Kubernetes & platform",
    description: {
      fr: "Preuves cloud-native : opérateurs, observabilité et labs plateforme.",
      en: "Cloud-native proof: operators, observability and platform labs.",
    },
  },
  finops: {
    fr: "FinOps & cloud cost",
    en: "FinOps & cloud cost",
    description: {
      fr: "Pilotage du coût cloud et lisibilité des prix.",
      en: "Cloud cost control and price readability.",
    },
  },
  devsecops: {
    fr: "DevSecOps & supply chain",
    en: "DevSecOps & supply chain",
    description: {
      fr: "Sécurité, CI/CD et tooling de chaîne logicielle.",
      en: "Security, CI/CD and software supply-chain tooling.",
    },
  },
  "developer-tooling": {
    fr: "Developer tooling",
    en: "Developer tooling",
    description: {
      fr: "Outils adjacents : utiles, mais hors du pitch plateforme principal.",
      en: "Adjacent tools : useful, but outside the core platform pitch.",
    },
  },
  historical: {
    fr: "Références historiques",
    en: "Historical references",
    description: {
      fr: "Historique et preuves de build, pas des produits actifs.",
      en: "History and build proof, not active products.",
    },
  },
};

export type GitHubProjectEditorial = {
  id: string;
  category: GitHubProjectCategory;
  github: { owner: string; repo: string };
  name: { fr: string; en: string };
  problem: { fr: string; en: string };
  status: { fr: string; en: string };
  role: { fr: string; en: string };
  documentation: { fr: string; en: string };
  documentationUrl?: string;
  contributionSought: { fr: string; en: string };
  relatedProjectSlug?: string;
  displayOrder: number;
};

/**
 * Liste autorisée : seuls ces dépôts sont synchronisés et affichés.
 * Ne pas étendre automatiquement depuis l’API GitHub.
 */
export const githubProjectsEditorial: GitHubProjectEditorial[] = [
  // -- Kubernetes & platform
  {
    id: "external-metrics-exporter",
    category: "kubernetes-platform",
    github: { owner: "Simplifi-ED", repo: "external-metrics-exporter" },
    name: {
      fr: "External Metrics Exporter",
      en: "External Metrics Exporter",
    },
    problem: {
      fr: "Les équipes déploient sur Kubernetes sans visibilité fiable sur les dépendances externes ni signaux comparables entre fournisseurs.",
      en: "Teams deploy on Kubernetes without reliable visibility on external dependencies or comparable signals across vendors.",
    },
    status: {
      fr: "Actif : repository public",
      en: "Active : public repository",
    },
    role: {
      fr: "Auteur et mainteneur",
      en: "Author and maintainer",
    },
    documentation: {
      fr: "Documentation sur la page projet et README du repository.",
      en: "Documentation on the project page and repository README.",
    },
    documentationUrl: "https://etienne.deneuve.xyz/projects/external-metrics-exporter/",
    contributionSought: {
      fr: "Retours d’usage sur les dépendances externes découvertes et le contrat Prometheus.",
      en: "Usage feedback on discovered external dependencies and the Prometheus contract.",
    },
    relatedProjectSlug: "external-metrics-exporter",
    displayOrder: 1,
  },
  {
    id: "azdo-kube-operator",
    category: "kubernetes-platform",
    github: { owner: "Simplifi-ED", repo: "azdo-kube-operator" },
    name: {
      fr: "Azure DevOps Kubernetes Operator",
      en: "Azure DevOps Kubernetes Operator",
    },
    problem: {
      fr: "Faire tourner des agents Azure DevOps sur Kubernetes sans opérer manuellement le cycle de vie des pods.",
      en: "Run Azure DevOps agents on Kubernetes without manually operating pod lifecycle.",
    },
    status: {
      fr: "Actif",
      en: "Active",
    },
    role: {
      fr: "Auteur et mainteneur",
      en: "Author and maintainer",
    },
    documentation: {
      fr: "README et chart operator dans le repository.",
      en: "README and operator chart in the repository.",
    },
    contributionSought: {
      fr: "Issues sur les modes d’agent, scaling et intégration cluster.",
      en: "Issues on agent modes, scaling and cluster integration.",
    },
    displayOrder: 2,
  },
  {
    id: "akslifecycle",
    category: "kubernetes-platform",
    github: { owner: "Simplifi-ED", repo: "akslifecycle" },
    name: {
      fr: "AKS Lifecycle",
      en: "AKS Lifecycle",
    },
    problem: {
      fr: "Gérer le cycle de vie AKS (création, upgrade, drift) sans scripts ad hoc par cluster.",
      en: "Manage AKS lifecycle (create, upgrade, drift) without ad hoc scripts per cluster.",
    },
    status: {
      fr: "Maintenance",
      en: "Maintenance",
    },
    role: {
      fr: "Auteur",
      en: "Author",
    },
    documentation: {
      fr: "README du repository.",
      en: "Repository README.",
    },
    contributionSought: {
      fr: "Retours d’usage sur les scénarios d’upgrade et de drift.",
      en: "Usage feedback on upgrade and drift scenarios.",
    },
    displayOrder: 3,
  },
  {
    id: "kubernetes-hyperv",
    category: "kubernetes-platform",
    github: { owner: "EtienneDeneuve", repo: "kubernetes_hyperv" },
    name: {
      fr: "Kubernetes on Hyper-V",
      en: "Kubernetes on Hyper-V",
    },
    problem: {
      fr: "Monter un cluster Kubernetes reproductible sur Hyper-V sans stack opaque.",
      en: "Stand up a reproducible Kubernetes cluster on Hyper-V without an opaque stack.",
    },
    status: {
      fr: "Maintenance : lab / référence",
      en: "Maintenance : lab / reference",
    },
    role: {
      fr: "Auteur",
      en: "Author",
    },
    documentation: {
      fr: "README (Packer, Ansible, DSC, WSL).",
      en: "README (Packer, Ansible, DSC, WSL).",
    },
    contributionSought: {
      fr: "Issues sur les chemins Hyper-V / WSL et les versions K8s.",
      en: "Issues on Hyper-V / WSL paths and K8s versions.",
    },
    displayOrder: 4,
  },

  // -- FinOps
  {
    id: "cloudcost",
    category: "finops",
    github: { owner: "Simplifi-ED", repo: "cloudcost" },
    name: {
      fr: "cloudcost",
      en: "cloudcost",
    },
    problem: {
      fr: "Vérifier les prix cloud (Azure) à la volée sans traverser des portails opaques.",
      en: "Check cloud prices (Azure) on the fly without opaque portals.",
    },
    status: {
      fr: "Actif",
      en: "Active",
    },
    role: {
      fr: "Auteur et mainteneur",
      en: "Author and maintainer",
    },
    documentation: {
      fr: "CLI Go : README du repository.",
      en: "Go CLI : repository README.",
    },
    contributionSought: {
      fr: "Couverture de nouveaux services et formats de sortie.",
      en: "Coverage for new services and output formats.",
    },
    displayOrder: 5,
  },

  // -- DevSecOps
  {
    id: "shaihulud-azuredevops-scanner",
    category: "devsecops",
    github: { owner: "Simplifi-ED", repo: "ShaiHulud-AzureDevops-Scanner" },
    name: {
      fr: "ShaiHulud Azure DevOps Scanner",
      en: "ShaiHulud Azure DevOps Scanner",
    },
    problem: {
      fr: "Détecter des indicateurs supply-chain / compromission dans des pipelines Azure DevOps.",
      en: "Detect supply-chain / compromise indicators in Azure DevOps pipelines.",
    },
    status: {
      fr: "Actif",
      en: "Active",
    },
    role: {
      fr: "Auteur",
      en: "Author",
    },
    documentation: {
      fr: "README du scanner.",
      en: "Scanner README.",
    },
    contributionSought: {
      fr: "Règles de détection et retours de terrain.",
      en: "Detection rules and field feedback.",
    },
    displayOrder: 6,
  },
  {
    id: "chart-version",
    category: "devsecops",
    github: { owner: "Simplifi-ED", repo: "chart-version" },
    name: {
      fr: "chart-version",
      en: "chart-version",
    },
    problem: {
      fr: "Forcer une version de chart Helm en CI/CD sans éditer le Chart.yaml à la main.",
      en: "Force a Helm chart version in CI/CD without hand-editing Chart.yaml.",
    },
    status: {
      fr: "Maintenance",
      en: "Maintenance",
    },
    role: {
      fr: "Auteur",
      en: "Author",
    },
    documentation: {
      fr: "CLI + plugin Helm : README.",
      en: "CLI + Helm plugin : README.",
    },
    contributionSought: {
      fr: "Cas d’usage CI et compatibilité Helm.",
      en: "CI use cases and Helm compatibility.",
    },
    displayOrder: 7,
  },

  // -- Developer tooling
  {
    id: "compose",
    category: "developer-tooling",
    github: { owner: "Simplifi-ED", repo: "compose" },
    name: {
      fr: "compose (Apple container)",
      en: "compose (Apple container)",
    },
    problem: {
      fr: "Orchestrer un docker-compose.yml avec apple/container sur macOS sans Docker Desktop.",
      en: "Orchestrate a docker-compose.yml with apple/container on macOS without Docker Desktop.",
    },
    status: {
      fr: "Actif",
      en: "Active",
    },
    role: {
      fr: "Auteur et mainteneur",
      en: "Author and maintainer",
    },
    documentation: {
      fr: "README + tap Homebrew associé (Simplifi-ED/homebrew-compose).",
      en: "README + related Homebrew tap (Simplifi-ED/homebrew-compose).",
    },
    documentationUrl: "https://www.omnivya.fr",
    contributionSought: {
      fr: "Compatibilité compose et retours sur apple/container.",
      en: "Compose compatibility and apple/container feedback.",
    },
    displayOrder: 8,
  },
  {
    id: "go-amumu",
    category: "developer-tooling",
    github: { owner: "Simplifi-ED", repo: "go-amumu" },
    name: {
      fr: "go-amumu",
      en: "go-amumu",
    },
    problem: {
      fr: "Envoyer des emails via Microsoft Graph depuis une CLI Go simple et scriptable.",
      en: "Send email via Microsoft Graph from a simple, scriptable Go CLI.",
    },
    status: {
      fr: "Maintenance",
      en: "Maintenance",
    },
    role: {
      fr: "Auteur",
      en: "Author",
    },
    documentation: {
      fr: "README du CLI.",
      en: "CLI README.",
    },
    contributionSought: {
      fr: "Auth Graph et formats de message.",
      en: "Graph auth and message formats.",
    },
    displayOrder: 9,
  },
  {
    id: "linkedin-carousel-generator",
    category: "developer-tooling",
    github: { owner: "EtienneDeneuve", repo: "linkedin-carousel-generator" },
    name: {
      fr: "LinkedIn Carousel Generator",
      en: "LinkedIn Carousel Generator",
    },
    problem: {
      fr: "Produire des carousels LinkedIn de manière reproductible depuis du Markdown.",
      en: "Produce LinkedIn carousels reproducibly from Markdown.",
    },
    status: {
      fr: "Maintenance",
      en: "Maintenance",
    },
    role: {
      fr: "Auteur",
      en: "Author",
    },
    documentation: {
      fr: "README et field note associée.",
      en: "README and related field note.",
    },
    documentationUrl:
      "https://etienne.deneuve.xyz/thinking/2024-10-05-automatisation-carousel-linkedin/",
    contributionSought: {
      fr: "Templates et pipeline de génération.",
      en: "Templates and generation pipeline.",
    },
    displayOrder: 10,
  },

  // -- Historical
  {
    id: "os-factory",
    category: "historical",
    github: { owner: "EtienneDeneuve", repo: "os-factory" },
    name: {
      fr: "OS Factory",
      en: "OS Factory",
    },
    problem: {
      fr: "Standardiser la construction d’images OS pour cloud public et privé sans pipelines ad hoc.",
      en: "Standardize OS image building for public and private cloud without ad hoc pipelines.",
    },
    status: {
      fr: "Référence historique",
      en: "Historical reference",
    },
    role: {
      fr: "Contributeur principal (mission Cellenza → Société Générale)",
      en: "Primary contributor (Cellenza → Société Générale mission)",
    },
    documentation: {
      fr: "README et articles de blog associés.",
      en: "README and related blog articles.",
    },
    contributionSought: {
      fr: "Non actif : conservé comme preuve de construction.",
      en: "Not active : kept as build proof.",
    },
    displayOrder: 11,
  },
  {
    id: "azure-netapp-files",
    category: "historical",
    github: { owner: "EtienneDeneuve", repo: "AzureNetappFiles" },
    name: {
      fr: "Azure NetApp Files : rôles RBAC",
      en: "Azure NetApp Files : RBAC roles",
    },
    problem: {
      fr: "Provisionner Azure NetApp Files avec des rôles RBAC adaptés sans réinventer les policies.",
      en: "Provision Azure NetApp Files with suitable RBAC roles without reinventing policies.",
    },
    status: {
      fr: "Référence historique",
      en: "Historical reference",
    },
    role: {
      fr: "Auteur",
      en: "Author",
    },
    documentation: {
      fr: "Templates Terraform et article technique associé.",
      en: "Terraform templates and related technical article.",
    },
    documentationUrl: "https://etienne.deneuve.xyz/thinking/2020-06-19-anf-rbac/",
    contributionSought: {
      fr: "Non actif : conservé avec l’article ANF RBAC.",
      en: "Not active : kept with the ANF RBAC article.",
    },
    displayOrder: 12,
  },
];

export const githubProjectsEditorialById = Object.fromEntries(
  githubProjectsEditorial.map((entry) => [entry.id, entry])
) as Record<string, GitHubProjectEditorial>;
