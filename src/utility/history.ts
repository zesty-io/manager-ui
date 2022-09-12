declare global {
  interface Window {
    openContentNavigationModal:
      | null
      | ((callback: (result: boolean) => void) => void);
    openCodeNavigationModal:
      | null
      | ((callback: (result: boolean) => void) => void);
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
