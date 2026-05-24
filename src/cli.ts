#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs";
import { PatternStore } from "./store.js";
import { analyzeAppRouter } from "./analyzers/app-router.js";
import { analyzeHydration } from "./analyzers/hydration.js";

const program = new Command();

program
  .name("gna")
  .description("Local-first CLI that remembers AI-generated Next.js failure patterns")
  .version("0.1.0");

program
  .command("scan <file>")
  .description("Scan a file for known structural issues")
  .action((file: string) => {
    if (!fs.existsSync(file)) {
      process.stderr.write(`File not found: ${file}\n`);
      process.exit(1);
    }

    const content = fs.readFileSync(file, "utf-8");
    const routerResult = analyzeAppRouter(file, content);
    const hydrationResult = analyzeHydration(file, content);
    const issues = [...routerResult.issues, ...hydrationResult.issues];

    if (issues.length === 0) {
      process.stdout.write("No issues found.\n");
      process.exit(0);
    }

    for (const issue of issues) {
      const loc = issue.line ? `:${issue.line}` : "";
      process.stdout.write(
        `[${issue.severity.toUpperCase()}] ${file}${loc}: ${issue.message}\n`
      );
    }

    process.exit(issues.some((i) => i.severity === "error") ? 1 : 0);
  });

program
  .command("history")
  .description("Show stored failure patterns")
  .action(() => {
    const store = new PatternStore();
    const records = store.all();

    if (records.length === 0) {
      process.stdout.write("No failure patterns stored yet.\n");
      return;
    }

    for (const r of records) {
      process.stdout.write(`${r.id}: ${r.pattern} (${r.occurrences} occurrences)\n`);
    }
  });

program.parse();
