import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { PatternStore } from "../store.js";
import type { PatternRecord } from "../store.js";

function makeRecord(overrides: Partial<PatternRecord> = {}): PatternRecord {
  return {
    id: "abc123",
    metadata: {
      fileHash: "deadbeef12345678",
      fileExtension: ".tsx",
      errorType: "HydrationError",
      errorMessage: "Mismatch detected",
      timestamp: 1716000000000,
    },
    pattern: "directive:use-client",
    occurrences: 1,
    firstSeen: 1716000000000,
    lastSeen: 1716000000000,
    ...overrides,
  };
}

describe("PatternStore", () => {
  let tmpDir: string;
  let store: PatternStore;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gna-test-"));
    store = new PatternStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("initial state", () => {
    it("starts with an empty record list", () => {
      expect(store.all()).toHaveLength(0);
    });
  });

  describe("add", () => {
    it("stores a new record", () => {
      store.add(makeRecord());
      expect(store.all()).toHaveLength(1);
    });

    it("increments occurrences instead of duplicating on repeated add", () => {
      store.add(makeRecord());
      store.add(makeRecord({ lastSeen: 1716000001000 }));
      expect(store.all()).toHaveLength(1);
      expect(store.all()[0].occurrences).toBe(2);
    });

    it("updates lastSeen on repeated add", () => {
      store.add(makeRecord());
      store.add(makeRecord({ lastSeen: 9999999999999 }));
      expect(store.all()[0].lastSeen).toBe(9999999999999);
    });

    it("stores multiple distinct records", () => {
      store.add(makeRecord({ id: "aaa", pattern: "directive:use-client" }));
      store.add(makeRecord({ id: "bbb", pattern: "hook:useState" }));
      expect(store.all()).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("returns the record with a matching id", () => {
      store.add(makeRecord({ id: "xyz" }));
      expect(store.findById("xyz")).toBeDefined();
      expect(store.findById("xyz")?.id).toBe("xyz");
    });

    it("returns undefined for an unknown id", () => {
      expect(store.findById("nonexistent")).toBeUndefined();
    });
  });

  describe("findByPattern", () => {
    it("returns all records matching a pattern", () => {
      store.add(makeRecord({ id: "r1", pattern: "hook:useState" }));
      store.add(makeRecord({ id: "r2", pattern: "hook:useState" }));
      store.add(makeRecord({ id: "r3", pattern: "directive:use-client" }));
      expect(store.findByPattern("hook:useState")).toHaveLength(2);
    });

    it("returns an empty array when pattern has no matches", () => {
      expect(store.findByPattern("import:react")).toHaveLength(0);
    });
  });

  describe("save and reload", () => {
    it("persists records to disk and reloads them", () => {
      store.add(makeRecord({ id: "persist-me" }));
      store.save();

      const reloaded = new PatternStore(tmpDir);
      expect(reloaded.all()).toHaveLength(1);
      expect(reloaded.findById("persist-me")).toBeDefined();
    });

    it("round-trips all record fields accurately", () => {
      const record = makeRecord({ occurrences: 5 });
      store.add(record);
      store.save();

      const reloaded = new PatternStore(tmpDir);
      const saved = reloaded.all()[0];
      expect(saved.pattern).toBe(record.pattern);
      expect(saved.occurrences).toBe(5);
    });

    it("creates the store directory if it does not exist", () => {
      const nested = path.join(tmpDir, "deep", "nested");
      const s = new PatternStore(nested);
      s.add(makeRecord());
      s.save();
      expect(fs.existsSync(path.join(nested, "store.json"))).toBe(true);
    });

    it("recovers gracefully from a corrupted store file", () => {
      fs.writeFileSync(path.join(tmpDir, "store.json"), "{ not valid json", "utf-8");
      const s = new PatternStore(tmpDir);
      expect(s.all()).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("removes all records", () => {
      store.add(makeRecord({ id: "r1" }));
      store.add(makeRecord({ id: "r2" }));
      store.clear();
      expect(store.all()).toHaveLength(0);
    });
  });
});
