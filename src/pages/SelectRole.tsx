import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SelectRole = () => {
  const { assignRole, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<"student" | "teacher" | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    await assignRole(selected);
    navigate(selected === "teacher" ? "/teacher/dashboard" : "/dashboard", { replace: true });
    setLoading(false);
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="absolute inset-0 hero-gradient opacity-[0.03]" />

      <div className="relative w-full max-w-lg animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl hero-gradient">
            <GraduationCap className="h-7 w-7 text-secondary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Welcome{displayName ? `, ${displayName}` : ""}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            How will you be using Learn With Nipun?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {([
            {
              role: "student" as const,
              icon: BookOpen,
              title: "I'm a Student",
              description: "Browse courses, track progress, submit assignments",
            },
            {
              role: "teacher" as const,
              icon: Users,
              title: "I'm a Teacher",
              description: "Create courses, manage students, grade assignments",
            },
          ]).map((option) => (
            <button
              key={option.role}
              onClick={() => setSelected(option.role)}
              className={`group rounded-2xl border-2 p-6 text-left transition-all ${
                selected === option.role
                  ? "border-secondary bg-accent card-shadow-hover"
                  : "border-border bg-card hover:border-muted-foreground/30 card-shadow"
              }`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                  selected === option.role
                    ? "hero-gradient"
                    : "bg-muted group-hover:bg-accent"
                }`}
              >
                <option.icon
                  className={`h-6 w-6 transition-colors ${
                    selected === option.role ? "text-secondary-foreground" : "text-muted-foreground"
                  }`}
                />
              </div>
              <h3 className="font-display text-lg font-semibold">{option.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>

        <Button
          variant="hero"
          size="lg"
          className="mt-6 w-full"
          disabled={!selected || loading}
          onClick={handleContinue}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default SelectRole;
