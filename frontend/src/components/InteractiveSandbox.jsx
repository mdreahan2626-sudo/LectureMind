import React, { useState, useEffect } from 'react';
import { 
  FileAudio, 
  FileText, 
  Video, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  BrainCircuit, 
  Layers, 
  MessageSquare, 
  HelpCircle, 
  FolderUp, 
  ChevronLeft, 
  ChevronRight,
  Lightbulb,
  BookOpen,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_LECTURES = {
  audio: {
    title: "Deep Learning Foundations (Lecture 4).mp3",
    type: "audio",
    size: "42.8 MB",
    duration: "54 mins",
    summary: "This lecture introduces the mathematical foundations of Deep Learning, contrasting traditional machine learning with hierarchical representation learning in multi-layer perceptrons. The instructor details forward propagation, loss calculation, backward propagation of error gradients via the chain rule, and non-linear activation functions (ReLU, Sigmoid, Tanh). Key discussion points include mitigating vanishing gradients and learning rate schedules.",
    keyTakeaways: [
      { term: "Deep Learning", desc: "A subset of machine learning using multi-layered artificial neural networks to learn representations from raw data." },
      { term: "Backpropagation", desc: "The algorithm that calculates partial derivatives of the loss function with respect to weights using the chain rule." },
      { term: "Activation Function", desc: "Introduces non-linearity, allowing deep networks to approximate complex mathematical decision boundaries." },
      { term: "Vanishing Gradients", desc: "A training issue where gradient signals shrink exponentially in early layers, stalling parameter updates." }
    ],
    flashcards: [
      { front: "What is ReLU and its mathematical formula?", back: "Rectified Linear Unit: f(x) = max(0, x). It returns 0 for negative values and passes positive values unchanged." },
      { front: "Why are non-linear activation functions necessary in multi-layer networks?", back: "Without non-linear activations, multiple linear layers collapse into a single matrix multiplication, unable to learn non-linear boundaries." },
      { front: "What role does an optimizer play during network training?", back: "It updates model weights and biases based on calculated gradients to minimize the objective loss function (e.g. Adam, SGD)." },
      { front: "What is overfitting and how can it be mitigated?", back: "When a model memorizes training noise instead of general patterns. Addressed via dropout, L1/L2 regularization, and early stopping." }
    ],
    mindmap: {
      label: "Deep Learning",
      children: [
        {
          label: "Architecture",
          children: ["Input Features", "Hidden Layers", "Output Neurons"]
        },
        {
          label: "Optimization",
          children: ["Loss Metric", "Chain Rule Gradients", "Adam Optimizer"]
        },
        {
          label: "Activations",
          children: ["ReLU Function", "Sigmoid Curve", "Softmax Layer"]
        }
      ]
    },
    suggestedQuestions: [
      "Why does ReLU prevent vanishing gradients?",
      "How does backpropagation calculate weights?",
      "What is the difference between ML and Deep Learning?"
    ]
  },
  document: {
    title: "Quantum Mechanics & Wave Equations.pdf",
    type: "document",
    size: "8.4 MB",
    duration: "45 pages",
    summary: "An introduction to non-relativistic Quantum Mechanics, reviewing the transition from classical physics. It covers wave-particle duality, Planck's constant, and the photoelectric effect. The core of the chapter examines the Schrödinger Wave Equation, probability density interpretations, quantum superposition, and Heisenberg's Uncertainty Principle.",
    keyTakeaways: [
      { term: "Wave-Particle Duality", desc: "The principle that quantum entities exhibit both wave-like and particle-like characteristics depending on observation." },
      { term: "Schrödinger Equation", desc: "The differential equation governing the spatial and temporal evolution of a quantum state wave function." },
      { term: "Quantum Superposition", desc: "The principle that a physical system exists as a linear combination of all valid states until measured." },
      { term: "Uncertainty Principle", desc: "Heisenberg's theorem stating position and momentum cannot both be measured with arbitrary precision simultaneously." }
    ],
    flashcards: [
      { front: "What does Planck's constant (h) link?", back: "It links photon frequency to energy: E = hf." },
      { front: "What does the squared wave function (|ψ|²) represent?", back: "Max Born's interpretation: the spatial probability density of locating a particle." },
      { front: "What is Quantum Tunneling?", back: "The phenomenon where a quantum particle penetrates a potential energy barrier higher than its kinetic energy." }
    ],
    mindmap: {
      label: "Quantum Mechanics",
      children: [
        {
          label: "Principles",
          children: ["Wave Duality", "Superposition", "Tunneling"]
        },
        {
          label: "Schrödinger Eq",
          children: ["Time-Dependent", "Wave Function (ψ)", "Probability Density"]
        },
        {
          label: "Uncertainty",
          children: ["Position & Momentum", "Planck Constant (h)", "Measurement Collapse"]
        }
      ]
    },
    suggestedQuestions: [
      "What does the wave function collapse mean?",
      "How does quantum tunneling occur?",
      "What is the Born interpretation of |ψ|²?"
    ]
  },
  video: {
    title: "Macroeconomic Policy & Indicators.mp4",
    type: "video",
    size: "184.2 MB",
    duration: "1 hr 15 mins",
    summary: "A university seminar examining national macroeconomic indicators and state intervention. Key topics include Gross Domestic Product (GDP), inflation measurements (Consumer Price Index), and labor statistics. The discussion contrasts fiscal policy managed by government expenditure with monetary policy executed by central banks via interest rates and reserve requirements.",
    keyTakeaways: [
      { term: "Macroeconomics", desc: "The study of aggregate economic performance, inflation rates, national output, and public fiscal structures." },
      { term: "Gross Domestic Product (GDP)", desc: "The total market value of all finished goods and services produced within a country's borders in a given time period." },
      { term: "Fiscal Policy", desc: "Government revenue collection (taxation) and expenditure (spending) used to influence aggregate demand." },
      { term: "Monetary Policy", desc: "Central bank management of the money supply and lending interest rates to maintain price stability." }
    ],
    flashcards: [
      { front: "What is the difference between real and nominal GDP?", back: "Nominal GDP is evaluated at current prices, while Real GDP is adjusted for price changes using a base-year deflator." },
      { front: "How does inflation affect currency purchasing power?", back: "Inflation erodes the purchasing power of money, requiring more currency units to acquire identical baskets of goods." },
      { front: "What are the primary tools of Monetary Policy?", back: "Open market operations, reserve ratio adjustments, and policy discount interest rates." }
    ],
    mindmap: {
      label: "Macroeconomics",
      children: [
        {
          label: "Indicators",
          children: ["Real/Nominal GDP", "Consumer Price Index", "Unemployment Rate"]
        },
        {
          label: "Policy Frameworks",
          children: ["Fiscal (Taxes/Spend)", "Monetary (Interest)", "Central Bank Actions"]
        },
        {
          label: "Market Forces",
          children: ["Aggregate Demand", "Inflation Pressures", "Business Cycles"]
        }
      ]
    },
    suggestedQuestions: [
      "How does real GDP differ from nominal GDP?",
      "What tools do central banks use for monetary policy?",
      "Why does inflation reduce purchasing power?"
    ]
  }
};

export default function InteractiveSandbox() {
  const [selectedType, setSelectedType] = useState('audio');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState({});

  // Chat simulator state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeLecture = SAMPLE_LECTURES[selectedType];

  const stages = [
    { label: "Transcribing audio & OCR parsing…", pct: 25 },
    { label: "Extracting concepts & terminology hierarchy…", pct: 55 },
    { label: "Building structured notes & flashcard deck…", pct: 85 },
    { label: "Ready", pct: 100 }
  ];

  const handleStartProcessing = () => {
    setIsProcessing(true);
    setProgress(0);
    setStageIndex(0);
    setIsDone(false);
    setActiveTab('summary');
    setMessages([
      { 
        sender: 'ai', 
        text: `I've finished processing "${activeLecture.title}". What concept would you like to review or explore further?`,
        citations: ["04:15", "18:42"]
      }
    ]);
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setMasteredCards({});
  };

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next < 30) setStageIndex(0);
        else if (next < 65) setStageIndex(1);
        else if (next < 95) setStageIndex(2);
        else setStageIndex(3);

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setIsDone(true);
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#8C7CF0', '#7FCBAE', '#F4CE6B']
            });
          }, 300);
          return 100;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const query = inputValue;
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Here is what the lecture covers regarding that: ";
      let citations = ["12:30"];
      const q = query.toLowerCase();

      if (q.includes('relu') || q.includes('activation')) {
        reply = "ReLU (Rectified Linear Unit) outputs max(0, x). By keeping the gradient at 1 for all positive inputs, it prevents gradient signals from vanishing across deep network layers.";
        citations = ["14:20", "22:15"];
      } else if (q.includes('backprop') || q.includes('gradient')) {
        reply = "Backpropagation calculates partial derivatives of the loss function with respect to every weight using the chain rule, moving sequentially backward from the output layer.";
        citations = ["08:45", "19:10"];
      } else if (q.includes('quantum') || q.includes('schrodinger') || q.includes('wave')) {
        reply = "The Schrödinger equation determines the evolution of a wave function (ψ). The square |ψ|² yields the probability density of locating the particle in a region.";
        citations = ["06:12", "31:40"];
      } else if (q.includes('gdp') || q.includes('fiscal') || q.includes('monetary')) {
        reply = "Fiscal policy involves government taxation and spending. Monetary policy is handled by central banks via interest rates and reserve requirements to regulate price inflation.";
        citations = ["10:15", "45:00"];
      } else {
        reply = `Based on your lecture notes, this concept is directly linked to the core principles outlined in the summary.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply, citations }]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <section id="sandbox" className="py-20 bg-bg-subtle/60 border-t border-border-subtle relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border-subtle text-xs font-semibold text-accent-primary mb-3 shadow-soft">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Workspace Sandbox
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary tracking-tight mb-3">
            See how LectureMind builds structured knowledge
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Select a sample lecture file to simulate transcription, concept extraction, spaced flashcard generation, and grounded Q&A.
          </p>
        </div>

        {/* Sandbox Console Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Input Selection Column (4 cols) */}
          <div className="lg:col-span-4 bg-surface border border-border-subtle rounded-md p-6 flex flex-col justify-between shadow-soft">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                  1. Choose Sample Source
                </span>
                <span className="text-[11px] text-text-muted">Sample data</span>
              </div>

              {/* Selector Buttons */}
              <div className="space-y-2.5">
                {[
                  { id: 'audio', title: 'Deep Learning.mp3', subtitle: 'Audio lecture · 54 mins', icon: FileAudio },
                  { id: 'document', title: 'Quantum Mechanics.pdf', subtitle: 'Textbook chapter · 45 pages', icon: FileText },
                  { id: 'video', title: 'Macroeconomics.mp4', subtitle: 'Seminar recording · 1h 15m', icon: Video },
                ].map((item) => {
                  const isSelected = selectedType === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedType(item.id); setIsDone(false); }}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-sm border text-left transition-all ${
                        isSelected
                          ? 'border-accent-primary bg-surface-tint shadow-soft text-text-primary font-medium'
                          : 'border-border-subtle bg-surface hover:bg-bg-subtle/50 text-text-secondary'
                      }`}
                    >
                      <div className={`p-2 rounded-sm ${isSelected ? 'bg-accent-primary/15 text-accent-primary' : 'bg-bg-subtle text-text-muted'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-text-primary block truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-text-secondary block">
                          {item.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* File Specs */}
              <div className="mt-5 p-3.5 rounded-sm bg-bg-subtle border border-border-subtle flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Format</span>
                  <span className="font-medium text-text-primary">{activeLecture.type.toUpperCase()}</span>
                </div>
                <div className="h-4 border-r border-border-subtle" />
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Size</span>
                  <span className="font-medium text-text-primary">{activeLecture.size}</span>
                </div>
                <div className="h-4 border-r border-border-subtle" />
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Pipeline</span>
                  <span className="font-medium text-accent-primary">Gemini 1.5 + RAG</span>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-6">
              <button
                onClick={handleStartProcessing}
                disabled={isProcessing}
                className="w-full py-3 rounded-sm text-xs font-semibold text-white bg-accent-primary hover:bg-accent-hover transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing {progress}%…</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Generate Structured Study Pack</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Output Workspace Screen (8 cols) */}
          <div className="lg:col-span-8 bg-surface border border-border-subtle rounded-md flex flex-col min-h-[460px] overflow-hidden shadow-soft">
            
            {/* INITIAL STATE */}
            {!isProcessing && !isDone && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-tint/30">
                <div className="w-14 h-14 rounded-md bg-bg-subtle border border-border-subtle flex items-center justify-center text-accent-primary mb-4 shadow-soft">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-text-primary mb-1">
                  Ready to process lecture
                </h4>
                <p className="text-xs text-text-secondary max-w-sm mb-5 leading-relaxed">
                  Click "Generate Structured Study Pack" on the left to observe how notes, concept maps, and SM-2 flashcards are generated.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border-subtle text-[11px] text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-[#6FBF9A]"></span>
                  FastAPI backend ready · RAG pipeline standby
                </div>
              </div>
            )}

            {/* PROCESSING STATE WITH SHIMMER PROGRESS */}
            {isProcessing && (
              <div className="flex-1 flex flex-col justify-between p-8 bg-surface">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Pipeline In Progress
                  </span>

                  {/* Stage Progress labels */}
                  <div className="space-y-3 pt-2">
                    {stages.map((stage, idx) => {
                      const isComplete = progress >= stage.pct;
                      const isCurrent = stageIndex === idx;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isComplete ? 'bg-success text-white' : isCurrent ? 'bg-accent-primary text-white animate-pulse' : 'bg-bg-subtle text-text-muted'
                          }`}>
                            {isComplete ? '✓' : idx + 1}
                          </div>
                          <span className={`text-xs ${isCurrent ? 'font-semibold text-text-primary' : isComplete ? 'text-text-secondary' : 'text-text-muted'}`}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slim progress bar */}
                <div className="space-y-2 pt-8">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Reading through your lecture…</span>
                    <span className="font-semibold text-text-primary tabular-nums">{progress}%</span>
                  </div>
                  <div className="w-full bg-bg-subtle h-2 rounded-full overflow-hidden border border-border-subtle">
                    <div 
                      className="bg-accent-primary h-full rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RESOLVED STATE */}
            {isDone && (
              <div className="flex-1 flex flex-col">
                {/* Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-border-subtle bg-bg-subtle/50 px-4 py-2">
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'summary', label: 'Structured Notes', icon: Layers },
                      { id: 'mindmap', label: 'Concept Map', icon: BrainCircuit },
                      { id: 'flashcards', label: 'Flashcards', icon: Lightbulb },
                      { id: 'chat', label: 'Ask AI', icon: MessageSquare },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-surface text-text-primary font-semibold shadow-soft'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-mint/20 text-[#2B7A5C]">
                    Grounded in lecture
                  </span>
                </div>

                {/* Tab Views */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[380px]">
                  
                  {/* TAB 1: SUMMARY / NOTES */}
                  {activeTab === 'summary' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div>
                        <h4 className="text-base font-bold text-text-primary mb-1">
                          {activeLecture.title}
                        </h4>
                        <span className="text-[11px] text-text-muted">Structured synopsis & key taxonomy</span>
                      </div>
                      
                      <p className="text-xs text-text-secondary leading-relaxed bg-surface-tint p-4 rounded-sm border border-border-subtle">
                        {activeLecture.summary}
                      </p>

                      <div>
                        <h5 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-2.5">
                          Extracted Key Concepts
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {activeLecture.keyTakeaways.map((item, idx) => (
                            <div key={idx} className="p-3 bg-surface rounded-sm border border-border-subtle shadow-soft">
                              <span className="text-xs font-bold text-text-primary block mb-0.5">{item.term}</span>
                              <p className="text-xs text-text-secondary leading-snug">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CONCEPT MAP */}
                  {activeTab === 'mindmap' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-text-primary">Interactive Concept Hierarchy</span>
                        <span className="text-text-muted">Hover nodes to inspect relationships</span>
                      </div>

                      <div className="bg-surface-tint border border-border-subtle rounded-sm p-4 overflow-hidden">
                        <svg className="w-full h-56" viewBox="0 0 540 220">
                          {/* Connection Lines */}
                          <line x1="270" y1="110" x2="110" y2="45" stroke="#DDD7E8" strokeWidth="1.5" />
                          <line x1="270" y1="110" x2="110" y2="110" stroke="#DDD7E8" strokeWidth="1.5" />
                          <line x1="270" y1="110" x2="110" y2="175" stroke="#DDD7E8" strokeWidth="1.5" />
                          
                          <line x1="110" y1="45" x2="25" y2="25" stroke="#E9E4F0" strokeWidth="1" />
                          <line x1="110" y1="45" x2="25" y2="65" stroke="#E9E4F0" strokeWidth="1" />
                          <line x1="110" y1="110" x2="25" y2="95" stroke="#E9E4F0" strokeWidth="1" />
                          <line x1="110" y1="110" x2="25" y2="130" stroke="#E9E4F0" strokeWidth="1" />
                          <line x1="110" y1="175" x2="25" y2="160" stroke="#E9E4F0" strokeWidth="1" />
                          <line x1="110" y1="175" x2="25" y2="195" stroke="#E9E4F0" strokeWidth="1" />

                          {/* Center Root Node */}
                          <rect x="200" y="90" width="140" height="40" rx="8" fill="#FFFFFF" stroke="#8C7CF0" strokeWidth="2" />
                          <text x="270" y="115" fill="#2A2730" fontSize="12" fontWeight="bold" textAnchor="middle">
                            {activeLecture.mindmap.label}
                          </text>

                          {/* Branch Nodes */}
                          {activeLecture.mindmap.children.map((child, idx) => {
                            const y = idx === 0 ? 45 : idx === 1 ? 110 : 175;
                            return (
                              <g key={idx}>
                                <rect x="50" y={y - 18} width="120" height="36" rx="6" fill="#FFFFFF" stroke="#D6CFE2" strokeWidth="1.5" />
                                <text x="110" y={y + 4} fill="#2A2730" fontSize="10" fontWeight="600" textAnchor="middle">
                                  {child.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: FLASHCARDS */}
                  {activeTab === 'flashcards' && (
                    <div className="flex flex-col items-center justify-between min-h-[280px] animate-in fade-in duration-200">
                      <div className="text-center mb-2">
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                          Card {currentCardIdx + 1} of {activeLecture.flashcards.length}
                        </span>
                      </div>

                      {/* 3D Flip Card */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="w-full max-w-md h-44 perspective-1000 cursor-pointer select-none"
                      >
                        <div className={`relative w-full h-full duration-300 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                          {/* Front */}
                          <div className="absolute inset-0 w-full h-full rounded-md border border-border-subtle bg-surface p-6 shadow-soft flex flex-col justify-between backface-hidden">
                            <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5" /> Question
                            </span>
                            <p className="text-sm font-semibold text-text-primary text-center px-4 leading-relaxed">
                              {activeLecture.flashcards[currentCardIdx].front}
                            </p>
                            <span className="text-[10px] text-text-muted text-center uppercase tracking-wider">
                              Click card to flip
                            </span>
                          </div>

                          {/* Back */}
                          <div className="absolute inset-0 w-full h-full rounded-md border border-accent-primary/40 bg-surface-tint p-6 shadow-soft flex flex-col justify-between backface-hidden rotate-y-180">
                            <span className="text-[10px] font-bold text-accent-mint uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Explanation
                            </span>
                            <p className="text-xs font-medium text-text-primary text-center px-4 leading-relaxed">
                              {activeLecture.flashcards[currentCardIdx].back}
                            </p>
                            <span className="text-[10px] text-text-muted text-center uppercase tracking-wider">
                              Click card to flip back
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between w-full max-w-md pt-4">
                        <button
                          onClick={() => {
                            if (currentCardIdx > 0) {
                              setCurrentCardIdx(c => c - 1);
                              setIsFlipped(false);
                            }
                          }}
                          disabled={currentCardIdx === 0}
                          className="p-2 rounded-sm border border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <span className="text-xs font-medium text-text-secondary">
                          Space to flip · Next review in 3 days
                        </span>

                        <button
                          onClick={() => {
                            if (currentCardIdx < activeLecture.flashcards.length - 1) {
                              setCurrentCardIdx(c => c + 1);
                              setIsFlipped(false);
                            }
                          }}
                          disabled={currentCardIdx === activeLecture.flashcards.length - 1}
                          className="p-2 rounded-sm border border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: TUTOR CHAT WITH CITATIONS */}
                  {activeTab === 'chat' && (
                    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
                      {/* Messages Thread */}
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        {messages.map((msg, idx) => (
                          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-md text-xs leading-relaxed max-w-[85%] ${
                              msg.sender === 'user'
                                ? 'bg-accent-primary text-white'
                                : 'bg-surface-tint border border-border-subtle text-text-primary'
                            }`}>
                              <p>{msg.text}</p>
                              {msg.citations && msg.citations.length > 0 && (
                                <div className="mt-2 pt-1.5 border-t border-border-subtle/60 flex items-center gap-1.5 text-[10px]">
                                  <span className="text-text-muted font-mono">Sources:</span>
                                  {msg.citations.map((c, cIdx) => (
                                    <span key={cIdx} className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle font-mono text-accent-primary font-semibold">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="text-xs text-text-muted italic flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 animate-spin text-accent-primary" />
                            <span>Tutor is formulating explanation…</span>
                          </div>
                        )}
                      </div>

                      {/* Suggested Questions */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeLecture.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setMessages(prev => [...prev, { sender: 'user', text: q }]);
                              setIsTyping(true);
                              setTimeout(() => {
                                setMessages(prev => [...prev, {
                                  sender: 'ai',
                                  text: `Regarding "${q}": The lecture emphasizes this as a core topic because it governs state transformations.`,
                                  citations: ["18:42"]
                                }]);
                                setIsTyping(false);
                              }, 800);
                            }}
                            className="px-2.5 py-1 rounded-full bg-bg-subtle hover:bg-border-subtle text-[11px] text-text-secondary transition-colors text-left"
                          >
                            "{q}"
                          </button>
                        ))}
                      </div>

                      {/* Chat Input Bar */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask a question grounded in this lecture…"
                          className="flex-1 px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-accent-primary text-white text-xs font-semibold rounded-sm hover:bg-accent-hover transition-colors"
                        >
                          Ask
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
