import * as React from "react"
import { SidebarContext } from "@/contexts/sidebar-context"
import { type SidebarContextValue } from "@/types/schema"

export function useSidebarConfig(): SidebarContextValue {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarConfig must be used within a SidebarConfigProvider")
  }
  return context
}
