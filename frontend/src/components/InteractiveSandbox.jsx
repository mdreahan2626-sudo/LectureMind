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
  Flame,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_LECTURES = {
  audio: {
    title: "Deep Learning Foundations (Lec 4).mp3",
    type: "audio",
    size: "42.8 MB",
    duration: "54 mins",
    summary: "This lecture lays the foundations of Deep Learning. It covers artificial neural networks (ANNs), focusing on how multi-layer perceptrons learn hierarchical representations of data. The instructor explains structural elements (input layers, hidden representation layers, output layers), backward propagation of error gradients, and the activation math behind ReLU, Sigmoid, and Tanh. Key highlights include mitigating vanishing gradients using modern optimizers (Adam) and setting appropriate learning rates.",
    keyTakeaways: [
      { term: "Deep Learning", desc: "A subset of machine learning based on artificial neural networks with representation learning." },
      { term: "Backpropagation", desc: "The algorithm used to calculate the gradient of the loss function with respect to the network weights." },
      { term: "Activation Function", desc: "Introduces non-linearity to the network, enabling it to solve complex, non-linear classification problems." },
      { term: "Vanishing Gradients", desc: "A scenario where gradients become extremely small during backprop, halting network parameter updates." }
    ],
    flashcards: [
      { front: "What does ReLU stand for and what is its equation?", back: "Rectified Linear Unit. Equation: f(x) = max(0, x). It returns 0 for negative values and the value itself for positive ones." },
      { front: "Why do we add non-linearity to neural network nodes?", back: "Without non-linear activations, multiple dense layers collapse into a single linear transformation, preventing the network from learning complex features." },
      { front: "Explain the role of the Optimizer in Deep Learning.", back: "It updates the weights and biases based on the computed gradients to minimize the loss function. Popular methods include Adam, RMSprop, and SGD." },
      { front: "What is overfitting and how is it addressed?", back: "When a model learns training data noise too well, failing on unseen data. Solved via regularization (L1/L2), Dropout, or Early Stopping." }
    ],
    mindmap: {
      label: "Deep Learning",
      children: [
        {
          label: "Core Architecture",
          children: ["Input Features", "Hidden Neurons", "Output Classification"]
        },
        {
          label: "Optimization",
          children: ["Loss Minimization", "Backprop Math", "Adam / SGD Weights"]
        },
        {
          label: "Activations",
          children: ["ReLU (Linear)", "Sigmoid (Logistic)", "Softmax (Probability)"]
        }
      ]
    },
    quiz: [
      {
        question: "Which activation function helps prevent vanishing gradients during deep backpropagation?",
        options: ["Sigmoid", "ReLU", "Step function", "Linear"],
        answer: 1,
        explanation: "ReLU outputs a gradient of 1 for all inputs > 0, keeping gradient flow healthy compared to Sigmoid which saturates near 0 and 1."
      },
      {
        question: "What does the learning rate hyperparameter control?",
        options: ["The speed of forward propagation", "The depth of the hidden layers", "The step size taken towards loss minimization", "The rate of file uploads"],
        answer: 2,
        explanation: "The learning rate dictates how large a step the optimizer takes during weight updates. Too large causes divergence; too small slows convergence."
      }
    ],
    faqs: [
      { q: "Is Deep Learning different from Machine Learning?", a: "Yes, DL is a subfield of ML. Traditional ML requires manual feature engineering, whereas DL models learn feature representations automatically from raw data." },
      { q: "What is backpropagation?", a: "It is shorthand for 'backward propagation of errors', where gradients are calculated via the chain rule starting from the loss function back to initial inputs." }
    ]
  },
  document: {
    title: "Quantum Mechanics & Wave Equations.pdf",
    type: "document",
    size: "8.4 MB",
    duration: "45 pages",
    summary: "This text provides an introduction to Quantum Mechanics, focusing on the historical transition from classical physics to quantum theory. It introduces wave-particle duality, Planck's constant, and the photo-electric effect. The core of the reading centers around the Schrödinger Wave Equation (both time-dependent and time-independent) which describes the probability wave function of a particle. It explains quantum superposition, state collapses, tunneling, and Heisenberg's Uncertainty Principle.",
    keyTakeaways: [
      { term: "Wave-Particle Duality", desc: "The concept that every particle or quantum entity may be described as either a particle or a wave." },
      { term: "Schrödinger Equation", desc: "A mathematical equation that describes the changes over time of a physical quantum state." },
      { term: "Quantum Superposition", desc: "The capability of a quantum system to be in multiple states at the same time until it is measured." },
      { term: "Uncertainty Principle", desc: "Heisenberg's law stating that it is impossible to simultaneously measure a particle's position and momentum with absolute precision." }
    ],
    flashcards: [
      { front: "What does Planck's constant (h) represent?", back: "The quantum of electromagnetic action, linking the energy of a photon to its frequency: E = hf." },
      { front: "What is the physical meaning of the wave function squared (|\u03c8|\u00b2)?", back: "It represents the probability density of finding a particle at a specific location in space and time." },
      { front: "Explain Quantum Tunneling.", back: "A quantum phenomenon where a particle passes through a potential energy barrier that it classically shouldn't be able to cross." }
    ],
    mindmap: {
      label: "Quantum Mechanics",
      children: [
        {
          label: "Core Principles",
          children: ["Wave Duality", "Superposition State", "Tunneling Effect"]
        },
        {
          label: "Schrödinger Eq",
          children: ["Time-Dependent", "Wave Function (\u03c8)", "Probability Density"]
        },
        {
          label: "Uncertainty Limit",
          children: ["Position & Momentum", "Planck Constant (h)", "Measurement Collapse"]
        }
      ]
    },
    quiz: [
      {
        question: "What does the squared wave function (|\u03c8|\u00b2) describe?",
        options: ["Particle velocity", "Total kinetic energy", "Probability density of position", "Tunneling frequency"],
        answer: 2,
        explanation: "Max Born proposed that the square magnitude of the wave function represents the spatial probability density of locating the particle."
      }
    ],
    faqs: [
      { q: "What is superposition?", a: "Superposition means a particle exists in all possible configurations simultaneously. Only upon measurement does the wave function collapse into a single eigenvalue." }
    ]
  },
  video: {
    title: "Intro to Macroeconomics (Stanford Seminar).mp4",
    type: "video",
    size: "184.2 MB",
    duration: "1 hr 15 mins",
    summary: "A comprehensive seminar covering Macroeconomic theory. It highlights the difference between microeconomics (individual agent decisions) and macroeconomics (national aggregate indicators). Key metrics explored include Gross Domestic Product (GDP), inflation measurements (Consumer Price Index), and unemployment rates. The lecture explains fiscal policies managed by government taxation/spending and monetary policies controlled by central banks through interest rates, discount rates, and money supply regulations.",
    keyTakeaways: [
      { term: "Macroeconomics", desc: "The branch of economics dealing with the performance, structure, behavior, and decision-making of an economy as a whole." },
      { term: "Gross Domestic Product (GDP)", desc: "The total monetary value of all finished goods and services produced within a country's borders in a specific time period." },
      { term: "Fiscal Policy", desc: "The use of government revenue collection (taxation) and expenditure (spending) to influence the country's economy." },
      { term: "Monetary Policy", desc: "The process by which a nation's central bank controls the money supply and interest rates to achieve economic stability." }
    ],
    flashcards: [
      { front: "What is the difference between real and nominal GDP?", back: "Nominal GDP is valued at current market prices, whereas Real GDP is adjusted for inflation using a base year's prices." },
      { front: "How does inflation impact purchasing power?", back: "Inflation reduces the value of money, meaning each unit of currency buys a smaller percentage of goods and services." },
      { front: "What are the primary tools of Monetary Policy?", back: "Open market operations, adjusting reserve requirements, and changing the federal funds discount rate." }
    ],
    mindmap: {
      label: "Macroeconomics",
      children: [
        {
          label: "Economic Indicators",
          children: ["Real/Nominal GDP", "Consumer Price Index", "Unemployment Rate"]
        },
        {
          label: "Policy Frameworks",
          children: ["Fiscal (Taxes/Spend)", "Monetary (Interest)", "Central Bank Actions"]
        },
        {
          label: "Market Dynamics",
          children: ["Aggregate Demand", "Inflation Forces", "Economic Cycles"]
        }
      ]
    },
    quiz: [
      {
        question: "Who controls monetary policy in the United States?",
        options: ["The US Congress", "The Federal Reserve (Central Bank)", "The Department of the Treasury", "Commercial Banks"],
        answer: 1,
        explanation: "The Federal Reserve acts as the central bank of the US and is tasked with managing monetary policy to promote maximum employment and stable prices."
      }
    ],
    faqs: [
      { q: "What is GDP?", a: "GDP stands for Gross Domestic Product. It represents the total dollar value of all finished goods and services produced within a country over a specific time, usually measured quarterly or annually." }
    ]
  }
};

