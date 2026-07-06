import React from 'react';
import { Database, Server, Cpu, Layers, Code2, Globe } from 'lucide-react';

const layers = [
  {
    icon: Globe,
    title: "Client Layer",
    tech: "React 19 & Vite",
    desc: "Single-page responsive application with Tailwind CSS, Lucide react-icons, and Framer Motion micro-interactions.",
    details: ["Fast load times", "Responsive grid layout", "WebSockets for live log streaming"]
  },
  {
    icon: Code2,
    title: "App Middleware Server",
    tech: "Node.js & Express",
    desc: "Responsible for routing, security, user accounts, JWT authentication, and syncing meta-data states.",
    details: ["CORS security layers", "Route authentication", "Caching layer"]
  },
  {
    icon: Database,
    title: "Database Store",
    tech: "MongoDB & Mongoose",
    desc: "Handles persistent document storage, user data structures, flashcard decks, and revision records.",
    details: ["Document schemas", "BSON indexes for speed", "Cloud clustering"]
  },
  {
    icon: Server,
    title: "AI Pipeline Microservice",
    tech: "FastAPI & Python",
    desc: "Handles processor-intensive workloads: PDF extraction, media file parsing, and formatting API prompts.",
    details: ["Async task workers", "Python multipart parsing", "Whisper Speech-to-Text wrapper"]
  },
  {
    icon: Cpu,
    title: "Cognitive Intelligence Core",
    tech: "Google Gemini 1.5 Flash API",
    desc: "Generates high-speed summaries, card data schemas, mind map hierarchies, and interactive quiz sessions.",
    details: ["1M+ token context size", "Structured JSON mode outputs", "Speed-optimized latency"]
  }
];

export default function TechStack() {
  return (
    <section id="tech" className="py-24 border-t border-slate-900 bg-slate-950/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/40 text-indigo-400 text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5" />
            System Architecture
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-5">
            Full-Stack <span className="text-gradient-blue">MERN + FastAPI + Gemini</span>
          </h2>
          <p className="text-lg text-slate-400">
            A modular architecture designed for high performance, splitting heavy AI processing from web state and storage.
          </p>
        </div>

        {/* Stack Flow Visualizer */}
        <div className="relative">
          {/* Connecting Vertical Line (Desktop only) */}
          <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-cyan-500 hidden lg:block opacity-30"></div>

          <div className="space-y-12">
            {layers.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div 
                  key={idx}
                  className="relative flex flex-col lg:flex-row gap-6 lg:gap-12 items-start group"
                >
                  {/* Step Connector Icon */}
                  <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-blue-900/30 group-hover:border-cyan-500/40 shadow-lg transition-all duration-300">
                    <Icon className="w-9 h-9 text-blue-400 group-hover:text-cyan-400 transition-colors" />
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-[2px]"></div>
                  </div>

                  {/* Details Card */}
                  <div className="flex-1 glass-panel rounded-2xl p-6.5 hover:border-indigo-500/20 transition-all duration-300 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-0.5">
                          Layer 0{idx + 1} &bull; {layer.title}
                        </span>
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                          {layer.tech}
                        </h3>
                      </div>
                      <span className="inline-flex px-3 py-1 rounded-lg bg-blue-950/40 border border-blue-900/30 text-xs font-semibold text-cyan-400 self-start">
                        Production Stack
                      </span>
                    </div>

                    <p className="text-slate-400 mb-5 text-sm leading-relaxed max-w-4xl">
                      {layer.desc}
                    </p>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-2.5">
                      {layer.details.map((detail, dIdx) => (
                        <span 
                          key={dIdx}
                          className="text-xs px-3 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 font-medium"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
