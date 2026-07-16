import React, { useState, useEffect } from "react";
import { BlogPost, SupportedLanguage } from "../types";
import { 
  BookOpen, Calendar, Clock, User, ArrowLeft, Search, Tag, 
  Share2, Sparkles, AlertCircle, Bookmark, Heart, ThumbsUp 
} from "lucide-react";

interface BlogProps {
  lang: SupportedLanguage;
}

export default function Blog({ lang }: BlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  // Fetch blog posts from dynamic backend
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Could not fetch blog posts.");
      const data = await res.json();
      // Filter out unpublished posts for regular visitors
      setPosts(data.filter((p: BlogPost) => p.published));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Impossible de charger les articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleBookmark = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary,
        url: window.location.href + "#" + post.slug
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/#blog/${post.slug}`);
      alert("Lien de l'article copié dans le presse-papier !");
    }
  };

  // Categories translation table
  const categoriesMap: Record<SupportedLanguage, Record<string, string>> = {
    FR: { All: "Tous", AdSense: "Monétisation AdSense", SEO: "Référencement SEO", Performances: "Performances", Sécurité: "Sécurité Web", Légal: "Conformité Légale" },
    EN: { All: "All", AdSense: "AdSense Monetization", SEO: "SEO Audit", Performances: "Web Vitals", Sécurité: "Technical Security", Légal: "Legal Compliance" },
    ES: { All: "Todos", AdSense: "Monetización", SEO: "SEO y Sémantica", Performances: "Rendimiento", Sécurité: "Seguridad", Légal: "Legalidad" },
    AR: { All: "الكل", AdSense: "أدسينس والأرباح", SEO: "السيو والأرشفة", Performances: "سرعة الموقع", Sécurité: "الأمان والحماية", Légal: "الالتزام القانوني" },
    DE: { All: "Alle", AdSense: "AdSense Einnahmen", SEO: "SEO Suchmaschinen", Performances: "Web-Vitals", Sécurité: "Sicherheit", Légal: "Rechtliches" }
  };

  const labelsDict: any = {
    FR: {
      searchPlaceholder: "Rechercher un article (SEO, AdSense...)",
      backToBlog: "Retour au blog",
      readTime: "de lecture",
      author: "Par",
      writtenOn: "Publié le",
      noArticles: "Aucun article trouvé pour cette recherche.",
      latestArticles: "Guide de l'Éditeur & SEO Pro",
      latestSubtitle: "Articles exclusifs pour accélérer vos approbations publicitaires, booster votre visibilité Google et optimiser vos Core Web Vitals.",
      readMore: "Lire le guide complet",
      share: "Partager l'article",
      like: "J'aime",
      bookmark: "Sauvegarder",
      suggestedReads: "Articles similaires recommandés"
    },
    EN: {
      searchPlaceholder: "Search guides (SEO, AdSense, Core Vitals...)",
      backToBlog: "Back to Blog",
      readTime: "read",
      author: "By",
      writtenOn: "Published",
      noArticles: "No articles found matching your criteria.",
      latestArticles: "Publisher Education & SEO Knowledge",
      latestSubtitle: "Exclusive technical guides to pass AdSense inspections, boost organic visibility, and improve Core Web Vitals.",
      readMore: "Read full guide",
      share: "Share guide",
      like: "Like",
      bookmark: "Save",
      suggestedReads: "Recommended Similar Reading"
    },
    ES: {
      searchPlaceholder: "Buscar guías (SEO, AdSense...)",
      backToBlog: "Volver al blog",
      readTime: "de lectura",
      author: "Por",
      writtenOn: "Publicado el",
      noArticles: "No se encontraron artículos.",
      latestArticles: "Guías para Editores y SEO Profesional",
      latestSubtitle: "Artículos técnicos para aprobar AdSense, optimizar SEO y mejorar la experiencia de usuario.",
      readMore: "Leer guía completa",
      share: "Compartir",
      like: "Me gusta",
      bookmark: "Guardar",
      suggestedReads: "Lecturas sugeridas"
    },
    AR: {
      searchPlaceholder: "ابحث في المقالات (سيو، أدسينس، سرعة...)",
      backToBlog: "العودة للمدونة",
      readTime: "قراءة",
      author: "بواسطة",
      writtenOn: "نُشر في",
      noArticles: "لم يتم العثور على مقالات تطابق هذا البحث.",
      latestArticles: "أكاديمية الناشرين ودليل السيو",
      latestSubtitle: "مقالات حصرية لمساعدتك في الحصول على قبول أدسينس وتصدر محركات بحث جوجل.",
      readMore: "اقرأ الدليل كاملاً",
      share: "مشاركة المقال",
      like: "أعجبني",
      bookmark: "حفظ",
      suggestedReads: "مقالات مقترحة مشابهة"
    },
    DE: {
      searchPlaceholder: "Artikel suchen (SEO, AdSense...)",
      backToBlog: "Zurück zum Blog",
      readTime: "Lesezeit",
      author: "Von",
      writtenOn: "Veröffentlicht am",
      noArticles: "Keine Artikel gefunden.",
      latestArticles: "Publisher-Akademie & SEO-Wissen",
      latestSubtitle: "Exklusive Anleitungen für AdSense-Zulassung, Core Web Vitals und Suchmaschinenoptimierung.",
      readMore: "Vollständige Anleitung lesen",
      share: "Teilen",
      like: "Gefällt mir",
      bookmark: "Speichern",
      suggestedReads: "Ähnliche Artikel"
    }
  };

  const labels = labelsDict[lang] || labelsDict.EN;

  // Filter logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === "All" || 
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ["All", "AdSense", "SEO", "Performances", "Sécurité", "Légal"];

  // Handle article visual format back & forth
  if (selectedPost) {
    const suggestions = posts
      .filter(p => p.id !== selectedPost.id && (p.category === selectedPost.category || p.tags.some(t => selectedPost.tags.includes(t))))
      .slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in" id="blog-article-reader">
        {/* Navigation Button */}
        <button
          onClick={() => setSelectedPost(null)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition"
          id="btn-back-blog"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{labels.backToBlog}</span>
        </button>

        {/* Full Article Body */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-12 shadow-sm space-y-8">
          
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-full border border-indigo-100/50 dark:border-indigo-900/30">
                {categoriesMap[lang]?.[selectedPost.category] || selectedPost.category}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {selectedPost.readTime} {labels.readTime}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-display">
              {selectedPost.title}
            </h1>

            {/* Author and Date row */}
            <div className="flex items-center gap-4 pt-2 border-b border-slate-100 dark:border-slate-800/80 pb-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-medium">
                <div className="w-6 h-6 bg-indigo-600 rounded-full text-white flex items-center justify-center text-[10px] font-bold">
                  {selectedPost.author.charAt(0)}
                </div>
                <span>{labels.author} {selectedPost.author}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{labels.writtenOn} {new Date(selectedPost.date).toLocaleDateString(lang === "FR" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Abstract/Summary box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-l-4 border-indigo-500 rounded-r-2xl text-slate-600 dark:text-slate-300 italic text-sm md:text-base leading-relaxed">
            "{selectedPost.summary}"
          </div>

          {/* HTML Rendered Content */}
          <div 
            className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 space-y-6 text-sm md:text-base leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            id="article-rich-content"
          />

          {/* Interaction Row (Like, Bookmark, Share) */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleLike(selectedPost.id, e)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  likedPosts[selectedPost.id]
                    ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${likedPosts[selectedPost.id] ? "fill-current" : ""}`} />
                <span>{likedPosts[selectedPost.id] ? "Aimé !" : labels.like}</span>
              </button>

              <button
                onClick={(e) => handleBookmark(selectedPost.id, e)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  bookmarkedPosts[selectedPost.id]
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarkedPosts[selectedPost.id] ? "fill-current" : ""}`} />
                <span>{bookmarkedPosts[selectedPost.id] ? "Sauvegardé" : labels.bookmark}</span>
              </button>
            </div>

            <button
              onClick={(e) => handleShare(selectedPost, e)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{labels.share}</span>
            </button>
          </div>
        </article>

        {/* Suggested Reads block */}
        {suggestions.length > 0 && (
          <div className="space-y-6" id="blog-suggestions">
            <h3 className="text-md font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{labels.suggestedReads}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestions.map(post => (
                <div
                  key={post.id}
                  onClick={() => { setSelectedPost(post); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-800 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500">
                      {categoriesMap[lang]?.[post.category] || post.category}
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    <span>{new Date(post.date).toLocaleDateString(lang === "FR" ? "fr-FR" : "en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in" id="blog-listing-view">
      {/* Blog Title Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100/50 dark:border-indigo-900/30 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SEO & AD REVENUE ACADEMY</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
          {labels.latestArticles}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
          {labels.latestSubtitle}
        </p>
      </div>

      {/* Control Row: Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center" id="blog-controls">
        
        {/* Search Input Widget */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm outline-none transition dark:text-white"
          />
        </div>

        {/* Categories filters scrollbar */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none" id="categories-filter-bar">
          {uniqueCategories.map(cat => {
            const labelStr = categoriesMap[lang]?.[cat] || cat;
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {labelStr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="text-center py-24 space-y-3" id="blog-loading-spinner">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono">Chargement des dossiers d'optimisation...</p>
        </div>
      )}

      {/* Error State Banner */}
      {error && !loading && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400 max-w-md mx-auto space-y-2">
          <AlertCircle className="w-10 h-10 mx-auto" />
          <p className="font-bold text-sm">Échec du chargement</p>
          <p className="text-xs opacity-90">{error}</p>
        </div>
      )}

      {/* Blog Cards Grid */}
      {!loading && !error && (
        filteredPosts.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6" id="empty-blog-state">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-750 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{labels.noArticles}</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="mt-3 text-xs font-bold text-indigo-500 hover:underline cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blog-posts-grid">
            {filteredPosts.map(post => {
              const hasLiked = likedPosts[post.id];
              const hasBookmarked = bookmarkedPosts[post.id];
              return (
                <article
                  key={post.id}
                  onClick={() => { setSelectedPost(post); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-900 hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="p-6 md:p-8 space-y-4">
                    {/* Top Row: Category Tag & Quick Interactions */}
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                        {categoriesMap[lang]?.[post.category] || post.category}
                      </span>
                      
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleLike(post.id, e)}
                          className={`p-1.5 rounded-lg border transition ${
                            hasLiked 
                              ? "bg-rose-50 border-rose-200 text-rose-500" 
                              : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:text-slate-600"
                          }`}
                          title="Aimé !"
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`} />
                        </button>

                        <button
                          onClick={(e) => handleBookmark(post.id, e)}
                          className={`p-1.5 rounded-lg border transition ${
                            hasBookmarked 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-500" 
                              : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:text-slate-600"
                          }`}
                          title="Sauvegardé !"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${hasBookmarked ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg font-bold text-slate-950 dark:text-white leading-snug tracking-tight group-hover:text-indigo-500 transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  {/* Footer Row */}
                  <div className="p-6 md:p-8 pt-0 border-t border-slate-50 dark:border-slate-800/40 mt-auto flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {post.readTime}
                    </span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {new Date(post.date).toLocaleDateString(lang === "FR" ? "fr-FR" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
