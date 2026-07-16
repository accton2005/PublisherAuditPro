export interface CriteriaCheck {
  id: string;
  category: "domain" | "security" | "seo" | "content" | "ux" | "legal" | "adsense";
  name: string;
  status: "success" | "warning" | "error";
  message: string;
  details?: string;
  impact?: string;
  fixSuggestion?: string;
}

export interface MetricScore {
  score: number; // 0 to 100
  label: string;
  description: string;
  checks: CriteriaCheck[];
}

export interface LegalPageCheck {
  found: boolean;
  url?: string;
  contentSnippet?: string;
  qualityScore: number; // 0 to 100
  issues: string[];
}

export interface AdsTxtCheck {
  present: boolean;
  status: "success" | "warning" | "error";
  publisherId?: string;
  errors: string[];
  suggestions: string[];
  syntaxOk: boolean;
}

export interface RobotsCheck {
  present: boolean;
  status: "success" | "warning" | "error";
  errors: string[];
  sitemapDeclared: boolean;
  rulesCount: number;
}

export interface SitemapCheck {
  present: boolean;
  status: "success" | "warning" | "error";
  pagesCount: number;
  errors: string[];
  orphansDetected: boolean;
}

export interface AuditReport {
  id: string;
  url: string;
  timestamp: string;
  overallScore: number;
  probability: number; // AdSense approval probability (%)
  probabilityLabel: "High Chance" | "Moderate Chance" | "Low Chance" | "Critical Issues";
  
  // Scored Categories
  categories: {
    domain: MetricScore;
    security: MetricScore;
    seo: MetricScore;
    content: MetricScore;
    ux: MetricScore;
    legal: MetricScore;
    adsense: MetricScore;
  };

  // Dedicated Components
  legalPages: {
    about: LegalPageCheck;
    contact: LegalPageCheck;
    privacy: LegalPageCheck;
    cookies: LegalPageCheck;
    terms: LegalPageCheck;
    disclaimer: LegalPageCheck;
    dmca: LegalPageCheck;
  };

  adsTxt: AdsTxtCheck;
  robotsTxt: RobotsCheck;
  sitemap: SitemapCheck;

  // Global Metadata
  metadata: {
    domainAge?: string;
    sslExpiry?: string;
    sslIssuer?: string;
    dnssec?: boolean;
    serverIp?: string;
    wordCount: number;
    aiContentPercentage: number;
    headings: { h1: number; h2: number; h3: number };
    loadTimeMs: number;
    coreWebVitals: {
      fcp: number; // seconds
      lcp: number; // seconds
      cls: number; // CLS value
      inp: number; // milliseconds
    };
  };

  // AI-generated summary
  aiDiagnosis?: {
    summary: string;
    whyPoor?: string;
    seoImpact: string;
    adsenseImpact: string;
    vitalsImpact: string;
    priorityFixes: string[];
  };
}

export interface APILog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  urlRequested: string;
}

export interface SaaSPlan {
  id: "free" | "starter" | "pro" | "agency" | "enterprise";
  name: string;
  priceMonthly: number;
  features: string[];
  limits: {
    pagesCrawled: number;
    dailyScans: number;
    monitoring: boolean;
    exportPdf: boolean;
    apiAccess: boolean;
    customBranding: boolean;
  };
}

export type SupportedLanguage = "FR" | "EN" | "ES" | "AR" | "DE";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  tags: string[];
  published: boolean;
}

export interface TranslationDict {
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  scanButton: string;
  scanningText: string;
  overallScore: string;
  adsenseChance: string;
  highChance: string;
  moderateChance: string;
  lowChance: string;
  criticalIssues: string;
  tabs: {
    dashboard: string;
    aiAssistant: string;
    apiPlayground: string;
    pricing: string;
    history: string;
  };
  metrics: {
    domain: string;
    security: string;
    seo: string;
    content: string;
    ux: string;
    legal: string;
    adsense: string;
  };
}
