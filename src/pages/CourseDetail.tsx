import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Play, FileText, Code, ExternalLink, Video, Info, CheckCircle2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CodeCompiler from "@/components/CodeCompiler";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface ContentBlock {
  id: string;
  type: "text" | "code" | "video" | "document";
  value: string;
  language?: string;
}

interface Lesson {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseTitle, setCourseTitle] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  
  // Interactive Compiler State
  const [compilerOpen, setCompilerOpen] = useState(false);
  const [activeCode, setActiveCode] = useState("");
  const [activeLang, setActiveLang] = useState("");

  // Instruction Modal State
  const [showInstructions, setShowInstructions] = useState(false);
  const [pendingCompilerData, setPendingCompilerData] = useState<{code: string, lang: string} | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/courses/${courseId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCourseTitle(data.title);
          const formattedLessons = (data.lessons || []).map((l: any) => ({
            ...l,
            blocks: l.blocks || (l.content ? [{ id: 'legacy', type: 'text', value: l.content }] : [])
          }));
          setLessons(formattedLessons);
          if (data.enrollment) {
            setCompletedLessons(data.enrollment.completedLessons || []);
          }
        } else {
          toast.error("Course not found");
        }
      } catch (e) {
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const openCompiler = (code: string, lang: string) => {
    const hidden = localStorage.getItem("skip_compiler_instructions") === "true";
    
    if (hidden) {
      setActiveCode(code);
      setActiveLang(lang);
      setCompilerOpen(true);
    } else {
      setPendingCompilerData({ code, lang });
      setShowInstructions(true);
    }
  };

  const handleConfirmInstructions = () => {
    if (dontShowAgain) {
      localStorage.setItem("skip_compiler_instructions", "true");
    }
    if (pendingCompilerData) {
      setActiveCode(pendingCompilerData.code);
      setActiveLang(pendingCompilerData.lang);
      setCompilerOpen(true);
    }
    setShowInstructions(false);
  };

  const completeLesson = async (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCompletedLessons(data.completedLessons);
        setShowCompletionDialog(true);
      }
    } catch (e) {
      console.error("Failed to complete lesson", e);
    }
  };

  const handleNext = () => {
    const currentLesson = lessons[currentLessonIdx];
    if (currentLesson) {
      completeLesson(currentLesson.id || String(currentLessonIdx));
    }
    
    if (currentLessonIdx < lessons.length - 1) {
      setCurrentLessonIdx(i => i + 1);
    }
  };

  const currentLesson = lessons[currentLessonIdx];
  const progress = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (lessons.length === 0) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <p>No content available for this course yet.</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } relative flex flex-col border-r border-border bg-card transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold truncate pr-4">{courseTitle}</h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
              <span>Overall Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="space-y-1">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.id || String(idx));
              return (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIdx(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    currentLessonIdx === idx
                      ? "bg-secondary text-secondary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                    currentLessonIdx === idx 
                      ? "bg-primary text-primary-foreground" 
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                  </div>
                  <span className="truncate">{lesson.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {!sidebarOpen && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-10 rounded-full shadow-md"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 overflow-y-auto pt-16 pb-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">
                Lesson {currentLessonIdx + 1} of {lessons.length}
              </span>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                {currentLesson?.title}
              </h1>
            </div>

            <div className="space-y-10 pb-12">
              {currentLesson?.blocks.map((block) => (
                <div key={block.id} className="animate-fade-in">
                  {block.type === 'text' && (
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display">
                      <ReactMarkdown>{block.value}</ReactMarkdown>
                    </div>
                  )}

                  {block.type === 'code' && (
                    <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                      <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
                        <span className="text-xs font-mono font-bold text-muted-foreground uppercase">{block.language || 'code'}</span>
                        <Button 
                          variant="hero" 
                          size="sm" 
                          className="h-7 text-[10px] gap-1 px-3"
                          onClick={() => openCompiler(block.value, block.language || "python")}
                        >
                          <Play className="h-3 w-3" /> Try it Yourself
                        </Button>
                      </div>
                      <pre className="p-6 bg-slate-950 text-slate-100 overflow-x-auto font-mono text-sm leading-relaxed">
                        <code>{block.value}</code>
                      </pre>
                    </div>
                  )}

                  {block.type === 'video' && (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-lg">
                      {block.value.includes('youtube.com') || block.value.includes('youtu.be') ? (
                        <iframe
                          src={getEmbedUrl(block.value)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : block.value.startsWith('/uploads/') ? (
                        <video src={block.value} controls className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
                          <Video className="h-12 w-12 opacity-20" />
                          <p className="text-sm">External video content</p>
                          <Button variant="secondary" size="sm" onClick={() => window.open(block.value, '_blank')}>
                            Watch External <ExternalLink className="ml-2 h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {block.type === 'document' && (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-between gap-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold">Lesson Resource</h4>
                          <p className="text-sm text-muted-foreground">Download or view the supplemental document.</p>
                        </div>
                      </div>
                      <Button onClick={() => window.open(block.value, '_blank')} className="gap-2">
                        Open Document <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-16 border-t border-border bg-card/80 backdrop-blur-sm px-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentLessonIdx(i => Math.max(0, i - 1))} disabled={currentLessonIdx === 0} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="hidden sm:block text-sm text-muted-foreground font-medium">Lesson {currentLessonIdx + 1} of {lessons.length}</div>
          <Button onClick={handleNext} disabled={currentLessonIdx === lessons.length - 1 && completedLessons.includes(lessons[currentLessonIdx]?.id || String(currentLessonIdx))} className="gap-1">
            {currentLessonIdx === lessons.length - 1 ? "Finish Lesson" : "Next"} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Award className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-display font-bold">Congratulations!</DialogTitle>
            <DialogDescription className="text-lg pt-2">
              You have successfully completed <strong>{currentLesson?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Keep up the great work! Your progress has been updated.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCompletionDialog(false)} className="w-full h-12 text-lg font-bold">
              {currentLessonIdx === lessons.length - 1 ? "Awesome, I'm done!" : "Continue to Next Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instruction Modal */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Local Setup Required
            </DialogTitle>
            <DialogDescription className="pt-2">
              To run code locally on this server without any external APIs, please ensure the following tools are installed and added to your <strong>System Environment Variable (PATH)</strong>:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <p className="text-sm"><strong>Python:</strong> Ensure <code>python</code> is installed.</p>
            </div>
            <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <p className="text-sm"><strong>C/C++:</strong> Ensure <code>gcc</code> or <code>g++</code> is installed (e.g., via MinGW on Windows).</p>
            </div>
            <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <p className="text-sm"><strong>Java:</strong> Ensure <code>javac</code> and <code>java</code> are installed (JDK).</p>
            </div>
            <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <p className="text-sm"><strong>JavaScript:</strong> Works automatically via Node.js.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pb-2">
            <Checkbox id="dontshow" checked={dontShowAgain} onCheckedChange={(v) => setDontShowAgain(v === true)} />
            <label htmlFor="dontshow" className="text-xs text-muted-foreground cursor-pointer">Don't show this message again</label>
          </div>

          <DialogFooter>
            <Button onClick={handleConfirmInstructions} className="w-full">Got it, open compiler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {compilerOpen && (
        <CodeCompiler code={activeCode} language={activeLang} onClose={() => setCompilerOpen(false)} />
      )}
    </div>
  );
};

export default CourseDetail;
