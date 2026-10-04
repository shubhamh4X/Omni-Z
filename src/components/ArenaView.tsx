import React, { useState, useRef, useEffect } from 'react';
import { 
  GitCompare,
  ArrowLeftRight,
  Zap, 
  Brain, 
  Code, 
  GraduationCap, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  Equal, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  Globe, 
  Copy, 
  Check, 
  Play,
  RotateCcw,
  Dna
} from 'lucide-react';
import { ArenaComparison, ArenaResponse } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { DnaRingLogo } from './DnaRingLogo';

interface ArenaViewProps {
  onAdoptWinner?: (winnerContent: string, modelName: string) => void;
  onExitArena: () => void;
}

const AVAILABLE_MODELS = [
  {
    id: 'omni-z-autonomous-builder',
    name: 'Omni Z Genesis (Auto-Builder)',
    badge: 'Single-Prompt Software Builder',
    icon: Dna,
    color: 'text-purple-400',
    border: 'border-purple-400/40',
    bg: 'bg-purple-400/10',
    desc: 'Autonomous end-to-end full software & AI builder from a single prompt with zero limits.',
  },
  {
    id: 'omni-z-flash',
    name: 'Omni Z Ultra',
    badge: 'Flagship Intelligence',
    icon: Zap,
    color: 'text-[#38bdf8]',
    border: 'border-[#38bdf8]/40',
    bg: 'bg-[#38bdf8]/10',
    desc: 'High-speed multimodal reasoning and live web search grounding.',
  },
  {
    id: 'omni-z-think',
    name: 'Omni Z Deep Think',
    badge: 'Extended Reasoning',
    icon: Brain,
    color: 'text-purple-400',
    border: 'border-purple-400/40',
    bg: 'bg-purple-400/10',
    desc: 'Deep multi-step analytical chain of thought and logic validation.',
  },
  {
    id: 'omni-z-code',
    name: 'Code Architect',
    badge: 'Principal Systems',
    icon: Code,
    color: 'text-blue-400',
    border: 'border-blue-400/40',
    bg: 'bg-blue-400/10',
    desc: 'Software architecture, asymptotic complexity O(...), and production code.',
  },
  {
    id: 'omni-z-tutor',
    name: 'Masterclass Tutor',
    badge: 'Socratic Learning',
    icon: GraduationCap,
    color: 'text-emerald-400',
    border: 'border-emerald-400/40',
    bg: 'bg-emerald-400/10',
    desc: 'First-principles pedagogy, LaTeX mathematics, and interactive checks.',
  },
];

const ARENA_STARTERS = [
  {
    title: 'Distributed Caching Architecture',
    prompt: 'Design a resilient, zero-downtime distributed caching architecture for a system handling 10 million concurrent read/write operations.',
  },
  {
    title: 'Algorithmic Complexity & Benchmark',
    prompt: 'Implement an LRU Cache with O(1) get and put operations in Python. Include unit tests and time complexity analysis.',
  },
  {
    title: 'Quantum Teleportation Proof',
    prompt: 'Explain the protocol of Quantum Teleportation and derive the Bell state measurements step-by-step with LaTeX equations.',
  },
  {
    title: 'Monolith vs Microservices in 2026',
    prompt: 'Provide a rigorous, unbiased trade-off analysis between Modular Monoliths and Microservices for modern cloud-native systems in 2026.',
  },
];

