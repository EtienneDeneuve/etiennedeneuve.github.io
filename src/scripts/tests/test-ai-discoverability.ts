import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

const robots = read("public/robots.txt");
for (const bot of [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
]) {
  if (!robots.includes(`User-agent: ${bot}`)) {
    throw new Error(`AI discoverability: robots.txt missing ${bot}`);
  }
}

const llms = read("public/llms.txt");
for (const term of [
  "Kubernetes",
  "AKS",
  "OpenTelemetry",
  "Platform Engineering",
  "SRE",
  "DevSecOps",
  "SBOM",
  "SLSA",
  "FinOps",
]) {
  if (!llms.includes(term)) throw new Error(`AI discoverability: llms.txt missing ${term}`);
}

for (const path of [
  "/expertises/kubernetes/",
  "/expertises/architecture-cloud/",
  "/expertises/platform-engineering/",
  "/expertises/opentelemetry-observabilite/",
  "/expertises/sre/",
  "/expertises/devsecops/",
  "/expertises/software-supply-chain-security/",
  "/expertises/finops/",
]) {
  if (!llms.includes(`https://www.omnivya.fr${path}`)) {
    throw new Error(`AI discoverability: llms.txt missing Omnivya route ${path}`);
  }
}

const seo = read("src/config/seo.ts");
for (const term of [
  "Azure Kubernetes Service (AKS)",
  "OpenTelemetry",
  "Software supply chain security",
  "SLSA",
  "SBOM",
  "FluxCD",
]) {
  if (!seo.includes(term)) throw new Error(`AI discoverability: JSON-LD expertise missing ${term}`);
}

const messaging = read("src/config/messaging.ts");
for (const term of [
  "Kubernetes/AKS",
  "OpenTelemetry",
  "Platform Engineering",
  "SRE",
  "DevSecOps",
  "FinOps",
]) {
  if (!messaging.includes(term)) {
    throw new Error(`AI discoverability: SEO messaging missing ${term}`);
  }
}

console.log("AI discoverability contract OK");