export default function InteractiveSandbox() {
  const [selectedType, setSelectedType] = useState('audio'); // 'audio', 'document', 'video'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'flashcards', 'mindmap', 'chat'

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState({}); // { cardIdx: true/false }

  // Chat simulator state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Quiz state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({}); // { questionIdx: optionIdx }
  const [showQuizResults, setShowQuizResults] = useState(false);

  const activeLecture = SAMPLE_LECTURES[selectedType];

  // Logs to show during AI simulation
  const processingSteps = [
    { pct: 10, text: "Ingesting raw media streams and optimizing compression..." },
    { pct: 30, text: "Running speech-to-text algorithm and parsing transcript tags..." },
    { pct: 50, text: "Formatting prompt contexts and querying Google Gemini 1.5 Flash API..." },
    { pct: 70, text: "Extracting core entities, relationships, and key takeaways..." },
    { pct: 85, text: "Generating structured flashcard decks and mind map connection nodes..." },
    { pct: 95, text: "Validating output schema and writing assets to Express DB cache..." },
    { pct: 100, text: "Compilation complete! Your study pack is ready." }
  ];

  const handleProcess = () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep(0);
    setIsDone(false);
    setActiveTab('summary');
    setMessages([
      { sender: 'ai', text: `Hi! I'm your AI Study Assistant. I've finished parsing "${activeLecture.title}". Feel free to ask me anything about the content or select a suggested question below!` }
    ]);
    setSelectedQuizAnswers({});
    setShowQuizResults(false);
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setMasteredCards({});
  };

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        
        // Find which step text to show based on percent
        const matchingStep = processingSteps.findIndex((step, idx) => {
          const prevStep = idx > 0 ? processingSteps[idx - 1].pct : 0;
          return next >= prevStep && next <= step.pct;
        });
        if (matchingStep !== -1) {
          setCurrentStep(matchingStep);
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setIsDone(true);
            triggerConfetti();
          }, 300);
          return 100;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isProcessing, selectedType]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#06b6d4', '#6366f1', '#10b981']
    });
  };

  // Chat message submit handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response based on questions or fallbacks
    setTimeout(() => {
      let reply = "That is a great question! Based on this lecture, that topic is essential to understand, but let me check the core summary context for details. Is there anything specific from the flashcards you'd like me to explain?";
      
      const query = inputValue.toLowerCase();
      // Simple keyword matching for demo
      if (query.includes('relu') || query.includes('activation')) {
        reply = "In the lecture, ReLU (Rectified Linear Unit) is highlighted as the preferred activation function for hidden layers. It outputs the input directly if positive, and zero otherwise: f(x) = max(0, x). This helps solve the vanishing gradient issue!";
      } else if (query.includes('backprop') || query.includes('gradient')) {
        reply = "Backpropagation is the mechanism used to optimize weights by moving backwards through neural layers and calculating gradients of the loss function using the chain rule.";
      } else if (query.includes('quantum') || query.includes('schrodinger') || query.includes('schrödinger')) {
        reply = "The Schrödinger Wave Equation is the quantum equivalent of Newton's laws. It calculates the wave function (\u03c8) which provides the probability density of a particle's physical state.";
      } else if (query.includes('monetary') || query.includes('fiscal')) {
        reply = "Monetary policy is controlled by the central bank (e.g. Federal Reserve) using interest rates and discount factors. Fiscal policy is controlled by government tax collections and spending allocations.";
      } else if (query.includes('gdp')) {
        reply = "GDP represents the total monetary value of all final goods produced in a nation. Nominal GDP uses current prices, while Real GDP adjusts for inflation using a base year.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSuggestedQuestion = (question) => {
    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    setIsTyping(true);
    setTimeout(() => {
      let reply = "";
      if (question.includes('Activation Function') || question.includes('activation')) {
        reply = "Activation functions introduce non-linear relationships to artificial neurons. Without them, even a 100-layer neural network behaves like a single linear model, meaning it couldn't learn complex boundaries like curves or circles.";
      } else if (question.includes('Superposition') || question.includes('superposition')) {
        reply = "Quantum Superposition states that a system exists in all possible configurations simultaneously. Think of a spinning coin: while spinning, it is in a combination of heads and tails. Only when stopped (measured) does it collapse into a single state.";
      } else if (question.includes('Fiscal') || question.includes('fiscal')) {
        reply = "Fiscal policy is government spending and tax regulations. For example, during a recession, a government might increase infrastructure spending or cut taxes to boost aggregate demand.";
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuizAnswer = (qIdx, optIdx) => {
    setSelectedQuizAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  return (
    <section id="sandbox" className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-4">
            Interactive <span className="text-gradient-blue">Product Sandbox</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Experience the processing power of our FastAPI and Gemini AI pipeline. Choose a sample lecture material below and generate your structured study pack.
          </p>
        </div>

        {/* Console Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Config Panel (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col justify-between glass-panel rounded-2xl p-6 gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <FolderUp className="w-5 h-5 text-blue-400" />
                Upload Simulator
              </h3>
              <p className="text-slate-400 text-xs mb-5">
                Select a sample file format to simulate processing.
              </p>

              {/* Selector Tabs */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setSelectedType('audio'); setIsDone(false); }}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                    selectedType === 'audio' 
                      ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-md shadow-blue-500/5' 
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700/80 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedType === 'audio' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Audio Recording</span>
                    <span className="text-sm font-semibold truncate block max-w-[200px]">Deep Learning.mp3</span>
                  </div>
                </button>

                <button 
                  onClick={() => { setSelectedType('document'); setIsDone(false); }}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                    selectedType === 'document' 
                      ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-md shadow-blue-500/5' 
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700/80 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedType === 'document' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">PDF Textbook</span>
                    <span className="text-sm font-semibold truncate block max-w-[200px]">Quantum Mechanics.pdf</span>
                  </div>
                </button>

                <button 
                  onClick={() => { setSelectedType('video'); setIsDone(false); }}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                    selectedType === 'video' 
                      ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-md shadow-blue-500/5' 
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700/80 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedType === 'video' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">YouTube Link</span>
                    <span className="text-sm font-semibold truncate block max-w-[200px]">Stanford Economics.mp4</span>
                  </div>
                </button>
              </div>

              {/* File Info */}
              <div className="mt-6 p-4 rounded-xl bg-slate-900/30 border border-slate-900 flex justify-between text-xs text-slate-400">
                <div>
                  <span className="block text-slate-600 uppercase tracking-wide font-semibold mb-0.5">Size</span>
                  <span className="font-semibold text-slate-300">{activeLecture.size}</span>
                </div>
                <div className="border-l border-slate-900 h-6 my-auto"></div>
                <div>
                  <span className="block text-slate-600 uppercase tracking-wide font-semibold mb-0.5">Duration</span>
                  <span className="font-semibold text-slate-300">{activeLecture.duration}</span>
                </div>
                <div className="border-l border-slate-900 h-6 my-auto"></div>
                <div>
                  <span className="block text-slate-600 uppercase tracking-wide font-semibold mb-0.5">Core Engine</span>
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    Gemini 1.5
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="mt-8">
              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full relative group px-6 py-4.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="flex items-center justify-center gap-2">
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Analyzing Pipeline... {progress}%
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Generate Study Assets
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <span className="absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }}></span>
              </button>
            </div>
          </div>

          {/* RIGHT: Output Sandbox (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col glass-panel rounded-2xl min-h-[500px] overflow-hidden relative border-blue-900/20">
            
            {/* INITIAL STATE: Ready to click */}
            {!isProcessing && !isDone && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-3xl bg-blue-950/50 border border-blue-800/20 flex items-center justify-center text-blue-400 mb-6 relative animate-pulse-slow">
                  <BrainCircuit className="w-10 h-10" />
                  <div className="absolute inset-0 rounded-3xl border border-cyan-500/20 scale-110"></div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  System Awaiting Input
                </h4>
                <p className="text-slate-400 text-sm max-w-md mb-6">
                  Select your lecture file on the left and click "Generate Study Assets" to simulate the transcription, categorization, and structuring pipeline.
                </p>
                <div className="flex gap-4">
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    FastAPI Endpoint Ready
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                    Gemini Connection Stable
                  </span>
                </div>
              </div>
            )}

            {/* PROCESSING STATE: Show active processing bars and logs */}
            {isProcessing && (
              <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950/80">
                <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
                  <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Processing Logs</span>
                  <span className="text-xs font-mono text-cyan-400">STATUS: ACTIVE_PIPELINE</span>
                </div>

                {/* Simulated Log Feed */}
                <div className="flex-1 font-mono text-xs sm:text-sm text-slate-300 space-y-2 mb-6 overflow-y-auto max-h-[300px]">
                  {processingSteps.map((step, idx) => {
                    const shown = progress >= (idx > 0 ? processingSteps[idx - 1].pct : 0);
                    const completed = progress >= step.pct;
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-3 transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <span className={completed ? 'text-emerald-400' : 'text-cyan-400'}>
                          {completed ? '✓' : '▶'}
                        </span>
                        <span className="text-slate-500">[{step.pct}%]</span>
                        <span className={completed ? 'text-slate-200' : 'text-slate-400'}>
                          {step.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold uppercase">Transcribing & Indexing Context</span>
                    <span className="text-cyan-400 font-bold font-mono">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* RESOLVED STATE: Full Dashboard output */}
            {isDone && (
              <div className="flex-1 flex flex-col">
                {/* Dashboard Tabs Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-blue-950/40 bg-slate-900/20 px-4 py-2 gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button 
                      onClick={() => setActiveTab('summary')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        activeTab === 'summary' 
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/40' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      Summary
                    </button>
                    <button 
                      onClick={() => setActiveTab('flashcards')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        activeTab === 'flashcards' 
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/40' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      Flashcards
                    </button>
                    <button 
                      onClick={() => setActiveTab('mindmap')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        activeTab === 'mindmap' 
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/40' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <BrainCircuit className="w-4 h-4" />
                      Mind Map
                    </button>
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        activeTab === 'chat' 
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/40' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Tutor Chat
                    </button>
                  </div>
                  
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 font-semibold">
                    100% Synced
                  </span>
                </div>

                {/* Dashboard Tab Content */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[440px]">
                  
                  {/* TAB 1: SUMMARY */}
                  {activeTab === 'summary' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{activeLecture.title}</h4>
                        <span className="text-xs text-slate-500 uppercase tracking-widest">AI Generated Summary</span>
                      </div>
                      
                      <p className="text-slate-300 text-sm leading-relaxed bg-blue-950/10 border border-blue-900/10 p-4.5 rounded-xl">
                        {activeLecture.summary}
                      </p>

                      <div>
                        <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          Key Terminology & Definitions
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeLecture.keyTakeaways.map((takeaway, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-900/80">
                              <span className="text-sm font-bold text-blue-300 block mb-1">{takeaway.term}</span>
                              <p className="text-xs text-slate-400 leading-relaxed">{takeaway.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: FLASHCARDS */}
                  {activeTab === 'flashcards' && (
                    <div className="flex flex-col items-center justify-between min-h-[320px] animate-in fade-in duration-300">
                      <div className="text-center">
                        <span className="text-xs text-slate-500 font-semibold tracking-wider block mb-1">
                          CARD {currentCardIdx + 1} OF {activeLecture.flashcards.length}
                        </span>
                        <p className="text-xs text-slate-400">Click card to flip. Test your knowledge.</p>
                      </div>

                      {/* 3D Flashcard Container */}
                      <div 
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="w-full max-w-lg h-52 perspective-1000 my-6 cursor-pointer"
                      >
                        <div className={`relative w-full h-full duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                          {/* Front Side */}
                          <div className="absolute inset-0 w-full h-full rounded-2xl glass-panel-glow flex flex-col justify-between p-6 backface-hidden bg-slate-900/80">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5" />
                              Question
                            </span>
                            <p className="text-base sm:text-lg font-bold text-white text-center leading-snug px-4">
                              {activeLecture.flashcards[currentCardIdx].front}
                            </p>
                            <span className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-semibold">
                              Click to see Answer
                            </span>
                          </div>

                          {/* Back Side */}
                          <div className="absolute inset-0 w-full h-full rounded-2xl glass-panel-glow border-indigo-500/30 flex flex-col justify-between p-6 backface-hidden rotate-y-180 bg-slate-950">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Explanation
                            </span>
                            <p className="text-sm text-slate-200 text-center leading-relaxed px-4">
                              {activeLecture.flashcards[currentCardIdx].back}
                            </p>
                            <span className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-semibold">
                              Click to flip back
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between w-full max-w-lg gap-4">
                        <button 
                          onClick={() => {
                            if (currentCardIdx > 0) {
                              setCurrentCardIdx(c => c - 1);
                              setIsFlipped(false);
                            }
                          }}
                          disabled={currentCardIdx === 0}
                          className="p-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <button 
                          onClick={() => {
                            setMasteredCards(prev => ({ ...prev, [currentCardIdx]: !prev[currentCardIdx] }));
                          }}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            masteredCards[currentCardIdx]
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {masteredCards[currentCardIdx] ? 'Mastered!' : 'Mark as Mastered'}
                        </button>

                        <button 
                          onClick={() => {
                            if (currentCardIdx < activeLecture.flashcards.length - 1) {
                              setCurrentCardIdx(c => c + 1);
                              setIsFlipped(false);
                            }
                          }}
                          disabled={currentCardIdx === activeLecture.flashcards.length - 1}
                          className="p-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MIND MAP */}
                  {activeTab === 'mindmap' && (
                    <div className="flex flex-col items-center justify-center min-h-[320px] animate-in fade-in duration-300">
                      <div className="w-full max-w-2xl border border-slate-900 rounded-xl bg-slate-950 p-4 relative overflow-hidden">
                        
                        {/* Interactive SVG Mind Map */}
                        <svg className="w-full h-72 sm:h-80" viewBox="0 0 600 300">
                          {/* Paths connecting nodes */}
                          <path d="M 300 150 L 120 70" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2.5" fill="none" className="animate-pulse" />
                          <path d="M 300 150 L 120 150" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2.5" fill="none" />
                          <path d="M 300 150 L 120 230" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2.5" fill="none" />
                          
                          <path d="M 120 70 L 40 40" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" fill="none" />
                          <path d="M 120 70 L 40 70" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" fill="none" />
                          <path d="M 120 70 L 40 100" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" fill="none" />

                          <path d="M 120 150 L 40 125" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="1.5" fill="none" />
                          <path d="M 120 150 L 40 175" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="1.5" fill="none" />

                          <path d="M 120 230 L 40 205" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1.5" fill="none" />
                          <path d="M 120 230 L 40 255" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1.5" fill="none" />

                          {/* Secondary branch line helpers */}
                          <circle cx="300" cy="150" r="42" fill="#0f172a" stroke="#3b82f6" strokeWidth="3" className="filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          <text x="300" y="154" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                            {activeLecture.mindmap.label}
                          </text>

                          {/* Sub Node 1 */}
                          <circle cx="120" cy="70" r="32" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                          <text x="120" y="74" fill="#60a5fa" fontSize="10" fontWeight="semibold" textAnchor="middle">
                            {activeLecture.mindmap.children[0].label}
                          </text>

                          {/* Sub Node 2 */}
                          <circle cx="120" cy="150" r="32" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />
                          <text x="120" y="154" fill="#818cf8" fontSize="10" fontWeight="semibold" textAnchor="middle">
                            {activeLecture.mindmap.children[1].label}
                          </text>

                          {/* Sub Node 3 */}
                          <circle cx="120" cy="230" r="32" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                          <text x="120" y="234" fill="#22d3ee" fontSize="10" fontWeight="semibold" textAnchor="middle">
                            {activeLecture.mindmap.children[2].label}
                          </text>

                          {/* Leaf Nodes from Sub Node 1 */}
                          <rect x="5" y="32" width="60" height="15" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="0.5" />
                          <text x="35" y="42" fill="#e2e8f0" fontSize="7" textAnchor="middle">{activeLecture.mindmap.children[0].children[0]}</text>

                          <rect x="5" y="62" width="60" height="15" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="0.5" />
                          <text x="35" y="72" fill="#e2e8f0" fontSize="7" textAnchor="middle">{activeLecture.mindmap.children[0].children[1]}</text>

                          <rect x="5" y="92" width="60" height="15" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="0.5" />
                          <text x="35" y="102" fill="#e2e8f0" fontSize="7" textAnchor="middle">{activeLecture.mindmap.children[0].children[2]}</text>

                          {/* Leaf Nodes from Sub Node 2 */}
                          <rect x="5" y="117" width="60" height="15" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="0.5" />
                          <text x="35" y="127" fill="#e2e8f0" fontSize="7" textAnchor="middle">{activeLecture.mindmap.children[1].children[0]}</text>

                          <rect x="5" y="167" width="60" height="15" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="0.5" />
                          <text x="35" y="177" fill="#e2e8f0" fontSize="7" textAnchor="middle">{activeLecture.mindmap.children[1].children[1]}</text>

                          {/* Leaf Nodes from Sub Node 3 */}
                          <rect x="5" y="197" width="60" height="15" rx="3" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" />
                          <text x="35" y="207" fill="#e2e8f0" fontSize="7" textAnchor="middle">{activeLecture.mindmap.children[2].children[0]}</text>

                          <rect x="5" y="247" width="60" height="15" rx="3" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" />
                          <text x="35" y="257" fill="#e2e8f0" fontSize="7" textAnchor="middle">{activeLecture.mindmap.children[2].children[1]}</text>
                        </svg>

                        <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-semibold bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                          SVG Interactive Graph
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CHAT TUTOR & QUIZ */}
                  {activeTab === 'chat' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[340px] items-stretch animate-in fade-in duration-300">
                      
                      {/* Sub-panel Left: Chat Message Feed (7 cols) */}
                      <div className="md:col-span-7 flex flex-col justify-between border border-slate-900 rounded-xl bg-slate-950/40 p-4">
                        <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[220px] pr-1">
                          {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                                msg.sender === 'user'
                                  ? 'bg-blue-600 text-white font-semibold rounded-tr-none'
                                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-xl rounded-tl-none px-3.5 py-2 text-xs flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300"></span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input bar */}
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about this lecture..."
                            className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500/80 placeholder:text-slate-500"
                          />
                          <button 
                            type="submit"
                            className="px-3 py-2 text-xs font-bold bg-blue-600 rounded-lg text-white hover:bg-blue-500"
                          >
                            Send
                          </button>
                        </form>
                      </div>

                      {/* Sub-panel Right: Mini Quiz (5 cols) */}
                      <div className="md:col-span-5 border border-slate-900 rounded-xl bg-slate-950/40 p-4 flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-cyan-400" />
                            Live Mini Quiz
                          </h5>
                          
                          <div className="space-y-4">
                            {activeLecture.quiz.map((q, qIdx) => (
                              <div key={qIdx} className="text-left">
                                <p className="text-xs font-semibold text-slate-300 mb-2 leading-relaxed">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <div className="space-y-1.5">
                                  {q.options.map((opt, optIdx) => {
                                    const selected = selectedQuizAnswers[qIdx] === optIdx;
                                    const isCorrect = q.answer === optIdx;
                                    
                                    let btnStyle = "bg-slate-900/60 border-slate-800 text-slate-400";
                                    if (showQuizResults) {
                                      if (isCorrect) btnStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-400";
                                      else if (selected) btnStyle = "bg-rose-950/40 border-rose-500/50 text-rose-400";
                                    } else if (selected) {
                                      btnStyle = "bg-blue-950 border-blue-500 text-blue-300";
                                    }

                                    return (
                                      <button 
                                        key={optIdx}
                                        disabled={showQuizResults}
                                        onClick={() => handleQuizAnswer(qIdx, optIdx)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] border transition-colors ${btnStyle}`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                                {showQuizResults && (
                                  <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">
                                    <span className="font-bold text-slate-400">Explanation:</span> {q.explanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quiz actions */}
                        <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between gap-2">
                          <button 
                            onClick={() => {
                              setSelectedQuizAnswers({});
                              setShowQuizResults(false);
                            }}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white"
                          >
                            Reset
                          </button>
                          
                          {!showQuizResults ? (
                            <button 
                              onClick={() => {
                                if (Object.keys(selectedQuizAnswers).length > 0) {
                                  setShowQuizResults(true);
                                }
                              }}
                              disabled={Object.keys(selectedQuizAnswers).length === 0}
                              className="px-3 py-1.5 rounded bg-cyan-600 text-white text-[10px] font-bold hover:bg-cyan-500 disabled:opacity-40"
                            >
                              Submit Answers
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold self-center">
                              Quiz Graded!
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Dashboard Tab Footer: Suggested actions */}
                <div className="border-t border-slate-900 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Suggested Questions:</span>
                    {selectedType === 'audio' && (
                      <>
                        <button 
                          onClick={() => handleSuggestedQuestion("Why do we need an activation function?")}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white"
                        >
                          "Why activation function?"
                        </button>
                        <button 
                          onClick={() => handleSuggestedQuestion("How is backpropagation calculated?")}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white"
                        >
                          "How does backprop work?"
                        </button>
                      </>
                    )}
                    {selectedType === 'document' && (
                      <button 
                        onClick={() => handleSuggestedQuestion("What is quantum superposition?")}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white"
                      >
                        "What is superposition?"
                      </button>
                    )}
                    {selectedType === 'video' && (
                      <button 
                        onClick={() => handleSuggestedQuestion("What is the difference between fiscal and monetary policy?")}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white"
                      >
                        "Fiscal vs Monetary?"
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIsDone(false); }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
