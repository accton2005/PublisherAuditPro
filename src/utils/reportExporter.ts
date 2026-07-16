import { AuditReport, CriteriaCheck, MetricScore } from "../types";

export function generateHTMLReport(report: AuditReport, lang: string): string {
  const isFR = lang === "FR";

  // Build rows of categories
  const categoriesList = Object.entries(report.categories).map(([key, cat]: [string, MetricScore]) => {
    const checksRows = cat.checks.map((chk: CriteriaCheck) => {
      const badgeColor = 
        chk.status === "success" ? "background-color: #d1fae5; color: #065f46;" :
        chk.status === "warning" ? "background-color: #fef3c7; color: #92400e;" :
        "background-color: #fee2e2; color: #991b1b;";
      
      const symbol = 
        chk.status === "success" ? "✓" :
        chk.status === "warning" ? "⚠" : "✗";

      return `
        <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
          <div>
            <div style="font-weight: 600; font-size: 13px; color: #1e293b; display: flex; align-items: center; gap: 6px;">
              <span style="${badgeColor} border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: bold;">${symbol} ${chk.status.toUpperCase()}</span>
              <span>${chk.name}</span>
            </div>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">${chk.message}</p>
            ${chk.details ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-style: italic;">${chk.details}</p>` : ""}
          </div>
          ${chk.impact ? `<span style="font-size: 11px; font-weight: 500; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569; white-space: nowrap;">${chk.impact} Impact</span>` : ""}
        </div>
      `;
    }).join("");

    return `
      <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); page-break-inside: avoid;">
        <div style="background-color: #f8fafc; padding: 14px 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif;">${cat.label}</h3>
          <span style="font-weight: bold; background-color: #e2e8f0; padding: 4px 10px; border-radius: 20px; font-size: 12px; color: #1e293b;">Score: ${cat.score}/100</span>
        </div>
        <div style="padding: 6px 0;">
          ${checksRows}
        </div>
      </div>
    `;
  }).join("");

  // Build compliance status elements
  const adsTxtHTML = `
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; flex: 1; min-width: 250px; page-break-inside: avoid;">
      <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #334155;">Ads.txt Compliance</h4>
      <div style="font-size: 12px; color: #475569;">
        <p>Status: <strong>${report.adsTxt.present ? "Detected" : "Missing"}</strong></p>
        ${report.adsTxt.publisherId ? `<p>Publisher ID: <code>${report.adsTxt.publisherId}</code></p>` : ""}
        ${report.adsTxt.errors.length ? `<p style="color: #ef4444;">✗ ${report.adsTxt.errors[0]}</p>` : ""}
      </div>
    </div>
  `;

  const robotsHTML = `
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; flex: 1; min-width: 250px; page-break-inside: avoid;">
      <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #334155;">Robots.txt Analysis</h4>
      <div style="font-size: 12px; color: #475569;">
        <p>Directives Found: <strong>${report.robotsTxt.rulesCount}</strong></p>
        <p>Sitemap Listed: <strong>${report.robotsTxt.sitemapDeclared ? "Yes" : "No"}</strong></p>
      </div>
    </div>
  `;

  const sitemapHTML = `
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; flex: 1; min-width: 250px; page-break-inside: avoid;">
      <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #334155;">XML Sitemap</h4>
      <div style="font-size: 12px; color: #475569;">
        <p>Pages Crawled: <strong>${report.sitemap.pagesCount}</strong></p>
        <p>Orphan Warnings: <strong>${report.sitemap.orphansDetected ? "Yes" : "None"}</strong></p>
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="${lang.toLowerCase()}">
<head>
  <meta charset="UTF-8">
  <title>Executive Compliance Audit Report - ${report.url.replace(/^(https?:\/\/)?(www\.)?/, "")}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .container {
      max-width: 880px;
      margin: 0 auto;
    }
    .header {
      background: #0f172a;
      color: white;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      box-shadow: 0 4px 20px rgba(15,23,42,0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 0;
      color: #94a3b8;
      font-size: 13px;
    }
    .badge {
      background-color: #10b981;
      color: white;
      padding: 4px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      display: inline-block;
    }
    .score-circle-container {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .score-circle {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      border: 8px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      background: white;
      box-sizing: border-box;
    }
    .score-circle-value {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1;
    }
    .score-circle-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 16px 0;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .btn-print {
      background-color: #4f46e5;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }
    .btn-print:hover {
      background-color: #4338ca;
    }
    .no-print {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    .grid-three {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      background: #f1f5f9;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 11px;
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .container {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print">
      <button class="btn-print" onclick="window.print()">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Save as / Print PDF
      </button>
    </div>

    <div class="header">
      <div>
        <span class="badge">AdSense Eligibility Audit</span>
        <h1 style="margin-top: 8px;">PUBLISHER AUDIT PRO REPORT</h1>
        <p>Target URL: <strong style="color: white; font-family: 'JetBrains Mono', monospace;">${report.url}</strong></p>
      </div>
      <div style="text-align: right; color: #94a3b8; font-size: 12px;">
        <p>Audit Session ID: ${report.id}</p>
        <p>Timestamp: ${new Date(report.timestamp).toLocaleString()}</p>
      </div>
    </div>

    <div class="score-circle-container">
      <div class="score-circle" style="border-color: ${report.overallScore >= 80 ? '#10b981' : report.overallScore >= 50 ? '#f59e0b' : '#ef4444'}">
        <span class="score-circle-value">${report.overallScore}</span>
        <span class="score-circle-label">Score</span>
      </div>
      <div style="flex-1">
        <h2 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
          AdSense Approval Probability: <span style="color: ${report.probability >= 85 ? '#10b981' : report.probability >= 50 ? '#f59e0b' : '#ef4444'}">${report.probability}%</span> (${report.probabilityLabel})
        </h2>
        <p style="margin: 0; color: #475569; font-size: 13px;">
          ${isFR ? "Cet audit technique certifie l'adéquation de l'architecture du site aux directives du réseau Google Publisher." : "This automated evaluation certifies the target domain's conformity score index matching major publisher networks guidelines."}
        </p>
        ${report.aiDiagnosis?.summary ? `
          <div style="background-color: #f8fafc; border-left: 3px solid #6366f1; padding: 12px; border-radius: 4px; margin-top: 12px; font-size: 12px; color: #334155;">
            <strong>AI Diagnosis Summary:</strong> ${report.aiDiagnosis.summary}
          </div>
        ` : ""}
      </div>
    </div>

    <h2 class="section-title">Critical Assets Verification</h2>
    <div class="grid-three">
      ${adsTxtHTML}
      ${robotsHTML}
      ${sitemapHTML}
    </div>

    <h2 class="section-title">Detailed Metric Categories Breakdown</h2>
    <div class="categories-container">
      ${categoriesList}
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 11px;">
      © ${new Date().getFullYear()} Publisher Audit Pro. Generated via Google Gemini & React Engine.
    </div>
  </div>
</body>
</html>`;
}
