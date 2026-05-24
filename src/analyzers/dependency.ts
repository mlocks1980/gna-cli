import type { Issue, AnalysisResult } from "./app-router.js";

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface LockfileEntry {
  name: string;
  resolvedVersion: string;
}

export function analyzeDependencyDrift(
  packageJson: PackageJson,
  lockfileEntries: LockfileEntry[],
  filePath = "package.json"
): AnalysisResult {
  const issues: Issue[] = [];

  const declared: Record<string, string> = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  };

  const lockMap = new Map(lockfileEntries.map((e) => [e.name, e.resolvedVersion]));

  for (const [pkg, specifier] of Object.entries(declared)) {
    if (!lockMap.has(pkg)) {
      issues.push({
        type: "missing-lockfile-entry",
        severity: "warning",
        message: `"${pkg}" is in package.json but has no lockfile entry — run your package manager to sync`,
      });
      continue;
    }

    if (specifier === "latest" || specifier === "*") {
      issues.push({
        type: "unpinned-version",
        severity: "warning",
        message: `"${pkg}" uses an unpinned specifier "${specifier}" — this can cause non-deterministic installs`,
      });
    }
  }

  for (const entry of lockfileEntries) {
    if (!declared[entry.name]) {
      issues.push({
        type: "phantom-dependency",
        severity: "info",
        message: `"${entry.name}" is in the lockfile but not declared in package.json`,
      });
    }
  }

  return { filePath, issues };
}