export const ArenaView: React.FC<ArenaViewProps> = ({
  onAdoptWinner,
  onExitArena,
}) => {
  const [modelA, setModelA] = useState<string>('omni-z-flash');
  const [modelB, setModelB] = useState<string>('omni-z-think');
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [enableSearch, setEnableSearch] = useState<boolean>(false);
  const [battles, setBattles] = useState<ArenaComparison[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Win stats tracked in localStorage
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('omniz_arena_stats');
      return saved ? JSON.parse(saved) : { winsA: 0, winsB: 0, ties: 0 };
    } catch {
      return { winsA: 0, winsB: 0, ties: 0 };
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modelAObj = AVAILABLE_MODELS.find((m) => m.id === modelA) || AVAILABLE_MODELS[0];
  const modelBObj = AVAILABLE_MODELS.find((m) => m.id === modelB) || AVAILABLE_MODELS[1];

  // Auto-scroll on new comparison
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battles.length, isLoading]);

  const handleSendBattle = async (promptToSend?: string) => {
    const query = (promptToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    setInputPrompt('');
    setIsLoading(true);

    const tempId = `battle_${Date.now()}`;
    setActiveBattleId(tempId);

    try {
      const res = await fetch('/api/arena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          modelA,
          modelB,
          enableSearch,
        }),
      });

      const data = await res.json();
      if (data.modelA && data.modelB) {
        const newComparison: ArenaComparison = {
          id: tempId,
          prompt: query,
          timestamp: Date.now(),
          modelA: data.modelA,
          modelB: data.modelB,
          winner: null,
        };
        setBattles((prev) => [...prev, newComparison]);
      }
    } catch (err) {
      console.warn('Arena submission failed:', err);
    } finally {
      setIsLoading(false);
      setActiveBattleId(null);
    }
  };

  const handleVote = (battleId: string, winner: 'modelA' | 'modelB' | 'tie') => {
    setBattles((prev) =>
      prev.map((b) => (b.id === battleId ? { ...b, winner } : b))
    );

    setStats((prev: any) => {
      const updated = { ...prev };
      if (winner === 'modelA') updated.winsA = (updated.winsA || 0) + 1;
      else if (winner === 'modelB') updated.winsB = (updated.winsB || 0) + 1;
      else if (winner === 'tie') updated.ties = (updated.ties || 0) + 1;
      localStorage.setItem('omniz_arena_stats', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] text-[#e3e3e3] overflow-hidden select-text">
      {/* Arena Top Toolbar */}
      <div className="h-14 px-4 sm:px-6 border-b border-[#222427] bg-[#161719]/90 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#38bdf8]/20 via-[#a855f7]/20 to-[#f43f5e]/20 border border-[#38bdf8]/40 flex items-center justify-center text-white">
            <GitCompare className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Omni Z Multi-Model Compare
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-[#38bdf8] border border-[#38bdf8]/30 font-mono font-medium">
                Side-by-Side
              </span>
            </div>
            <p className="text-[11px] text-[#9aa0a6] hidden sm:block">
              Simultaneous concurrent generation & qualitative comparison
            </p>
          </div>
        </div>

        {/* Win Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Battle Record Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1b1c20] border border-[#2d2f33] font-mono text-[11px]">
            <span className="text-[#38bdf8] font-bold">{stats.winsA}W</span>
            <span className="text-[#80868b]">:</span>
            <span className="text-purple-400 font-bold">{stats.winsB}W</span>
            <span className="text-[#80868b]">:</span>
            <span className="text-[#9aa0a6]">{stats.ties}T</span>
          </div>

          {/* Reset Stats */}
          {(stats.winsA > 0 || stats.winsB > 0) && (
            <button
              onClick={() => {
                const zero = { winsA: 0, winsB: 0, ties: 0 };
                setStats(zero);
                localStorage.setItem('omniz_arena_stats', JSON.stringify(zero));
              }}
              className="p-1.5 rounded-lg hover:bg-[#282a2e] text-[#80868b] hover:text-white"
              title="Reset Scoreboard"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Back to Chat Button */}
          <button
            onClick={onExitArena}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222427] hover:bg-[#2c2e32] text-xs text-[#c4c7c5] hover:text-white border border-[#333539] transition-colors cursor-pointer"
          >
            <span>Back to Chat</span>
          </button>
        </div>
      </div>

      {/* Model Selection Matchup Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#18191b] border-b border-[#282a2c] flex items-center justify-between gap-3 text-xs flex-wrap">
        {/* Model A Dropdown */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-[#9aa0a6] font-mono text-[11px] uppercase">Side A:</span>
          <select
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
            className="bg-[#121315] border border-[#333539] text-[#e3e3e3] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#38bdf8] cursor-pointer flex-1"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} disabled={m.id === modelB}>
                {m.name} ({m.badge})
              </option>
            ))}
          </select>
        </div>

        {/* VS Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1c20] border border-[#2e3238] shadow-xs">
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="font-mono text-[11px] font-semibold text-[#c4c7c5] tracking-wider uppercase">VS</span>
        </div>

        {/* Model B Dropdown */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-[#9aa0a6] font-mono text-[11px] uppercase">Side B:</span>
          <select
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
            className="bg-[#121315] border border-[#333539] text-[#e3e3e3] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-purple-400 cursor-pointer flex-1"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} disabled={m.id === modelA}>
                {m.name} ({m.badge})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Battles Feed */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8">
        {battles.length === 0 && !isLoading && (
          <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-rose-500/20 rounded-full blur-xl opacity-75" />
              <DnaRingLogo className="w-16 h-16 mx-auto relative z-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Multi-Model Comparison
              </h2>
              <p className="text-sm text-[#9aa0a6] mt-2 max-w-lg mx-auto leading-relaxed">
                Compare frontier models side-by-side on reasoning, code architecture, or creative tasks.
                Evaluate latency, response quality, and pick the winning output.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {ARENA_STARTERS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendBattle(item.prompt)}
                  className="p-3.5 rounded-xl bg-[#1b1c20] hover:bg-[#222428] border border-[#2d2f33] hover:border-[#38bdf8]/40 transition-all text-left group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-[#38bdf8] flex items-center justify-between">
                    <span>{item.title}</span>
                    <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-[#9aa0a6] mt-1 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing Battles */}
        {battles.map((battle) => (
          <div
            key={battle.id}
            className="max-w-6xl mx-auto bg-[#18191c] rounded-2xl border border-[#282a2e] overflow-hidden shadow-xl"
          >
            {/* Prompt Header */}
            <div className="px-5 py-3.5 bg-[#141517] border-b border-[#282a2e] flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] mt-0.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-[#9aa0a6] uppercase font-mono tracking-wider">
                  Comparison Prompt
                </span>
                <p className="text-sm font-medium text-white mt-0.5 leading-relaxed">
                  {battle.prompt}
                </p>
              </div>
            </div>

            {/* Side-by-Side Dual Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#282a2e]">
              {/* MODEL A COLUMN */}
              <div className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  {/* Model Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#282a2e]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                      <span className="text-xs font-bold text-white">{battle.modelA.modelName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#9aa0a6] font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#38bdf8]" />
                        {(battle.modelA.latencyMs / 1000).toFixed(2)}s
                      </span>
                      {battle.modelA.tokenEstimate && (
                        <span>• ~{battle.modelA.tokenEstimate} tok</span>
                      )}
                    </div>
                  </div>

                  {/* Thinking Process if present */}
                  {battle.modelA.thinkingProcess && (
                    <div className="my-3">
                      <button
                        onClick={() =>
                          setExpandedThinking((prev) => ({
                            ...prev,
                            [`${battle.id}_a`]: !prev[`${battle.id}_a`],
                          }))
                        }
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-mono"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>Thinking Process</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            expandedThinking[`${battle.id}_a`] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedThinking[`${battle.id}_a`] && (
                        <div className="mt-2 p-3 rounded-xl bg-[#141517] border border-[#282a2e] text-xs text-[#c4c7c5] font-mono whitespace-pre-wrap leading-relaxed">
                          {battle.modelA.thinkingProcess}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Response Markdown */}
                  <div className="mt-4 text-xs sm:text-sm">
                    <MarkdownRenderer content={battle.modelA.content} />
                  </div>
                </div>

                {/* Column A Footer Actions */}
                <div className="pt-4 border-t border-[#282a2e] flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(`${battle.id}_a`, battle.modelA.content)}
                    className="flex items-center gap-1 text-xs text-[#80868b] hover:text-white"
                  >
                    {copiedId === `${battle.id}_a` ? (
                      <Check className="w-3.5 h-3.5 text-[#34d399]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy</span>
                  </button>

                  {onAdoptWinner && (
                    <button
                      onClick={() => onAdoptWinner(battle.modelA.content, battle.modelA.modelName)}
                      className="flex items-center gap-1 text-xs text-[#38bdf8] hover:underline"
                    >
                      <span>Adopt Response</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* MODEL B COLUMN */}
              <div className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  {/* Model Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#282a2e]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <span className="text-xs font-bold text-white">{battle.modelB.modelName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#9aa0a6] font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {(battle.modelB.latencyMs / 1000).toFixed(2)}s
                      </span>
                      {battle.modelB.tokenEstimate && (
                        <span>• ~{battle.modelB.tokenEstimate} tok</span>
                      )}
                    </div>
                  </div>

                  {/* Thinking Process if present */}
                  {battle.modelB.thinkingProcess && (
                    <div className="my-3">
                      <button
                        onClick={() =>
                          setExpandedThinking((prev) => ({
                            ...prev,
                            [`${battle.id}_b`]: !prev[`${battle.id}_b`],
                          }))
                        }
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-mono"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>Thinking Process</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            expandedThinking[`${battle.id}_b`] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedThinking[`${battle.id}_b`] && (
                        <div className="mt-2 p-3 rounded-xl bg-[#141517] border border-[#282a2e] text-xs text-[#c4c7c5] font-mono whitespace-pre-wrap leading-relaxed">
                          {battle.modelB.thinkingProcess}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Response Markdown */}
                  <div className="mt-4 text-xs sm:text-sm">
                    <MarkdownRenderer content={battle.modelB.content} />
                  </div>
                </div>

                {/* Column B Footer Actions */}
                <div className="pt-4 border-t border-[#282a2e] flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(`${battle.id}_b`, battle.modelB.content)}
                    className="flex items-center gap-1 text-xs text-[#80868b] hover:text-white"
                  >
                    {copiedId === `${battle.id}_b` ? (
                      <Check className="w-3.5 h-3.5 text-[#34d399]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy</span>
                  </button>

                  {onAdoptWinner && (
                    <button
                      onClick={() => onAdoptWinner(battle.modelB.content, battle.modelB.modelName)}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:underline"
                    >
                      <span>Adopt Response</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Voting Bar */}
            <div className="p-3.5 bg-[#141517] border-t border-[#282a2e] flex items-center justify-between gap-3 text-xs flex-wrap">
              <span className="text-[#9aa0a6] text-[11px] font-mono uppercase">
                Select the Best Response:
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote(battle.id, 'modelA')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    battle.winner === 'modelA'
                      ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8] font-bold'
                      : 'bg-[#1b1c20] border-[#2d2f33] text-[#c4c7c5] hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{battle.modelA.modelName} was Better</span>
                </button>

                <button
                  onClick={() => handleVote(battle.id, 'tie')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    battle.winner === 'tie'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-[#1b1c20] border-[#2d2f33] text-[#c4c7c5] hover:text-white'
                  }`}
                >
                  <Equal className="w-3.5 h-3.5" />
                  <span>Tie</span>
                </button>

                <button
                  onClick={() => handleVote(battle.id, 'modelB')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    battle.winner === 'modelB'
                      ? 'bg-purple-400/20 border-purple-400 text-purple-300 font-bold'
                      : 'bg-[#1b1c20] border-[#2d2f33] text-[#c4c7c5] hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{battle.modelB.modelName} was Better</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Duel Skeleton */}
        {isLoading && (
          <div className="max-w-6xl mx-auto bg-[#18191c] rounded-2xl border border-[#282a2e] overflow-hidden p-6 space-y-6 animate-pulse">
            <div className="flex items-center justify-between pb-4 border-b border-[#282a2e]">
              <div className="h-4 w-48 bg-[#282a2e] rounded-md" />
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping" />
                <span className="text-xs text-[#9aa0a6] font-mono">
                  Dueling {modelAObj.name} vs {modelBObj.name}...
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-3 w-32 bg-[#282a2e] rounded-md" />
                <div className="h-16 w-full bg-[#202226] rounded-xl" />
                <div className="h-24 w-full bg-[#202226] rounded-xl" />
              </div>
              <div className="space-y-3">
                <div className="h-3 w-32 bg-[#282a2e] rounded-md" />
                <div className="h-16 w-full bg-[#202226] rounded-xl" />
                <div className="h-24 w-full bg-[#202226] rounded-xl" />
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Arena Input Dock */}
      <div className="p-4 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent relative z-20">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="relative rounded-2xl bg-[#1e1f20] border border-[#3c4043] focus-within:border-[#38bdf8] focus-within:ring-1 focus-within:ring-[#38bdf8] transition-all shadow-xl">
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendBattle();
                }
              }}
              placeholder={`Send challenge to ${modelAObj.name} and ${modelBObj.name}...`}
              rows={2}
              className="w-full bg-transparent px-4 py-3 text-sm text-[#e3e3e3] placeholder-[#80868b] focus:outline-none resize-none max-h-36"
            />

            <div className="flex items-center justify-between px-3 py-2 border-t border-[#2d2f33]">
              <button
                onClick={() => setEnableSearch(!enableSearch)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                  enableSearch
                    ? 'bg-[#1e2330] text-[#38bdf8] border-[#38bdf8]/40'
                    : 'text-[#80868b] border-transparent hover:text-white'
                }`}
                title="Toggle Google Search live grounding in Arena"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Search: {enableSearch ? 'Live' : 'Off'}</span>
              </button>

              <button
                onClick={() => handleSendBattle()}
                disabled={!inputPrompt.trim() || isLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc] text-black font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shadow-md"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Models</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
