import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, AlertCircle, Bot, User } from 'lucide-react';
import { API_URL } from '../config';

export default function VoiceTutor({ contextText = "Neural Networks and Deep Learning basics" }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Socratic voice companion. What concept from today’s lecture would you like to explain to me?' }
  ]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech Recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || transcript;
    if (!query.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setTranscript('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: contextText
        })
      });
      const data = await res.json();
      const reply = data.reply || 'Let us break down this concept step by step. What is your understanding of it?';

      setMessages([...newMessages, { sender: 'bot', text: reply, rag: data.rag }]);
      speakResponse(reply);
    } catch (err) {
      console.error('Voice chat error:', err);
      const fallback = 'Can you elaborate on that point? How does it connect to the primary thesis?';
      setMessages([...newMessages, { sender: 'bot', text: fallback }]);
      speakResponse(fallback);
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="glass-panel-glow rounded-3xl p-7 shadow-2xl relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div>
            <h3 className="text-lg font-bold font-space text-white">Voice Socratic Tutor</h3>
            <span className="text-[10px] text-slate-400 font-mono">Audio Inquiry & Synthetic Feedback</span>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-violet-300 bg-violet-950/40 border border-violet-800/40 px-3.5 py-1 rounded-full shadow-inner">
          🎙️ Voice AI Active
        </span>
      </div>

      {/* Futuristic Mic AI Orb Visualizer */}
      <div className="relative z-10 flex flex-col items-center justify-center my-6 py-8 bg-slate-900/50 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        <div className="relative">
          {/* Animated Glow Rings when active */}
          {isListening && (
            <>
              <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping pointer-events-none"></div>
              <div className="absolute -inset-8 rounded-full bg-rose-500/10 animate-pulse pointer-events-none"></div>
            </>
          )}
          {isSpeaking && (
            <>
              <div className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping pointer-events-none"></div>
              <div className="absolute -inset-8 rounded-full bg-violet-500/10 animate-pulse pointer-events-none"></div>
            </>
          )}

          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative z-10 ${
              isListening 
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white scale-110 shadow-rose-600/50' 
                : isSpeaking
                ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 text-white animate-pulse shadow-cyan-500/50'
                : 'bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 hover:scale-105 text-white shadow-violet-600/40'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        <span className="text-xs font-mono text-slate-300 mt-5 font-semibold">
          {isListening 
            ? '🔴 Listening... Speak your explanation clearly' 
            : isSpeaking 
            ? '🔊 Socratic Tutor is responding verbally...' 
            : 'Tap the glowing orb to speak your answer'}
        </span>

        {/* Audio Wave Soundbars */}
        {isListening && (
          <div className="flex items-center gap-1.5 mt-5">
            <span className="w-1.5 h-6 bg-rose-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-10 bg-rose-400 rounded-full animate-bounce delay-100"></span>
            <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-bounce delay-200"></span>
            <span className="w-1.5 h-8 bg-rose-400 rounded-full animate-bounce delay-150"></span>
            <span className="w-1.5 h-5 bg-rose-400 rounded-full animate-bounce delay-300"></span>
          </div>
        )}
      </div>

      {/* Transcript Realtime Preview Box */}
      {transcript && (
        <div className="mb-6 p-4 rounded-xl bg-violet-950/20 border border-violet-500/40 animate-in fade-in duration-200">
          <span className="text-[10px] font-mono text-violet-400 block mb-1 font-bold">REALTIME TRANSCRIPT:</span>
          <p className="text-sm text-slate-200 italic font-mono">"{transcript}"</p>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => handleSendMessage(transcript)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:from-violet-500 hover:to-indigo-500 flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
            >
              Submit Answer <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-2 relative z-10">
        {messages.map((m, idx) => (
          <div 
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[10px] font-mono text-slate-400 mb-1 font-semibold flex items-center gap-1">
              {m.sender === 'user' ? (
                <> <User className="w-3 h-3 text-violet-400" /> YOU (VOICE) </>
              ) : (
                <> <Bot className="w-3 h-3 text-cyan-400" /> SOCRATIC TUTOR </>
              )}
            </span>
            <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none shadow-lg shadow-violet-600/20'
                : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
            }`}>
              <p>{m.text}</p>

              {/* RAG Vector Context Citations */}
              {m.rag && m.rag.retrievedChunks && m.rag.retrievedChunks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold mb-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>RAG VECTOR SEARCH RETRIEVED {m.rag.retrievedChunks.length} CONTEXT CHUNKS:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.rag.retrievedChunks.map((chunk, cIdx) => (
                      <span 
                        key={cIdx} 
                        title={chunk.text}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-700/40 text-cyan-200 flex items-center gap-1"
                      >
                        [Chunk {cIdx + 1}] Similarity: <strong className="text-emerald-400">{chunk.confidencePct}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            Socratic AI is analyzing your reasoning...
          </div>
        )}
      </div>

      {/* Audio Mute Bar */}
      {isSpeaking && (
        <div className="mt-4 p-3 bg-violet-950/30 border border-violet-800/40 rounded-xl flex items-center justify-between relative z-10">
          <span className="text-xs font-mono text-violet-300 flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-pulse text-cyan-400" /> Playing Audio Synthesis...
          </span>
          <button
            onClick={stopSpeaking}
            className="text-xs text-rose-400 font-bold hover:underline flex items-center gap-1"
          >
            <VolumeX className="w-3.5 h-3.5" /> Mute Audio
          </button>
        </div>
      )}

    </div>
  );
}
