import React from 'react';
import { Layers } from 'lucide-react';

const layers = [
  {
    tag: "[client_interface]",
    ink: "violet",
    title: "React 19 & Tailwind CSS",
    desc: "A responsive living workspace crafted with Fraunces serif and Inter typography. Accessible WCAG AA color tokens, high-contrast focus rings, and tactile paper interactions.",
    details: ["Fraunces & Inter typography", "Living Notebook aesthetic", "Framer Motion transitions"]
  },
  {
    tag: "[gateway_routing]",
    ink: "coral",
    title: "Express API Gateway",
    desc: "An intelligent routing node running on Port 5001. Proxies client requests to target microservices while verifying JWT session tokens and rate limits.",
    details: ["Native HTTP forwarding", "Header normalization", "Unified CORS boundary"]
  },
  {
    tag: "[microservice_mesh]",
    ink: "teal",
    title: "Microservice Service Mesh",
    desc: "Splits monolithic requirements into single-purpose servers (Auth on 5011, Stats on 5012, Folders on 5013, Cards on 5014) connected to persistent SQLite and Prisma.",
    details: ["Prisma ORM", "SQLite persistent storage", "SM-2 repetition engine"]
  },
  {
    tag: "[cognitive_graph]",
    ink: "gold",
    title: "LangGraph StateGraph & Gemini Core",
    desc: "A sequential execution graph pipeline orchestrating lecture ingestion, hierarchical chunking, vector embedding, and structured concept graph extraction.",
    details: ["Google Gemini 1.5 Core", "RAG vector retrieval", "Strict schema validation"]
  }
];

export default function TechStack() {
  return (
    <section id="tech" className="py-24 border-t border-rule bg-paper-deep/60 relative z-10">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-rule text-violet text-xs font-semibold mb-3 shadow-soft">
            <Layers className="w-3.5 h-3.5" />
            System Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-charcoal tracking-tight mb-3">
            Engineered for reliability & speed
          </h2>
          <p className="text-base text-charcoal-soft leading-relaxed">
            LectureMind runs on a federated microservice architecture, separating database sync, static endpoints, and cognitive graph generation across independent Express and FastAPI services.
          </p>
        </div>

        {/* Stack Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {layers.map((layer, idx) => (
            <div 
              key={idx}
              className={`bg-card border border-card-border rounded-md p-6 shadow-soft hover:shadow-hover transition-all flex flex-col justify-between ${
                layer.ink === 'violet' ? 'metric-stripe-violet' :
                layer.ink === 'coral' ? 'metric-stripe-coral' :
                layer.ink === 'teal' ? 'metric-stripe-teal' : 'metric-stripe-gold'
              }`}
            >
              <div>
                <span className={`font-mono text-xs block mb-2 font-bold ${
                  layer.ink === 'violet' ? 'text-violet' :
                  layer.ink === 'coral' ? 'text-coral' :
                  layer.ink === 'teal' ? 'text-teal' : 'text-[#9A7412]'
                }`}>
                  {layer.tag}
                </span>
                <h3 className="text-lg font-bold font-display text-charcoal mb-2">
                  {layer.title}
                </h3>
                <p className="text-xs text-charcoal-soft leading-relaxed mb-6">
                  {layer.desc}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-rule">
                {layer.details.map((detail, dIdx) => (
                  <span 
                    key={dIdx}
                    className="font-mono text-[10px] px-2.5 py-1 rounded-sm bg-paper-deep border border-rule text-charcoal-soft font-medium"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
