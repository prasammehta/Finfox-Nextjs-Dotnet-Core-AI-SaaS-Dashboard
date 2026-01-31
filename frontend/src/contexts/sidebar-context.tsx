"use client"

import * as React from "react"
import { type SidebarConfig, type SidebarContextValue } from "@/types/schema"

export const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function SidebarConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<SidebarConfig>({
    variant: "inset",
    collapsible: "offcanvas", 
    side: "left"
  })

  const updateConfig = React.useCallback((newConfig: Partial<SidebarConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarConfig() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarConfig must be used within a SidebarConfigProvider")
  }
  return context
}
