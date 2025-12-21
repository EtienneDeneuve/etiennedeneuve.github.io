#!/usr/bin/env node
/**
 * Harmonize Profile Information
 * 
 * This script compares LinkedIn profile data with site.ts and suggests
 * harmonization updates to ensure consistency across platforms.
 * 
 * Usage: node src/scripts/harmonize-profile.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");
const configPath = join(rootDir, "src/config/site.ts");
const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/etiennedeneuve/";

// LinkedIn profile data from screenshot/known values
const LINKEDIN_DATA = {
  headline: "Cloud Infrastructure & Platform Strategy Advisor Expert Kubernetes & Azure - DevSecOps - FinOps - Platform engineering",
  company: "Omnivya",
  location: "Clamart, Île-de-France, France",
  followers: 7828,
  connections: 500, // 500+ means at least 500
};

/**
 * Read current site config
 */
function readSiteConfig() {
  const content = readFileSync(configPath, "utf-8");
  
  const name = content.match(/name:\s*"([^"]+)"/)?.[1] || "";
  const tagline = content.match(/tagline:\s*"([^"]+)"/)?.[1] || "";
  const description = content.match(/description:\s*"([^"]+)"/)?.[1] || "";
  const businessName = content.match(/name:\s*"([^"]+)",\s*\/\/ Business/)?.[1] || 
                       content.match(/business:\s*\{[^}]*name:\s*"([^"]+)"/s)?.[1] || "";
  
  return { name, tagline, description, businessName };
}

/**
 * Suggest harmonization updates
 */
function suggestHarmonization(linkedin, site) {
  console.log("🔍 Analyse d'harmonisation des profils\n");
  console.log("=" .repeat(60));
  
  const suggestions = [];
  
  // 1. Headline vs Tagline
  console.log("\n📝 1. HEADLINE / TAGLINE");
  console.log(`   LinkedIn: "${linkedin.headline}"`);
  console.log(`   Site actuel: "${site.tagline}"`);
  
  if (linkedin.headline && linkedin.headline !== site.tagline) {
    const linkedinShort = linkedin.headline.length > 100 
      ? linkedin.headline.substring(0, 100) + "..." 
      : linkedin.headline;
    
    suggestions.push({
      type: "tagline",
      current: site.tagline,
      suggested: linkedin.headline,
      reason: "La headline LinkedIn est plus détaillée et professionnelle",
      priority: "high",
    });
    
    console.log(`   ⚠️  Différence détectée`);
    console.log(`   💡 Suggestion: Mettre à jour le tagline avec la headline LinkedIn`);
    console.log(`      Version courte pour tagline: "${linkedinShort}"`);
  } else {
    console.log(`   ✅ Identique`);
  }
  
  // 2. Description
  console.log("\n📄 2. DESCRIPTION");
  console.log(`   Site actuel: "${site.description}"`);
  
  if (site.description === "The personal site of Etienne Deneuve") {
    suggestions.push({
      type: "description",
      current: site.description,
      suggested: `Cloud Infrastructure & Platform Strategy Advisor. Expert en Kubernetes, Azure, DevSecOps, FinOps et Platform Engineering.`,
      reason: "Description générique remplacée par une description professionnelle",
      priority: "medium",
    });
    
    console.log(`   ⚠️  Description générique`);
    console.log(`   💡 Suggestion: Utiliser une description basée sur la headline LinkedIn`);
  } else {
    console.log(`   ✅ Description personnalisée`);
  }
  
  // 3. Business name consistency
  console.log("\n🏢 3. ENTREPRISE");
  console.log(`   LinkedIn: "${linkedin.company}"`);
  console.log(`   Site: "${site.businessName}"`);
  
  if (linkedin.company.toLowerCase() === site.businessName.toLowerCase()) {
    console.log(`   ✅ Cohérent`);
  } else {
    suggestions.push({
      type: "business",
      current: site.businessName,
      suggested: linkedin.company,
      reason: "Nom d'entreprise différent entre LinkedIn et site",
      priority: "high",
    });
    console.log(`   ⚠️  Différence détectée`);
  }
  
  // 4. Job Title / Role
  console.log("\n💼 4. TITRE PROFESSIONNEL");
  const jobTitle = extractJobTitle(linkedin.headline);
  console.log(`   Titre extrait: "${jobTitle}"`);
  console.log(`   💡 Peut être utilisé dans les métadonnées JSON-LD`);
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 RÉSUMÉ DES SUGGESTIONS\n");
  
  if (suggestions.length === 0) {
    console.log("✅ Aucune harmonisation nécessaire - tout est cohérent !\n");
  } else {
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.type.toUpperCase()}`);
      console.log(`   Raison: ${suggestion.reason}`);
      console.log(`   Actuel: "${suggestion.current}"`);
      console.log(`   Suggéré: "${suggestion.suggested}"`);
      console.log();
    });
    
    console.log("💡 Pour appliquer ces changements:");
    console.log("   1. Ouvrir src/config/site.ts");
    console.log("   2. Mettre à jour les valeurs selon les suggestions ci-dessus");
    console.log("   3. Vérifier que tout fonctionne avec: pnpm run build\n");
  }
  
  return suggestions;
}

/**
 * Extract job title from headline
 */
function extractJobTitle(headline) {
  if (!headline) return "";
  
  // Try to extract the main title (before first dash or "Expert")
  const parts = headline.split(/[-–—]/);
  if (parts.length > 0) {
    return parts[0].trim();
  }
  
  // Fallback: first part before "Expert"
  const expertIndex = headline.indexOf("Expert");
  if (expertIndex > 0) {
    return headline.substring(0, expertIndex).trim();
  }
  
  return headline;
}

/**
 * Main function
 */
async function main() {
  console.log("🎯 Harmonisation des informations de profil\n");
  
  const siteConfig = readSiteConfig();
  const suggestions = suggestHarmonization(LINKEDIN_DATA, siteConfig);
  
  // Generate a suggested tagline (shorter version for site)
  const suggestedTagline = LINKEDIN_DATA.headline.length > 120
    ? LINKEDIN_DATA.headline.substring(0, 120).trim() + "..."
    : LINKEDIN_DATA.headline;
  
  console.log("📋 VALEURS SUGGÉRÉES POUR site.ts:\n");
  console.log(`tagline: "${suggestedTagline}"`);
  console.log(`\ndescription: "Cloud Infrastructure & Platform Strategy Advisor. Expert en Kubernetes, Azure, DevSecOps, FinOps et Platform Engineering chez ${LINKEDIN_DATA.company}."`);
  console.log(`\nlocation: "${LINKEDIN_DATA.location}"`);
  console.log(`\njobTitle: "${extractJobTitle(LINKEDIN_DATA.headline)}"`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
