import React, { useState, useEffect, useRef } from 'react';
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
  HelpCircle, 
  FolderUp, 
  ChevronLeft, 
  ChevronRight,
  Lightbulb,
  Sparkles,
  Upload,
  BookOpen,
  FileCheck,
  Award,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_URL } from '../config';

const SAMPLE_LECTURES = {
  document: {
    title: "Quantum Mechanics & Wave Equations.pdf",
    type: "document",
    size: "8.4 MB",
    summary: "An introduction to non-relativistic Quantum Mechanics, reviewing the transition from classical physics. It covers wave-particle duality, Planck's constant, and the photoelectric effect. The core of the chapter examines the Schrödinger Wave Equation, probability density interpretations, quantum superposition, and Heisenberg's Uncertainty Principle.",
    keyPoints: [
      "Wave-Particle Duality: Light and matter exhibit both wave and particle properties (de Broglie wavelength λ = h/p).",
      "Schrödinger Equation: Governs the spatial and temporal evolution of a quantum state wave function ψ.",
      "Born Probability Density: The squared magnitude |ψ|² represents the probability of finding a particle at a given point.",
      "Quantum Superposition: A quantum system remains in a linear combination of states until measured.",
      "Heisenberg Uncertainty: Δx · Δp ≥ ℏ/2; position and momentum cannot be simultaneously measured with arbitrary precision."
    ],
    mindmap: {
      label: "Quantum Mechanics",
      children: [
        {
          label: "Foundations",
          children: ["Wave-Particle Duality", "Planck Constant (h)", "Photoelectric Effect"]
        },
        {
          label: "Wave Mechanics",
          children: ["Schrödinger Equation", "Wave Function (ψ)", "Probability Density (|ψ|²)"]
        },
        {
          label: "Principles",
          children: ["Superposition", "Uncertainty Principle", "Quantum Tunneling"]
        }
      ]
    },
    flashcards: [
      { 
        front: "What does Planck's constant (h) link in quantum physics?", 
        back: "It links photon frequency to energy: E = hf.",
        hint: "Energy-frequency relationship",
        difficulty: "easy",
        tags: "Foundations"
      },
      { 
        front: "What does the squared wave function (|ψ|²) represent?", 
        back: "Max Born's interpretation: the spatial probability density of locating a particle.",
        hint: "Born rule",
        difficulty: "medium",
        tags: "Wave Mechanics"
      },
      { 
        front: "What is the physical meaning of Heisenberg's Uncertainty Principle?", 
        back: "Position and momentum cannot both be measured with infinite precision at the same time: Δx · Δp ≥ ℏ/2.",
        hint: "Measurement limits",
        difficulty: "hard",
        tags: "Principles"
      },
      { 
        front: "Fill in the blank: In quantum mechanics, {{Superposition}} allows a particle to exist in multiple states simultaneously.", 
        back: "Superposition",
        hint: "Linear combination of eigenstates",
        difficulty: "medium",
        tags: "Principles"
      }
    ],
    mainsQuestions: [
      {
        question: "State the time-dependent Schrödinger wave equation and explain the physical significance of the wave function and probability density.",
        type: "Descriptive (10 Marks)",
        difficulty: "Moderate",
        keyEvaluationPoints: [
          "Equation representation with Hamiltonian operator",
          "Significance of wave function ψ",
          "Born's interpretation of |ψ|²",
          "Normalization condition"
        ],
        modelAnswer: "The Schrödinger wave equation mathematically describes the quantum state of an isolated system. The wave function ψ contains all observable information about the particle. According to Born's interpretation, |ψ|²dV gives the probability of finding the particle in volume dV. For a physically valid state, the integral of |ψ|² over all space must equal 1 (normalization)."
      },
      {
        question: "Critically analyze Heisenberg's Uncertainty Principle and discuss its impact on the classical deterministic worldview of physics.",
        type: "Analytical (15 Marks)",
        difficulty: "Advanced",
        keyEvaluationPoints: [
          "Mathematical statement (Δx · Δp ≥ ℏ/2)",
          "Measurement disturbance vs intrinsic quantum indeterminacy",
          "Breakdown of classical Newtonian determinism",
          "Zero-point energy consequence"
        ],
        modelAnswer: "Heisenberg's Uncertainty Principle imposes a fundamental constraint on simultaneous conjugate variables. Unlike classical mechanics where position and momentum can be precisely tracked, quantum mechanics demonstrates an intrinsic fuzziness. This replaced Laplace's determinism with probabilistic quantum states and explains phenomena like atomic stability and zero-point energy."
      }
    ]
  },
  audio: {
    title: "Deep Learning Foundations (Lecture 4).mp3",
    type: "audio",
    size: "42.8 MB",
    summary: "This lecture introduces the mathematical foundations of Deep Learning, contrasting traditional machine learning with hierarchical representation learning in multi-layer perceptrons. The instructor details forward propagation, loss calculation, backward propagation of error gradients via the chain rule, and non-linear activation functions.",
    keyPoints: [
      "Representation Learning: Deep networks learn hierarchical features directly from raw high-dimensional inputs.",
      "Backpropagation: Calculates gradients of the loss with respect to weights using the recursive chain rule.",
      "Activation Functions: ReLU, Sigmoid, and GELU inject non-linearity to prevent collapsing into a single linear map.",
      "Optimization: Gradient descent variants (Adam, RMSProp) iteratively adjust parameters toward global loss minima."
    ],
    mindmap: {
      label: "Deep Learning",
      children: [
        {
          label: "Network Architecture",
          children: ["Input Layer", "Hidden Layers", "Output Layer"]
        },
        {
          label: "Optimization",
          children: ["Loss Function", "Chain Rule Gradients", "Adam Optimizer"]
        },
        {
          label: "Activations",
          children: ["ReLU Function", "Sigmoid Curve", "Softmax Layer"]
        }
      ]
    },
    flashcards: [
      { front: "What is ReLU and its mathematical formula?", back: "Rectified Linear Unit: f(x) = max(0, x).", hint: "Linear for positive, zero for negative", difficulty: "easy", tags: "Activations" },
      { front: "Why are non-linear activations essential?", back: "Without non-linearity, stacked layers collapse into a single linear matrix multiplication.", hint: "Matrix collapse", difficulty: "medium", tags: "Architecture" },
      { front: "What is the core role of Backpropagation?", back: "Computing partial derivatives of the loss function with respect to every weight.", hint: "Chain rule application", difficulty: "hard", tags: "Optimization" }
    ],
    mainsQuestions: [
      {
        question: "Explain the mathematical formulation of backpropagation using the chain rule of calculus for a two-layer neural network.",
        type: "Analytical (15 Marks)",
        difficulty: "Advanced",
        keyEvaluationPoints: ["Forward pass computation", "Error propagation backward", "Weight update equations", "Vanishing gradient discussion"],
        modelAnswer: "Backpropagation computes ∂L/∂W by applying the chain rule backward from the loss L. For layer l, error δ^l = (W^{l+1})^T δ^{l+1} ⊙ σ'(z^l). The weight update is ΔW^l = -η δ^l (a^{l-1})^T."
      }
    ]
  }
};

