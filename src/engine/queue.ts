import { Action } from "./actionTypes";
import { handlers } from "./handlers";

const queue: Action[] = [];
let processing = false;

// how many milliseconds to wait between actions
let interActionDelayMs = 1500;
export function setInterActionDelay(ms: number) {
  interActionDelayMs = ms;
}

export function enqueueAction(action: Action) {
  queue.push(action);
  processQueue();
}

async function processQueue() {
  if (processing) return;
  processing = true;

  while (queue.length) {
    const { type, payload } = queue.shift()!;
    const fn = handlers[type];

    if (fn) {
      try {
        await fn(payload);

        if (interActionDelayMs > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, interActionDelayMs)
          );
        }
      } catch (err) {
        console.error(`Error handling action ${type}`, err);
      }
    }
  }

  processing = false;
}
