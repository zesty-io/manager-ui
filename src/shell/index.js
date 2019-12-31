import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Redirect, Route } from "react-router-dom";

import { store } from "shell/store";
import Shell from "./views/Shell";

window.ZESTY_REDUX_STORE = store;

class PrivateRoute extends React.Component {
  render() {
    return this.props.loggedIn ? this.props.children : <Redirect to="/login" />;
  }
}
PrivateRoute.defaultProps = {
  loggedIn: true
};

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <PrivateRoute>
        <Route path="/" component={Shell} />
      </PrivateRoute>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
