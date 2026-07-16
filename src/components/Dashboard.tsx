import React, { useState } from "react";
import { AuditReport, CriteriaCheck, MetricScore } from "../types";
import { 
  Shield, CheckCircle2, AlertTriangle, XCircle, Download, FileJson, 
  FileSpreadsheet, ArrowUpRight, ArrowDownRight, Clock, HelpCircle, 
  Sparkles, FileText, Globe, Code, ArrowLeftRight, Printer, X
} from "lucide-react";
import { generateHTMLReport } from "../utils/reportExporter";

interface DashboardProps {
  report: AuditReport;
  previousReport?: AuditReport;
  onFixWithAI: (check: CriteriaCheck) => void;
  lang: string;
}

export default function Dashboard({ report, previousReport, onFixWithAI, lang }: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState<keyof AuditReport["categories"]>("adsense");
  const [exporting, setExporting] = useState(false);
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // Helper: Status styles
  const getStatusIcon = (status: "success" | "warning" | "error") => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
    }
  };

  const getStatusColor = (status: "success" | "warning" | "error") => {
    switch (status) {
      case "success":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      case "error":
        return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30";
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Category,Criteria Name,Status,Message,Impact\n";
    Object.values(report.categories).forEach((cat: MetricScore) => {
      cat.checks.forEach((chk: CriteriaCheck) => {
        csvContent += `"${cat.label}","${chk.name}","${chk.status}","${chk.message.replace(/"/g, '""')}","${chk.impact || "Medium"}"\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `publisher_audit_report_${report.url.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Exporter
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `publisher_audit_report_${report.url.replace(/[^a-zA-Z0-9]/g, "_")}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Standalone HTML Exporter (fully printable and responsive)
  const handleDownloadHTMLReport = () => {
    const htmlString = generateHTMLReport(report, lang);
    const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(htmlString);
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `executive_compliance_report_${report.url.replace(/[^a-zA-Z0-9]/g, "_")}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable HTML (simulates the PDF generator)
  const handlePrintPDF = () => {
    setShowPdfOptions(true);
  };

  // Helper: Comparer scores with previous reports
  const renderCompareDiff = (current: number, categoryKey: keyof AuditReport["categories"]) => {
    if (!previousReport) return null;
    const prev = previousReport.categories[categoryKey].score;
    const diff = current - prev;
    if (diff > 0) {
      return (
        <span className="flex items-center text-xs text-emerald-500 font-semibold" id={`diff-${categoryKey}`}>
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{diff}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-xs text-rose-500 font-semibold" id={`diff-${categoryKey}`}>
          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />{diff}
        </span>
      );
    }
    return (
      <span className="text-xs text-slate-400 font-medium" id={`diff-${categoryKey}`}>
        Stable
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-container">
      {/* Target URL Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 text-white rounded-2xl p-6 md:p-8 gap-6 shadow-xl shadow-slate-900/10" id="dashboard-header">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
              Audit Complete
            </span>
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" /> {new Date(report.timestamp).toLocaleString()}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-400" /> {report.url}
          </h2>
          <p className="text-sm text-slate-300">
            {lang === "FR" ? "Évaluation intelligente basée sur plus de 120 règles de conformité Google." : "Intelligent evaluation calibrated across more than 120 Google compliance rules."}
          </p>
        </div>

        {/* Exporters and Print action menu */}
        <div className="flex flex-wrap gap-2.5" id="exporters-menu">
          <button
            onClick={() => setShowPdfOptions(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            id="download-pdf-report-btn"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>Download PDF Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
            id="export-csv-btn"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
            id="export-json-btn"
          >
            <FileJson className="w-4 h-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Score Overviews: Circular Score & Approval Odds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="overview-scores">
        {/* Overall Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-6">
            {lang === "FR" ? "Score Global de Conformité" : "Overall Compliance Score"}
          </h3>
          <div className="relative flex items-center justify-center mb-4">
            {/* Simple Dynamic SVG Pie for Score */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-emerald-500 transition-all duration-1000"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * report.overallScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-bold font-mono text-slate-800 dark:text-white">
                {report.overallScore}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium px-4">
            {report.overallScore >= 80 
              ? (lang === "FR" ? "Excellent niveau technique et réglementaire." : "Outstanding technical and regulatory framework.") 
              : report.overallScore >= 50 
                ? (lang === "FR" ? "Niveau intermédiaire, corrections à planifier." : "Intermediate framework, corrections recommended.") 
                : (lang === "FR" ? "Risques de rejet critiques détectés." : "Critical rejection compliance liabilities identified.")}
          </p>
        </div>

        {/* AdSense Approval Probability */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">
                {lang === "FR" ? "Éligibilité Google AdSense" : "Google AdSense Readiness Chance"}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === "FR" ? "Probabilité calculée par rapport aux critères de politique éditoriale Google." : "Calculated alignment with Google Publisher network policies."}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              report.probability >= 85 
                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                : report.probability >= 50 
                  ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
                  : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
            }`}>
              {report.probabilityLabel}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold font-mono text-slate-800 dark:text-white">
                {report.probability}%
              </span>
              <span className="text-sm text-slate-400 font-semibold">
                {lang === "FR" ? "de chances d'approbation" : "probability threshold"}
              </span>
            </div>

            {/* Simulated progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  report.probability >= 85 ? "bg-emerald-500" : report.probability >= 50 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${report.probability}%` }}
              ></div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/60 flex gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                  {lang === "FR" ? "Recommandation Prioritaire de l'IA :" : "AI Smart Correction Priority:"}
                </p>
                <p>
                  {report.aiDiagnosis?.priorityFixes?.[0] || (lang === "FR" ? "Compléter le fichier ads.txt et les pages obligatoires." : "Ensure sitemap integrity and complete legal page variables.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Panel if active */}
      {previousReport && (
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "FR" ? "Comparaison active avec l'audit précédent de :" : "Actively comparing metrics with previous session of:"}
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded">
              {previousReport.url}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              {lang === "FR" ? "Score Global :" : "Global Score Delta:"}
            </span>
            <span className={`font-bold ${report.overallScore >= previousReport.overallScore ? "text-emerald-500" : "text-rose-500"}`}>
              {report.overallScore >= previousReport.overallScore ? "+" : ""}{report.overallScore - previousReport.overallScore}
            </span>
            <span className="text-slate-400">
              {lang === "FR" ? "AdSense Chance :" : "AdSense Odds Delta:"}
            </span>
            <span className={`font-bold ${report.probability >= previousReport.probability ? "text-emerald-500" : "text-rose-500"}`}>
              {report.probability >= previousReport.probability ? "+" : ""}{report.probability - previousReport.probability}
            </span>
          </div>
        </div>
      )}

      {/* Core Web Vitals and Content Metadata Quick Bento Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="metadata-bento">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Largest Contentful Paint</span>
          <p className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1">
            {report.metadata.coreWebVitals.lcp}s
          </p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-2 ${
            report.metadata.coreWebVitals.lcp < 2.5 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          }`}>
            {report.metadata.coreWebVitals.lcp < 2.5 ? "Good (< 2.5s)" : "Needs Work (> 2.5s)"}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Cumulative Layout Shift</span>
          <p className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1">
            {report.metadata.coreWebVitals.cls}
          </p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-2 ${
            report.metadata.coreWebVitals.cls < 0.1 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          }`}>
            {report.metadata.coreWebVitals.cls < 0.1 ? "Perfect (< 0.1)" : "Poor (> 0.25)"}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">AI Content Likelihood</span>
          <p className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1">
            {report.metadata.aiContentPercentage}%
          </p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-2 ${
            report.metadata.aiContentPercentage < 20 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
          }`}>
            {report.metadata.aiContentPercentage < 20 ? "Safe (Human)" : "AI Risk Warning"}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Total Text Count</span>
          <p className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1">
            {report.metadata.wordCount.toLocaleString()}
          </p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-2 ${
            report.metadata.wordCount > 10000 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          }`}>
            {report.metadata.wordCount > 10000 ? "Sufficient" : "Thin Content"}
          </span>
        </div>
      </div>

      {/* Categories Bento Grid Selector */}
      <div>
        <h3 className="text-slate-700 dark:text-slate-300 font-bold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-500" />
          <span>{lang === "FR" ? "Audit Détaillé par Catégorie" : "Category Checklist Explorer"}</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6" id="category-grid">
          {Object.entries(report.categories).map(([key, cat]) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key as any)}
                className={`flex flex-col items-center justify-between p-4 rounded-xl text-center border transition duration-300 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
                id={`category-tab-${key}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider block mb-2">
                  {key}
                </span>
                <span className="text-2xl font-bold font-mono block">
                  {cat.score}
                </span>
                <span className="text-[10px] mt-1.5 opacity-85 block truncate w-full">
                  {renderCompareDiff(cat.score, key as any) || (isActive ? "Active" : "View Details")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Details View */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" id="category-details-panel">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 mb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
                <span>{report.categories[activeCategory].label}</span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded font-mono">
                  {report.categories[activeCategory].score}/100
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {report.categories[activeCategory].description}
              </p>
            </div>
          </div>

          <div className="space-y-4" id="checks-list">
            {report.categories[activeCategory].checks.map((check) => (
              <div 
                key={check.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {check.name}
                      </span>
                      {check.impact && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          check.impact === "Critical" || check.impact === "High"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-slate-500/10 text-slate-500"
                        }`}>
                          {check.impact} Impact
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {check.message}
                    </p>
                    {check.details && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>

                {check.status !== "success" && check.fixSuggestion && (
                  <button
                    onClick={() => onFixWithAI(check)}
                    className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer self-start md:self-center shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === "FR" ? "Corriger via IA" : "Fix with AI"}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Technical Files Check: Ads.txt, Sitemap.xml, Robots.txt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="technical-files-grid">
        {/* Ads.txt card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Ads.txt Compliance</span>
            </h4>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusColor(report.adsTxt.status)}`}>
              {report.adsTxt.present ? "Detected" : "Missing"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {report.adsTxt.publisherId && (
              <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                google.com, {report.adsTxt.publisherId}, DIRECT, f08c47fec0942fa0
              </div>
            )}
            {report.adsTxt.errors.map((err, i) => (
              <div key={i} className="text-rose-500 flex items-start gap-1">
                <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            ))}
            {report.adsTxt.suggestions.map((sug, i) => (
              <div key={i} className="text-amber-500 flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{sug}</span>
              </div>
            ))}
            {report.adsTxt.present && (
              <p className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Syntax verified successfully.
              </p>
            )}
          </div>
        </div>

        {/* Robots.txt Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-500" />
              <span>Robots.txt Analysis</span>
            </h4>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusColor(report.robotsTxt.status)}`}>
              {report.robotsTxt.present ? "Active" : "Missing"}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>Rules parsed: <strong className="text-slate-800 dark:text-slate-100">{report.robotsTxt.rulesCount} directives</strong></p>
            <p>Sitemap declaration: {report.robotsTxt.sitemapDeclared ? (
              <span className="text-emerald-500 font-semibold">Active</span>
            ) : (
              <span className="text-rose-500 font-semibold">Missing link</span>
            )}</p>
            {!report.robotsTxt.present && (
              <p className="text-rose-500">Robots.txt is crucial for indexation speed.</p>
            )}
            {report.robotsTxt.present && (
              <p className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Format and rules syntax clean.
              </p>
            )}
          </div>
        </div>

        {/* Sitemap Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>XML Sitemap Integration</span>
            </h4>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusColor(report.sitemap.status)}`}>
              {report.sitemap.present ? "Present" : "Failed"}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>Crawled pages mapped: <strong className="text-slate-800 dark:text-slate-100">{report.sitemap.pagesCount}</strong></p>
            <p>Orphan indices detection: {report.sitemap.orphansDetected ? (
              <span className="text-rose-500 font-semibold font-mono">Warning</span>
            ) : (
              <span className="text-emerald-500 font-semibold font-mono">None</span>
            )}</p>
            {report.sitemap.present && (
              <p className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Indexable structure conforms.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PDF Export Options Modal */}
      {showPdfOptions && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="pdf-options-modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowPdfOptions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg text-indigo-500">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">
                    {lang === "FR" ? "Exporter le Rapport de Conformité" : "Export Compliance Report"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === "FR" ? "Choisissez votre format de téléchargement optimal." : "Select your preferred document delivery method."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Option 1: Standalone HTML */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="bg-indigo-500/10 text-indigo-500 font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      Recommended
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase font-mono">
                      Executive Offline file
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Instantly downloads an executive-ready, high-fidelity offline report file. Zero sandbox blockages. Includes dynamic score rings and a direct print-to-PDF button.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleDownloadHTMLReport();
                      setShowPdfOptions(false);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>

                {/* Option 2: Print Current Page */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="bg-slate-500/10 text-slate-500 font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      Native PDF
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase font-mono">
                      Browser Print Dial
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Opens your browser's native printer dialer so you can Save-to-PDF the live page.
                      <br/>
                      <strong className="text-[10px] text-amber-600 dark:text-amber-400">💡 Tip: Open the application in a "New Tab" first to allow browser print permissions.</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPdfOptions(false);
                      setTimeout(() => window.print(), 200);
                    }}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Open Print Menu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
