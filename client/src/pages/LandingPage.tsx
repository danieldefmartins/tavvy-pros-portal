import { useState } from "react";
import { useLocation } from "wouter";
import { createClient } from "@supabase/supabase-js";

// Supabase client for Edge Function calls
const supabase = createClient(
  "https://scasgwrikoqdwlwlwcff.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYXNnd3Jpa29xZHdsd2x3Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjcyMDAsImV4cCI6MjA1MjU0MzIwMH0.G4L64iqx6Duzq2cx9h7D4A_qUBK8S9r"
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
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<'pro' | 'pro_plus' | null>(null);

  const handleGetStarted = async (plan: 'pro' | 'pro_plus' = 'pro') => {
    setIsLoading(true);
    setLoadingPlan(plan);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          successUrl: window.location.origin + `/signup?payment=success&plan=${plan}`,
          cancelUrl: window.location.origin + '/',
          plan: plan,
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

  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a] shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/tavvy-logo.png" 
              alt="TavvY" 
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

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-100 to-blue-100 rounded-full blur-3xl opacity-50" />
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-full px-4 py-2 mb-6 shadow-sm">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-slate-700 text-sm font-medium">
                Now Open Nationwide After Successful Beta
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-900">
              Stop Paying{" "}
              <span className="text-red-500 line-through decoration-red-400">Thousands</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                For Leads That Go Nowhere
              </span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              TavvY Pro was built by a contractor who got tired of the Big Tech
              monopoly. We're on <strong className="text-slate-800">YOUR</strong> side. Fair leads, fair reviews, fair
              pricing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 shadow-xl shadow-orange-500/30 transition-all hover:shadow-orange-500/40 hover:scale-[1.02]"
                onClick={() => scrollToSignup()}
              >
                View Plans & Pricing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 text-lg px-8 py-6 bg-white/50"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How It Works
              </Button>
            </div>
          </div>

          {/* Two Pricing Cards Side by Side in Hero */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Pro Plan Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full" />
              
              <div className="relative">
                <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  MOST POPULAR
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
                
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-slate-900">$99</span>
                  <span className="text-slate-500 text-xl">/year</span>
                </div>
                
                <p className="text-blue-600 font-medium mb-6">
                  That's just $8.25/month
                </p>

                <div className="space-y-3 mb-6">
                  {proFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
                  onClick={() => handleGetStarted('pro')}
                  disabled={isLoading}
                >
                  {loadingPlan === 'pro' ? 'Processing...' : 'Get Pro'}
                  {loadingPlan !== 'pro' && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Pro+ Plan Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-400/30 border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full" />
              <div className="absolute -top-4 -right-4 w-24 h-24">
                <Sparkles className="w-full h-full text-orange-400/20" />
              </div>
              
              <div className="relative">
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  <Crown className="w-3 h-3" />
                  BEST VALUE
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Pro+</h3>
                
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-white">$499</span>
                  <span className="text-slate-400 text-xl">/year</span>
                </div>
                
                <p className="text-orange-400 font-medium mb-6">
                  That's just $41.58/month
                </p>

                <div className="space-y-3 mb-6">
                  {proPlusFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-orange-400" />
                      </div>
                      <span className={`text-sm ${i === 0 ? 'text-orange-400 font-semibold' : 'text-slate-300'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02]"
                  onClick={() => handleGetStarted('pro_plus')}
                  disabled={isLoading}
                >
                  {loadingPlan === 'pro_plus' ? 'Processing...' : 'Get Pro+'}
                  {loadingPlan !== 'pro_plus' && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-[#f9f7f2]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Tired of the Same Old Story?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl">
              We've heard it from hundreds of contractors just like you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-none shadow-lg shadow-red-100/50 hover:shadow-xl hover:shadow-red-100/50 transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-left">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Paying $50-100+ Per Lead
                </h3>
                <p className="text-slate-600">
                  And half of them don't even answer the phone. The math just
                  doesn't work anymore.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg shadow-red-100/50 hover:shadow-xl hover:shadow-red-100/50 transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-left">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Racing Against 10 Other Contractors
                </h3>
                <p className="text-slate-600">
                  Same lead sold to everyone. First to call wins, everyone else
                  loses their money.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg shadow-red-100/50 hover:shadow-xl hover:shadow-red-100/50 transition-all hover:-translate-y-1">
              <CardContent className="p-6 text-left">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                  <Star className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  One Bad Review Haunts You Forever
                </h3>
                <p className="text-slate-600">
                  Had a rough day 3 years ago? Big Tech platforms make sure
                  everyone knows about it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works / Comparison Section */}
      <section id="how-it-works" className="py-20 px-4 bg-[#f9f7f2]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Traditional Platforms vs TavvY
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl">
              See the difference when someone actually cares about contractors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Way */}
            <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-600">Traditional Pay-Per-Lead</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { step: "1", title: "Customer requests service", desc: "Lead enters the system" },
                  { step: "2", title: "Lead sold to 10+ contractors", desc: "Everyone pays $50-100 each" },
                  { step: "3", title: "Race to call first", desc: "Customer overwhelmed, most contractors lose" },
                  { step: "4", title: "You pay $500+/month for maybe 1-2 jobs", desc: "Platform profits, you struggle" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TavvY Way */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 shadow-lg text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">The TavvY Way</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { step: "1", title: "Customer requests service", desc: "They choose how many contractors to talk to" },
                  { step: "2", title: "Leads split fairly among area pros", desc: "Everyone gets their fair share" },
                  { step: "3", title: "There's enough for everybody", desc: "No racing, no competing for the same lead" },
                  { step: "4", title: "You pay $99/year. Period.", desc: "No per-lead fees, no surprises" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-blue-100 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fair Review System */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 text-sm font-medium">Fair Review System</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                Bad Days Don't Define You{" "}
                <span className="text-blue-600">Forever</span>
              </h2>

              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                We all have rough days. A difficult customer, a miscommunication, an honest mistake. 
                On other platforms, that one bad review follows you for years.
              </p>

              <p className="text-blue-600 font-medium mb-6">
                On TavvY, if a negative review isn't part of a pattern, it fades away after 6 months. 
                Because we believe in second chances and fair representation.
              </p>

              <div className="space-y-3">
                {[
                  "One-off issues don't haunt your profile",
                  "Recurring problems are still visible (as they should be)",
                  "Your reputation reflects who you are NOW",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Month 1-6</h3>
                </div>
                <p className="text-slate-600 mb-4">Review visible, you can respond</p>
                <div className="h-2 bg-red-200 rounded-full">
                  <div className="h-2 bg-red-500 rounded-full w-full" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-slate-900">After 6 Months</h3>
                </div>
                <p className="text-slate-600 mb-4">Non-recurring negative review fades away</p>
                <div className="h-2 bg-green-200 rounded-full">
                  <div className="h-2 bg-orange-400 rounded-full w-1/2" />
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-orange-800 text-sm">
                  <strong>Note:</strong> If similar complaints keep coming, they stay visible. 
                  We're fair, not naive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <Handshake className="w-4 h-4 text-orange-400" />
                <span className="text-white/90 text-sm font-medium">Our Story</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built By Contractors,{" "}
                <span className="text-orange-400">For Contractors</span>
              </h2>

              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                Our founding team spent over 15 years in the trades. We know what it's like to pay hundreds 
                every month for leads that go nowhere. We've watched Big Tech platforms extract every dollar 
                from hardworking contractors while giving nothing back.
              </p>

              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                So we built something different. Something that puts contractors first. Not investors. 
                Not advertisers. <strong className="text-white">You.</strong>
              </p>

              <blockquote className="border-l-4 border-orange-500 pl-6 italic text-slate-400">
                "We're not here to extract every dollar from you. We're here to help you build your business."
              </blockquote>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Building2 className="w-10 h-10 text-orange-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Beta Success</h3>
                <p className="text-slate-400">
                  Tested in major cities across the country with amazing results. 
                  Contractors are winning more jobs and keeping more money.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <TrendingUp className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Backed by Investors Who Get It</h3>
                <p className="text-slate-400">
                  After proving the model works, we secured investment to go nationwide. 
                  Now it's your turn to join.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA - Two Plans */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-[#f9f7f2] to-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Choose Your Plan
          </h2>
          <p className="text-slate-600 text-lg mb-12">
            Join thousands of contractors who made the switch.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                MOST POPULAR
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>

              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-6xl font-bold text-slate-900">$99</span>
                <span className="text-slate-500 text-2xl">/year</span>
              </div>

              <p className="text-blue-600 font-medium mb-8">
                That's just $8.25/month
              </p>

              <div className="space-y-3 text-left mb-8">
                {proFeatures.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg py-6 shadow-xl shadow-blue-500/30 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
                onClick={() => handleGetStarted('pro')}
                disabled={isLoading}
              >
                {loadingPlan === 'pro' ? 'Processing...' : 'Get Started with Pro'}
                {loadingPlan !== 'pro' && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>

              <p className="text-slate-500 text-sm mt-4">
                30-day money-back guarantee
              </p>
            </div>

            {/* Pro+ Plan */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-400/30 border-2 border-orange-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full" />
              
              <div className="relative">
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                  <Crown className="w-4 h-4" />
                  BEST VALUE
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Pro+</h3>

                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-6xl font-bold text-white">$499</span>
                  <span className="text-slate-400 text-2xl">/year</span>
                </div>

                <p className="text-orange-400 font-medium mb-8">
                  That's just $41.58/month
                </p>

                <div className="space-y-3 text-left mb-8">
                  {proPlusFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-orange-400" />
                      </div>
                      <span className={`${i === 0 ? 'text-orange-400 font-semibold' : 'text-slate-300'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 shadow-xl shadow-orange-500/30 transition-all hover:shadow-orange-500/40 hover:scale-[1.02]"
                  onClick={() => handleGetStarted('pro_plus')}
                  disabled={isLoading}
                >
                  {loadingPlan === 'pro_plus' ? 'Processing...' : 'Get Started with Pro+'}
                  {loadingPlan !== 'pro_plus' && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>

                <p className="text-slate-400 text-sm mt-4">
                  30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>

          {/* Pro+ Features Highlight */}
          <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-left">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              <Crown className="w-5 h-5 inline mr-2 text-orange-400" />
              What's Included in Pro+
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="font-bold text-white mb-2">Full CRM with Automation</h4>
                <p className="text-slate-400 text-sm">
                  360 For Business CRM included - manage leads, automate follow-ups, and close more deals.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="font-bold text-white mb-2">200 Sponsored Searches/Month</h4>
                <p className="text-slate-400 text-sm">
                  Get priority visibility in search results. That's 2,400 sponsored searches per year included.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="font-bold text-white mb-2">Digital Business Cards</h4>
                <p className="text-slate-400 text-sm">
                  Free Tavvy Pros Digital Business Cards to share with customers and grow your network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 360 For Business CRM Deep Dive */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <Crown className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Pro+ Exclusive</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              360 For Business CRM
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete business management platform that helps you capture leads, nurture relationships, 
              and grow your business — all for a fraction of what you'd pay elsewhere.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">$297/month value included FREE with Pro+</span>
            </div>
          </div>

          {/* CRM Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Lead Management */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Lead Management</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Capture, organize, and track every lead in one place. See where each prospect is in your 
                sales pipeline and never let a potential customer slip through the cracks.
              </p>
            </div>

            {/* Automated Follow-ups */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Automated Follow-ups</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Set up automated email and SMS sequences that nurture leads while you're on the job. 
                Follow up instantly, schedule reminders, and close more deals on autopilot.
              </p>
            </div>

            {/* Two-Way SMS & Email */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Two-Way SMS & Email</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Communicate with customers via text and email directly from your CRM. All conversations 
                are logged automatically so you have a complete history of every interaction.
              </p>
            </div>

            {/* Appointment Scheduling */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Appointment Scheduling</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Let customers book appointments directly from your calendar. Automated reminders reduce 
                no-shows and keep your schedule full without the back-and-forth.
              </p>
            </div>

            {/* Pipeline Management */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Visual Sales Pipeline</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Drag-and-drop pipeline view shows exactly where every deal stands. Move leads through 
                stages from "New Lead" to "Quote Sent" to "Job Won" with a single click.
              </p>
            </div>

            {/* Invoicing & Payments */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Invoicing & Payments</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Create and send professional invoices in seconds. Accept credit card payments online 
                and get paid faster with automated payment reminders.
              </p>
            </div>

            {/* Email Marketing */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-pink-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Email Marketing</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Send newsletters, promotions, and updates to your customer list. Pre-built templates 
                make it easy to stay top-of-mind and generate repeat business.
              </p>
            </div>

            {/* Reputation Management */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Reputation Management</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatically request reviews from happy customers after each job. Monitor your online 
                reputation and respond to reviews from one dashboard.
              </p>
            </div>

            {/* Mobile App */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Mobile App Access</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage your business from anywhere with the mobile app. Check leads, respond to messages, 
                and update job status right from your phone while on-site.
              </p>
            </div>
          </div>

          {/* Value Comparison */}
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">The Real Value of Pro+</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-orange-400 mb-4">If You Bought These Separately:</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-300">
                    <span>CRM Software (HubSpot, Salesforce)</span>
                    <span className="text-slate-400">$50-300/mo</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Email Marketing (Mailchimp, Constant Contact)</span>
                    <span className="text-slate-400">$20-100/mo</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>SMS Marketing Platform</span>
                    <span className="text-slate-400">$25-75/mo</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Scheduling Software (Calendly Pro)</span>
                    <span className="text-slate-400">$12-20/mo</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Invoicing Software (QuickBooks)</span>
                    <span className="text-slate-400">$30-80/mo</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Reputation Management</span>
                    <span className="text-slate-400">$50-200/mo</span>
                  </div>
                  <div className="border-t border-slate-600 pt-3 mt-3 flex justify-between font-bold">
                    <span className="text-white">Total Monthly Cost</span>
                    <span className="text-red-400">$187-775/mo</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Annual Cost</span>
                    <span className="text-red-400">$2,244-9,300/yr</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 flex flex-col justify-center">
                <h4 className="font-semibold text-green-400 mb-4 text-center">With TavvY Pro+:</h4>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">$499</div>
                  <div className="text-slate-400 mb-4">per year — everything included</div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-green-400 font-bold text-lg">You Save Up To $8,800/year</div>
                    <div className="text-green-400/80 text-sm">Plus unlimited leads, fair distribution, and more</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why TavvY vs Pay-Per-Lead Platforms */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Why Contractors Are Switching to TavvY
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              See how TavvY stacks up against pay-per-lead platforms like Thumbtack, Angi, HomeAdvisor, and others.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-slate-50 rounded-tl-xl"></th>
                  <th className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <img src="/tavvy-logo.png" alt="TavvY" className="h-6 w-auto brightness-0 invert" />
                      <span>TavvY</span>
                    </div>
                  </th>
                  <th className="p-4 bg-slate-100 text-slate-600 font-medium">Thumbtack</th>
                  <th className="p-4 bg-slate-100 text-slate-600 font-medium">Angi</th>
                  <th className="p-4 bg-slate-100 text-slate-600 font-medium rounded-tr-xl">HomeAdvisor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-900 bg-slate-50">Pricing Model</td>
                  <td className="p-4 text-center bg-blue-50">
                    <span className="font-bold text-blue-600">$99-$499/year flat</span>
                  </td>
                  <td className="p-4 text-center text-slate-600">$15-100+ per lead</td>
                  <td className="p-4 text-center text-slate-600">$15-85+ per lead</td>
                  <td className="p-4 text-center text-slate-600">$15-100+ per lead</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-900 bg-slate-50">Same Lead Sold To</td>
                  <td className="p-4 text-center bg-blue-50">
                    <span className="font-bold text-green-600">Fair distribution</span>
                  </td>
                  <td className="p-4 text-center text-red-500 font-medium">5-10+ contractors</td>
                  <td className="p-4 text-center text-red-500 font-medium">4-8+ contractors</td>
                  <td className="p-4 text-center text-red-500 font-medium">4-10+ contractors</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-900 bg-slate-50">Annual Cost (10 leads/mo)</td>
                  <td className="p-4 text-center bg-blue-50">
                    <span className="font-bold text-green-600">$99-$499</span>
                  </td>
                  <td className="p-4 text-center text-red-500 font-medium">$1,800-$12,000+</td>
                  <td className="p-4 text-center text-red-500 font-medium">$1,800-$10,200+</td>
                  <td className="p-4 text-center text-red-500 font-medium">$1,800-$12,000+</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-900 bg-slate-50">Lead Racing</td>
                  <td className="p-4 text-center bg-blue-50">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="ml-2 text-green-600 font-medium">No racing</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Race to call</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Race to call</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Race to call</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-900 bg-slate-50">Bad Reviews Fade</td>
                  <td className="p-4 text-center bg-blue-50">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="ml-2 text-green-600 font-medium">After 6 months</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Forever</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Forever</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Forever</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 bg-slate-50 rounded-bl-xl">Hidden Fees</td>
                  <td className="p-4 text-center bg-blue-50">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="ml-2 text-green-600 font-medium">None</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Promote fees</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Service fees</span>
                    </div>
                  </td>
                  <td className="p-4 text-center rounded-br-xl">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="ml-2 text-red-500">Annual fees</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* The Math Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                The Pay-Per-Lead Math
              </h3>
              <div className="space-y-3 text-slate-700">
                <p>Let's say you get <strong>10 leads per month</strong> at $50 each:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Monthly cost: <strong className="text-red-600">$500</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Annual cost: <strong className="text-red-600">$6,000+</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Same leads sent to 5-10 other contractors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Maybe 2-3 actually convert to jobs</span>
                  </li>
                </ul>
                <p className="text-red-600 font-bold mt-4">Real cost per job: $2,000-$3,000</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <Check className="w-6 h-6" />
                The TavvY Math
              </h3>
              <div className="space-y-3 text-slate-700">
                <p>With TavvY Pro at <strong>$99/year</strong>:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Monthly cost: <strong className="text-green-600">$8.25</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Annual cost: <strong className="text-green-600">$99</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Leads distributed fairly - no racing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Higher conversion because customers aren't overwhelmed</span>
                  </li>
                </ul>
                <p className="text-green-600 font-bold mt-4">You save: $5,900+ per year</p>
              </div>
            </div>
          </div>

          {/* Testimonial-style callout */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
            <p className="text-xl md:text-2xl font-medium mb-4">
              "I was spending $800/month on Thumbtack and HomeAdvisor combined. Now I pay $99/year and get better quality leads."
            </p>
            <p className="text-blue-200">— Mike R., Plumber, Austin TX</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 text-left">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-lg mb-12 text-left">
            Got questions? We've got answers.
          </p>

          <div className="space-y-4">
            {[
              {
                q: "How is this different from Thumbtack, Angi, or HomeAdvisor?",
                a: "Those platforms charge you $50-100+ per lead, and sell the same lead to 10+ contractors. We charge a flat $99/year (or $499/year for Pro+) with no per-lead fees. Leads are distributed fairly among contractors in your area - there's enough for everyone.",
              },
              {
                q: "What do you mean by 'fair lead distribution'?",
                a: "When a customer requests a service, they choose how many contractors they want to hear from. We distribute those leads fairly among all pros in the area, so everyone gets opportunities - not just whoever pays the most or calls first.",
              },
              {
                q: "How does the review system work?",
                a: "If you get a negative review that's a one-time issue (not a pattern), it fades from your profile after 6 months. Recurring complaints stay visible because customers deserve to know. It's fair for everyone.",
              },
              {
                q: "What's the difference between Pro and Pro+?",
                a: "Pro ($99/year) gives you full access to leads, fair distribution, and our review system. Pro+ ($499/year) includes everything in Pro plus a full CRM with automation (360 For Business), 200 sponsored searches per month, and free digital business cards.",
              },
              {
                q: "What trades/services do you support?",
                a: "We support all home service trades: plumbing, electrical, HVAC, roofing, landscaping, cleaning, painting, handyman services, and more. If you serve homeowners, you can join TavvY Pro.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. We offer a 30-day money-back guarantee, no questions asked. After that, your annual subscription runs until the end of the year. We don't do auto-renewals without your consent.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-slate-600 text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Join the Fair Side?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Stop paying thousands. Start winning more jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-6 shadow-xl transition-all hover:scale-[1.02]"
              onClick={() => handleGetStarted('pro')}
              disabled={isLoading}
            >
              {loadingPlan === 'pro' ? 'Processing...' : 'Get Pro - $99/year'}
              {loadingPlan !== 'pro' && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-10 py-6 shadow-xl transition-all hover:scale-[1.02]"
              onClick={() => handleGetStarted('pro_plus')}
              disabled={isLoading}
            >
              {loadingPlan === 'pro_plus' ? 'Processing...' : 'Get Pro+ - $499/year'}
              {loadingPlan !== 'pro_plus' && <Crown className="ml-2 w-5 h-5" />}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-400">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img 
                src="/tavvy-logo.png" 
                alt="TavvY" 
                className="h-8 w-auto brightness-0 invert"
              />
              <span className="text-orange-400 font-semibold">Pros</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} TavvY. Built by contractors, for contractors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
