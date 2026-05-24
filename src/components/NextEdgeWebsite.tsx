import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Gauge } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const logoSrc = "/nextedge-logo.png";

const TELEMETRY_ROWS: [string, string][] = [
  ["Environmental noise", "Filtered"],
  ["Signal drift", "Detected"],
  ["Operator confidence", "Improving"],
  ["Infrastructure status", "Monitored"],
];

export default function NextEdgeWebsite() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
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
                className="rounded-2xl px-6 py-6 text-base border-slate-600 text-white hover:bg-white hover:text-slate-950"
              >
                View the Concept
              </Button>
            </div>
          </motion.div>

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
    </main>
  );
}
