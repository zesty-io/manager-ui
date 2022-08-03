declare global {
  interface Window {
    openNavigationModal: null | ((callback: (result: boolean) => void) => void);
  }
}

import { createBrowserHistory } from "history";
const history = createBrowserHistory({
  getUserConfirmation(message, callback) {
    if (message === "confirm") {
      window.openNavigationModal(callback);
    } else {
      callback(true);
    }
  },
});
export default history;
