"use client";

import { useState } from "react";
import Hero from "@/components/landing/Hero"; // You probably missed this import
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";

export default function Home() {
  const [colorFilter, setColorFilter] = useState("none");

  const filterStyles: Record<string, string> = {
    none: "none",
    protanopia: "url('#protanopia')",
    deuteranopia: "url('#deuteranopia')",
    tritanopia: "url('#tritanopia')",
    highContrast: "contrast(200%)",
  };

  return (
    <main>
      <div className="z-0 relative min-h-screen w-full overflow-hidden">
        <Hero
          colorFilter={colorFilter}
          setColorFilter={setColorFilter}
          filterStyles={filterStyles}
        />

        <Features filterStyle={filterStyles[colorFilter]}/>

        <Pricing colorFilter={colorFilter} filterStyles={filterStyles} />
        <About colorFilter={colorFilter} filterStyles={filterStyles} />
      </div>
    </main>
  );
}