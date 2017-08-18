import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {BrowserRouter, Redirect, Route} from 'react-router-dom'

import {store} from 'shell/store'
import AppShell from './shell'

class PrivateRoute extends React.Component {
  render() {
    return (this.props.loggedIn)
      ? this.props.children
      : <Redirect to="/login"></Redirect>
  }
}
PrivateRoute.defaultProps = {
  loggedIn: true
}

ReactDOM.render((
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <PrivateRoute>
          <Route path="/" component={AppShell} />
        </PrivateRoute>
      </div>
    </BrowserRouter>
  </Provider>
), document.getElementById('root'))
