import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle, XCircle, AlertCircle, Award, Sparkles, Clock, RefreshCw, Zap } from 'lucide-react';
import { API_URL } from '../config';

export default function ExamSimulator() {
  const [stage, setStage] = useState('setup'); // 'setup' | 'active' | 'results'
  const [title, setTitle] = useState('Neural Network Foundations');
  const [content, setContent] = useState(`Backpropagation is an algorithm used in artificial neural networks to calculate the gradient of the loss function with respect to each weight by the chain rule. Activation functions like ReLU introduce non-linearity.`);
  const [timeLimit, setTimeLimit] = useState(10); // in minutes
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submission, setSubmission] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer effect
  useEffect(() => {
    if (stage !== 'active' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  const handleGenerateExam = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/ai/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          text: content,
          questionCount: 4,
          timeLimit
        })
      });
      const data = await res.json();
      if (data.quiz) {
        setQuiz(data.quiz);
        setUserAnswers({});
        setTimeLeft(data.quiz.timeLimit * 60);
        setStage('active');
      }
    } catch (err) {
      console.error('Failed to generate exam:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!quiz) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/ai/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId: quiz.id,
          userAnswers
        })
      });
      const data = await res.json();
      if (data.submission) {
        setSubmission(data.submission);
        setStage('results');
      }
    } catch (err) {
      console.error('Failed to submit exam:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-panel-glow rounded-3xl p-7 shadow-2xl relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-space text-white">Timed Exam Simulator</h3>
            <span className="text-[10px] text-slate-400 font-mono">Automated Diagnostic Assessment</span>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3.5 py-1 rounded-full">
          ⚡ Timed Diagnostic Mode
        </span>
      </div>

      {/* STAGE 1: SETUP EXAM */}
      {stage === 'setup' && (
        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 font-bold uppercase tracking-wider">EXAM TOPIC TITLE</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500 font-medium transition-all"
              placeholder="e.g. Linear Algebra & Vector Spaces"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 font-bold uppercase tracking-wider">LECTURE NOTES / STUDY MATERIAL</label>
            <textarea 
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono leading-relaxed transition-all"
              placeholder="Paste study material or notes to generate exam questions..."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-mono text-slate-400 mb-1.5 font-bold uppercase tracking-wider">TIME LIMIT (MINUTES)</label>
              <input 
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500 font-bold"
              />
            </div>
            <button
              onClick={handleGenerateExam}
              disabled={loading}
              className="w-full sm:w-2/3 sm:mt-6 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? 'Generating Exam Questions...' : 'Generate Timed Exam'}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: ACTIVE EXAM SIMULATION */}
      {stage === 'active' && quiz && (
        <div className="space-y-6 relative z-10">
          <div className="flex justify-between items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
            <div>
              <h4 className="text-base font-bold font-space text-white">{quiz.title}</h4>
              <span className="text-xs font-mono text-slate-400">{quiz.questions.length} Questions &bull; Timed Active Session</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-lg font-extrabold text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-4 py-2 rounded-xl shadow-inner">
              <Timer className="w-5 h-5 animate-pulse text-cyan-400" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((q, idx) => (
              <div key={q.id || idx} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[10px] font-bold text-violet-400 px-2.5 py-1 rounded-md bg-violet-950/40 border border-violet-800/40 uppercase">
                    Q0{idx + 1} &bull; {q.type === 'mcq' ? 'MULTIPLE CHOICE' : 'SHORT ANSWER'}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mb-4 leading-relaxed">{q.question}</p>

                {q.type === 'mcq' && q.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                        className={`text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                          userAnswers[q.id] === opt
                            ? 'bg-violet-950/60 border-violet-500 text-violet-300 shadow-md shadow-violet-500/20'
                            : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={userAnswers[q.id] || ''}
                    onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
                    placeholder="Type your answer here..."
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmitExam}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30"
            >
              {loading ? 'Evaluating Score...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: EXAM DIAGNOSTIC RESULTS */}
      {stage === 'results' && submission && (
        <div className="space-y-6 relative z-10">
          <div className="bg-slate-900/90 p-7 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
            <Award className="w-14 h-14 text-violet-400 mx-auto mb-3" />
            <h4 className="text-4xl font-extrabold font-space text-white mb-1">
              {Math.round((submission.score / submission.total) * 100)}% Grade Score
            </h4>
            <p className="text-xs font-mono text-slate-400">
              You scored {submission.score} out of {submission.total} questions correctly.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-bold font-space text-white uppercase tracking-wider">AI Diagnostic Explanations</h5>
            {submission.feedback.map((f, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border ${
                  f.isCorrect 
                    ? 'bg-emerald-950/20 border-emerald-800/40' 
                    : 'bg-rose-950/20 border-rose-800/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {f.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-white">{f.question}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1">Your answer: <span className="text-white font-mono">{f.userAnswer || '(No answer)'}</span></p>
                {!f.isCorrect && (
                  <p className="text-xs text-emerald-400 mb-2">Correct answer: <span className="font-mono">{f.correctAnswer}</span></p>
                )}
                <p className="text-[11px] text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-850 font-sans leading-relaxed">
                  💡 {f.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStage('setup')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake New Exam
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
