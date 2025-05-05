"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  CalendarCheck,
  ChartColumnBig,
  Plus,
  Settings2Icon,
} from "lucide-react";
import { TopicsTable } from "@/components/dashboard/topics-table";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Stats Data
const stats = [
  {
    title: "Mastery Level",
    value: "Intermediate",
    icon: <Award className="text-primary h-5 w-5" />,
    trend: "12% growth",
    progress: 65,
  },
  {
    title: "Study Consistency",
    value: "85%",
    icon: <CalendarCheck className="text-primary h-5 w-5" />,
    trend: "5% from last month",
    progress: 85,
  },
];

// Color Filter Styles
const filterStyles: { [key: string]: string } = {
  none: "none",
  protanopia: "url(#protanopia)",
  deuteranopia: "url(#deuteranopia)",
  tritanopia: "url(#tritanopia)",
  highContrast: "contrast(1.75)",
};

export default function Page() {
  const [showSettings, setShowSettings] = useState(false);
  const [colorFilter, setColorFilter] = useState("none");
  const [tempFontSize, setTempFontSize] = useState(16);
  const [tempLetterSpacing, setTempLetterSpacing] = useState(0);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Dashboard Content */}
      <main
        className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14 bg-background text-foreground relative"
        style={{
          filter: filterStyles[colorFilter],
          fontSize: `${tempFontSize}px`,
          letterSpacing: `${tempLetterSpacing}em`,
        }}
      >
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back! 👋
            </h1>
            <Link href="/dashboard/topic/">
              <Button variant="default">
                <Plus className="h-4 w-4" />
                <span className="md:block hidden">New Topic</span>
              </Button>
            </Link>
          </div>

          {/* Stats & Chart */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card
                key={stat.title}
                className="rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">{stat.icon}</div>
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>
                        <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                          {stat.trend}
                        </span>
                      </div>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${stat.progress}%` }}
                      />
                    </div>
                    <p className="text-right text-xs text-muted-foreground mt-1">
                      {stat.progress}% achieved
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="pt-3 pb-0 gap-3">
              <div className="flex items-center gap-4 px-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <ChartColumnBig className="text-primary h-5 w-5" />
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Performance</p>
                    <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                      7% from last month
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="px-2">
                <PerformanceChart />
              </CardContent>
            </Card>
          </div>

          {/* Topics Table */}
          <TopicsTable />
        </div>

        {/* SVG Filters for Color Blind Modes */}
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
      </main>

      {/* Accessibility Button (outside main) */}
      <button
        className="fixed bottom-6 right-6 bg-primary text-black p-3 rounded-full shadow-lg z-[9999]"
        style={{ filter: "none", fontSize: "16px", letterSpacing: "normal" }}
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings2Icon />
      </button>

      {/* Accessibility Settings Panel (outside main) */}
      {showSettings && (
        <div
          ref={settingsRef}
          className="fixed bottom-20 right-6 bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-6 w-80 z-[9999] border border-gray-300 dark:border-neutral-700"
          style={{ filter: "none", fontSize: "16px", letterSpacing: "normal" }}
        >
          <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Mode
              </label>
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
              <label className="block text-sm font-medium mb-1">
                Letter Spacing
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={tempLetterSpacing}
                onChange={(e) => setTempLetterSpacing(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm mt-1">{tempLetterSpacing}em</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
