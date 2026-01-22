import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, AlertCircle, CheckCircle, PartyPopper, Crown, Check, ArrowRight } from "lucide-react";
import { signUpWithEmail } from "@/lib/supabase";

export default function Signup() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const paymentSuccess = searchParams.get("payment") === "success";
  const planFromUrl = searchParams.get("plan") as 'pro' | 'pro_plus' | null;
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_plus'>(planFromUrl || 'pro');

  // Update selected plan when URL changes
  useEffect(() => {
    if (planFromUrl) {
      setSelectedPlan(planFromUrl);
    }
  }, [planFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await signUpWithEmail(email, password, {
      full_name: fullName,
      is_pro: true,
      subscription_status: 'active',
      subscription_plan: selectedPlan,
      subscription_tier: selectedPlan === 'pro_plus' ? 'pro_plus' : 'pro',
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setSuccess(true);
    }
    setLoading(false);
  };

  const proFeatures = [
    "Unlimited lead access",
    "Fair lead distribution",
    "Fair review system",
    "Direct messaging",
    "Profile showcase",
  ];

  const proPlusFeatures = [
    "Everything in Pro",
    "Full CRM with Automation",
    "200 sponsored searches/mo",
    "Digital Business Cards",
    "Priority support",
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f2] p-4">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-slate-900">Check Your Email</CardTitle>
            <CardDescription className="text-slate-600">
              We've sent a confirmation link to <strong className="text-slate-800">{email}</strong>. 
              Please check your email and click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-slate-600">
            <p className="text-sm">
              After confirming your email, you'll be able to set up your Business Profile and start receiving leads.
            </p>
            {selectedPlan === 'pro_plus' && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center justify-center gap-2 text-orange-700 font-semibold mb-1">
                  <Crown className="h-5 w-5" />
                  Pro+ Member
                </div>
                <p className="text-orange-600 text-sm">
                  You'll receive your 360 For Business CRM login credentials via email within 24 hours.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" 
              onClick={() => setLocation("/login")}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If payment was successful, show the account creation form
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f2] p-4">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="text-center">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-green-700 font-semibold mb-1">
                <PartyPopper className="h-5 w-5" />
                Payment Successful!
              </div>
              <p className="text-green-600 text-sm">
                Welcome to Tavvy Pros {selectedPlan === 'pro_plus' ? 'Pro+' : 'Pro'}! Create your account to get started.
              </p>
            </div>
            
            {/* Show selected plan badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
              selectedPlan === 'pro_plus' 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
              {selectedPlan === 'pro_plus' && <Crown className="h-4 w-4" />}
              <span className="font-semibold">
                {selectedPlan === 'pro_plus' ? 'Pro+ Plan - $499 first year' : 'Pro Plan - $99 first year'}
              </span>
            </div>

            <div className="flex justify-center mb-4">
              <img 
                src="/tavvy-logo.png" 
                alt="Tavvy" 
                className="h-12 w-auto"
              />
            </div>
            <CardTitle className="text-2xl text-slate-900">Create Your Pro Account</CardTitle>
            <CardDescription className="text-slate-600">
              Complete your registration to access your Pro dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className={`w-full ${
                  selectedPlan === 'pro_plus'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create {selectedPlan === 'pro_plus' ? 'Pro+' : 'Pro'} Account
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-slate-600 hover:text-slate-900"
                onClick={() => setLocation("/login")}
              >
                Already have an account? Sign in
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Default view - Plan selection before payment
  return (
    <div className="min-h-screen bg-[#f9f7f2] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <img 
            src="/tavvy-logo.png" 
            alt="Tavvy" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Plan</h1>
          <p className="text-slate-600">Select the plan that's right for your business</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pro Plan Card */}
          <div 
            className={`bg-white rounded-2xl p-6 shadow-lg cursor-pointer transition-all ${
              selectedPlan === 'pro' 
                ? 'ring-2 ring-blue-500 shadow-blue-100' 
                : 'hover:shadow-xl border border-slate-200'
            }`}
            onClick={() => setSelectedPlan('pro')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === 'pro' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
              }`}>
                {selectedPlan === 'pro' && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-slate-900">$99</span>
              <span className="text-slate-500">/first year</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Then $499/year</p>
            
            <div className="space-y-2">
              {proFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro+ Plan Card */}
          <div 
            className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg cursor-pointer transition-all ${
              selectedPlan === 'pro_plus' 
                ? 'ring-2 ring-orange-500 shadow-orange-200' 
                : 'hover:shadow-xl'
            }`}
            onClick={() => setSelectedPlan('pro_plus')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                <Crown className="w-3 h-3" />
                BEST VALUE
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === 'pro_plus' ? 'border-orange-500 bg-orange-500' : 'border-slate-500'
              }`}>
                {selectedPlan === 'pro_plus' && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">Pro+</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-white">$499</span>
              <span className="text-slate-400">/first year</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Then $1,299/year</p>
            
            <div className="space-y-2">
              {proPlusFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className={`text-sm ${i === 0 ? 'text-orange-400 font-semibold' : 'text-slate-300'}`}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            size="lg"
            className={`px-12 py-6 text-lg shadow-xl transition-all hover:scale-[1.02] ${
              selectedPlan === 'pro_plus'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30'
            }`}
            onClick={() => {
              // Redirect to Stripe checkout
              window.location.href = `/?checkout=${selectedPlan}`;
            }}
          >
            Continue with {selectedPlan === 'pro_plus' ? 'Pro+' : 'Pro'} - ${selectedPlan === 'pro_plus' ? '499' : '99'} first year
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <p className="text-slate-500 text-sm mt-4">
            30-day money-back guarantee. No questions asked.
          </p>

          <Button
            type="button"
            variant="link"
            className="mt-4 p-0 h-auto text-slate-600 hover:text-slate-900"
            onClick={() => setLocation("/login")}
          >
            Already have an account? Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
