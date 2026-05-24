export interface Issue {
  type: string;
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
}

export interface AnalysisResult {
  filePath: string;
  issues: Issue[];
}

export function analyzeAppRouter(filePath: string, content: string): AnalysisResult {
  const issues: Issue[] = [];
  const lines = content.split("\n");

  const hasUseClient =
    content.includes('"use client"') || content.includes("'use client'");

  const clientDirectiveLine = lines.findIndex(
    (l) => l.includes('"use client"') || l.includes("'use client'")
  );

  if (hasUseClient && clientDirectiveLine > 0) {
    const precedingCode = lines
      .slice(0, clientDirectiveLine)
      .some((l) => l.trim() !== "" && !l.trim().startsWith("//"));

    if (precedingCode) {
      issues.push({
        type: "misplaced-use-client",
        severity: "error",
        message: '"use client" must be the first statement in a file',
        line: clientDirectiveLine + 1,
      });
    }
  }

  if (hasUseClient) {
    if (
      content.includes("next/headers") ||
      content.includes("next/cookies")
    ) {
      issues.push({
        type: "server-import-in-client",
        severity: "error",
        message:
          "Server-only modules (next/headers, next/cookies) cannot be used in client components",
      });
    }

    if (content.includes("export const metadata")) {
      issues.push({
        type: "metadata-in-client-component",
        severity: "error",
        message: "Metadata cannot be exported from a client component",
      });
    }
  }

  if (!hasUseClient) {
    if (content.includes("useState") || content.includes("useEffect")) {
      issues.push({
        type: "client-hook-in-server-component",
        severity: "error",
        message:
          "React hooks (useState, useEffect) cannot be used in server components without 'use client'",
      });
    }
  }

  return { filePath, issues };
}
