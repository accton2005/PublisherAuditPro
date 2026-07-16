import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Lock, LogOut, CheckCircle2, Save, Terminal, 
  Trash2, Database, ToggleLeft, ToggleRight, Settings, 
  Layers, FileText, CreditCard, AlertTriangle, RefreshCw
} from "lucide-react";

interface AdminPanelProps {
  onConfigUpdated: () => void;
  lang: string;
}

export default function AdminPanel({ onConfigUpdated, lang }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [usernameInput, setUsernameInput] = useState("admin");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"modules" | "pages" | "pricing" | "rules" | "history" | "security" | "logs" | "payments">("modules");
  
  // Loaded Config State
  const [adminConfig, setAdminConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // History, Logs, & Payments
  const [scans, setScans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);

  // Security password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState("");

  // Check login on load
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchCurrentConfig();
    }
  }, []);

  // Fetch full config when authenticated
  const fetchCurrentConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setAdminConfig(data);
    } catch (err) {
      console.error("Failed to load configuration", err);
    }
  };

  // Fetch Admin logs, histories, & payments
  const fetchLogsAndHistory = async () => {
    if (!isLoggedIn) return;
    setFetchingData(true);
    try {
      const histRes = await fetch("/api/history");
      const histData = await histRes.json();
      setScans(histData);

      const logsRes = await fetch("/api/logs");
      const logsData = await logsRes.json();
      setLogs(logsData);

      const currentToken = token || localStorage.getItem("admin_token");
      if (currentToken) {
        const payRes = await fetch("/api/admin/payments", {
          headers: { "Authorization": `Bearer ${currentToken}` }
        });
        if (payRes.ok) {
          const payData = await payRes.json();
          setPayments(payData);
        }
      }
    } catch (err) {
      console.error("Failed to fetch logs, histories, or payments", err);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCurrentConfig();
      fetchLogsAndHistory();
    }
  }, [isLoggedIn, activeSubTab]);

  // Handle Admin secure login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setPasswordInput("");
      } else {
        const errData = await res.json();
        setLoginError(errData.error || "Identifiants incorrects.");
      }
    } catch (err) {
      setLoginError("Connexion impossible avec le serveur d'administration.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsLoggedIn(false);
  };

  // Save Config to Server
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ config: adminConfig })
      });

      if (res.ok) {
        setSaveSuccess(true);
        onConfigUpdated(); // inform App.tsx to reload config
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setSaveError(errData.error || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      setSaveError("Impossible de communiquer avec le serveur pour enregistrer les paramètres.");
    } finally {
      setSaving(false);
    }
  };

  // Delete specific scan
  const handleDeleteScan = async (id: string) => {
    try {
      const res = await fetch("/api/admin/history/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchLogsAndHistory();
      }
    } catch (err) {
      console.error("Failed to delete scan session", err);
    }
  };

  // Clear all history
  const handleClearAllHistory = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir vider l'ensemble des rapports d'audit stockés ?")) return;
    try {
      const res = await fetch("/api/admin/history/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        fetchLogsAndHistory();
      }
    } catch (err) {
      console.error("Failed to clear scans history", err);
    }
  };

  // Toggle Stripe, PayPal or Paddle active gateway settings
  const handleToggleGateway = (gateway: "stripe" | "paypal" | "paddle") => {
    if (!adminConfig) return;
    
    const currentSettings = adminConfig.paymentSettings || { stripeActive: true, paypalActive: true, paddleActive: true, allowPaypalSandbox: true };
    const fieldKey = gateway === "stripe" ? "stripeActive" : gateway === "paypal" ? "paypalActive" : "paddleActive";
    const updatedSettings = {
      ...currentSettings,
      [fieldKey]: !currentSettings[fieldKey]
    };
    
    const updatedConfig = {
      ...adminConfig,
      paymentSettings: updatedSettings
    };
    
    setAdminConfig(updatedConfig);
    
    // Automatically save config
    setSaving(true);
    fetch("/api/admin/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ config: updatedConfig })
    }).then(res => {
      if (res.ok) {
        setSaveSuccess(true);
        onConfigUpdated();
        setTimeout(() => setSaveSuccess(false), 2000);
      }
      setSaving(false);
    }).catch(() => setSaving(false));
  };

  const handlePaymentSettingsChange = (field: string, value: any) => {
    if (!adminConfig) return;
    setAdminConfig({
      ...adminConfig,
      paymentSettings: {
        ...(adminConfig.paymentSettings || {}),
        [field]: value
      }
    });
  };

  const handleSaveManualPaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ config: adminConfig })
      });

      if (res.ok) {
        setSaveSuccess(true);
        onConfigUpdated();
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setSaveError("Impossible de se connecter au serveur.");
    } finally {
      setSaving(false);
    }
  };

  // Change payment transaction status (e.g. refund, complete, fail)
  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/payments/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchLogsAndHistory(); // reload logs & payments
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Delete specific transaction log
  const handleDeletePayment = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction des registres ?")) return;
    try {
      const res = await fetch("/api/admin/payments/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchLogsAndHistory(); // reload logs & payments
      }
    } catch (err) {
      console.error("Failed to delete payment", err);
    }
  };

  // Clear all transaction logs
  const handleClearAllPayments = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir VIDER COMPLÈTEMENT le registre des transactions ?")) return;
    try {
      const res = await fetch("/api/admin/payments/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        fetchLogsAndHistory(); // reload logs & payments
      }
    } catch (err) {
      console.error("Failed to clear payments", err);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }

    try {
      // Modify configuration on client state and upload
      const configToSave = {
        ...adminConfig,
        adminPassword: newPassword
      };

      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ config: configToSave })
      });

      if (res.ok) {
        setPasswordChangeSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Reload settings
        fetchCurrentConfig();
      } else {
        const errData = await res.json();
        setPasswordChangeError(errData.error || "Impossible de changer le mot de passe.");
      }
    } catch (err) {
      setPasswordChangeError("Erreur lors de la communication avec l'API d'authentification.");
    }
  };

  // Toggle Module
  const handleToggleModule = (moduleKey: string) => {
    setAdminConfig({
      ...adminConfig,
      modules: {
        ...adminConfig.modules,
        [moduleKey]: !adminConfig.modules[moduleKey]
      }
    });
  };

  // Handle General Settings Text input
  const handleGeneralTextInput = (field: string, value: string) => {
    setAdminConfig({
      ...adminConfig,
      general: {
        ...adminConfig.general,
        [field]: value
      }
    });
  };

  // Handle Pricing features or plans edit
  const handlePlanEdit = (index: number, field: string, value: any) => {
    const updatedPricing = [...adminConfig.pricing];
    updatedPricing[index] = {
      ...updatedPricing[index],
      [field]: value
    };
    setAdminConfig({
      ...adminConfig,
      pricing: updatedPricing
    });
  };

  // Handle Audit rules baseline configuration
  const handleRuleScoreEdit = (categoryKey: string, score: number) => {
    setAdminConfig({
      ...adminConfig,
      categories: {
        ...adminConfig.categories,
        [categoryKey]: {
          ...adminConfig.categories[categoryKey],
          score: Math.min(100, Math.max(0, score))
        }
      }
    });
  };

  const handleRuleTextEdit = (categoryKey: string, field: string, value: string) => {
    setAdminConfig({
      ...adminConfig,
      categories: {
        ...adminConfig.categories,
        [categoryKey]: {
          ...adminConfig.categories[categoryKey],
          [field]: value
        }
      }
    });
  };

  // Render Login Card if not authorized
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12" id="admin-login-wrapper">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-indigo-100 dark:bg-indigo-950/40 p-3.5 rounded-2xl text-indigo-600 dark:text-indigo-400 inline-block">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Panneau d'administration</h2>
            <p className="text-xs text-slate-400">
              Authentification sécurisée requise pour modifier les modules et le contenu des pages.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 p-3.5 rounded-xl text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nom d'utilisateur</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 dark:text-white"
                placeholder="admin"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mot de passe</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/40 p-3 rounded-lg text-[10px] text-slate-400 leading-normal">
              Note : Utilisez les identifiants par défaut du serveur (Utilisateur : <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">admin</span> / MDP : <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">admin</span>) s'ils n'ont pas encore été réinitialisés.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
            >
              {loading ? "Vérification en cours..." : "Se connecter en mode sécurisé"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!adminConfig) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <RefreshCw className="w-10 h-10 text-indigo-500 mx-auto animate-spin mb-4" />
        <p className="text-sm text-slate-500">Chargement de la configuration système...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-fade-in" id="admin-dashboard-root">
      
      {/* Admin Panel Header */}
      <div className="bg-slate-950 p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secure Administrator Active Session
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Panneau de contrôle d'administration</h2>
          <p className="text-xs text-slate-400">
            Activez/désactivez des modules système, modifiez en temps réel les barèmes d'évaluation, le contenu des pages et visualisez les journaux d'activité.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition border border-slate-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
        {/* Left Side Navigation menu for Admin panel */}
        <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-950 p-5 border-r border-slate-100 dark:border-slate-800/80 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2">Configuration</p>
          
          <button
            onClick={() => setActiveSubTab("modules")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "modules" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Switchboard Modules</span>
          </button>

          <button
            onClick={() => setActiveSubTab("pages")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "pages" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Pages & Contenus CMS</span>
          </button>

          <button
            onClick={() => setActiveSubTab("pricing")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "pricing" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Abonnements SaaS</span>
          </button>

          <button
            onClick={() => setActiveSubTab("rules")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "rules" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Règles d'Audit</span>
          </button>

          <div className="h-px bg-slate-200 dark:bg-slate-800/80 my-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2">Activité & Sécurité</p>

          <button
            onClick={() => setActiveSubTab("history")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "history" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Rapports d'Audit ({scans.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("payments")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "payments" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span>Opérations de Paiement ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("logs")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "logs" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Journaux API Logs ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("security")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "security" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Sécurité Administrateur</span>
          </button>
        </div>

        {/* Right Area content fields */}
        <div className="lg:col-span-3 p-6 md:p-8">
          
          {saveSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl text-xs flex gap-2 mb-6 items-center">
              <CheckCircle2 className="w-5 h-5" />
              <span>Paramètres enregistrés et appliqués sur le serveur avec succès !</span>
            </div>
          )}

          {saveError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 p-4 rounded-2xl text-xs flex gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* 1. MODULES SWITCHBOARD */}
          {activeSubTab === "modules" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Switchboard Modules Applicatifs</h3>
                <p className="text-xs text-slate-400">Activez ou désactivez les sections de l'application en un clic. Les onglets correspondants seront immédiatement masqués ou affichés pour l'utilisateur final.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1 max-w-[70%]">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Module Diagnostique Audit</h4>
                    <p className="text-[10px] text-slate-400">Le moteur d'audit de site web (robots, sitemap, legal indicators, score globale AdSense).</p>
                  </div>
                  <button onClick={() => handleToggleModule("audit")} className="text-indigo-600 cursor-pointer">
                    {adminConfig.modules.audit ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12 text-slate-400" />}
                  </button>
                </div>

                <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1 max-w-[70%]">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Module Assistant IA Coach</h4>
                    <p className="text-[10px] text-slate-400">L'assistant conversationnel intelligent et correcteur de codes automatiques (Gemini AI).</p>
                  </div>
                  <button onClick={() => handleToggleModule("coach")} className="text-indigo-600 cursor-pointer">
                    {adminConfig.modules.coach ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12 text-slate-400" />}
                  </button>
                </div>

                <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1 max-w-[70%]">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Module API Sandbox pour Développeurs</h4>
                    <p className="text-[10px] text-slate-400">L'onglet documentation technique des endpoints d'audit pour intégration externe.</p>
                  </div>
                  <button onClick={() => handleToggleModule("api")} className="text-indigo-600 cursor-pointer">
                    {adminConfig.modules.api ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12 text-slate-400" />}
                  </button>
                </div>

                <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1 max-w-[70%]">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Module Plans d'Abonnement SaaS</h4>
                    <p className="text-[10px] text-slate-400">L'onglet de tarification SaaS avec simulateur de paiement Stripe sécurisé.</p>
                  </div>
                  <button onClick={() => handleToggleModule("pricing")} className="text-indigo-600 cursor-pointer">
                    {adminConfig.modules.pricing ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <button
                  onClick={() => handleSaveConfig()}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow shadow-indigo-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Sauvegarde..." : "Enregistrer les Modules"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. PAGES CMS EDITOR */}
          {activeSubTab === "pages" && (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">CMS Éditeur de Pages & Contenus</h3>
                <p className="text-xs text-slate-400">Modifiez instantanément les titres, sous-titres et textes de bas de page de l'application.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Nom de l'application (Titre global)</label>
                  <input
                    type="text"
                    required
                    value={adminConfig.general.title}
                    onChange={(e) => handleGeneralTextInput("title", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Landing Page Hero Tagline</label>
                  <input
                    type="text"
                    required
                    value={adminConfig.general.tagline}
                    onChange={(e) => handleGeneralTextInput("tagline", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Slogan de description (Landing Page Subtitle)</label>
                  <textarea
                    required
                    rows={3}
                    value={adminConfig.general.subtitle}
                    onChange={(e) => handleGeneralTextInput("subtitle", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Crédits de bas de page (Footer Section)</label>
                  <input
                    type="text"
                    required
                    value={adminConfig.general.footerText}
                    onChange={(e) => handleGeneralTextInput("footerText", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow shadow-indigo-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Sauvegarde..." : "Enregistrer les Textes"}</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. SAAS PRICING EDITOR */}
          {activeSubTab === "pricing" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Éditeur d'Abonnements SaaS</h3>
                <p className="text-xs text-slate-400">Modifiez en temps réel les prix, descriptions et fonctionnalités incluses dans les 4 formules d'abonnements.</p>
              </div>

              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {adminConfig.pricing.map((plan: any, planIdx: number) => (
                  <div key={plan.id} className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
                      <h4 className="text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">Formule : {plan.name}</h4>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 font-mono text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">Plan #{planIdx + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nom</label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handlePlanEdit(planIdx, "name", e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tarif mensuel ($)</label>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => handlePlanEdit(planIdx, "price", parseInt(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium dark:text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Texte CTA</label>
                        <input
                          type="text"
                          value={plan.cta || "Subscribe"}
                          onChange={(e) => handlePlanEdit(planIdx, "cta", e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Description abrégée</label>
                      <input
                        type="text"
                        value={plan.description}
                        onChange={(e) => handlePlanEdit(planIdx, "description", e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                        <span>Fonctionnalités incluses (une par ligne)</span>
                      </label>
                      <textarea
                        rows={4}
                        value={plan.features.join("\n")}
                        onChange={(e) => handlePlanEdit(planIdx, "features", e.target.value.split("\n").filter(Boolean))}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium dark:text-white leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <button
                  onClick={() => handleSaveConfig()}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow shadow-indigo-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Sauvegarde..." : "Enregistrer les Plans"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. AUDIT RULES/CRITERIA CUSTOMIZER */}
          {activeSubTab === "rules" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Règles & Barèmes d'Audit d'AdSense</h3>
                <p className="text-xs text-slate-400">Modifiez les critères d'évaluation d'audit de site web. Ajuster le barème de base (0-100%) influencera directement le calcul dynamique des notes des prochains scans.</p>
              </div>

              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {Object.keys(adminConfig.categories).map((catKey) => {
                  const catObj = adminConfig.categories[catKey];
                  return (
                    <div key={catKey} className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
                        <h4 className="text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">Module d'Audit : {catKey}</h4>
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Pondération (%) :</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={catObj.score}
                            onChange={(e) => handleRuleScoreEdit(catKey, parseInt(e.target.value) || 0)}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-bold dark:text-white text-center w-16 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Libellé d'affichage</label>
                        <input
                          type="text"
                          value={catObj.label}
                          onChange={(e) => handleRuleTextEdit(catKey, "label", e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Description explicative</label>
                        <input
                          type="text"
                          value={catObj.description}
                          onChange={(e) => handleRuleTextEdit(catKey, "description", e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium dark:text-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <button
                  onClick={() => handleSaveConfig()}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow shadow-indigo-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Sauvegarde..." : "Enregistrer les Paramètres d'Audit"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. HISTORY AUDITING */}
          {activeSubTab === "history" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Rapports d'Audits Utilisateurs</h3>
                  <p className="text-xs text-slate-400">Consultez l'ensemble des diagnostics générés par les utilisateurs et supprimez-les en mode modérateur.</p>
                </div>
                {scans.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-100 dark:border-rose-900/30 text-xs px-4 py-2 rounded-xl font-bold cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Vider l'historique d'audit</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
                {scans.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-12 text-center bg-slate-50/50 dark:bg-slate-950/10">Aucun diagnostic n'a encore été réalisé par les utilisateurs.</p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-mono uppercase text-[9px] border-b border-slate-100 dark:border-slate-850">
                      <tr>
                        <th className="p-4">Site Web Evalué</th>
                        <th className="p-4">Date de Scan</th>
                        <th className="p-4 text-center">Score Global</th>
                        <th className="p-4 text-center">Chances AdSense</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {scans.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10 transition">
                          <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{item.url}</td>
                          <td className="p-4 text-slate-400 font-medium">{new Date(item.timestamp).toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <span className="bg-slate-100 dark:bg-slate-800 font-bold px-2 py-1 rounded font-mono text-[10px] text-slate-700 dark:text-slate-300">
                              {item.overallScore}/100
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold font-mono text-indigo-600 dark:text-indigo-400">{item.probability}%</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteScan(item.id)}
                              className="text-rose-500 hover:text-rose-600 p-2 rounded-lg cursor-pointer transition"
                              title="Supprimer le rapport"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* 6. SYSTEM API LOGS */}
          {activeSubTab === "logs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Journaux système d'appels API (Logs)</h3>
                  <p className="text-xs text-slate-400 font-medium">Flux des 50 dernières requêtes HTTP de diagnostic et de requêtes Gemini transmises.</p>
                </div>
                <button
                  onClick={fetchLogsAndHistory}
                  disabled={fetchingData}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition text-slate-600 dark:text-slate-300"
                >
                  <RefreshCw className={`w-4 h-4 ${fetchingData ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="bg-slate-950 text-slate-300 font-mono text-[11px] p-5 rounded-2xl border border-slate-850 overflow-x-auto max-h-[400px] overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-8 text-center">[Vide] En attente de requêtes utilisateur...</p>
                ) : (
                  logs.map((lg) => {
                    const isErr = lg.status >= 400;
                    return (
                      <div key={lg.id} className="flex flex-col md:flex-row justify-between gap-1 border-b border-slate-900 pb-1.5 leading-normal">
                        <div className="flex gap-2 shrink-0">
                          <span className="text-indigo-400">[{new Date(lg.timestamp).toLocaleTimeString()}]</span>
                          <span className="text-emerald-400 font-bold">{lg.method}</span>
                          <span className="text-sky-300">{lg.endpoint}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-500 truncate max-w-[200px]" title={lg.urlRequested}>url: "{lg.urlRequested}"</span>
                          <span className={isErr ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                            status: {lg.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 8. GATEWAYS ACTIVATION & TRANSACTIONS DASHBOARD */}
          {activeSubTab === "payments" && (
            <div className="space-y-6 animate-fade-in" id="admin-payments-dashboard">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Opérations & Passerelles de Paiement</h3>
                  <p className="text-xs text-slate-400">Configurez l'activation en temps réel des modules de paiement Stripe/PayPal et visualisez le tableau de bord des opérations.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchLogsAndHistory}
                    disabled={fetchingData}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition text-slate-600 dark:text-slate-300 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${fetchingData ? "animate-spin" : ""}`} />
                    <span>Actualiser</span>
                  </button>
                  {payments.length > 0 && (
                    <button
                      onClick={handleClearAllPayments}
                      className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-100 dark:border-rose-900/30 text-xs px-3.5 py-2 rounded-xl font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vider l'historique</span>
                    </button>
                  )}
                </div>
              </div>

              {/* STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="payments-stats-grid">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Chiffre d'Affaires</span>
                  <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${payments.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Revenus cumulés sur les transactions finalisées.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Transactions Validées</span>
                  <p className="text-2xl font-bold font-mono text-slate-800 dark:text-white">
                    {payments.filter(p => p.status === "completed").length} <span className="text-xs text-slate-400">/ {payments.length}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Nombre de souscriptions SaaS payantes approuvées.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Taux de Succès</span>
                  <p className="text-2xl font-bold font-mono text-indigo-500">
                    {payments.length > 0 
                      ? Math.round((payments.filter(p => p.status === "completed").length / payments.length) * 100)
                      : 100}%
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Ratio de réussite des passerelles Stripe/PayPal.</p>
                </div>
              </div>

              {/* GATEWAYS ACTIVATION SYSTEM */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Activation en Temps Réel des Passerelles</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tentez d'activer ou désactiver les options de prélèvement. Les modifications prennent effet instantanément sur le portail de facturation SaaS.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stripe Active Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">Passerelle Stripe</h5>
                      </div>
                      <p className="text-[10px] text-slate-400">Paiement par carte de crédit/débit.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGateway("stripe")}
                      className="text-slate-500 hover:text-indigo-600 cursor-pointer transition"
                    >
                      {adminConfig.paymentSettings?.stripeActive !== false ? (
                        <ToggleRight className="w-10 h-10 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* PayPal Active Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">Passerelle PayPal</h5>
                      </div>
                      <p className="text-[10px] text-slate-400">Paiement express via PayPal Sandbox/Live.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGateway("paypal")}
                      className="text-slate-500 hover:text-indigo-600 cursor-pointer transition"
                    >
                      {adminConfig.paymentSettings?.paypalActive !== false ? (
                        <ToggleRight className="w-10 h-10 text-blue-500" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Paddle Active Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">Passerelle Paddle</h5>
                      </div>
                      <p className="text-[10px] text-slate-400">Paiements via l'environnement Paddle.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGateway("paddle")}
                      className="text-slate-500 hover:text-indigo-600 cursor-pointer transition"
                    >
                      {adminConfig.paymentSettings?.paddleActive !== false ? (
                        <ToggleRight className="w-10 h-10 text-sky-500" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* MANUAL GATEWAY CONFIGURATION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Configuration Manuelle des Clés d'API</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Saisissez manuellement vos clés Stripe, PayPal et Paddle pour connecter vos comptes réels ou de test.</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
                    Secured
                  </span>
                </div>

                <form onSubmit={handleSaveManualPaymentSettings} className="space-y-4">
                  {/* Global Settings */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl space-y-3 border border-slate-100 dark:border-slate-850/40">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <Settings className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Paramètres Généraux</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Devise de Facturation (Currency)</label>
                        <select
                          value={adminConfig?.paymentSettings?.currency || "EUR"}
                          onChange={(e) => handlePaymentSettingsChange("currency", e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="EUR">Euro (€) - EUR</option>
                          <option value="USD">Dollar US ($) - USD</option>
                          <option value="GBP">Livre Sterling (£) - GBP</option>
                          <option value="CAD">Dollar Canadien ($) - CAD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Stripe Credentials */}
                    <div className="bg-indigo-50/20 dark:bg-indigo-950/5 p-4 rounded-xl space-y-3 border border-indigo-100/50 dark:border-indigo-900/20">
                      <h5 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span>Identifiants Stripe</span>
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clé Publique (Publishable Key)</label>
                          <input
                            type="text"
                            placeholder="pk_test_..."
                            value={adminConfig?.paymentSettings?.stripePublicKey || ""}
                            onChange={(e) => handlePaymentSettingsChange("stripePublicKey", e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clé Secrète (Secret Key)</label>
                          <input
                            type="password"
                            placeholder="sk_test_..."
                            value={adminConfig?.paymentSettings?.stripeSecretKey || ""}
                            onChange={(e) => handlePaymentSettingsChange("stripeSecretKey", e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PayPal Credentials */}
                    <div className="bg-blue-50/20 dark:bg-blue-950/5 p-4 rounded-xl space-y-3 border border-blue-100/50 dark:border-blue-900/20">
                      <h5 className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Identifiants PayPal</span>
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ID Client (Client ID)</label>
                          <input
                            type="text"
                            placeholder="AQ_..."
                            value={adminConfig?.paymentSettings?.paypalClientId || ""}
                            onChange={(e) => handlePaymentSettingsChange("paypalClientId", e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clé Secrète (Secret Key)</label>
                          <input
                            type="password"
                            placeholder="EC_..."
                            value={adminConfig?.paymentSettings?.paypalSecretKey || ""}
                            onChange={(e) => handlePaymentSettingsChange("paypalSecretKey", e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mode d'Environnement</label>
                          <select
                            value={adminConfig?.paymentSettings?.paypalMode || "sandbox"}
                            onChange={(e) => handlePaymentSettingsChange("paypalMode", e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="sandbox">Sandbox (Mode Test)</option>
                            <option value="live">Live (Réel)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Paddle Credentials */}
                    <div className="bg-sky-50/20 dark:bg-sky-950/5 p-4 rounded-xl space-y-3 border border-sky-100/50 dark:border-sky-900/20">
                      <h5 className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span>Identifiants Paddle</span>
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ID Vendeur (Vendor ID)</label>
                          <input
                            type="text"
                            placeholder="12345..."
                            value={adminConfig?.paymentSettings?.paddleVendorId || ""}
                            onChange={(e) => handlePaymentSettingsChange("paddleVendorId", e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clé d'API (API Key / Auth)</label>
                          <input
                            type="password"
                            placeholder="pk_mock_paddle_..."
                            value={adminConfig?.paymentSettings?.paddleApiKey || ""}
                            onChange={(e) => handlePaymentSettingsChange("paddleApiKey", e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mode d'Environnement</label>
                          <select
                            value={adminConfig?.paymentSettings?.paddleMode || "sandbox"}
                            onChange={(e) => handlePaymentSettingsChange("paddleMode", e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="sandbox">Sandbox (Mode Test)</option>
                            <option value="live">Live (Réel)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/10"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? "Sauvegarde..." : "Enregistrer la Configuration"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* TABLEAU DE BORD: OPERATIONS LIST */}
              <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-b border-slate-150 dark:border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Registre Global de Toutes les Opérations</h4>
                </div>

                <div className="overflow-x-auto">
                  {payments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-12 text-center bg-slate-50/20 dark:bg-slate-950/5">Aucune opération de paiement enregistrée.</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/50 dark:bg-slate-950/80 text-slate-400 font-mono uppercase text-[9px] border-b border-slate-150 dark:border-slate-800">
                        <tr>
                          <th className="p-4">ID Transaction</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Plan / Cycle</th>
                          <th className="p-4">Gateway</th>
                          <th className="p-4 text-right">Montant</th>
                          <th className="p-4 text-center">Statut</th>
                          <th className="p-4 text-center">Actions de Modération</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10 transition">
                            <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-300">{p.id}</td>
                            <td className="p-4 space-y-0.5">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{p.userName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{p.userEmail || p.paypalEmail}</p>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">{p.planName}</span>
                              <span className="text-[10px] text-slate-400 block font-medium capitalize">{p.billingCycle}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.gateway === "stripe" 
                                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30" 
                                  : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                              }`}>
                                {p.gateway === "stripe" ? "Stripe (Card)" : "PayPal"}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-slate-800 dark:text-white">${p.amount}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                p.status === "completed" 
                                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" 
                                  : p.status === "failed" 
                                    ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                                    : p.status === "refunded"
                                      ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                                      : "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center items-center gap-1.5">
                                {/* Action: Complete */}
                                {p.status !== "completed" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePaymentStatus(p.id, "completed")}
                                    className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer"
                                    title="Approuver l'opération"
                                  >
                                    Approuver
                                  </button>
                                )}
                                {/* Action: Refund */}
                                {p.status === "completed" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePaymentStatus(p.id, "refunded")}
                                    className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer"
                                    title="Rembourser la transaction"
                                  >
                                    Rembourser
                                  </button>
                                )}
                                {/* Action: Fail */}
                                {p.status === "pending" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePaymentStatus(p.id, "failed")}
                                    className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer"
                                    title="Déclarer l'opération en échec"
                                  >
                                    Rejeter
                                  </button>
                                )}
                                {/* Action: Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleDeletePayment(p.id)}
                                  className="text-rose-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/10 rounded transition cursor-pointer"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7. SECURITY & CREDENTIALS RESET */}
          {activeSubTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Sécurité & Identifiants Administrateur</h3>
                <p className="text-xs text-slate-400">Modifiez de manière sécurisée votre mot de passe d'accès au panneau de contrôle.</p>
              </div>

              {passwordChangeSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl text-xs">
                  Mot de passe changé et mis à jour avec succès sur le serveur de stockage !
                </div>
              )}

              {passwordChangeError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 p-4 rounded-2xl text-xs">
                  {passwordChangeError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nom de compte (Non modifiable)</label>
                  <input
                    type="text"
                    disabled
                    value={adminConfig.adminUsername || "admin"}
                    className="w-full bg-slate-100 dark:bg-slate-800 opacity-60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">Nouveau mot de passe</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs"
                    placeholder="Entrez le nouveau mot de passe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">Confirmez le nouveau mot de passe</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs"
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition shadow"
                >
                  Changer mon mot de passe sécurisé
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
