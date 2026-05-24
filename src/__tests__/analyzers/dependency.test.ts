import { describe, it, expect } from "vitest";
import { analyzeDependencyDrift } from "../../analyzers/dependency.js";
import type { PackageJson, LockfileEntry } from "../../analyzers/dependency.js";

describe("analyzeDependencyDrift", () => {
  it("returns no issues when package.json and lockfile are in sync", () => {
    const pkg: PackageJson = {
      dependencies: { react: "^18.0.0" },
    };
    const lock: LockfileEntry[] = [{ name: "react", resolvedVersion: "18.3.1" }];
    expect(analyzeDependencyDrift(pkg, lock).issues).toHaveLength(0);
  });

  describe("missing-lockfile-entry", () => {
    it("flags a declared dependency not present in the lockfile", () => {
      const pkg: PackageJson = { dependencies: { "some-package": "^1.0.0" } };
      const lock: LockfileEntry[] = [];
      const result = analyzeDependencyDrift(pkg, lock);
      expect(result.issues.find((i) => i.type === "missing-lockfile-entry")).toBeDefined();
    });

    it("includes the package name in the message", () => {
      const pkg: PackageJson = { dependencies: { "missing-pkg": "^2.0.0" } };
      const lock: LockfileEntry[] = [];
      const issue = analyzeDependencyDrift(pkg, lock).issues[0];
      expect(issue.message).toContain("missing-pkg");
    });

    it("checks devDependencies too", () => {
      const pkg: PackageJson = { devDependencies: { vitest: "^1.0.0" } };
      const lock: LockfileEntry[] = [];
      const result = analyzeDependencyDrift(pkg, lock);
      expect(result.issues.find((i) => i.type === "missing-lockfile-entry")).toBeDefined();
    });

    it("checks peerDependencies too", () => {
      const pkg: PackageJson = { peerDependencies: { react: ">=18" } };
      const lock: LockfileEntry[] = [];
      const result = analyzeDependencyDrift(pkg, lock);
      expect(result.issues.find((i) => i.type === "missing-lockfile-entry")).toBeDefined();
    });
  });

  describe("unpinned-version", () => {
    it("flags packages with 'latest' specifier", () => {
      const pkg: PackageJson = { dependencies: { lodash: "latest" } };
      const lock: LockfileEntry[] = [{ name: "lodash", resolvedVersion: "4.17.21" }];
      const result = analyzeDependencyDrift(pkg, lock);
      expect(result.issues.find((i) => i.type === "unpinned-version")).toBeDefined();
    });

    it("flags packages with '*' specifier", () => {
      const pkg: PackageJson = { dependencies: { lodash: "*" } };
      const lock: LockfileEntry[] = [{ name: "lodash", resolvedVersion: "4.17.21" }];
      const result = analyzeDependencyDrift(pkg, lock);
      expect(result.issues.find((i) => i.type === "unpinned-version")).toBeDefined();
    });

    it("does not flag semver range specifiers like ^1.0.0", () => {
      const pkg: PackageJson = { dependencies: { lodash: "^4.17.21" } };
      const lock: LockfileEntry[] = [{ name: "lodash", resolvedVersion: "4.17.21" }];
      const result = analyzeDependencyDrift(pkg, lock);
      expect(result.issues.find((i) => i.type === "unpinned-version")).toBeUndefined();
    });
  });

  describe("phantom-dependency", () => {
    it("flags a lockfile entry not declared in package.json", () => {
      const pkg: PackageJson = { dependencies: { react: "^18.0.0" } };
      const lock: LockfileEntry[] = [
        { name: "react", resolvedVersion: "18.3.1" },
        { name: "loose-envify", resolvedVersion: "1.4.0" },
      ];
      const result = analyzeDependencyDrift(pkg, lock);
      const issue = result.issues.find(
        (i) => i.type === "phantom-dependency" && i.message.includes("loose-envify")
      );
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("info");
    });

    it("does not flag declared packages that also appear in the lockfile", () => {
      const pkg: PackageJson = { dependencies: { react: "^18.0.0" } };
      const lock: LockfileEntry[] = [{ name: "react", resolvedVersion: "18.3.1" }];
      const result = analyzeDependencyDrift(pkg, lock);
      expect(result.issues.find((i) => i.type === "phantom-dependency")).toBeUndefined();
    });
  });

  it("uses the provided filePath in the result", () => {
    const result = analyzeDependencyDrift({}, [], "apps/web/package.json");
    expect(result.filePath).toBe("apps/web/package.json");
  });

  it("defaults filePath to 'package.json'", () => {
    const result = analyzeDependencyDrift({}, []);
    expect(result.filePath).toBe("package.json");
  });

  it("handles empty package.json with no sections", () => {
    expect(analyzeDependencyDrift({}, []).issues).toHaveLength(0);
  });

  it("reports multiple issue types in a single analysis", () => {
    const pkg: PackageJson = {
      dependencies: { react: "latest", missing: "^1.0.0" },
    };
    const lock: LockfileEntry[] = [
      { name: "react", resolvedVersion: "18.3.1" },
      { name: "phantom", resolvedVersion: "2.0.0" },
    ];
    const result = analyzeDependencyDrift(pkg, lock);
    const types = result.issues.map((i) => i.type);
    expect(types).toContain("unpinned-version");
    expect(types).toContain("missing-lockfile-entry");
    expect(types).toContain("phantom-dependency");
  });
});
