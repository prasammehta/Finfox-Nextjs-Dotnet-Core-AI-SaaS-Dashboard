"use client";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import React from "react";
import { ThemeCustomizer } from "@/components/theme-customizer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-background">
      {children}
      <ThemeCustomizer
                open={themeCustomizerOpen}
                onOpenChange={setThemeCustomizerOpen}
              />
      <Toaster />
    </div>
  );
}
