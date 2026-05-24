import { describe, it, expect } from "vitest";
import {
  extractPatterns,
  matchAgainstRecords,
  buildPatternId,
} from "../matcher.js";
import type { PatternRecord } from "../store.js";

function makeRecord(overrides: Partial<PatternRecord> = {}): PatternRecord {
  return {
    id: "test-id",
    metadata: {
      fileHash: "abc",
      fileExtension: ".tsx",
      errorType: "Error",
      errorMessage: "msg",
      timestamp: 0,
    },
    pattern: "directive:use-client",
    occurrences: 1,
    firstSeen: 0,
    lastSeen: 0,
    ...overrides,
  };
}

describe("extractPatterns", () => {
  it("extracts named imports", () => {
    const change = {
      filePath: "page.tsx",
      content: `import { useState } from 'react'`,
    };
    const patterns = extractPatterns(change);
    expect(patterns).toContain("import:react");
  });

  it("extracts the use-client directive", () => {
    const change = {
      filePath: "page.tsx",
      content: `"use client"\nimport React from 'react'`,
    };
    expect(extractPatterns(change)).toContain("directive:use-client");
  });

  it("extracts the use-server directive", () => {
    const change = {
      filePath: "actions.ts",
      content: `"use server"\nexport async function action() {}`,
    };
    expect(extractPatterns(change)).toContain("directive:use-server");
  });

  it("extracts hook usage patterns", () => {
    const change = {
      filePath: "component.tsx",
      content: `const [val, setVal] = useState(false)\nuseEffect(() => {}, [])`,
    };
    const patterns = extractPatterns(change);
    expect(patterns).toContain("hook:useState");
    expect(patterns).toContain("hook:useEffect");
  });

  it("deduplicates repeated patterns", () => {
    const change = {
      filePath: "page.tsx",
      content: `import { a } from 'react'\nimport { b } from 'react'`,
    };
    const patterns = extractPatterns(change);
    const reactImports = patterns.filter((p) => p === "import:react");
    expect(reactImports).toHaveLength(1);
  });

  it("returns an empty array for an empty file", () => {
    expect(extractPatterns({ filePath: "empty.ts", content: "" })).toHaveLength(0);
  });

  it("does not produce false positives from comments", () => {
    const change = {
      filePath: "page.tsx",
      content: `// import { something } from 'fake-module'`,
    };
    expect(extractPatterns(change)).not.toContain("import:fake-module");
  });
});

describe("matchAgainstRecords", () => {
  it("returns matched=true when a pattern exists in the store", () => {
    const records = [makeRecord({ pattern: "directive:use-client" })];
    const result = matchAgainstRecords(["directive:use-client"], records);
    expect(result.matched).toBe(true);
    expect(result.pattern).toBe("directive:use-client");
  });

  it("returns matched=false when no patterns match", () => {
    const records = [makeRecord({ pattern: "hook:useState" })];
    const result = matchAgainstRecords(["import:react"], records);
    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it("returns the record with the highest occurrence count", () => {
    const low = makeRecord({ id: "low", pattern: "hook:useState", occurrences: 1 });
    const high = makeRecord({ id: "high", pattern: "hook:useState", occurrences: 5 });
    const result = matchAgainstRecords(["hook:useState"], [low, high]);
    expect(result.record?.id).toBe("high");
  });

  it("caps confidence at 1.0 for high-occurrence records", () => {
    const record = makeRecord({ occurrences: 100 });
    const result = matchAgainstRecords(["directive:use-client"], [record]);
    expect(result.confidence).toBe(1);
  });

  it("scales confidence for low-occurrence records", () => {
    const record = makeRecord({ occurrences: 1 });
    const result = matchAgainstRecords(["directive:use-client"], [record]);
    expect(result.confidence).toBeCloseTo(1 / 3);
  });

  it("returns matched=false against an empty store", () => {
    const result = matchAgainstRecords(["directive:use-client"], []);
    expect(result.matched).toBe(false);
  });
});

describe("buildPatternId", () => {
  it("returns a 16-character hex string", () => {
    expect(buildPatternId("directive:use-client")).toMatch(/^[a-f0-9]{16}$/);
  });

  it("is deterministic", () => {
    expect(buildPatternId("hook:useState")).toBe(buildPatternId("hook:useState"));
  });

  it("produces different IDs for different patterns", () => {
    expect(buildPatternId("hook:useState")).not.toBe(buildPatternId("hook:useEffect"));
  });
});
