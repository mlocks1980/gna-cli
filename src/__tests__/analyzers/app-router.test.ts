import { describe, it, expect } from "vitest";
import { analyzeAppRouter } from "../../analyzers/app-router.js";

describe("analyzeAppRouter", () => {
  it("returns no issues for a clean server component", () => {
    const content = `
export default function Page() {
  return <main>Hello</main>;
}
`;
    const result = analyzeAppRouter("page.tsx", content);
    expect(result.issues).toHaveLength(0);
  });

  it("returns no issues for a valid client component", () => {
    const content = `"use client"
import { useState } from "react";
export default function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
`;
    const result = analyzeAppRouter("counter.tsx", content);
    expect(result.issues).toHaveLength(0);
  });

  describe("misplaced-use-client", () => {
    it("flags 'use client' that appears after other code", () => {
      const content = `import React from "react";
"use client"
export default function Page() { return <div />; }
`;
      const result = analyzeAppRouter("page.tsx", content);
      const issue = result.issues.find((i) => i.type === "misplaced-use-client");
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("error");
    });

    it("does not flag 'use client' that is the first line", () => {
      const content = `"use client"
import { useState } from "react";
export default function Page() { return <div />; }
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "misplaced-use-client")).toBeUndefined();
    });
  });

  describe("server-import-in-client", () => {
    it("flags next/headers imported inside a client component", () => {
      const content = `"use client"
import { headers } from "next/headers";
export default function Page() { return <div />; }
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "server-import-in-client")).toBeDefined();
    });

    it("flags next/cookies imported inside a client component", () => {
      const content = `"use client"
import { cookies } from "next/cookies";
export default function Page() { return <div />; }
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "server-import-in-client")).toBeDefined();
    });

    it("does not flag next/headers in a server component", () => {
      const content = `import { headers } from "next/headers";
export default async function Page() { return <div />; }
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "server-import-in-client")).toBeUndefined();
    });
  });

  describe("metadata-in-client-component", () => {
    it("flags metadata export in a client component", () => {
      const content = `"use client"
export const metadata = { title: "My Page" };
export default function Page() { return <div />; }
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "metadata-in-client-component")).toBeDefined();
    });

    it("allows metadata export in a server component", () => {
      const content = `export const metadata = { title: "My Page" };
export default function Page() { return <div />; }
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "metadata-in-client-component")).toBeUndefined();
    });
  });

  describe("client-hook-in-server-component", () => {
    it("flags useState in a server component", () => {
      const content = `import { useState } from "react";
export default function Page() {
  const [x] = useState(0);
  return <div>{x}</div>;
}
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "client-hook-in-server-component")).toBeDefined();
    });

    it("flags useEffect in a server component", () => {
      const content = `import { useEffect } from "react";
export default function Page() {
  useEffect(() => {}, []);
  return <div />;
}
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "client-hook-in-server-component")).toBeDefined();
    });

    it("does not flag hooks in a client component", () => {
      const content = `"use client"
import { useState, useEffect } from "react";
export default function Page() {
  const [x] = useState(0);
  useEffect(() => {}, []);
  return <div />;
}
`;
      const result = analyzeAppRouter("page.tsx", content);
      expect(result.issues.find((i) => i.type === "client-hook-in-server-component")).toBeUndefined();
    });
  });

  it("includes the filePath in the result", () => {
    const result = analyzeAppRouter("src/app/page.tsx", "");
    expect(result.filePath).toBe("src/app/page.tsx");
  });

  it("can report multiple issues in a single file", () => {
    const content = `"use client"
import { headers } from "next/headers";
export const metadata = { title: "bad" };
export default function Page() { return <div />; }
`;
    const result = analyzeAppRouter("page.tsx", content);
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });
});
