#!/usr/bin/env node
/**
 * Fetch Social Media Statistics
 * 
 * This script fetches statistics from various social platforms during build time:
 * - GitHub: repos, followers, contributions
 * - YouTube: subscribers, views (if API key available)
 * - LinkedIn: profile views (limited without API)
 * 
 * Usage: node src/scripts/fetch-social-stats.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");
const outputPath = join(rootDir, "src/data/social-stats.json");

// Configuration from site config
const GITHUB_USERNAME = "EtienneDeneuve";
const GITHUB_ORG = "simplifi-ed"; // Organization to fetch projects from
const YOUTUBE_CHANNEL_ID = "@EtienneDeneuve"; // From URL: https://www.youtube.com/@EtienneDeneuve/
const LINKEDIN_USERNAME = "etiennedeneuve"; // From URL: https://www.linkedin.com/in/etiennedeneuve/
const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/etiennedeneuve/";

// Known LinkedIn stats (from profile - update manually if needed)
// These can be overridden by API if LINKEDIN_ACCESS_TOKEN is available
const LINKEDIN_KNOWN_STATS = {
  followers: 7828, // From profile screenshot
  connections: 500, // 500+ means at least 500
  headline: "Cloud Infrastructure & Platform Strategy Advisor Expert Kubernetes & Azure - DevSecOps - FinOps - Platform engineering",
  location: "Clamart, Île-de-France, France",
};

// Omnivya configuration
const OMNIVYA_WEBSITE = "www.omnivya.fr";
const OMNIVYA_LINKEDIN = "omnivya"; // LinkedIn company page slug (if exists)

// Default stats (fallback if APIs fail)
const defaultStats = {
  github: {
    publicRepos: 0,
    followers: 0,
    following: 0,
    contributions: 0,
    lastUpdated: new Date().toISOString(),
  },
  youtube: {
    subscribers: 0,
    totalViews: 0,
    videoCount: 0,
    lastUpdated: new Date().toISOString(),
  },
  linkedin: {
    profileViews: 0,
    connections: 0,
    followers: 0,
    headline: "",
    location: "",
    experienceCount: 0,
    educationCount: 0,
    skillsCount: 0,
    lastUpdated: new Date().toISOString(),
  },
  omnivya: {
    websiteStatus: "unknown",
    websiteAccessible: false,
    linkedinFollowers: 0,
    lastUpdated: new Date().toISOString(),
  },
  simplifiEd: {
    publicRepos: 0,
    members: 0,
    totalStars: 0,
    totalForks: 0,
    repos: [],
    lastUpdated: new Date().toISOString(),
  },
  lastFetched: new Date().toISOString(),
};

/**
 * Fetch GitHub statistics
 */
async function fetchGitHubStats() {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: {
        'User-Agent': 'Astro-Build-Script',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }),
      },
    });

    if (!response.ok) {
      console.warn(`⚠️  GitHub API error: ${response.status} ${response.statusText}`);
      return defaultStats.github;
    }

    const data = await response.json();
    
    // Try to get contribution count (requires additional API call or scraping)
    // For now, we'll use basic stats
    return {
      publicRepos: data.public_repos || 0,
      followers: data.followers || 0,
      following: data.following || 0,
      contributions: 0, // Would need GitHub GraphQL API for this
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`⚠️  Error fetching GitHub stats: ${error.message}`);
    return defaultStats.github;
  }
}

/**
 * Fetch YouTube statistics
 * Note: Requires YouTube Data API v3 key in YOUTUBE_API_KEY env var
 */
