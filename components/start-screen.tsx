"use client"

import { Button } from "@/components/ui/button"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-5 md:p-6 text-center animate-fade-in w-full max-w-2xl">
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3 md:mb-4">
          Can you draw a
        </h2>
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold italic mb-4 sm:mb-5 md:mb-6">
          <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
            PERFECT CIRCLE?
          </span>
        </div>
        <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium mb-4 sm:mb-6 md:mb-8">
          I dare you to try...
        </p>
      </div>
      <Button 
        onClick={onStart} 
        className="rounded-full w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 text-lg sm:text-xl md:text-2xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        GO
      </Button>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 sm:mt-3 md:mt-4 px-4">
        Trace the guide circle as perfectly as you can
      </p>
    </div>
  )
}

