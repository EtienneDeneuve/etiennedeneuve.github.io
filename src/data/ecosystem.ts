/**
 * Canonical ecosystem source of truth for etienne.deneuve.xyz.
 * Editorial pages should consume this instead of inventing brand relationships.
 *
 * Confirmed facts (human-validated 2026-07-24):
 * - Simplifi’ED created 2020-08-04
 * - IT Challenge (Algeria subsidiary): 2022-02
 * - Omnivya / Omnivya Expert brands: 2025-06 / 2025-07
 * - Etienne = CTO; Taous = leader (Omnivya / Omnivya Expert)
 * - IT Challenge remains an Algerian SARL; public brand unused except on invoices
 * Product ventures outside the public site narrative are intentionally absent from this file.
 */

export const ecosystemLocales = ["fr", "en"] as const;
export type EcosystemLocale = (typeof ecosystemLocales)[number];

export type LocalizedString = Record<EcosystemLocale, string>;

export const entityKinds = [
  "person",
  "group_hub",
  "service_line",
  "historical_brand",
  "legal_entity",
  "product",
  "open_source",
] as const;
export type EntityKind = (typeof entityKinds)[number];

/** Public-facing brand posture — separate from legal existence. */
export const brandPostures = [
  "current",
  "legacy_invoice_only",
  "historical",
  "not_a_brand",
] as const;
export type BrandPosture = (typeof brandPostures)[number];

export const legalPostures = ["active", "unknown", "not_applicable"] as const;
export type LegalPosture = (typeof legalPostures)[number];

export const geoScopes = [
  "europe",
  "africa",
  "europe_africa",
  "algeria",
  "france",
  "global_public",
  "personal",
] as const;
export type GeoScope = (typeof geoScopes)[number];

export const relationTypes = [
  "cofounder_of",
  "cto_of",
  "leader_of",
  "hub_of",
  "service_line_of",
  "historical_name_of",
  "brand_of_ecosystem",
  "built_by",
  "public_contribution_of",
] as const;
export type RelationType = (typeof relationTypes)[number];

export type EcosystemEntityId =
  | "etienne"
  | "taous"
  | "omnivya"
  | "omnivya-expert"
  | "simplified"
  | "it-challenge"
  | "open-source";

export type EcosystemRelation = {
  type: RelationType;
  from: EcosystemEntityId;
  to: EcosystemEntityId;
};

export type EditorialRules = {
  /** Prefer this public name when the entity must appear. */
  preferName: string;
  /** How to introduce historical names in copy. */
  historicalQualifier?: LocalizedString;
  /** Hard editorial constraints for writers and agents. */
  do: Record<EcosystemLocale, readonly string[]>;
  dont: Record<EcosystemLocale, readonly string[]>;
};

/**
 * Canonical description bands (Prompt 7):
 * - shortDescription = card (≈60–90 chars)
 * - metaDescription = SEO / OG / JSON-LD (≈140–160 chars)
 * - longDescription = editorial paragraph
 * - historicalPhrase = one-line history when useful
 * - editorial.dont = forbidden / misleading formulations
 */
export type EcosystemEntity = {
  id: EcosystemEntityId;
  canonicalName: string;
  kind: EntityKind;
  brandPosture: BrandPosture;
  legalPosture: LegalPosture;
  /** Card / list line — target 60–90 characters. */
  shortDescription: LocalizedString;
  /** Meta / OG / Schema description — target 140–160 characters. */
  metaDescription: LocalizedString;
  /** Editorial paragraph for pages and long copy. */
  longDescription: LocalizedString;
  /** Optional one-line historical framing. */
  historicalPhrase?: LocalizedString;
  geo: GeoScope;
  historicalNames: string[];
  internalPath?: { fr: string; en: string };
  externalUrl?: string;
  sameAs?: string[];
  /** ISO date — only when confirmed. */
  createdAt?: string;
  /** ISO year or date for brand adoption — only when confirmed. */
  brandSince?: string;
  roles?: {
    etienne?: string;
    taous?: string;
  };
  editorial: EditorialRules;
};

const editorial = {
  omnivyaHub: {
    preferName: "Omnivya",
    do: {
      fr: [
        "Présenter Omnivya comme hub / marque ombrelle du groupe.",
        "Renvoyer le détail commercial vers omnivya.fr.",
      ],
      en: [
        "Present Omnivya as the group hub / umbrella brand.",
        "Send commercial detail to omnivya.fr.",
      ],
    },
    dont: {
      fr: [
        "Ne pas présenter Omnivya comme un simple renommage de Simplifi’ED.",
        "Ne pas limiter Omnivya au conseil ou à la seule exécution.",
      ],
      en: [
        "Do not present Omnivya as a simple rename of Simplifi’ED.",
        "Do not limit Omnivya to consulting or execution alone.",
      ],
    },
  },
} as const satisfies Record<string, EditorialRules>;

