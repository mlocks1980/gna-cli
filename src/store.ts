import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import type { AnonymizedMetadata } from "./anonymizer.js";

export interface PatternRecord {
  id: string;
  metadata: AnonymizedMetadata;
  pattern: string;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
}

interface StoreData {
  version: number;
  records: PatternRecord[];
}

const STORE_VERSION = 1;
const STORE_FILENAME = "store.json";

export class PatternStore {
  private storePath: string;
  private data: StoreData;

  constructor(storeDir: string = path.join(os.homedir(), ".gna")) {
    this.storePath = path.join(storeDir, STORE_FILENAME);
    this.data = this.load();
  }

  private load(): StoreData {
    try {
      if (!fs.existsSync(this.storePath)) {
        return this.empty();
      }
      const raw = fs.readFileSync(this.storePath, "utf-8");
      const parsed = JSON.parse(raw) as StoreData;
      if (parsed.version !== STORE_VERSION) {
        return this.migrate(parsed);
      }
      return parsed;
    } catch {
      return this.empty();
    }
  }

  private empty(): StoreData {
    return { version: STORE_VERSION, records: [] };
  }

  private migrate(_old: Partial<StoreData>): StoreData {
    return this.empty();
  }

  save(): void {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), "utf-8");
  }

  add(record: PatternRecord): void {
    const existing = this.findById(record.id);
    if (existing) {
      existing.occurrences += 1;
      existing.lastSeen = record.lastSeen;
    } else {
      this.data.records.push(record);
    }
  }

  findById(id: string): PatternRecord | undefined {
    return this.data.records.find((r) => r.id === id);
  }

  findByPattern(pattern: string): PatternRecord[] {
    return this.data.records.filter((r) => r.pattern === pattern);
  }

  all(): PatternRecord[] {
    return [...this.data.records];
  }

  clear(): void {
    this.data = this.empty();
  }
}
