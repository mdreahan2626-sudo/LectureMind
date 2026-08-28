import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Bot, HelpCircle } from 'lucide-react';
import { API_URL } from '../config';

export default function VoiceTutor({ contextText = "Neural Networks and Deep Learning basics" }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [socraticStep, setSocraticStep] = useState(2); // 5-dot progress rail
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I am your Socratic voice companion. Can you explain the main role of an activation function in your own words?',
      confidence: 3,
      citations: ["04:15"]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
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
      const reply = data.reply || 'You captured the intuition well. Now, how does that relate to gradient propagation?';

      setMessages([...newMessages, { 
        sender: 'bot', 
        text: reply, 
        rag: data.rag,
        confidence: 3,
        citations: ["18:42", "22:15"]
      }]);
      setSocraticStep(prev => (prev < 5 ? prev + 1 : 1));
      speakResponse(reply);
    } catch (err) {
      console.error('Voice chat error:', err);
      const fallback = 'Good point. Can you identify any mathematical limitations of that approach?';
      setMessages([...newMessages, { sender: 'bot', text: fallback, confidence: 2 }]);
      setSocraticStep(prev => (prev < 5 ? prev + 1 : 1));
      speakResponse(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveHint = () => {
    const hintMsg = {
      sender: 'bot',
      text: "💡 Socratic Hint: Think about what happens when you multiply several small decimal numbers (< 1) together across many layers.",
      confidence: 3
    };
    setMessages(prev => [...prev, hintMsg]);
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
    <div className="bg-surface border border-border-subtle rounded-md p-6 shadow-soft space-y-6">
      
      {/* Header & Socratic Progress Rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-accent-primary/10 text-accent-primary">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-text-primary">Voice Socratic Tutor</h3>
            <span className="text-[11px] text-text-muted">Inquiry-driven synthetic feedback</span>
          </div>
        </div>

        {/* 5-dot Socratic Progress Rail with Handwritten Margin Annotation */}
        <div className="flex items-center gap-3 bg-bg-subtle px-3 py-1.5 rounded-full border border-border-subtle">
          <span className="text-[11px] text-text-secondary font-medium">Inquiry Flow:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === socraticStep
                    ? 'bg-accent-primary scale-125'
                    : step < socraticStep
                    ? 'bg-accent-mint'
                    : 'bg-border-subtle'
                }`}
              />
            ))}
          </div>
          <span className="font-handwriting text-sm text-accent-primary transform -rotate-1">
            step {socraticStep} of 5
          </span>
        </div>
      </div>

      {/* Voice Visualizer Orb / Button */}
      <div className="p-6 rounded-md bg-surface-tint border border-border-subtle flex flex-col items-center justify-center text-center">
        <button
          onClick={toggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-soft ${
            isListening 
              ? 'bg-[#E0725C] text-white scale-105' 
              : isSpeaking
              ? 'bg-accent-mint text-white animate-pulse'
              : 'bg-accent-primary hover:bg-accent-hover text-white'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start speaking'}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* State Label */}
        <span className="text-xs font-semibold text-text-primary mt-3">
          {isListening 
            ? 'Listening… Speak your reasoning' 
            : isSpeaking 
            ? 'Speaking… Socratic response' 
            : 'Tap mic to explain verbally'}
        </span>

        {/* Mint Waveform Visualizer Bars (Only during listening) */}
        {isListening && (
          <div className="flex items-center gap-1 mt-3">
            <span className="w-1 h-3 bg-accent-mint rounded-full animate-bounce"></span>
            <span className="w-1 h-5 bg-accent-mint rounded-full animate-bounce delay-100"></span>
            <span className="w-1 h-2 bg-accent-mint rounded-full animate-bounce delay-200"></span>
            <span className="w-1 h-6 bg-accent-mint rounded-full animate-bounce delay-150"></span>
            <span className="w-1 h-4 bg-accent-mint rounded-full animate-bounce delay-300"></span>
          </div>
        )}
      </div>

      {/* Realtime Transcript */}
      {transcript && (
        <div className="p-3 bg-bg-subtle border border-border-subtle rounded-sm text-xs space-y-2">
          <span className="text-[10px] font-mono text-text-muted uppercase">Realtime transcript:</span>
          <p className="text-text-primary italic">"{transcript}"</p>
          <div className="flex justify-end">
            <button
              onClick={() => handleSendMessage(transcript)}
              className="px-3 py-1 bg-accent-primary text-white rounded-sm text-xs font-semibold hover:bg-accent-hover"
            >
              Submit Answer
            </button>
          </div>
        </div>
      )}

      {/* Chat Thread with Confidence Dots & Citation Chips */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-4 rounded-md text-xs leading-relaxed max-w-[85%] ${
              m.sender === 'user'
                ? 'bg-accent-primary text-white'
                : 'bg-surface-tint border border-border-subtle text-text-primary ink-border-ai shadow-soft'
            }`}>
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[10px] font-mono opacity-75 uppercase">
                  {m.sender === 'user' ? 'You' : 'Socratic Tutor'}
                </span>
                
                {/* 3-dot relevance/confidence meter */}
                {m.sender === 'bot' && (
                  <div className="flex items-center gap-1" title="High confidence grounding">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-mint"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-mint"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-mint"></span>
                  </div>
                )}
              </div>

              <p>{m.text}</p>

              {/* Citations Preview */}
              {m.citations && (
                <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center gap-1.5 text-[10px]">
                  <span className="text-text-muted">Sources:</span>
                  {m.citations.map((c, cIdx) => (
                    <span key={cIdx} className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle font-mono text-accent-primary font-semibold">
                      [{c}]
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Socratic Hint & Text Input fallback */}
      <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleGiveHint}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm border border-border-subtle bg-bg-subtle hover:bg-border-subtle/50 text-xs font-semibold text-text-secondary transition-colors shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" /> I'm not sure, give me a hint
        </button>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.target.elements.typedInput.value;
            if (input) {
              handleSendMessage(input);
              e.target.reset();
            }
          }}
          className="flex-1 flex gap-2"
        >
          <input
            name="typedInput"
            type="text"
            placeholder="Type answer or explanation here…"
            className="flex-1 px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent-primary text-white rounded-sm text-xs font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </form>
      </div>

      {/* Audio Mute Bar */}
      {isSpeaking && (
        <div className="p-2.5 bg-bg-subtle border border-border-subtle rounded-sm flex items-center justify-between text-xs">
          <span className="text-accent-primary flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-pulse text-accent-mint" /> Playing vocal synthesis…
          </span>
          <button
            onClick={stopSpeaking}
            className="text-danger font-semibold hover:underline flex items-center gap-1"
          >
            <VolumeX className="w-3.5 h-3.5" /> Stop voice
          </button>
        </div>
      )}

    </div>
  );
}
