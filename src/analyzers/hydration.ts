import type { Issue, AnalysisResult } from "./app-router.js";

export function analyzeHydration(filePath: string, content: string): AnalysisResult {
  const issues: Issue[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    if (/Date\.now\(\)/.test(line) && !lineIsInsideUseEffect(lines, index)) {
      issues.push({
        type: "nondeterministic-date",
        severity: "error",
        message:
          "Date.now() in render causes hydration mismatch — use useEffect or pass as prop",
        line: lineNum,
      });
    }

    if (/Math\.random\(\)/.test(line) && !lineIsInsideUseEffect(lines, index)) {
      issues.push({
        type: "nondeterministic-random",
        severity: "error",
        message:
          "Math.random() in render causes hydration mismatch — move to useEffect or server-side",
        line: lineNum,
      });
    }

    if (
      /typeof window\s*!==\s*['"]undefined['"]/.test(line) ||
      /typeof window\s*===\s*['"]undefined['"]/.test(line)
    ) {
      issues.push({
        type: "window-check-in-render",
        severity: "warning",
        message:
          "typeof window checks in render can cause hydration mismatches — use useEffect to run client-only code",
        line: lineNum,
      });
    }

    if (
      /\b(localStorage|sessionStorage)\b/.test(line) &&
      !lineIsInsideUseEffect(lines, index)
    ) {
      issues.push({
        type: "browser-storage-in-render",
        severity: "error",
        message:
          "localStorage/sessionStorage is not available during SSR — access only in useEffect",
        line: lineNum,
      });
    }
  });

  return { filePath, issues };
}

function lineIsInsideUseEffect(lines: string[], lineIndex: number): boolean {
  let depth = 0;
  let insideEffect = false;

  for (let i = 0; i < lineIndex; i++) {
    const line = lines[i];
    if (/useEffect\s*\(/.test(line)) {
      insideEffect = true;
      depth = 0;
    }
    if (insideEffect) {
      depth += (line.match(/\{/g) ?? []).length;
      depth -= (line.match(/\}/g) ?? []).length;
      if (depth <= 0 && i > 0) {
        insideEffect = false;
      }
    }
  }

  return insideEffect;
}
