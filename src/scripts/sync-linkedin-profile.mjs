#!/usr/bin/env node
/**
 * Sync LinkedIn Profile Information
 * 
 * This script fetches profile information from LinkedIn and updates site config.
 * It can use either:
 * 1. LinkedIn API v2 (requires OAuth token)
 * 2. Open Graph meta tags from public profile (limited info)
 * 
 * Usage: node src/scripts/sync-linkedin-profile.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");
const configPath = join(rootDir, "src/config/site.ts");
const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/etiennedeneuve/";

/**
 * Fetch profile info from LinkedIn API (if token available)
 */
async function fetchFromAPI() {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const [profileResponse, emailResponse] = await Promise.all([
      fetch("https://api.linkedin.com/v2/me", {
        headers: { "Authorization": `Bearer ${token}` },
      }),
      fetch("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
        headers: { "Authorization": `Bearer ${token}` },
      }),
    ]);

    if (profileResponse.ok && emailResponse.ok) {
      const profile = await profileResponse.json();
      const emailData = await emailResponse.json();
      
      return {
        firstName: profile.localizedFirstName || "",
        lastName: profile.localizedLastName || "",
        headline: profile.headline || "",
        location: profile.location?.name || "",
        email: emailData.elements?.[0]?.["handle~"]?.emailAddress || "",
      };
    }
  } catch (error) {
    console.warn(`⚠️  LinkedIn API error: ${error.message}`);
  }

  return null;
}

/**
 * Fetch basic info from Open Graph meta tags
 */
async function fetchFromOpenGraph() {
  try {
    const response = await fetch(LINKEDIN_PROFILE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Astro-Build-Script/1.0)",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    // Extract Open Graph data
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1] || "";
    const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1] || "";
    const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] || "";

    // Try to extract headline from structured data (JSON-LD)
    let headline = "";
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd.headline) {
          headline = jsonLd.headline;
        } else if (Array.isArray(jsonLd)) {
          const personData = jsonLd.find(item => item["@type"] === "Person");
          if (personData?.jobTitle) {
            headline = personData.jobTitle;
          }
        }
      } catch (e) {
        // JSON parsing failed, continue with other methods
      }
    }

    // Parse title (usually "Name | Headline" or "Name - Company")
    let name = "";
    
    if (!headline) {
      if (ogTitle.includes("|")) {
        const parts = ogTitle.split("|").map(s => s.trim());
        name = parts[0] || "";
        headline = parts.slice(1).join(" | ") || "";
      } else if (ogTitle.includes("-")) {
        const parts = ogTitle.split("-").map(s => s.trim());
        name = parts[0] || "";
        headline = parts.slice(1).join(" - ") || "";
      } else {
        name = ogTitle.trim();
      }
      
      // If headline is empty or generic, try description
      if (!headline || headline.toLowerCase() === "linkedin") {
        headline = ogDescription || "";
      }
    } else {
      // Extract name from ogTitle if headline already found
      if (ogTitle.includes("|")) {
        name = ogTitle.split("|")[0].trim();
      } else if (ogTitle.includes("-")) {
        name = ogTitle.split("-")[0].trim();
      } else {
        name = ogTitle.trim();
      }
    }

    // Try to extract location from meta tags or structured data
    let location = "";
    const locationMatch = html.match(/<meta\s+name="geo\.(?:placename|region)"\s+content="([^"]+)"/i);
    if (locationMatch) {
      location = locationMatch[1];
    } else {
      // Try to find location in description or other meta tags
      const locationInDesc = ogDescription?.match(/([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*)/);
      if (locationInDesc) {
        location = locationInDesc[1];
      }
    }

    return {
      name,
      headline,
      description: ogDescription,
      image: ogImage,
    };
  } catch (error) {
    console.warn(`⚠️  Error fetching LinkedIn Open Graph: ${error.message}`);
    return null;
  }
}

/**
 * Update site config with LinkedIn data
 */
function updateSiteConfig(linkedinData) {
  if (!linkedinData) return;

  let configContent = readFileSync(configPath, "utf-8");

  // Update author name if different
  if (linkedinData.name && linkedinData.name !== "Etienne Deneuve") {
    console.log(`📝 Note: LinkedIn name "${linkedinData.name}" differs from config`);
  }

  // Update tagline/headline if available and different
  if (linkedinData.headline) {
    const currentTagline = configContent.match(/tagline:\s*"([^"]+)"/)?.[1];
    if (linkedinData.headline !== currentTagline) {
      console.log(`💡 LinkedIn headline: "${linkedinData.headline}"`);
      console.log(`   Current tagline: "${currentTagline}"`);
      console.log(`   Consider updating tagline in site.ts if needed`);
    }
  }

  // Update description if available
  if (linkedinData.description) {
    console.log(`💡 LinkedIn description available (${linkedinData.description.length} chars)`);
    console.log(`   Consider using this for site description if relevant`);
  }

  console.log("\n✅ LinkedIn profile info fetched successfully");
  console.log("\n📋 Summary:");
  console.log(`   Name: ${linkedinData.name || "N/A"}`);
  console.log(`   Headline: ${linkedinData.headline || "N/A"}`);
  console.log(`   Location: ${linkedinData.location || "N/A"}`);
  if (linkedinData.description) {
    console.log(`   Description: ${linkedinData.description.substring(0, 100)}...`);
  }
  console.log("\n💡 Review the suggestions above and update site.ts manually if needed");
}

/**
 * Main function
 */
async function main() {
  console.log("🔗 Syncing LinkedIn profile information...\n");

  // Try API first (if token available)
  let linkedinData = await fetchFromAPI();
  
  // Fallback to Open Graph
  if (!linkedinData) {
    console.log("📡 Fetching from LinkedIn public profile (Open Graph)...");
    linkedinData = await fetchFromOpenGraph();
  }

  if (linkedinData) {
    updateSiteConfig(linkedinData);
  } else {
    console.warn("⚠️  Could not fetch LinkedIn profile information");
    console.warn("   Options:");
    console.warn("   1. Set LINKEDIN_ACCESS_TOKEN environment variable");
    console.warn("   2. Ensure profile is public");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
