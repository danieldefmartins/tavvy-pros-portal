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
      question: "Is $99/year forever?",
      answer: "No — the $99 rate is for your first 12 months. After that, your plan renews at the regular rate ($499/year for Pro, $1,299/year for Pro+) unless you cancel. You can cancel anytime during your subscription."
    },
    {
      question: "How is this different from Thumbtack, Angi, or HomeAdvisor?",
      answer: "Those platforms charge you $15-100+ per lead, and sell the same lead to 5-10 other contractors. You're racing against everyone else, and most of your money goes to leads that never convert. Tavvy charges a flat $99 for your first 12 months for unlimited leads, distributed fairly among pros in your area. No racing, no per-lead fees, no surprises."
    },
    {
      question: "What do you mean by 'fair lead distribution'?",
      answer: "Instead of selling the same lead to 10 contractors and watching them fight for it, we distribute leads fairly among qualified pros in each area. Everyone gets their fair share of opportunities. No racing to call first, no paying for leads that 9 other people also got."
    },
    {
      question: "How does the review system work?",
      answer: "We believe in fair representation. If you get a negative review that isn't part of a pattern (meaning it's a one-off), it will fade from visibility after 6 months. Recurring issues stay visible because that's fair to customers. Your profile should reflect who you are now, not one bad day from years ago."
    },
    {
      question: "What's the difference between Pro and Pro+?",
      answer: "Pro ($99 for first 12 months, then $499/year) gives you unlimited leads, fair distribution, and our fair review system. Pro+ ($499 for first 12 months, then $1,299/year) includes everything in Pro plus a full CRM system (360 For Business) with automation, invoicing, scheduling, email marketing, and more - tools that would cost $200+/month if purchased separately. Plus 200 sponsored searches per month and digital business cards."
    },
    {
      question: "What trades/services do you support?",
      answer: "We support all local service professionals including plumbers, electricians, HVAC technicians, roofers, painters, landscapers, cleaners, handymen, contractors, and many more. If you provide services to local customers, Tavvy Pro is built for you."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! We offer a 30-day money-back guarantee. If Tavvy isn't working for you within the first 30 days, we'll refund your payment in full. No questions asked, no hassle. You can also cancel anytime before renewal."
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a] shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <img 
              src="/tavvy-logo.png" 
              alt="Tavvy" 
              className="h-9 w-auto"
            />
            <span className="text-orange-400 font-semibold text-lg">Pros</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setLocation("/login")}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
              onClick={() => scrollToSignup()}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Premium Early Adopter Banner - Fixed at top */}
      <div className="fixed top-[60px] left-0 right-0 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-3 px-4 shadow-xl border-b border-orange-500/30">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full animate-pulse">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">Founding Pro Pricing</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm md:text-base text-white">Only</span>
                <span 
                  className={`font-black text-2xl md:text-3xl text-orange-400 inline-block transition-all duration-500 ${
                    isAnimating ? 'scale-110 text-yellow-400' : ''
                  }`}
                  style={{ 
                    textShadow: '0 0 20px rgba(251, 146, 60, 0.5)',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {spotsLeft.toLocaleString()}
                </span>
                <span className="font-medium text-sm md:text-base text-white">of 1,000 spots left</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block h-8 w-px bg-slate-600" />
          <div className="hidden md:block text-center">
            <p className="text-yellow-400 font-semibold text-sm">$99 for your first 12 months</p>
            <p className="text-slate-400 text-xs">Then regular price. Cancel anytime.</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: The Hook (Above the Fold) */}
      <section className="pt-36 pb-8 px-4 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-100 to-blue-100 rounded-full blur-3xl opacity-50" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center">
            {/* Founding Pro Pricing Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-500/30">
              <Crown className="w-4 h-4" />
              Founding Pro Pricing
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Stop Buying Leads.<br />
              <span className="text-blue-600">Start Winning Jobs.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              $99 for your first 12 months. Then regular price.<br />
              <span className="text-slate-500">No lead fees. No bidding wars.</span>
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-10 py-7 shadow-xl shadow-orange-500/30"
              onClick={() => scrollToSignup()}
            >
              Get Started — Plans from $99
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-slate-500 text-sm mt-4">
              Intro rate applies to your first 12 months. Renews at the regular rate unless canceled.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Decision Block */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl p-8 md:p-12 border border-blue-100">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Is Tavvy Pro Right For You?
            </h2>
            
            <div className="space-y-4 mb-8">
              {[
                "You're a local service pro (plumber, electrician, contractor, etc.)",
                "You're tired of paying $50-100+ per lead that goes nowhere",
                "You want predictable costs, not surprise bills",
                "You believe one bad review shouldn't define your business",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
            
            <p className="text-center text-xl font-bold text-blue-600">
              Then Tavvy is built for you.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: ROI Callout */}
      <section className="py-12 px-4 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            If Tavvy Gets You Just ONE Job This Year, It Pays For Itself.
          </h2>
          <p className="text-xl text-green-100">
            Everything else is pure profit.
          </p>
        </div>
      </section>

      {/* SECTION 4: Pricing Table */}
      <section id="pricing" className="py-16 px-4 bg-[#f9f7f2]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              Founding Pro Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Lock In Your First-Year Rate
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              This exclusive pricing is only available to our first 1,000 contractors
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm">
              <span className="font-bold text-orange-400">{spotsLeft.toLocaleString()}</span>
              <span>spots left</span>
              <span className="text-slate-400">|</span>
              <span className="text-yellow-400">Price goes up 5x after</span>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-md border border-slate-200">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly <span className="text-green-400 text-xs ml-1">Save $$$</span>
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <Card className="bg-white border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Pro</h3>
                
                {billingCycle === 'yearly' ? (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-5xl font-bold text-slate-900">$99</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">for your first 12 months</p>
                    <p className="text-slate-500 text-sm mb-2">Then $499/year</p>
                    <div className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
                      Save $400 your first year
                    </div>
                    <p className="text-slate-500 text-xs mb-4">
                      <span className="font-bold text-orange-600">{spotsLeft.toLocaleString()}</span> of 1,000 spots left
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-5xl font-bold text-slate-900">$39.99</span>
                      <span className="text-slate-500">/month</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-6">First 12 months, then $49.99/mo</p>
                  </>
                )}

                <ul className="space-y-3 mb-8">
                  {proFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-lg"
                  onClick={() => handleGetStarted('pro', billingCycle)}
                  disabled={isLoading && loadingPlan === `pro_${billingCycle}`}
                >
                  {isLoading && loadingPlan === `pro_${billingCycle}` ? 'Processing...' : `Get Pro - ${billingCycle === 'yearly' ? '$99' : '$39.99/mo'}`}
                </Button>
                <p className="text-center text-slate-500 text-xs mt-3">
                  {billingCycle === 'yearly' 
                    ? 'No contract. Renews at $499/year after 12 months. Cancel anytime.' 
                    : 'No contract. Renews at $49.99/mo after 12 months. Cancel anytime.'}
                </p>
              </CardContent>
            </Card>

            {/* Pro+ Plan */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-orange-500 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-4 left-4">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" /> BEST VALUE
                </span>
              </div>
              <CardContent className="p-8 pt-14 text-white">
                <h3 className="text-2xl font-bold mb-4">Pro+</h3>
                
                {billingCycle === 'yearly' ? (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-5xl font-bold">$499</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">for your first 12 months</p>
                    <p className="text-slate-500 text-sm mb-2">Then $1,299/year</p>
                    <div className="inline-block bg-orange-500 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
                      Save $800 your first year
                    </div>
                    <p className="text-slate-400 text-xs mb-4">
                      <span className="font-bold text-orange-400">{spotsLeft.toLocaleString()}</span> of 1,000 spots left
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-5xl font-bold">$59.99</span>
                      <span className="text-slate-400">/month</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">First 12 months, then $109.99/mo</p>
                  </>
                )}

                <ul className="space-y-3 mb-8">
                  {proPlusFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span className={i === 0 ? "text-orange-400 font-medium" : "text-slate-300"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg shadow-lg shadow-orange-500/30"
                  onClick={() => handleGetStarted('pro_plus', billingCycle)}
                  disabled={isLoading && loadingPlan === `pro_plus_${billingCycle}`}
                >
                  {isLoading && loadingPlan === `pro_plus_${billingCycle}` ? 'Processing...' : `Get Pro+ - ${billingCycle === 'yearly' ? '$499' : '$59.99/mo'}`}
                </Button>
                <p className="text-center text-slate-400 text-xs mt-3">
                  {billingCycle === 'yearly' 
                    ? 'No contract. Renews at $1,299/year after 12 months. Cancel anytime.' 
                    : 'No contract. Renews at $109.99/mo after 12 months. Cancel anytime.'}
                </p>
                
                <button 
                  className="w-full text-center text-orange-400 text-sm mt-4 hover:underline"
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
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-green-200">
            <div className="text-center mb-8">
              <ShieldCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
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
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <item.icon className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: How It Works (Simplified 3-Step) */}
      <section id="how-it-works" className="py-16 px-4 bg-[#f9f7f2]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Simple, fair, and built for contractors
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
                desc: "Leads are split among area pros. No racing, no bidding wars."
              },
              {
                step: "3",
                icon: Handshake,
                title: "You Connect & Win",
                desc: "Get a fair shot at the job without competing on speed"
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-bold text-blue-600 mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Social Proof (Testimonial) */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-none shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="flex justify-center mb-6">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl text-slate-700 text-center mb-6 leading-relaxed">
                "I was spending $800/month on Thumbtack and HomeAdvisor combined. Now I pay $99 for my first year and get better quality leads. The fair distribution means I'm not racing against 10 other guys for the same job."
              </blockquote>
              <div className="text-center">
                <p className="font-bold text-slate-900">Mike R.</p>
                <p className="text-slate-500">Plumber, Austin TX</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 8: Why We're Different (Condensed) */}
      <section className="py-16 px-4 bg-slate-900 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why We're Different
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Fair Reviews */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-4">Fair Reviews</h3>
              <p className="text-slate-300 leading-relaxed">
                One bad day shouldn't haunt you forever. On Tavvy, non-recurring negative reviews fade after 6 months. Your profile reflects who you are <strong className="text-white">now</strong>, not one mistake from years ago.
              </p>
            </div>

            {/* Built by Contractors */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <Handshake className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-4">Built by Contractors</h3>
              <p className="text-slate-300 leading-relaxed">
                Our founding team spent 15+ years in the trades. We built Tavvy because we got tired of Big Tech platforms extracting every dollar from hardworking contractors. We're on <strong className="text-white">your</strong> side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: Pro+ Upsell (Simplified) */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <Crown className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pro+ Replaces Multiple Tools You Already Pay For
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            CRM, Invoicing, Scheduling, Email Marketing, Reputation Management — all included. Save up to $8,800/year.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-6 shadow-xl"
              onClick={() => setShowProPlusModal(true)}
            >
              See Full Pro+ Features
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => handleGetStarted('pro_plus', billingCycle)}
            >
              Get Pro+ — $499 first year
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-[#f9f7f2]">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <button
                  className="w-full p-6 text-left flex justify-between items-center gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-900">{item.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: Final CTA */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Tavvy Pros
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Fair leads. Fair reviews. Fair pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 shadow-xl"
              onClick={() => handleGetStarted('pro', billingCycle)}
            >
              Get Pro — $99 first year
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 shadow-xl shadow-orange-500/30"
              onClick={() => handleGetStarted('pro_plus', billingCycle)}
            >
              Get Pro+ — $499 first year
            </Button>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Intro rate applies to your first 12 months. Renews at the regular rate unless canceled.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-950 text-slate-400">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/tavvy-logo.png" alt="Tavvy" className="h-6 w-auto" />
              <span className="text-orange-400 font-semibold">Pros</span>
            </div>
            <p className="text-sm">© 2026 Tavvy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Pro+ Features Modal */}
      {showProPlusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-orange-400" />
                Pro+ Features — 360 For Business CRM
              </h3>
              <button 
                onClick={() => setShowProPlusModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-300 mb-6">
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
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <item.icon className="w-8 h-8 text-orange-400 mb-2" />
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6 text-center">
                <p className="text-orange-400 font-bold text-lg mb-2">$297/month value included FREE with Pro+</p>
                <p className="text-slate-300 mb-4">Save up to $8,800/year compared to buying these tools separately</p>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3"
                  onClick={() => {
                    setShowProPlusModal(false);
                    handleGetStarted('pro_plus', billingCycle);
                  }}
                >
                  Get Pro+ — $499 first year
                </Button>
                <p className="text-slate-400 text-xs mt-3">
                  Renews at $1,299/year after 12 months. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
