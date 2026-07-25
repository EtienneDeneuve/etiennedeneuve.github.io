#!/usr/bin/env bun
/**
 * Unit checks for canonical ecosystem JSON-LD (public graph).
 * Run: bun src/scripts/tests/test-ecosystem-json-ld.ts
 */
import {
  buildEcosystemEntityNodes,
  ecosystemNodeId,
  validateEcosystemJsonLdGraph,
} from "../../lib/ecosystem-json-ld.ts";
import {
  buildJsonLdGraph,
  personJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "../../lib/json-ld.ts";

const errors: string[] = [];

function fail(message: string) {
  errors.push(message);
}

const nodes = buildEcosystemEntityNodes("fr");
const validation = validateEcosystemJsonLdGraph(nodes);
for (const message of validation) fail(message);

const requiredIds = [
  "etienne",
  "taous",
  "omnivya",
  "omnivya-expert",
  "simplified",
  "open-source",
] as const;

for (const id of requiredIds) {
  if (!nodes.some((node) => node["@id"] === ecosystemNodeId(id))) {
    fail(`Missing required @id for ${id}`);
  }
}

for (const hidden of ["it-challenge"] as const) {
  if (nodes.some((node) => node["@id"] === ecosystemNodeId(hidden))) {
    fail(`${hidden} must not appear in the public JSON-LD graph`);
  }
}

const serialized = JSON.stringify(nodes);
for (const leak of [
  "Sanad",
  "My Dare",
  "IT Challenge",
  "Algeria",
  "Algérie",
  "Africa",
  "Afrique",
]) {
  if (serialized.includes(leak)) {
    fail(`Public JSON-LD must not leak "${leak}"`);
  }
}

const omnivya = nodes.find((node) => node["@id"] === ecosystemNodeId("omnivya"));
if (omnivya?.["@type"] !== "Organization") fail("Organization #omnivya must be Organization");
if (omnivya?.name !== "Omnivya Expert") fail("Organization #omnivya must display Omnivya Expert");
if (!Array.isArray(omnivya?.founder) || omnivya.founder.length !== 2) {
  fail("Organization must list Etienne and Taous as founders in the public graph");
}
const founderIds = (omnivya?.founder as Array<{ "@id": string }>).map((f) => f["@id"]);
if (
  !founderIds.includes(ecosystemNodeId("etienne")) ||
  !founderIds.includes(ecosystemNodeId("taous"))
) {
  fail("Organization founders must include #etienne and #taous");
}

const expert = nodes.find((node) => node["@id"] === ecosystemNodeId("omnivya-expert"));
if (
  !expert?.memberOf ||
  (expert.memberOf as { "@id": string })["@id"] !== ecosystemNodeId("omnivya")
) {
  fail("Omnivya Expert must memberOf organization node");
}
if (Array.isArray(expert?.alternateName) && expert.alternateName.includes("IT Challenge")) {
  fail("Public Omnivya Expert alternateName must not include IT Challenge");
}
if (expert?.areaServed) {
  fail("Public Omnivya Expert must not expose areaServed geography");
}

const person = personJsonLd();
const org = organizationJsonLd();
if (person["@id"] !== ecosystemNodeId("etienne")) fail("personJsonLd @id must be #etienne");
if (org["@id"] !== ecosystemNodeId("omnivya")) fail("organizationJsonLd @id must be #omnivya");
if (!JSON.stringify(org).includes("taous"))
  fail("organizationJsonLd must reference Taous as founder");

const graph = buildJsonLdGraph([person, org, websiteJsonLd(), ...nodes]);
const emitted = (graph["@graph"] as Array<Record<string, unknown>> | undefined) ?? [graph];
const ids = emitted.map((node) => node["@id"]).filter(Boolean) as string[];
const unique = new Set(ids);
if (unique.size !== ids.length) fail("buildJsonLdGraph produced duplicate @ids");

if (JSON.stringify(emitted).includes('"url":"#"')) fail("Placeholder URL # found in graph");

if (errors.length > 0) {
  console.error("ecosystem JSON-LD checks failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(`ecosystem JSON-LD OK (${nodes.length} entities, ${ids.length} graph nodes)`);
