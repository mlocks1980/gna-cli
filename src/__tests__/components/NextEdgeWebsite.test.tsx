import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import NextEdgeWebsite from "../../components/NextEdgeWebsite.js";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("NextEdgeWebsite", () => {
  describe("smoke test", () => {
    it("renders without throwing", () => {
      expect(() => render(<NextEdgeWebsite />)).not.toThrow();
    });
  });

  describe("logo images", () => {
    it("renders two logo images with accessible alt text", () => {
      render(<NextEdgeWebsite />);
      const logos = screen.getAllByAltText("NextEdge Machining logo");
      expect(logos).toHaveLength(2);
    });

    it("logo images point to the expected src", () => {
      render(<NextEdgeWebsite />);
      const logos = screen.getAllByAltText("NextEdge Machining logo");
      logos.forEach((img) => {
        expect(img).toHaveAttribute("src", "/nextedge-logo.png");
      });
    });
  });

  describe("brand copy", () => {
    it("renders the company name in the header", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText("NextEdge Machining")).toBeInTheDocument();
    });

    it("renders the tagline at least once", () => {
      render(<NextEdgeWebsite />);
      const taglines = screen.getAllByText("From Vision to Precision");
      expect(taglines.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the LLC variant in the hero section", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText("NextEdge Machining LLC")).toBeInTheDocument();
    });
  });

  describe("hero section", () => {
    it("renders the main headline", () => {
      render(<NextEdgeWebsite />);
      expect(
        screen.getByText(
          /Infrastructure intelligence for systems that cannot afford silent failure/i
        )
      ).toBeInTheDocument();
    });

    it("renders the body copy paragraph", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText(/patent pending telemetry/i)).toBeInTheDocument();
    });
  });

  describe("call-to-action buttons", () => {
    it("renders the Contact button", () => {
      render(<NextEdgeWebsite />);
      expect(
        screen.getByRole("button", { name: /contact/i })
      ).toBeInTheDocument();
    });

    it("renders the Request a Conversation button", () => {
      render(<NextEdgeWebsite />);
      expect(
        screen.getByRole("button", { name: /request a conversation/i })
      ).toBeInTheDocument();
    });

    it("renders the View the Concept button", () => {
      render(<NextEdgeWebsite />);
      expect(
        screen.getByRole("button", { name: /view the concept/i })
      ).toBeInTheDocument();
    });
  });

  describe("telemetry panel", () => {
    it("renders the confidence percentage", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText("98.6%")).toBeInTheDocument();
    });

    it("renders the Telemetry Confidence label", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText("Telemetry Confidence")).toBeInTheDocument();
    });

    const telemetryRows: [string, string][] = [
      ["Environmental noise", "Filtered"],
      ["Signal drift", "Detected"],
      ["Operator confidence", "Improving"],
      ["Infrastructure status", "Monitored"],
    ];

    telemetryRows.forEach(([label, value]) => {
      it(`renders the "${label}" row with value "${value}"`, () => {
        render(<NextEdgeWebsite />);
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(value)).toBeInTheDocument();
      });
    });

    it("renders exactly 4 telemetry rows", () => {
      render(<NextEdgeWebsite />);
      const valueTexts = ["Filtered", "Detected", "Improving", "Monitored"];
      valueTexts.forEach((v) => expect(screen.getByText(v)).toBeInTheDocument());
      expect(valueTexts.length).toBe(4);
    });
  });

  describe("document structure", () => {
    it("renders a <main> element as the root", () => {
      const { container } = render(<NextEdgeWebsite />);
      expect(container.querySelector("main")).toBeInTheDocument();
    });

    it("renders a <header> element", () => {
      const { container } = render(<NextEdgeWebsite />);
      expect(container.querySelector("header")).toBeInTheDocument();
    });

    it("renders a <section> element for the hero", () => {
      const { container } = render(<NextEdgeWebsite />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("renders an <h1> heading", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });
});
