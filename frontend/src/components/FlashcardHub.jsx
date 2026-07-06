import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { 
  Plus, 
  Brain, 
  Clock, 
  Award, 
  Sparkles, 
  ArrowLeft, 
  Star, 
  RotateCcw, 
  Play, 
  HelpCircle,
  BookOpen,
  ArrowRight,
  UploadCloud,
  TrendingUp,
  FileText,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function FlashcardHub({ currentUser }) {
  const [sets, setSets] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  
  // Filtering & Display States
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // 'all' | 'easy' | 'medium' | 'hard'
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [tagQuery, setTagQuery] = useState('');

  // Study Modes: 'flip' | 'timed' | 'exam'
  const [studyMode, setStudyMode] = useState('flip');
  const [shuffledCards, setShuffledCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Timed Mode Clock States
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  // Exam Mode Answer States
  const [examAnswers, setExamAnswers] = useState({}); // cardId -> studentTypedText
  const [examResult, setExamResult] = useState(null); // { score, total, percentage, report: [] }

  // Generation Panel States
  const [isGenerating, setIsGenerating] = useState(false);
  const [genTitle, setGenTitle] = useState('');
  const [genSourceType, setGenSourceType] = useState('note'); // 'note' | 'pdf' | 'image'
  const [genText, setGenText] = useState('');

  // Drag and Drop States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop events
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file select via browse click
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process selected file
  const processFile = (file) => {
    setSelectedFile(file);
    
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setGenTitle(nameWithoutExt);

    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGenText(e.target.result);
      };
      reader.readAsText(file);
      setGenSourceType("note");
      setImagePreview(null);
    }
    else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setGenSourceType("image");
      
      if (file.name.toLowerCase().includes("quantum") || file.name.toLowerCase().includes("schrodinger")) {
        setGenText(`[OCR Image Content] diagram of Schrödinger wave-particle duality and probability density constants.`);
      } else {
        setGenText(`[OCR Image Content] backpropagation calculation chart in multi-layer perceptron networks.`);
      }
    }
    else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setGenSourceType("pdf");
      setImagePreview(null);
      
      if (file.name.toLowerCase().includes("quantum") || file.name.toLowerCase().includes("schrodinger")) {
        setGenText(`[PDF Document Content] Chapter 1: Introduction to Schrödinger Wave Equation, probability density, and Born interpretations.`);
      } else {
        setGenText(`[PDF Document Content] Chapter 2: Backpropagation training algorithm, Chain Rule derivatives, and Gradient Descent optimization.`);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setGenText('');
    setGenTitle('');
  };

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/flashcards`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSets(data.sets);
          return;
        }
      } catch (err) {
        console.error("Failed to load database flashcards:", err.message);
      }
    }
    loadFallbackLocalSets();
  };

  const loadFallbackLocalSets = () => {
    const local = localStorage.getItem('lecturemind_guest_flashcards');
    if (local) {
      setSets(JSON.parse(local));
    } else {
      // Default Seed Set for Guest mode
      const defaultSets = [
        {
          id: "guest-set-1",
          title: "Deep Learning Foundations",
          cards: [
            {
              id: "gcard-1",
              front: "McCulloch-Pitts Neurons utilize a simple {{threshold}} activation function.",
              back: "threshold",
              type: "cloze",
              hint: "A binary step function.",
              difficulty: "easy",
              tags: "AI",
              bookmarked: false
            },
            {
              id: "gcard-2",
              front: "What does the backpropagation algorithm optimize?",
              back: "The weights and biases of the neural network to minimize the loss function.",
              type: "front_back",
              hint: "Gradient adjustments using loss parameters.",
              difficulty: "medium",
              tags: "AI",
              bookmarked: true
            },
            {
              id: "gcard-3",
              front: "The {{vanishing gradient}} problem makes deep networks with Sigmoid activations extremely slow to train.",
              back: "vanishing gradient",
              type: "cloze",
              hint: "Gradients shrink exponentially towards zero.",
              difficulty: "hard",
              tags: "AI",
              bookmarked: false
            }
          ]
        }
      ];
      setSets(defaultSets);
      localStorage.setItem('lecturemind_guest_flashcards', JSON.stringify(defaultSets));
    }
  };

  const saveLocalSets = (updatedSets) => {
    setSets(updatedSets);
    localStorage.setItem('lecturemind_guest_flashcards', JSON.stringify(updatedSets));
  };

  // AI Flashcard Generation handler
  const handleGenerateFlashcards = async (e) => {
    e.preventDefault();
    if (!genTitle || !genText) return;

    setIsGenerating(true);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/flashcards/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: genTitle,
            text: genText,
            sourceType: genSourceType
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSets([data.set, ...sets]);
          resetGenForm();
          setIsGenerating(false);
          return;
        }
      } catch (err) {
        console.error("AI flashcard generation failed:", err.message);
      }
    }

    // Guest Fallback simulation (takes 1.5s to show premium AI loading effect)
    setTimeout(() => {
      // Mock parsing rules inside ai.js local generator
      const mockResult = simulateAIGeneration(genTitle, genText, genSourceType);
      saveLocalSets([mockResult, ...sets]);
      resetGenForm();
      setIsGenerating(false);
    }, 1500);
  };

  const simulateAIGeneration = (title, text, type) => {
    // Generate mock cards based on keywords
    const cards = [];
    const cleanText = text.toLowerCase();

    if (cleanText.includes('schrödinger') || cleanText.includes('quantum')) {
      cards.push({
        id: "gcard-" + Date.now() + "-1",
        front: "What equation forms the basis of non-relativistic wave mechanics?",
        back: "The Schrödinger wave equation.",
        type: "front_back",
        hint: "Formulated in 1925.",
        difficulty: "hard",
        tags: "Quantum",
        bookmarked: false
      });
      cards.push({
        id: "gcard-" + Date.now() + "-2",
        front: "The Born Interpretation describes wave amplitude squared as {{probability density}}.",
        back: "probability density",
        type: "cloze",
        hint: "Particle localization statistics.",
        difficulty: "medium",
        tags: "Physics",
        bookmarked: false
      });
    } else {
      // Generic parser
      cards.push({
        id: "gcard-" + Date.now() + "-1",
        front: `Explain the main concept discussed in: "${text.substring(0, 40)}..."`,
        back: "This covers key definitions from your uploaded notes.",
        type: "front_back",
        hint: "Refer to prompt outline.",
        difficulty: "easy",
        tags: "General",
        bookmarked: false
      });
      cards.push({
        id: "gcard-" + Date.now() + "-2",
        front: `This material covers key items linked to the study of {{${type}}}.`,
        back: type,
        type: "cloze",
        hint: "Categorical file type.",
        difficulty: "medium",
        tags: "Notes",
        bookmarked: false
      });
    }

    return {
      id: "guest-set-" + Date.now(),
      title,
      cards
    };
  };

  const resetGenForm = () => {
    setGenTitle('');
    setGenText('');
    setGenSourceType('note');
  };

  // Toggle Bookmark status of a Card
  const toggleBookmark = async (cardId) => {
    if (!activeSet) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/flashcards/${cardId}/bookmark`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          updateCardBookmarkInState(cardId, data.bookmarked);
          return;
        }
      } catch (err) {
        console.error("Bookmark toggle failed:", err.message);
      }
    }

    // Guest fallback toggle
    const currentCard = activeSet.cards.find(c => c.id === cardId);
    if (currentCard) {
      const updatedBookmark = !currentCard.bookmarked;
      updateCardBookmarkInState(cardId, updatedBookmark);
    }
  };

  const updateCardBookmarkInState = (cardId, status) => {
    // Update active set
    const updatedCards = activeSet.cards.map(c => c.id === cardId ? { ...c, bookmarked: status } : c);
    const updatedActiveSet = { ...activeSet, cards: updatedCards };
    setActiveSet(updatedActiveSet);

    // Update sets list
    const updatedSets = sets.map(s => s.id === activeSet.id ? updatedActiveSet : s);
    setSets(updatedSets);
    if (!localStorage.getItem('token')) {
      localStorage.setItem('lecturemind_guest_flashcards', JSON.stringify(updatedSets));
    }
  };

  // Delete Set
  const handleDeleteSet = async (setId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/flashcards/sets/${setId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          setSets(sets.filter(s => s.id !== setId));
          if (activeSet?.id === setId) setActiveSet(null);
          return;
        }
      } catch (err) {
        console.error("Delete set failed:", err.message);
      }
    }

    // Guest Fallback
    const updatedSets = sets.filter(s => s.id !== setId);
    saveLocalSets(updatedSets);
    if (activeSet?.id === setId) setActiveSet(null);
  };

  // SELECT SET FOR STUDYING
  const startStudying = (set, mode = 'flip') => {
    setActiveSet(set);
    setStudyMode(mode);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setExamAnswers({});
    setExamResult(null);

    // Setup initial card lists
    let deck = [...set.cards];
    if (mode === 'timed') {
      startTimedCountdown();
    }
    setShuffledCards(deck);
  };

  // TIMED MODE TIMER
  const startTimedCountdown = () => {
    clearInterval(timerRef.current);
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFlipped(true); // Auto reveal answer when timer ends
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleNextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
      if (studyMode === 'timed') {
        startTimedCountdown();
      }
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
      if (studyMode === 'timed') {
        startTimedCountdown();
      }
    }
  };

  // Shuffle toggle
  const toggleShuffle = () => {
    const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // EXAM MODE GRADING
  const handleExamSubmit = (e) => {
    e.preventDefault();
    let score = 0;
    const report = [];

    filteredCards.forEach(card => {
      const studentAns = (examAnswers[card.id] || '').trim().toLowerCase();
      const correctAns = card.back.trim().toLowerCase();

      // Check if correct (fuzzy checking)
      const isCorrect = studentAns === correctAns || correctAns.includes(studentAns) && studentAns.length > 2;
      if (isCorrect) score++;

      report.push({
        id: card.id,
        front: card.front,
        correctAns: card.back,
        studentAns: examAnswers[card.id] || '(No Answer)',
        isCorrect
      });
    });

    const percentage = Math.round((score / filteredCards.length) * 100);
    setExamResult({
      score,
      total: filteredCards.length,
      percentage,
      report
    });
  };

  // Filter Cards
  const filteredCards = (activeSet ? activeSet.cards : []).filter(card => {
    if (difficultyFilter !== 'all' && card.difficulty !== difficultyFilter) return false;
    if (showOnlyBookmarked && !card.bookmarked) return false;
    if (tagQuery && !card.tags.toLowerCase().includes(tagQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pb-10">
      
      {/* LEFT SIDEBAR: Creation/Generation panel (Width: 4 Columns) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Flashcard Generation Card */}
        <div className="glass-panel p-6.5 rounded-3xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-600/5 filter blur-xl rounded-full"></div>
          
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-900">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Generator</h4>
          </div>

          <form onSubmit={handleGenerateFlashcards} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Set Title</label>
              <input 
                type="text" 
                required
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="e.g. Backprop & Gradient Flow"
                className="w-full px-4.5 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Study Source</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'note', name: 'Notes', icon: FileText },
                  { value: 'pdf', name: 'PDF', icon: FileCode },
                  { value: 'image', name: 'Image', icon: ImageIcon }
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setGenSourceType(t.value)}
                    className={`py-2 px-1 rounded-xl border text-center text-[10px] font-bold flex flex-col items-center gap-1.5 transition-all ${
                      genSourceType === t.value 
                        ? 'border-blue-500 bg-blue-950/20 text-white' 
                        : 'border-slate-900 bg-slate-900/30 text-slate-400'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* DRAG AND DROP ZONE */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Upload Source File</label>
              {selectedFile ? (
                <div className="p-3.5 rounded-2xl bg-slate-900/30 border border-slate-850 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-205">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="upload preview" className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0" />
                    ) : (
                      <FileText className="w-8 h-8 text-blue-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{selectedFile.name}</p>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; Ready
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={removeSelectedFile}
                    className="p-1 rounded-md hover:bg-slate-950 text-slate-550 hover:text-rose-400 transition-all shrink-0"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={onButtonClick}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[100px] ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-950/20' 
                      : 'border-slate-850 hover:border-slate-800 bg-slate-900/10'
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept={genSourceType === 'image' ? 'image/*' : genSourceType === 'pdf' ? '.pdf' : '.txt,.md'}
                  />
                  <UploadCloud className="w-7 h-7 text-slate-500 mb-1.5 animate-pulse" />
                  <p className="text-[10px] text-slate-400 font-bold">
                    Drag & drop your {genSourceType.toUpperCase()} file here
                  </p>
                  <span className="text-[9px] text-slate-600 mt-1">or click to browse local files</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                {selectedFile ? "Extracted Study Text" : "Or Paste Study Text Directly"}
              </label>
              <textarea 
                required
                value={genText}
                onChange={(e) => setGenText(e.target.value)}
                placeholder={
                  genSourceType === 'note' 
                    ? "Paste syllabus notes, summaries, or formulas here..." 
                    : `Extracted text will appear here...`
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-slate-200 focus:outline-none focus:border-blue-500 h-24 resize-none leading-relaxed"
              />
            </div>

            <button 
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-650 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                  Generating via Gemini...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate Flashcards
                </>
              )}
            </button>
          </form>
        </div>

        {/* Saved Sets Catalog List */}
        <div className="glass-panel p-5 rounded-3xl">
          <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-900">Saved Study Sets</h4>
          
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {sets.map(s => (
              <div 
                key={s.id}
                onClick={() => startStudying(s, 'flip')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  activeSet?.id === s.id 
                    ? 'bg-blue-950/40 border-blue-500/30 text-white' 
                    : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-805'
                }`}
              >
                <div className="min-w-0">
                  <span className="font-bold text-xs truncate block">{s.title}</span>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">
                    {s.cards?.length || 0} Cards
                  </span>
                </div>
                <button 
                  onClick={(e) => handleDeleteSet(s.id, e)}
                  className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}

            {sets.length === 0 && (
              <p className="text-center py-6 text-slate-500 text-xs">No flashcard sets generated yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* MAIN STUDY INTERFACE (Width: 8 Columns) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {activeSet ? (
          <div className="space-y-6">
            
            {/* HUB HEADER & STUDY MODES SELECTOR */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white">{activeSet.title}</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Active study board</span>
              </div>

              {/* Mode switch tabs */}
              <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-900">
                {[
                  { id: 'flip', name: 'Flip' },
                  { id: 'timed', name: 'Timed' },
                  { id: 'exam', name: 'Exam' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => startStudying(activeSet, mode.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      studyMode === mode.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-450 hover:text-white'
                    }`}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>

            {/* FILTER CONTROLS */}
            <div className="glass-panel px-5 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
              
              <div className="flex items-center gap-3.5 flex-wrap">
                {/* Difficulty Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-550 font-bold">Difficulty:</span>
                  <select 
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-850 px-2 py-1 rounded text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Bookmark Toggle */}
                <button 
                  onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                  className={`flex items-center gap-1 font-bold ${
                    showOnlyBookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-450'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Starred Only
                </button>
              </div>

              {/* Tag search */}
              <input 
                type="text" 
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder="Search tags..."
                className="px-2.5 py-1 bg-slate-900 border border-slate-850 rounded text-xs text-slate-300 w-32 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* PLAYING CONTENT DECKS */}
            {filteredCards.length > 0 ? (
              <div>
                {/* 1. FLIP & TIMED MODE */}
                {(studyMode === 'flip' || studyMode === 'timed') && (
                  <div className="space-y-6">
                    {/* Timer progress bar (Only for timed mode) */}
                    {studyMode === 'timed' && (
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-linear" 
                          style={{ width: `${(timeLeft / 15) * 100}%` }}
                        ></div>
                      </div>
                    )}

                    {/* CARD VIEWER WRAP */}
                    <div className="flex items-center justify-between gap-4">
                      
                      {/* Left arrow navigation */}
                      <button 
                        onClick={handlePrevCard}
                        disabled={currentCardIndex === 0}
                        className="p-2.5 rounded-full bg-slate-900/60 border border-slate-900 text-slate-450 hover:text-white hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* The 3D Rotating Card Box */}
                      <div 
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="flex-1 max-w-lg cursor-pointer perspective h-80 relative select-none"
                      >
                        <div 
                          className={`w-full h-full duration-500 transform-style-3d relative rounded-3xl border border-slate-900 bg-slate-950 p-8 flex flex-col justify-between ${
                            isFlipped ? 'rotate-y-180 bg-slate-900/40 border-blue-500/20' : 'hover:border-slate-800'
                          }`}
                        >
                          {/* FRONT VIEW */}
                          <div className={`backface-hidden w-full h-full flex flex-col justify-between ${isFlipped ? 'opacity-0' : ''}`}>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                Question {currentCardIndex + 1} of {filteredCards.length}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  filteredCards[currentCardIndex].difficulty === 'hard' 
                                    ? 'bg-rose-950/45 text-rose-400' 
                                    : filteredCards[currentCardIndex].difficulty === 'medium'
                                    ? 'bg-indigo-950/45 text-indigo-400'
                                    : 'bg-emerald-950/45 text-emerald-450'
                                }`}>
                                  {filteredCards[currentCardIndex].difficulty}
                                </span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(filteredCards[currentCardIndex].id);
                                  }}
                                  className={`p-1 rounded ${filteredCards[currentCardIndex].bookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-500'}`}
                                >
                                  <Star className="w-4 h-4 fill-current" />
                                </button>
                              </div>
                            </div>

                            {/* Question Body */}
                            <div className="text-center py-5">
                              {filteredCards[currentCardIndex].type === 'cloze' ? (
                                <p className="text-lg font-bold text-slate-200 leading-relaxed px-4">
                                  {filteredCards[currentCardIndex].front.replace(/\{\{.*?\}\}/g, '[ _________ ]')}
                                </p>
                              ) : (
                                <p className="text-lg font-bold text-slate-200 leading-relaxed px-4">
                                  {filteredCards[currentCardIndex].front}
                                </p>
                              )}
                              <span className="text-[10px] text-slate-550 font-bold block mt-6 uppercase tracking-wider">Click Card to Flip</span>
                            </div>

                            {/* Tags list */}
                            <div className="flex flex-wrap gap-1.5 mt-auto">
                              {filteredCards[currentCardIndex].tags && (
                                <span className="text-[9px] font-bold uppercase bg-slate-900 border border-slate-850 text-slate-500 px-1.5 py-0.5 rounded">
                                  {filteredCards[currentCardIndex].tags}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* BACK VIEW */}
                          <div className={`backface-hidden rotate-y-180 w-full h-full flex flex-col justify-between absolute inset-0 p-8 ${!isFlipped ? 'opacity-0' : ''}`}>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Answer Solution</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(filteredCards[currentCardIndex].id);
                                }}
                                className={`p-1 rounded ${filteredCards[currentCardIndex].bookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-500'}`}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </div>

                            {/* Answer Text */}
                            <div className="text-center py-4">
                              <p className="text-lg font-bold text-emerald-400 leading-relaxed px-4">
                                {filteredCards[currentCardIndex].back}
                              </p>
                              
                              {/* Display Hint optionally */}
                              {showHint && filteredCards[currentCardIndex].hint && (
                                <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed border-dashed">
                                  <span className="font-bold text-slate-400 block mb-0.5">Hint:</span>
                                  {filteredCards[currentCardIndex].hint}
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowHint(!showHint);
                                }}
                                className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                              >
                                {showHint ? "Hide Hint" : "Reveal Hint"}
                              </button>
                              <span className="text-[10px] text-slate-550 font-bold block uppercase tracking-wider">Click Card to Flip back</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Right arrow navigation */}
                      <button 
                        onClick={handleNextCard}
                        disabled={currentCardIndex === filteredCards.length - 1}
                        className="p-2.5 rounded-full bg-slate-900/60 border border-slate-900 text-slate-450 hover:text-white hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                    </div>

                    {/* Shuffle deck button */}
                    <div className="text-center">
                      <button 
                        onClick={toggleShuffle}
                        className="text-xs font-bold text-slate-500 hover:text-white transition-colors inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Shuffle Card Deck
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. EXAM MODE PRACTICE */}
                {studyMode === 'exam' && (
                  <div className="glass-panel p-6.5 rounded-3xl space-y-6">
                    <div className="border-b border-slate-900 pb-4 mb-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Active Concept Exam</h4>
                      <p className="text-slate-500 text-xs mt-1">Provide answers to evaluate accuracy metrics.</p>
                    </div>

                    {!examResult ? (
                      <form onSubmit={handleExamSubmit} className="space-y-5">
                        {filteredCards.map((card, idx) => (
                          <div key={card.id} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-900 space-y-3">
                            <span className="text-[9px] uppercase font-bold text-slate-500">Question {idx + 1}</span>
                            
                            {/* Question Title */}
                            {card.type === 'cloze' ? (
                              <p className="text-sm font-semibold text-slate-200">
                                Fill in the blank: "{card.front.replace(/\{\{.*?\}\}/g, '___________')}"
                              </p>
                            ) : (
                              <p className="text-sm font-semibold text-slate-200">{card.front}</p>
                            )}

                            {/* User Answer Text Input */}
                            <input 
                              type="text" 
                              required
                              value={examAnswers[card.id] || ''}
                              onChange={(e) => setExamAnswers({ ...examAnswers, [card.id]: e.target.value })}
                              placeholder="Type your answer here..."
                              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        ))}

                        <button 
                          type="submit"
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-550 transition-colors"
                        >
                          Grade Exam Answers
                        </button>
                      </form>
                    ) : (
                      /* EXAM SCORE REPORT */
                      <div className="space-y-6">
                        
                        {/* Score stats header */}
                        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-850 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Exam Result Score</span>
                            <span className="text-2xl font-black text-white">{examResult.score} / {examResult.total} Correct</span>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-black text-blue-400 block">{examResult.percentage}%</span>
                            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Accuracy Rating</span>
                          </div>
                        </div>

                        {/* Summary breakdown of each question */}
                        <div className="space-y-3">
                          {examResult.report.map((item, idx) => (
                            <div 
                              key={item.id}
                              className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
                                item.isCorrect 
                                  ? 'border-emerald-950/40 bg-emerald-950/10' 
                                  : 'border-rose-950/40 bg-rose-950/10'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {item.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-450" />
                                )}
                              </div>

                              <div>
                                <span className="text-[9px] text-slate-550 block font-bold uppercase">Question {idx + 1}</span>
                                <p className="font-semibold text-slate-200 mt-0.5">{item.front}</p>
                                
                                <div className="mt-2.5 space-y-1 text-[11px]">
                                  <p className="text-slate-400">Your Answer: <span className={item.isCorrect ? 'text-emerald-450 font-bold' : 'text-rose-400 font-bold'}>{item.studentAns}</span></p>
                                  {!item.isCorrect && (
                                    <p className="text-slate-450">Correct Answer: <span className="text-emerald-450 font-bold">{item.correctAns}</span></p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reset practice button */}
                        <button 
                          onClick={() => startStudying(activeSet, 'exam')}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded-xl text-xs font-bold transition-all border border-slate-850"
                        >
                          Retry Exam Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* NO CARDS FOUND FILTER ERROR */
              <div className="glass-panel p-20 text-center rounded-3xl">
                <HelpCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-semibold">No Matching Flashcards</p>
                <p className="text-slate-500 text-xs mt-1">Adjust difficulty filter, star bookmarks, or search tags to reveal cards.</p>
              </div>
            )}

          </div>
        ) : (
          /* UNSELECTED INTRO PANEL */
          <div className="glass-panel p-20 text-center rounded-3xl min-h-[380px] flex flex-col justify-center">
            <Brain className="w-14 h-14 text-blue-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Select a Study Deck</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
              Create and generate custom study sets using AI prompts on the left, or select an existing set from your saved catalog list to begin testing!
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
