"use client";
import { use, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Wand2,
  BrainCircuit,
  FileQuestion,
  Route,
  ExternalLink,
  Settings2Icon,
} from "lucide-react";
import axios from "axios";
import Mermaid from "@/components/mermaid/mermaid";
import ReactMarkdown from "react-markdown";
import prepareMermaidCode from "@/lib/prepareMermaidCode";
import Link from "next/link";

export default function ResourceChatPage({ params }: { params: any }) {
  const rawId = (use(params) as { id: string | string[] }).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isLoading, setIsLoading] = useState(true);
  const [resourceTopic, setResourceTopic] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceSummary, setResourceSummary] = useState("");

  // Accessibility settings state
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const [colorFilter, setColorFilter] = useState("none");
  const [fontSize, setFontSize] = useState(16);
  const [letterSpacing, setLetterSpacing] = useState(0.05);
  const [tempFontSize, setTempFontSize] = useState(16);
  const [tempLetterSpacing, setTempLetterSpacing] = useState(0.05);
  const [useDyslexiaFont, setUseDyslexiaFont] = useState(false);

  // Filter styles for color blindness options
  const filterStyles: Record<string, string> = {
    none: "",
    protanopia: "url(#protanopia)",
    deuteranopia: "url(#deuteranopia)",
    tritanopia: "url(#tritanopia)",
    highContrast: "",
  };

  // Handle click outside accessibility settings panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  // Apply accessibility settings
  useEffect(() => {
    document.body.style.fontSize = `${fontSize}px`;
    document.body.style.letterSpacing = `${letterSpacing}em`;
    document.body.style.fontFamily = useDyslexiaFont
      ? "'OpenDyslexic', Arial, sans-serif"
      : "";
  }, [fontSize, letterSpacing, useDyslexiaFont]);

  const handleApplySettings = () => {
    setFontSize(tempFontSize);
    setLetterSpacing(tempLetterSpacing);
    setShowSettings(false);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string; type: string; id?: string }[]
  >([]);
  const [input, setInput] = useState("");

  type AIResponse =
    | { summary: string }
    | { mindmap: string }
    | { answer: string };

  const handleSend = async (
    customInput?: string,
    task: "summary" | "mindmap" | "roadmap" | "qa" = "qa"
  ) => {
    const userMessage = customInput ?? input.trim();
    if (!userMessage) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage, type: "text" },
    ]);
    setInput("");

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "🧠 Abhyaas AI is thinking...", type: "text" },
    ]);

    // Check if task is 'summary' and we already have it
    if (task === "summary" && resourceSummary) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "bot",
          text: resourceSummary,
          type: task,
        },
      ]);
      return;
    }

    try {
      const payload: any = {
        resourceId: id,
        task,
      };

      if (task === "qa") {
        payload.question = userMessage;
      }

      const res = await axios.post<AIResponse>("/api/resource-ai", payload);

      let botText = "";

      if ("summary" in res.data) {
        botText = res.data.summary;
      } else if ("mindmap" in res.data) {
        botText = res.data.mindmap;
        console.log(JSON.stringify(botText));
      } else if ("answer" in res.data) {
        botText = res.data.answer;
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "bot",
          text: botText,
          type: task,
          id: task === "mindmap" ? crypto.randomUUID() : undefined,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "bot",
          text: "❌ Something went wrong while processing your request.",
          type: "text",
        },
      ]);
    }
  };

  const getSummary = () => handleSend("summarise this", "summary");
  const getMindMap = () => handleSend("Generate a mindmap", "mindmap");
  const getRoadMap = () => handleSend("Generate a Road Map", "roadmap");

  const resourceAPI = "/api/resource";

  interface ResourceResponse {
    resource?: { title: string; url: string; summary: string };
  }

  useEffect(() => {
    async function Datafetcher() {
      const res = await axios.get<ResourceResponse>(resourceAPI, {
        params: { id },
      });
      console.log(res.data);
      if (res.data.resource) {
        setResourceTopic(res.data.resource.title);
        setResourceUrl(res.data.resource.url);
        setResourceSummary(res.data.resource.summary);
        setIsLoading(false);
      } else {
        console.error("Resource not found");
      }
    }
    Datafetcher();
  }, []);

  return (
    <>
      {/* Accessibility Button */}
      <button
        className="fixed bottom-6 right-6 bg-primary text-black p-3 rounded-full shadow-lg z-[9999]"
        onClick={() => setShowSettings(!showSettings)}
        style={{ position: "fixed", zIndex: 9999 }}
      >
        <Settings2Icon />
      </button>

      {/* Accessibility Settings Panel */}
      {showSettings && (
        <div
          ref={settingsRef}
          className="fixed bottom-20 right-6 bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-6 w-80 z-[9999] border border-gray-300 dark:border-neutral-700"
        >
          <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Mode</label>
              <select
                className="w-full p-2 border rounded bg-[#171717] text-white"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
              >
                <option value="none">Default</option>
                <option value="protanopia">Red-Blind (Protanopia)</option>
                <option value="deuteranopia">Green-Blind (Deuteranopia)</option>
                <option value="tritanopia">Blue-Blind (Tritanopia)</option>
                <option value="highContrast">High Contrast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <input
                type="range"
                min="12"
                max="20"
                value={tempFontSize}
                onChange={(e) => setTempFontSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm mt-1">{tempFontSize}px</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Letter Spacing</label>
              <input
                type="range"
                min="0"
                max="0.7"
                step="0.05"
                value={tempLetterSpacing}
                onChange={(e) => setTempLetterSpacing(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm mt-1">{tempLetterSpacing}em</p>
            </div>

            <div className="flex items-center justify-between">
              <span>Dyslexia-Friendly Font</span>
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={useDyslexiaFont}
                onChange={(e) => setUseDyslexiaFont(e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Reading Line Guide</span>
              <input type="checkbox" className="toggle toggle-sm" disabled />
            </div>

            <button
              onClick={handleApplySettings}
              className="w-full mt-4 bg-primary text-black p-2 rounded-lg"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}

      <div className="h-screen bg-muted/50 text-foreground pt-24" style={{ filter: filterStyles[colorFilter] }}>
        <div className="flex flex-col h-full w-full">
          {/* Chat Area */}
          <div className="overflow-y-auto h-full">
            {/* Header */}
            <div className="pb-6 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center text-white text-lg gap-2">
                  <span>Loading...</span>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <Link
                  href={resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex items-center justify-center gap-2 text-white text-lg">
                    <h1 className="text-2xl font-bold text-white">
                      {resourceTopic}
                    </h1>
                    <ExternalLink />
                  </div>
                </Link>
              )}
            </div>
            <div className="flex-1 px-2 sm:px-6 lg:px-8 space-y-4 max-w-5xl mx-auto pb-20">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex w-full ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`
                          ${
                            msg.sender === "user"
                              ? "bg-muted text-foreground max-w-xs"
                              : "text-foreground w-full"
                          }
                          p-4 rounded-xl shadow prose prose-invert
                          ${
                            msg.sender === "user"
                              ? "rounded-br-none"
                              : "rounded-bl-none"
                          }
                          leading-loose
                        `}
                  >
                    {msg.sender === "bot" && msg.type === "mindmap" ? (
                      <Mermaid
                        id={msg.id || `mermaid-${idx}`}
                        chart={prepareMermaidCode({ code: msg.text })}
                        key={msg.id || `mermaid-${idx}`}
                      />
                    ) : (
                      <div
                        className={`max-w-none ${
                          msg.sender === "bot" ? "markdown-body" : ""
                        } `}
                      >
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input & Actions */}
          <div className="flex justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full border-t border-muted bg-zinc-800 p-4 shadow-inner rounded-t-3xl">
              {/* Input Row */}
              <div className="flex gap-2 mb-4 items-end">
                <Textarea
                  ref={textareaRef}
                  className="flex-1 resize-none min-h-5 max-h-40 overflow-auto rounded-2xl text-white placeholder:text-zinc-400 focus-visible:ring-1 focus:ring-primary border-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="rounded-full bg-primary hover:scale-105 transition"
                  onClick={() => handleSend(input)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2 sm:flex-nowrap">
                <Button
                  variant="outline"
                  className="rounded-full border-zinc-700 text-white hover:bg-zinc-800"
                  onClick={getSummary}
                >
                  <Wand2 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">AI Summarize</span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-zinc-700 text-white hover:bg-zinc-800"
                  onClick={getMindMap}
                >
                  <BrainCircuit className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Mind Map</span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-zinc-700 text-white hover:bg-zinc-800"
                  onClick={getRoadMap}
                >
                  <Route className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Road Map</span>
                </Button>
                <Link href={`/dashboard/quiz/${id}`}>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <FileQuestion className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Attempt a Quiz</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Filters */}
      <svg width="0" height="0">
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"
          />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"
          />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"
          />
        </filter>
      </svg>
    </>
  );
}