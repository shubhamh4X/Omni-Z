import React, { useState } from 'react';
import { Copy, Check, Play, Download, Terminal, ChevronDown, ChevronUp, Eye, Code } from 'lucide-react';
import { PythonExecutionResult } from '../types';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PythonExecutionResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const cleanLang = (language || 'text').toLowerCase();
  const isPython = cleanLang === 'python' || cleanLang === 'py';
  const isRenderable = cleanLang === 'html' || cleanLang === 'svg' || cleanLang === 'xml';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      json: 'json',
      html: 'html',
      css: 'css',
      sql: 'sql',
      bash: 'sh',
      shell: 'sh',
      xml: 'svg',
      svg: 'svg',
    };
    const ext = extMap[cleanLang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExecute = async () => {
    setIsRunning(true);
    setShowResult(true);
    try {
      const res = await fetch('/api/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        stdout: '',
        stderr: (err as Error).message,
        execution_time_ms: 0,
        variables: {},
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="my-3.5 rounded-2xl border border-[#2d2f33] bg-[#1e1f20] text-[#e3e3e3] overflow-hidden shadow-lg font-mono text-sm">

      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2d2f33] bg-[#242628] text-xs text-[#9aa0a6]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8ab4f8]"></span>
          <span className="font-semibold uppercase tracking-wider text-[#c4c7c5]">{cleanLang}</span>
        </div>
        <div className="flex items-center gap-2">

          {isRenderable && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2e3135] hover:bg-[#383b40] text-[#8ab4f8] transition-colors cursor-pointer text-[11px]"
            >
              {showPreview ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPreview ? 'Show Code' : 'Preview'}</span>
            </button>
          )}

          {isPython && (
            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#041e49] font-semibold transition-colors cursor-pointer shadow-xs text-xs disabled:opacity-50"
              title="Run Python code on backend"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#2e3135] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer text-xs"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1 rounded hover:bg-[#2e3135] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showPreview && isRenderable ? (
        <div className="p-4 bg-white rounded-b-2xl min-h-[160px] flex items-center justify-center">
          {cleanLang === 'svg' ? (
            <div dangerouslySetInnerHTML={{ __html: code }} />
          ) : (
            <iframe
              title="Preview"
              srcDoc={code}
              sandbox="allow-scripts"
              className="w-full h-64 border-0"
            />
          )}
        </div>
      ) : (
        <div className="p-4 overflow-x-auto text-[13px] leading-relaxed text-[#e3e3e3] bg-[#1a1b1d] selection:bg-[#8ab4f8]/30">
          <pre className="font-mono">
            <code>{code}</code>
          </pre>
        </div>
      )}

      {showResult && (
        <div className="border-t border-[#2d2f33] bg-[#141517] p-3 text-xs">
          <div className="flex items-center justify-between text-[#9aa0a6] mb-2">
            <div className="flex items-center gap-1.5 font-medium text-[#e3e3e3]">
              <Terminal className="w-3.5 h-3.5 text-[#8ab4f8]" />
              <span>Python 3 Terminal</span>
              {result && (
                <span className="text-[11px] text-[#80868b] ml-1">
                  ({result.execution_time_ms}ms)
                </span>
              )}
            </div>
            <button
              onClick={() => setShowResult(!showResult)}
              className="text-[#9aa0a6] hover:text-white cursor-pointer"
            >
              {showResult ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isRunning && (
            <div className="py-2 text-[#8ab4f8] flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#8ab4f8] animate-ping"></span>
              Executing script on Python 3 backend...
            </div>
          )}

          {result && (
            <div className="space-y-2">
              {result.stdout && (
                <div className="p-2.5 rounded-xl bg-[#1e1f20] border border-[#2d2f33] text-[#e3e3e3] whitespace-pre-wrap font-mono">
                  {result.stdout}
                </div>
              )}
              {result.stderr && (
                <div className="p-2.5 rounded-xl bg-[#2a1b1b] border border-[#522525] text-red-300 whitespace-pre-wrap font-mono">
                  {result.stderr}
                </div>
              )}
              {!result.stdout && !result.stderr && (
                <div className="text-[#80868b] italic">Code finished with no output.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
