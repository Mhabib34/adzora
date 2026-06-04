"use client";

import { useEffect } from "react";
import { useThemeStore } from "../stores/useThemeStore";

/**
 * Empty component that ensures the theme store is hydrated
 * and CSS variables are applied globally on app load.
 */
export function ThemeInit() {
  const applyCSSVariables = useThemeStore((s) => s.applyCSSVariables);
  const theme = useThemeStore((s) => s.theme); // subscribe so hydration triggers updates if needed

  useEffect(() => {
    applyCSSVariables();
  }, [applyCSSVariables, theme]);

  return null;
}
