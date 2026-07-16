import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, LayoutDashboard, Terminal, CreditCard, Sparkles, 
  HelpCircle, Globe, Sun, Moon, Database, History, ArrowLeftRight, 
  Settings, CheckCircle2, RefreshCw, Loader2, ArrowRight
} from "lucide-react";
import { AuditReport, CriteriaCheck, SupportedLanguage } from "./types";
import AdSenseCheckerForm from "./components/AdSenseCheckerForm.tsx";
import Dashboard from "./components/Dashboard.tsx";
import AIExplanation from "./components/AIExplanation.tsx";
import APIDocs from "./components/APIDocs.tsx";
import SaaSPricing from "./components/SaaSPricing.tsx";
import AdminPanel from "./components/AdminPanel.tsx";

// Comprehensive Localization Tables
const translations: Record<SupportedLanguage, any> = {
  FR: {
    appName: "Publisher Audit Pro",
    tagline: "Moteur d'audit AdSense, SEO & Sécurité optimisé par l'IA",
    searchPlaceholder: "Entrez l'URL de votre site (ex: monsite.com)",
    scanButton: "Lancer l'audit",
    scanningText: "Analyse en cours...",
    overallScore: "Score global",
    adsenseChance: "Probabilité d'approbation",
    tabs: {
      dashboard: "Dashboard Audit",
      aiAssistant: "Assistant IA & Correcteur",
      apiPlayground: "API Playground",
      pricing: "Abonnements SaaS",
    }
  },
  EN: {
    appName: "Publisher Audit Pro",
    tagline: "AI-Powered AdSense Eligibility, SEO & Technical Auditor",
    searchPlaceholder: "Enter your website URL (e.g., mysite.com)",
    scanButton: "Scan Website",
    scanningText: "Auditing domain...",
    overallScore: "Overall Score",
    adsenseChance: "Approval Odds",
    tabs: {
      dashboard: "Audit Dashboard",
      aiAssistant: "AI Assistant & Fixer",
      apiPlayground: "API Sandbox",
      pricing: "SaaS Plans",
    }
  },
  ES: {
    appName: "Publisher Audit Pro",
    tagline: "Auditoría de AdSense, SEO y Seguridad con Inteligencia Artificial",
    searchPlaceholder: "Ingrese la URL de su sitio (ej: misitio.com)",
    scanButton: "Analizar sitio",
    scanningText: "Analizando sitio...",
    overallScore: "Puntaje general",
    adsenseChance: "Probabilidad de aprobación",
    tabs: {
      dashboard: "Panel de Auditoría",
      aiAssistant: "Asistente IA",
      apiPlayground: "Área de API",
      pricing: "Precios SaaS",
    }
  },
  AR: {
    appName: "Publisher Audit Pro",
    tagline: "مدقق AdSense وتحسين محركات البحث والأمان المدعوم بالذكاء الاصطناعي",
    searchPlaceholder: "أدخل رابط موقعك (مثال: mysite.com)",
    scanButton: "فحص الموقع",
    scanningText: "جاري الفحص...",
    overallScore: "النتيجة الإجمالية",
    adsenseChance: "احتمالية القبول",
    tabs: {
      dashboard: "لوحة الفحص",
      aiAssistant: "مساعد الذكاء الاصطناعي",
      apiPlayground: "بيئة المطورين",
      pricing: "خطط الاشتراك",
    }
  },
  DE: {
    appName: "Publisher Audit Pro",
    tagline: "KI-gestützter AdSense-Berechtigungs-, SEO- und Sicherheitsprüfer",
    searchPlaceholder: "Geben Sie Ihre Website-URL ein (z.B. meineseite.de)",
    scanButton: "Website scannen",
    scanningText: "Prüfung läuft...",
    overallScore: "Gesamtbewertung",
    adsenseChance: "Zulassungschance",
    tabs: {
      dashboard: "Audit-Dashboard",
      aiAssistant: "KI-Assistent & Code",
      apiPlayground: "API-Sandbox",
      pricing: "SaaS-Pläne",
    }
  }
};

