declare module 'kotlin-playground' {
  export interface KotlinCodeMirror {
    getValue(): string;
    setValue(value: string): void;
    getCursor(which?: 'from' | 'to'): { line: number; ch: number };
    setCursor(position: { line: number; ch: number }): void;
    replaceSelection(value: string): void;
    focus(): void;
    setOption(name: string, value: unknown): void;
    on(name: string, callback: () => void): void;
    off(name: string, callback?: () => void): void;
  }

  export interface KotlinPlaygroundInstance {
    state: Record<string, unknown> & {
      waitingForOutput?: boolean;
      output?: string | null;
      errors?: Array<{ severity?: string; message?: string }>;
      exception?: string | null;
    };
    codemirror: KotlinCodeMirror;
    execute(): void;
    getCode(): string;
    destroy(): void;
  }

  export interface KotlinPlaygroundOptions {
    version?: string;
    eventFunctions?: {
      getInstance?: (instance: KotlinPlaygroundInstance) => void;
    };
  }

  export default function kotlinPlayground(
    target: string | Node,
    options?: KotlinPlaygroundOptions,
  ): Promise<unknown[]>;
}
