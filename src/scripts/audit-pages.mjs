#!/usr/bin/env node
/**
 * Audit Pages with Unlighthouse
 * 
 * Builds the site, starts preview server, and runs unlighthouse
 * on the new pages (offers, case-studies, speaking).
 * 
 * Usage: node src/scripts/audit-pages.mjs
 */

import { spawn, exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");

// Pages to audit
const PAGES_TO_AUDIT = [
  "http://localhost:4321/",
  "http://localhost:4321/offers",
  "http://localhost:4321/case-studies",
  "http://localhost:4321/speaking",
];

let previewProcess = null;

/**
 * Build the site
 */
async function build() {
  console.log("🔨 Building site...");
  try {
    const { stdout, stderr } = await execAsync("pnpm run build", {
      cwd: rootDir,
      encoding: "utf-8",
    });
    if (stderr && !stderr.includes("warning")) {
      console.warn(stderr);
    }
    console.log("✅ Build complete\n");
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
  }
}

/**
 * Start preview server
 */
async function startPreview() {
  return new Promise((resolve, reject) => {
    console.log("🚀 Starting preview server...");
    
    previewProcess = spawn("pnpm", ["run", "preview"], {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });

    let output = "";
    
    previewProcess.stdout.on("data", (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
      
      // Check if server is ready
      if (text.includes("Local:") || text.includes("localhost:4321")) {
        console.log("\n✅ Preview server ready\n");
        // Give it a moment to fully start
        setTimeout(() => resolve(), 2000);
      }
    });

    previewProcess.stderr.on("data", (data) => {
      const text = data.toString();
      process.stderr.write(text);
      // Some warnings are OK, but errors are not
      if (text.includes("Error") || text.includes("error")) {
        reject(new Error(text));
      }
    });

    previewProcess.on("error", (error) => {
      reject(error);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (previewProcess && !previewProcess.killed) {
        reject(new Error("Preview server timeout"));
      }
    }, 60000);
  });
}

/**
 * Run unlighthouse
 */
async function runUnlighthouse() {
  console.log("🔍 Running Unlighthouse audit...\n");
  
  try {
    // Unlighthouse scans specific URLs using --urls option
    const baseUrl = "http://localhost:4321";
    const urls = PAGES_TO_AUDIT.map(url => url.replace(baseUrl, "")).join(",");
    
    console.log(`📋 Auditing pages: ${urls}\n`);
    
    const { stdout, stderr } = await execAsync(
      `npx unlighthouse --site ${baseUrl} --urls ${urls} --output-path .unlighthouse --samples 1`,
      {
        cwd: rootDir,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    );
    
    console.log(stdout);
    if (stderr) {
      console.warn(stderr);
    }
    
    console.log("\n✅ Audit complete!");
    console.log("📊 Results available in .unlighthouse/ directory");
    console.log("🌐 Open .unlighthouse/index.html in your browser to view results\n");
  } catch (error) {
    console.error("❌ Unlighthouse failed:", error.message);
    // Don't exit, we still want to clean up
  }
}

/**
 * Stop preview server
 */
function stopPreview() {
  if (previewProcess && !previewProcess.killed) {
    console.log("\n🛑 Stopping preview server...");
    previewProcess.kill("SIGTERM");
    
    // Force kill after 5 seconds if still running
    setTimeout(() => {
      if (previewProcess && !previewProcess.killed) {
        previewProcess.kill("SIGKILL");
      }
    }, 5000);
  }
}

/**
 * Cleanup on exit
 */
process.on("SIGINT", () => {
  stopPreview();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopPreview();
  process.exit(0);
});

/**
 * Main function
 */
async function main() {
  try {
    await build();
    await startPreview();
    await runUnlighthouse();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    stopPreview();
  }
}

main();