export const ecosystemEntities: Record<EcosystemEntityId, EcosystemEntity> = {
  etienne: {
    id: "etienne",
    canonicalName: "Etienne Deneuve",
    kind: "person",
    brandPosture: "not_a_brand",
    legalPosture: "not_applicable",
    shortDescription: {
      fr: "Cofondateur et CTO d’Omnivya Expert — doctrine et preuves.",
      en: "Co-founder and CTO of Omnivya Expert — doctrine and proof.",
    },
    metaDescription: {
      fr: "Etienne Deneuve, Platform Reliability Architect : cofondateur et CTO d’Omnivya Expert. Ce site publie doctrine, décisions et preuves.",
      en: "Etienne Deneuve, Platform Reliability Architect: co-founder and CTO of Omnivya Expert. This site publishes doctrine, decisions and proof.",
    },
    longDescription: {
      fr: "Platform Reliability Architect. Cofondateur avec Taous ; CTO d’Omnivya Expert. Ce site documente son raisonnement et ses preuves publiques.",
      en: "Platform Reliability Architect. Co-founder with Taous; CTO of Omnivya Expert. This site documents his reasoning and public proof.",
    },
    geo: "personal",
    historicalNames: [],
    internalPath: { fr: "/about/", en: "/en/about/" },
    externalUrl: "https://etienne.deneuve.xyz",
    sameAs: [
      "https://twitter.com/EtienneDinfo",
      "https://github.com/EtienneDeneuve",
      "https://linkedin.com/in/EtienneDeneuve",
    ],
    roles: { etienne: "CTO" },
    editorial: {
      preferName: "Etienne Deneuve",
      do: {
        fr: ["Utiliser la première personne sur les pages personnelles.", "Titre CTO partout dans l’écosystème."],
        en: ["Use first person on personal pages.", "CTO title across the ecosystem."],
      },
      dont: {
        fr: ["Ne pas inventer de structure juridique personnelle."],
        en: ["Do not invent a personal legal structure."],
      },
    },
  },
  taous: {
    id: "taous",
    canonicalName: "Taous",
    kind: "person",
    brandPosture: "not_a_brand",
    legalPosture: "not_applicable",
    shortDescription: {
      fr: "Cofondatrice et dirigeante d’Omnivya Expert — France et Algérie.",
      en: "Co-founder and leader of Omnivya Expert — France and Algeria.",
    },
    metaDescription: {
      fr: "Taous, cofondatrice et dirigeante d’Omnivya Expert : elle porte les services de conseil et d’ingénierie en Europe et en Afrique, avec Etienne.",
      en: "Taous, co-founder and leader of Omnivya Expert: she leads consulting and engineering services across Europe and Africa, together with Etienne.",
    },
    longDescription: {
      fr: "Cofondatrice avec Etienne. Dirigeante (« la vraie cheffe ») d’Omnivya Expert — services et projets open source associés.",
      en: "Co-founder with Etienne. Leader of Omnivya Expert — services and related open-source projects.",
    },
    geo: "personal",
    historicalNames: [],
    internalPath: { fr: "/about/", en: "/en/about/" },
    roles: { taous: "leader" },
    editorial: {
      preferName: "Taous",
      do: {
        fr: ["La nommer cofondatrice de l’écosystème, pas d’une marque legacy isolée.", "Dire qu’elle dirige ; Etienne est CTO."],
        en: ["Name her co-founder of the ecosystem, not of an isolated legacy brand.", "State that she leads; Etienne is CTO."],
      },
      dont: {
        fr: ["Ne pas la présenter uniquement comme cofondatrice d’IT Challenge."],
        en: ["Do not present her only as co-founder of IT Challenge."],
      },
    },
  },
  omnivya: {
    id: "omnivya",
    canonicalName: "Omnivya",
    kind: "group_hub",
    brandPosture: "current",
    legalPosture: "unknown",
    shortDescription: {
      fr: "Hub commun : activités, marques et projets de Taous et Etienne.",
      en: "Shared hub for activities, brands and projects by Taous and Etienne.",
    },
    metaDescription: {
      fr: "Omnivya est le hub commun du groupe : il regroupe activités, marques et projets construits par Taous et Etienne. Détail commercial sur omnivya.fr.",
      en: "Omnivya is the group’s shared hub: it gathers activities, brands and projects built by Taous and Etienne. Commercial detail stays on omnivya.fr.",
    },
    longDescription: {
      fr: "Omnivya structure le cadre commun : ce n’est ni uniquement une société de conseil, ni uniquement une entité d’exécution. La marque publique Omnivya a été introduite en juin–juillet 2025. Le détail commercial reste sur omnivya.fr.",
      en: "Omnivya is the shared frame: neither consulting-only nor execution-only. The public Omnivya brand was introduced in June–July 2025. Commercial detail stays on omnivya.fr.",
    },
    historicalPhrase: {
      fr: "Marque ombrelle introduite en juin–juillet 2025 — pas un simple renommage de Simplifi’ED.",
      en: "Umbrella brand introduced in June–July 2025 — not a simple rename of Simplifi’ED.",
    },
    geo: "europe_africa",
    historicalNames: [],
    internalPath: { fr: "/projects/omnivya/", en: "/en/projects/omnivya/" },
    externalUrl: "https://www.omnivya.fr",
    sameAs: ["https://www.omnivya.fr"],
    brandSince: "2025-06",
    roles: { etienne: "CTO", taous: "leader" },
    editorial: editorial.omnivyaHub,
  },
  "omnivya-expert": {
    id: "omnivya-expert",
    canonicalName: "Omnivya Expert",
    kind: "service_line",
    brandPosture: "current",
    legalPosture: "unknown",
    shortDescription: {
      fr: "Conseil, ingénierie et delivery Omnivya Expert en Europe et en Afrique.",
      en: "Omnivya Expert consulting, engineering and delivery across Europe and Africa.",
    },
    metaDescription: {
      fr: "Omnivya Expert porte le conseil, les services, l’ingénierie et la delivery en Europe et en Afrique — anciennement Simplifi’ED (2020).",
      en: "Omnivya Expert carries consulting, services, engineering and delivery across Europe and Africa — formerly Simplifi’ED (founded 2020).",
    },
    longDescription: {
      fr: "Omnivya Expert regroupe les activités de services historiquement portées sous Simplifi’ED. Capacité delivery en Algérie depuis 2022. Périmètre : Europe et Afrique — jamais une seule zone.",
      en: "Omnivya Expert gathers services historically carried under Simplifi’ED. Delivery capacity in Algeria since 2022. Scope: Europe and Africa — never a single region only.",
    },
    historicalPhrase: {
      fr: "Regroupe aujourd’hui ce qui était porté sous Simplifi’ED ; capacité Algérie depuis 2022.",
      en: "Gathers what was formerly carried as Simplifi’ED; Algeria capacity since 2022.",
    },
    geo: "europe_africa",
    historicalNames: ["Simplifi’ED", "IT Challenge"],
    internalPath: { fr: "/projects/omnivya/", en: "/en/projects/omnivya/" },
    externalUrl: "https://www.omnivya.fr",
    brandSince: "2025-06",
    roles: { etienne: "CTO", taous: "leader" },
    editorial: {
      preferName: "Omnivya Expert",
      historicalQualifier: {
        fr: "anciennement Simplifi’ED",
        en: "formerly Simplifi’ED",
      },
      do: {
        fr: [
          "Toujours citer Europe et Afrique.",
          "Attribuer conseil, services, ingénierie et delivery à Omnivya Expert.",
        ],
        en: [
          "Always mention Europe and Africa.",
          "Attribute consulting, services, engineering and delivery to Omnivya Expert.",
        ],
      },
      dont: {
        fr: [
          "Ne pas limiter Omnivya Expert à l’Algérie ou à l’Afrique.",
          "Ne pas limiter Omnivya Expert à l’Europe.",
        ],
        en: [
          "Do not limit Omnivya Expert to Algeria or Africa.",
          "Do not limit Omnivya Expert to Europe.",
        ],
      },
    },
  },
  simplified: {
    id: "simplified",
    canonicalName: "Simplifi’ED",
    kind: "historical_brand",
    brandPosture: "historical",
    legalPosture: "unknown",
    shortDescription: {
      fr: "Nom historique de l’activité française de conseil et d’ingénierie.",
      en: "Historical name of the French consulting and engineering activity.",
    },
    metaDescription: {
      fr: "Simplifi’ED, créée le 4 août 2020, était le nom public du conseil et de l’ingénierie en Europe ; les services sont aujourd’hui sous Omnivya Expert.",
      en: "Simplifi’ED, founded on 4 August 2020, was the public name for consulting and engineering in Europe; those services now sit under Omnivya Expert.",
    },
    longDescription: {
      fr: "Créée le 4 août 2020 par Taous et Etienne pour porter le conseil et l’ingénierie en Europe. Ce n’est plus la marque publique actuelle ; les activités de services sont regroupées sous Omnivya Expert. L’organisation GitHub Simplifi-ED reste un fait technique legacy.",
      en: "Created on 4 August 2020 by Taous and Etienne for consulting and engineering in Europe. No longer the current public brand; services activities now sit under Omnivya Expert. The Simplifi-ED GitHub org remains a technical legacy fact.",
    },
    historicalPhrase: {
      fr: "Créée le 4 août 2020 ; aujourd’hui nom historique, services sous Omnivya Expert.",
      en: "Founded 4 August 2020; now a historical name, services under Omnivya Expert.",
    },
    geo: "france",
    historicalNames: ["Simplifi'ED", "Simplifi-ED", "Simplifi'ed", "Simplified"],
    createdAt: "2020-08-04",
    roles: { etienne: "CTO", taous: "leader" },
    editorial: {
      preferName: "Simplifi’ED",
      historicalQualifier: {
        fr: "historiquement",
        en: "historically",
      },
      do: {
        fr: [
          "Utiliser pour l’histoire et les artefacts (blog, GitHub) uniquement.",
          "Qualifier avec « historiquement » ou « anciennement ».",
        ],
        en: [
          "Use for history and artifacts (blog, GitHub) only.",
          "Qualify with “historically” or “formerly”.",
        ],
      },
      dont: {
        fr: [
          "Ne pas présenter Simplifi’ED comme une branche active séparée d’IT Challenge.",
          "Ne pas écrire qu’Omnivya est un simple renommage juridique de Simplifi’ED.",
        ],
        en: [
          "Do not present Simplifi’ED as an active branch separate from IT Challenge.",
          "Do not write that Omnivya is a simple legal rename of Simplifi’ED.",
        ],
      },
    },
  },
  "it-challenge": {
    id: "it-challenge",
    canonicalName: "IT Challenge",
    kind: "legal_entity",
    brandPosture: "legacy_invoice_only",
    legalPosture: "active",
    shortDescription: {
      fr: "Nom historique de la filiale algérienne ; SARL active, marque retirée.",
      en: "Historical Algerian subsidiary name; SARL active, brand retired.",
    },
    metaDescription: {
      fr: "IT Challenge : nom historique de la filiale algérienne. SARL toujours active ; marque publique legacy, surtout en facturation, sous Omnivya Expert.",
      en: "IT Challenge: historical name of the Algerian subsidiary. SARL still active; public brand is legacy, mainly for invoicing, under Omnivya Expert.",
    },
    longDescription: {
      fr: "Filiale algérienne historiquement créée pour la capacité de delivery locale. La société (SARL) existe toujours. Le nom « IT Challenge » n’est plus utilisé comme marque stratégique : il apparaît surtout sur les factures. En public, parler d’Omnivya Expert (Algérie) et qualifier IT Challenge d’historique / legacy.",
      en: "Algerian subsidiary historically created for local delivery capacity. The SARL still exists. The “IT Challenge” name is no longer a strategic brand: it mainly appears on invoices. In public, speak of Omnivya Expert (Algeria) and qualify IT Challenge as historical / legacy.",
    },
    historicalPhrase: {
      fr: "Filiale algérienne historique ; SARL active ; nom surtout en facturation.",
      en: "Historical Algerian subsidiary; SARL active; name mostly for invoicing.",
    },
    geo: "algeria",
    historicalNames: ["ITChallenge"],
    createdAt: "2022-02",
    roles: { etienne: "CTO", taous: "leader" },
    editorial: {
      preferName: "IT Challenge",
      historicalQualifier: {
        fr: "historiquement / nom legacy (facturation)",
        en: "historically / legacy name (invoicing)",
      },
      do: {
        fr: [
          "Dire que la SARL existe encore si le sujet juridique/facturation est pertinent.",
          "En récit public, préférer Omnivya Expert et qualifier le nom.",
        ],
        en: [
          "State the SARL still exists when legal/invoicing context matters.",
          "In public narrative, prefer Omnivya Expert and qualify the name.",
        ],
      },
      dont: {
        fr: [
          "Ne pas présenter IT Challenge comme marque stratégique actuelle.",
          "Ne pas laisser croire que la société a disparu.",
        ],
        en: [
          "Do not present IT Challenge as a current strategic brand.",
          "Do not imply the company disappeared.",
        ],
      },
    },
  },
  "open-source": {
    id: "open-source",
    canonicalName: "Open source",
    kind: "open_source",
    brandPosture: "not_a_brand",
    legalPosture: "not_applicable",
    shortDescription: {
      fr: "Composants publics issus des problèmes terrain d’Omnivya Expert.",
      en: "Public components from Omnivya Expert’s real-world engineering problems.",
    },
    metaDescription: {
      fr: "Projets open source publiés à partir de problèmes rencontrés en ingénierie et delivery Omnivya Expert — preuves publiques, pas une marque commerciale séparée.",
      en: "Open-source components published from problems met in Omnivya Expert engineering and delivery — public proof, not a separate commercial brand.",
    },
    longDescription: {
      fr: "Composants et outils publiés, souvent sous l’organisation GitHub historique Simplifi-ED, développés à partir de problèmes rencontrés en conseil ou delivery. Ce sont des preuves publiques d’Omnivya Expert, pas une marque produit séparée.",
      en: "Published components and tools, often under the historical Simplifi-ED GitHub org, built from problems met in consulting or delivery. Public proof of Omnivya Expert — not a separate product brand.",
    },
    historicalPhrase: {
      fr: "Souvent publiés sous l’org GitHub legacy Simplifi-ED.",
      en: "Often published under the legacy Simplifi-ED GitHub org.",
    },
    geo: "global_public",
    historicalNames: ["Simplifi-ED"],
    internalPath: { fr: "/projects/", en: "/en/projects/" },
    externalUrl: "https://github.com/Simplifi-ED",
    sameAs: ["https://github.com/Simplifi-ED"],
    editorial: {
      preferName: "open source",
      do: {
        fr: [
          "Rattacher les repos à Omnivya Expert.",
          "Qualifier Simplifi-ED comme org GitHub legacy lorsque cité.",
        ],
        en: [
          "Attach repos to Omnivya Expert.",
          "Qualify Simplifi-ED as a legacy GitHub org when cited.",
        ],
      },
      dont: {
        fr: ["Ne pas présenter l’org Simplifi-ED comme marque commerciale actuelle."],
        en: ["Do not present the Simplifi-ED org as a current commercial brand."],
      },
    },
  },
};

