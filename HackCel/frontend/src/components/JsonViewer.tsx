import React, { useState } from 'react';
import { Check, Copy, ShieldCheck, Terminal } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  title?: string;
  eventType?: string;
  latencyMs?: number;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  title = 'Intelligence Engine Event Payload',
  eventType,
  latencyMs,
}) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighting for JSON using strict palette colors
  const renderHighlightedJson = (json: string) => {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-[#F2CC8F] font-medium'; // number: Morning Sunlight
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-white font-semibold'; // key: Pure White
          } else {
            cls = 'text-[#81B29A]'; // string: Seafoam Sage
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-[#E07A5F] font-bold'; // boolean: Sunbaked Terracotta
        } else if (/null/.test(match)) {
          cls = 'text-[#E07A5F] font-bold'; // null: Sunbaked Terracotta
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="rounded-xl border border-[#3D405B]/30 bg-[#3D405B] text-[#F4F1DE] overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#3D405B] text-white border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-[#F2CC8F]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            {title}
          </span>
          {eventType && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F2CC8F] text-[#3D405B]">
              {eventType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {latencyMs !== undefined && (
            <span className="text-[11px] font-mono text-[#F4F1DE]/80">
              Latency: <span className="text-[#81B29A] font-semibold">{latencyMs}ms</span>
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] font-mono text-[#F2CC8F]">
            <ShieldCheck className="w-3 h-3 text-[#F2CC8F]" />
            Schema Validated
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#81B29A] hover:bg-[#6D9E86] text-white text-xs font-mono font-semibold transition-colors active:scale-95 shadow-xs"
            title="Copy Raw JSON"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#F2CC8F]" />
                <span className="text-[#F2CC8F] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto max-h-[460px] scrollbar-thin bg-[#3D405B]">
        <pre
          className="text-xs font-mono leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderHighlightedJson(jsonString) }}
        />
      </div>

      {/* Reasoning Snippet if present */}
      {data?.reasoning && (
        <div className="px-4 py-2.5 bg-[#3D405B] border-t border-white/10 text-xs text-[#F4F1DE] flex items-start gap-2">
          <span className="font-mono text-[#F2CC8F] font-bold uppercase shrink-0">Reasoning:</span>
          <span className="italic text-[#F4F1DE]/90">{data.reasoning}</span>
        </div>
      )}
    </div>
  );
};
