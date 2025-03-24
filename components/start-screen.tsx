"use client"

import { Button } from "@/components/ui/button"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-6 text-center">
      <h2 className="text-4xl font-bold mb-2">Can you draw a</h2>
      <div className="text-6xl font-bold italic mb-8">
        <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
          PERFECT CIRCLE?
        </span>
        <p className="text-4xl font bold mb-2">I dare you to try...</p>
      </div>
      <Button onClick={onStart} className="rounded-full w-32 h-32 text-xl font-bold">
        GO
      </Button>
    </div>
  )
}