export const ecosystemRelations: readonly EcosystemRelation[] = [
  { type: "cofounder_of", from: "etienne", to: "omnivya" },
  { type: "cofounder_of", from: "taous", to: "omnivya" },
  { type: "cto_of", from: "etienne", to: "omnivya" },
  { type: "cto_of", from: "etienne", to: "omnivya-expert" },
  { type: "leader_of", from: "taous", to: "omnivya" },
  { type: "leader_of", from: "taous", to: "omnivya-expert" },
  { type: "hub_of", from: "omnivya", to: "omnivya-expert" },
  { type: "hub_of", from: "omnivya", to: "open-source" },
  { type: "service_line_of", from: "omnivya-expert", to: "omnivya" },
  { type: "historical_name_of", from: "simplified", to: "omnivya-expert" },
  { type: "historical_name_of", from: "it-challenge", to: "omnivya-expert" },
  { type: "public_contribution_of", from: "open-source", to: "omnivya" },
] as const;

/** Confirmed chronology — only dated, validated milestones (public narrative). */
export const ecosystemTimeline = [
  {
    date: "2020-08-04",
    id: "simplified-founded" as const,
    title: {
      fr: "Création de Simplifi’ED",
      en: "Simplifi’ED founded",
    },
    summary: {
      fr: "Taous et Etienne créent Simplifi’ED pour le conseil et l’ingénierie en Europe.",
      en: "Taous and Etienne found Simplifi’ED for consulting and engineering in Europe.",
    },
    entityIds: ["simplified", "etienne", "taous"] as EcosystemEntityId[],
  },
  {
    date: "2022-02",
    id: "algeria-capacity" as const,
    title: {
      fr: "Équipe en Algérie",
      en: "Team in Algeria",
    },
    summary: {
      fr: "Février 2022. Face à la difficulté de recruter assez de profils techniques en Europe, création d’une capacité delivery en Algérie.",
      en: "February 2022. Facing the difficulty of hiring enough technical profiles in Europe, creation of delivery capacity in Algeria.",
    },
    entityIds: ["it-challenge", "omnivya-expert"] as EcosystemEntityId[],
  },
  {
    date: "2025-06",
    id: "omnivya-brand" as const,
    title: {
      fr: "Omnivya Expert",
      en: "Omnivya Expert",
    },
    summary: {
      fr: "Juin–juillet 2025. Les activités de services sont portées sous Omnivya Expert (Europe et Afrique).",
      en: "June–July 2025. Services activities are carried under Omnivya Expert (Europe and Africa).",
    },
    entityIds: ["omnivya-expert", "omnivya"] as EcosystemEntityId[],
  },
] as const;

