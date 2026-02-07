"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // The Supabase client automatically detects the ?code= param in the URL
    // and exchanges it for a session using the PKCE code verifier from localStorage.
    // Once that completes, onAuthStateChange fires and `user` updates.
    if (!loading) {
      if (user) {
        router.replace("/admin");
      } else {
        // Give the client a moment to process the code exchange
        const timeout = setTimeout(() => {
          router.replace("/admin?error=auth_failed");
        }, 5000);
        return () => clearTimeout(timeout);
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
