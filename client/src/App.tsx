import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider, useSupabaseAuth } from "./contexts/SupabaseAuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import ProsDashboard from "./pages/ProsDashboard";
import DigitalCardEditor from "./pages/DigitalCardEditor";
import PublicProCard from "./pages/PublicProCard";
import MessagesPage from "./pages/MessagesPage";
import AddServiceLocation from "./pages/AddServiceLocation";
import Pricing from "./pages/Pricing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f2]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * PublicRoute - Handles redirection for authenticated users
 * 
 * Key behavior:
 * - If user is authenticated AND has NOT completed onboarding → redirect to /onboarding
 * - If user is authenticated AND HAS completed onboarding → redirect to /dashboard
 * - If user is not authenticated → show the public content
 */
function PublicRoute({ children, redirectToDashboard = true }: { children: React.ReactNode; redirectToDashboard?: boolean }) {
  const { isAuthenticated, loading, onboardingStatus, onboardingLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !onboardingLoading && isAuthenticated && redirectToDashboard) {
      // Check onboarding status to determine where to redirect
      if (onboardingStatus) {
        if (onboardingStatus.onboardingCompleted) {
          // User has completed onboarding - go to dashboard
          setLocation("/dashboard");
        } else {
          // User has NOT completed onboarding - go to onboarding
          setLocation("/onboarding");
        }
      } else {
        // No onboarding status yet - default to onboarding for new users
        setLocation("/onboarding");
      }
    }
  }, [loading, onboardingLoading, isAuthenticated, onboardingStatus, setLocation, redirectToDashboard]);

  if (loading || (isAuthenticated && onboardingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f2]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isAuthenticated && redirectToDashboard) {
    return null;
  }

  return <>{children}</>;
}

/**
 * DashboardRoute - Protected route that also checks onboarding completion
 * 
 * If user hasn't completed onboarding, redirect them to /onboarding first
 */
function DashboardRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, onboardingStatus, onboardingLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    } else if (!loading && !onboardingLoading && isAuthenticated && onboardingStatus) {
      // If user hasn't completed onboarding, redirect to onboarding
      if (!onboardingStatus.onboardingCompleted) {
        setLocation("/onboarding");
      }
    }
  }, [loading, onboardingLoading, isAuthenticated, onboardingStatus, setLocation]);

  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f2]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // If onboarding not completed, don't render dashboard content
  if (onboardingStatus && !onboardingStatus.onboardingCompleted) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public Landing Page */}
      <Route path="/">
        <PublicRoute redirectToDashboard={true}>
          <LandingPage />
        </PublicRoute>
      </Route>
      
      {/* Auth Routes */}
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>
      <Route path="/signup">
        <PublicRoute redirectToDashboard={false}>
          <Signup />
        </PublicRoute>
      </Route>
      <Route path="/forgot-password">
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      </Route>
      
      {/* Onboarding - Protected but accessible before dashboard */}
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      
      {/* Dashboard Routes - Require completed onboarding */}
      <Route path="/dashboard">
        <DashboardRoute>
          <ProsDashboard />
        </DashboardRoute>
      </Route>
      <Route path="/messages">
        <DashboardRoute>
          <MessagesPage />
        </DashboardRoute>
      </Route>
      <Route path="/digital-card">
        <DashboardRoute>
          <DigitalCardEditor />
        </DashboardRoute>
      </Route>
      <Route path="/add-location">
        <DashboardRoute>
          <AddServiceLocation />
        </DashboardRoute>
      </Route>
      
      {/* Public Pro Card - No auth required */}
      <Route path="/pro/:slug">
        <PublicProCard />
      </Route>
      
      {/* Pricing and Subscription Routes */}
      <Route path="/pricing">
        <PublicRoute redirectToDashboard={false}>
          <Pricing />
        </PublicRoute>
      </Route>
      <Route path="/subscription/success">
        <SubscriptionSuccess />
      </Route>
      <Route path="/subscription/cancel">
        <SubscriptionCancel />
      </Route>

      {/* 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SupabaseAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SupabaseAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
