"use client";
import { useRef, use, useState, useEffect } from "react";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizFinalResult from "@/components/quiz/QuizResult";
import QuizReview from "@/components/quiz/QuizReview";
import { ArrowLeft, ArrowRight, AlertCircle, Settings2Icon } from "lucide-react";
import axios from "axios";

export default function QuizPage({ params }: { params: any }) {
  const rawId = (use(params) as { id: string | string[] }).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isLoading, setIsLoading] = useState(true);
  const [resourceTopic, setResourceTopic] = useState("");
  const [quizData, setQuizData] = useState<
    {
      question: string;
      options: string[];
      answer: string;
      explanation: string;
    }[]
  >([]);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  // Display state
  const [quizState, setQuizState] = useState<"quiz" | "results" | "review">(
    "quiz"
  );

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

  const resourceAPI = "/api/resource";

  type QuizQA = {
    id: string;
    quizId: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };

  type QuizResponse = {
    message: string;
    quiz: { id: string; resourceId: string };
    quizQAs: QuizQA[];
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function Datafetcher() {
      // Fetch resource title
      const res = await axios.get<{ resource?: { title: string } }>(
        resourceAPI,
        {
          params: { id },
        }
      );
      if (res.data.resource) {
        setResourceTopic(res.data.resource.title);
      } else {
        console.error("Resource not found");
      }

      // Call quiz API
      const payload = {
        resourceId: id,
        task: "quiz",
      };

      try {
        const resQuiz = await axios.post<QuizResponse>(
          "/api/resource-ai",
          payload
        );
        console.log("Quiz response:", resQuiz.data);

        const quizItems = resQuiz.data.quizQAs.map((qa) => ({
          question: qa.question,
          options: qa.options,
          answer: qa.correctAnswer,
          explanation: qa.explanation,
        }));

        setQuizData(quizItems);
        // Initialize userAnswers array with null values
        setUserAnswers(Array(quizItems.length).fill(null));
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setIsLoading(false);
      }
    }

    Datafetcher();
  }, [id]);

  const total = quizData.length;

  const handleSubmit = () => {
    if (!selected && currentQ === total - 1) {
      // On last question, show warning if no answer selected
      setShowWarning(true);
      return;
    }

    setShowWarning(false);

    // Update user answers array
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQ] = selected;
    setUserAnswers(updatedAnswers);

    if (selected === quizData[currentQ].answer) {
      setScore((prev) => prev + 1);
    }

    // Move to next or end
    if (currentQ < total - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
    } else {
      // Change to results view instead of incrementing currentQ
      setQuizState("results");
    }
  };

  const handlePrevious = () => {
    setCurrentQ((prev) => prev - 1);
    setSelected(userAnswers[currentQ - 1]);
    setShowWarning(false);
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setUserAnswers(Array(quizData.length).fill(null));
    setQuizState("quiz");
  };

  const startReview = () => {
    setQuizState("review");
  };

  const returnToResults = () => {
    setQuizState("results");
  };

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

      <div className="mt-10 min-h-[90vh] h-full px-6 max-w-3xl mx-auto flex flex-col items-center justify-center" style={{ filter: filterStyles[colorFilter] }}>
        {quizState !== "results" && (
          <div className="py-8 space-y-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-lime-400">
              Quiz On
            </h1>
            <h2 className="text-xl sm:text-xl font-medium text-white px-4">
              {resourceTopic}
            </h2>
          </div>
        )}

        {isLoading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-white text-lg gap-4">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-6 shadow-xl">
            {quizState === "quiz" && (
              <>
                {/* Progress Bar */}
                <div className="w-full mb-6">
                  <div className="w-full h-2 bg-zinc-700 rounded-full">
                    <div
                      className="h-2 bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${(currentQ / total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-right mt-1 text-gray-400">
                    Question {currentQ + 1} of {total}
                  </p>
                </div>

                <QuizQuestion
                  question={quizData[currentQ].question}
                  options={quizData[currentQ].options}
                  selected={selected}
                  setSelected={(value) => {
                    setSelected(value);
                    setShowWarning(false);
                  }}
                />

                {showWarning && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
                    <AlertCircle size={18} />
                    <p className="text-sm">
                      Please select an answer before proceeding to results.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <div>
                    {currentQ > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="flex items-center gap-2 bg-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-600 transition-colors"
                      >
                        <ArrowLeft size={16} />
                        Previous
                      </button>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={handleSubmit}
                      className={`bg-primary text-black px-6 py-2 rounded hover:bg-lime-300 flex items-center gap-2 transition-colors ${
                        !selected && currentQ < total - 1 ? "opacity-70" : ""
                      }`}
                    >
                      {currentQ === total - 1 ? "Finish Quiz" : "Next"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {quizState === "results" && (
              <QuizFinalResult
                score={score}
                total={total}
                userAnswers={userAnswers}
                quizData={quizData}
                resetQuiz={resetQuiz}
                startReview={startReview}
              />
            )}

            {quizState === "review" && (
              <QuizReview
                quizData={quizData}
                userAnswers={userAnswers}
                returnToResults={returnToResults}
              />
            )}
          </div>
        )}
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