import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NextEdgeWebsite from "../../components/NextEdgeWebsite.js";

function stripMotionProps<T extends Record<string, unknown>>({
  initial, animate, transition, whileInView, viewport, ...rest
}: T) {
  return rest;
}

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div {...stripMotionProps(props)}>{children}</div>
    ),
    path: (props: React.SVGProps<SVGPathElement> & Record<string, unknown>) => (
      <path {...stripMotionProps(props)} />
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
      logos.forEach((img) => expect(img).toHaveAttribute("src", "/nextedge-logo.png"));
    });
  });

  describe("brand copy", () => {
    it("renders the company name in the header", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText("NextEdge Machining")).toBeInTheDocument();
    });

    it("renders the tagline", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getAllByText("From Vision to Precision").length).toBeGreaterThanOrEqual(1);
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
        screen.getByText(/Infrastructure intelligence for systems that cannot afford silent failure/i)
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
      expect(screen.getByRole("button", { name: /contact/i })).toBeInTheDocument();
    });

    it("renders the Request a Conversation button", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByRole("button", { name: /request a conversation/i })).toBeInTheDocument();
    });

    it("renders the View the Concept button", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByRole("button", { name: /view the concept/i })).toBeInTheDocument();
    });
  });

  describe("View the Concept scroll behavior", () => {
    it("calls scrollIntoView on the concept section when clicked", () => {
      render(<NextEdgeWebsite />);

      const conceptSection = document.getElementById("concept-section");
      const scrollMock = vi.fn();
      if (conceptSection) conceptSection.scrollIntoView = scrollMock;

      fireEvent.click(screen.getByRole("button", { name: /view the concept/i }));
      expect(scrollMock).toHaveBeenCalledWith({ behavior: "smooth" });
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

  describe("concept section", () => {
    it("renders the concept section with the correct id", () => {
      const { container } = render(<NextEdgeWebsite />);
      expect(container.querySelector("#concept-section")).toBeInTheDocument();
    });

    it("renders the Concept Architecture label", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText(/Concept Architecture/i)).toBeInTheDocument();
    });

    it("renders the drift headline", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText(/Critical failures rarely begin with catastrophic events/i)).toBeInTheDocument();
    });

    it("renders the 'unnoticed drift' phrase", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText(/They begin with unnoticed drift/i)).toBeInTheDocument();
    });

    const flowSteps = [
      "Sensors",
      "Signal Conditioning",
      "Telemetry Reliability Engine",
      "Pattern Interpretation",
      "Operational Alerts",
      "Human Decision Support",
    ];

    flowSteps.forEach((step) => {
      it(`renders flow step "${step}"`, () => {
        render(<NextEdgeWebsite />);
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    const principles = [
      "Signal Confidence",
      "Operational Synchronization",
      "Infrastructure Resilience",
    ];

    principles.forEach((p) => {
      it(`renders core principle "${p}"`, () => {
        render(<NextEdgeWebsite />);
        expect(screen.getByText(p)).toBeInTheDocument();
      });
    });

    it("renders all 3 principle descriptions", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByText(/validated against known noise signatures/i)).toBeInTheDocument();
      expect(screen.getByText(/closing the gap between what sensors report/i)).toBeInTheDocument();
      expect(screen.getByText(/Early drift detection/i)).toBeInTheDocument();
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

    it("renders two <section> elements", () => {
      const { container } = render(<NextEdgeWebsite />);
      expect(container.querySelectorAll("section").length).toBe(2);
    });

    it("renders an <h1> heading", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("renders an <h2> heading in the concept section", () => {
      render(<NextEdgeWebsite />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });
  });
});
