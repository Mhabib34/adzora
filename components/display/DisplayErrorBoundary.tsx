"use client";

import React from "react";

export class DisplayErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[DisplayRoot] Uncaught error:", error, info);
  }
  componentDidUpdate() {
    if (this.state.hasError) {
      setTimeout(() => window.location.reload(), 10_000);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center text-white"
          style={{ background: "var(--color-background)" }}
        >
          <p className="text-2xl opacity-60">
            Terjadi kesalahan. Layar akan dimuat ulang dalam 10 detik.
          </p>
          <p className="mt-4 font-mono text-sm opacity-30">
            {this.state.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
