#!/usr/bin/env bun
/**
 * Unit checks for canonical ecosystem JSON-LD (Prompt 5).
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
  "it-challenge",
  "my-dare",
  "sanad",
] as const;

for (const id of requiredIds) {
  if (!nodes.some((node) => node["@id"] === ecosystemNodeId(id))) {
    fail(`Missing required @id for ${id}`);
  }
}

const omnivya = nodes.find((node) => node["@id"] === ecosystemNodeId("omnivya"));
if (omnivya?.["@type"] !== "Organization") fail("Omnivya must be Organization");
if (!Array.isArray(omnivya?.founder) || omnivya.founder.length !== 2) {
  fail("Omnivya must list Etienne and Taous as founders");
}

const expert = nodes.find((node) => node["@id"] === ecosystemNodeId("omnivya-expert"));
if (
  !expert?.memberOf ||
  (expert.memberOf as { "@id": string })["@id"] !== ecosystemNodeId("omnivya")
) {
  fail("Omnivya Expert must memberOf Omnivya");
}

const sanad = nodes.find((node) => node["@id"] === ecosystemNodeId("sanad"));
if (sanad?.["@type"] !== "SoftwareApplication") fail("Sanad must be SoftwareApplication");

const myDare = nodes.find((node) => node["@id"] === ecosystemNodeId("my-dare"));
if (myDare?.["@type"] !== "LocalBusiness") fail("My Dare must be LocalBusiness");

// Compatibility helpers still emit stable ids
const person = personJsonLd();
const org = organizationJsonLd();
if (person["@id"] !== ecosystemNodeId("etienne")) fail("personJsonLd @id must be #etienne");
if (org["@id"] !== ecosystemNodeId("omnivya")) fail("organizationJsonLd @id must be #omnivya");

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
