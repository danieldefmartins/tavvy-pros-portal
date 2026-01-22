import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { signInWithEmail } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, sign in via Supabase client-side to establish session
      const { data, error: supabaseError } = await signInWithEmail(email, password);
      
      if (supabaseError) {
        toast({
          title: "Login failed",
          description: supabaseError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data.user || !data.session) {
        toast({
          title: "Login failed",
          description: "Invalid credentials",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Success - Supabase session is now established
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      
      // Invalidate tRPC cache and redirect to dashboard
      utils.auth.me.invalidate();
      setLocation("/dashboard");
    } catch (err) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img 
              src="/tavvy-logo.png" 
              alt="Tavvy" 
              className="h-16 w-auto mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl text-white">Tavvy Pros</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to access your Pro account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <a 
              href="/forgot-password" 
              className="text-sm text-orange-400 hover:text-orange-300 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Need an account? Contact Tavvy support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
