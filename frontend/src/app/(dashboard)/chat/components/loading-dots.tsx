"use client"

export function LoadingDots() {
  return (
    <div className="flex items-center gap-0.5">
      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
