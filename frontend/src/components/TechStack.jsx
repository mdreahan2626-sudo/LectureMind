import React from 'react';
import { Database, Server, Cpu, Layers, Code2, Globe } from 'lucide-react';

const layers = [
  {
    tag: "[client_interface]",
    title: "React & Tailwind CSS",
    desc: "A responsive, single-page application crafted with Outfit and Space Grotesk typography. Zero heavy animation frameworks, utilizing optimized CSS layouts and accessible focus indicators.",
    details: ["Space Grotesk typography", "Responsive design", "A11y focus outlines"]
  },
  {
    tag: "[gateway_routing]",
    title: "Express API Gateway",
    desc: "An intelligent routing node running on Port 5001. Proxies incoming client requests to target microservices while verifying token integrity.",
    details: ["Native HTTP forwarding", "Header normalization", "Single CORS boundary"]
  },
  {
    tag: "[microservice_mesh]",
    title: "Express Service Mesh",
    desc: "Splits monolithic requirements into single-purpose servers (Auth on 5011, Stats on 5012, Folders on 5013, Cards on 5014) connected to Supabase PostgreSQL.",
    details: ["Prisma integration", "Shared connection pooling", "Isolated memory spaces"]
  },
  {
    tag: "[cognitive_graph]",
    title: "LangGraph StateGraph Engine",
    desc: "A custom Node.js execution graph running on Port 5015. Dictates a sequential pipeline of Intake, Summarization, Flashcard Generation, and Mindmap structuring.",
    details: ["Gemini 1.5 Flash Core", "Strict JSON schema parsing", "Linear node state-flow"]
  }
];

export default function TechStack() {
  return (
    <section id="tech" className="py-32 border-t border-studio-border bg-[#05070F] relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-studio-surface border border-studio-border text-studio-purple text-xs font-mono mb-4">
            <Layers className="w-3.5 h-3.5" />
            ENGINE ARCHITECTURE
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold font-space tracking-tight text-studio-textLight mb-5">
            The Microservice Grid
          </h2>
          <p className="text-lg text-studio-slate leading-relaxed">
            LectureMind runs on a federated microservice architecture, splitting database sync, static endpoints, and cognitive graph generation across independent Express systems.
          </p>
        </div>

        {/* Stack Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {layers.map((layer, idx) => {
            return (
              <div 
                key={idx}
                className="bg-studio-surface border border-studio-border rounded-3xl p-8 transition-all hover:border-studio-purple/35 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-studio-purple block mb-4">
                    {layer.tag}
                  </span>
                  <h3 className="text-2xl font-bold font-space text-studio-textLight mb-3">
                    {layer.title}
                  </h3>
                  <p className="text-studio-slate text-sm leading-relaxed mb-6">
                    {layer.desc}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-studio-border/60">
                  {layer.details.map((detail, dIdx) => (
                    <span 
                      key={dIdx}
                      className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-studio-bg border border-studio-border text-studio-slate font-medium"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
