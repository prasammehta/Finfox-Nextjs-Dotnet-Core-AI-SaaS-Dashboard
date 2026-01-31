"use client";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import React from "react";
import { ThemeCustomizer } from "@/components/theme-customizer";

// export const metadata: Metadata = {
//   title: "Authentication - ShadcnStore",
//   description: "Sign in to your account or create a new one",
// };

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
