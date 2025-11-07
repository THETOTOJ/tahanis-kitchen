"use client";
import { useEffect, useState } from "react";
import { X, Share, MoreVertical, Plus } from "lucide-react";

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed (running as standalone app)
        const standalone = window.matchMedia("(display-mode: standalone)").matches;
        setIsStandalone(standalone);

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem("installPromptDismissed");

        if (standalone || dismissed) {
            return; // Don't show prompt
        }

        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isIOS) {
            setPlatform("ios");
            // Show prompt after 3 seconds on iOS
            setTimeout(() => setShowPrompt(true), 3000);
        } else if (isAndroid) {
            setPlatform("android");
            // Show prompt after 3 seconds on Android
            setTimeout(() => setShowPrompt(true), 3000);
        }
    }, []);

    function dismissPrompt() {
        setShowPrompt(false);
        localStorage.setItem("installPromptDismissed", "true");
    }

    function remindLater() {
        setShowPrompt(false);
        // Don't set dismissed flag, so it shows again next session
    }

    if (!showPrompt || isStandalone || !platform) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div
                className="max-w-md mx-auto rounded-lg shadow-2xl p-4 border-2"
                style={{
                    background: "var(--card)",
                    borderColor: "var(--accent)",
                }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🍲</span>
                        <h3 className="font-bold text-lg">Install Toto's Kitchen</h3>
                    </div>
                    <button
                        onClick={dismissPrompt}
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                    Add this app to your home screen for quick access to all your favorite recipes!
                </p>

                {platform === "ios" && (
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                                1
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Tap the Share button</p>
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Share size={18} />
                                    <span>(at the bottom of Safari)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
                                2
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Select "Add to Home Screen"</p>
                                <div className="flex items-center gap-2 text-green-600">
                                    <Plus size={18} />
                                    <span>(scroll down if needed)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                                3
                            </div>
                            <div>
                                <p className="font-semibold">Tap "Add" to confirm</p>
                            </div>
                        </div>
                    </div>
                )}

                {platform === "android" && (
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                                1
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Tap the Menu button</p>
                                <div className="flex items-center gap-2 text-blue-600">
                                    <MoreVertical size={18} />
                                    <span>(three dots in the top right)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
                                2
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Select "Add to Home screen" or "Install app"</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                                3
                            </div>
                            <div>
                                <p className="font-semibold">Tap "Add" or "Install" to confirm</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={remindLater}
                        className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium"
                        style={{
                            borderColor: "var(--border)",
                            color: "var(--muted)",
                        }}
                    >
                        Not Now
                    </button>
                    <button
                        onClick={dismissPrompt}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                            background: "var(--accent)",
                            color: "var(--button-text)",
                        }}
                    >
                        Got It!
                    </button>
                </div>
            </div>
        </div>
    );
}