import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, signOut as supabaseSignOut } from "@/lib/supabase";

interface ProOnboardingStatus {
  hasProfile: boolean;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  onboardingStatus: ProOnboardingStatus | null;
  onboardingLoading: boolean;
  signOut: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<ProOnboardingStatus | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  // Fetch the user's onboarding status
  const fetchOnboardingStatus = async (userId: string) => {
    setOnboardingLoading(true);
    try {
      // First try the new 'pros' table
      const { data: proData, error: proError } = await supabase
        .from('pros')
        .select('id, onboarding_completed, onboarding_step')
        .eq('user_id', userId)
        .maybeSingle();

      if (!proError && proData) {
        setOnboardingStatus({
          hasProfile: true,
          onboardingCompleted: proData.onboarding_completed || false,
          onboardingStep: proData.onboarding_step || 1,
        });
        setOnboardingLoading(false);
        return;
      }

      // Fallback to legacy 'pro_providers' table
      const { data: legacyData, error: legacyError } = await supabase
        .from('pro_providers')
        .select('id, business_name, phone')
        .eq('user_id', userId)
        .maybeSingle();

      if (!legacyError && legacyData) {
        // Legacy profiles are considered "completed" if they have basic info
        const hasBasicInfo = !!(legacyData.business_name && legacyData.phone);
        setOnboardingStatus({
          hasProfile: true,
          onboardingCompleted: hasBasicInfo,
          onboardingStep: hasBasicInfo ? 10 : 1,
        });
      } else {
        // No profile found - user needs to complete onboarding
        setOnboardingStatus({
          hasProfile: false,
          onboardingCompleted: false,
          onboardingStep: 1,
        });
      }
    } catch (err) {
      console.error('Error fetching onboarding status:', err);
      setOnboardingStatus({
        hasProfile: false,
        onboardingCompleted: false,
        onboardingStep: 1,
      });
    } finally {
      setOnboardingLoading(false);
    }
  };

  const refreshOnboardingStatus = async () => {
    if (user) {
      await fetchOnboardingStatus(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Fetch onboarding status if user is authenticated
      if (session?.user) {
        fetchOnboardingStatus(session.user.id);
      } else {
        setOnboardingLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Fetch onboarding status when auth state changes
      if (session?.user) {
        fetchOnboardingStatus(session.user.id);
      } else {
        setOnboardingStatus(null);
        setOnboardingLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabaseSignOut();
    setUser(null);
    setSession(null);
    setOnboardingStatus(null);
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    onboardingStatus,
    onboardingLoading,
    signOut: handleSignOut,
    refreshOnboardingStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
}
