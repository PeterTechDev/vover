"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "vover-pwa-dismissed";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
    setIsInStandaloneMode(standalone);

    if (standalone) return;

    // Check if iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if previously dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Listen for native install prompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000); // Show after 3s
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show manual install hint after 5s
    if (ios) {
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  }

  // Don't show if installed or not triggered
  if (isInStandaloneMode || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="pwa-banner"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 250 }}
        className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl shadow-black/40 p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 h-6 w-6 rounded-full bg-muted/80 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm mb-0.5">Install Vover</p>
              {isIOS ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tap <strong>Share</strong> then <strong>&ldquo;Add to Home Screen&rdquo;</strong> for the full app experience.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add to your home screen for instant access — works offline too.
                </p>
              )}
            </div>
          </div>

          {!isIOS && deferredPrompt && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="w-full mt-3 gap-2 h-9"
            >
              <Download className="h-4 w-4" />
              Add to Home Screen
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
