export interface RefHandle {
  setValue?(value: string): void;
  click?(): void;
  focus?(): void;
  blur?(): void;
  [event: string]: any;
}

export interface RefRegistryEntry {
  handle: RefHandle;
  context?: () => Record<string, any>;
  options?: {
    skip?: boolean;
  };
}

export const refRegistry: Record<string, RefRegistryEntry> = {};
export const getRefRegistry = () => refRegistry;
