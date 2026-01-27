import { useState } from "react";
import { useLocation } from "wouter";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";

// Supabase client for Edge Function calls
const supabase = createClient(
  "https://scasgwrikoqdwlwlwcff.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYXNnd3Jpa29xZHdsd2x3Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODUxODEsImV4cCI6MjA4MjU2MTE4MX0.83ARHv2Zj6oJpbojPCIT0ljL8Ze2JqMBztLVueGXXhs"
);
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Check,
  X,
  DollarSign,
  Users,
  Shield,
  TrendingUp,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Star,
  Building2,
  Handshake,
  ArrowDown,
  Crown,
  Sparkles,
  CreditCard,
  Search,
  MessageSquare,
  Calendar,
  BarChart3,
  Mail,
  Phone,
  Bot,
  FileText,
  Globe,
  Smartphone,
  Receipt,
  CheckCircle2,
  Target,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

// New brand colors from logo
const COLORS = {
  background: '#000000',
  backgroundAlt: '#0A0A0A',
  backgroundCard: '#111111',
  teal: '#00CED1',
  tealDark: '#00A5A8',
  gold: '#D4A84B',
  goldLight: '#E5B84D',
  blue: '#3B82F6',
  green: '#10B981',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  textDim: '#6B7280',
  border: '#1F1F1F',
};

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [spotsLeft, setSpotsLeft] = useState<number>(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const counterRef = useRef<NodeJS.Timeout | null>(null);
  const [showProPlusModal, setShowProPlusModal] = useState(false);

  // Urgency counter logic - persistent per visitor (1,000 spots max)
  useEffect(() => {
    const storedSpots = localStorage.getItem('tavvy_promo_spots');
    const lastVisit = localStorage.getItem('tavvy_last_visit');
    const now = Date.now();
    
    let currentSpots: number;
    
    if (storedSpots && lastVisit) {
      const timeSinceLastVisit = now - parseInt(lastVisit);
      const hoursAway = Math.floor(timeSinceLastVisit / (1000 * 60 * 60));
      const decrease = Math.min(Math.max(1, hoursAway * 2 + Math.floor(Math.random() * 3)), 50);
      currentSpots = Math.max(100, Math.min(parseInt(storedSpots) - decrease, 1000));
    } else {
      currentSpots = 435;
    }
    
    setSpotsLeft(currentSpots);
    localStorage.setItem('tavvy_promo_spots', currentSpots.toString());
    localStorage.setItem('tavvy_last_visit', now.toString());
    
    const simulatePurchases = () => {
      const randomInterval = 15000 + Math.random() * 45000;
      
      counterRef.current = setTimeout(() => {
        setSpotsLeft(prev => {
          const newValue = Math.max(100, prev - 1);
          localStorage.setItem('tavvy_promo_spots', newValue.toString());
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
          return newValue;
        });
        simulatePurchases();
      }, randomInterval);
    };
    
    simulatePurchases();
    
    return () => {
      if (counterRef.current) {
        clearTimeout(counterRef.current);
      }
    };
  }, []);

  const handleGetStarted = async (plan: 'pro' | 'pro_plus' = 'pro', cycle: 'yearly' | 'monthly' = 'yearly') => {
    const planKey = `${plan}_${cycle}`;
    setIsLoading(true);
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          successUrl: window.location.origin + `/signup?payment=success&plan=${plan}&cycle=${cycle}`,
          cancelUrl: window.location.origin + '/',
          plan: plan,
          cycle: cycle,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        alert('Unable to start checkout. Please try again.');
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unable to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  const scrollToSignup = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const proFeatures = [
    "Unlimited lead access in your area",
    "Fair lead distribution - no racing",
    "Fair review system - bad days fade",
    "Direct messaging with customers",
    "Profile & portfolio showcase",
    "No per-lead fees. Ever.",
  ];

  const proPlusFeatures = [
    "Everything in Pro, plus:",
    "Full CRM with Automation (360 For Business)",
    "Up to 200 sponsored searches/month",
    "Free Tavvy Pros Digital Business Cards",
    "Priority customer support",
    "Advanced analytics dashboard",
  ];

  const faqItems = [
    {
      question: "Is $199/year forever?",
      answer: "No — the $199 rate is for your first 12 months. After that, your plan renews at the regular rate ($599/year for Pro, $1,399/year for Pro+) unless you cancel. You can cancel anytime during your subscription."
    },
    {
      question: "How is this different from other lead platforms?",
      answer: "Other platforms charge you $15-100+ per lead, and sell the same lead to 5-10 other pros. You're racing against everyone else, and most of your money goes to leads that never convert. Tavvy charges a flat $199 for your first 12 months for unlimited leads, distributed fairly among pros in your area. No racing, no per-lead fees, no surprises."
    },
    {
      question: "What do you mean by 'fair lead distribution'?",
      answer: "Instead of selling the same lead to 10 professionals and watching them fight for it, we distribute leads fairly among qualified pros in each area. Everyone gets their fair share of opportunities. No racing to call first, no paying for leads that 9 other people also got."
    },
    {
      question: "How does the review system work?",
      answer: "We believe in fair representation. If you get a negative review that isn't part of a pattern (meaning it's a one-off), it will fade from visibility after 6 months. Recurring issues stay visible because that's fair to customers. Your profile should reflect who you are now, not one bad day from years ago."
    },
    {
      question: "What's the difference between Pro and Pro+?",
      answer: "Pro ($199 for first 12 months, then $599/year) gives you unlimited leads, fair distribution, and our fair review system. Pro+ ($599 for first 12 months, then $1,399/year) includes everything in Pro plus a full CRM system (360 For Business) with automation, invoicing, scheduling, email marketing, and more - tools that would cost $200+/month if purchased separately. Plus 200 sponsored searches per month and digital business cards."
    },
    {
      question: "What trades/services do you support?",
      answer: "We support ALL professional service providers — not just home services. This includes auto mechanics, boat mechanics, car detailers, architects, photographers, event planners, personal trainers, tutors, accountants, lawyers, and literally any professional who provides services to customers. If you're a pro who does work for others, Tavvy is built for you."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! We offer a 30-day money-back guarantee. If Tavvy isn't working for you within the first 30 days, we'll refund your payment in full. No questions asked, no hassle. You can also cancel anytime before renewal."
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: COLORS.background, borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <img 
              src="/tavvy-logo.png" 
              alt="Tavvy" 
              className="h-9 w-auto"
            />
            <span style={{ color: COLORS.gold }} className="font-semibold text-lg">Pros</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="hover:bg-white/10"
              style={{ color: COLORS.textMuted }}
              onClick={() => setLocation("/login")}
            >
              Sign In
            </Button>
            <Button
              className="text-black font-semibold shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.gold} 100%)`,
              }}
              onClick={() => scrollToSignup()}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Premium Early Adopter Banner - Fixed at top */}
      <div 
        className="fixed top-[60px] left-0 right-0 z-40 py-3 px-4 shadow-xl"
        style={{ 
          backgroundColor: COLORS.backgroundAlt,
          borderBottom: `1px solid ${COLORS.gold}30`
        }}
      >
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <div className="flex items-center gap-3">
            <div 
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full animate-pulse"
              style={{ backgroundColor: COLORS.gold }}
            >
              <Crown className="w-4 h-4 text-black" />
            </div>
            <div className="text-center sm:text-left">
              <span style={{ color: COLORS.gold }} className="font-bold text-xs uppercase tracking-wider">Founding Pro Pricing</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm md:text-base text-white">Only</span>
                <span 
                  className={`font-black text-2xl md:text-3xl inline-block transition-all duration-500 ${
                    isAnimating ? 'scale-110' : ''
                  }`}
                  style={{ 
                    color: isAnimating ? COLORS.teal : COLORS.gold,
                    textShadow: `0 0 20px ${COLORS.gold}50`,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {spotsLeft.toLocaleString()}
                </span>
                <span className="font-medium text-sm md:text-base text-white">of 1,000 spots left</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block h-8 w-px" style={{ backgroundColor: COLORS.border }} />
          <div className="hidden md:block text-center">
            <p style={{ color: COLORS.teal }} className="font-semibold text-sm">$199 for your first 12 months</p>
            <p style={{ color: COLORS.textDim }} className="text-xs">Then regular price. Cancel anytime.</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: The Hook (Above the Fold) */}
      <section className="pt-36 pb-8 px-4 relative overflow-hidden">
        {/* Gradient orbs matching logo colors */}
        <div 
          className="absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${COLORS.teal} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${COLORS.gold} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: `radial-gradient(circle, ${COLORS.blue} 0%, transparent 70%)` }}
        />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center">
            {/* Founding Pro Pricing Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                backgroundColor: `${COLORS.gold}20`,
                color: COLORS.gold,
                border: `1px solid ${COLORS.gold}30`
              }}
            >
              <Crown className="w-4 h-4" />
              Founding Pro Pricing
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Stop Buying Leads.<br />
              <span style={{ color: COLORS.teal }}>Start Winning Jobs.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: COLORS.textMuted }}>
              $199 for your first 12 months. Then regular price.<br />
              <span style={{ color: COLORS.textDim }}>No lead fees. No bidding wars.</span>
            </p>
            <Button
              size="lg"
              className="text-black text-lg px-10 py-7 shadow-xl font-semibold"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.gold} 100%)`,
                boxShadow: `0 10px 40px ${COLORS.teal}30`
              }}
              onClick={() => scrollToSignup()}
            >
              Get Started — Plans from $199
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p style={{ color: COLORS.textDim }} className="text-sm mt-4">
              Intro rate applies to your first 12 months. Renews at the regular rate unless canceled.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Decision Block */}
      <section className="py-12 px-4" style={{ backgroundColor: COLORS.backgroundAlt }}>
        <div className="container mx-auto max-w-3xl">
          <div 
            className="rounded-3xl p-8 md:p-12"
            style={{ 
              backgroundColor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.teal}30`
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Is Tavvy Pro Right For You?
            </h2>
            
            <div className="space-y-4 mb-8">
              {[
                "You're a professional who provides services (any industry)",
                "You're tired of paying $50-100+ per lead that goes nowhere",
                "You want predictable costs, not surprise bills",
                "You believe one bad review shouldn't define your business",
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 rounded-xl p-4"
                  style={{ backgroundColor: COLORS.background }}
                >
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.green }} />
                  <span style={{ color: COLORS.textMuted }} className="font-medium">{item}</span>
                </div>
              ))}
            </div>
            
            <p className="text-center text-xl font-bold" style={{ color: COLORS.teal }}>
              Then Tavvy is built for you.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: ROI Callout */}
      <section 
        className="py-12 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.tealDark} 100%)`
        }}
      >
        <div className="container mx-auto max-w-4xl text-center text-black">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            If Tavvy Gets You Just ONE Job This Year, It Pays For Itself.
          </h2>
          <p className="text-xl opacity-80">
            Everything else is pure profit.
          </p>
        </div>
      </section>

      {/* SECTION 4: Pricing Table */}
      <section id="pricing" className="py-16 px-4" style={{ backgroundColor: COLORS.background }}>
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ 
                backgroundColor: `${COLORS.gold}20`,
                color: COLORS.gold
              }}
            >
              <Crown className="w-4 h-4" />
              Founding Pro Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Lock In Your First-Year Rate
            </h2>
            <p className="text-lg mb-4" style={{ color: COLORS.textMuted }}>
              This exclusive pricing is only available to our first 1,000 professionals
            </p>
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: COLORS.backgroundCard }}
            >
              <span className="font-bold" style={{ color: COLORS.gold }}>{spotsLeft.toLocaleString()}</span>
              <span className="text-white">spots left</span>
              <span style={{ color: COLORS.textDim }}>|</span>
              <span style={{ color: COLORS.teal }}>Price goes up 5x after</span>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div 
              className="rounded-full p-1 shadow-md"
              style={{ backgroundColor: COLORS.backgroundCard, border: `1px solid ${COLORS.border}` }}
            >
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all`}
                style={{ 
                  backgroundColor: billingCycle === 'yearly' ? COLORS.teal : 'transparent',
                  color: billingCycle === 'yearly' ? 'black' : COLORS.textMuted
                }}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly <span style={{ color: billingCycle === 'yearly' ? 'black' : COLORS.green }} className="text-xs ml-1">Save $$$</span>
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all`}
                style={{ 
                  backgroundColor: billingCycle === 'monthly' ? COLORS.teal : 'transparent',
                  color: billingCycle === 'monthly' ? 'black' : COLORS.textMuted
                }}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <Card 
              className="shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              style={{ 
                backgroundColor: COLORS.backgroundCard,
                border: `2px solid ${COLORS.border}`
              }}
            >
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
                
                {billingCycle === 'yearly' ? (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl line-through" style={{ color: COLORS.textDim }}>$599</span>
                      <span className="text-5xl font-bold text-white">$199</span>
                    </div>
                    <p style={{ color: COLORS.textMuted }} className="text-sm mb-2">for your first year</p>
                    <p style={{ color: COLORS.textDim }} className="text-sm mb-2">Then $599/year</p>
                    <div 
                      className="inline-block text-sm font-medium px-3 py-1 rounded-full mb-4"
                      style={{ backgroundColor: `${COLORS.green}20`, color: COLORS.green }}
                    >
                      Founders Discount: Save $400
                    </div>
                    <p style={{ color: COLORS.textDim }} className="text-xs mb-4">
                      <span className="font-bold" style={{ color: COLORS.gold }}>{spotsLeft.toLocaleString()}</span> of 1,000 spots left
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl line-through" style={{ color: COLORS.textDim }}>$59.99</span>
                      <span className="text-5xl font-bold text-white">$49.99</span>
                      <span style={{ color: COLORS.textDim }}>/month</span>
                    </div>
                    <p style={{ color: COLORS.textMuted }} className="text-sm mb-2">for your first 12 months</p>
                    <p style={{ color: COLORS.textDim }} className="text-sm mb-2">Then $59.99/mo</p>
                    <div 
                      className="inline-block text-sm font-medium px-3 py-1 rounded-full mb-4"
                      style={{ backgroundColor: `${COLORS.green}20`, color: COLORS.green }}
                    >
                      Founders Discount: Save $10/mo
                    </div>
                  </>
                )}

                <ul className="space-y-3 mb-8">
                  {proFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLORS.teal }} />
                      <span style={{ color: COLORS.textMuted }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full py-6 text-lg font-semibold"
                  style={{ 
                    backgroundColor: COLORS.teal,
                    color: 'black'
                  }}
                  onClick={() => handleGetStarted('pro', billingCycle)}
                  disabled={isLoading && loadingPlan === `pro_${billingCycle}`}
                >
                  {isLoading && loadingPlan === `pro_${billingCycle}` ? 'Processing...' : `Get Pro - ${billingCycle === 'yearly' ? '$199/year' : '$49.99/mo'}`}
                </Button>
                <p className="text-center text-xs mt-3" style={{ color: COLORS.textDim }}>
                  {billingCycle === 'yearly' 
                    ? 'No contract. Renews at $599/year. Cancel anytime.' 
                    : 'No contract. Renews at $59.99/mo after 12 months. Cancel anytime.'}
                </p>
              </CardContent>
            </Card>

            {/* Pro+ Plan */}
            <Card 
              className="shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.backgroundCard} 0%, #1a1a1a 100%)`,
                border: `2px solid ${COLORS.gold}`
              }}
            >
              <div className="absolute top-4 left-4">
                <span 
                  className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: COLORS.gold, color: 'black' }}
                >
                  <Crown className="w-3 h-3" /> BEST VALUE
                </span>
              </div>
              <CardContent className="p-8 pt-14 text-white">
                <h3 className="text-2xl font-bold mb-4">Pro+</h3>
                
                {billingCycle === 'yearly' ? (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl line-through" style={{ color: COLORS.textDim }}>$1,399</span>
                      <span className="text-5xl font-bold">$599</span>
                    </div>
                    <p style={{ color: COLORS.textMuted }} className="text-sm mb-2">for your first year</p>
                    <p style={{ color: COLORS.textDim }} className="text-sm mb-2">Then $1,399/year</p>
                    <div 
                      className="inline-block text-sm font-medium px-3 py-1 rounded-full mb-4"
                      style={{ backgroundColor: COLORS.gold, color: 'black' }}
                    >
                      Founders Discount: Save $800
                    </div>
                    <p style={{ color: COLORS.textMuted }} className="text-xs mb-4">
                      <span className="font-bold" style={{ color: COLORS.gold }}>{spotsLeft.toLocaleString()}</span> of 1,000 spots left
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl line-through" style={{ color: COLORS.textDim }}>$119.99</span>
                      <span className="text-5xl font-bold">$69.99</span>
                      <span style={{ color: COLORS.textMuted }}>/month</span>
                    </div>
                    <p style={{ color: COLORS.textMuted }} className="text-sm mb-2">for your first 12 months</p>
                    <p style={{ color: COLORS.textDim }} className="text-sm mb-2">Then $119.99/mo</p>
                    <div 
                      className="inline-block text-sm font-medium px-3 py-1 rounded-full mb-4"
                      style={{ backgroundColor: COLORS.gold, color: 'black' }}
                    >
                      Founders Discount: Save $50/mo
                    </div>
                  </>
                )}

                <ul className="space-y-3 mb-8">
                  {proPlusFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLORS.gold }} />
                      <span style={{ color: i === 0 ? COLORS.gold : COLORS.textMuted }} className={i === 0 ? "font-medium" : ""}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full py-6 text-lg shadow-lg font-semibold"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 100%)`,
                    color: 'black',
                    boxShadow: `0 10px 30px ${COLORS.gold}30`
                  }}
                  onClick={() => handleGetStarted('pro_plus', billingCycle)}
                  disabled={isLoading && loadingPlan === `pro_plus_${billingCycle}`}
                >
                  {isLoading && loadingPlan === `pro_plus_${billingCycle}` ? 'Processing...' : `Get Pro+ - ${billingCycle === 'yearly' ? '$599/year' : '$69.99/mo'}`}
                </Button>
                <p className="text-center text-xs mt-3" style={{ color: COLORS.textMuted }}>
                  {billingCycle === 'yearly' 
                    ? 'No contract. Renews at $1,399/year. Cancel anytime.' 
                    : 'No contract. Renews at $119.99/mo after 12 months. Cancel anytime.'}
                </p>
                
                <button 
                  className="w-full text-center text-sm mt-4 hover:underline"
                  style={{ color: COLORS.gold }}
                  onClick={() => setShowProPlusModal(true)}
                >
                  See Full Pro+ Features →
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 5: Risk Reversal Block */}
      <section className="py-12 px-4" style={{ backgroundColor: COLORS.backgroundAlt }}>
        <div className="container mx-auto max-w-3xl">
          <div 
            className="rounded-3xl p-8 md:p-12"
            style={{ 
              backgroundColor: COLORS.backgroundCard,
              border: `1px solid ${COLORS.green}30`
            }}
          >
            <div className="text-center mb-8">
              <ShieldCheck className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.green }} />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Zero Risk to Try Tavvy
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: BadgeCheck, text: "30-Day Money-Back Guarantee" },
                { icon: CheckCircle2, text: "No Contract — Cancel Anytime" },
                { icon: Shield, text: "No Hidden Fees" },
                { icon: DollarSign, text: "No Per-Lead Charges — Ever" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 rounded-xl p-4"
                  style={{ backgroundColor: COLORS.background }}
                >
                  <item.icon className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.green }} />
                  <span className="font-medium" style={{ color: COLORS.textMuted }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: How It Works (Simplified 3-Step) */}
      <section id="how-it-works" className="py-16 px-4" style={{ backgroundColor: COLORS.background }}>
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              How It Works
            </h2>
            <p className="text-lg" style={{ color: COLORS.textMuted }}>
              Simple, fair, and built for professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Users,
                title: "Customer Requests Service",
                desc: "They choose how many contractors they want to talk to"
              },
              {
                step: "2",
                icon: Target,
                title: "Tavvy Distributes Fairly",
                desc: "Leads are split among pros in your area. No racing, no bidding wars."
              },
              {
                step: "3",
                icon: Handshake,
                title: "You Connect & Win",
                desc: "Get a fair shot at the job without competing on speed"
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  style={{ 
                    backgroundColor: COLORS.teal,
                    boxShadow: `0 10px 30px ${COLORS.teal}30`
                  }}
                >
                  <item.icon className="w-8 h-8 text-black" />
                </div>
                <div className="text-sm font-bold mb-2" style={{ color: COLORS.teal }}>STEP {item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p style={{ color: COLORS.textMuted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Social Proof (Testimonial) */}
      <section className="py-16 px-4" style={{ backgroundColor: COLORS.backgroundAlt }}>
        <div className="container mx-auto max-w-3xl">
          <Card 
            className="border-none shadow-xl"
            style={{ backgroundColor: COLORS.backgroundCard }}
          >
            <CardContent className="p-8 md:p-12">
              <div className="flex justify-center mb-6">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-6 h-6" style={{ color: COLORS.gold, fill: COLORS.gold }} />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl text-center mb-6 leading-relaxed" style={{ color: COLORS.textMuted }}>
                "I was spending $800/month on lead generation platforms. Now I pay $199 for my first year and get better quality leads. The fair distribution means I'm not racing against 10 other pros for the same job."
              </blockquote>
              <div className="text-center">
                <p className="font-bold text-white">Mike R.</p>
                <p style={{ color: COLORS.textDim }}>Service Professional, Austin TX</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 8: Why We're Different (Condensed) */}
      <section className="py-16 px-4" style={{ backgroundColor: COLORS.background }}>
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Why We're Different
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Fair Reviews */}
            <div 
              className="rounded-2xl p-8"
              style={{ 
                backgroundColor: COLORS.backgroundCard,
                border: `1px solid ${COLORS.border}`
              }}
            >
              <Shield className="w-12 h-12 mb-4" style={{ color: COLORS.teal }} />
              <h3 className="text-xl font-bold mb-4 text-white">Fair Reviews</h3>
              <p className="leading-relaxed" style={{ color: COLORS.textMuted }}>
                One bad day shouldn't haunt you forever. On Tavvy, non-recurring negative reviews fade after 6 months. Your profile reflects who you are <strong className="text-white">now</strong>, not one mistake from years ago.
              </p>
            </div>

            {/* Built by Pros, For Pros */}
            <div 
              className="rounded-2xl p-8"
              style={{ 
                backgroundColor: COLORS.backgroundCard,
                border: `1px solid ${COLORS.border}`
              }}
            >
              <Handshake className="w-12 h-12 mb-4" style={{ color: COLORS.gold }} />
              <h3 className="text-xl font-bold mb-4 text-white">Built by Pros, For Pros</h3>
              <p className="leading-relaxed" style={{ color: COLORS.textMuted }}>
                Our founding team spent 15+ years as service professionals. We built Tavvy because we got tired of Big Tech platforms extracting every dollar from hardworking pros. We're on <strong className="text-white">your</strong> side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: Pro+ Upsell (Simplified) */}
      <section 
        className="py-16 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 100%)`
        }}
      >
        <div className="container mx-auto max-w-4xl text-center text-black">
          <Crown className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pro+ Replaces Multiple Tools You Already Pay For
          </h2>
          <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
            CRM, Invoicing, Scheduling, Email Marketing, Reputation Management — all included. Save up to $8,800/year.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl font-semibold"
              style={{ backgroundColor: 'black', color: COLORS.gold }}
              onClick={() => setShowProPlusModal(true)}
            >
              See Full Pro+ Features
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 font-semibold"
              style={{ 
                border: '2px solid black',
                color: 'black',
                backgroundColor: 'transparent'
              }}
              onClick={() => handleGetStarted('pro_plus', billingCycle)}
            >
              Get Pro+ — $599 first year
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4" style={{ backgroundColor: COLORS.backgroundAlt }}>
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ 
                  backgroundColor: COLORS.backgroundCard,
                  border: `1px solid ${COLORS.border}`
                }}
              >
                <button
                  className="w-full p-6 text-left flex justify-between items-center gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-white">{item.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.textDim }} />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.textDim }} />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 leading-relaxed" style={{ color: COLORS.textMuted }}>
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: Final CTA */}
      <section className="py-20 px-4" style={{ backgroundColor: COLORS.background }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Tavvy Pros
          </h2>
          <p className="text-xl mb-8" style={{ color: COLORS.textMuted }}>
            Fair leads. Fair reviews. Fair pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl font-semibold"
              style={{ 
                backgroundColor: COLORS.teal,
                color: 'black'
              }}
              onClick={() => handleGetStarted('pro', billingCycle)}
            >
              Get Pro — $199 first year
            </Button>
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl font-semibold"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 100%)`,
                color: 'black',
                boxShadow: `0 10px 30px ${COLORS.gold}30`
              }}
              onClick={() => handleGetStarted('pro_plus', billingCycle)}
            >
              Get Pro+ — $599 first year
            </Button>
          </div>
          <p className="text-sm mt-4" style={{ color: COLORS.textDim }}>
            Intro rate applies to your first 12 months. Renews at the regular rate unless canceled.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4" style={{ backgroundColor: COLORS.background, borderTop: `1px solid ${COLORS.border}` }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/tavvy-logo.png" alt="Tavvy" className="h-6 w-auto" />
              <span style={{ color: COLORS.gold }} className="font-semibold">Pros</span>
            </div>
            <p className="text-sm" style={{ color: COLORS.textDim }}>© 2026 Tavvy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Pro+ Features Modal */}
      {showProPlusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div 
            className="rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: COLORS.backgroundCard }}
          >
            <div 
              className="sticky top-0 p-6 flex justify-between items-center"
              style={{ backgroundColor: COLORS.backgroundCard, borderBottom: `1px solid ${COLORS.border}` }}
            >
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6" style={{ color: COLORS.gold }} />
                Pro+ Features — 360 For Business CRM
              </h3>
              <button 
                onClick={() => setShowProPlusModal(false)}
                style={{ color: COLORS.textDim }}
                className="hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="mb-6" style={{ color: COLORS.textMuted }}>
                A complete business management platform that helps you capture leads, nurture relationships, and grow your business — all for a fraction of what you'd pay elsewhere.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: FileText, title: "Lead Management", desc: "Capture, organize, and track every lead in one place." },
                  { icon: Bot, title: "Automated Follow-ups", desc: "Email and SMS sequences that nurture leads automatically." },
                  { icon: MessageSquare, title: "Two-Way SMS & Email", desc: "Communicate directly from your CRM." },
                  { icon: Calendar, title: "Appointment Scheduling", desc: "Let customers book directly. Automated reminders." },
                  { icon: BarChart3, title: "Visual Sales Pipeline", desc: "Drag-and-drop pipeline from lead to job won." },
                  { icon: Receipt, title: "Invoicing & Payments", desc: "Professional invoices, accept credit cards online." },
                  { icon: Mail, title: "Email Marketing", desc: "Newsletters and promotions with pre-built templates." },
                  { icon: Star, title: "Reputation Management", desc: "Auto-request reviews, monitor online reputation." },
                  { icon: Smartphone, title: "Mobile App Access", desc: "Manage your business from anywhere." },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="rounded-xl p-4"
                    style={{ 
                      backgroundColor: COLORS.background,
                      border: `1px solid ${COLORS.border}`
                    }}
                  >
                    <item.icon className="w-8 h-8 mb-2" style={{ color: COLORS.gold }} />
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-sm" style={{ color: COLORS.textDim }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <div 
                className="rounded-xl p-6 text-center"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.gold}20 0%, ${COLORS.goldLight}20 100%)`,
                  border: `1px solid ${COLORS.gold}30`
                }}
              >
                <p className="font-bold text-lg mb-2" style={{ color: COLORS.gold }}>$297/month value included FREE with Pro+</p>
                <p className="mb-4" style={{ color: COLORS.textMuted }}>Save up to $8,800/year compared to buying these tools separately</p>
                <Button
                  className="px-8 py-3 font-semibold"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 100%)`,
                    color: 'black'
                  }}
                  onClick={() => {
                    setShowProPlusModal(false);
                    handleGetStarted('pro_plus', billingCycle);
                  }}
                >
                  Get Pro+ — $599 first year
                </Button>
                <p className="text-xs mt-3" style={{ color: COLORS.textDim }}>
                  Renews at $1,399/year after 12 months. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
