import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type UserRole = "student" | "teacher" | null;

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  needsRole: boolean;
  streak: number;
  remainingMs: number;
  hasIncrementedToday: boolean;
  assignRole: (role: "student" | "teacher") => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: "student" | "teacher") => Promise<{ error: string | null }>;
  signIn: (email: string, password: string, role: "student" | "teacher") => Promise<{ error: string | null }>;
  signInWithGoogle: (token: string, role: "student" | "teacher") => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Streak State
  const STORAGE_KEY = "lw_streak";
  const STREAK_DURATION = 30 * 60 * 1000;
  const getTodayKey = () => new Date().toLocaleDateString();

  const [streak, setStreak] = useState(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}:count`);
    return stored ? Number(stored) : 0;
  });

  const [remainingMs, setRemainingMs] = useState(() => {
    const lastEarned = localStorage.getItem(`${STORAGE_KEY}:earnedLast`);
    if (lastEarned === getTodayKey()) return 0;
    
    const lastSessionDate = localStorage.getItem(`${STORAGE_KEY}:sessionDate`);
    if (lastSessionDate !== getTodayKey()) return STREAK_DURATION;

    const storedRemaining = localStorage.getItem(`${STORAGE_KEY}:remaining`);
    return storedRemaining ? Number(storedRemaining) : STREAK_DURATION;
  });

  const [hasIncrementedToday, setHasIncrementedToday] = useState(() => {
    const lastEarned = localStorage.getItem(`${STORAGE_KEY}:earnedLast`);
    return lastEarned === getTodayKey();
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Sync session date
    const today = getTodayKey();
    const lastSessionDate = localStorage.getItem(`${STORAGE_KEY}:sessionDate`);
    if (lastSessionDate !== today) {
      localStorage.setItem(`${STORAGE_KEY}:sessionDate`, today);
      const lastEarned = localStorage.getItem(`${STORAGE_KEY}:earnedLast`);
      if (lastEarned !== today) {
        localStorage.setItem(`${STORAGE_KEY}:remaining`, String(STREAK_DURATION));
        setRemainingMs(STREAK_DURATION);
        setHasIncrementedToday(false);
      }
    }
  }, []);

  // Streak Timer Logic
  useEffect(() => {
    if (!user || user.role !== "student" || hasIncrementedToday) return;

    const interval = setInterval(() => {
      if (document.hidden) return;

      setRemainingMs((prev) => {
        const next = Math.max(0, prev - 1000);
        localStorage.setItem(`${STORAGE_KEY}:remaining`, String(next));
        
        if (next === 0) {
          const today = getTodayKey();
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          setHasIncrementedToday(true);
          localStorage.setItem(`${STORAGE_KEY}:count`, String(nextStreak));
          localStorage.setItem(`${STORAGE_KEY}:earnedLast`, today);
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, streak, hasIncrementedToday]);

  const needsRole = !!user && !user.role;

  const assignRole = async (selectedRole: "student" | "teacher") => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/assign-role", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (res.ok) {
        const updatedUser = { ...user, role: selectedRole };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        navigate(selectedRole === "teacher" ? "/teacher/dashboard" : "/dashboard");
      }
    } catch (error) {
      console.error("Failed to assign role", error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: "student" | "teacher") => {
    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role }),
      });

      const data = await registerRes.json();
      if (!registerRes.ok) {
        return { error: data.message || "Failed to create account." };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      navigate(role === "teacher" ? "/teacher/dashboard" : "/dashboard");
      return { error: null };

    } catch (error) {
      return { error: "An unexpected error occurred." };
    }
  };

  const signIn = async (email: string, password: string, role: "student" | "teacher") => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.message || "Invalid email or password." };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred." };
    }
  };

  const signInWithGoogle = async (token: string, role: "student" | "teacher") => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.message || "Google authentication failed." };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred during Google sign in." };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || null, 
      loading, 
      needsRole, 
      streak,
      remainingMs,
      hasIncrementedToday,
      assignRole, 
      signUp, 
      signIn, 
      signInWithGoogle, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
