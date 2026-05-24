import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Gauge, Activity, ShieldCheck, Network, Radio, Cpu, Bell, Users } from "lucide-react";
import { Button } from "./ui/button";

const logoSrc = "/nextedge-logo.png";

const TELEMETRY_ROWS: [string, string][] = [
  ["Environmental noise", "Filtered"],
  ["Signal drift", "Detected"],
  ["Operator confidence", "Improving"],
  ["Infrastructure status", "Monitored"],
];

const FLOW_STEPS = [
  { label: "Sensors", icon: Radio },
  { label: "Signal Conditioning", icon: Activity },
  { label: "Telemetry Reliability Engine", icon: Cpu },
  { label: "Pattern Interpretation", icon: Network },
  { label: "Operational Alerts", icon: Bell },
  { label: "Human Decision Support", icon: Users },
];

const PRINCIPLES = [
  {
    title: "Signal Confidence",
    description:
      "Every data point is validated against known noise signatures before it influences any operational decision.",
    icon: Activity,
  },
  {
    title: "Operational Synchronization",
    description:
      "Systems stay aligned in real time — closing the gap between what sensors report and what operators know.",
    icon: Network,
  },
  {
    title: "Infrastructure Resilience",
    description:
      "Early drift detection keeps critical systems operational before minor anomalies become structural failures.",
    icon: ShieldCheck,
  },
];

function DriftWaveform() {
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox="0 0 800 80" className="w-full h-12" preserveAspectRatio="none">
        <motion.path
          d="M0,40 C100,10 200,70 300,40 C400,10 500,70 600,40 C700,10 800,70 900,40"
          fill="none"
          stroke="rgba(45,212,191,0.4)"
          strokeWidth="2"
          animate={{
            d: [
              "M0,40 C100,10 200,70 300,40 C400,10 500,70 600,40 C700,10 800,70 900,40",
              "M0,40 C100,70 200,10 300,40 C400,70 500,10 600,40 C700,70 800,10 900,40",
              "M0,40 C100,10 200,70 300,40 C400,10 500,70 600,40 C700,10 800,70 900,40",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,45 C150,15 250,65 400,45 C550,15 650,65 800,45"
          fill="none"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="1.5"
          animate={{
            d: [
              "M0,45 C150,15 250,65 400,45 C550,15 650,65 800,45",
              "M0,45 C150,65 250,15 400,45 C550,65 650,15 800,45",
              "M0,45 C150,15 250,65 400,45 C550,15 650,65 800,45",
            ],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.path
          d="M0,50 C200,20 300,75 500,50 C700,20 750,70 800,50"
          fill="none"
          stroke="rgba(45,212,191,0.15)"
          strokeWidth="1"
          animate={{
            d: [
              "M0,50 C200,20 300,75 500,50 C700,20 750,70 800,50",
              "M0,50 C200,70 300,20 500,50 C700,70 750,20 800,50",
              "M0,50 C200,20 300,75 500,50 C700,20 750,70 800,50",
            ],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </svg>
    </div>
  );
}

function FlowStep({
  step,
  index,
  isLast,
}: {
  step: (typeof FLOW_STEPS)[number];
  index: number;
  isLast: boolean;
}) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex flex-col items-center"
    >
      <div className="flex items-center gap-4 w-full max-w-xs">
        <div className="relative flex-shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full bg-teal-400/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.4 }}
          />
          <div className="relative z-10 w-12 h-12 rounded-full border border-teal-400/40 bg-slate-900 flex items-center justify-center">
            <Icon className="h-5 w-5 text-teal-300" />
          </div>
        </div>
        <div>
          <p className="text-white font-semibold">{step.label}</p>
        </div>
      </div>

      {!isLast && (
        <div className="flex flex-col items-start w-full max-w-xs pl-6 py-1">
          <motion.div
            className="w-px bg-gradient-to-b from-teal-400/60 to-teal-400/10"
            initial={{ height: 0 }}
            whileInView={{ height: 28 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
            viewport={{ once: true }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function NextEdgeWebsite() {
  const scrollToConcept = () => {
    document.getElementById("concept-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* HEADER */}
      <header className="relative z-20 px-6 py-5 md:px-12 lg:px-24 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={logoSrc}
              alt="NextEdge Machining logo"
              className="h-16 w-auto rounded-xl bg-white p-1 shadow-lg"
            />
            <div>
              <p className="text-xl font-bold tracking-wide">NextEdge Machining</p>
              <p className="text-sm text-teal-300 italic">From Vision to Precision</p>
            </div>
          </div>
          <Button className="hidden sm:flex rounded-2xl bg-teal-400 text-slate-950 hover:bg-teal-300">
            Contact
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 py-20 md:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.22),transparent_35%),radial-gradient(circle_at_left,rgba(59,130,246,0.18),transparent_30%)]" />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <img
                src={logoSrc}
                alt="NextEdge Machining logo"
                className="h-24 w-auto rounded-2xl bg-white p-2 shadow-2xl"
              />
              <div>
                <p className="text-teal-300 uppercase tracking-[0.3em] text-sm">
                  NextEdge Machining LLC
                </p>
                <p className="text-slate-300 italic">From Vision to Precision</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Infrastructure intelligence for systems that cannot afford silent failure.
            </h1>

            <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
              NextEdge is developing patent pending telemetry reliability technology focused on
              structural health monitoring, signal fusion, anomaly detection, and operational
              confidence for critical infrastructure environments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="rounded-2xl px-6 py-6 text-base bg-teal-400 text-slate-950 hover:bg-teal-300">
                Request a Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={scrollToConcept}
                className="rounded-2xl px-6 py-6 text-base border-slate-600 text-white hover:bg-white hover:text-slate-950"
              >
                View the Concept
              </Button>
            </div>
          </motion.div>

          {/* TELEMETRY PANEL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-400">Telemetry Confidence</p>
                  <p className="text-4xl font-bold text-teal-300">98.6%</p>
                </div>
                <Gauge className="h-12 w-12 text-teal-300" aria-hidden="true" />
              </div>

              <div className="space-y-4">
                {TELEMETRY_ROWS.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between rounded-2xl bg-slate-900/70 border border-white/10 p-4"
                  >
                    <span className="text-slate-300">{label}</span>
                    <span className="text-teal-300 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONCEPT SECTION */}
      <section id="concept-section" className="relative px-6 py-24 md:px-12 lg:px-24 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.06),transparent_70%)]" />

        {/* Waveform divider */}
        <div className="max-w-7xl mx-auto mb-16">
          <DriftWaveform />
        </div>

        <div className="relative max-w-7xl mx-auto">

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mb-20"
          >
            <p className="text-teal-300 uppercase tracking-[0.3em] text-sm mb-6">
              Concept Architecture
            </p>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white">
              Critical failures rarely begin with catastrophic events.{" "}
              <span className="text-teal-300">They begin with unnoticed drift.</span>
            </h2>
          </motion.div>

          {/* Flow + Principles grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* System Flow */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-8">
                System Flow
              </p>
              <div className="space-y-0">
                {FLOW_STEPS.map((step, i) => (
                  <FlowStep
                    key={step.label}
                    step={step}
                    index={i}
                    isLast={i === FLOW_STEPS.length - 1}
                  />
                ))}
              </div>
            </motion.div>

            {/* Core Principles */}
            <div className="space-y-6">
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-8">
                Core Principles
              </p>
              {PRINCIPLES.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-teal-300" />
                      </div>
                      <h3 className="text-white font-semibold">{p.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{p.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom waveform */}
          <div className="mt-20">
            <DriftWaveform />
          </div>
        </div>
      </section>
    </main>
  );
}
