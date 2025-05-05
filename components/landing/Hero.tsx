"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, Settings2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import BlurIn from "@/components/magicui/blur-in";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { SparklesText } from "@/components/magicui/sparkles-text";
import AnimatedImage from "@/components/landing/AnimatedImage";
import { useUser } from "@clerk/nextjs";

// 👇 Props Interface
interface HeroProps {
  colorFilter: string;
  setColorFilter: React.Dispatch<React.SetStateAction<string>>;
  filterStyles: Record<string, string>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// 👇 Hero Component
const Hero: React.FC<HeroProps> = ({ colorFilter, setColorFilter, filterStyles }) => {
  const { isSignedIn } = useUser();
  const linkHref = isSignedIn ? "/dashboard" : "/sign-up";

  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  const [fontSize, setFontSize] = useState(16);
  const [letterSpacing, setLetterSpacing] = useState(0.05);
  const [tempFontSize, setTempFontSize] = useState(16);
  const [tempLetterSpacing, setTempLetterSpacing] = useState(0.05);

  const [useDyslexiaFont, setUseDyslexiaFont] = useState(false);

  useEffect(() => {
    document.body.style.fontSize = `${fontSize}px`;
    document.body.style.letterSpacing = `${letterSpacing}em`;
    document.body.style.fontFamily = useDyslexiaFont
      ? "'OpenDyslexic', Arial, sans-serif"
      : "";
  }, [fontSize, letterSpacing, useDyslexiaFont]);

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

  const handleApplySettings = () => {
    setFontSize(tempFontSize);
    setLetterSpacing(tempLetterSpacing);
    setShowSettings(false);
  };

  return (
    <>
      {/* Accessibility Button (outside of working area) */}
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

      {/* Main Hero Section with Filtered Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-start min-h-screen space-y-4 px-4 pt-32 pb-12"
        style={{ filter: filterStyles[colorFilter] }}  // Apply the selected color filter
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <DotPattern className={cn("absolute inset-0 z-0 [mask-image:radial-gradient(50vw_circle_at_center,white,transparent)] dark:[mask-image:radial-gradient(50vw_circle_at_center,black,transparent)]")} />

        <span className="bg-muted px-4 py-1 rounded-full relative z-10 text-xs border-2 border-neutral-600">
          🧠 | Remember Smarter
        </span>

        <motion.div variants={itemVariants}>
          <BlurIn
            word={
              <>
                <span>Phadlo Chahe Kahi se,</span>
                <br />
                <SparklesText className="inline" text="Yaad" />
                <span> Hoga Yahi se.</span>
              </>
            }
            className="font-display text-center text-3xl md:text-7xl font-bold w-full lg:w-auto max-w-4xl mx-auto -z-10"
            duration={1}
          />
        </motion.div>

        <motion.h2
          className="mt-2 text-base md:text-xl text-muted-foreground tracking-normal text-center max-w-2xl mx-auto z-10"
          variants={itemVariants}
        >
          Upload your YouTube videos & PDF notes to get instant summaries, mind maps, take MCQ tests, and retain <NumberTicker value={100} />% more effectively.
        </motion.h2>

        <motion.div variants={itemVariants} className="z-20">
          <Link href={linkHref} passHref>
            <Button className="bg-primary text-black rounded-full">
              Get Started
              <ArrowRightIcon className="w-8 h-8 transform transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatedImage
            src="/dashboard.png"
            alt="Image"
            width={1200}
            height={900}
            className="w-full h-auto max-w-6xl mx-auto rounded-2xl shadow-lg px-0 sm:px-4"
          />
        </motion.div>

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
      </motion.div>
    </>
  );
};

export default Hero;