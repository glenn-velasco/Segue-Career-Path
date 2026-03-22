"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Send, User, Bot, Loader2, Volume2, VolumeX, Mic, Ghost } from "lucide-react";

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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      sendMessage("", true); 
    }

    if ('speechSynthesis' in window) {
      const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
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
      setInput("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speak = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);

    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.rate = 1.05;
    utterance.pitch = -2.0;

    window.speechSynthesis.speak(utterance);

    if (/Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent)) {
      setTimeout(() => {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 100);
    }
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
        throw new Error("Unknown Error Occured");
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
    <div className="flex flex-col h-full overflow-hidden rounded-lg bg-[#C0C0C0]/50">
      <div className="border-b-4 border-white/25 mx-4">
        <div className="flex items-center justify-between px-4 py-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-[#163D44] my-5 mx-1 rounded-2xl">
          <div className="flex justify-center items-center">
            <Bot className="w-10 h-10" />
            <div className="pl-3">
              <h3 className="font-semibold text-white flex items-center gap-2 text-2xl">
                Alice (AI Interviewer)
              </h3>
              <p className="text-xs text-zinc-300">
                Mock interview for {jobTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={toggleMute}
              className="bg-white/0 text-xs h-8 px-2 text-white hover:bg-[#308182]"
              title={isMuted ? "Unmute Alice" : "Mute Alice"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            {onClose && (
              <Button size="sm" onClick={onClose} className="text-xs h-8  border border-white/50 text-white bg-[#981616] hover:bg-[#681010] hover:border-white/70 hover:text-red-300">
                End Interview
              </Button>
            )}
          </div>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 no-scroll-bar mt-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === "user"
                ? "bg-[#265473] text-white"
                : "bg-[#163D44] text-white"
                }`}
            >
              {msg.role === "user" ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6 " />}
            </div>

            <div className={`flex flex-col justify-center w-full ${msg.role === "user" ? "items-end" : "items-start"} `}>
              <p className="text-sm text-white pb-1">
                {msg.role === "user" ? "You" : "Alice (AI)"}
              </p>
              <div
                className={`max-w-[80%] w-fit rounded-4xl px-5 py-3 text-sm wrap-break-word overflow-hidden ${msg.role === "user"
                  ? "bg-[#265473] :text-white rounded-tr-none"
                  : "bg-[#163D44] border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-none whitespace-pre-wrap"
                  }`}
              >
                {msg.parts[0].text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#265473] text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#163D44] border border-zinc-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#91B032] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-[#91B032] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-[#91B032] rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center p-2 text-sm text-red-600 bg-red-300 rounded-lg">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 p-2 border-white/40 border-t-4 pt-7 m-5">
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
            className={`flex-1 min-h-[44px] bg-white pl-4 py-3 rounded-fullborder-zinc-800 focus-visible:ring-[#308182] pr-24 text-sm text-black transition-colors placeholder:text-[#308182]/70 transition-all${isRecording ? 'border-blue-400 focus-visible:ring-[#308182] bg-[#cfebeb] placeholder:text-[#265473]/80' : ''}`}
          />
          <div className="absolute right-1 bottom-1 flex gap-1">
            <Button
              type="button"
              size="icon"
              onClick={toggleRecording}
              disabled={isLoading}
              className={`w-9 h-9 rounded-full shrink-0 transition-colors ${isRecording ? 'text-white bg-[#308182] hover:bg-[#265473]' : 'text-[#265473] bg-white/0 hover:bg-[#308182]'}`}
              title={isRecording ? "Stop recording" : "Start speaking"}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="w-[36px] h-[36px] rounded-full shrink-0 bg-[#308182] hover:bg-[#91B032] text-white shadow-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)] -ml-0.5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