export function getEntity(id: EcosystemEntityId): EcosystemEntity {
  return ecosystemEntities[id];
}

export function getShortDescription(
  id: EcosystemEntityId,
  locale: EcosystemLocale = "fr",
): string {
  return ecosystemEntities[id].shortDescription[locale];
}

export function getMetaDescription(
  id: EcosystemEntityId,
  locale: EcosystemLocale = "fr",
): string {
  return ecosystemEntities[id].metaDescription[locale];
}

export function getLongDescription(
  id: EcosystemEntityId,
  locale: EcosystemLocale = "fr",
): string {
  return ecosystemEntities[id].longDescription[locale];
}

export function getHistoricalPhrase(
  id: EcosystemEntityId,
  locale: EcosystemLocale = "fr",
): string | undefined {
  return ecosystemEntities[id].historicalPhrase?.[locale];
}

export type DescriptionBand = "card" | "meta" | "editorial" | "historical";

export function getDescription(
  id: EcosystemEntityId,
  band: DescriptionBand,
  locale: EcosystemLocale = "fr",
): string | undefined {
  const entity = ecosystemEntities[id];
  switch (band) {
    case "card":
      return entity.shortDescription[locale];
    case "meta":
      return entity.metaDescription[locale];
    case "editorial":
      return entity.longDescription[locale];
    case "historical":
      return entity.historicalPhrase?.[locale];
  }
}

