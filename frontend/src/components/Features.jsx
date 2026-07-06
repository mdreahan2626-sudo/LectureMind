import React from 'react';
import { 
  FileAudio, 
  BrainCircuit, 
  Layers, 
  Sparkles, 
  GitFork, 
  MessageSquare,
  ArrowUpRight 
} from 'lucide-react';

const features = [
  {
    icon: FileAudio,
    title: "Multimodal Processing",
    description: "Upload lectures in any format. We ingest audio recordings, seminar videos, PDF handouts, or slideshows with ease.",
    color: "from-blue-500 to-indigo-500",
    badge: "Audio / Video / Docs"
  },
  {
    icon: BrainCircuit,
    title: "Gemini AI Core",
    description: "Leverages Gemini 1.5 Flash & Pro for rich context understanding, rapid key-term extraction, and structured output parsing.",
    color: "from-indigo-500 to-purple-500",
    badge: "1M+ Context Window"
  },
  {
    icon: Layers,
    title: "Instant Summarization",
    description: "Condense long-winded 2-hour lectures into structured, bulleted summaries, action items, and clear definitions in 15 seconds.",
    color: "from-cyan-500 to-blue-500",
    badge: "Time Saved: 85%"
  },
  {
    icon: Sparkles,
    title: "Flippable Flashcards",
    description: "Automatically generate interactive flashcards from lecture material. Memorize faster with active recall and spaced repetition mechanics.",
    color: "from-blue-500 to-cyan-500",
    badge: "Active Recall"
  },
  {
    icon: GitFork,
    title: "Visual Mind Mapping",
    description: "Transform complex topics into visual, interactive knowledge graphs. View connections, hierarchies, and topic relationships clearly.",
    color: "from-cyan-500 to-emerald-500",
    badge: "SVG Interactivity"
  },
  {
    icon: MessageSquare,
    title: "AI Study Assistant",
    description: "Ask your uploaded lectures anything. Quiz yourself, clarify tricky concepts, or ask for real-world examples with your personal AI tutor.",
    color: "from-indigo-500 to-cyan-500",
    badge: "Interactive Quiz"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-glow opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/40 text-blue-400 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Core Capabilities
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-5">
            Turn Raw Lectures Into <br className="hidden sm:inline" />
            <span className="text-gradient-blue">Active Learning Assets</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Stop wasting hours transcribing notes. Our specialized AI parsing pipeline does the heavy lifting, delivering complete study materials in seconds.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="group relative glass-panel rounded-2xl p-6.5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/20 hover:-translate-y-1"
              >
                {/* Glowing border hover helper */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600/0 to-cyan-500/0 group-hover:from-blue-600/5 group-hover:to-cyan-500/5 transition-all duration-500 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6">
                  {/* Icon Block */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-blue-400/90 bg-blue-950/50 border border-blue-900/30 px-2.5 py-0.5 rounded-full">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors flex items-center gap-1">
                  {feature.title}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                </h3>
                
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
