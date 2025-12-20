#!/usr/bin/env node
/**
 * Spellcheck Report Generator
 * 
 * This script runs cspell and generates a report of spelling errors,
 * filtering out common false positives and focusing on actionable errors.
 * 
 * Usage: node src/scripts/spellcheck-report.mjs
 */

import { execSync } from "child_process";

try {
  const output = execSync("pnpm run spellcheck 2>&1", { encoding: "utf-8" });
  
  // Extract error lines
  const errorLines = output.split("\n").filter(line => 
    line.includes("Unknown word")
  );

  if (errorLines.length === 0) {
    console.log("✓ No spelling errors found!");
    process.exit(0);
  }

  // Group errors by file
  const errorsByFile = new Map();
  
  errorLines.forEach(line => {
    const match = line.match(/^([^:]+):(\d+):(\d+) - Unknown word \(([^)]+)\)/);
    if (match) {
      const [, file, lineNum, colNum, word] = match;
      if (!errorsByFile.has(file)) {
        errorsByFile.set(file, []);
      }
      errorsByFile.get(file).push({ line: lineNum, col: colNum, word });
    }
  });

  // Print summary
  console.log(`\n⚠️  Found ${errorLines.length} spelling errors across ${errorsByFile.size} files:\n`);
  
  // Print errors by file
  Array.from(errorsByFile.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([file, errors]) => {
      console.log(`\n${file}:`);
      const uniqueWords = [...new Set(errors.map(e => e.word))];
      uniqueWords.forEach(word => {
        const count = errors.filter(e => e.word === word).length;
        console.log(`  - ${word} (${count} occurrence${count > 1 ? 's' : ''})`);
      });
    });

  console.log(`\n💡 Tip: Add words to cspell-custom.txt or cspell-fr-common.txt to ignore them.\n`);
  
  process.exit(1);
} catch (error) {
  // cspell exits with code 1 when errors are found, which is expected
  if (error.status === 1) {
    // Re-run to get the output
    try {
      execSync("pnpm run spellcheck 2>&1", { encoding: "utf-8", stdio: "inherit" });
    } catch (e) {
      // Expected - cspell found errors
    }
    process.exit(1);
  } else {
    console.error("Error running spellcheck:", error.message);
    process.exit(1);
  }
}
