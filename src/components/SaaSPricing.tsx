import React, { useState } from "react";
import { 
  Check, ShieldCheck, CreditCard, Sparkles, AlertCircle, Building2, 
  ChevronRight, ArrowRight, X, Loader2
} from "lucide-react";

interface SaaSPricingProps {
  currentTier: string;
  onUpgradeTier: (tier: string) => void;
  lang: string;
  config?: any;
}

export default function SaaSPricing({ currentTier, onUpgradeTier, lang, config }: SaaSPricingProps) {
  const currencySymbol = config?.paymentSettings?.currency === "EUR" ? "€" : config?.paymentSettings?.currency === "GBP" ? "£" : config?.paymentSettings?.currency === "CAD" ? "C$" : "$";
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<"stripe" | "paypal" | "paddle">("stripe");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  // Checkout Form states
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardName, setCardName] = useState("Jane Doe");
  const [userEmail, setUserEmail] = useState("j.elqelai@gmail.com");
  const [paypalEmail, setPaypalEmail] = useState("j.elqelai@gmail.com");
  const [checkoutError, setCheckoutError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const basePlans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: lang === "FR" ? "Essai gratuit de base." : "Essential diagnostics.",
      features: [
        "Scan up to 5 pages per audit",
        "3 scans daily",
        "Basic SEO & security audits",
        "Standard PDF Export"
      ],
      cta: lang === "FR" ? "Plan Actif" : "Active Plan"
    },
    {
      id: "starter",
      name: "Starter",
      price: 29,
      description: lang === "FR" ? "Pour les blogueurs indépendants." : "Perfect for independent publishers.",
      features: [
        "Scan up to 100 pages per audit",
        "20 scans daily",
        "Advanced AI Coach recommendations",
        "Sitemap & Robots.txt generation",
        "Email alert on downtime/SSL expiry"
      ],
      cta: lang === "FR" ? "S'abonner" : "Subscribe Now"
    },
    {
      id: "pro",
      name: "Pro",
      price: 79,
      description: lang === "FR" ? "Pour les éditeurs professionnels." : "Best value for scaling media networks.",
      features: [
        "Scan up to 1,000 pages per audit",
        "Unlimited daily scans",
        "Full AI Legal Policies writer",
        "Interactive Code Fixer",
        "Public API access (10k requests/mo)",
        "Daily automated crawler monitoring"
      ],
      cta: lang === "FR" ? "S'abonner" : "Subscribe Now"
    },
    {
      id: "agency",
      name: "Agency",
      price: 199,
      description: lang === "FR" ? "Pour les agences et réseaux d'édition." : "Configured for multi-client portfolios.",
      features: [
        "Scan up to 5,000 pages per audit",
        "Unlimited audits & API calls",
        "Custom White-Label PDF audits",
        "Multi-team user dashboards",
        "Dedicated SEO/AdSense Account Manager",
        "Slack webhook notifications integration"
      ],
      cta: lang === "FR" ? "S'abonner" : "Subscribe Now"
    }
  ];

  const plans = config?.pricing || basePlans;

  const handleOpenCheckout = (plan: any) => {
    if (plan.id === "free") return;
    setSelectedPlan(plan);
    setCheckoutError("");
    setPaySuccess(false);
    setPaying(false);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setCheckoutError("");

    const calculatedPrice = billingCycle === "yearly" ? Math.round(selectedPlan.price * 0.8) : selectedPlan.price;

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: selectedPlan.name,
          amount: calculatedPrice,
          gateway: paymentGateway,
          billingCycle,
          userName: cardName,
          userEmail: userEmail,
          cardDetails: paymentGateway === "stripe" ? cardNumber : undefined,
          paypalEmail: paymentGateway === "paypal" ? paypalEmail : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaying(false);
        setPaySuccess(true);
        onUpgradeTier(selectedPlan.name);
        setTimeout(() => {
          setSelectedPlan(null);
          setPaySuccess(false);
        }, 2000);
      } else {
        setCheckoutError(data.error || "La transaction a échoué.");
        setPaying(false);
      }
    } catch (err) {
      setCheckoutError(lang === "FR" ? "Impossible de contacter le serveur de paiement." : "Could not connect to payment gateway server.");
      setPaying(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in" id="billing-pricing-hub">
      {/* SaaS billing header */}
      <div className="text-center space-y-3" id="pricing-header">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === "FR" ? "Plans d'abonnement SaaS" : "Flexible SaaS Pricing Tiers"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
          {lang === "FR" ? "Débloquez l'API publique, le crawler multi-pages et le correcteur de code intelligent IA." : "Unlock developer API tokens, multi-thousand page crawling thresholds, and complete automated legal generation."}
        </p>

        {/* Monthly / Yearly cycle selector */}
        <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mt-4 border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              billingCycle === "monthly" ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow" : "text-slate-400"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
              billingCycle === "yearly" ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow" : "text-slate-400"
            }`}
          >
            <span>Yearly</span>
            <span className="bg-emerald-500 text-white text-[9px] px-1 rounded-full font-bold">20% Off</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="pricing-cards-grid">
        {plans.map((plan) => {
          const isActive = currentTier.toLowerCase() === plan.name.toLowerCase();
          const calculatedPrice = billingCycle === "yearly" ? Math.round(plan.price * 0.8) : plan.price;
          
          return (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                isActive 
                  ? "ring-2 ring-indigo-600 border-indigo-600 dark:ring-indigo-500 shadow-md" 
                  : plan.id === "pro"
                    ? "border-slate-300 dark:border-slate-700 shadow-lg"
                    : "border-slate-200 dark:border-slate-800"
              }`}
              id={`plan-card-${plan.id}`}
            >
              {plan.id === "pro" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold text-[9px] tracking-wider uppercase px-3 py-1 rounded-full shadow">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white uppercase">{plan.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 py-2">
                  <span className="text-4xl font-extrabold font-mono text-slate-800 dark:text-white">
                    {currencySymbol}{calculatedPrice}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/mo</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                <button
                  onClick={() => handleOpenCheckout(plan)}
                  disabled={isActive}
                  className={`w-full py-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-bold"
                      : plan.id === "pro"
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                  id={`btn-${plan.id}`}
                >
                  <span>{isActive ? (lang === "FR" ? "Plan Actif" : "Active Current Plan") : plan.cta}</span>
                  {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* STRIPE CHECKOUT MODAL SIMULATOR */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="checkout-modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="bg-indigo-600 p-6 text-white text-center">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-white/10 px-2.5 py-1 rounded-full border border-white/10 inline-block mb-2">
                {paymentGateway === "stripe" ? "Stripe Secure Checkout" : paymentGateway === "paypal" ? "PayPal Secure Checkout" : "Paddle Secure Checkout"}
              </span>
              <h3 className="text-lg font-bold">Subscribe to {selectedPlan.name} Plan</h3>
              <p className="text-xs text-indigo-100 mt-1">
                {currencySymbol}{billingCycle === "yearly" ? Math.round(selectedPlan.price * 0.8) : selectedPlan.price} {billingCycle === "yearly" ? "billed annually" : "billed monthly"}
              </p>
            </div>

            {/* Modal Body / Checkout Form */}
            <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
              {/* Payment Gateway Options */}
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <button
                  type="button"
                  onClick={() => { setPaymentGateway("stripe"); setCheckoutError(""); }}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                    paymentGateway === "stripe" 
                      ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900" 
                      : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  <span>Credit Card</span>
                  {config?.paymentSettings?.stripeActive === false && (
                    <span className="text-[8px] text-rose-500 font-bold uppercase">Disabled</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentGateway("paypal"); setCheckoutError(""); }}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                    paymentGateway === "paypal" 
                      ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900" 
                      : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  <span>PayPal</span>
                  {config?.paymentSettings?.paypalActive === false && (
                    <span className="text-[8px] text-rose-500 font-bold uppercase">Disabled</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentGateway("paddle"); setCheckoutError(""); }}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                    paymentGateway === "paddle" 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" 
                      : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  <span>Paddle</span>
                  {config?.paymentSettings?.paddleActive === false ? (
                    <span className="text-[8px] text-rose-500 font-bold uppercase">Disabled</span>
                  ) : (
                    <span className="text-[8px] text-emerald-500 font-bold uppercase">Active</span>
                  )}
                </button>
              </div>

              {checkoutError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-3 rounded-lg text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2 leading-tight">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {paySuccess ? (
                <div className="py-8 text-center space-y-3 animate-fade-in" id="pay-success-pane">
                  <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">Payment Authorized Successfully!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Upgrading your Developer Hub token and account thresholds.</p>
                </div>
              ) : (
                <>
                  {/* DYNAMIC FORM RENDERING */}
                  {paymentGateway === "paypal" ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">Full Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          required
                          placeholder="Jean Dupont"
                          className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">PayPal Email Address</label>
                        <div className="relative flex items-center">
                          <input
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            required
                            placeholder="paypal-buyer@domain.com"
                            className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 text-[10px] text-blue-700 dark:text-blue-400 leading-normal">
                        {lang === "FR" 
                          ? "Vous allez être redirigé vers l'environnement de test PayPal Sandbox sécurisé pour autoriser le prélèvement."
                          : "You will authorize the transaction using the secure PayPal Sandbox testing environment."}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">Card Holder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          required
                          className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">Email Address</label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          required
                          className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">Card details</label>
                        <div className="relative flex items-center">
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3" />
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-3 py-2 text-xs font-mono text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">Expiry</label>
                          <input
                            type="text"
                            defaultValue="12 / 29"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">CVC</label>
                          <input
                            type="password"
                            defaultValue="•••"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 flex gap-2 text-[10px] text-amber-700 dark:text-amber-400 leading-normal">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>This is a simulated secure testing environment. Do not enter actual credit card details. Use mock parameters to trigger the upgrade pipeline.</span>
                      </div>
                    </div>
                  )}

                  {/* GATEWAY DISABLED BANNERS */}
                  {paymentGateway === "stripe" && config?.paymentSettings?.stripeActive === false && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-xl font-medium">
                      ⚠️ {lang === "FR" 
                        ? "Le paiement par carte bancaire est désactivé par l'administrateur système de la plateforme." 
                        : "Credit card checkout is currently offline as configured by the system administrator."}
                    </div>
                  )}

                  {paymentGateway === "paypal" && config?.paymentSettings?.paypalActive === false && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs p-3.5 rounded-xl font-medium">
                      ⚠️ {lang === "FR" 
                        ? "Le paiement via PayPal est désactivé par l'administrateur système de la plateforme." 
                        : "PayPal checkout is currently offline as configured by the system administrator."}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      paying || 
                      (paymentGateway === "stripe" && config?.paymentSettings?.stripeActive === false) ||
                      (paymentGateway === "paypal" && config?.paymentSettings?.paypalActive === false)
                    }
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing with gateway...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {paymentGateway === "stripe" && config?.paymentSettings?.stripeActive === false
                            ? (lang === "FR" ? "Indisponible" : "Gateway Offline")
                            : paymentGateway === "paypal" && config?.paymentSettings?.paypalActive === false
                              ? (lang === "FR" ? "Indisponible" : "Gateway Offline")
                              : (lang === "FR" ? "Autoriser le Paiement" : "Authorize Payment")}
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