export default function App() {
  const [lang, setLang] = useState<SupportedLanguage>("EN");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai" | "api" | "pricing" | "admin">("dashboard");
  const [userTier, setUserTier] = useState("Free Trial");
  const [config, setConfig] = useState<any>(null);

  // Fetch application config
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error("Failed to load app config:", err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Core scan states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [scanResult, setScanResult] = useState<AuditReport | null>(null);
  const [historyList, setHistoryList] = useState<AuditReport[]>([]);
  const [compareReport, setCompareReport] = useState<AuditReport | null>(null);

  // Shared state connecting dashboard directly to the AI fixer tab
  const [activeFixCheck, setActiveFixCheck] = useState<CriteriaCheck | null>(null);

  // Dynamic Scanning Visual Stepper logs
  const loadingSteps = [
    "Resolving DNS servers & DNSSEC verification...",
    "Validating SSL/TLS certificates & HSTS configurations...",
    "Crawling site schema, robots.txt directives & sitemap hierarchy...",
    "Scanning content indices & calculating AI copy likelihood variables...",
    "Estimating Core Web Vitals (LCP, CLS, INP) & layout stability parameters...",
    "Evaluating compliance alignment with Google Publisher Network guidelines..."
  ];

  // Apply dark class to document element on mount and theme change
  useEffect(() => {
    const rootElement = document.documentElement;
    if (theme === "dark") {
      rootElement.classList.add("dark");
    } else {
      rootElement.classList.remove("dark");
    }
  }, [theme]);

  // Fetch scan history from backend on load
  const loadHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistoryList(data);
    } catch (err) {
      console.error("Failed to load history list:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Run URL scan triggering server evaluation
  const handleScan = async (url: string) => {
    setIsLoading(true);
    setLoadingStep(0);
    setScanResult(null);
    setCompareReport(null);

    // Dynamic loading interval simulation
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      setScanResult(data);
      loadHistory(); // refresh history panel
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Scan API failure:", err);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handleFixWithAI = (check: CriteriaCheck) => {
    setActiveFixCheck(check);
    setActiveTab("ai");
  };

  const handleSelectHistoryReport = (report: AuditReport) => {
    setScanResult(report);
    setCompareReport(null);
    setActiveTab("dashboard");
  };

  const handleToggleCompare = (report: AuditReport) => {
    if (compareReport && compareReport.id === report.id) {
      setCompareReport(null);
    } else {
      setCompareReport(report);
    }
  };

  const currentTranslation = translations[lang];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* GLOBAL TOP NAVIGATION RAIL */}
      <header className="border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40" id="header-rail">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3" id="brand-logo">
            <div className="bg-gradient-to-tr from-indigo-600 to-sky-500 p-2.5 rounded-xl text-white shadow-md shadow-indigo-600/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight dark:text-white uppercase font-mono">
                {config?.general?.title || currentTranslation.appName}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {(config?.general?.tagline || currentTranslation.tagline).slice(0, 48)}...
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50" id="nav-tabs">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === "dashboard"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{currentTranslation.tabs.dashboard}</span>
            </button>

            {(!config || config.modules.coach) && (
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                  activeTab === "ai"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{currentTranslation.tabs.aiAssistant}</span>
              </button>
            )}

            {(!config || config.modules.api) && (
              <button
                onClick={() => setActiveTab("api")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                  activeTab === "api"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{currentTranslation.tabs.apiPlayground}</span>
              </button>
            )}

            {(!config || config.modules.pricing) && (
              <button
                onClick={() => setActiveTab("pricing")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                  activeTab === "pricing"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{currentTranslation.tabs.pricing}</span>
              </button>
            )}
          </nav>

          {/* Right Action Widgets (Theme, Locale, Tier status) */}
          <div className="flex items-center gap-3" id="quick-controls">
            
            {/* User Tier Status Badge */}
            <span className="hidden lg:inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
              <Database className="w-3 h-3" />
              <span>{userTier} Tier</span>
            </span>

            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              className="bg-slate-100 dark:bg-slate-800 border-0 outline-none text-xs font-bold py-1.5 px-2 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="EN">EN</option>
              <option value="FR">FR</option>
              <option value="ES">ES</option>
              <option value="AR">AR</option>
              <option value="DE">DE</option>
            </select>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:opacity-85 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              id="theme-toggler"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Admin Portal Toggle Button */}
            <button
              onClick={() => setActiveTab(activeTab === "admin" ? "dashboard" : "admin")}
              className={`p-2.5 rounded-xl hover:opacity-85 transition cursor-pointer flex items-center gap-1.5 border ${
                activeTab === "admin"
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-bold"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              }`}
              id="admin-portal-toggler"
              title="Admin Portal"
            >
              <Settings className={`w-3.5 h-3.5 ${activeTab === "admin" ? "animate-spin" : ""}`} />
              <span className="text-[10px] font-bold hidden xl:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE TAB BAR */}
      <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-around p-2 text-[11px]" id="mobile-tabs-container">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`py-1.5 px-2 rounded-lg flex flex-col items-center gap-0.5 ${
            activeTab === "dashboard" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Audit</span>
        </button>

        {(!config || config.modules.coach) && (
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-1.5 px-2 rounded-lg flex flex-col items-center gap-0.5 ${
              activeTab === "ai" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Coach AI</span>
          </button>
        )}

        {(!config || config.modules.api) && (
          <button
            onClick={() => setActiveTab("api")}
            className={`py-1.5 px-2 rounded-lg flex flex-col items-center gap-0.5 ${
              activeTab === "api" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>API</span>
          </button>
        )}

        {(!config || config.modules.pricing) && (
          <button
            onClick={() => setActiveTab("pricing")}
            className={`py-1.5 px-2 rounded-lg flex flex-col items-center gap-0.5 ${
              activeTab === "pricing" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>SaaS</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("admin")}
          className={`py-1.5 px-2 rounded-lg flex flex-col items-center gap-0.5 ${
            activeTab === "admin" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </div>

      {/* MAIN CONTAINER CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Search / Scan Panel always visible at top when in Dashboard state */}
        {activeTab === "dashboard" && !isLoading && (
          <div className="mb-12 text-center space-y-4 animate-fade-in" id="hero-landing">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight font-display">
              {currentTranslation.tagline}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              {lang === "FR" 
                ? "Saisissez simplement votre URL pour générer instantanément des scores de conformité AdSense, Core Web Vitals et un diagnostic de sécurité."
                : "Instantly analyze legal disclosure presence, cookie safety parameters, SEO structures, and dynamic AdSense network eligibility scores."}
            </p>
            <div className="pt-4">
              <AdSenseCheckerForm onScan={handleScan} isLoading={isLoading} lang={lang} />
            </div>
          </div>
        )}

        {/* LOADING VISUAL STEPPER SCREEN */}
        {isLoading && (
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 animate-pulse text-center py-12" id="scanning-stepper">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full filter blur-xl animate-ping"></div>
              <Loader2 className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin relative" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {currentTranslation.scanningText}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono h-4">
                {loadingSteps[loadingStep]}
              </p>
            </div>

            {/* Stepper nodes indicator */}
            <div className="flex justify-between max-w-xs mx-auto gap-1">
              {loadingSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                    idx <= loadingStep ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* DYNAMIC TAB CONTROLLERS */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="tab-panels-grid">
            
            {/* LEFT SIDEBAR: Scan History & Comparisons Panel */}
            {activeTab === "dashboard" && scanResult && (
              <div className="lg:col-span-1 space-y-6" id="history-sidebar">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <History className="w-4 h-4 text-slate-400" />
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                      {lang === "FR" ? "Historique des scans" : "Scan Session History"}
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto" id="history-list">
                    {historyList.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">No previous audits recorded.</p>
                    ) : (
                      historyList.map((hist) => {
                        const isCurrent = hist.id === scanResult.id;
                        const isComparing = compareReport?.id === hist.id;
                        return (
                          <div
                            key={hist.id}
                            className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2 text-xs ${
                              isCurrent 
                                ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900" 
                                : "bg-transparent border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <button
                                onClick={() => handleSelectHistoryReport(hist)}
                                className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px] hover:underline text-left"
                                title={hist.url}
                              >
                                {hist.url.replace(/^(https?:\/\/)?(www\.)?/, "")}
                              </button>
                              <span className="font-bold font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                                {hist.overallScore}/100
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                              <span>{new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {!isCurrent && (
                                <button
                                  onClick={() => handleToggleCompare(hist)}
                                  className={`font-semibold flex items-center gap-0.5 px-2 py-1 rounded cursor-pointer transition ${
                                    isComparing 
                                      ? "bg-emerald-500 text-white" 
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                  }`}
                                >
                                  <ArrowLeftRight className="w-3 h-3" />
                                  <span>{isComparing ? "Comparing" : "Compare"}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CENTRAL TABS ROUTER PANELS */}
            <div className={activeTab === "dashboard" && scanResult && (!config || config.modules.audit) ? "lg:col-span-3" : "lg:col-span-4"}>
              {activeTab === "dashboard" && (
                config && !config.modules.audit ? (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6" id="disabled-audit-state">
                    <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto opacity-40 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {lang === "FR" ? "Module d'Audit Désactivé" : "Audit Module Offline"}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
                      {lang === "FR" 
                        ? "Le module de diagnostic technique et de scan de site web est actuellement désactivé par l'administrateur système de la plateforme." 
                        : "The technical audit diagnostic scan features have been set offline by the administrator."}
                    </p>
                  </div>
                ) : scanResult ? (
                  <Dashboard 
                    report={scanResult} 
                    previousReport={compareReport || undefined}
                    onFixWithAI={handleFixWithAI} 
                    lang={lang} 
                  />
                ) : (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6" id="empty-dashboard-state">
                    <Globe className="w-16 h-16 text-indigo-500 mx-auto opacity-40 mb-4 animate-pulse" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {lang === "FR" ? "En attente du premier diagnostic" : "No active domain scan"}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
                      {lang === "FR" 
                        ? "Saisissez l'adresse de votre site dans la barre ci-dessus pour lancer le diagnostic technique." 
                        : "Analyze legal disclosure pages, SSL certificates, schema markup, and AdSense readiness chance by scanning any URL above."}
                    </p>
                  </div>
                )
              )}

              {activeTab === "ai" && (
                <AIExplanation 
                  activeFixCheck={activeFixCheck} 
                  domain={scanResult?.url || ""} 
                  lang={lang} 
                />
              )}

              {activeTab === "api" && (
                <APIDocs lang={lang} />
              )}

              {activeTab === "pricing" && (
                <SaaSPricing 
                  currentTier={userTier} 
                  onUpgradeTier={(tier) => setUserTier(tier)} 
                  lang={lang} 
                  config={config}
                />
              )}

              {activeTab === "admin" && (
                <AdminPanel 
                  onConfigUpdated={() => {
                    fetchConfig();
                    loadHistory();
                  }}
                  lang={lang}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-10 mt-20" id="footer-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs text-slate-400 font-mono">
            {config?.general?.footerText || `© ${new Date().getFullYear()} ${config?.general?.title || currentTranslation.appName} — Crafted with Google Gemini & Vite.`}
          </p>
          <div className="flex justify-center gap-4 text-[11px] text-slate-500 font-medium">
            <a href="#tab-policy" onClick={() => { setActiveTab("ai"); }} className="hover:underline">Privacy Policy Template</a>
            <span>•</span>
            <a href="#tab-policy" onClick={() => { setActiveTab("ai"); }} className="hover:underline">Terms of Service Template</a>
            <span>•</span>
            <a href="#api-developer-hub" onClick={() => { setActiveTab("api"); }} className="hover:underline">Developer Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
