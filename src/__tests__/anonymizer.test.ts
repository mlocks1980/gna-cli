import { describe, it, expect } from "vitest";
import { anonymize, hashPath, sanitizeString } from "../anonymizer.js";
import type { CrashMetadata } from "../anonymizer.js";

const BASE_METADATA: CrashMetadata = {
  file: "/home/alice/projects/my-app/src/app/page.tsx",
  errorType: "HydrationError",
  errorMessage: "Text content does not match server-rendered HTML",
  timestamp: 1716000000000,
};

describe("anonymize", () => {
  it("returns a hash instead of the raw file path", () => {
    const result = anonymize(BASE_METADATA);
    expect(result.fileHash).not.toContain("alice");
    expect(result.fileHash).not.toContain("my-app");
    expect(result.fileHash).toMatch(/^[a-f0-9]{16}$/);
  });

  it("preserves the file extension", () => {
    const result = anonymize(BASE_METADATA);
    expect(result.fileExtension).toBe(".tsx");
  });

  it("preserves the errorType unchanged", () => {
    const result = anonymize(BASE_METADATA);
    expect(result.errorType).toBe("HydrationError");
  });

  it("preserves the timestamp unchanged", () => {
    const result = anonymize(BASE_METADATA);
    expect(result.timestamp).toBe(BASE_METADATA.timestamp);
  });

  it("sanitizes unix paths from the error message", () => {
    const metadata: CrashMetadata = {
      ...BASE_METADATA,
      errorMessage: 'Cannot find module "/home/alice/projects/my-app/lib/utils"',
    };
    const result = anonymize(metadata);
    expect(result.errorMessage).not.toContain("alice");
    expect(result.errorMessage).not.toContain("my-app");
  });

  it("sanitizes windows paths from the error message", () => {
    const metadata: CrashMetadata = {
      ...BASE_METADATA,
      errorMessage: "Module not found: C:\\Users\\alice\\projects\\app\\index.ts",
    };
    const result = anonymize(metadata);
    expect(result.errorMessage).not.toContain("alice");
    expect(result.errorMessage).toContain("<WIN_PATH>");
  });

  it("sanitizes home-dir tilde paths", () => {
    const metadata: CrashMetadata = {
      ...BASE_METADATA,
      errorMessage: "Cannot resolve ~/projects/my-app/src",
    };
    const result = anonymize(metadata);
    expect(result.errorMessage).not.toContain("my-app");
    expect(result.errorMessage).toContain("<HOME_PATH>");
  });

  it("does not alter a clean message with no paths", () => {
    const message = "Text content does not match server-rendered HTML";
    const metadata: CrashMetadata = { ...BASE_METADATA, errorMessage: message };
    const result = anonymize(metadata);
    expect(result.errorMessage).toBe(message);
  });

  it("produces the same hash for the same file path (deterministic)", () => {
    const r1 = anonymize(BASE_METADATA);
    const r2 = anonymize(BASE_METADATA);
    expect(r1.fileHash).toBe(r2.fileHash);
  });

  it("produces different hashes for different file paths", () => {
    const r1 = anonymize(BASE_METADATA);
    const r2 = anonymize({ ...BASE_METADATA, file: "/home/bob/other-app/page.tsx" });
    expect(r1.fileHash).not.toBe(r2.fileHash);
  });
});

describe("hashPath", () => {
  it("returns a 16-character hex string", () => {
    expect(hashPath("/some/path")).toMatch(/^[a-f0-9]{16}$/);
  });

  it("is stable across calls", () => {
    expect(hashPath("/a/b/c")).toBe(hashPath("/a/b/c"));
  });
});

describe("sanitizeString", () => {
  it("replaces unix paths", () => {
    expect(sanitizeString("error in /usr/local/bin/node")).toContain("<PATH>");
  });

  it("replaces windows paths", () => {
    expect(sanitizeString("error in C:\\Windows\\System32\\cmd.exe")).toContain("<WIN_PATH>");
  });

  it("replaces tilde home paths", () => {
    expect(sanitizeString("file ~/dev/project/index.ts not found")).toContain("<HOME_PATH>");
  });

  it("replaces long string literals", () => {
    expect(sanitizeString('value is "some long string here"')).toContain('"<STRING>"');
  });

  it("leaves short strings untouched", () => {
    const input = 'flag "ok"';
    expect(sanitizeString(input)).toBe(input);
  });

  it("is idempotent on already-sanitized output", () => {
    const once = sanitizeString("/home/user/project/file.ts failed");
    const twice = sanitizeString(once);
    expect(twice).toBe(once);
  });
});
