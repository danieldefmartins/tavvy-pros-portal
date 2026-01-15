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
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          successUrl: window.location.origin + '/signup?payment=success',
          cancelUrl: window.location.origin + '/',
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
    }
  };

  const scrollToSignup = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

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
                  onClick={handleGetStarted}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Get Started'}
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
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

              <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
                TavvY Pro was built by a contractor who got tired of the Big Tech
                monopoly. We're on <strong className="text-slate-800">YOUR</strong> side. Fair leads, fair reviews, fair
                pricing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 shadow-xl shadow-orange-500/30 transition-all hover:shadow-orange-500/40 hover:scale-[1.02]"
                  onClick={handleGetStarted}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Join for $99/year'}
                  {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
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

            {/* Price Card */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-50 to-transparent rounded-tr-full" />
                
                <div className="relative">
                  <div className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    LAUNCH SPECIAL
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-slate-400 text-2xl line-through">$499</span>
                    <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-1 rounded">80% OFF</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-6xl font-bold text-slate-900">$99</span>
                    <span className="text-slate-500 text-xl">/year</span>
                  </div>
                  
                  <p className="text-blue-600 font-medium mb-6">
                    That's just $8.25/month
                  </p>

                  <div className="space-y-3">
                    {[
                      "Unlimited lead access in your area",
                      "Fair lead distribution - no racing",
                      "Fair review system - bad days fade",
                      "Direct messaging with customers",
                      "Profile & portfolio showcase",
                      "No per-lead fees. Ever.",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
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

      {/* Comparison Section */}
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Traditional Way */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-600">
                  Traditional Pay-Per-Lead
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { step: "1", title: "Customer requests service", desc: "Lead enters the system" },
                  { step: "2", title: "Lead sold to 10+ contractors", desc: "Everyone pays $50-100 each" },
                  { step: "3", title: "Race to call first", desc: "Customer overwhelmed, most contractors lose" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-4 bg-slate-50 rounded-xl p-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold text-sm">{item.step}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}

                <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200 mt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-700 font-bold text-sm">4</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-red-700">You pay $500+/month for maybe 1-2 jobs</p>
                      <p className="text-sm text-red-600">Platform profits, you struggle</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TavvY Way */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 shadow-xl shadow-blue-500/20 text-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  The TavvY Way
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { step: "1", title: "Customer requests service", desc: "They choose how many contractors to talk to" },
                  { step: "2", title: "Leads split fairly among area pros", desc: "Everyone gets their fair share" },
                  { step: "3", title: "There's enough for everybody", desc: "No racing, no competing for the same lead" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{item.step}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-blue-100">{item.desc}</p>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-5 h-5 text-blue-300" />
                      </div>
                    )}
                  </div>
                ))}

                <div className="bg-green-500 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">You pay $99/year. Period.</p>
                      <p className="text-sm text-green-100">No per-lead fees, no surprises</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fair Review System */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#f9f7f2] to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 text-sm font-medium">Fair Review System</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                Bad Days Don't Define You{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Forever</span>
              </h2>

              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                We all have rough days. A difficult customer, a miscommunication, an honest mistake. 
                On other platforms, that one bad review follows you for years.
              </p>

              <p className="text-lg mb-8">
                <span className="text-blue-600 font-semibold">On TavvY, if a negative review isn't part of a pattern, it fades away after 6 months.</span>{" "}
                <span className="text-slate-600">Because we believe in second chances and fair representation.</span>
              </p>

              <div className="space-y-4">
                {[
                  "One-off issues don't haunt your profile",
                  "Recurring problems are still visible (as they should be)",
                  "Your reputation reflects who you are NOW",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Timeline visualization */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-900">Month 1-6</span>
                </div>
                <p className="text-slate-600 mb-4">Review visible, you can respond</p>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-slate-900">After 6 Months</span>
                </div>
                <p className="text-slate-600 mb-4">Non-recurring negative review fades away</p>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> If similar complaints keep coming, they stay visible. We're fair, not naive.
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
                Built By a Contractor,{" "}
                <span className="text-orange-400">For Contractors</span>
              </h2>

              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                I spent 15 years in the trades. I know what it's like to pay hundreds every month for leads 
                that go nowhere. I've watched Big Tech platforms extract every dollar from hardworking 
                contractors while giving nothing back.
              </p>

              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                So I built something different. Something that puts contractors first. Not investors. 
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

      {/* Pricing CTA */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-[#f9f7f2] to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Ready to Stop Overpaying?
          </h2>
          <p className="text-slate-600 text-lg mb-12">
            Join thousands of contractors who made the switch.
          </p>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-xl mx-auto">
            <div className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
              🎉 Launch Special - Limited Time
            </div>

            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-slate-400 text-2xl line-through">$499</span>
              <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">80% OFF</span>
            </div>

            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-7xl font-bold text-slate-900">$99</span>
              <span className="text-slate-500 text-2xl">/year</span>
            </div>

            <p className="text-blue-600 font-medium mb-8">
              That's just $8.25/month
            </p>

            <div className="space-y-3 text-left mb-8">
              {[
                "Unlimited lead access in your area",
                "Fair lead distribution - no racing",
                "Fair review system - bad days fade",
                "Direct messaging with customers",
                "Profile & portfolio showcase",
                "No per-lead fees. Ever.",
              ].map((feature, i) => (
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
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 shadow-xl shadow-orange-500/30 transition-all hover:shadow-orange-500/40 hover:scale-[1.02]"
              onClick={handleGetStarted}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Get Started Now'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>

            <p className="text-slate-500 text-sm mt-4">
              30-day money-back guarantee. No questions asked.
            </p>
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
                a: "Those platforms charge you $50-100+ per lead, and sell the same lead to 10+ contractors. We charge a flat $99/year with no per-lead fees. Leads are distributed fairly among contractors in your area - there's enough for everyone.",
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
                q: "Is this really only $99/year?",
                a: "Yes. $99/year. No hidden fees. No per-lead charges. No premium tiers. We make money by having lots of happy contractors, not by nickel-and-diming you.",
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
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-6 shadow-xl transition-all hover:scale-[1.02]"
            onClick={handleGetStarted}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Get Started for $99/year'}
            {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>
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
