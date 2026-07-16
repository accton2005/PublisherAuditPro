-- =============================================================================
-- SCHÉMA DE BASE DE DONNÉES MYSQL - PUBLISHER AUDIT & CHECKOUT SAAS
-- PROJET : Publisher Audit Suite (Stripe, PayPal, Paddle & Gemini AI)
-- GENERATED ON: 2026-07-16
-- =============================================================================

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS publisher_audit DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE publisher_audit;

-- Désactivation temporaire des contraintes de clés étrangères pour la réinitialisation propre des tables
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. TABLE DES CONFIGURATIONS SYSTEME (app_configs)
-- Stocke les paramètres d'administration généraux, les clés API cryptées ou sécurisées, 
-- et les réglages des passerelles de paiement (Stripe, PayPal, Paddle).
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS app_configs;
CREATE TABLE app_configs (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Clé d''identification unique du réglage',
    value_text TEXT NULL COMMENT 'Valeur de configuration au format brut ou JSON',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Dernière mise à jour'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configurations globales, passerelles de paiement (Stripe, PayPal, Paddle)';

-- Insertion des réglages par défaut
INSERT INTO app_configs (id, value_text) VALUES 
('admin_credentials', '{"username": "admin", "password_hash": "$2b$10$xyz_mock_hash"}'),
('payment_settings', '{"stripeActive": true, "stripePublicKey": "pk_test_51NxM2pH81aJkPrM2k_mock_pubkey", "paypalActive": true, "paypalClientId": "AQ_AbCdEfGh_mock_clientid", "paypalMode": "sandbox", "paddleActive": true, "paddleVendorId": "12345_mock_vendorid", "paddleMode": "sandbox", "currency": "EUR"}'),
('category_baselines', '{"domain": 100, "security": 100, "seo": 100, "content": 100, "ux": 100, "legal": 100, "adsense": 100}');


-- -----------------------------------------------------------------------------
-- 2. TABLE DES UTILISATEURS (users)
-- Gère les comptes d'utilisateurs, leurs rôles d'accès et leur abonnement SaaS actif.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'UUID ou identifiant unique',
    email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Adresse de messagerie de l''utilisateur',
    password_hash VARCHAR(255) NULL COMMENT 'Empreinte du mot de passe (si authentification locale)',
    role VARCHAR(30) DEFAULT 'user' COMMENT 'Rôle applicatif (user, admin, auditor)',
    current_tier VARCHAR(50) DEFAULT 'free' COMMENT 'Niveau d''abonnement SaaS actif (free, starter, pro, agency, enterprise)',
    status VARCHAR(20) DEFAULT 'active' COMMENT 'Statut du compte (active, suspended, pending)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d''inscription',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de dernière modification',
    INDEX idx_user_email (email),
    INDEX idx_user_tier (current_tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Utilisateurs de la plateforme SaaS et rôles';

-- Insertion d'utilisateurs de test
INSERT INTO users (id, email, password_hash, role, current_tier, status) VALUES
('usr-001', 'jean.dupont@gmail.com', '$2b$10$example_hash_here', 'user', 'pro', 'active'),
('usr-002', 'alice.bernard@outlook.fr', '$2b$10$example_hash_here', 'user', 'agency', 'active'),
('usr-003', 'admin@publisheraudit.com', '$2b$10$example_hash_here', 'admin', 'enterprise', 'active');


-- -----------------------------------------------------------------------------
-- 3. TABLE DES RAPPORTS D''AUDIT (audit_reports)
-- Enregistre les métadonnées globales de chaque scan de domaine Web réalisé par l''application.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS audit_reports;
CREATE TABLE audit_reports (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID unique du rapport d''audit (e.g., audit-721a)',
    user_id VARCHAR(50) NULL COMMENT 'ID de l''utilisateur ayant lancé l''audit (facultatif si anonyme)',
    url VARCHAR(255) NOT NULL COMMENT 'URL ou nom de domaine complet scanné',
    overall_score INT NOT NULL DEFAULT 0 COMMENT 'Score global d''audit sur 100',
    probability INT NOT NULL DEFAULT 0 COMMENT 'Probabilité d''approbation Google AdSense en %',
    probability_label VARCHAR(50) NOT NULL COMMENT 'Libellé de probabilité (High Chance, Moderate Chance, Low Chance, Critical Issues)',
    
    -- Métadonnées globales extraites du site
    domain_age VARCHAR(100) NULL COMMENT 'Ancienneté estimée du domaine',
    ssl_expiry VARCHAR(100) NULL COMMENT 'Date d''expiration du certificat SSL',
    ssl_issuer VARCHAR(150) NULL COMMENT 'Émetteur du certificat SSL',
    dnssec BOOLEAN DEFAULT FALSE COMMENT 'Activation de l''extension DNSSEC (1=Vrai, 0=Faux)',
    server_ip VARCHAR(50) NULL COMMENT 'Adresse IP publique du serveur d''hébergement',
    word_count INT NOT NULL DEFAULT 0 COMMENT 'Nombre moyen de mots sur la page principale',
    ai_content_percentage INT NOT NULL DEFAULT 0 COMMENT 'Probabilité de contenu généré par IA (en %)',
    headings_h1 INT NOT NULL DEFAULT 0 COMMENT 'Nombre d''en-têtes H1 détectés',
    headings_h2 INT NOT NULL DEFAULT 0 COMMENT 'Nombre d''en-têtes H2 détectés',
    headings_h3 INT NOT NULL DEFAULT 0 COMMENT 'Nombre d''en-têtes H3 détectés',
    load_time_ms INT NOT NULL DEFAULT 0 COMMENT 'Temps de chargement de la page en millisecondes',
    
    -- Signaux Web Essentiels (Core Web Vitals)
    fcp_seconds DECIMAL(5,2) DEFAULT 0.00 COMMENT 'First Contentful Paint en secondes',
    lcp_seconds DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Largest Contentful Paint en secondes',
    cls_value DECIMAL(5,3) DEFAULT 0.000 COMMENT 'Cumulative Layout Shift',
    inp_ms INT DEFAULT 0 COMMENT 'Interaction to Next Paint en millisecondes',
    
    -- Diagnostic généré par l''intelligence artificielle (Google Gemini)
    ai_summary TEXT NULL COMMENT 'Résumé textuel de haut niveau généré par l''IA',
    ai_why_poor TEXT NULL COMMENT 'Liste à puces des défaillances majeures du site',
    ai_seo_impact TEXT NULL COMMENT 'Impact estimé des findings sur le référencement naturel SEO',
    ai_adsense_impact TEXT NULL COMMENT 'Explication d''impact sur la conformité Google AdSense',
    ai_vitals_impact TEXT NULL COMMENT 'Explication d''impact des performances sur les utilisateurs',
    priority_fixes_json JSON NULL COMMENT 'Tableau JSON des correctifs prioritaires à appliquer',
    
    -- Données brutes de sauvegarde
    raw_payload_json JSON NULL COMMENT 'Copie de sauvegarde brute du rapport au format JSON',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date et heure du scan',
    
    CONSTRAINT fk_audit_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_url (url),
    INDEX idx_audit_overall_score (overall_score),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rapports d''audit complets pour les domaines scannés';


-- -----------------------------------------------------------------------------
-- 4. TABLE DES SCORES DE CATEGORIES DE L''AUDIT (audit_category_scores)
-- Structure normalisée contenant les scores d''évaluation pour chaque section du rapport (SEO, UX, Adsense, etc.).
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS audit_category_scores;
CREATE TABLE audit_category_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL COMMENT 'Référence au rapport d''audit parent',
    category_name VARCHAR(50) NOT NULL COMMENT 'Code technique (domain, security, seo, content, ux, legal, adsense)',
    score INT NOT NULL DEFAULT 0 COMMENT 'Score d''évaluation sur 100',
    label VARCHAR(100) NOT NULL COMMENT 'Libellé affiché de la catégorie d''audit',
    description TEXT NULL COMMENT 'Description textuelle de la portée du score',
    
    CONSTRAINT fk_category_scores_report FOREIGN KEY (report_id) REFERENCES audit_reports(id) ON DELETE CASCADE,
    UNIQUE KEY uq_report_category (report_id, category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Scores détaillés par section/catégorie d''audit';


-- -----------------------------------------------------------------------------
-- 5. TABLE DES CRITERES ET POINTS DE VERIFICATION (audit_criteria_checks)
-- Liste normalisée de tous les points vérifiés lors de l''audit avec leur état de réussite.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS audit_criteria_checks;
CREATE TABLE audit_criteria_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL COMMENT 'Référence au rapport d''audit parent',
    category VARCHAR(50) NOT NULL COMMENT 'Section d''appartenance (seo, ux, etc.)',
    check_name VARCHAR(150) NOT NULL COMMENT 'Nom du point de contrôle (ex: Certificat SSL valide, Balise H1 unique)',
    status VARCHAR(30) NOT NULL COMMENT 'Résultat du critère (success, warning, error)',
    message TEXT NOT NULL COMMENT 'Message court explicatif pour l''utilisateur',
    details TEXT NULL COMMENT 'Explications additionnelles détaillées',
    impact TEXT NULL COMMENT 'Impact potentiel sur le trafic ou l''AdSense',
    fix_suggestion TEXT NULL COMMENT 'Recommandation pratique pour corriger le problème',
    
    CONSTRAINT fk_criteria_checks_report FOREIGN KEY (report_id) REFERENCES audit_reports(id) ON DELETE CASCADE,
    INDEX idx_criteria_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Détails des points de contrôles élémentaires validés ou rejetés';


-- -----------------------------------------------------------------------------
-- 6. TABLE DES PAGES LEGALES DETECTEES (audit_legal_pages)
-- Évalue la présence et la qualité des pages juridiques cruciales pour l''obtention d''AdSense.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS audit_legal_pages;
CREATE TABLE audit_legal_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL COMMENT 'Référence au rapport d''audit parent',
    page_type VARCHAR(50) NOT NULL COMMENT 'Type de page légale (about, contact, privacy, cookies, terms, disclaimer, dmca)',
    found BOOLEAN DEFAULT FALSE COMMENT 'Indique si la page a été identifiée (1=Vrai, 0=Faux)',
    url VARCHAR(255) NULL COMMENT 'Adresse URL absolue trouvée pour cette page légale',
    quality_score INT NOT NULL DEFAULT 0 COMMENT 'Score de conformité et de qualité de la page sur 100',
    content_snippet TEXT NULL COMMENT 'Extrait textuel du début du contenu pour vérification',
    issues_json JSON NULL COMMENT 'Tableau JSON des manquements identifiés sur cette page spécifique',
    
    CONSTRAINT fk_legal_pages_report FOREIGN KEY (report_id) REFERENCES audit_reports(id) ON DELETE CASCADE,
    UNIQUE KEY uq_report_page_type (report_id, page_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vérification de conformité des pages de mentions légales et politiques';


-- -----------------------------------------------------------------------------
-- 7. TABLE DES FICHIERS TECHNIQUES (audit_technical_files)
-- Enregistre l''état et la conformité des fichiers ads.txt, robots.txt et sitemap.xml.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS audit_technical_files;
CREATE TABLE audit_technical_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL COMMENT 'Référence au rapport d''audit parent',
    file_type VARCHAR(30) NOT NULL COMMENT 'Type de fichier analysé (ads_txt, robots_txt, sitemap)',
    present BOOLEAN DEFAULT FALSE COMMENT 'Fichier détecté ou déclaré (1=Vrai, 0=Faux)',
    status VARCHAR(30) NOT NULL COMMENT 'Résultat global de l''analyse du fichier (success, warning, error)',
    
    -- Métadonnées spécifiques à ads.txt
    ads_publisher_id VARCHAR(100) NULL COMMENT 'ID d''éditeur Google AdSense trouvé dans le fichier ads.txt',
    ads_syntax_ok BOOLEAN DEFAULT FALSE COMMENT 'Indique si la syntaxe des lignes est correcte',
    
    -- Métadonnées spécifiques à robots.txt
    robots_sitemap_declared BOOLEAN DEFAULT FALSE COMMENT 'Indique si une directive Sitemap est présente',
    robots_rules_count INT DEFAULT 0 COMMENT 'Nombre total de règles d''accès déclarées',
    
    -- Métadonnées spécifiques au sitemap.xml
    sitemap_pages_count INT DEFAULT 0 COMMENT 'Nombre d''URLs recensées dans les sitemaps',
    sitemap_orphans_detected BOOLEAN DEFAULT FALSE COMMENT 'Indique si des URLs orphelines ont été détectées',
    
    -- Liste d''erreurs et suggestions au format JSON
    errors_json JSON NULL COMMENT 'Tableau d''erreurs ou de manquements',
    suggestions_json JSON NULL COMMENT 'Tableau de conseils pratiques',
    
    CONSTRAINT fk_technical_files_report FOREIGN KEY (report_id) REFERENCES audit_reports(id) ON DELETE CASCADE,
    UNIQUE KEY uq_report_file_type (report_id, file_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Analyse approfondie des fichiers ads.txt, robots.txt et sitemaps XML';


-- -----------------------------------------------------------------------------
-- 8. TABLE DES TRANSACTIONS ET PAIEMENTS SAAS (payments)
-- Historique unifié des paiements de renouvellements et d''abonnements.
-- Intègre Stripe, PayPal et Paddle de manière transparente.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id VARCHAR(100) NOT NULL PRIMARY KEY COMMENT 'ID unique de la transaction (ex: tx-pay-..., ch_..., paypal-tx-...)',
    user_id VARCHAR(50) NULL COMMENT 'ID de l''utilisateur associé au paiement',
    user_name VARCHAR(150) NOT NULL COMMENT 'Nom complet déclaré de l''acheteur',
    user_email VARCHAR(150) NOT NULL COMMENT 'Adresse email de facturation',
    plan_name VARCHAR(50) NOT NULL COMMENT 'Niveau d''abonnement acheté (Starter, Pro, Agency, Enterprise)',
    amount DECIMAL(10,2) NOT NULL COMMENT 'Montant facturé',
    currency VARCHAR(10) DEFAULT 'EUR' COMMENT 'Devise utilisée (EUR, USD, GBP, CAD)',
    
    -- Passerelle de paiement et détails
    gateway VARCHAR(30) NOT NULL COMMENT 'Passerelle utilisée (stripe, paypal, paddle)',
    billing_cycle VARCHAR(20) DEFAULT 'monthly' COMMENT 'Fréquence de facturation (monthly, yearly)',
    status VARCHAR(30) DEFAULT 'completed' COMMENT 'Statut (completed, pending, failed, refunded)',
    
    -- Détails optionnels stockés par passerelle de paiement
    stripe_card_details VARCHAR(50) NULL COMMENT 'Derniers chiffres de la CB Stripe (ex: •••• •••• •••• 4242)',
    paypal_email VARCHAR(150) NULL COMMENT 'Adresse de compte PayPal de l''acheteur',
    paddle_subscription_id VARCHAR(100) NULL COMMENT 'Identifiant unique d''abonnement Paddle',
    
    raw_gateway_payload JSON NULL COMMENT 'Copie de sauvegarde brute de la notification webhook/API',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date et heure de paiement',
    
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_payment_gateway (gateway),
    INDEX idx_payment_status (status),
    INDEX idx_payment_email (user_email),
    INDEX idx_payment_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Suivi des transactions d''achats et renouvellements d''abonnements';

-- Insertion d'exemples de transactions initiales (Stripe, PayPal, Paddle)
INSERT INTO payments (id, user_id, user_name, user_email, plan_name, amount, currency, gateway, billing_cycle, stripe_card_details, status, created_at) VALUES 
('tx-pay-721a', 'usr-001', 'Jean Dupont', 'jean.dupont@gmail.com', 'Pro', 79.00, 'EUR', 'stripe', 'monthly', '•••• •••• •••• 4242', 'completed', DATE_SUB(NOW(), INTERVAL 36 HOUR));

INSERT INTO payments (id, user_id, user_name, user_email, plan_name, amount, currency, gateway, billing_cycle, paypal_email, status, created_at) VALUES 
('tx-pay-891b', 'usr-002', 'Alice Bernard', 'alice.b@outlook.fr', 'Agency', 159.00, 'EUR', 'paypal', 'yearly', 'alice.b@outlook.fr', 'completed', DATE_SUB(NOW(), INTERVAL 24 HOUR));

INSERT INTO payments (id, user_id, user_name, user_email, plan_name, amount, currency, gateway, billing_cycle, stripe_card_details, status, created_at) VALUES 
('tx-pay-904c', NULL, 'Michel Martin', 'm.martin@corp.fr', 'Starter', 29.00, 'EUR', 'stripe', 'monthly', '•••• •••• •••• 5555', 'failed', DATE_SUB(NOW(), INTERVAL 4 HOUR));

INSERT INTO payments (id, user_id, user_name, user_email, plan_name, amount, currency, gateway, billing_cycle, paddle_subscription_id, status, created_at) VALUES 
('tx-pay-915d', 'usr-001', 'Jean Dupont', 'jean.dupont@gmail.com', 'Pro', 79.00, 'EUR', 'paddle', 'monthly', 'sub_paddle_123456', 'completed', NOW());


-- -----------------------------------------------------------------------------
-- 9. TABLE DES LOGS D''ACTIVITE DES API (api_request_logs)
-- Journalise l''historique d''appels des APIs pour l''analyse d''usage et de sécurité.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS api_request_logs;
CREATE TABLE api_request_logs (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID unique du log',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Heure de la requête',
    method VARCHAR(10) NOT NULL COMMENT 'Méthode HTTP (GET, POST, etc.)',
    endpoint VARCHAR(255) NOT NULL COMMENT 'Route API ciblée (ex: /api/scan)',
    status INT NOT NULL COMMENT 'Code HTTP de réponse (200, 400, 500, etc.)',
    url_requested TEXT NULL COMMENT 'Paramètre URL scannée ou ressource concernée',
    INDEX idx_api_logs_timestamp (timestamp),
    INDEX idx_api_logs_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Journal des requêtes API serveurs';


-- -----------------------------------------------------------------------------
-- 10. TABLE DES ARTICLES DE BLOG (blog_posts)
-- Gère les articles de blog SEO, les tutoriels de l'Académie et les actualités.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS blog_posts;
CREATE TABLE blog_posts (
    id VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Identifiant unique de l''article (UUID)',
    title VARCHAR(255) NOT NULL COMMENT 'Titre de l''article de blog',
    slug VARCHAR(255) NOT NULL UNIQUE COMMENT 'Slug URL unique et optimisé pour le SEO',
    summary TEXT NOT NULL COMMENT 'Résumé court/extrait affiché dans les listes d''articles',
    content LONGTEXT NOT NULL COMMENT 'Contenu complet de l''article formaté en HTML sémantique',
    category VARCHAR(50) NOT NULL COMMENT 'Catégorie principale (AdSense, SEO, Performances, Sécurité, Légal)',
    read_time VARCHAR(20) DEFAULT '5 min' COMMENT 'Temps de lecture estimé (ex: 5 min)',
    tags JSON NULL COMMENT 'Tableau JSON des mots-clés/mots balises de l''article',
    author VARCHAR(100) DEFAULT 'Admin' COMMENT 'Nom de l''auteur rédacteur',
    published BOOLEAN DEFAULT TRUE COMMENT 'Indique si l''article est en ligne (1) ou en brouillon (0)',
    date VARCHAR(50) NOT NULL COMMENT 'Date d''affichage formatée (ex: 16 juillet 2026)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d''enregistrement système',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
    INDEX idx_blog_category (category),
    INDEX idx_blog_slug (slug),
    INDEX idx_blog_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Articles de blog et d''académie de formation optimisés SEO';

-- Insertion des articles de blog par défaut de l'Académie SEO & AdSense
INSERT INTO blog_posts (id, title, slug, summary, content, author, date, category, read_time, tags, published) VALUES
('post-1', 'Comment optimiser votre fichier ads.txt pour éviter les pertes de revenus', 'optimiser-ads-txt-revenus', 'Découvrez l''importance capitale du fichier ads.txt de Google AdSense, comment l''implémenter correctement, éviter les erreurs courantes et protéger vos inventaires publicitaires.', '<p>Le fichier <strong>ads.txt</strong> (Authorized Digital Sellers) est une initiative de l''IAB Tech Lab visant à accroître la transparence dans la publicité programmatique. En déclarant publiquement qui est autorisé à vendre votre inventaire publicitaire, vous empêchez l''usurpation d''identité de votre domaine par des acteurs malveillants.</p><h3>Pourquoi ads.txt est-il obligatoire pour Google AdSense ?</h3><p>Si vous n''implémentez pas de fichier ads.txt valide à la racine de votre site (ex: <code>monsite.com/ads.txt</code>), Google AdSense affichera un message d''alerte critique sur votre console d''administration et cessera purement et simplement de diffuser des annonces sur votre domaine sous 48 heures. Cela se traduit par une baisse immédiate et totale de vos revenus.</p><h3>La syntaxe correcte d''une ligne ads.txt</h3><p>Chaque ligne de votre fichier ads.txt doit suivre un format standardisé très précis :</p><pre><code>google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0</code></pre><ul><li><strong>google.com</strong> : Le nom de domaine du réseau publicitaire.</li><li><strong>pub-XXXXXXXXXXXXXXXX</strong> : Votre ID d''éditeur Google AdSense unique.</li><li><strong>DIRECT</strong> : Indique que vous gérez directement le compte (utilisez ''RESELLER'' si vous passez par un intermédiaire certifié).</li><li><strong>f08c47fec0942fa0</strong> : L''identifiant unique de l''autorité de certification de Google (toujours le même pour Google AdSense).</li></ul><h3>Erreurs fréquentes à éviter</h3><ol><li><strong>Fautes de frappe dans le ID de l''éditeur</strong> : Veillez à copier exactement le code fourni dans votre tableau de bord Google AdSense.</li><li><strong>Présence de caractères invisibles ou d''espaces superflus</strong> : Utilisez un éditeur de texte brut (comme Bloc-notes ou VS Code) et non un traitement de texte comme Word.</li><li><strong>Serveur mal configuré (Code de statut HTTP 404)</strong> : Assurez-vous que le fichier ads.txt renvoie bien un statut HTTP 200 OK et qu''il est accessible publiquement sans redirection complexe.</li></ol>', 'Équipe technique Audit Pro', '2026-07-16', 'AdSense', '5 min', '["AdSense", "ads.txt", "Monétisation", "Sécurité"]', 1),

('post-2', 'Les 5 critères indispensables pour obtenir l''approbation de Google AdSense', '5-criteres-approbation-adsense', 'Vous souhaitez faire approuver votre site par Google AdSense ? Voici la liste ultime des critères de conformité indispensables pour passer l''examen de l''équipe de validation de Google.', '<p>L''approbation d''un nouveau site web par le programme Google AdSense peut s''avérer complexe si l''on ne comprend pas les attentes des validateurs. Voici les 5 critères de qualité stricts pour garantir l''acceptation de votre domaine dès la première tentative.</p><h3>1. Des pages légales indispensables</h3><p>Google exige que votre site respecte la vie privée des utilisateurs. Vous devez absolument publier des pages dédiées et facilement accessibles depuis le pied de page :</p><ul><li>Politique de confidentialité (Privacy Policy) avec mention des cookies tiers et des cookies publicitaires DoubleClick de Google.</li><li>Conditions Générales d''Utilisation (CGU).</li><li>Page de Mentions Légales détaillant l''identité de l''éditeur du site.</li><li>Page de Contact fonctionnelle.</li></ul><h3>2. Un contenu original à forte valeur ajoutée</h3><p>Le copier-coller ou la réécriture superficielle d''autres blogs est la première cause de rejet pour ''Contenu de faible valeur''. Google recherche des articles approfondis, bien documentés, répondant à de vraies questions d''utilisateurs. Évitez les sites ne contenant que 5 ou 10 courts articles de moins de 300 mots.</p><h3>3. Une expérience utilisateur (UX) soignée et une navigation intuitive</h3><p>Votre site doit posséder un menu de navigation clair. L''internaute doit pouvoir trouver l''information souhaitée en moins de 3 clics. Un design encombré, des popups agressives ou des boutons trompeurs entraîneront un rejet systématique.</p><h3>4. L''ancienneté du domaine et l''absence de spam</h3><p>Dans certains pays (notamment en Asie et au Moyen-Orient), Google exige parfois que le domaine ait au moins 6 mois d''ancienneté. De plus, votre domaine ne doit pas avoir un historique de spam ou de pénalités de recherche.</p><h3>5. Un site techniquement stable (SSL et rapidité)</h3><p>L''utilisation d''un certificat SSL valide (https://) is indispensable. Un site lent à charger ou comportant de multiples liens brisés (erreurs 404) donne une image non professionnelle et sera refusé par AdSense.</p>', 'Jean Dupont, Expert AdSense', '2026-07-15', 'AdSense', '6 min', '["AdSense", "Approbation", "Monétisation", "Contenu"]', 1),

('post-3', 'Core Web Vitals : Comment le CLS détruit vos revenus publicitaires', 'core-web-vitals-cls-revenus', 'Le Cumulative Layout Shift (CLS) mesure l''instabilité visuelle d''une page web. Découvrez comment ce signal web essentiel impacte votre référencement SEO et fait fuir vos annonceurs.', '<p>L''instabilité visuelle lors du chargement d''une page Web est l''une des pires expériences pour un internaute. Imaginez que vous vous apprêtiez à cliquer sur un lien, et que soudainement un bloc publicitaire ou une image se charge, décalant le texte vers le bas et vous faisant cliquer sur une annonce par erreur. C''est précisément ce que mesure le <strong>Cumulative Layout Shift (CLS)</strong>.</p><h3>Comment le CLS pénalise-t-il votre SEO ?</h3><p>Depuis le déploiement de la mise à jour ''Page Experience'' de Google, les Core Web Vitals (LCP, INP, et CLS) sont devenus des signaux de positionnement officiels. Un score CLS supérieur à <strong>0.1</strong> est jugé insatisfaisant et peut entraîner un déclassement progressif de vos pages dans les résultats de recherche (SERP).</p><h3>L''impact économique direct du CLS sur les revenus publicitaires</h3><p>Un mauvais CLS nuit également à votre taux de clic légitime (CTR) et à la satisfaction des annonceurs :</p><ul><li><strong>Clics accidentels (Invalid Clicks)</strong> : Google AdSense détecte les clics consécutifs à un décalage de mise en page. Ces clics sont considérés comme non valides. Google rembourse les annonceurs et peut pénaliser, voire suspendre votre compte d''éditeur si la proportion de clics invalides est trop élevée.</li><li><strong>Mauvaise visibilité des annonces (Ad Viewability)</strong> : Si l''emplacement de l''annonce bouge constamment, le taux d''affichage actif diminue, ce qui fait chuter le coût pour mille impressions (CPM) que les annonceurs sont prêts à payer pour votre espace.</li></ul><h3>Comment corriger le Cumulative Layout Shift ?</h3><ol><li><strong>Spécifiez toujours des dimensions de largeur et hauteur</strong> (<code>width</code> et <code>height</code>) sur toutes vos images et fichiers vidéos.</li><li><strong>Réservez de l''espace pour vos blocs publicitaires</strong> : Enveloppez vos scripts d''annonces dans des conteneurs HTML ayant une hauteur minimale fixe CSS (ex: <code>min-height: 250px;</code>).</li><li><strong>Évitez d''insérer du contenu dynamique</strong> (comme des bannières d''inscription à une newsletter ou des alertes) au-dessus du contenu principal sans transition de mise en page programmée.</li></ol>', 'Sarah Martin, Développeuse Web Performance', '2026-07-14', 'Performances', '7 min', '["CLS", "Core Web Vitals", "Vitesse", "SEO"]', 1),

('post-4', 'Pourquoi un certificat SSL valide est crucial pour le référencement de votre site', 'certificat-ssl-crucial-seo', 'Le HTTPS est devenu la norme absolue sur le Web. Comprenez pourquoi un certificat SSL valide protège vos visiteurs et constitue un prérequis absolu pour l''indexation sur Google.', '<p>En 2014, Google a annoncé officiellement que le protocole <strong>HTTPS (Hypertext Transfer Protocol Secure)</strong> devenait un signal de classement dans ses algorithmes de recherche. Plus de dix ans après, naviguer sur un site non sécurisé en HTTP brut est devenu rédhibitoire pour l''immense majorité des navigateurs et des moteurs de recherche.</p><h3>La sécurité des données de vos visiteurs</h3><p>Le protocole SSL/TLS chiffre la connexion entre le navigateur de l''internaute et le serveur web. Cela garantit qu''aucun tiers ne peut intercepter, lire ou altérer les informations transmises (mots de passe, données personnelles, formulaires de contact). Pour un site de commerce ou un blog d''information, c''est le fondement même de la confiance.</p><h3>Avertissements de sécurité et taux de rebond catastrophiques</h3><p>Si votre site ne possède pas de certificat SSL ou si celui-ci a expiré, les navigateurs modernes comme Google Chrome, Safari ou Firefox afficheront un écran d''avertissement rouge très anxiogène : <em>''Votre connexion n''est pas privée''</em>. Face à ce message, plus de 90 % des utilisateurs rebroussent chemin immédiatement, augmentant de manière spectaculaire votre taux de rebond et réduisant à néant vos opportunités de trafic organique et de monétisation.</p><h3>Impact sur l''indexation Google</h3><p>Les robots d''indexation de Google (Googlebot) parcourent en priorité les versions sécurisées des sites web. Si un domaine ne dispose pas d''une redirection automatique et fonctionnelle de HTTP vers HTTPS (code de redirection permanent 301), le moteur de recherche peut diviser et pénaliser l''autorité du domaine en indexant deux variantes différentes du site.</p><h3>Comment obtenir un certificat SSL gratuitement ?</h3><p>Il n''est plus nécessaire de dépenser des centaines d''euros pour sécuriser votre site. Grâce à l''autorité de certification ouverte <strong>Let''s Encrypt</strong>, la plupart des hébergeurs web modernes intègrent des certificats SSL gratuits configurables en un seul clic depuis votre interface d''administration (cPanel, Plesk, ou Cloudflare).</p>', 'Alexandre Mercier, Consultant Sécurité', '2026-07-13', 'Sécurité', '4 min', '["SSL", "HTTPS", "Sécurité", "SEO"]', 1),

('post-5', 'L''importance des mentions légales et politiques de confidentialité pour l''audit Google', 'mentions-legales-politiques-audit-google', 'Les pages légales ne sont pas de simples formalités juridiques. Elles jouent un rôle déterminant dans l''évaluation de la légitimité de votre site par Google et les réseaux publicitaires.', '<p>Beaucoup de créateurs de contenu considèrent la rédaction de pages juridiques comme une tâche rébarbative et inutile. C''est pourtant l''une des erreurs les plus fréquentes qui mènent au rejet lors de l''examen Google AdSense ou lors de l''analyse par les évaluateurs de la qualité de recherche de Google (Search Quality Raters).</p><h3>L''obligation légale de transparence (RGPD & CCPA)</h3><p>En Europe et dans de nombreux États américains, la loi impose d''informer clairement les visiteurs sur la manière dont leurs données personnelles sont collectées, stockées et exploitées. Si vous utilisez des outils d''analyse d''audience (Google Analytics), des pixels de réseaux sociaux (Meta Pixel) ou des scripts publicitaires (AdSense), vous collectez des cookies traceurs. Vous devez donc impérativement publier une <strong>Politique de Confidentialité</strong> détaillée.</p><h3>Le concept d''E-E-A-T de Google (Expertise, Expérience, Autorité, Confiance)</h3><p>Google évalue la crédibilité générale d''un site à travers ses recommandations E-E-A-T. La <strong>Confiance (Trust)</strong> est le pilier le plus important. Un site qui dissimule l''identité de son propriétaire, qui n''affiche aucune adresse physique, aucun numéro d''enregistrement ou aucun moyen direct de contact éveille les soupçons des algorithmes. Des <strong>Mentions Légales</strong> complètes démontrent que vous êtes une entité réelle, transparente et responsable.</p><h3>Ce que doit contenir votre Politique de Confidentialité pour AdSense</h3><p>Pour être conforme aux exigences de Google AdSense, votre charte de confidentialité doit obligatoirement mentionner :</p><ul><li>L''utilisation de cookies par des fournisseurs tiers, y compris Google, pour diffuser des annonces basées sur les visites antérieures des internautes.</li><li>L''utilisation du cookie DoubleClick DART permettant à Google et ses partenaires de diffuser des annonces adaptées en fonction de la navigation sur d''autres sites.</li><li>La possibilité pour les utilisateurs de désactiver la publicité personnalisée via les paramètres des annonces de Google ou via des portails comme <code>www.aboutads.info</code>.</li></ul>', 'Cabinet Juridique LexWeb', '2026-07-12', 'Légal', '6 min', '["Légal", "RGPD", "AdSense", "E-E-A-T"]', 1);


-- Activation à nouveau des contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;
