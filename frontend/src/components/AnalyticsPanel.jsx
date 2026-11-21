import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  BookOpenCheck,
  RotateCcw
} from 'lucide-react';

export default function AnalyticsPanel({ studiedToday, weeklyHours, weeklyGoal }) {
  const [reportType, setReportType] = useState('weekly');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedSpineDay, setSelectedSpineDay] = useState(null);

  const storedSubjects = (() => {
    try {
      const raw = localStorage.getItem('lecturemind_guest_subjects');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  // The Knowledge Spine Data (Sequential Daily Academic Log Entries)
  const spineEntries = storedSubjects.length > 0
    ? storedSubjects.map((s, idx) => ({
        day: ["Mon", "Sun", "Sat", "Fri", "Thu"][idx % 5],
        date: "Recent Study",
        intensity: "high",
        hours: 3.5,
        topic: s.name,
        masteryGain: "+7%"
      }))
    : [
        { day: "Today", date: "Active", intensity: "med", hours: 2.0, topic: "Extracted Lecture Review", masteryGain: "+5%" }
      ];

  // Heatmap Data (Last 5 weeks)
  const heatmapData = [
    { day: "Mon", date: "June 1", hours: 2.4, color: "bg-[#7FCBAE]" },
    { day: "Tue", date: "June 2", hours: 0, color: "bg-bg-subtle" },
    { day: "Wed", date: "June 3", hours: 1.5, color: "bg-[#EDF8F3]" },
    { day: "Thu", date: "June 4", hours: 4.2, color: "bg-[#6FBF9A]" },
    { day: "Fri", date: "June 5", hours: 3.0, color: "bg-[#7FCBAE]" },
    { day: "Sat", date: "June 6", hours: 0.8, color: "bg-[#EDF8F3]" },
    { day: "Sun", date: "June 7", hours: 2.1, color: "bg-[#7FCBAE]" },

    { day: "Mon", date: "June 8", hours: 3.5, color: "bg-[#6FBF9A]" },
    { day: "Tue", date: "June 9", hours: 1.2, color: "bg-[#EDF8F3]" },
    { day: "Wed", date: "June 10", hours: 0, color: "bg-bg-subtle" },
    { day: "Thu", date: "June 11", hours: 5.0, color: "bg-[#6FBF9A]" },
    { day: "Fri", date: "June 12", hours: 2.8, color: "bg-[#7FCBAE]" },
    { day: "Sat", date: "June 13", hours: 1.1, color: "bg-[#EDF8F3]" },
    { day: "Sun", date: "June 14", hours: 0, color: "bg-bg-subtle" },

    { day: "Mon", date: "June 15", hours: 1.8, color: "bg-[#EDF8F3]" },
    { day: "Tue", date: "June 16", hours: 2.2, color: "bg-[#7FCBAE]" },
    { day: "Wed", date: "June 17", hours: 3.6, color: "bg-[#6FBF9A]" },
    { day: "Thu", date: "June 18", hours: 0.5, color: "bg-[#EDF8F3]" },
    { day: "Fri", date: "June 19", hours: 4.5, color: "bg-[#6FBF9A]" },
    { day: "Sat", date: "June 20", hours: 2.0, color: "bg-[#7FCBAE]" },
    { day: "Sun", date: "June 21", hours: 1.5, color: "bg-[#EDF8F3]" },

    { day: "Mon", date: "June 22", hours: 0, color: "bg-bg-subtle" },
    { day: "Tue", date: "June 23", hours: 3.1, color: "bg-[#7FCBAE]" },
    { day: "Wed", date: "June 24", hours: 4.8, color: "bg-[#6FBF9A]" },
    { day: "Thu", date: "June 25", hours: 1.5, color: "bg-[#EDF8F3]" },
    { day: "Fri", date: "June 26", hours: 2.9, color: "bg-[#7FCBAE]" },
    { day: "Sat", date: "June 27", hours: 0.9, color: "bg-[#EDF8F3]" },
    { day: "Sun", date: "June 28", hours: 3.2, color: "bg-[#7FCBAE]" },

    { day: "Mon", date: "June 29", hours: studiedToday > 0 ? studiedToday : 2.4, color: "bg-[#6FBF9A]" },
    { day: "Tue", date: "June 30", hours: 0, color: "bg-bg-subtle" },
    { day: "Wed", date: "July 1", hours: 1.2, color: "bg-[#EDF8F3]" },
    { day: "Thu", date: "July 2", hours: 3.5, color: "bg-[#7FCBAE]" },
    { day: "Fri", date: "July 3", hours: 2.1, color: "bg-[#7FCBAE]" },
    { day: "Sat", date: "July 4", hours: 0, color: "bg-bg-subtle" },
    { day: "Sun", date: "July 5", hours: 1.8, color: "bg-[#EDF8F3]" }
  ];

  // Performance Trend Data Points
  const lineData = [
    { quiz: "Quiz 1", score: 65, x: 30, y: 110 },
    { quiz: "Quiz 2", score: 70, x: 105, y: 98 },
    { quiz: "Quiz 3", score: 68, x: 180, y: 102 },
    { quiz: "Quiz 4", score: 80, x: 255, y: 72 },
    { quiz: "Quiz 5", score: 87, x: 330, y: 52 },
    { quiz: "Quiz 6", score: 92, x: 405, y: 38 }
  ];

  // Subject accuracy horizontal bars
  const topicAccuracies = [
    { topic: "Multi-layer Perceptrons & Backpropagation", accuracy: 92 },
    { topic: "Schrödinger Probability Equations", accuracy: 79 },
    { topic: "Real & Nominal GDP Inflation Deflators", accuracy: 90 },
    { topic: "Quantum Tunneling & Wave Superposition", accuracy: 52 },
    { topic: "Central Bank Monetary Discount Rates", accuracy: 61 }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Revision Completion", value: "92%", detail: "24 of 26 topics reviewed", icon: CheckCircle2, note: "inked" },
          { title: "Flashcard Retention", value: "84%", detail: "SM-2 active recall probability", icon: Zap, note: "solid" },
          { title: "Quiz Improvement", value: "+12.4%", detail: "Compared to previous month", icon: TrendingUp, note: "velocity" },
          { title: "Study Hours Logged", value: `${weeklyHours.toFixed(1)} hrs`, detail: `Goal: ${weeklyGoal} hours`, icon: Clock, note: "on track" }
        ].map((m, idx) => (
          <div key={idx} className="bg-surface border border-border-subtle rounded-md p-5 shadow-soft flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold font-mono">{m.title}</span>
              <m.icon className="w-4 h-4 text-accent-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-display text-text-primary tabular-nums">{m.value}</span>
                <span className="font-handwriting text-sm text-accent-primary transform -rotate-2">
                  {m.note}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{m.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. THE KNOWLEDGE SPINE & HEATMAP (Section 5.1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* THE KNOWLEDGE SPINE (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-border-subtle rounded-md p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold font-display text-text-primary flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-accent-primary" />
                The Knowledge Spine
              </h3>
              <span className="text-[11px] text-text-muted">Personal bullet-journal study spine</span>
            </div>
            <span className="font-handwriting text-sm text-ink-muted">
              daily ink log
            </span>
          </div>

          {/* Vertical Spine Ticks */}
          <div className="relative pl-6 border-l-2 border-dashed border-accent-primary/40 space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {spineEntries.map((entry, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedSpineDay(entry)}
                className={`relative p-2.5 rounded-sm border cursor-pointer transition-all ${
                  selectedSpineDay?.date === entry.date
                    ? 'bg-surface-tint border-accent-primary shadow-soft'
                    : 'bg-surface border-border-subtle hover:bg-bg-subtle/50'
                }`}
              >
                {/* Spine Ink Node */}
                <div className={`absolute -left-[31px] top-3.5 w-3 h-3 rounded-full border-2 border-surface ${
                  entry.intensity === 'high' ? 'bg-accent-primary' : entry.intensity === 'med' ? 'bg-accent-mint' : 'bg-accent-yellow'
                }`} />

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-text-primary">{entry.day}, {entry.date}</span>
                  <span className="font-mono text-accent-primary text-[10px] font-semibold">{entry.masteryGain}</span>
                </div>
                <p className="text-[11px] text-text-secondary truncate mt-0.5">{entry.topic}</p>
                <span className="text-[10px] text-text-muted font-mono">{entry.hours} hrs logged</span>
              </div>
            ))}
          </div>
        </div>

        {/* HEATMAP CONSISTENCY (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-border-subtle rounded-md p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold font-display text-text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-success" />
                Study Consistency Heatmap
              </h3>
              <span className="text-[11px] text-text-muted">Recorded study intervals over the last 5 weeks</span>
            </div>
            {hoveredCell ? (
              <span className="text-xs font-semibold text-text-primary">
                {hoveredCell.date}: <strong className="text-success">{hoveredCell.hours} hrs</strong>
              </span>
            ) : (
              <span className="font-handwriting text-sm text-text-muted">35 days logged</span>
            )}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-flow-col grid-rows-7 gap-2 overflow-x-auto pb-1 max-w-lg">
            {heatmapData.map((cell, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
                className={`w-6 h-6 rounded-sm cursor-pointer transition-transform hover:scale-110 border border-border-subtle/50 ${cell.color}`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-text-muted pt-3 border-t border-border-subtle">
            <span>Less study</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-3 h-3 rounded-sm bg-bg-subtle border border-border-subtle"></div>
              <div className="w-3 h-3 rounded-sm bg-[#EDF8F3]"></div>
              <div className="w-3 h-3 rounded-sm bg-[#7FCBAE]"></div>
              <div className="w-3 h-3 rounded-sm bg-[#6FBF9A]"></div>
            </div>
            <span>More study</span>
          </div>
        </div>

      </div>

      {/* 3. STICKY-NOTE WEAK CONCEPTS & MASTERY CURVE (Section 5.6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* STICKY NOTE WEAK CONCEPTS (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-border-subtle rounded-md p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold font-display text-text-primary flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-danger" />
                Attention Sticky Notes
              </h3>
              <span className="text-[11px] text-text-muted">Weak concepts flagged for practice</span>
            </div>
            <span className="font-handwriting text-sm text-[#E0725C]">
              flip to review
            </span>
          </div>

          {/* Tilted Sticky Notes */}
          <div className="space-y-4 pt-1">
            
            {/* Sticky 1 */}
            <div className="sticky-note-coral p-4 rounded-md space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-bold text-danger uppercase">{storedSubjects[0]?.name || 'Uploaded Material'} · 42%</span>
                <span className="font-handwriting text-xs text-danger">needs drill</span>
              </div>
              <p className="text-xs font-bold text-text-primary leading-snug">
                {storedSubjects[0]?.name ? `${storedSubjects[0].name} — Core Concepts & Diagnostic Checks` : 'Upload your first PDF to generate active recall targets'}
              </p>
              <button
                onClick={() => window.location.hash = '#/dashboard/flashcards'}
                className="w-full py-1.5 bg-danger text-white rounded text-[11px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
              >
                Practice in Review <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Sticky 2 */}
            <div className="sticky-note-warm p-4 rounded-md space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-bold text-[#977319] uppercase">{storedSubjects[1]?.name || 'Secondary Review'} · 65%</span>
                <span className="font-handwriting text-xs text-[#977319]">in progress</span>
              </div>
              <p className="text-xs font-bold text-text-primary leading-snug">
                {storedSubjects[1]?.name ? `${storedSubjects[1].name} — Concept Hierarchy` : 'Key formulas and step-by-step solutions'}
              </p>
              <button
                onClick={() => window.location.hash = '#/dashboard/flashcards'}
                className="w-full py-1.5 bg-[#977319] text-white rounded text-[11px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
              >
                Practice in Review <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>

        {/* SVG LINE TREND CHART (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-border-subtle rounded-md p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold font-display text-text-primary flex items-center gap-2">
                <Award className="w-4 h-4 text-accent-primary" />
                Mastery Over Time
              </h3>
              <span className="text-[11px] text-text-muted">Sequential quiz accuracy curve</span>
            </div>
            {hoveredNode && (
              <span className="text-xs font-semibold text-accent-primary font-mono">
                {hoveredNode.quiz}: {hoveredNode.score}%
              </span>
            )}
          </div>

          <div className="pt-2">
            <svg viewBox="0 0 440 150" className="w-full h-auto overflow-visible">
              <line x1="20" y1="110" x2="420" y2="110" stroke="#E9E4F0" strokeWidth="1" />
              <line x1="20" y1="75" x2="420" y2="75" stroke="#E9E4F0" strokeWidth="1" />
              <line x1="20" y1="40" x2="420" y2="40" stroke="#E9E4F0" strokeWidth="1" />

              <text x="15" y="113" fill="#9E9AA7" fontSize="8" textAnchor="end">60%</text>
              <text x="15" y="78" fill="#9E9AA7" fontSize="8" textAnchor="end">80%</text>
              <text x="15" y="43" fill="#9E9AA7" fontSize="8" textAnchor="end">100%</text>

              <path 
                d="M 30 110 C 65 102, 105 98, 180 102 S 255 72, 330 52 S 385 42, 405 38" 
                fill="none" 
                stroke="#8C7CF0" 
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {lineData.map((node, idx) => (
                <circle 
                  key={idx}
                  cx={node.x}
                  cy={node.y}
                  r={hoveredNode?.quiz === node.quiz ? "5" : "3.5"}
                  fill="#FFFFFF"
                  stroke="#8C7CF0"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              ))}

              {lineData.map((node, idx) => (
                <text key={idx} x={node.x} y="135" fill="#9E9AA7" fontSize="8" textAnchor="middle">{node.quiz}</text>
              ))}
            </svg>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-text-secondary border-t border-border-subtle">
            <span>Average Improvement: <strong className="text-accent-primary">+12.4%</strong></span>
            <span className="font-handwriting text-sm text-text-muted">steady curve</span>
          </div>
        </div>

      </div>

    </div>
  );
}
