import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  Plus, 
  FolderOpen, 
  ArrowLeft, 
  BookOpen, 
  UploadCloud, 
  ChevronRight, 
  Eye, 
  LayoutGrid, 
  List, 
  CheckCircle2, 
  Brain, 
  Clock, 
  Sparkles, 
  X 
} from 'lucide-react';

export default function SubjectExplorer({ currentUser: _currentUser, onShowToast }) {
  const [subjects, setSubjects] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Browsing Navigation Path: [] -> Root, [{id, name, type:'subject'}], ...
  const [navigationPath, setNavigationPath] = useState([]);
  
  // Drag & Drop Upload Zone States
  const [dragActive, setDragActive] = useState(false);
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('Transcribing…');
  const fileInputRef = useRef(null);

  // Form Toggles & Inputs
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjName, setSubjName] = useState('');
  const [subjDesc, setSubjDesc] = useState('');
  const [subjTags, setSubjTags] = useState('');

  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [chapName, setChapName] = useState('');

  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [topName, setTopName] = useState('');

  // Reader Modal State with Timestamp Sync & Concept Map
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [highlightedTimestamp, setHighlightedTimestamp] = useState(null);
  const [selectedConceptNode, setSelectedConceptNode] = useState(null);
  const [conceptMapFilter, setConceptMapFilter] = useState('');
  const [notesRefinementStatus, setNotesRefinementStatus] = useState('');

  // Load Tree
  useEffect(() => {
    fetchSubjectTree();
  }, []);

  const fetchSubjectTree = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/subjects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSubjects(data.subjects);
          return;
        }
      } catch (err) {
        console.error("Failed to load DB subjects:", err.message);
      }
    }
    loadFallbackLocalTree();
  };

  const loadFallbackLocalTree = () => {
    const local = localStorage.getItem('lecturemind_guest_subjects');
    if (local) {
      setSubjects(JSON.parse(local));
    } else {
      const seedData = [
        {
          id: "sub-1",
          name: "Deep Learning & Representation Learning",
          description: "Multi-layer Perceptrons, backpropagation gradients, and attention architectures.",
          tags: "AI, Calculus",
          chapters: [
            {
              id: "chap-1",
              name: "Chapter 1: Multi-layer Perceptrons",
              topics: [
                {
                  id: "top-1",
                  name: "Backpropagation & Gradient Flow",
                  materials: [
                    {
                      id: "mat-1",
                      name: "Backpropagation Mathematical Derivation.note",
                      type: "note",
                      content: "Backpropagation applies the mathematical Chain Rule to compute partial derivatives of the objective Loss with respect to every weight in a deep neural network.\n\nKey formula:\n∂L/∂w_i = (∂L/∂a) * (∂a/∂z) * (∂z/∂w_i)\n\nSignals propagate backwards starting from output predictions down to shallow layers. Activation functions like ReLU keep gradient signals steady (derivative = 1 for positive inputs), preventing vanishing gradient decay.",
                      fileSize: "4 KB",
                      transcript: [
                        { time: "04:15", text: "Let us start by deriving the chain rule across two dense layers." },
                        { time: "12:30", text: "Notice how the gradient signal depends on the activation function derivative." },
                        { time: "18:42", text: "With Sigmoid, saturation near 0 or 1 causes vanishing gradients." },
                        { time: "24:10", text: "ReLU solves this by maintaining a constant slope of 1 for all positive inputs." }
                      ],
                      concepts: [
                        { id: 'c1', name: 'Chain Rule', mastery: 85, definition: 'Calculus formula for computing derivative of composite functions.' },
                        { id: 'c2', name: 'Vanishing Gradient', mastery: 38, definition: 'Exponential decay of gradient magnitudes in early network layers.' },
                        { id: 'c3', name: 'ReLU Activation', mastery: 92, definition: 'Rectified linear unit: returns 0 for negative inputs and x for positive.' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "sub-2",
          name: "Quantum Mechanics & Wave Theory",
          description: "Schrödinger wave equation, Born probability density, and superposition limits.",
          tags: "Physics, Math",
          chapters: [
            {
              id: "chap-2",
              name: "Chapter 1: Wave-Particle Duality",
              topics: [
                {
                  id: "top-2",
                  name: "Schrödinger Probability Equations",
                  materials: [
                    {
                      id: "mat-2",
                      name: "Schrödinger Equations & Superposition Notes.note",
                      type: "note",
                      content: "The Schrödinger wave equation is the foundational law of non-relativistic quantum systems.\n\nThe square magnitude |ψ|² represents Born's spatial probability density of locating a particle in space and time. A quantum system remains in a superposition of eigenstates until an observation triggers wavefunction collapse.",
                      fileSize: "5 KB",
                      transcript: [
                        { time: "06:10", text: "The classical wave equation cannot account for the photoelectric threshold." },
                        { time: "15:20", text: "Born proposed that |ψ|² is not physical matter density, but probability density." },
                        { time: "28:45", text: "Superposition allows simultaneous states until measurement collapses the wave packet." }
                      ],
                      concepts: [
                        { id: 'q1', name: 'Born Interpretation', mastery: 79, definition: 'Equating |ψ|² to particle spatial probability density.' },
                        { id: 'q2', name: 'Wavefunction Collapse', mastery: 52, definition: 'Transition of a quantum state to a single eigenstate upon measurement.' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
      setSubjects(seedData);
      localStorage.setItem('lecturemind_guest_subjects', JSON.stringify(seedData));
    }
  };

  const saveLocalTree = (updatedTree) => {
    setSubjects(updatedTree);
    localStorage.setItem('lecturemind_guest_subjects', JSON.stringify(updatedTree));
  };

  // Drag & Drop Ingestion Handler
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const processUploadedFile = (file) => {
    setUploadProcessing(true);
    setUploadProgress(0);
    setUploadStage("Transcribing media stream…");

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + 15;
        if (next >= 30 && next < 60) setUploadStage("Extracting concept taxonomy…");
        else if (next >= 60 && next < 90) setUploadStage("Building structured notes & flashcards…");
        else if (next >= 90) setUploadStage("Ready");

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProcessing(false);
            addNewLectureMaterialFromFile(file);
            if (onShowToast) onShowToast(`Ingested "${file.name}" into your workspace`, 'success');
          }, 300);
          return 100;
        }
        return next;
      });
    }, 150);
  };

  const addNewLectureMaterialFromFile = (file) => {
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const newMaterial = {
      id: "mat-" + Date.now(),
      name: `${nameWithoutExt}.note`,
      type: file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'note',
      content: `Automated notes generated from ${file.name}.\n\nThis material covers key structural concepts, formulas, and definitions extracted by LectureMind AI.`,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      transcript: [
        { time: "00:30", text: "Introduction to the main lecture theme and syllabus goals." },
        { time: "14:15", text: "Detailed mathematical breakdown of the core principles." },
        { time: "28:50", text: "Summary review and practical diagnostic examples." }
      ],
      concepts: [
        { id: 'nc1', name: nameWithoutExt, mastery: 65, definition: 'Core subject concept extracted from lecture upload.' }
      ]
    };

    if (subjects.length > 0) {
      const updated = [...subjects];
      if (updated[0].chapters && updated[0].chapters[0]?.topics && updated[0].chapters[0].topics[0]) {
        updated[0].chapters[0].topics[0].materials.unshift(newMaterial);
        saveLocalTree(updated);
      }
    }
  };

  // CREATE SUBJECT
  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!subjName) return;
    const newSubj = {
      id: "sub-" + Date.now(),
      name: subjName,
      description: subjDesc,
      tags: subjTags,
      chapters: []
    };
    saveLocalTree([newSubj, ...subjects]);
    setSubjName('');
    setSubjDesc('');
    setSubjTags('');
    setIsAddingSubject(false);
    if (onShowToast) onShowToast('New course subject created', 'success');
  };

  // CREATE CHAPTER
  const handleCreateChapter = (e) => {
    e.preventDefault();
    if (!chapName || !currentSubjectNode) return;
    const newChapter = {
      id: "chap-" + Date.now(),
      name: chapName,
      topics: []
    };
    const updated = subjects.map(s => {
      if (s.id === currentSubjectNode.id) {
        return { ...s, chapters: [...(s.chapters || []), newChapter] };
      }
      return s;
    });
    saveLocalTree(updated);
    setChapName('');
    setIsAddingChapter(false);
    if (onShowToast) onShowToast('Chapter added', 'success');
  };

  // CREATE TOPIC
  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!topName || !currentSubjectNode || !currentChapterNode) return;
    const newTopic = {
      id: "top-" + Date.now(),
      name: topName,
      materials: []
    };
    const updated = subjects.map(s => {
      if (s.id === currentSubjectNode.id) {
        const updatedChapters = (s.chapters || []).map(c => {
          if (c.id === currentChapterNode.id) {
            return { ...c, topics: [...(c.topics || []), newTopic] };
          }
          return c;
        });
        return { ...s, chapters: updatedChapters };
      }
      return s;
    });
    saveLocalTree(updated);
    setTopName('');
    setIsAddingTopic(false);
    if (onShowToast) onShowToast('Topic added', 'success');
  };

  // Refine notes button simulation
  const handleRefineNotes = (action) => {
    setNotesRefinementStatus(action);
    setTimeout(() => {
      if (action === 'concise' && activeMaterial) {
        activeMaterial.content = "Summary: " + activeMaterial.content.split('\n')[0] + "\n\nKey Takeaway: Gradients calculate parameter updates efficiently.";
      }
      setNotesRefinementStatus('');
      if (onShowToast) onShowToast('Notes refined successfully', 'success');
    }, 800);
  };

  // Nav Helpers
  const navigateTo = (item, index) => {
    const newPath = navigationPath.slice(0, index);
    setNavigationPath([...newPath, item]);
  };

  const navigateBack = () => {
    setNavigationPath(navigationPath.slice(0, -1));
  };

  const currentSubjectNode = navigationPath.length > 0 ? subjects.find(s => s.id === navigationPath[0].id) : null;
  const currentChapterNode = navigationPath.length > 1 && currentSubjectNode 
    ? (currentSubjectNode.chapters || []).find(c => c.id === navigationPath[1].id) 
    : null;
  const currentTopicNode = navigationPath.length > 2 && currentChapterNode
    ? (currentChapterNode.topics || []).find(t => t.id === navigationPath[2].id)
    : null;

  return (
    <div className="space-y-6">
      
      {/* TOP PINNED DRAG & DROP UPLOAD ZONE */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all shadow-soft ${
          dragActive 
            ? 'border-violet bg-paper-deep' 
            : 'border-rule bg-card hover:border-violet/60 hover:bg-paper-deep/60'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && processUploadedFile(e.target.files[0])}
          accept=".mp3,.mp4,.pdf,.txt,.md"
        />

        {!uploadProcessing ? (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="p-3 rounded-full bg-paper-deep text-charcoal border border-rule/70 mb-1">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-charcoal">
              Drop lecture recording, textbook PDF, or class notes here
            </span>
            <span className="text-[11px] text-charcoal-soft">
              Supports MP3, MP4, PDF, and Markdown up to 250 MB
            </span>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-2 py-2">
            <div className="flex justify-between text-xs">
              <span className="text-charcoal font-bold">{uploadStage}</span>
              <span className="font-mono text-violet font-bold tabular-nums">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-paper-deep h-2 rounded-full overflow-hidden border border-rule/70">
              <div 
                className="bg-violet h-full rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-xs text-charcoal-soft overflow-x-auto">
          <button 
            onClick={() => setNavigationPath([])}
            className={`font-bold hover:text-coral transition-colors ${navigationPath.length === 0 ? 'text-charcoal font-display text-sm underline decoration-rule decoration-2 underline-offset-4' : 'text-charcoal-soft'}`}
          >
            All Courses
          </button>
          {navigationPath.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-charcoal-soft shrink-0" />
              <button
                onClick={() => navigateTo(item, idx + 1)}
                className={`truncate max-w-[140px] font-semibold hover:text-coral transition-colors ${
                  idx === navigationPath.length - 1 ? 'text-charcoal font-bold' : 'text-charcoal-soft'
                }`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* View Toggle & Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex bg-paper-deep p-1 rounded-full border border-rule">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-card text-charcoal shadow-soft border border-rule/60' : 'text-charcoal-soft hover:text-charcoal'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-card text-charcoal shadow-soft border border-rule/60' : 'text-charcoal-soft hover:text-charcoal'}`}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {navigationPath.length === 0 && (
            <button
              onClick={() => setIsAddingSubject(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-charcoal hover:bg-coral text-paper text-xs font-bold shadow-soft transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Course
            </button>
          )}

          {navigationPath.length === 1 && (
            <button
              onClick={() => setIsAddingChapter(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-charcoal hover:bg-coral text-paper text-xs font-bold shadow-soft transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Add Chapter
            </button>
          )}

          {navigationPath.length === 2 && (
            <button
              onClick={() => setIsAddingTopic(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-charcoal hover:bg-coral text-paper text-xs font-bold shadow-soft transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Topic
            </button>
          )}
        </div>
      </div>

      {/* DIRECTORY BROWSER CONTENTS */}
      <div className="bg-card border border-card-border rounded-lg p-6 sm:p-7 shadow-soft min-h-[380px]">
        
        {/* ROOT: Subjects List / Grid */}
        {navigationPath.length === 0 && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold font-display text-charcoal">Course Subjects</h3>
              <p className="text-xs text-charcoal-soft">Select a course to view chapters, lecture notes, and concept graphs.</p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {subjects.map((s, sIdx) => {
                  const stripeClass = sIdx % 4 === 0 ? 'metric-stripe-violet' :
                                      sIdx % 4 === 1 ? 'metric-stripe-coral' :
                                      sIdx % 4 === 2 ? 'metric-stripe-teal' : 'metric-stripe-gold';
                  const iconColor = sIdx % 4 === 0 ? 'text-violet' :
                                    sIdx % 4 === 1 ? 'text-coral' :
                                    sIdx % 4 === 2 ? 'text-teal' : 'text-[#9A7412]';
                  return (
                    <div
                      key={s.id}
                      onClick={() => setNavigationPath([{ type: 'subject', id: s.id, name: s.name }])}
                      className={`p-5 rounded-md border border-card-border bg-card hover:border-rule hover:shadow-hover transition-all cursor-pointer flex flex-col justify-between min-h-[145px] dog-ear-container group ${stripeClass}`}
                    >
                      {/* Tactile Dog-Ear Corner Bookmark */}
                      <div 
                        className="dog-ear-corner"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onShowToast) onShowToast(`Bookmarked "${s.name}" for spaced recall`, 'success');
                        }}
                        title="Fold corner / save for review"
                      />

                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <Folder className={`w-6 h-6 ${iconColor}`} />
                          <span className="text-[10px] uppercase font-mono text-charcoal-soft font-bold">Course</span>
                        </div>
                        <h4 className="text-xs font-bold text-charcoal mb-1 leading-snug">{s.name}</h4>
                        <p className="text-xs text-charcoal-soft line-clamp-2 leading-relaxed">{s.description}</p>
                      </div>

                      {s.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-4 pt-2 border-t border-rule/60">
                          {s.tags.split(',').map((t, idx) => (
                            <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-paper-deep border border-rule/50 text-charcoal-soft font-semibold">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Compact Table / List View */
              <div className="divide-y divide-rule border border-rule rounded-md overflow-hidden bg-card">
                <div className="grid grid-cols-12 px-4 py-2.5 bg-paper-deep text-[11px] font-bold text-charcoal-soft uppercase font-mono">
                  <div className="col-span-6">Course Subject</div>
                  <div className="col-span-4">Tags</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>
                {subjects.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setNavigationPath([{ type: 'subject', id: s.id, name: s.name }])}
                    className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-paper-deep/50 cursor-pointer text-xs transition-colors"
                  >
                    <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                      <Folder className="w-4 h-4 text-violet shrink-0" />
                      <span className="font-bold text-charcoal truncate">{s.name}</span>
                    </div>
                    <div className="col-span-4 text-charcoal-soft truncate">{s.tags || 'General'}</div>
                    <div className="col-span-2 text-right text-charcoal font-bold hover:text-coral transition-colors">Open →</div>
                  </div>
                ))}
              </div>
            )}

            {subjects.length === 0 && (
              <div className="text-center py-16">
                <Folder className="w-10 h-10 text-charcoal-soft mx-auto mb-2 opacity-50" />
                <p className="text-xs text-charcoal-soft">Nothing here yet. Upload your first lecture and LectureMind will build your knowledge base.</p>
              </div>
            )}
          </div>
        )}

        {/* LEVEL 1: Chapters */}
        {navigationPath.length === 1 && currentSubjectNode && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-charcoal">{currentSubjectNode.name}</h3>
                <p className="text-xs text-charcoal-soft">Chapters and syllabus sections.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentSubjectNode.chapters || []).map(c => (
                <div
                  key={c.id}
                  onClick={() => setNavigationPath([...navigationPath, { type: 'chapter', id: c.id, name: c.name }])}
                  className="p-4 rounded-md border border-card-border bg-card hover:border-rule shadow-soft transition-all cursor-pointer flex items-center gap-3"
                >
                  <FolderOpen className="w-6 h-6 text-violet shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-charcoal truncate">{c.name}</h4>
                    <span className="text-[10px] text-charcoal-soft font-mono">{(c.topics || []).length} Topics</span>
                  </div>
                </div>
              ))}
            </div>

            {(!currentSubjectNode.chapters || currentSubjectNode.chapters.length === 0) && (
              <p className="text-center py-12 text-xs text-charcoal-soft">No chapters created in this course yet.</p>
            )}
          </div>
        )}

        {/* LEVEL 2: Topics */}
        {navigationPath.length === 2 && currentChapterNode && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-charcoal">{currentChapterNode.name}</h3>
                <p className="text-xs text-charcoal-soft">Concept folders and lecture recordings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentChapterNode.topics || []).map(t => (
                <div
                  key={t.id}
                  onClick={() => setNavigationPath([...navigationPath, { type: 'topic', id: t.id, name: t.name }])}
                  className="p-4 rounded-md border border-card-border bg-card hover:border-rule shadow-soft transition-all cursor-pointer flex items-center gap-3"
                >
                  <BookOpen className="w-6 h-6 text-teal shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-charcoal truncate">{t.name}</h4>
                    <span className="text-[10px] text-charcoal-soft font-mono">{(t.materials || []).length} Structured Notes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEVEL 3: Materials & Reader */}
        {navigationPath.length === 3 && currentTopicNode && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold font-display text-charcoal">{currentTopicNode.name}</h3>
                <p className="text-xs text-charcoal-soft">Study notes, transcripts, and concept mappings.</p>
              </div>
            </div>

            <div className="space-y-3">
              {(currentTopicNode.materials || []).map(mat => (
                <div
                  key={mat.id}
                  className="p-4 rounded-md border border-card-border bg-card flex items-center justify-between gap-3 hover:border-rule shadow-soft"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-violet shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-charcoal truncate">{mat.name}</h4>
                      <span className="text-[10px] text-charcoal-soft uppercase font-mono">{mat.type} · {mat.fileSize}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveMaterial(mat)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-paper-deep hover:bg-rule/60 text-xs font-bold text-charcoal transition-colors shrink-0 border border-rule/60"
                  >
                    <Eye className="w-3.5 h-3.5" /> Read Notes & Transcript
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Navigation Bar */}
        {navigationPath.length > 0 && (
          <div className="mt-8 pt-4 border-t border-border-subtle">
            <button
              onClick={navigateBack}
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to previous level
            </button>
          </div>
        )}

      </div>

      {/* READER MODAL: Timestamp-synced transcript + Notes + Concept Map */}
      {activeMaterial && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2A2730]/40 backdrop-blur-sm" onClick={() => setActiveMaterial(null)} />
          
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-card-border rounded-xl shadow-modal flex flex-col overflow-hidden z-10">
            
            {/* Reader Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-rule bg-paper-deep/60">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-violet" />
                <div>
                  <h4 className="text-sm font-bold font-display text-charcoal truncate max-w-md">{activeMaterial.name}</h4>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-soft text-teal font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Grounded in your lecture
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRefineNotes('concise')}
                  disabled={notesRefinementStatus !== ''}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border border-rule bg-card hover:bg-paper-deep text-charcoal transition-colors"
                >
                  {notesRefinementStatus === 'concise' ? 'Refining…' : 'Make concise'}
                </button>
                <button
                  onClick={() => handleRefineNotes('expand')}
                  disabled={notesRefinementStatus !== ''}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border border-rule bg-card hover:bg-paper-deep text-charcoal transition-colors"
                >
                  {notesRefinementStatus === 'expand' ? 'Expanding…' : 'Expand with examples'}
                </button>
                <button
                  onClick={() => setActiveMaterial(null)}
                  className="p-1.5 rounded-full text-charcoal-soft hover:text-charcoal hover:bg-paper-deep transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reader Body Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-rule">
              
              {/* Left Notes Body (7 cols) with AI Ink border & Highlighters */}
              <div className="md:col-span-7 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal uppercase tracking-wider block font-mono">
                    Structured Notes
                  </span>
                  <span className="font-handwriting text-sm text-charcoal-soft">
                    inked from audio recording
                  </span>
                </div>

                {/* Main Note Box with AI pen border */}
                <div className="ink-border-ai text-xs text-charcoal leading-relaxed whitespace-pre-wrap font-sans bg-paper-deep p-4 rounded-md border border-rule space-y-2">
                  <p>
                    <span className="highlighter-mint font-bold">Backpropagation</span> applies the mathematical Chain Rule to compute partial derivatives of the objective Loss with respect to every weight in a deep neural network.
                  </p>
                  <div className="font-mono text-[11px] p-2.5 bg-card rounded border border-rule text-violet font-bold">
                    ∂L/∂w_i = (∂L/∂a) * (∂a/∂z) * (∂z/∂w_i)
                  </div>
                  <p>
                    Signals propagate backwards starting from output predictions down to shallow layers. Activation functions like <span className="highlighter-yellow font-bold">ReLU</span> keep gradient signals steady (derivative = 1 for positive inputs), preventing <span className="wavy-flag font-bold">vanishing gradient</span> decay.
                  </p>
                </div>

                {/* MARGIN AI: Expandable marginalia notes */}
                <div className="p-4 rounded-lg bg-card border border-violet/30 shadow-soft space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5" /> Margin AI Annotation
                    </span>
                    <span className="font-handwriting text-xs text-violet font-bold">
                      tap to review
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-soft leading-relaxed">
                    "Notice that when hidden layers grow past 10+ layers, non-linearities with derivatives &lt; 1 cause exponential decay: 0.25¹⁰ ≈ 9.5 × 10⁻⁷."
                  </p>
                </div>

                {/* Living Concept Map Nodes (Outline Pencil vs Solid Inked) */}
                {activeMaterial.concepts && (
                  <div className="pt-4 border-t border-rule space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">Living Concept Nodes</span>
                        <span className="font-handwriting text-xs text-charcoal-soft">
                          (dashed = sketched in pencil, solid = inked)
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={conceptMapFilter}
                          onChange={(e) => setConceptMapFilter(e.target.value)}
                          placeholder="Filter nodes…"
                          className="px-2.5 py-1 bg-paper-deep border border-rule rounded-md text-[11px] text-charcoal w-32 focus-ring"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {activeMaterial.concepts
                        .filter(c => c.name.toLowerCase().includes(conceptMapFilter.toLowerCase()))
                        .map(c => {
                          const isInked = c.mastery >= 75;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setSelectedConceptNode(c)}
                              className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-soft ${
                                isInked
                                  ? 'bg-card border-2 border-violet text-charcoal font-bold'
                                  : 'bg-card border-2 border-dashed border-rule text-charcoal-soft font-medium'
                              }`}
                            >
                              <Brain className={`w-3.5 h-3.5 ${isInked ? 'text-violet' : 'text-charcoal-soft'}`} />
                              <span>{c.name}</span>
                              <span className={`text-[10px] font-mono font-bold ${isInked ? 'text-violet' : 'text-charcoal-soft'}`}>
                                ({c.mastery}%)
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Timestamp-Synced Transcript (5 cols) */}
              <div className="md:col-span-5 p-6 bg-paper-deep/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet" /> Synced Transcript
                  </span>
                  <span className="font-handwriting text-xs text-charcoal-soft">
                    click timestamp to seek audio
                  </span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {(activeMaterial.transcript || []).map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => setHighlightedTimestamp(t.time)}
                      className={`p-3 rounded-md border transition-colors cursor-pointer text-xs ${
                        highlightedTimestamp === t.time
                          ? 'bg-card border-coral text-charcoal shadow-soft'
                          : 'bg-card border-rule text-charcoal hover:bg-paper-deep'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-violet block mb-0.5">
                        [{t.time}]
                      </span>
                      <p className="leading-snug">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Concept Side Sheet if selected */}
            {selectedConceptNode && (
              <div className="p-4 border-t border-rule bg-card flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-charcoal block">{selectedConceptNode.name}</span>
                  <p className="text-xs text-charcoal-soft">{selectedConceptNode.definition}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-violet tabular-nums bg-violet-soft px-2.5 py-1 rounded-full">
                    {selectedConceptNode.mastery}% Mastery
                  </span>
                  <button
                    onClick={() => {
                      setActiveMaterial(null);
                      window.location.hash = '#/dashboard/flashcards';
                    }}
                    className="px-4 py-1.5 rounded-full bg-charcoal hover:bg-coral text-paper text-xs font-bold transition-colors shadow-soft"
                  >
                    Practice in Review
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2A2730]/25 backdrop-blur-sm" onClick={() => setIsAddingSubject(false)} />
          <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-md p-6 shadow-modal z-10 space-y-4">
            <h3 className="text-base font-bold text-text-primary">Create Course Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  placeholder="e.g. Distributed Systems & OS"
                  className="w-full px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Description</label>
                <textarea
                  value={subjDesc}
                  onChange={(e) => setSubjDesc(e.target.value)}
                  placeholder="Short summary of course topics…"
                  className="w-full px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring h-16 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={subjTags}
                  onChange={(e) => setSubjTags(e.target.value)}
                  placeholder="CS, Concurrency, Exams"
                  className="w-full px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent-primary text-white rounded-sm text-xs font-semibold hover:bg-accent-hover shadow-soft"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CHAPTER MODAL */}
      {isAddingChapter && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2A2730]/25 backdrop-blur-sm" onClick={() => setIsAddingChapter(false)} />
          <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-md p-6 shadow-modal z-10 space-y-4">
            <h3 className="text-base font-bold text-text-primary">Add Syllabus Chapter</h3>
            <form onSubmit={handleCreateChapter} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Chapter Title</label>
                <input
                  type="text"
                  required
                  value={chapName}
                  onChange={(e) => setChapName(e.target.value)}
                  placeholder="e.g. Chapter 2: Concurrency & Synchronization"
                  className="w-full px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddingChapter(false)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent-primary text-white rounded-sm text-xs font-semibold hover:bg-accent-hover shadow-soft"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TOPIC MODAL */}
      {isAddingTopic && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2A2730]/25 backdrop-blur-sm" onClick={() => setIsAddingTopic(false)} />
          <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-md p-6 shadow-modal z-10 space-y-4">
            <h3 className="text-base font-bold text-text-primary">Add Topic Folder</h3>
            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  value={topName}
                  onChange={(e) => setTopName(e.target.value)}
                  placeholder="e.g. Mutexes, Semaphores & Deadlocks"
                  className="w-full px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddingTopic(false)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent-primary text-white rounded-sm text-xs font-semibold hover:bg-accent-hover shadow-soft"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
