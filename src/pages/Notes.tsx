import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotes = async () => {
      // TODO: Replace with API calls to fetch data from MongoDB
      setNotes([
        {
          id: "1",
          title: "My First Note",
          content: "This is my first note.",
          created_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    };
    fetchNotes();
  }, [user]);

  const addNote = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    setAdding(true);
    // TODO: Replace with API calls to add a note
    const newNote = {
      id: Math.random().toString(),
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setTitle("");
    setContent("");
    toast.success("Note saved!");
    setAdding(false);
  };

  const deleteNote = async (id: string) => {
    // TODO: Replace with API calls to delete a note
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="mb-6 font-display text-2xl font-bold">Personal Notes</h1>

      {/* Add note */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5 card-shadow">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          rows={3}
          className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <Button variant="hero" size="sm" onClick={addNote} disabled={adding} className="gap-1.5">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {adding ? "Saving..." : "Add Note"}
        </Button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-muted-foreground text-sm py-6">No notes yet. Create your first note above!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border bg-card p-4 card-shadow group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{note.title}</h3>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
              <p className="text-xs text-muted-foreground">{formatDate(note.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
