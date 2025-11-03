export type ActionType =
  | "SET_VALUE"
  | "CLICK"
  | "FOCUS"
  | "BLUR"
  | "NAVIGATE"
  | "CUSTOM";

export interface PayloadMap {
  SET_VALUE: { refKey: string; value: string };
  CLICK: { refKey: string };
  FOCUS: { refKey: string };
  BLUR: { refKey: string };
  NAVIGATE: { path: string; replace?: boolean };
  CUSTOM: { refKey: string; event: string; data?: any };
}

export type Action = {
  [K in keyof PayloadMap]: { type: K; payload: PayloadMap[K] };
}[keyof PayloadMap];
