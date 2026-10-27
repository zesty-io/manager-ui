// `contentOnly`: the prompt is about content edits alone, so Save and Don't
// Save must leave any other pending work alone.
export type NavModalScope = { contentOnly?: boolean };
type NavModal =
  | null
  | ((callback: (result: boolean) => void, scope?: NavModalScope) => void);

declare global {
  interface Window {
    openContentNavigationModal: NavModal;
    openCodeNavigationModal: NavModal;
  }
}

import { createBrowserHistory } from "history";
const history = createBrowserHistory({
  getUserConfirmation(message, callback) {
    if (message === "content_confirm") {
      window.openContentNavigationModal(callback);
    } else if (message === "code_confirm") {
      window.openCodeNavigationModal(callback);
    } else {
      callback(true);
    }
  },
});
export default history;
