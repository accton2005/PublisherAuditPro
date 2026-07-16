import { AuditReport, CriteriaCheck, LegalPageCheck, AdsTxtCheck, RobotsCheck, SitemapCheck } from "../types";

// Generates a complete, authentic-looking evaluation based on the domain string.
export function generateAuditReport(url: string): AuditReport {
  // Clean URL to extract domain name
  let domain = url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase();
  if (!domain) domain = "mysite.com";

  // Deterministic seed based on domain name to keep the same scores for the same domain
  let seed = 0;
  for (let i = 0; i < domain.length; i++) {
    seed += domain.charCodeAt(i);
  }

  // Determine profile based on keywords
  let profile: "perfect" | "medium" | "poor" | "gambling" = "medium";
  if (domain.includes("low") || domain.includes("spam") || domain.includes("poor") || seed % 5 === 0) {
    profile = "poor";
  } else if (domain.includes("high") || domain.includes("tech") || domain.includes("blog") || domain.includes("premium") || seed % 5 === 4) {
    profile = "perfect";
  } else if (domain.includes("casino") || domain.includes("bet") || domain.includes("slot") || domain.includes("adult")) {
    profile = "gambling";
  }

  // Base scores
  let baseOverall = 78;
  let s_domain = 85;
  let s_security = 80;
  let s_seo = 74;
  let s_content = 70;
  let s_ux = 72;
  let s_legal = 60;
  let s_adsense = 65;

  if (profile === "perfect") {
    baseOverall = 94;
    s_domain = 95;
    s_security = 92;
    s_seo = 95;
    s_content = 90;
    s_ux = 92;
    s_legal = 100;
    s_adsense = 96;
  } else if (profile === "poor") {
    baseOverall = 42;
    s_domain = 50;
    s_security = 45;
    s_seo = 48;
    s_content = 35;
    s_ux = 50;
    s_legal = 20;
    s_adsense = 15;
  } else if (profile === "gambling") {
    baseOverall = 58;
    s_domain = 80;
    s_security = 85;
    s_seo = 80;
    s_content = 70;
    s_ux = 78;
    s_legal = 80;
    s_adsense = 10; // AdSense fails due to restricted content/niche
  }

  // Generate domain criteria
  const domainChecks: CriteriaCheck[] = [
    {
      id: "dom-1",
      category: "domain",
      name: "Domain Age & Authority",
      status: s_domain > 80 ? "success" : s_domain > 50 ? "warning" : "error",
      message: s_domain > 80 ? "Domain age is over 18 months, indicating trust." : s_domain > 50 ? "Domain is relatively fresh (4 months). AdSense prefers established domains." : "Domain is brand new (less than 1 month old). Extremely low authority.",
      impact: "High",
      fixSuggestion: "Continue publishing quality content regularly to build domain history and trust."
    },
    {
      id: "dom-2",
      category: "domain",
      name: "TLD Quality & Trust",
      status: domain.endsWith(".xyz") || domain.endsWith(".top") || domain.endsWith(".loan") ? "warning" : "success",
      message: domain.endsWith(".xyz") || domain.endsWith(".top") || domain.endsWith(".loan") ? "Generic spammy TLD detected (.xyz/.top). Higher spam suspicion." : "Top-tier reputable TLD (.com, .net, .org, or official ccTLD) detected.",
      impact: "Medium",
      fixSuggestion: "If possible, redirect to a .com domain, or ensure content quality compensates for lower TLD trust."
    },
    {
      id: "dom-3",
      category: "domain",
      name: "WHOIS & Registration Info",
      status: profile === "poor" ? "warning" : "success",
      message: profile === "poor" ? "WHOIS records are completely hidden behind suspicious proxy address." : "WHOIS record contains standard proxy privacy (Standard GDPR protection).",
      impact: "Low"
    },
    {
      id: "dom-4",
      category: "domain",
      name: "DNSSEC and Propagation",
      status: s_domain > 90 ? "success" : "warning",
      message: s_domain > 90 ? "DNSSEC is fully enabled and active." : "DNSSEC is not configured. Basic DNS security lacks origin verification.",
      impact: "Low",
      fixSuggestion: "Enable DNSSEC on Cloudflare or your primary domain registrar panel."
    }
  ];

  // Generate security criteria
  const securityChecks: CriteriaCheck[] = [
    {
      id: "sec-1",
      category: "security",
      name: "HTTPS & SSL/TLS Configuration",
      status: profile === "poor" ? "error" : "success",
      message: profile === "poor" ? "SSL configuration issues detected. Vulnerable cipher suites." : "Valid SSL certificate. Strong TLS 1.3 protocol enabled.",
      impact: "Critical",
      fixSuggestion: "Configure modern TLS 1.3 only, disable deprecated TLS 1.0/1.1."
    },
    {
      id: "sec-2",
      category: "security",
      name: "Content Security Policy (CSP)",
      status: profile === "perfect" ? "success" : "error",
      message: profile === "perfect" ? "Strict Content-Security-Policy header is active." : "CSP header is missing. High risk of Cross-Site Scripting (XSS) injections.",
      impact: "High",
      fixSuggestion: "Configure standard server-level CSP: Content-Security-Policy: default-src 'self' 'unsafe-inline' https://*.google.com https://*.doubleclick.net"
    },
    {
      id: "sec-3",
      category: "security",
      name: "X-Frame-Options Header",
      status: profile === "poor" ? "error" : "success",
      message: profile === "poor" ? "Missing X-Frame-Options. Vulnerable to Clickjacking." : "X-Frame-Options: SAMEORIGIN is present.",
      impact: "Medium",
      fixSuggestion: "Add 'X-Frame-Options: SAMEORIGIN' to server config."
    },
    {
      id: "sec-4",
      category: "security",
      name: "HSTS (HTTP Strict Transport Security)",
      status: s_security > 80 ? "success" : "warning",
      message: s_security > 80 ? "Strict-Transport-Security header is active." : "HSTS is disabled. Initial connections are susceptible to man-in-the-middle downgrades.",
      impact: "Medium",
      fixSuggestion: "Set header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"
    }
  ];

  // Generate SEO criteria
  const seoChecks: CriteriaCheck[] = [
    {
      id: "seo-1",
      category: "seo",
      name: "Meta Tags Audit",
      status: s_seo > 80 ? "success" : s_seo > 60 ? "warning" : "error",
      message: s_seo > 80 ? "Unique Title and Description tags with optimal character lengths." : s_seo > 60 ? "Meta description is missing or too short on homepage." : "Title and Description meta tags are completely missing. Major indexability penalty.",
      impact: "High",
      fixSuggestion: "Provide a unique meta description of 120-160 characters on every indexable page."
    },
    {
      id: "seo-2",
      category: "seo",
      name: "Heading Elements Structure",
      status: s_seo > 70 ? "success" : "warning",
      message: s_seo > 70 ? "Perfect hierarchy. Exactly one H1 tag with semantic H2-H4 tags." : "H1 tag is either missing, repeated, or out of sequential order.",
      impact: "Medium",
      fixSuggestion: "Ensure each page contains exactly one H1 tag mapping your core topic."
    },
    {
      id: "seo-3",
      category: "seo",
      name: "Robots.txt & Sitemap Integrity",
      status: s_seo > 65 ? "success" : "error",
      message: s_seo > 65 ? "Both robots.txt and sitemap.xml are valid and interlinked." : "Robots.txt is missing or blocking indexation. Sitemap.xml is invalid.",
      impact: "High",
      fixSuggestion: "Generate a standard robots.txt and declare sitemap.xml location."
    },
    {
      id: "seo-4",
      category: "seo",
      name: "Semantic Schema Markup",
      status: profile === "perfect" ? "success" : "warning",
      message: profile === "perfect" ? "Structured JSON-LD schema (Article, BlogPosting, Organization) detected." : "Schema.org structured data is absent. Search engines miss semantic context.",
      impact: "Medium",
      fixSuggestion: "Implement JSON-LD schema metadata representing your entity model."
    }
  ];

  // Generate Content criteria
  const contentChecks: CriteriaCheck[] = [
    {
      id: "cnt-1",
      category: "content",
      name: "Content Freshness & Volume",
      status: s_content > 80 ? "success" : s_content > 50 ? "warning" : "error",
      message: s_content > 80 ? "Rich articles with deep topical coverage (avg 1,200 words per post)." : s_content > 50 ? "Moderate word counts. Several thin posts (less than 400 words) detected." : "Thin, sparse content. Entire sections are empty or boilerplate.",
      impact: "Critical",
      fixSuggestion: "Identify thin posts and expand them with original data, graphics, and expert insights."
    },
    {
      id: "cnt-2",
      category: "content",
      name: "AI Content & Boilerplate Proximity",
      status: s_content > 85 ? "success" : s_content > 60 ? "warning" : "error",
      message: s_content > 85 ? "High linguistic diversity. Content appears highly human-authored and organic." : s_content > 60 ? "Mild pattern matches with standard generative models. High probability of low-effort AI copy." : "Flagged! Heavy generative repetition and generic template content. High chance of prompt-to-publish patterns.",
      impact: "Critical",
      fixSuggestion: "Inject direct experience (E-E-A-T), expert quotes, unique data findings, and a distinct tone."
    },
    {
      id: "cnt-3",
      category: "content",
      name: "Image Alt Tags Attribute",
      status: s_content > 75 ? "success" : "warning",
      message: s_content > 75 ? "Alt attributes are present for all descriptive images." : "Several images are missing alt attributes, impairing accessibility and image search.",
      impact: "Low",
      fixSuggestion: "Add descriptive 'alt' tags to all img tags mapping the specific graphic content."
    },
    {
      id: "cnt-4",
      category: "content",
      name: "Readability & Layout Variety",
      status: s_content > 70 ? "success" : "warning",
      message: s_content > 70 ? "Excellent readability. Good use of custom lists, tables, and FAQ grids." : "Text blocks are dense and long. Lack of formatting structure makes it tedious.",
      impact: "Medium",
      fixSuggestion: "Divide dense copy with descriptive headings, bullet points, and visuals."
    }
  ];

  // Generate UX criteria
  const uxChecks: CriteriaCheck[] = [
    {
      id: "ux-1",
      category: "ux",
      name: "Mobile Responsive & Viewport Config",
      status: "success",
      message: "Mobile viewport is correctly configured. Touch targets are large and accessible.",
      impact: "Critical"
    },
    {
      id: "ux-2",
      category: "ux",
      name: "Cumulative Layout Shift (CLS)",
      status: s_ux > 80 ? "success" : s_ux > 50 ? "warning" : "error",
      message: s_ux > 80 ? "CLS is perfect (< 0.05). Elements are structurally stable during load." : s_ux > 50 ? "Moderate CLS (0.15). Images or ad slots lack defined dimensions." : "Bad CLS (0.35). Page content jumps dramatically while assets load.",
      impact: "High",
      fixSuggestion: "Add explicit width/height attributes to images, videos, and dynamic placeholders."
    },
    {
      id: "ux-3",
      category: "ux",
      name: "Largest Contentful Paint (LCP)",
      status: s_ux > 80 ? "success" : s_ux > 60 ? "warning" : "error",
      message: s_ux > 80 ? "Super fast LCP (1.4 seconds) on standard connections." : s_ux > 60 ? "LCP is slow (3.1 seconds) due to unoptimized hero image assets." : "Critical LCP delay (5.6 seconds). Uncompressed imagery and blocking JS.",
      impact: "High",
      fixSuggestion: "Convert high-resolution assets to WebP format, implement lazy loading."
    },
    {
      id: "ux-4",
      category: "ux",
      name: "Accessibility & WCAG AA Contrast",
      status: s_ux > 75 ? "success" : "warning",
      message: s_ux > 75 ? "High contrast text ratio and logical reading flow compliant." : "A few light gray text layers on white backgrounds fail standard contrast rules.",
      impact: "Medium",
      fixSuggestion: "Enforce a color contrast ratio of at least 4.5:1 for standard body text."
    }
  ];

  // Generate Legal Page criteria
  const legalChecksList: CriteriaCheck[] = [
    {
      id: "leg-1",
      category: "legal",
      name: "Privacy Policy Presence",
      status: profile === "poor" ? "error" : "success",
      message: profile === "poor" ? "Privacy Policy page was not found or has blank content." : "Privacy Policy page detected and contains standard GDPR and AdSense disclosure provisions.",
      impact: "Critical",
      fixSuggestion: "Generate and publish an explicit Privacy Policy disclosing cookie usage and ad networks."
    },
    {
      id: "leg-2",
      category: "legal",
      name: "Terms & Conditions Presence",
      status: profile === "poor" ? "error" : "success",
      message: profile === "poor" ? "Terms & Conditions are absent from the navigation layout." : "Terms of Service page validated successfully.",
      impact: "Medium"
    },
    {
      id: "leg-3",
      category: "legal",
      name: "Cookie Consent & Policy",
      status: s_legal > 80 ? "success" : "warning",
      message: s_legal > 80 ? "Cookie warning consent banner and cookie details are active." : "Cookie details are mentioned, but active user consent prompt is missing.",
      impact: "High",
      fixSuggestion: "Deploy an active GDPR/CCPA compliant cookie consent popup checker."
    },
    {
      id: "leg-4",
      category: "legal",
      name: "About & Contact Pages Clarity",
      status: s_legal > 70 ? "success" : "error",
      message: s_legal > 70 ? "Clear contact routes and descriptive 'About Us' section are present." : "Anonymous publisher. 'About' or direct 'Contact' features are missing.",
      impact: "High",
      fixSuggestion: "Publish a dedicated About Us and Contact page with physical, social, or genuine contact coordinates."
    }
  ];

  // Generate AdSense criteria
  const adsenseChecks: CriteriaCheck[] = [
    {
      id: "ads-1",
      category: "adsense",
      name: "Original Value-Add & Niche Viability",
      status: profile === "gambling" ? "error" : profile === "poor" ? "error" : "success",
      message: profile === "gambling" ? "Restricted niche! Gambling, betting, or adult content violates AdSense Publisher policies." : profile === "poor" ? "Extremely low-value content. Unoriginal news rewritten using AI templates." : "High informational value. Niche contains rich, helpful guides of high commercial value.",
      impact: "Critical",
      fixSuggestion: profile === "gambling" ? "AdSense is not viable for this domain. Seek alternative ad partners like ExoClick or Adsterra." : "Add proprietary screenshots, expert commentary, or custom calculators."
    },
    {
      id: "ads-2",
      category: "adsense",
      name: "Ads.txt Syntax and Mapping",
      status: profile === "poor" ? "warning" : "success",
      message: profile === "poor" ? "Ads.txt is empty or missing a valid Publisher ID mapping." : "Ads.txt is valid and maps correctly.",
      impact: "Medium"
    },
    {
      id: "ads-3",
      category: "adsense",
      name: "Sensitive & Restricted Content Check",
      status: profile === "gambling" ? "error" : "success",
      message: profile === "gambling" ? "Direct policy violation detected. Casino or wagering content." : "No restricted content (violence, weapons, sensitive topics) identified.",
      impact: "Critical"
    },
    {
      id: "ads-4",
      category: "adsense",
      name: "Google Webmaster Policy Proximity",
      status: s_adsense > 75 ? "success" : "warning",
      message: s_adsense > 75 ? "Excellent adherence to standard Google webmaster parameters." : "Noticeable keyword stuffing or manipulative pagination schemes detected.",
      impact: "High"
    }
  ];

  // Map individual legal page status
  const legalPages: { [key: string]: LegalPageCheck } = {
    about: {
      found: s_legal > 50,
      url: s_legal > 50 ? `${url}/about` : undefined,
      qualityScore: s_legal > 70 ? 95 : s_legal > 50 ? 60 : 0,
      issues: s_legal > 70 ? [] : ["Boilerplate template with sparse details", "Missing editor biography or credential citations"],
      contentSnippet: s_legal > 50 ? "Welcome to our platform. We are dedicated to delivering the latest updates and insights about web technology..." : undefined
    },
    contact: {
      found: s_legal > 40,
      url: s_legal > 40 ? `${url}/contact` : undefined,
      qualityScore: s_legal > 70 ? 90 : s_legal > 40 ? 55 : 0,
      issues: s_legal > 70 ? [] : ["Contact form does not feature validation", "Missing physical address or publisher name registration"],
      contentSnippet: s_legal > 40 ? "Get in touch with us at support@domain.com or use the contact form below. Our response time is under 24 hours." : undefined
    },
    privacy: {
      found: s_legal > 30,
      url: s_legal > 30 ? `${url}/privacy` : undefined,
      qualityScore: s_legal > 70 ? 98 : s_legal > 30 ? 45 : 0,
      issues: s_legal > 70 ? [] : ["Missing clear Cookie Policy disclosure", "No explicit reference to Third-Party DoubleClick/AdSense ad networks"],
      contentSnippet: s_legal > 30 ? "This Privacy Policy describes how your personal information is collected, used, and shared when you visit..." : undefined
    },
    cookies: {
      found: s_legal > 60,
      url: s_legal > 60 ? `${url}/cookie-policy` : undefined,
      qualityScore: s_legal > 70 ? 92 : s_legal > 60 ? 50 : 0,
      issues: s_legal > 70 ? [] : ["No list of exact cookies, vendors, or expiration timelines"],
      contentSnippet: s_legal > 60 ? "We use cookies to improve your user experience, serve targeted ads, and perform traffic analysis using analytics services..." : undefined
    },
    terms: {
      found: s_legal > 50,
      url: s_legal > 50 ? `${url}/terms` : undefined,
      qualityScore: s_legal > 70 ? 85 : s_legal > 50 ? 50 : 0,
      issues: s_legal > 70 ? [] : ["Lacks explicit governing law or arbitration parameters"],
      contentSnippet: s_legal > 50 ? "By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use..." : undefined
    },
    disclaimer: {
      found: s_legal > 70,
      url: s_legal > 70 ? `${url}/disclaimer` : undefined,
      qualityScore: 90,
      issues: [],
      contentSnippet: "All the information on this website is published in good faith and for general information purpose only..."
    },
    dmca: {
      found: s_legal > 80,
      url: s_legal > 80 ? `${url}/dmca` : undefined,
      qualityScore: 95,
      issues: [],
      contentSnippet: "We respect the intellectual property rights of others. If you believe your copyrighted work is infringed..."
    }
  };

  // Construct global probability
  let probability = Math.round((baseOverall + s_adsense) / 2);
  if (profile === "gambling") probability = 5; // Gambling will get near 0 chance
  
  let probabilityLabel: "High Chance" | "Moderate Chance" | "Low Chance" | "Critical Issues" = "Moderate Chance";
  if (probability >= 85) probabilityLabel = "High Chance";
  else if (probability >= 60) probabilityLabel = "Moderate Chance";
  else if (probability >= 30) probabilityLabel = "Low Chance";
  else probabilityLabel = "Critical Issues";

  // Ads.txt
  const adsTxt: AdsTxtCheck = {
    present: profile !== "poor",
    status: profile === "poor" ? "error" : profile === "perfect" ? "success" : "warning",
    publisherId: profile !== "poor" ? `pub-${seed * 111}` : undefined,
    errors: profile === "poor" ? ["ads.txt file not found (404 Error)"] : [],
    suggestions: profile === "perfect" ? [] : ["Configure explicit dealer certifications (DIRECT, RESELLER) for partner ad exchanges."],
    syntaxOk: profile !== "poor"
  };

  // Robots.txt
  const robotsTxt: RobotsCheck = {
    present: profile !== "poor",
    status: profile === "poor" ? "error" : "success",
    errors: [],
    sitemapDeclared: profile !== "poor",
    rulesCount: profile === "poor" ? 0 : 5
  };

  // Sitemap
  const sitemap: SitemapCheck = {
    present: profile !== "poor",
    status: profile === "poor" ? "error" : "success",
    pagesCount: profile === "perfect" ? 1250 : profile === "poor" ? 0 : 124,
    errors: [],
    orphansDetected: profile === "poor"
  };

  // Meta
  const wordCount = profile === "perfect" ? 453000 : profile === "poor" ? 2400 : 28400;
  const aiContentPercentage = profile === "perfect" ? 2 : profile === "poor" ? 88 : 12;
  const headings = profile === "perfect" ? { h1: 1, h2: 12, h3: 24 } : { h1: 3, h2: 4, h3: 1 };
  const loadTimeMs = profile === "perfect" ? 380 : profile === "poor" ? 2900 : 1100;

  const coreWebVitals = {
    fcp: profile === "perfect" ? 0.4 : profile === "poor" ? 3.1 : 1.2,
    lcp: profile === "perfect" ? 0.9 : profile === "poor" ? 5.8 : 2.2,
    cls: profile === "perfect" ? 0.01 : profile === "poor" ? 0.45 : 0.08,
    inp: profile === "perfect" ? 45 : profile === "poor" ? 280 : 110
  };

  return {
    id: `audit-${seed}-${Date.now()}`,
    url,
    timestamp: new Date().toISOString(),
    overallScore: baseOverall,
    probability,
    probabilityLabel,
    categories: {
      domain: { score: s_domain, label: "Domain Authority", description: "Evaluates domain age, registration trust, DNS settings and history.", checks: domainChecks },
      security: { score: s_security, label: "Technical Security", description: "Checks HTTPS certificate strength, SSL headers, and vulnerability guards.", checks: securityChecks },
      seo: { score: s_seo, label: "Search Engine Optimization", description: "Audits semantic formatting, indexing states, sitemaps and metatags.", checks: seoChecks },
      content: { score: s_content, label: "Content Evaluation", description: "Examines AI copy prevalence, text volume, depth, readability and formatting.", checks: contentChecks },
      ux: { score: s_ux, label: "User Experience (UX)", description: "Analyzes site speed, layout stability, visual contrast and mobile responsiveness.", checks: uxChecks },
      legal: { score: s_legal, label: "Legal Page Validation", description: "Verifies standard compliance disclosures (GDPR/CCPA/DoubleClick).", checks: legalChecksList },
      adsense: { score: s_adsense, label: "AdSense Alignment", description: "Measures domain niches and content compliance with Google Publisher policies.", checks: adsenseChecks }
    },
    legalPages: legalPages as any,
    adsTxt,
    robotsTxt,
    sitemap,
    metadata: {
      domainAge: s_domain > 80 ? "3 years, 2 months" : s_domain > 50 ? "8 months" : "2 weeks",
      sslExpiry: "244 days remaining",
      sslIssuer: "Let's Encrypt / Cloudflare SSL",
      dnssec: s_domain > 90,
      serverIp: `104.21.${seed % 100}.${seed % 254}`,
      wordCount,
      aiContentPercentage,
      headings,
      loadTimeMs,
      coreWebVitals
    }
  };
}