async function fetchYouTubeStats() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn("⚠️  YOUTUBE_API_KEY not set, skipping YouTube stats");
    return defaultStats.youtube;
  }

  try {
    // Extract channel ID from username/handle
    // For @EtienneDeneuve, we need to get the channel ID first
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(YOUTUBE_CHANNEL_ID)}&type=channel&key=${apiKey}`
    );

    if (!channelResponse.ok) {
      console.warn(`⚠️  YouTube API error: ${channelResponse.status}`);
      return defaultStats.youtube;
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      console.warn("⚠️  YouTube channel not found");
      return defaultStats.youtube;
    }

    const channelId = channelData.items[0].snippet.channelId;
    
    // Get channel statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
    );

    if (!statsResponse.ok) {
      console.warn(`⚠️  YouTube stats API error: ${statsResponse.status}`);
      return defaultStats.youtube;
    }

    const statsData = await statsResponse.json();
    
    if (!statsData.items || statsData.items.length === 0) {
      return defaultStats.youtube;
    }

    const stats = statsData.items[0].statistics;
    
    return {
      subscribers: parseInt(stats.subscriberCount || "0", 10),
      totalViews: parseInt(stats.viewCount || "0", 10),
      videoCount: parseInt(stats.videoCount || "0", 10),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`⚠️  Error fetching YouTube stats: ${error.message}`);
    return defaultStats.youtube;
  }
}

/**
 * Fetch LinkedIn statistics
 * 
 * Note: LinkedIn API v2 requires OAuth authentication and user consent.
 * For public profiles, we can try to fetch basic info using:
 * 1. LinkedIn API (requires OAuth token)
 * 2. Open Graph meta tags (limited info)
 * 3. Structured data (if available)
 * 
 * This function attempts to fetch basic profile info from Open Graph tags.
 */
async function fetchLinkedInStats() {
  const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
  
  // If we have an OAuth token, use LinkedIn API v2
  if (linkedinToken) {
    try {
      const response = await fetch("https://api.linkedin.com/v2/me", {
        headers: {
          "Authorization": `Bearer ${linkedinToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Get profile stats
        const statsResponse = await fetch("https://api.linkedin.com/v2/networkSizes/edge=connections", {
          headers: {
            "Authorization": `Bearer ${linkedinToken}`,
          },
        });

        let connections = 0;
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          connections = statsData.firstDegreeSize || 0;
        }

        return {
          profileViews: 0, // Requires additional API call
          connections,
          headline: data.headline || "",
          location: data.location?.name || "",
          experienceCount: 0, // Requires additional API call
          educationCount: 0, // Requires additional API call
          skillsCount: 0, // Requires additional API call
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn(`⚠️  LinkedIn API error: ${error.message}`);
    }
  }

  // Fallback: Try to fetch Open Graph meta tags from public profile
  try {
    const response = await fetch(LINKEDIN_PROFILE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Astro-Build-Script/1.0)",
      },
    });

    if (response.ok) {
      const html = await response.text();
      
      // Extract Open Graph title (usually contains name and headline)
      const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
      const ogDescriptionMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
      
      let headline = "";
      if (ogTitleMatch) {
        // og:title is usually "Name | Headline"
        const parts = ogTitleMatch[1].split("|");
        if (parts.length > 1) {
          headline = parts[1].trim();
        }
      }

      // Try to extract location from description or other meta tags
      let location = "";
      const locationMatch = html.match(/<meta\s+name="geo\.(?:placename|region)"\s+content="([^"]+)"/i);
      if (locationMatch) {
        location = locationMatch[1];
      }

      // Use known stats as fallback if not found in HTML
      const finalHeadline = headline || LINKEDIN_KNOWN_STATS.headline;
      const finalLocation = location || LINKEDIN_KNOWN_STATS.location;
      const finalConnections = connections || LINKEDIN_KNOWN_STATS.connections;
      const finalFollowers = followers || LINKEDIN_KNOWN_STATS.followers;

      return {
        profileViews: 0, // Requires API
        connections: finalConnections,
        followers: finalFollowers,
        headline: finalHeadline,
        location: finalLocation,
        experienceCount: 0, // Requires API
        educationCount: 0, // Requires API
        skillsCount: 0, // Requires API
        lastUpdated: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn(`⚠️  Error fetching LinkedIn profile: ${error.message}`);
  }

  // Fallback to known stats if all else fails
  console.warn("⚠️  LinkedIn stats not available (no API token or public access limited)");
  console.warn("   Using known stats as fallback");
  return {
    profileViews: 0,
    connections: LINKEDIN_KNOWN_STATS.connections,
    followers: LINKEDIN_KNOWN_STATS.followers,
    headline: LINKEDIN_KNOWN_STATS.headline,
    location: LINKEDIN_KNOWN_STATS.location,
    experienceCount: 0,
    educationCount: 0,
    skillsCount: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Fetch Simplifi'ed (GitHub organization) statistics
 */
async function fetchSimplifiEdStats() {
  try {
    const response = await fetch(`https://api.github.com/orgs/${GITHUB_ORG}`, {
      headers: {
        'User-Agent': 'Astro-Build-Script',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }),
      },
    });

    if (!response.ok) {
      console.warn(`⚠️  GitHub Org API error: ${response.status} ${response.statusText}`);
      return defaultStats.simplifiEd;
    }

    const orgData = await response.json();
    
    // Fetch all public repos
    let allRepos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const reposResponse = await fetch(
        `https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=100&page=${page}&sort=updated`,
        {
          headers: {
            'User-Agent': 'Astro-Build-Script',
            ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }),
          },
        }
      );

      if (!reposResponse.ok) {
        hasMore = false;
        break;
      }

      const repos = await reposResponse.json();
      
      if (repos.length === 0) {
        hasMore = false;
      } else {
        allRepos = allRepos.concat(repos);
        page++;
        // GitHub API limit: max 100 repos per page, but we'll stop at reasonable limit
        if (repos.length < 100 || allRepos.length >= 100) {
          hasMore = false;
        }
      }
    }

    // Calculate totals
    const totalStars = allRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = allRepos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

    // Get top repos (by stars)
    const topRepos = allRepos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 10)
      .map(repo => ({
        name: repo.name,
        description: repo.description || "",
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || "",
        url: repo.html_url,
        updated: repo.updated_at,
      }));

    return {
      publicRepos: allRepos.length,
      members: orgData.public_members_count || 0,
      totalStars,
      totalForks,
      repos: topRepos,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`⚠️  Error fetching Simplifi'ed stats: ${error.message}`);
    return defaultStats.simplifiEd;
  }
}

