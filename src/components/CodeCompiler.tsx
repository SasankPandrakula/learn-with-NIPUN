import { useState, useRef, useEffect } from "react";
import { X, Play, Loader2, Code2, TerminalSquare, Settings2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface CodeCompilerProps {
  code: string;
  language: string;
  onClose: () => void;
}

const LANGUAGE_MAP: Record<string, { id: number; name: string }> = {
  c: { id: 50, name: "C (GCC)" },
  python: { id: 71, name: "Python 3" },
  java: { id: 62, name: "Java (OpenJDK)" },
  javascript: { id: 63, name: "Node.js" },
  js: { id: 63, name: "Node.js" },
  cpp: { id: 54, name: "C++ (GCC)" },
};

const CodeCompiler = ({ code, language, onClose }: CodeCompilerProps) => {
  const [editorCode, setEditorCode] = useState(code);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // Initialize socket using relative path (proxied by Vite)
    socketRef.current = io();

    socketRef.current.on("stdout", (data) => setOutput(prev => prev + data));
    socketRef.current.on("stderr", (data) => setOutput(prev => prev + data));
    socketRef.current.on("exit", (code) => {
      setRunning(false);
      if (code !== 0 && code !== null) setOutput(prev => prev + `\nProcess exited with code ${code}`);
    });
    socketRef.current.on("error", (err) => {
      toast.error(err);
      setRunning(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleRun = () => {
    if (!socketRef.current) return;
    
    setRunning(true);
    setOutput("");
    
    const token = localStorage.getItem("token");
    socketRef.current.emit("run-code", {
      source_code: editorCode,
      language: language,
      token: token
    });
  };

  const sendInput = () => {
    if (!socketRef.current || !input.trim()) return;
    socketRef.current.emit("input", input);
    setOutput(prev => prev + input + "\n");
    setInput("");
  };

  const handleInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendInput();
    }
  };

  const langInfo = LANGUAGE_MAP[language.toLowerCase()] || LANGUAGE_MAP["python"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[85vh] flex flex-col rounded-xl border border-slate-800 bg-[#0d1117] shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* IDE Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#161b22]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Code2 className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 leading-none mb-1">Interactive Workspace</h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{langInfo.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRun} 
              disabled={running} 
              className="gap-2 bg-green-600 hover:bg-green-500 text-white border-0 shadow-lg shadow-green-900/20 h-9 px-5 transition-all"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
              <span className="font-semibold">{running ? "Running" : "Run Code"}</span>
            </Button>
            <div className="h-4 w-px bg-slate-700 mx-1"></div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Pane: Code Editor */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0d1117]">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/50 bg-[#161b22]/50">
              <Settings2 className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Source Code</span>
            </div>
            <div className="flex-1 relative group">
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                className="absolute inset-0 w-full h-full p-4 font-mono text-[14px] leading-relaxed bg-transparent text-slate-200 resize-none focus:outline-none focus:ring-0 selection:bg-blue-500/30"
                spellCheck={false}
                placeholder="Write your code here..."
              />
            </div>
          </div>

          {/* Right Pane: Terminal */}
          <div className="w-full lg:w-[400px] xl:w-[500px] flex flex-col bg-[#0d1117]">
            
            {/* Output Section */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50 bg-[#161b22]/50">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Interactive Terminal</span>
                </div>
                {running && <span className="text-[10px] text-blue-400 animate-pulse uppercase tracking-wider font-bold">Process Active</span>}
              </div>
              <div className="flex-1 relative bg-[#0a0d12] overflow-hidden flex flex-col">
                <pre 
                  ref={outputRef}
                  className="flex-1 p-4 font-mono text-[13px] text-slate-300 overflow-auto whitespace-pre-wrap leading-relaxed"
                >
                  {output || (running ? "" : "Ready for execution. Click 'Run Code'.")}
                </pre>
                
                {/* Real-time Input Line */}
                {running && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-t border-slate-800">
                    <span className="text-green-500 font-mono text-xs animate-pulse">❯</span>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleInputKey}
                      autoFocus
                      placeholder="Type input and press Enter..."
                      className="flex-1 bg-transparent border-none outline-none text-slate-200 font-mono text-xs placeholder:text-slate-600"
                    />
                    <button onClick={sendInput} className="text-slate-500 hover:text-white transition-colors">
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeCompiler;
