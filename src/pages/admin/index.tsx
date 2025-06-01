import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { auth, signOut, onAuthStateChanged, supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const redirectToLogin = useCallback(() => {
    router.push("/login").catch((err) => {
      console.error("Navigation error:", err);
    });
  }, [router]);

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const currentUser = session?.user || auth.currentUser;

      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Session check error:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const initAuth = async () => {
      const hasSession = await checkSession();

      if (hasSession) return;

      unsubscribe = onAuthStateChanged(auth, (authUser: User | null) => {
        if (authUser) {
          setUser(authUser);
          setLoading(false);
        } else {
          redirectToLogin();
        }
      });

      timeoutId = setTimeout(async () => {
        if (loading && !(await checkSession())) {
          console.warn("Auth timeout, redirecting to login");
          redirectToLogin();
        }
      }, 5000);
    };

    initAuth();

    return () => {
      unsubscribe?.();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkSession, redirectToLogin, loading]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      document.cookie = "supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      await router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to Admin Area{user?.email ? `, ${user.email}` : ""}
          </h2>
          <p className="text-gray-600">This is a placeholder admin page.</p>
        </div>
      </div>
    </div>
  );
}