import { describe, it, expect } from "vitest";
import { analyzeHydration } from "../../analyzers/hydration.js";

describe("analyzeHydration", () => {
  it("returns no issues for a clean component", () => {
    const content = `export default function Page() {
  return <main>Hello</main>;
}`;
    expect(analyzeHydration("page.tsx", content).issues).toHaveLength(0);
  });

  describe("nondeterministic-date", () => {
    it("flags Date.now() used directly in render", () => {
      const content = `export default function Page() {
  return <span>{Date.now()}</span>;
}`;
      const result = analyzeHydration("page.tsx", content);
      expect(result.issues.find((i) => i.type === "nondeterministic-date")).toBeDefined();
    });

    it("reports the correct line number", () => {
      const content = `export default function Page() {\n  return <span>{Date.now()}</span>;\n}`;
      const result = analyzeHydration("page.tsx", content);
      const issue = result.issues.find((i) => i.type === "nondeterministic-date");
      expect(issue?.line).toBe(2);
    });

    it("does not flag Date.now() inside useEffect", () => {
      const content = `import { useEffect } from "react";
export default function Page() {
  useEffect(() => {
    const t = Date.now();
    console.log(t);
  }, []);
  return <div />;
}`;
      const result = analyzeHydration("page.tsx", content);
      expect(result.issues.find((i) => i.type === "nondeterministic-date")).toBeUndefined();
    });
  });

  describe("nondeterministic-random", () => {
    it("flags Math.random() used directly in render", () => {
      const content = `export default function Page() {
  const id = Math.random();
  return <div id={id} />;
}`;
      const result = analyzeHydration("page.tsx", content);
      expect(result.issues.find((i) => i.type === "nondeterministic-random")).toBeDefined();
    });

    it("is an error severity issue", () => {
      const content = `export default function Page() {
  return <div key={Math.random()} />;
}`;
      const issue = analyzeHydration("page.tsx", content).issues.find(
        (i) => i.type === "nondeterministic-random"
      );
      expect(issue?.severity).toBe("error");
    });
  });

  describe("window-check-in-render", () => {
    it("flags typeof window !== 'undefined' checks", () => {
      const content = `export default function Page() {
  const isClient = typeof window !== "undefined";
  return <div>{isClient ? "client" : "server"}</div>;
}`;
      const result = analyzeHydration("page.tsx", content);
      expect(result.issues.find((i) => i.type === "window-check-in-render")).toBeDefined();
    });

    it("flags typeof window === 'undefined' checks", () => {
      const content = `export default function Page() {
  if (typeof window === "undefined") return null;
  return <div />;
}`;
      const result = analyzeHydration("page.tsx", content);
      expect(result.issues.find((i) => i.type === "window-check-in-render")).toBeDefined();
    });

    it("is a warning severity issue", () => {
      const content = `export default function Page() {
  const ok = typeof window !== "undefined";
  return <div />;
}`;
      const issue = analyzeHydration("page.tsx", content).issues.find(
        (i) => i.type === "window-check-in-render"
      );
      expect(issue?.severity).toBe("warning");
    });
  });

  describe("browser-storage-in-render", () => {
    it("flags localStorage access outside useEffect", () => {
      const content = `export default function Page() {
  const token = localStorage.getItem("token");
  return <div>{token}</div>;
}`;
      const result = analyzeHydration("page.tsx", content);
      expect(result.issues.find((i) => i.type === "browser-storage-in-render")).toBeDefined();
    });

    it("flags sessionStorage access outside useEffect", () => {
      const content = `export default function Page() {
  const data = sessionStorage.getItem("key");
  return <div>{data}</div>;
}`;
      const result = analyzeHydration("page.tsx", content);
      expect(result.issues.find((i) => i.type === "browser-storage-in-render")).toBeDefined();
    });

    it("does not flag localStorage inside useEffect", () => {
      const content = `import { useEffect, useState } from "react";
export default function Page() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);
  return <div>{token}</div>;
}`;
      const result = analyzeHydration("page.tsx", content);
      expect(result.issues.find((i) => i.type === "browser-storage-in-render")).toBeUndefined();
    });
  });

  it("includes the filePath in the result", () => {
    const result = analyzeHydration("src/app/page.tsx", "");
    expect(result.filePath).toBe("src/app/page.tsx");
  });

  it("can report multiple distinct issues in one file", () => {
    const content = `export default function Page() {
  const id = Math.random();
  const ts = Date.now();
  return <div id={id}>{ts}</div>;
}`;
    const result = analyzeHydration("page.tsx", content);
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });
});
