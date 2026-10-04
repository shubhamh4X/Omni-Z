export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  textContent?: string;
}

export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface VectorMemoryItem {
  id: string;
  content: string;
  category: 'system' | 'knowledge' | 'code' | 'documents' | 'user_memory' | 'general';
  similarity?: number;
  metadata?: Record<string, any>;
  timestamp?: number;
}

export interface CodeBlockInfo {
  language: string;
  code: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  sources?: GroundingSource[];
  webSearchQueries?: string[];
  vectorMemories?: VectorMemoryItem[];
  codeBlocks?: CodeBlockInfo[];
  images?: string[];
  imagePrompt?: string;
  thinkingProcess?: string;
  autoSavedMemory?: string | null;
  isStreaming?: boolean;
  multiLlmConsensus?: {
    activeModels: string[];
    consensusScore?: string;
    engineContributions?: Array<{
      model: string;
      role: string;
      summary: string;
      color: string;
    }>;
  };
}

export interface MultiLlmProviderConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  deepseekApiKey?: string;
  perplexityApiKey?: string;
  groqApiKey?: string;
  enabledModels: string[];
  consensusMode: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ArtifactItem {
  id: string;
  title: string;
  type: 'code' | 'web' | 'svg' | 'markdown';
  language?: string;
  content: string;
}

export interface PythonExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  execution_time_ms: number;
  variables: Record<string, string>;
}

export interface DocumentAnalysisResult {
  analysis: string;
  fileName: string;
  indexedChunksCount: number;
}

export interface GeneratedImageResult {
  prompt: string;
  style: string;
  svg: string | null;
  description: string;
}

export interface ArenaResponse {
  modelId: string;
  modelName: string;
  content: string;
  latencyMs: number;
  thinkingProcess?: string;
  sources?: GroundingSource[];
  tokenEstimate?: number;
  error?: string;
}

export interface ArenaComparison {
  id: string;
  prompt: string;
  timestamp: number;
  modelA: ArenaResponse;
  modelB: ArenaResponse;
  winner?: 'modelA' | 'modelB' | 'tie' | 'both_bad' | null;
}

