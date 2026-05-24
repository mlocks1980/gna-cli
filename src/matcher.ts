import * as crypto from "crypto";
import type { PatternRecord } from "./store.js";

export interface FileChange {
  filePath: string;
  content: string;
}

export interface MatchResult {
  matched: boolean;
  pattern?: string;
  record?: PatternRecord;
  confidence: number;
}

export function extractPatterns(change: FileChange): string[] {
  const patterns: string[] = [
    ...extractImportPatterns(change.content),
    ...extractDirectivePatterns(change.content),
    ...extractHookPatterns(change.content),
  ];
  return [...new Set(patterns)];
}

export function matchAgainstRecords(
  patterns: string[],
  records: PatternRecord[]
): MatchResult {
  for (const pattern of patterns) {
    const matches = records.filter((r) => r.pattern === pattern);
    if (matches.length > 0) {
      const record = matches.sort((a, b) => b.occurrences - a.occurrences)[0];
      return {
        matched: true,
        pattern,
        record,
        confidence: Math.min(1, record.occurrences / 3),
      };
    }
  }
  return { matched: false, confidence: 0 };
}

export function buildPatternId(pattern: string): string {
  return crypto.createHash("sha256").update(pattern).digest("hex").slice(0, 16);
}

function extractImportPatterns(content: string): string[] {
  const patterns: string[] = [];
  const importRegex = /^(?!\s*\/\/).*import\s+.*?from\s+['"]([^'"]+)['"]/gm;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    patterns.push(`import:${match[1]}`);
  }
  return patterns;
}

function extractDirectivePatterns(content: string): string[] {
  const patterns: string[] = [];
  if (content.includes('"use client"') || content.includes("'use client'")) {
    patterns.push("directive:use-client");
  }
  if (content.includes('"use server"') || content.includes("'use server'")) {
    patterns.push("directive:use-server");
  }
  return patterns;
}

function extractHookPatterns(content: string): string[] {
  const hookRegex = /\buse[A-Z]\w+\(/g;
  const hooks = content.match(hookRegex) ?? [];
  return hooks.map((h) => `hook:${h.slice(0, -1)}`);
}
