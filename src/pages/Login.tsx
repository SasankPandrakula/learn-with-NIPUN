import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const { error } = await signInWithGoogle(tokenResponse.access_token, role);
        if (error) {
          toast({ title: "Google Sign In failed", description: error, variant: "destructive" });
        } else {
          toast({ title: "Welcome!", description: "Successfully signed in with Google." });
          navigate(role === "teacher" ? "/teacher/dashboard" : "/dashboard");
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast({ title: "Google Sign In failed", description: "Could not authenticate with Google", variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          toast({ title: "Sign up failed", description: error, variant: "destructive" });
        } else {
          toast({ title: "Account created!", description: "You are now signed in." });
          navigate(role === "teacher" ? "/teacher/dashboard" : "/dashboard");
        }
      } else {
        const { error } = await signIn(email, password, role);
        if (error) {
          toast({ title: "Sign in failed", description: error, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "Successfully signed in." });
          navigate(role === "teacher" ? "/teacher/dashboard" : "/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group transition-transform hover:scale-105">
            <img 
              src="/icon-192.png" 
              alt="Logo" 
              className="h-16 w-16 object-contain rounded-2xl shadow-xl ring-1 ring-border/20" 
            />
            <div className="text-left">
              <span className="block font-display text-2xl font-black tracking-tight text-foreground leading-none">
                Learn With <span className="text-primary">Nipun</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                Academy of Excellence
              </span>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            {isSignUp ? "Join our Academy" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-muted-foreground font-medium">
            {isSignUp ? "Start your journey to mastery today" : "Sign in to continue your learning path"}
          </p>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/10">
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl border-border/60 hover:bg-muted font-semibold transition-all" 
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-border/50" />
            <span className="mx-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">or email</span>
            <div className="flex-grow border-t border-border/50" />
          </div>

          <div className="mb-6">
            <div className="flex rounded-xl bg-muted/50 p-1.5 ring-1 ring-border/20">
              {(["student", "teacher"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    role === r 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full h-12 rounded-xl text-base font-bold shadow-lg" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
            {isSignUp ? "Already a member?" : "New to the academy?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-primary hover:text-primary/80 transition-colors">
              {isSignUp ? "Sign In" : "Join Now"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
