"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  displayName: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  displayName: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

async function ensureUserRecord(authUser: SupabaseUser): Promise<string | null> {
  const email = authUser.email;
  if (!email) return null;

  // Check if user record already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("id", authUser.id)
    .single();

  if (existing) return existing.display_name;

  // Check if email is in allowed list
  const { data: allowed } = await supabase
    .from("allowed_emails")
    .select("email")
    .eq("email", email)
    .single();

  if (!allowed) return null;

  // Determine display name and role from order in allowed_emails
  const emailLower = email.toLowerCase();
  const { data: allAllowed } = await supabase
    .from("allowed_emails")
    .select("email")
    .order("added_at", { ascending: true });

  // Explicit email-to-name mapping
  const emailNameMap: Record<string, { name: string; role: string }> = {
    tcwhite: { name: "Chubbs", role: "contributor" },
    wmpoteete: { name: "Poteete", role: "contributor" },
  };

  let displayName = email.split("@")[0];
  let role = "contributor";

  // Check explicit mapping by email prefix
  const emailPrefix = emailLower.split("@")[0];
  const mapped = emailNameMap[emailPrefix];
  if (mapped) {
    displayName = mapped.name;
    role = mapped.role;
  } else if (allAllowed) {
    // First allowed email is admin (Tinetti)
    const firstEmail = allAllowed[0]?.email?.toLowerCase();
    if (firstEmail === emailLower) {
      displayName = "Tinetti";
      role = "admin";
    }
  }

  // Create user record with auth.uid() as the id
  const { error } = await supabase.from("users").insert({
    id: authUser.id,
    email,
    display_name: displayName,
    avatar_url: authUser.user_metadata?.avatar_url || null,
    role,
  });

  if (error) {
    console.error("Failed to create user record:", error.message);
    return null;
  }

  return displayName;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureUserRecord(session.user).then((name) => {
          setDisplayName(name ?? null);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureUserRecord(session.user).then((name) => {
          setDisplayName(name ?? null);
          setLoading(false);
        });
      } else {
        setDisplayName(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Sign in error:", error.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, displayName, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
