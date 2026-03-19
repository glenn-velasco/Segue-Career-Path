"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Send, User, Bot, Loader2, Volume2, VolumeX, Mic } from "lucide-react";

interface InterviewChatProps {
  jobTitle: string;
  companyName?: string;
  jobDescription?: string;
  onClose?: () => void;
}

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

export function InterviewChat({ jobTitle, companyName, jobDescription, onClose }: InterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Start interview on mount
  useEffect(() => {
    if (messages.length === 0) {
      sendMessage("", true); // trigger initial message
    }
    
    return () => {
      // Stop speaking when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInput(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput(""); // clear input to capture new voice cleanly
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speak = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a good English female voice if possible to match "Alice"
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Slight adjustments to make it sound more conversational
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
    setIsMuted(!isMuted);
  };

  const sendMessage = async (text: string, isInitial = false) => {
    if (!text.trim() && !isInitial) return;

    setError(null);
    setIsLoading(true);

    let newMessages = [...messages];

    if (!isInitial) {
      newMessages = [
        ...newMessages,
        { role: "user" as const, parts: [{ text }] },
      ];
      setMessages(newMessages);
      setInput("");
    }

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: isInitial ? [] : newMessages,
          jobTitle,
          companyName,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      if (data.text) {
        setMessages([
          ...newMessages,
          { role: "model", parts: [{ text: data.text }] },
        ]);
        speak(data.text);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during communication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Alice (AI Interviewer)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Mock interview for {jobTitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleMute} 
            className="text-xs h-8 px-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            title={isMuted ? "Unmute Alice" : "Mute Alice"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
              End Interview
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-none"
                  : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-none whitespace-pre-wrap"
                }`}
            >
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center p-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2 relative items-end"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Type your answer..."}
            disabled={isLoading}
            className={`flex-1 min-h-[44px] bg-zinc-50 dark:bg-zinc-950 pl-4 py-3 rounded-full border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-500 pr-24 text-sm transition-colors ${isRecording ? 'border-red-400 dark:border-red-500 focus-visible:ring-red-500 bg-red-50/50 dark:bg-red-950/20' : ''}`}
          />
          <div className="absolute right-1 bottom-1 flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={toggleRecording}
              disabled={isLoading}
              className={`w-[36px] h-[36px] rounded-full shrink-0 transition-colors ${isRecording ? 'text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/40 dark:hover:bg-red-900/60' : 'text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
              title={isRecording ? "Stop recording" : "Start speaking"}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="w-[36px] h-[36px] rounded-full shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)] -ml-0.5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
