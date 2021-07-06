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
