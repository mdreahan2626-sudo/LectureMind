import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  FileCode, 
  Image as ImageIcon,
  Plus, 
  FolderOpen, 
  ArrowLeft, 
  Tag, 
  BookOpen, 
  UploadCloud, 
  ChevronRight,
  Eye,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function SubjectExplorer({ currentUser }) {
  const [subjects, setSubjects] = useState([]);
  
  // Browsing Navigation Path State
  // path = [] => main subjects view
  // path = [{type: 'subject', id, name}] => subject view (showing chapters)
  // path = [{type: 'subject', id}, {type: 'chapter', id, name}] => chapter view (showing topics)
  // path = [{type: 'subject', id}, {type: 'chapter', id}, {type: 'topic', id, name}] => topic view (showing materials)
  const [navigationPath, setNavigationPath] = useState([]);
  
  // Form Toggles & Inputs
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjName, setSubjName] = useState('');
  const [subjDesc, setSubjDesc] = useState('');
  const [subjColor, setSubjColor] = useState('from-blue-600 to-indigo-600');
  const [subjTags, setSubjTags] = useState('');

  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [chapName, setChapName] = useState('');

  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [topName, setTopName] = useState('');

  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [matType, setMatType] = useState('note'); // 'note' | 'pdf' | 'ppt' | 'image'
  const [matName, setMatName] = useState('');
  const [matContent, setMatContent] = useState('');
  const [matSize, setMatSize] = useState('1.5 MB');

  // Reader Modal State
  const [activeMaterial, setActiveMaterial] = useState(null);

  // Gradient Color Options for Subjects
  const colorGradients = [
    { name: 'Quantum Blue', value: 'from-blue-600 to-indigo-600' },
    { name: 'Emerald Wave', value: 'from-teal-500 to-emerald-600' },
    { name: 'Solar Flare', value: 'from-orange-500 to-amber-600' },
    { name: 'Aurora Neon', value: 'from-cyan-500 to-blue-500' },
    { name: 'Deep Purple', value: 'from-purple-600 to-indigo-700' }
  ];

  // Fetch or Load Folders Tree
  useEffect(() => {
    fetchSubjectTree();
  }, []);

  const fetchSubjectTree = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/subjects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSubjects(data.subjects);
          return;
        }
      } catch (err) {
        console.error("Failed to load database subjects tree:", err.message);
      }
    }
    loadFallbackLocalTree();
  };

  const loadFallbackLocalTree = () => {
    const local = localStorage.getItem('lecturemind_guest_subjects');
    if (local) {
      setSubjects(JSON.parse(local));
    } else {
      // Seed default subject workspace for Guest Mode
      const seedData = [
        {
          id: "guest-sub-1",
          name: "Deep Learning & Representation Learning",
          description: "Multi-layer Neural Networks, gradient flow calculus, and transformer self-attention.",
          color: "from-blue-600 to-indigo-600",
          tags: "AI, Neural Networks",
          chapters: [
            {
              id: "guest-chap-1",
              name: "Chapter 1: Multi-layer Perceptrons",
              topics: [
                {
                  id: "guest-top-1",
                  name: "Backpropagation Chain Rule",
                  materials: [
                    {
                      id: "guest-mat-1",
                      name: "Chain Rule Derivatives Note",
                      type: "note",
                      content: "Backpropagation utilizes the mathematical Chain Rule to compute partial derivatives of the Loss Function with respect to each weight. \n\nFormula: ∂L/∂W_i = (∂L/∂a) * (∂a/∂z) * (∂z/∂W_i)\n\nThis process propagates errors backwards starting from output layers down to shallow layers.",
                      fileSize: "4 KB"
                    },
                    {
                      id: "guest-mat-2",
                      name: "Backpropagation Lecture Slides.pdf",
                      type: "pdf",
                      fileUrl: "http://localhost:5173/mock-docs/backprop.pdf",
                      fileSize: "3.2 MB"
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

  // CREATE SUBJECT
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjName) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/subjects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: subjName,
            description: subjDesc,
            color: subjColor,
            tags: subjTags
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSubjects([data.subject, ...subjects]);
          resetSubjectForm();
          return;
        }
      } catch (err) {
        console.error("Create subject failed:", err.message);
      }
    }

    // Guest Fallback
    const newSubject = {
      id: "guest-sub-" + Date.now(),
      name: subjName,
      description: subjDesc,
      color: subjColor,
      tags: subjTags,
      chapters: []
    };
    saveLocalTree([newSubject, ...subjects]);
    resetSubjectForm();
  };

  const resetSubjectForm = () => {
    setSubjName('');
    setSubjDesc('');
    setSubjColor('from-blue-600 to-indigo-600');
    setSubjTags('');
    setIsAddingSubject(false);
  };

  // CREATE CHAPTER
  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!chapName) return;
    const currentSubject = navigationPath[0];

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/subjects/${currentSubject.id}/chapters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: chapName })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // Update nested subjects tree in state
          const updatedTree = subjects.map(s => {
            if (s.id === currentSubject.id) {
              return { ...s, chapters: [...(s.chapters || []), data.chapter] };
            }
            return s;
          });
          setSubjects(updatedTree);
          setChapName('');
          setIsAddingChapter(false);
          return;
        }
      } catch (err) {
        console.error("Create chapter failed:", err.message);
      }
    }

    // Guest Fallback
    const newChapter = {
      id: "guest-chap-" + Date.now(),
      name: chapName,
      topics: []
    };
    const updatedTree = subjects.map(s => {
      if (s.id === currentSubject.id) {
        return { ...s, chapters: [...(s.chapters || []), newChapter] };
      }
      return s;
    });
    saveLocalTree(updatedTree);
    setChapName('');
    setIsAddingChapter(false);
  };

  // CREATE TOPIC
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topName) return;
    const currentSubject = navigationPath[0];
    const currentChapter = navigationPath[1];

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/subjects/chapters/${currentChapter.id}/topics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: topName })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const updatedTree = subjects.map(s => {
            if (s.id === currentSubject.id) {
              const updatedChaps = s.chapters.map(c => {
                if (c.id === currentChapter.id) {
                  return { ...c, topics: [...(c.topics || []), data.topic] };
                }
                return c;
              });
              return { ...s, chapters: updatedChaps };
            }
            return s;
          });
          setSubjects(updatedTree);
          setTopName('');
          setIsAddingTopic(false);
          return;
        }
      } catch (err) {
        console.error("Create topic failed:", err.message);
      }
    }

    // Guest Fallback
    const newTopic = {
      id: "guest-top-" + Date.now(),
      name: topName,
      materials: []
    };
    const updatedTree = subjects.map(s => {
      if (s.id === currentSubject.id) {
        const updatedChaps = s.chapters.map(c => {
          if (c.id === currentChapter.id) {
            return { ...c, topics: [...(c.topics || []), newTopic] };
          }
          return c;
        });
        return { ...s, chapters: updatedChaps };
      }
      return s;
    });
    saveLocalTree(updatedTree);
    setTopName('');
    setIsAddingTopic(false);
  };

  // UPLOAD/CREATE MATERIAL
  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    if (!matName) return;
    const currentSubject = navigationPath[0];
    const currentChapter = navigationPath[1];
    const currentTopic = navigationPath[2];

    const payload = {
      name: matName,
      type: matType,
      content: matType === 'note' ? matContent : null,
      fileSize: matType !== 'note' ? matSize : `${Math.round(matContent.length / 100) / 10} KB`
    };

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/subjects/topics/${currentTopic.id}/materials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const updatedTree = subjects.map(s => {
            if (s.id === currentSubject.id) {
              const updatedChaps = s.chapters.map(c => {
                if (c.id === currentChapter.id) {
                  const updatedTops = c.topics.map(t => {
                    if (t.id === currentTopic.id) {
                      return { ...t, materials: [...(t.materials || []), data.material] };
                    }
                    return t;
                  });
                  return { ...c, topics: updatedTops };
                }
                return c;
              });
              return { ...s, chapters: updatedChaps };
            }
            return s;
          });
          setSubjects(updatedTree);
          resetMaterialForm();
          return;
        }
      } catch (err) {
        console.error("Create material failed:", err.message);
      }
    }

    // Guest Fallback
    const newMaterial = {
      id: "guest-mat-" + Date.now(),
      ...payload
    };
    const updatedTree = subjects.map(s => {
      if (s.id === currentSubject.id) {
        const updatedChaps = s.chapters.map(c => {
          if (c.id === currentChapter.id) {
            const updatedTops = c.topics.map(t => {
              if (t.id === currentTopic.id) {
                return { ...t, materials: [...(t.materials || []), newMaterial] };
              }
              return t;
            });
            return { ...c, topics: updatedTops };
          }
          return c;
        });
        return { ...s, chapters: updatedChaps };
      }
      return s;
    });
    saveLocalTree(updatedTree);
    resetMaterialForm();
  };

  const resetMaterialForm = () => {
    setMatName('');
    setMatType('note');
    setMatContent('');
    setMatSize('1.5 MB');
    setIsAddingMaterial(false);
  };

  // Nav Helpers
  const navigateTo = (item, index) => {
    const newPath = navigationPath.slice(0, index);
    setNavigationPath([...newPath, item]);
  };

  const navigateBack = () => {
    setNavigationPath(navigationPath.slice(0, -1));
  };

  // Resolve Active Nodes based on browsing route path
  const currentSubjectNode = navigationPath.length > 0 ? subjects.find(s => s.id === navigationPath[0].id) : null;
  const currentChapterNode = navigationPath.length > 1 && currentSubjectNode 
    ? (currentSubjectNode.chapters || []).find(c => c.id === navigationPath[1].id) 
    : null;
  const currentTopicNode = navigationPath.length > 2 && currentChapterNode
    ? (currentChapterNode.topics || []).find(t => t.id === navigationPath[2].id)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pb-10">
      
      {/* LEFT SIDEBAR: Subjects Menu (Width: 3 Columns) */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        <div className="glass-panel p-5 rounded-3xl">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-900">
            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest">My Courses</h4>
            <button 
              onClick={() => setIsAddingSubject(true)}
              className="p-1 rounded-lg bg-blue-950/60 border border-blue-900/30 text-blue-400 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {subjects.map(s => (
              <button 
                key={s.id}
                onClick={() => setNavigationPath([{ type: 'subject', id: s.id, name: s.name }])}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  navigationPath[0]?.id === s.id 
                    ? 'bg-blue-950/40 border-blue-500/30 text-white' 
                    : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="min-w-0">
                  <span className="font-bold text-xs truncate block">{s.name}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 truncate">{s.description || 'No description'}</span>
                </div>
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0 ml-2" />
              </button>
            ))}

            {subjects.length === 0 && (
              <div className="text-center py-6">
                <p className="text-slate-500 text-xs">No subjects created yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN PANEL: Navigation & Folders browser (Width: 9 Columns) */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* Nav breadcrumb path */}
        <div className="glass-panel py-3 px-5 rounded-2xl flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <button 
            onClick={() => setNavigationPath([])}
            className="hover:text-white font-bold transition-colors"
          >
            Subjects
          </button>

          {navigationPath.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-650" />
              <button 
                onClick={() => navigateTo(item, idx + 1)}
                className={`hover:text-white font-semibold transition-colors truncate max-w-[150px] ${
                  idx === navigationPath.length - 1 ? 'text-blue-400 font-bold' : ''
                }`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Dynamic Folder Grid View */}
        <div className="glass-panel p-6.5 rounded-3xl min-h-[380px] flex flex-col justify-between">
          
          {/* FOLDER CONTENTS */}
          <div>
            {/* View 1: Main Subjects Grid (Root Path) */}
            {navigationPath.length === 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Subject Folders</h3>
                    <p className="text-slate-500 text-xs">Select a course subject folder to browse material.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingSubject(true)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-950/20 border border-blue-900/30 px-3.5 py-1.5 rounded-xl hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Subject
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subjects.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setNavigationPath([{ type: 'subject', id: s.id, name: s.name }])}
                      className="group cursor-pointer rounded-2xl border border-slate-900 p-5 bg-slate-900/10 hover:border-slate-800 transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden"
                    >
                      <div className={`absolute -right-6 -bottom-6 w-20 h-20 bg-gradient-to-br ${s.color} opacity-5 filter blur-xl rounded-full`}></div>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <Folder className="w-8 h-8 text-blue-400" />
                          <FolderOpen className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors leading-tight mb-1">
                          {s.name}
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                          {s.description || 'No description added yet.'}
                        </p>
                      </div>
                      
                      {/* Tag capsules */}
                      {s.tags && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {s.tags.split(',').map((t, idx) => (
                            <span key={idx} className="text-[9px] font-bold uppercase bg-slate-950 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {subjects.length === 0 && (
                    <div className="col-span-full text-center py-20">
                      <Folder className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm font-semibold">Your Subject Manager is Empty</p>
                      <p className="text-slate-500 text-xs mt-1">Create your first subject folder to begin organizing.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View 2: Chapters List (Selected Subject Path) */}
            {navigationPath.length === 1 && currentSubjectNode && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{currentSubjectNode.name}</h3>
                    <p className="text-slate-500 text-xs">Browse course chapters and curriculum sections.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingChapter(true)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-950/20 border border-blue-900/30 px-3.5 py-1.5 rounded-xl hover:text-white transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Add Chapter
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(currentSubjectNode.chapters || []).map(c => (
                    <div 
                      key={c.id}
                      onClick={() => setNavigationPath([
                        navigationPath[0],
                        { type: 'chapter', id: c.id, name: c.name }
                      ])}
                      className="group cursor-pointer rounded-2xl border border-slate-900 p-4.5 bg-slate-900/10 hover:border-slate-800 transition-all flex items-center gap-4.5"
                    >
                      <Folder className="w-10 h-10 text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-blue-400 transition-colors leading-tight mb-1 truncate">
                          {c.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">
                          {(c.topics || []).length} Topics Inside
                        </span>
                      </div>
                    </div>
                  ))}

                  {(!currentSubjectNode.chapters || currentSubjectNode.chapters.length === 0) && (
                    <div className="col-span-full text-center py-20">
                      <Folder className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm font-semibold">No Chapters Created</p>
                      <p className="text-slate-500 text-xs mt-1">Add folders representing syllabus chapters (e.g. Chapter 1: Foundations).</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View 3: Topics List (Selected Chapter Path) */}
            {navigationPath.length === 2 && currentChapterNode && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{currentChapterNode.name}</h3>
                    <p className="text-slate-500 text-xs">Browse study topics and concepts details.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingTopic(true)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-950/20 border border-blue-900/30 px-3.5 py-1.5 rounded-xl hover:text-white transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Add Topic
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(currentChapterNode.topics || []).map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setNavigationPath([
                        navigationPath[0],
                        navigationPath[1],
                        { type: 'topic', id: t.id, name: t.name }
                      ])}
                      className="group cursor-pointer rounded-2xl border border-slate-900 p-4.5 bg-slate-900/10 hover:border-slate-800 transition-all flex items-center gap-4.5"
                    >
                      <FolderOpen className="w-10 h-10 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-blue-400 transition-colors leading-tight mb-1 truncate">
                          {t.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">
                          {(t.materials || []).length} Study Packs
                        </span>
                      </div>
                    </div>
                  ))}

                  {(!currentChapterNode.topics || currentChapterNode.topics.length === 0) && (
                    <div className="col-span-full text-center py-20">
                      <FolderOpen className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm font-semibold">No Topics Created</p>
                      <p className="text-slate-500 text-xs mt-1">Create concept folder nodes inside this chapter (e.g. Backpropagation rule).</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View 4: Materials List (Selected Topic Path) */}
            {navigationPath.length === 3 && currentTopicNode && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{currentTopicNode.name}</h3>
                    <p className="text-slate-500 text-xs">Review study notes and uploaded PDF/PPT documents.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingMaterial(true)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-950/20 border border-blue-900/30 px-3.5 py-1.5 rounded-xl hover:text-white transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload / Add Notes
                  </button>
                </div>

                <div className="space-y-3">
                  {(currentTopicNode.materials || []).map(mat => (
                    <div 
                      key={mat.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/20 border border-slate-900 hover:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* File icons based on type */}
                        {mat.type === 'note' && <FileText className="w-9 h-9 text-blue-400 shrink-0" />}
                        {mat.type === 'pdf' && <FileCode className="w-9 h-9 text-rose-500 shrink-0" />}
                        {mat.type === 'ppt' && <FileCode className="w-9 h-9 text-orange-400 shrink-0" />}
                        {mat.type === 'image' && <ImageIcon className="w-9 h-9 text-emerald-400 shrink-0" />}

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-200 truncate">{mat.name}</h4>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">
                            {mat.type} &bull; {mat.fileSize || 'Unknown Size'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* View Button */}
                        <button 
                          onClick={() => setActiveMaterial(mat)}
                          className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 text-slate-450 hover:text-white hover:bg-slate-900 transition-all flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!currentTopicNode.materials || currentTopicNode.materials.length === 0) && (
                    <div className="text-center py-20 border border-dashed border-slate-900 rounded-3xl">
                      <UploadCloud className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm font-semibold">Study folder is Empty</p>
                      <p className="text-slate-500 text-xs mt-1">Upload lecture notes, PDFs, PPTs, or write summary summaries.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BACK NAVIGATION */}
          {navigationPath.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-900">
              <button 
                onClick={navigateBack}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to previous folder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Add Subject */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={resetSubjectForm}></div>
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-900 p-8 rounded-3xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6">Create Course Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Subject Name</label>
                <input 
                  type="text" 
                  required
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  placeholder="e.g. Advanced AI & Deep Learning"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <textarea 
                  value={subjDesc}
                  onChange={(e) => setSubjDesc(e.target.value)}
                  placeholder="A short description of course coverage..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sm text-slate-200 focus:outline-none focus:border-blue-500 h-20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Tags (comma-separated)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={subjTags}
                    onChange={(e) => setSubjTags(e.target.value)}
                    placeholder="AI, Calculus, Midterm"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Accent Color Palette Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Subject Folder Color</label>
                <div className="grid grid-cols-2 gap-2">
                  {colorGradients.map((g, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSubjColor(g.value)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                        subjColor === g.value 
                          ? 'border-blue-500 bg-blue-950/20 text-white' 
                          : 'border-slate-900 bg-slate-900/30 text-slate-400'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${g.value}`}></div>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-900">
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Create Folder
                </button>
                <button 
                  type="button" 
                  onClick={resetSubjectForm}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-900 hover:bg-slate-850 transition-colors border border-slate-850"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Chapter */}
      {isAddingChapter && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddingChapter(false)}></div>
          <div className="relative w-full max-w-sm bg-slate-950 border border-slate-900 p-8 rounded-3xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6">Add Chapter Folder</h3>
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Chapter Title</label>
                <input 
                  type="text" 
                  required
                  value={chapName}
                  onChange={(e) => setChapName(e.target.value)}
                  placeholder="e.g. Chapter 2: Convolutional Networks"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors">Create</button>
                <button type="button" onClick={() => setIsAddingChapter(false)} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-xl text-xs font-bold transition-colors border border-slate-850">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Topic */}
      {isAddingTopic && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddingTopic(false)}></div>
          <div className="relative w-full max-w-sm bg-slate-950 border border-slate-900 p-8 rounded-3xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6">Add Topic Folder</h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Topic Title</label>
                <input 
                  type="text" 
                  required
                  value={topName}
                  onChange={(e) => setTopName(e.target.value)}
                  placeholder="e.g. Backpropagation Calculus"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors">Create</button>
                <button type="button" onClick={() => setIsAddingTopic(false)} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-xl text-xs font-bold transition-colors border border-slate-850">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Upload / Add Materials */}
      {isAddingMaterial && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={resetMaterialForm}></div>
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-900 p-8 rounded-3xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-5">Upload / Create Study Material</h3>
            
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Material Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'note', name: 'Note' },
                    { value: 'pdf', name: 'PDF' },
                    { value: 'ppt', name: 'PPT' },
                    { value: 'image', name: 'Image' }
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setMatType(t.value);
                        setMatName(t.value === 'note' ? '' : `Document.${t.value}`);
                      }}
                      className={`py-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                        matType === t.value 
                          ? 'border-blue-500 bg-blue-950/20 text-white' 
                          : 'border-slate-900 bg-slate-900/30 text-slate-400'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Material Name / Title</label>
                <input 
                  type="text" 
                  required
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  placeholder={matType === 'note' ? 'e.g. Midterm summary notes' : `e.g. ChapterSlides.${matType}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Note Content Editor (Only for Text Note type) */}
              {matType === 'note' ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Compose Study Note Content</label>
                  <textarea 
                    required
                    value={matContent}
                    onChange={(e) => setMatContent(e.target.value)}
                    placeholder="Write or paste your summary notes, formulas, or concepts outlines here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sm text-slate-200 focus:outline-none focus:border-blue-500 h-36 resize-none"
                  />
                </div>
              ) : (
                /* File mock inputs (For attachments) */
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">File Size Estimate</label>
                    <input 
                      type="text" 
                      value={matSize}
                      onChange={(e) => setMatSize(e.target.value)}
                      placeholder="e.g. 2.4 MB"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 text-center flex items-center justify-center gap-1.5 text-xs text-blue-400 font-semibold border-dashed cursor-pointer hover:bg-slate-900 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      Mock Attach File
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-900">
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
                  {matType === 'note' ? 'Save Note' : 'Simulate Upload'}
                </button>
                <button type="button" onClick={resetMaterialForm} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-xl text-xs font-bold transition-colors border border-slate-850">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Material Detail Viewer (Reading Modal) */}
      {activeMaterial && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveMaterial(null)}></div>
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-900 p-8 rounded-3xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col justify-between overflow-hidden">
            
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-5">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate pr-6">{activeMaterial.name}</h3>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">
                    Category: {activeMaterial.type} &bull; {activeMaterial.fileSize || '1.5 MB'}
                  </span>
                </div>
                <button 
                  onClick={() => setActiveMaterial(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewer Content */}
              <div className="overflow-y-auto max-h-[45vh] pr-2 text-sm text-slate-350 leading-relaxed font-normal">
                {activeMaterial.type === 'note' ? (
                  <p className="whitespace-pre-line bg-slate-900/30 border border-slate-900 p-5 rounded-2xl">
                    {activeMaterial.content || 'This note contains no body text.'}
                  </p>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <p className="font-bold text-white mb-1">Attached {activeMaterial.type.toUpperCase()} Document</p>
                    <p className="text-slate-500 text-xs px-6 max-w-sm mx-auto leading-relaxed">
                      This represents an uploaded {activeMaterial.type.toUpperCase()} file ({activeMaterial.fileSize || '2.4 MB'}). During production, this asset launches in an embedded document viewer or opens a local download link.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-900 text-right">
              <button 
                onClick={() => setActiveMaterial(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-300 font-bold rounded-xl text-xs transition-all"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
