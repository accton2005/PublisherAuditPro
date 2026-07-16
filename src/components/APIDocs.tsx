import React, { useState, useEffect } from "react";
import { Terminal, Globe, Send, Copy, Check, Play, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { APILog } from "../types";

interface APIDocsProps {
  lang: string;
}

export default function APIDocs({ lang }: APIDocsProps) {
  const [activeEndpoint, setActiveEndpoint] = useState("scan");
  const [copiedKey, setCopiedKey] = useState(false);
  const [sandboxUrl, setSandboxUrl] = useState("https://myblogsite.com");
  const [policyType, setPolicyType] = useState("Privacy Policy");
  
  // Sandbox execution state
  const [executing, setExecuting] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  // Server-side Logs
  const [serverLogs, setServerLogs] = useState<APILog[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  const apiKey = "api_pub_live_68e4a9e3bc82103328f0";

  const fetchServerLogs = async () => {
    setFetchingLogs(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setServerLogs(data);
    } catch (err) {
      console.error("Failed to fetch server logs", err);
    } finally {
      setFetchingLogs(false);
    }
  };

  useEffect(() => {
    fetchServerLogs();
    const interval = setInterval(fetchServerLogs, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Sandbox Runner
  const handleExecuteSandbox = async () => {
    setExecuting(true);
    setSandboxResponse(null);
    setResponseStatus(null);
    setLatency(null);

    const startTime = performance.now();
    try {
      let endpoint = "/api/scan";
      let payload: any = { url: sandboxUrl };

      if (activeEndpoint === "policy") {
        endpoint = "/api/generate-policy";
        payload = { policyType, domain: sandboxUrl.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0] };
      } else if (activeEndpoint === "fix") {
        endpoint = "/api/fix-with-ai";
        payload = {
          name: "Cumulative Layout Shift (CLS) warning",
          category: "ux",
          fixSuggestion: "Explicit image dimensions config",
          domain: sandboxUrl.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const endTime = performance.now();

      setResponseStatus(res.status);
      setSandboxResponse(data);
      setLatency(Math.round(endTime - startTime));
      fetchServerLogs(); // Update logs
    } catch (err: any) {
      setSandboxResponse({ error: err.message || "Failed to execute sandbox request" });
      setResponseStatus(500);
    } finally {
      setExecuting(false);
    }
  };

  const copyToClipboard = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="api-developer-hub">
      {/* Overview Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-500" />
            <span>Developer Public API Sandbox</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === "FR" ? "Intégrez les outils de diagnostic Publisher Audit Pro dans vos outils internes." : "Programmatically integrate Publisher Audit Pro diagnostics directly into your custom pipelines."}
          </p>
        </div>

        {/* API Token Box */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3 w-full md:w-auto">
          <div className="font-mono text-xs text-slate-500 shrink-0">Authorization Header:</div>
          <div className="font-mono text-xs text-slate-800 dark:text-slate-200 font-semibold bg-white dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <span>Bearer {apiKey.slice(0, 10)}...</span>
            <button
              onClick={() => copyToClipboard(`Bearer ${apiKey}`, setCopiedKey)}
              className="text-slate-400 hover:text-indigo-500 transition cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="sandbox-and-documentation">
        {/* API ENDPOINT SELECTOR & DESCRIPTION */}
        <div className="space-y-6" id="endpoints-documentation-pane">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              {lang === "FR" ? "Référence des Endpoints" : "REST Endpoint Reference"}
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setActiveEndpoint("scan")}
                className={`w-full text-left p-3.5 rounded-xl border transition flex justify-between items-center cursor-pointer ${
                  activeEndpoint === "scan"
                    ? "bg-indigo-50/40 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-900"
                    : "bg-transparent border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="bg-emerald-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">POST</span>
                  <span className="font-mono text-xs text-slate-800 dark:text-slate-200">/api/scan</span>
                </div>
                <span className="text-[10px] text-slate-400">Trigger Full Audit</span>
              </button>

              <button
                onClick={() => setActiveEndpoint("policy")}
                className={`w-full text-left p-3.5 rounded-xl border transition flex justify-between items-center cursor-pointer ${
                  activeEndpoint === "policy"
                    ? "bg-indigo-50/40 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-900"
                    : "bg-transparent border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="bg-emerald-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">POST</span>
                  <span className="font-mono text-xs text-slate-800 dark:text-slate-200">/api/generate-policy</span>
                </div>
                <span className="text-[10px] text-slate-400">Legal Policy Draft</span>
              </button>

              <button
                onClick={() => setActiveEndpoint("fix")}
                className={`w-full text-left p-3.5 rounded-xl border transition flex justify-between items-center cursor-pointer ${
                  activeEndpoint === "fix"
                    ? "bg-indigo-50/40 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-900"
                    : "bg-transparent border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="bg-emerald-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">POST</span>
                  <span className="font-mono text-xs text-slate-800 dark:text-slate-200">/api/fix-with-ai</span>
                </div>
                <span className="text-[10px] text-slate-400">AI Code Corrections</span>
              </button>
            </div>

            {/* Request Schema parameters description */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wide">
                Request Payload Parameters
              </h4>
              <div className="space-y-3 text-xs" id="payload-parameters">
                {activeEndpoint === "scan" && (
                  <div>
                    <div className="flex items-center justify-between font-mono mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">url</span>
                      <span className="text-rose-500 font-semibold">required • string</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">The absolute website URL to execute evaluations and check against 120 compliance directives.</p>
                  </div>
                )}
                {activeEndpoint === "policy" && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between font-mono mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">policyType</span>
                        <span className="text-rose-500 font-semibold">required • string</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">Values: <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded">Privacy Policy</code>, <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded">Cookies Policy</code>, or <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded">Terms & Conditions</code>.</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between font-mono mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">domain</span>
                        <span className="text-rose-500 font-semibold">required • string</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">The registered root domain string used to configure localized policies.</p>
                    </div>
                  </div>
                )}
                {activeEndpoint === "fix" && (
                  <div>
                    <div className="flex items-center justify-between font-mono mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">name</span>
                      <span className="text-rose-500 font-semibold">required • string</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">A detailed description of the failing technical checkbox parameter to fix via Generative AI.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* API SANDBOX PLAYGROUND */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-slate-200 flex flex-col justify-between" id="api-sandbox-pane">
          {/* Playground Header */}
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono text-slate-300">SANDBOX CONSOLE</span>
            </div>
            {responseStatus && (
              <div className="flex items-center gap-3 font-mono text-xs">
                <span>Status: <strong className={responseStatus === 200 ? "text-emerald-400" : "text-rose-400"}>{responseStatus}</strong></span>
                {latency && <span className="text-slate-500">({latency}ms)</span>}
              </div>
            )}
          </div>

          {/* Configuration Inputs inside console */}
          <div className="p-6 space-y-4 border-b border-slate-800/60">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase">URL Target Parameters</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sandboxUrl}
                  onChange={(e) => setSandboxUrl(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono outline-none text-white focus:border-indigo-500 flex-1"
                />
                {activeEndpoint === "policy" && (
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono outline-none text-white"
                  >
                    <option>Privacy Policy</option>
                    <option>Cookies Policy</option>
                    <option>Terms & Conditions</option>
                  </select>
                )}
                <button
                  onClick={handleExecuteSandbox}
                  disabled={executing}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Execute</span>
                </button>
              </div>
            </div>
          </div>

          {/* Output Shell console */}
          <div className="p-6 flex-1 bg-slate-950/80 font-mono text-xs text-slate-300 min-h-[220px] max-h-[300px] overflow-y-auto">
            {sandboxResponse ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(sandboxResponse, null, 2)}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 italic text-center font-sans">
                Configure variables and click "Execute" to trigger a simulated raw HTTP client transaction with full server payload returns.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE API TELEMETRY LOGS MONITOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4" id="api-telemetry-monitor">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>Live Server Telemetry Logs</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Displays real-time proxy API activity occurring on port 3000.</p>
          </div>
          <button
            onClick={fetchServerLogs}
            disabled={fetchingLogs}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition text-slate-500"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingLogs ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="space-y-2 max-h-[240px] overflow-y-auto font-mono text-[11px]">
          {serverLogs.length === 0 ? (
            <p className="text-slate-400 italic text-center py-8">No requests recorded on this session yet. Launch a scan above to trigger events.</p>
          ) : (
            serverLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="bg-indigo-500/10 text-indigo-500 font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0">{log.method}</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{log.endpoint}</span>
                  <span className="text-slate-400 hidden md:inline truncate max-w-[200px]">{log.urlRequested}</span>
                </div>
                <span className={`font-bold ${log.status === 200 ? "text-emerald-500" : "text-rose-500"}`}>
                  {log.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
