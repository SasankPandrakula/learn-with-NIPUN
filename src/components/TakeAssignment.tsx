import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  assignmentId: string;
  onBack: () => void;
}

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  options: string[] | null;
  correct_answer: string | null;
  max_marks: number;
  sort_order: number;
}

const API_BASE = "/api";

const TakeAssignment = ({ assignmentId, onBack }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || !started) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, timeLeft]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/assignments/${assignmentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const aData = await res.json();
      setAssignment(aData);
      setQuestions(aData.questions || []);

      if (aData?.time_limit_minutes) {
        setTimeLeft(aData.time_limit_minutes * 60);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const startAssignment = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/assignments/${assignmentId}/start`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    setStarted(true);
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers })
      });
      if (!res.ok) throw new Error("Failed to submit");

      toast({ title: "Submitted!", description: "Your assignment has been submitted successfully." });
      onBack();
    } catch (e: any) {
      toast({ title: "Error submitting", description: e.message, variant: "destructive" });
    }
    setSubmitting(false);
  }, [answers, questions, assignmentId, user, submitting, onBack, toast]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Loading...</div>;

  if (!started) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-xl border border-border bg-card p-8 card-shadow text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">{assignment?.title}</h1>
          <p className="text-muted-foreground">{assignment?.course_title}</p>
          {assignment?.description && <p className="text-sm">{assignment.description}</p>}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{questions.length} questions</span>
            {assignment?.time_limit_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {assignment.time_limit_minutes} minutes
              </span>
            )}
            <span>
              Total: {questions.reduce((s, q) => s + q.max_marks, 0)} marks
            </span>
          </div>
          {assignment?.time_limit_minutes && (
            <div className="flex items-center justify-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Timer starts when you begin. Auto-submits when time runs out.
            </div>
          )}
          <Button variant="hero" size="lg" onClick={startAssignment} className="mt-4">
            Start Assignment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="sticky top-16 z-10 -mx-4 px-4 py-3 glass border-b border-border mb-6 flex items-center justify-between">
        <h1 className="font-display font-bold text-lg truncate">{assignment?.title}</h1>
        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <Badge variant={timeLeft < 60 ? "destructive" : "secondary"} className="text-sm font-mono">
              <Clock className="mr-1 h-3.5 w-3.5" /> {formatTime(timeLeft)}
            </Badge>
          )}
          <Button variant="hero" size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="rounded-xl border border-border bg-card p-5 card-shadow space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {q.question_type === "mcq" ? "Multiple Choice" : q.question_type === "coding" ? "Coding" : "Written"} • Q{idx + 1}
                </span>
                <p className="font-medium text-foreground mt-1 whitespace-pre-wrap">{q.question_text}</p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0 ml-2">{q.max_marks} marks</Badge>
            </div>

            {q.question_type === "mcq" && q.options ? (
              <RadioGroup
                value={answers[q.id] || ""}
                onValueChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                className="space-y-2"
              >
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={opt} id={`${q.id}-${oi}`} />
                    <Label htmlFor={`${q.id}-${oi}`} className="cursor-pointer flex-1 text-sm">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : q.question_type === "coding" ? (
              <Textarea
                value={answers[q.id] || ""}
                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Write your code here..."
                rows={8}
                className="font-mono text-sm"
              />
            ) : (
              <Textarea
                value={answers[q.id] || ""}
                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Write your answer here..."
                rows={4}
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit button at bottom */}
      <div className="mt-8 flex justify-end">
        <Button variant="hero" size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </div>
    </div>
  );
};

export default TakeAssignment;
