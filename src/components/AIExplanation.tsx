import React, { useState, useEffect, useRef } from "react";
import { CriteriaCheck } from "../types";
import { 
  Sparkles, MessageSquare, ShieldAlert, FileText, Send, Copy, Check, 
  RefreshCw, Terminal, Eye, HelpCircle, Loader2
} from "lucide-react";

interface AIExplanationProps {
  activeFixCheck: CriteriaCheck | null;
  domain: string;
  lang: string;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function AIExplanation({ activeFixCheck, domain, lang }: AIExplanationProps) {
  const [activeTab, setActiveTab] = useState<"fixer" | "policy" | "coach">("fixer");
  
  // Fix with AI State
  const [fixCode, setFixCode] = useState("");
  const [loadingFix, setLoadingFix] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<CriteriaCheck | null>(activeFixCheck);
  const [copiedFix, setCopiedFix] = useState(false);

  // Policy Generator State
  const [policyType, setPolicyType] = useState("Privacy Policy");
  const [policyHtml, setPolicyHtml] = useState("");
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [copiedPolicy, setCopiedPolicy] = useState(false);

  // AI Coach Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync activeCheck change from parent
  useEffect(() => {
    if (activeFixCheck) {
      setSelectedCheck(activeFixCheck);
      setActiveTab("fixer");
      triggerFixGeneration(activeFixCheck);
    }
  }, [activeFixCheck]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Init chat default welcome message
  useEffect(() => {
    const welcomeText = lang === "FR" 
      ? `Bonjour ! Je suis votre Coach de Conformité AdSense. Posez-moi vos questions sur votre audit technique, l'optimisation SEO ou comment maximiser vos chances d'approbation.`
      : `Hello! I am your AI Compliance Coach. Ask me any questions regarding your technical audit, core web vitals optimization, or how to pass Google AdSense policy checks.`;
    setChatMessages([{ sender: "ai", text: welcomeText }]);
  }, [lang]);

  // Trigger Fix Generation via API
  const triggerFixGeneration = async (check: CriteriaCheck) => {
    setLoadingFix(true);
    setFixCode("");
    try {
      const res = await fetch("/api/fix-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: check.id,
          category: check.category,
          name: check.name,
          fixSuggestion: check.fixSuggestion,
          domain: domain || "mysite.com"
        })
      });
      const data = await res.json();
      setFixCode(data.fixCode || "/* No suggestion found. Check your server variables. */");
    } catch (err) {
      setFixCode("/* Error communicating with backend server to generate code. */");
    } finally {
      setLoadingFix(false);
    }
  };

  // Generate legal document via API
  const handleGeneratePolicy = async () => {
    setLoadingPolicy(true);
    setPolicyHtml("");
    try {
      const res = await fetch("/api/generate-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyType,
          domain: domain || "mysite.com"
        })
      });
      const data = await res.json();
      setPolicyHtml(data.policyHtml);
    } catch (err) {
      setPolicyHtml("<p>Error generating policy document. Standard template fallback was unsuccessful.</p>");
    } finally {
      setLoadingPolicy(false);
    }
  };

  // Chat message send handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setLoadingChat(true);

    try {
      const res = await fetch("/api/chat-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          domain: domain || "mysite.com"
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: "ai", text: data.answer || data.error || "Compliance details received." }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: "ai", text: "I apologize, my compliance processing proxy is busy. Please try asking again shortly." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Helper: Format message text with basic inline bold and lists
  const renderFormattedMessage = (text: string) => {
    return text.split("\n").map((line, index) => {
      let content = line;
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      if (isBullet) {
        content = line.trim().substring(2);
      }

      const parts = content.split(/(\*\*.*?\*\*)/g);
      const elements = parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={index} className="list-disc ml-4 my-1">
            {elements}
          </li>
        );
      }
      return (
        <p key={index} className={line.trim() === "" ? "h-2" : "my-1.5"}>
          {elements}
        </p>
      );
    });
  };

  // Copy handler helpers
  const handleCopy = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden" id="ai-hub-container">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-950/40 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          <h3 className="font-bold text-slate-800 dark:text-white">
            {lang === "FR" ? "Centre d'Assistance IA" : "AI Copilot Workspace"}
          </h3>
        </div>
        <span className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/30">
          Gemini 3.5 Flash Active
        </span>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 dark:border-slate-800" id="ai-tabs">
        <button
          onClick={() => setActiveTab("fixer")}
          className={`flex-1 py-3 text-center text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === "fixer"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
          id="tab-fixer"
        >
          <Terminal className="w-4 h-4" />
          <span>{lang === "FR" ? "Correcteur de Code" : "Fix with AI"}</span>
        </button>

        <button
          onClick={() => setActiveTab("policy")}
          className={`flex-1 py-3 text-center text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === "policy"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
          id="tab-policy"
        >
          <FileText className="w-4 h-4" />
          <span>{lang === "FR" ? "Générateur Légal" : "SaaS Legal Writer"}</span>
        </button>

        <button
          onClick={() => setActiveTab("coach")}
          className={`flex-1 py-3 text-center text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === "coach"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
          id="tab-coach"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{lang === "FR" ? "Coach de Conformité" : "AI Compliance Coach"}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {/* TAB: CODE FIXER */}
        {activeTab === "fixer" && (
          <div className="space-y-4 animate-fade-in" id="panel-fixer">
            {selectedCheck ? (
              <>
                <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                      {selectedCheck.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedCheck.message}
                    </p>
                  </div>
                  <button
                    onClick={() => triggerFixGeneration(selectedCheck)}
                    disabled={loadingFix}
                    className="text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-md flex items-center gap-1 transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingFix ? "animate-spin" : ""}`} />
                    <span>Regenerate</span>
                  </button>
                </div>

                {/* Code Terminal Output */}
                <div className="relative group">
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <button
                      onClick={() => handleCopy(fixCode, setCopiedFix)}
                      disabled={!fixCode}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1.5 rounded border border-slate-700 transition"
                      title="Copy code"
                    >
                      {copiedFix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto min-h-[160px] border border-slate-800">
                    {loadingFix ? (
                      <div className="flex flex-col items-center justify-center py-10 space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="text-slate-400 font-sans text-xs">Writing customized fix code instructions...</span>
                      </div>
                    ) : fixCode ? (
                      <pre className="whitespace-pre">{fixCode}</pre>
                    ) : (
                      <div className="text-slate-500 italic py-10 text-center font-sans">
                        Click "Corriger via IA" next to any check on your dashboard, or choose an issue above.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-60 text-indigo-500" />
                <p className="font-medium text-sm">
                  {lang === "FR" ? "Aucune erreur sélectionnée" : "No failing issue selected"}
                </p>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  {lang === "FR" ? "Retournez sur le dashboard et cliquez sur le bouton 'Corriger via IA' pour générer un correctif adapté." : "Navigate to the Category Checklist Explorer and click 'Fix with AI' to generate custom code block direct-fixes."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: LEGAL POLICY */}
        {activeTab === "policy" && (
          <div className="space-y-4 animate-fade-in" id="panel-policy">
            <div className="flex gap-2">
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option>Privacy Policy</option>
                <option>Cookies Policy</option>
                <option>Terms & Conditions</option>
              </select>
              <button
                onClick={handleGeneratePolicy}
                disabled={loadingPolicy}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loadingPolicy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Generate</span>
              </button>
            </div>

            <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-950/60 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-500 dark:text-slate-400">HTML Preview</span>
                {policyHtml && (
                  <button
                    onClick={() => handleCopy(policyHtml, setCopiedPolicy)}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-slate-500"
                  >
                    {copiedPolicy ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPolicy ? "Copied" : "Copy Source"}</span>
                  </button>
                )}
              </div>

              <div className="p-5 font-sans prose prose-sm max-w-none max-h-[350px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
                {loadingPolicy ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <span className="text-xs text-slate-400">Generating compliant standard layout draft...</span>
                  </div>
                ) : policyHtml ? (
                  <div className="space-y-4" dangerouslySetInnerHTML={{ __html: policyHtml }} />
                ) : (
                  <p className="text-slate-400 italic text-center py-20 text-xs">
                    Configure your policy option and click "Generate" to write customized legal policies for {domain || "your domain"}.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMPLIANCE COACH */}
        {activeTab === "coach" && (
          <div className="flex flex-col h-[400px] justify-between animate-fade-in" id="panel-coach">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-tr-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-200/40 dark:border-slate-700/40"
                  }`}>
                    {renderFormattedMessage(msg.text)}
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 border border-slate-200/40 dark:border-slate-700/40 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-xs text-slate-400">Coach is reviewing guidelines...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === "FR" ? "Posez une question sur AdSense..." : "Ask your AdSense coach a question..."}
                disabled={loadingChat}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loadingChat}
                className="bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-xl px-4 hover:opacity-90 transition flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