export function listCurrentBrands(): EcosystemEntity[] {
  return Object.values(ecosystemEntities).filter((entity) => entity.brandPosture === "current");
}

export function listLegacyNames(): Array<{
  id: EcosystemEntityId;
  name: string;
  brandPosture: BrandPosture;
  qualifier: string;
}> {
  return Object.values(ecosystemEntities)
    .filter(
      (entity) =>
        entity.brandPosture === "historical" || entity.brandPosture === "legacy_invoice_only",
    )
    .map((entity) => ({
      id: entity.id,
      name: entity.canonicalName,
      brandPosture: entity.brandPosture,
      qualifier: entity.editorial.historicalQualifier?.fr ?? "legacy",
    }));
}

export function getChronology(locale: EcosystemLocale = "fr") {
  return ecosystemTimeline.map((step) => ({
    id: step.id,
    date: step.date ?? null,
    title: step.title[locale],
    summary: step.summary[locale],
    entityIds: step.entityIds,
  }));
}

export type ProjectCardData = {
  id: EcosystemEntityId;
  name: string;
  kind: EntityKind;
  role: string;
  url?: string;
  internalPath?: string;
  status: BrandPosture;
};

export function getProjectCardData(
  id: EcosystemEntityId,
  locale: EcosystemLocale = "fr",
): ProjectCardData {
  const entity = getEntity(id);
  return {
    id: entity.id,
    name: entity.canonicalName,
    kind: entity.kind,
    role: entity.shortDescription[locale],
    url: entity.externalUrl,
    internalPath: entity.internalPath?.[locale],
    status: entity.brandPosture,
  };
}

export function listProjectCards(locale: EcosystemLocale = "fr"): ProjectCardData[] {
  const order: EcosystemEntityId[] = ["omnivya-expert", "open-source"];
  return order.map((id) => getProjectCardData(id, locale));
}

/** Thin list for existing ecosystem UI until pages are rewired (Prompt 3). */
export function getEcosystemConfigEntities(locale: EcosystemLocale = "en") {
  const publicIds: EcosystemEntityId[] = ["omnivya-expert", "open-source"];
  return publicIds.map((id) => {
    const entity = ecosystemEntities[id];
    return {
      id: entity.id,
      name: entity.canonicalName,
      kind: entity.kind === "service_line" ? ("company" as const) : ("product" as const),
      role: entity.shortDescription[locale],
      url: entity.externalUrl ?? entity.internalPath?.[locale] ?? "https://etienne.deneuve.xyz/about/",
      status: "active" as const,
    };
  });
}
