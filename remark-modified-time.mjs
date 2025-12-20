import { execSync } from "child_process";

const MIN_DAYS_DIFFERENCE = 7; // Only show "updated" if modified > 7 days after published

export function remarkModifiedTime() {
  return function (tree, file) {
    try {
      const filepath = file.history[0];
      
      // Get git last modified date
      const gitLastModified = execSync(
        `git log -1 --format=%cI -- "${filepath}"`,
        { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }
      ).trim();

      if (!gitLastModified) {
        // No git history, skip
        return;
      }

      const gitDate = new Date(gitLastModified);
      const pubDate = file.data.astro.frontmatter.pubDate;

      // Only set lastModified if:
      // 1. pubDate exists
      // 2. gitDate is at least MIN_DAYS_DIFFERENCE days after pubDate
      if (pubDate) {
        const pubDateObj = pubDate instanceof Date ? pubDate : new Date(pubDate);
        const daysDifference = (gitDate.getTime() - pubDateObj.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDifference >= MIN_DAYS_DIFFERENCE) {
          file.data.astro.frontmatter.lastModified = gitLastModified;
          console.log(
            `lastModified: ${filepath} - Published: ${pubDateObj.toISOString()}, Modified: ${gitDate.toISOString()} (${Math.round(daysDifference)} days later)`
          );
        } else {
          // Clear lastModified if it was previously set but doesn't meet threshold
          delete file.data.astro.frontmatter.lastModified;
        }
      }
    } catch (error) {
      // Git command failed (e.g., file not in git, no git repo, etc.)
      // Silently skip - this is expected in some environments
      if (error.message && !error.message.includes("does not have any commits yet")) {
        console.warn(`Warning: Could not get git last modified for ${file.history[0]}: ${error.message}`);
      }
    }
  };
}
