import { useCallback, useEffect } from "react";
import { useDisplayStore } from "../stores/useDisplayStore";

/**
 * Provides fullscreen toggle functionality.
 * Syncs fullscreen state to useDisplayStore.
 *
 * Note: Android TV devices may not support the Fullscreen API.
 * We gracefully degrade — toggle is a no-op if unsupported.
 */
export function useFullscreen() {
  const isFullscreen = useDisplayStore((s) => s.isFullscreen);
  const setFullscreen = useDisplayStore((s) => s.setFullscreen);

  // Sync store when user exits fullscreen via Escape key or browser UI
  useEffect(() => {
    const handleChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [setFullscreen]);

  const enter = useCallback(async () => {
    if (!document.fullscreenEnabled) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.warn("[useFullscreen] Could not enter fullscreen:", error);
    }
  }, []);

  const exit = useCallback(async () => {
    if (!document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.warn("[useFullscreen] Could not exit fullscreen:", error);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
