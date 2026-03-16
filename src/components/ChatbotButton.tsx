import { useState, useRef, useEffect } from "react";
import { GraduationCap, X, Send, Loader2, Plus, History, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };
type ChatHistory = { id: number; messages: Msg[]; timestamp: string };

const CHAT_URL = "/api/ai/chat";

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ai_chat_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveToHistory = (msgs: Msg[]) => {
    if (msgs.length === 0) return;
    
    const newEntry: ChatHistory = {
      id: Date.now(),
      messages: msgs,
      timestamp: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    };

    const updatedHistory = [newEntry, ...history].slice(0, 3);
    setHistory(updatedHistory);
    localStorage.setItem("ai_chat_history", JSON.stringify(updatedHistory));
  };

  const clearChat = () => {
    if (messages.length > 0) {
      saveToHistory(messages);
    }
    setMessages([]);
    setInput("");
    setShowHistory(false);
  };

  const loadPastChat = (entry: ChatHistory) => {
    // Optional: save current if not empty
    if (messages.length > 0) {
      saveToHistory(messages);
    }
    setMessages(entry.messages);
    setShowHistory(false);
  };

  const streamChat = async (allMessages: Msg[]) => {
    const token = localStorage.getItem("token");
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok || !resp.body) {
      if (resp.status === 429 || resp.status === 402) {
        const data = await resp.json();
        throw new Error(data.error || "Rate limited");
      }
      throw new Error("Failed to connect to AI");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          }
        } catch { /* ignore */ }
      }
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${err.message || "Something went wrong. Please try again."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full hero-gradient shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Open AI Chatbot"
      >
        <GraduationCap className="h-6 w-6 text-secondary-foreground" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative flex h-[500px] w-full max-w-sm flex-col rounded-2xl bg-card border border-border shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl hero-gradient px-4 py-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-secondary-foreground" />
                <span className="font-display font-semibold text-secondary-foreground">AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowHistory(!showHistory)} 
                  title="Chat History"
                  className={`p-1 rounded-md hover:bg-white/10 transition-colors ${showHistory ? 'bg-white/20 text-white' : 'text-secondary-foreground/80 hover:text-secondary-foreground'}`}
                >
                  <History className="h-5 w-5" />
                </button>
                <button 
                  onClick={clearChat} 
                  title="New Chat"
                  className="p-1 rounded-md hover:bg-white/10 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-white/10 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* History Overlay */}
            {showHistory && (
              <div className="absolute inset-x-0 top-[48px] bottom-0 z-20 bg-card/95 backdrop-blur-sm animate-fade-in p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent Chats</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 italic">No saved chats yet.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => loadPastChat(entry)}
                        className="w-full text-left p-3 rounded-xl border border-border bg-background hover:border-secondary hover:bg-secondary/5 transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-3.5 w-3.5 text-secondary" />
                          <span className="text-xs font-medium text-foreground truncate flex-1">
                            {entry.messages[0]?.content || "Empty chat"}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{entry.timestamp}</span>
                      </button>
                    ))}
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-4 text-xs" 
                  onClick={() => setShowHistory(false)}
                >
                  Back to chat
                </Button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-sm text-foreground">
                    Hi! I'm your AI learning assistant. Ask me about courses, coding concepts, or anything study-related! 🎓
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-secondary text-secondary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0 [&>pre]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask anything..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <Button size="icon" variant="hero" className="rounded-xl" onClick={handleSend} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;