/**
 * Fetch Omnivya statistics
 * Checks website accessibility and tries to get basic info
 */
async function fetchOmnivyaStats() {
  try {
    // Check if website is accessible
    const websiteUrl = `https://${OMNIVYA_WEBSITE}`;
    let websiteAccessible = false;
    let websiteStatus = "unknown";

    try {
      const response = await fetch(websiteUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      websiteAccessible = response.ok;
      websiteStatus = response.status === 200 ? "online" : `http_${response.status}`;
    } catch (error) {
      websiteStatus = "error";
      websiteAccessible = false;
    }

    // Try to get LinkedIn company page info (if available)
    // Note: LinkedIn company API requires authentication
    let linkedinFollowers = 0;
    
    // You could add LinkedIn company page scraping here if needed
    // But it requires authentication or web scraping (not recommended)

    return {
      websiteStatus,
      websiteAccessible,
      linkedinFollowers,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`⚠️  Error fetching Omnivya stats: ${error.message}`);
    return defaultStats.omnivya;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("📊 Fetching social media statistics...\n");

  const [githubStats, youtubeStats, linkedinStats, omnivyaStats, simplifiEdStats] = await Promise.all([
    fetchGitHubStats(),
    fetchYouTubeStats(),
    fetchLinkedInStats(),
    fetchOmnivyaStats(),
    fetchSimplifiEdStats(),
  ]);

  const stats = {
    github: githubStats,
    youtube: youtubeStats,
    linkedin: linkedinStats,
    omnivya: omnivyaStats,
    simplifiEd: simplifiEdStats,
    lastFetched: new Date().toISOString(),
  };

  // Write to file
  writeFileSync(outputPath, JSON.stringify(stats, null, 2), "utf-8");

  console.log("✅ Social stats fetched successfully:");
  console.log(`   GitHub: ${githubStats.followers} followers, ${githubStats.publicRepos} repos`);
  if (youtubeStats.subscribers > 0) {
    console.log(`   YouTube: ${youtubeStats.subscribers} subscribers, ${youtubeStats.videoCount} videos`);
  }
  console.log(`   Omnivya: Website ${omnivyaStats.websiteAccessible ? "✅ accessible" : "❌ not accessible"} (${omnivyaStats.websiteStatus})`);
  console.log(`   Simplifi'ed: ${simplifiEdStats.publicRepos} repos, ${simplifiEdStats.totalStars} ⭐ total, ${simplifiEdStats.totalForks} 🍴 forks`);
  console.log(`\n📁 Stats saved to: ${outputPath}\n`);
}

main().catch((error) => {
  console.error("❌ Error fetching social stats:", error);
  // Write default stats on error
  writeFileSync(outputPath, JSON.stringify(defaultStats, null, 2), "utf-8");
  process.exit(1);
});
