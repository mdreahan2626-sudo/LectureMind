import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle, XCircle, Award, Sparkles, Clock, RefreshCw, Zap } from 'lucide-react';
import { API_URL } from '../config';

export default function ExamSimulator({ onShowToast }) {
  const [stage, setStage] = useState('setup'); // 'setup' | 'active' | 'results'
  
  const storedSubjects = (() => {
    try {
      const raw = localStorage.getItem('lecturemind_guest_subjects');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const savedTopic = localStorage.getItem('lecturemind_latest_topic') || storedSubjects[0]?.name || '';
  const initialContent = storedSubjects[0]?.chapters?.[0]?.topics?.[0]?.materials?.[0]?.content || '';

  const [title, setTitle] = useState(savedTopic || 'My Course Exam');
  const [content, setContent] = useState(initialContent);
  const [timeLimit, setTimeLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submission, setSubmission] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (storedSubjects.length > 0 && !content) {
      const first = storedSubjects[0];
      setTitle(first.name);
      const mat = first.chapters?.[0]?.topics?.[0]?.materials?.[0];
      if (mat?.content) setContent(mat.content);
    }
  }, []);

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
      if (token) {
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
          if (onShowToast) onShowToast('Exam generated. Good luck!', 'success');
          return;
        }
      }
    } catch (err) {
      console.error('Failed to generate exam from DB:', err);
    }

    // Fallback simulation
    setTimeout(() => {
      const mockQuiz = {
        id: "quiz-" + Date.now(),
        title,
        timeLimit,
        questions: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'Which mathematical theorem enables calculating weight loss gradients backward through neural layers?',
            options: ['Chain Rule of Calculus', 'Taylor Series Expansion', 'Bayes Theorem', 'Euler Formula'],
            answer: 'Chain Rule of Calculus'
          },
          {
            id: 'q2',
            type: 'mcq',
            question: 'What is the derivative of ReLU for positive inputs (x > 0)?',
            options: ['1', '0', 'x', 'e^x'],
            answer: '1'
          },
          {
            id: 'q3',
            type: 'short',
            question: 'Explain what happens during the vanishing gradient problem in deep networks.',
            answer: 'Gradient values exponentially decrease towards zero in early layers, halting weight updates.'
          }
        ]
      };
      setQuiz(mockQuiz);
      setUserAnswers({});
      setTimeLeft(timeLimit * 60);
      setStage('active');
      setLoading(false);
    }, 800);
  };

  const handleSubmitExam = async () => {
    if (!quiz) return;
    setLoading(true);

    // Grade locally
    setTimeout(() => {
      let score = 0;
      const feedback = quiz.questions.map(q => {
        const userAns = (userAnswers[q.id] || '').trim();
        const isCorrect = userAns.toLowerCase() === q.answer.toLowerCase() || (q.type === 'short' && userAns.length > 5);
        if (isCorrect) score++;
        return {
          question: q.question,
          userAnswer: userAns,
          correctAnswer: q.answer,
          isCorrect,
          explanation: `The question assesses core understanding of ${q.question.slice(0, 30)}…`
        };
      });

      setSubmission({
        score,
        total: quiz.questions.length,
        feedback
      });
      setStage('results');
      setLoading(false);
      if (onShowToast) onShowToast('Exam graded!', 'success');
    }, 600);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 sm:p-7 shadow-soft space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-rule">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-coral-soft text-coral">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-charcoal">Timed Exam Simulator</h3>
            <span className="text-xs text-charcoal-soft">Automated diagnostic assessment</span>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-coral-soft text-coral border border-coral/20 font-mono">
          Diagnostic Mode
        </span>
      </div>

      {/* STAGE 1: SETUP */}
      {stage === 'setup' && (
        <div className="space-y-4 max-w-xl">
          {storedSubjects.length > 0 && (
            <div className="p-3 rounded-lg bg-paper-deep border border-rule">
              <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider block font-mono mb-2">
                Quick Select Uploaded PDF / Course:
              </span>
              <div className="flex flex-wrap gap-2">
                {storedSubjects.map((s, idx) => {
                  const matContent = s.chapters?.[0]?.topics?.[0]?.materials?.[0]?.content || s.description || '';
                  const isSelected = title === s.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTitle(s.name);
                        setContent(matContent);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-violet text-white border-violet shadow-soft'
                          : 'bg-card text-charcoal border-rule hover:border-violet/60'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">Exam Topic Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-paper-deep border border-rule rounded-md text-xs text-charcoal focus-ring"
              placeholder="e.g. Linear Algebra & Optimization"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">Lecture Notes / Study Material</label>
            <textarea 
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 bg-paper-deep border border-rule rounded-md text-xs text-charcoal focus-ring resize-none leading-relaxed"
              placeholder="Paste lecture excerpt to generate questions from…"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32">
              <label className="block text-xs font-bold text-charcoal mb-1">Time (Minutes)</label>
              <input 
                type="number"
                min="1"
                max="60"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full px-3.5 py-2 bg-paper-deep border border-rule rounded-md text-xs text-charcoal tabular-nums focus-ring font-bold"
              />
            </div>
            <div className="flex-1 pt-5">
              <button
                onClick={handleGenerateExam}
                disabled={loading}
                className="w-full py-2.5 bg-charcoal hover:bg-coral text-paper text-xs font-bold rounded-full transition-colors shadow-soft flex items-center justify-center gap-1.5"
              >
                {loading ? 'Generating Questions…' : 'Start Timed Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: ACTIVE EXAM */}
      {stage === 'active' && quiz && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-paper-deep border border-rule">
            <div>
              <h4 className="text-sm font-bold text-charcoal">{quiz.title}</h4>
              <span className="text-xs text-charcoal-soft">{quiz.questions.length} Diagnostic Questions</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-base font-bold text-coral tabular-nums px-3.5 py-1.5 rounded-full bg-card border border-rule shadow-sm">
              <Timer className="w-4 h-4 text-coral" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id || idx} className="p-5 rounded-lg bg-card border border-card-border space-y-3 shadow-soft">
                <span className="text-[10px] font-mono font-bold text-charcoal-soft uppercase">Question {idx + 1}</span>
                <p className="text-xs font-bold text-charcoal">{q.question}</p>

                {q.type === 'mcq' && q.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                        className={`text-left px-3.5 py-2.5 rounded-md border text-xs transition-colors ${
                          userAnswers[q.id] === opt
                            ? 'border-coral bg-coral-soft/60 font-bold text-charcoal'
                            : 'border-rule bg-card hover:bg-paper-deep text-charcoal'
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
                    placeholder="Type your explanation…"
                    className="w-full px-3.5 py-2 bg-paper-deep border border-rule rounded-md text-xs text-charcoal focus-ring"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmitExam}
              disabled={loading}
              className="px-6 py-2.5 bg-coral text-white text-xs font-bold rounded-full hover:bg-coral-hover shadow-soft transition-all"
            >
              {loading ? 'Evaluating…' : 'Submit Exam'}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: RESULTS */}
      {stage === 'results' && submission && (
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-paper-deep border border-rule text-center space-y-1">
            <Award className="w-8 h-8 text-[#E3A62F] mx-auto mb-1" />
            <h4 className="text-3xl font-bold font-display text-charcoal tabular-nums">
              {Math.round((submission.score / submission.total) * 100)}% Grade Score
            </h4>
            <p className="text-xs text-charcoal-soft">
              Answered {submission.score} of {submission.total} questions correctly.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider">Question Feedback</h5>
            {submission.feedback.map((f, idx) => (
              <div key={idx} className="p-3.5 rounded-sm border border-border-subtle bg-surface space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  {f.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-danger shrink-0" />
                  )}
                  <span className="font-semibold text-text-primary">{f.question}</span>
                </div>
                <p className="text-text-secondary">Your response: <span className="font-mono text-text-primary">{f.userAnswer || '(Blank)'}</span></p>
                {!f.isCorrect && (
                  <p className="text-success">Correct answer: <span className="font-mono font-semibold">{f.correctAnswer}</span></p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStage('setup')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs font-semibold text-text-primary hover:bg-border-subtle"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start New Simulation
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
