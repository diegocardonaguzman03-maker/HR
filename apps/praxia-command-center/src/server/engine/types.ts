export type CompletionInput = { system: string; prompt: string; maxTokens?: number };
export type CompletionResult = { text: string; costUsdMicros: number; model: string };

/** Where the agents' work is executed. Never has tools that send anything outside PRAXIA. */
export type EngineProvider = {
  name: string;
  model: string | null;
  available: boolean;
  reason?: string;
  complete(input: CompletionInput): Promise<CompletionResult>;
};
