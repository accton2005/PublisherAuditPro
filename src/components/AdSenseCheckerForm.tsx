import React, { useState } from "react";
import { Search, Loader2, Sparkles, Globe } from "lucide-react";

interface AdSenseCheckerFormProps {
  onScan: (url: string) => void;
  isLoading: boolean;
  lang: string;
}

export default function AdSenseCheckerForm({ onScan, isLoading, lang }: AdSenseCheckerFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url) {
      setError(lang === "FR" ? "Veuillez saisir une URL valide." : "Please enter a valid URL.");
      return;
    }

    // Basic URL cleaning
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }

    try {
      new URL(cleanUrl);
      onScan(cleanUrl);
    } catch (err) {
      setError(lang === "FR" ? "Format d'URL invalide." : "Invalid URL format.");
    }
  };

  const handlePreset = (presetUrl: string) => {
    setUrl(presetUrl);
    onScan(presetUrl);
  };

  return (
    <div className="w-full max-w-3xl mx-auto" id="search-section">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 rounded-2xl blur-md opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 transition duration-300 shadow-xl shadow-slate-100/10">
          <div className="flex items-center pl-3 text-slate-400 dark:text-slate-500">
            <Globe className="w-5 h-5" id="globe-icon" />
          </div>
          <input
            type="text"
            placeholder={
              lang === "FR"
                ? "Saisissez l'URL du site (ex: monsite.com)..."
                : "Enter website URL (e.g., techblog.com)..."
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-transparent border-0 outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-3 px-3 text-base"
            id="url-input"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition cursor-pointer"
            id="scan-submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" id="loader-icon" />
                <span>{lang === "FR" ? "Analyse..." : "Scanning..."}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" id="search-btn-icon" />
                <span>{lang === "FR" ? "Analyser" : "Scan Website"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-red-500 text-sm mt-3 pl-2 font-medium animate-pulse" id="url-error">
          {error}
        </p>
      )}

      {/* Interactive Quick Presets */}
      <div className="mt-6 text-center" id="presets-container">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
          {lang === "FR" ? "Tester avec des profils préconfigurés :" : "Test with preconfigured profiles:"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center" id="presets-list">
          <button
            onClick={() => handlePreset("https://premiumtechblog.com")}
            disabled={isLoading}
            className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer font-medium"
            id="preset-perfect"
          >
            🚀 Premium Tech Blog (94%)
          </button>
          <button
            onClick={() => handlePreset("https://lowqualityspam.xyz")}
            disabled={isLoading}
            className="text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer font-medium"
            id="preset-poor"
          >
            ⚠️ Low Quality / Spam (42%)
          </button>
          <button
            onClick={() => handlePreset("https://lasvegasbetcasino.com")}
            disabled={isLoading}
            className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition cursor-pointer font-medium"
            id="preset-restricted"
          >
            🔞 Gambling Casino Niche (5%)
          </button>
        </div>
      </div>
    </div>
  );
}
