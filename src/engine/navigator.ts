// src/engine/navigator.ts
let navigateFn: (to: string, options?: { replace?: boolean }) => void;

export function registerNavigate(fn: typeof navigateFn) {
  navigateFn = fn;
}

export function getNavigate() {
  if (!navigateFn) {
    throw new Error(
      "Navigator not registered – did you forget to call registerNavigate()?"
    );
  }
  return navigateFn;
}
