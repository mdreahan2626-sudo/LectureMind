import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  HelpCircle,
  FileText
} from 'lucide-react';

export default function AnalyticsPanel({ studiedToday, weeklyHours, weeklyGoal }) {
  const [reportType, setReportType] = useState('weekly'); // 'weekly' | 'monthly'
  const [hoveredCell, setHoveredCell] = useState(null); // Heatmap tooltip state
  const [hoveredWedge, setHoveredWedge] = useState(null); // Pie chart tooltip state
  const [hoveredNode, setHoveredNode] = useState(null); // Line chart tooltip state

  // Heatmap Mock Data (Last 5 weeks study grid)
  const heatmapData = [
    { day: "Mon", date: "June 1", hours: 2.4, color: "bg-emerald-900/50" },
    { day: "Tue", date: "June 2", hours: 0, color: "bg-slate-900/40" },
    { day: "Wed", date: "June 3", hours: 1.5, color: "bg-emerald-950/40" },
    { day: "Thu", date: "June 4", hours: 4.2, color: "bg-emerald-500/80" },
    { day: "Fri", date: "June 5", hours: 3.0, color: "bg-emerald-700/60" },
    { day: "Sat", date: "June 6", hours: 0.8, color: "bg-emerald-950/30" },
    { day: "Sun", date: "June 7", hours: 2.1, color: "bg-emerald-900/45" },

    { day: "Mon", date: "June 8", hours: 3.5, color: "bg-emerald-700/60" },
    { day: "Tue", date: "June 9", hours: 1.2, color: "bg-emerald-950/45" },
    { day: "Wed", date: "June 10", hours: 0, color: "bg-slate-900/40" },
    { day: "Thu", date: "June 11", hours: 5.0, color: "bg-emerald-500/90" },
    { day: "Fri", date: "June 12", hours: 2.8, color: "bg-emerald-800/60" },
    { day: "Sat", date: "June 13", hours: 1.1, color: "bg-emerald-950/30" },
    { day: "Sun", date: "June 14", hours: 0, color: "bg-slate-900/40" },

    { day: "Mon", date: "June 15", hours: 1.8, color: "bg-emerald-950/40" },
    { day: "Tue", date: "June 16", hours: 2.2, color: "bg-emerald-900/50" },
    { day: "Wed", date: "June 17", hours: 3.6, color: "bg-emerald-700/60" },
    { day: "Thu", date: "June 18", hours: 0.5, color: "bg-emerald-950/20" },
    { day: "Fri", date: "June 19", hours: 4.5, color: "bg-emerald-500/80" },
    { day: "Sat", date: "June 20", hours: 2.0, color: "bg-emerald-900/40" },
    { day: "Sun", date: "June 21", hours: 1.5, color: "bg-emerald-950/40" },

    { day: "Mon", date: "June 22", hours: 0, color: "bg-slate-900/40" },
    { day: "Tue", date: "June 23", hours: 3.1, color: "bg-emerald-700/60" },
    { day: "Wed", date: "June 24", hours: 4.8, color: "bg-emerald-500/90" },
    { day: "Thu", date: "June 25", hours: 1.5, color: "bg-emerald-950/40" },
    { day: "Fri", date: "June 26", hours: 2.9, color: "bg-emerald-800/60" },
    { day: "Sat", date: "June 27", hours: 0.9, color: "bg-emerald-950/30" },
    { day: "Sun", date: "June 28", hours: 3.2, color: "bg-emerald-700/60" },

    { day: "Mon", date: "June 29", hours: studiedToday > 0 ? studiedToday : 2.4, color: studiedToday > 0 ? "bg-emerald-600/70" : "bg-emerald-900/50" },
    { day: "Tue", date: "June 30", hours: 0, color: "bg-slate-900/40" },
    { day: "Wed", date: "July 1", hours: 1.2, color: "bg-emerald-950/30" },
    { day: "Thu", date: "July 2", hours: 3.5, color: "bg-emerald-700/60" },
    { day: "Fri", date: "July 3", hours: 2.1, color: "bg-emerald-900/45" },
    { day: "Sat", date: "July 4", hours: 0, color: "bg-slate-900/40" },
    { day: "Sun", date: "July 5", hours: 1.8, color: "bg-emerald-950/40" }
  ];

  // Pie chart mock data (Subject hours share)
  const pieData = [
    { id: 0, name: "Deep Learning", percentage: 45, color: "#3b82f6", dashArray: "141.37 314.16", offset: "0", hours: "15.5 hrs" },
    { id: 1, name: "Quantum Mechanics", percentage: 35, color: "#06b6d4", dashArray: "109.95 314.16", offset: "-141.37", hours: "12.2 hrs" },
    { id: 2, name: "Macroeconomics", percentage: 20, color: "#6366f1", dashArray: "62.83 314.16", offset: "-251.32", hours: "6.8 hrs" }
  ];

  // Line Chart mock data (Quiz accuracy updates)
  const lineData = [
    { quiz: "Quiz 1", score: 65, x: 20, y: 120 },
    { quiz: "Quiz 2", score: 70, x: 100, y: 105 },
    { quiz: "Quiz 3", score: 68, x: 180, y: 111 },
    { quiz: "Quiz 4", score: 80, x: 260, y: 75 },
    { quiz: "Quiz 5", score: 87, x: 340, y: 54 },
    { quiz: "Quiz 6", score: 92, x: 420, y: 39 }
  ];

  const fadeInUp = {
    initial: { y: 25, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. KEY ANALYTICS METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Revision Completion", value: "92%", detail: "24 of 26 topics reviewed", color: "text-blue-400", icon: CheckCircle2 },
          { title: "Flashcard Retention", value: "84%", detail: "Active recall success probability", color: "text-cyan-400", icon: Zap },
          { title: "Quiz Improvement", value: "+12.4%", detail: "Compared to previous month", color: "text-emerald-400", icon: TrendingUp },
          { title: "Study Hours logged", value: `${weeklyHours.toFixed(1)} hrs`, detail: `Goal: ${weeklyGoal} hours`, color: "text-indigo-400", icon: Clock }
        ].map((m, idx) => (
          <motion.div 
            key={idx} 
            {...fadeInUp} 
            transition={{ delay: idx * 0.1 }}
            className="glass-panel rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">{m.title}</span>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white">{m.value}</span>
              <p className="text-slate-500 text-[10px] mt-1.5">{m.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. CHARTS BOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* HEATMAP: Study Consistency (Width: 7 Columns) */}
        <motion.div {...fadeInUp} className="lg:col-span-7 glass-panel rounded-3xl p-6.5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Study Consistency Heatmap
                </h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mt-0.5">Logged hours calendar log</span>
              </div>
            </div>

            {/* Heatmap Tooltip Details */}
            <div className="min-h-[22px] mb-3 text-xs">
              {hoveredCell ? (
                <span className="text-emerald-400 font-semibold animate-in fade-in duration-200">
                  {hoveredCell.date}: <span className="text-white font-extrabold">{hoveredCell.hours} hours</span> studied
                </span>
              ) : (
                <span className="text-slate-550">Hover over calendar grid cells to see details.</span>
              )}
            </div>

            {/* Heatmap calendar grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-2.5 max-w-lg overflow-x-auto pb-2 pr-1 select-none">
              {heatmapData.map((cell, idx) => (
                <div 
                  key={idx}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`w-6.5 h-6.5 rounded-md cursor-pointer transition-all hover:scale-110 hover:shadow-md hover:shadow-emerald-500/10 border border-slate-950/20 ${cell.color}`}
                ></div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-6 pt-4 border-t border-slate-900">
            <span>Less study</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-3.5 h-3.5 rounded bg-slate-900/40 border border-slate-950"></div>
              <div className="w-3.5 h-3.5 rounded bg-emerald-950/30"></div>
              <div className="w-3.5 h-3.5 rounded bg-emerald-900/50"></div>
              <div className="w-3.5 h-3.5 rounded bg-emerald-500/80"></div>
            </div>
            <span>More study</span>
          </div>
        </motion.div>

        {/* PIE CHART: Subject Share (Width: 5 Columns) */}
        <motion.div {...fadeInUp} className="lg:col-span-5 glass-panel rounded-3xl p-6.5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Hours per Subject Share
            </h3>
            <p className="text-slate-550 text-[10px] uppercase tracking-wider mb-6">Subject distribution tracker</p>
            
            {/* The circular SVG pie chart */}
            <div className="flex items-center justify-around gap-4 py-2">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  {pieData.map((wedge) => (
                    <circle 
                      key={wedge.id}
                      cx="64" 
                      cy="64" 
                      r="50" 
                      stroke={wedge.color}
                      strokeWidth="12" 
                      fill="transparent" 
                      strokeDasharray={wedge.dashArray}
                      strokeDashoffset={wedge.offset}
                      onMouseEnter={() => setHoveredWedge(wedge)}
                      onMouseLeave={() => setHoveredWedge(null)}
                      className="cursor-pointer transition-all hover:stroke-[15px] origin-center"
                    />
                  ))}
                </svg>

                {/* Inner central label */}
                <div className="absolute text-center select-none pointer-events-none">
                  {hoveredWedge ? (
                    <>
                      <span className="block text-2xl font-black text-white leading-none">{hoveredWedge.percentage}%</span>
                      <span className="text-[8px] uppercase tracking-wide text-slate-500 font-bold block mt-1">{hoveredWedge.name.split(' ')[0]}</span>
                    </>
                  ) : (
                    <>
                      <span className="block text-xl font-black text-white leading-none">34.5</span>
                      <span className="text-[8px] uppercase tracking-wide text-slate-550 font-bold block mt-1">Total Hrs</span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs text-slate-450">
                {pieData.map(w => (
                  <div 
                    key={w.id} 
                    className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
                      hoveredWedge?.id === w.id ? 'border-slate-800 bg-slate-900/30 text-white' : 'border-transparent'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color }}></div>
                    <div className="min-w-0">
                      <span className="font-semibold block truncate max-w-[100px]">{w.name}</span>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{w.hours} ({w.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 3. PERFORMANCE LINE CHART & SUMMARY REPORTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LINE CHART: Quiz Performance (Width: 6 Columns) */}
        <motion.div {...fadeInUp} className="lg:col-span-6 glass-panel rounded-3xl p-6.5 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-indigo-400" />
              Quiz Performance Trend
            </h3>
            <p className="text-slate-550 text-[10px] uppercase tracking-wider mb-6">Quiz score accuracy over time</p>
            
            {/* The SVG Line Graph */}
            <div className="relative pt-4 select-none">
              
              {/* Tooltip detail block */}
              <div className="absolute top-0 right-0 text-xs">
                {hoveredNode ? (
                  <span className="text-indigo-400 font-bold animate-in fade-in duration-200">
                    {hoveredNode.quiz}: <span className="text-white font-extrabold">{hoveredNode.score}%</span> accuracy
                  </span>
                ) : (
                  <span className="text-slate-600">Hover over nodes to inspect details.</span>
                )}
              </div>

              <svg viewBox="0 0 450 150" className="w-full h-auto overflow-visible">
                {/* Horizontal grid lines */}
                <line x1="10" y1="120" x2="440" y2="120" stroke="#0f172a" strokeWidth="1" />
                <line x1="10" y1="80" x2="440" y2="80" stroke="#0f172a" strokeWidth="1" />
                <line x1="10" y1="40" x2="440" y2="40" stroke="#0f172a" strokeWidth="1" />

                {/* Y Axis helper labels */}
                <text x="5" y="123" fill="#475569" fontSize="8" textAnchor="end">60%</text>
                <text x="5" y="83" fill="#475569" fontSize="8" textAnchor="end">80%</text>
                <text x="5" y="43" fill="#475569" fontSize="8" textAnchor="end">100%</text>

                {/* The glowing line path */}
                <path 
                  d="M 20 120 C 60 110, 100 105, 180 111 S 260 75, 340 54 S 400 45, 420 39" 
                  fill="none" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]"
                />

                {/* Linear gradient definition */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Chart Nodes circles */}
                {lineData.map((node, idx) => (
                  <circle 
                    key={idx}
                    cx={node.x}
                    cy={node.y}
                    r={hoveredNode?.quiz === node.quiz ? "6" : "4"}
                    fill="#0f172a"
                    stroke={hoveredNode?.quiz === node.quiz ? "#06b6d4" : "#6366f1"}
                    strokeWidth="3"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  />
                ))}

                {/* X Axis Labels */}
                {lineData.map((node, idx) => (
                  <text key={idx} x={node.x} y="145" fill="#475569" fontSize="8" textAnchor="middle">{node.quiz}</text>
                ))}
              </svg>

            </div>
          </div>
        </motion.div>

        {/* FEEDBACK REPORTS: Weekly/Monthly summaries (Width: 6 Columns) */}
        <motion.div {...fadeInUp} className="lg:col-span-6 glass-panel rounded-3xl p-6.5 flex flex-col justify-between min-h-[350px]">
          <div>
            
            {/* Header Switcher */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Analytics Reports
                </h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mt-0.5">AI study advisor recommendations</span>
              </div>

              <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900 text-[10px] font-bold uppercase">
                <button 
                  onClick={() => setReportType('weekly')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                    reportType === 'weekly' ? 'bg-blue-600 text-white' : 'text-slate-450 hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setReportType('monthly')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                    reportType === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-450 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* REPORT BODY */}
            {reportType === 'weekly' ? (
              <div className="space-y-4 text-xs text-slate-350 animate-in fade-in duration-200">
                <p className="leading-relaxed">
                  Your overall study time this week reached <span className="text-indigo-400 font-extrabold">{weeklyHours.toFixed(1)} hours</span>. You are currently on track to reach your goal target of <span className="text-indigo-400 font-bold">{weeklyGoal} hours</span>.
                </p>

                <div className="p-3.5 rounded-xl border border-rose-950/40 bg-rose-950/5 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-450 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-400 block uppercase text-[9px] tracking-wider">Urgent Revision Target</span>
                    <p className="mt-0.5 leading-normal">
                      Your accuracy rating on **Backpropagation calculus** drops below <span className="font-bold text-rose-400">38%</span>. Take mock exams or review the flashcard sets to reinforce this concept.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-950/40 bg-emerald-950/5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-450 block uppercase text-[9px] tracking-wider">Strong Concept Mastery</span>
                    <p className="mt-0.5 leading-normal">
                      You scored a high rating of <span className="font-bold text-emerald-400">92%</span> accuracy on the **Deep Learning & Multi-layer Perceptron** quiz module.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* MONTHLY REPORT */
              <div className="space-y-4 text-xs text-slate-350 animate-in fade-in duration-200">
                <p className="leading-relaxed">
                  Your cumulative learning volume for the month of June totals <span className="text-indigo-400 font-extrabold">62.4 hours</span>. Your overall consistency rating remains high with a continuous 7-day streak.
                </p>

                <div className="space-y-2 border-t border-slate-900 pt-3">
                  <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Monthly Summary Logs</h5>
                  <div className="flex justify-between items-center py-1">
                    <span>Average Quiz Accuracy</span>
                    <span className="font-extrabold text-white">87.5%</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Revision completion score</span>
                    <span className="font-extrabold text-white">92%</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Total active recall flashcards</span>
                    <span className="font-extrabold text-white">24 cards</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Report Generated: {new Date().toLocaleDateString()}</span>
            <span className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-0.5 cursor-pointer">
              Download PDF Report
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