export default function InteractiveSandbox() {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste' | 'sample'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [sampleType, setSampleType] = useState('document');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'mindmap' | 'flashcards' | 'mains'
  const [errorMsg, setErrorMsg] = useState('');

  // Extracted Data
  const [extractedData, setExtractedData] = useState(SAMPLE_LECTURES.document);

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedAnswerIdx, setCopiedAnswerIdx] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      setErrorMsg('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      setErrorMsg('');
    }
  };

  const handleStartParsing = async () => {
    setErrorMsg('');
    setIsProcessing(true);
    setProgress(15);
    setStatusMessage('Reading and extracting document contents…');

    try {
      let resultData = null;

      if (inputMode === 'upload' && selectedFile) {
        setProgress(35);
        setStatusMessage('Sending to Gemini AI for layout & taxonomy parsing…');
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', documentTitle || selectedFile.name);

        const response = await fetch(`${API_URL}/api/nemotron/upload-pdf`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to parse uploaded document.');
        }

        const resJson = await response.json();
        resultData = resJson.data;

      } else if (inputMode === 'paste' && pastedText.trim()) {
        setProgress(35);
        setStatusMessage('Gemini AI analyzing concepts, taxonomy, and questions…');

        const response = await fetch(`${API_URL}/api/nemotron/parse-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: documentTitle || 'Pasted Study Notes',
            text: pastedText
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to process pasted notes.');
        }

        const resJson = await response.json();
        resultData = resJson.data;

      } else {
        // Sample Mode
        setProgress(50);
        setStatusMessage('Loading curated sample lecture dataset…');
        await new Promise(r => setTimeout(r, 600));
        resultData = SAMPLE_LECTURES[sampleType] || SAMPLE_LECTURES.document;
      }

      setProgress(85);
      setStatusMessage('Synthesizing mind map branches, key points, and flashcard deck…');
      await new Promise(r => setTimeout(r, 400));

      setProgress(100);
      setStatusMessage('Done! Structured knowledge package ready.');
      setExtractedData(resultData);
      setIsDone(true);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      setActiveTab('points');

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8C7CF0', '#7FCBAE', '#F4CE6B', '#F38181']
      });

    } catch (err) {
      console.error('Parsing failed:', err);
      setErrorMsg(err.message || 'Error occurred while parsing with Gemini AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswerIdx(idx);
    setTimeout(() => setCopiedAnswerIdx(null), 2000);
  };

  const flashcards = extractedData?.flashcards || [];
  const keyPoints = extractedData?.keyPoints || [];
  const mindmap = extractedData?.mindmap || { label: 'Study Topic', children: [] };
  const mainsQuestions = extractedData?.mainsQuestions || [];

  return (
    <section id="sandbox" className="py-14 px-4 bg-paper relative overflow-hidden border-t border-b border-rule">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-deep border border-rule text-xs font-semibold text-charcoal mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet" />
            <span>Powered by Google Gemini AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal tracking-tight mb-2">
            Upload PDF & Extract Knowledge Instantly
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-soft leading-relaxed font-sans">
            Drop your lecture PDF or notes. Gemini AI automatically distills all crucial points, maps out concept hierarchies, generates SM-2 flashcards, and drafts Mains questions.
          </p>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN: SIMPLE INPUT & UPLOAD (5 cols) */}
          <div className="lg:col-span-5 bg-card border border-rule rounded-xl p-5 sm:p-6 shadow-soft flex flex-col justify-between">
            <div>
              
              {/* Mode Toggle Tabs */}
              <div className="flex items-center gap-1 p-1 bg-paper-deep rounded-lg border border-rule mb-5">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                    inputMode === 'upload' 
                      ? 'bg-card text-charcoal shadow-xs border border-rule/50' 
                      : 'text-charcoal-soft hover:text-charcoal'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-violet" />
                  Upload PDF
                </button>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                    inputMode === 'paste' 
                      ? 'bg-card text-charcoal shadow-xs border border-rule/50' 
                      : 'text-charcoal-soft hover:text-charcoal'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-coral" />
                  Paste Text
                </button>
                <button
                  onClick={() => setInputMode('sample')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                    inputMode === 'sample' 
                      ? 'bg-card text-charcoal shadow-xs border border-rule/50' 
                      : 'text-charcoal-soft hover:text-charcoal'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal" />
                  Sample
                </button>
              </div>

              {/* MODE 1: FILE UPLOAD */}
              {inputMode === 'upload' && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      selectedFile 
                        ? 'border-violet/60 bg-violet/5' 
                        : 'border-rule hover:border-violet/40 hover:bg-paper-deep/60'
                    }`}
                  >
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept=".pdf,.txt,.md" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-paper-deep border border-rule flex items-center justify-center text-violet shadow-xs">
                      {selectedFile ? <FileCheck className="w-6 h-6 text-teal" /> : <FolderUp className="w-6 h-6" />}
                    </div>

                    {selectedFile ? (
                      <div>
                        <span className="text-xs font-bold text-charcoal block truncate max-w-xs mx-auto">
                          {selectedFile.name}
                        </span>
                        <span className="text-[11px] text-charcoal-soft font-mono mt-1 block">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Click to change file
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-charcoal block">
                          Click to browse or drop your PDF here
                        </span>
                        <span className="text-[11px] text-charcoal-soft block mt-1">
                          Supports PDF documents, lecture notes, textbook chapters
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block mb-1">
                      Material Topic / Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="e.g. Thermodynamics & Heat Engines"
                      className="w-full px-3 py-2 bg-paper border border-rule rounded-lg text-xs text-charcoal focus:outline-none focus:border-violet"
                    />
                  </div>
                </div>
              )}

              {/* MODE 2: PASTE TEXT */}
              {inputMode === 'paste' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="e.g. Organic Chemistry — Carbon Hybridization"
                      className="w-full px-3 py-2 bg-paper border border-rule rounded-lg text-xs text-charcoal focus:outline-none focus:border-violet"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block mb-1">
                      Paste Lecture / Syllabus Notes
                    </label>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your study material, lecture transcript, or textbook summary here…"
                      className="w-full p-3 bg-paper border border-rule rounded-lg text-xs text-charcoal focus:outline-none focus:border-violet resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* MODE 3: SAMPLE DATA */}
              {inputMode === 'sample' && (
                <div className="space-y-2.5">
                  <span className="text-[11px] text-charcoal-soft block mb-1">
                    Select a ready-to-use sample to test extraction:
                  </span>
                  {[
                    { id: 'document', title: 'Quantum Mechanics & Wave Equations.pdf', subtitle: 'Physics textbook chapter', icon: FileText },
                    { id: 'audio', title: 'Deep Learning Foundations.mp3', subtitle: 'Computer Science lecture notes', icon: FileAudio },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSampleType(s.id); setDocumentTitle(s.title); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        sampleType === s.id
                          ? 'border-violet bg-violet/5 text-charcoal shadow-xs'
                          : 'border-rule bg-card hover:bg-paper-deep text-charcoal-soft'
                      }`}
                    >
                      <s.icon className={`w-4 h-4 ${sampleType === s.id ? 'text-violet' : 'text-charcoal-soft'}`} />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block truncate">{s.title}</span>
                        <span className="text-[10px] text-charcoal-soft block">{s.subtitle}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Engine Badge */}
              <div className="mt-4 p-2.5 rounded-lg bg-paper-deep border border-rule flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  <span className="font-semibold text-charcoal">Gemini 3.5 Flash Lite Parser</span>
                </div>
                <span className="text-[10px] text-charcoal-soft font-mono">Zero Latency</span>
              </div>

              {errorMsg && (
                <div className="mt-3 p-2.5 rounded-lg bg-coral/10 border border-coral/30 text-coral text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

            </div>

            {/* Parse Action Button */}
            <div className="pt-5 mt-4 border-t border-rule">
              {isProcessing && (
                <div className="mb-3 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-charcoal font-semibold">{statusMessage}</span>
                    <span className="text-violet font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-paper-deep rounded-full overflow-hidden border border-rule">
                    <div 
                      className="h-full bg-violet transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleStartParsing}
                disabled={isProcessing || (inputMode === 'upload' && !selectedFile) || (inputMode === 'paste' && !pastedText.trim())}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-violet hover:bg-violet-hover disabled:opacity-50 transition-all shadow-soft flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting with Gemini AI…</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Extract Mind Map & Flashcards</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: BEAUTIFULLY ORGANIZED OUTPUT (7 cols) */}
          <div className="lg:col-span-7 bg-card border border-rule rounded-xl shadow-soft flex flex-col overflow-hidden min-h-[520px]">
            
            {/* Header Tabs Navigation */}
            <div className="flex items-center justify-between border-b border-rule bg-paper-deep/60 px-4 py-2.5">
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'points', label: 'Important Points', icon: CheckCircle2, ink: 'teal' },
                  { id: 'mindmap', label: 'Mind Map', icon: BrainCircuit, ink: 'violet' },
                  { id: 'flashcards', label: `Flashcards (${flashcards.length})`, icon: Lightbulb, ink: 'coral' },
                  { id: 'mains', label: `Mains Prep (${mainsQuestions.length})`, icon: Award, ink: 'violet' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-card text-charcoal shadow-xs border border-rule'
                          : 'text-charcoal-soft hover:text-charcoal'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet' : 'text-charcoal-soft'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <span className="hidden sm:inline-flex text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal/15 text-teal">
                Gemini Grounded
              </span>
            </div>

            {/* Tab Views Body */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto max-h-[500px]">
              
              {/* TAB 1: ALL NECESSARY IMPORTANT POINTS & SUMMARY */}
              {activeTab === 'points' && (
                <div className="space-y-5">
                  <div className="border-b border-rule pb-3">
                    <h3 className="text-base font-serif font-bold text-charcoal">
                      {extractedData?.title || 'Extracted Study Overview'}
                    </h3>
                    <p className="text-xs text-charcoal-soft mt-1 leading-relaxed">
                      {extractedData?.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                      Key Points & Exam Essentials
                    </h4>
                    
                    <div className="space-y-2.5">
                      {keyPoints.map((point, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start gap-3 p-3 rounded-lg bg-paper-deep/60 border border-rule text-xs text-charcoal leading-relaxed"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal/15 text-teal font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INTERACTIVE CONCEPT MIND MAP */}
              {activeTab === 'mindmap' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-charcoal">Cognitive Concept Hierarchy</span>
                    <span className="text-[11px] text-charcoal-soft font-mono">Central Root → Branches → Topics</span>
                  </div>

                  {/* SVG Mind Map Tree */}
                  <div className="bg-paper border border-rule rounded-xl p-4 overflow-x-auto shadow-inner">
                    <div className="min-w-[480px]">
                      {/* Central Root Node */}
                      <div className="flex justify-center mb-6">
                        <div className="px-5 py-2.5 rounded-xl bg-violet text-white text-xs font-bold shadow-soft border border-violet-hover inline-flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4" />
                          <span>{mindmap.label}</span>
                        </div>
                      </div>

                      {/* Main Branches */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(mindmap.children || []).map((branch, bIdx) => (
                          <div 
                            key={bIdx}
                            className="bg-card border border-rule rounded-xl p-3.5 flex flex-col justify-between shadow-xs hover:border-violet/40 transition-all"
                          >
                            <div className="border-b border-rule pb-2 mb-2.5 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-coral" />
                              <span className="text-xs font-bold text-charcoal">{branch.label}</span>
                            </div>

                            <div className="space-y-1.5">
                              {(branch.children || []).map((child, cIdx) => (
                                <div 
                                  key={cIdx}
                                  className="text-[11px] px-2.5 py-1.5 rounded-md bg-paper-deep text-charcoal-soft font-medium flex items-center gap-1.5"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                                  <span className="truncate">{child}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EXTRACTED FLASHCARDS */}
              {activeTab === 'flashcards' && (
                <div className="flex flex-col items-center justify-between min-h-[340px]">
                  
                  <div className="w-full flex items-center justify-between text-xs mb-3">
                    <span className="font-mono text-charcoal-soft font-bold">
                      CARD {currentCardIdx + 1} OF {flashcards.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-coral/15 text-coral font-bold text-[10px] uppercase">
                      {flashcards[currentCardIdx]?.difficulty || 'Medium'} Recall
                    </span>
                  </div>

                  {/* 3D Flip Card */}
                  {flashcards.length > 0 ? (
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full max-w-lg h-56 perspective-1000 cursor-pointer select-none"
                    >
                      <div className={`relative w-full h-full duration-300 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* Front Side */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl border border-rule bg-card p-6 shadow-soft flex flex-col justify-between backface-hidden">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-violet uppercase tracking-widest flex items-center gap-1 font-mono">
                              <HelpCircle className="w-3.5 h-3.5" /> QUESTION
                            </span>
                            <span className="text-[10px] text-charcoal-soft font-mono">
                              {flashcards[currentCardIdx]?.tags}
                            </span>
                          </div>

                          <p className="text-sm font-serif font-bold text-charcoal text-center px-4 leading-relaxed">
                            {flashcards[currentCardIdx]?.front}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-charcoal-soft font-mono">
                            <span>Hint: {flashcards[currentCardIdx]?.hint || 'Think key definition'}</span>
                            <span className="text-violet font-semibold">Click to flip ↻</span>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl border border-teal/40 bg-paper-deep p-6 shadow-soft flex flex-col justify-between backface-hidden rotate-y-180">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-teal uppercase tracking-widest flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" /> RECALL ANSWER
                            </span>
                            <span className="text-[10px] text-teal font-mono font-bold">
                              SM-2 Grounded
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-medium text-charcoal text-center px-4 leading-relaxed">
                            {flashcards[currentCardIdx]?.back}
                          </p>

                          <div className="text-center text-[11px] text-charcoal-soft font-mono">
                            Click to flip back
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-charcoal-soft text-xs">
                      No flashcards extracted yet. Upload a document to generate.
                    </div>
                  )}

                  {/* Card Navigation Controls */}
                  <div className="w-full flex items-center justify-between pt-5 border-t border-rule mt-4">
                    <button
                      onClick={() => {
                        if (currentCardIdx > 0) {
                          setCurrentCardIdx(c => c - 1);
                          setIsFlipped(false);
                        }
                      }}
                      disabled={currentCardIdx === 0}
                      className="px-3.5 py-1.5 rounded-lg border border-rule text-xs font-bold text-charcoal hover:bg-paper-deep disabled:opacity-30 transition-all flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>

                    <span className="text-xs text-charcoal-soft font-sans">
                      Tap card to reveal answer
                    </span>

                    <button
                      onClick={() => {
                        if (currentCardIdx < flashcards.length - 1) {
                          setCurrentCardIdx(c => c + 1);
                          setIsFlipped(false);
                        }
                      }}
                      disabled={currentCardIdx === flashcards.length - 1}
                      className="px-3.5 py-1.5 rounded-lg border border-rule text-xs font-bold text-charcoal hover:bg-paper-deep disabled:opacity-30 transition-all flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 4: MAINS EXAM PREP QUESTIONS */}
              {activeTab === 'mains' && (
                <div className="space-y-4">
                  <div className="border-b border-rule pb-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-charcoal">Mains Examination Practice Suite</span>
                    <span className="text-[11px] text-charcoal-soft font-mono">Evaluated by Gemini AI</span>
                  </div>

                  <div className="space-y-4">
                    {mainsQuestions.map((mq, idx) => (
                      <div 
                        key={idx}
                        className="bg-paper-deep/70 border border-rule rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-serif font-bold text-charcoal leading-snug">
                            Q{idx + 1}. {mq.question}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-coral/15 text-coral shrink-0">
                            {mq.type || '10 Marks'}
                          </span>
                        </div>

                        {/* Evaluation Points */}
                        {mq.keyEvaluationPoints && mq.keyEvaluationPoints.length > 0 && (
                          <div className="bg-card p-3 rounded-lg border border-rule/60">
                            <span className="text-[10px] font-bold text-charcoal-soft uppercase tracking-wider block font-mono mb-1.5">
                              Key Evaluation Rubrics:
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-charcoal">
                              {mq.keyEvaluationPoints.map((pt, pIdx) => (
                                <li key={pIdx}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Model Answer */}
                        <div className="bg-card p-3 rounded-lg border border-rule/60">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-teal uppercase tracking-wider font-mono">
                              Model Scoring Answer:
                            </span>
                            <button
                              onClick={() => copyToClipboard(mq.modelAnswer, idx)}
                              className="text-[11px] text-charcoal-soft hover:text-charcoal flex items-center gap-1 font-mono"
                            >
                              {copiedAnswerIdx === idx ? <Check className="w-3 h-3 text-teal" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedAnswerIdx === idx ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line">
                            {mq.modelAnswer}
                          </p>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
