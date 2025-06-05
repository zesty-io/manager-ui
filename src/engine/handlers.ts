// src/engine/handlers.ts
import { ActionType, PayloadMap } from "./actionTypes";
import { getNavigate } from "./navigator";
import { refRegistry } from "./refRegistry";

export const handlers: Record<ActionType, (payload: any) => Promise<void>> = {
  SET_VALUE: async ({ refKey, value }: any) => {
    const h = refRegistry[refKey].handle;
    if (!h) throw new Error(`No handle for "${refKey}"`);
    h.setValue(value);
  },

  CLICK: async ({ refKey }: any) => {
    const h = refRegistry[refKey].handle;
    if (!h) throw new Error(`No handle for "${refKey}"`);
    h.click?.();
  },

  FOCUS: async ({ refKey }: any) => {
    const h = refRegistry[refKey].handle;
    if (!h) throw new Error(`No handle for "${refKey}"`);
    h.focus?.();
  },

  BLUR: async ({ refKey }: any) => {
    const h = refRegistry[refKey].handle;
    if (!h) throw new Error(`No handle for "${refKey}"`);
    h.blur?.();
  },

  NAVIGATE: async ({ url, replace = false }: PayloadMap["NAVIGATE"]) => {
    const navigate = getNavigate();
    navigate(url, { replace });
  },

  CUSTOM: async ({ refKey, event, data }: any) => {
    const h = refRegistry[refKey].handle;
    if (!h) throw new Error(`No handle for "${refKey}"`);
    h[event]?.(data);
  },
};
