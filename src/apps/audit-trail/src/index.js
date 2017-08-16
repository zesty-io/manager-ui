'use strict'

import AuditTrailApp from './views/app'
// We make the sub-app a global
// so the app-shell can mount it
window.AuditTrailApp = AuditTrailApp

// import React from 'react'
// import ReactDOM from 'react-dom'
// import {Provider} from 'react-redux'
// import {store} from './store'
// import {APP_SETTINGS} from './store/settings'


// window.mountAuditApp = function mountAuditApp(el, settings) {
//   console.log('mountAuditApp', el);

//   store.dispatch({
//     type: APP_SETTINGS,
//     settings
//   })

//   ReactDOM.render((
//     <Provider store={store}>
//       <App />
//     </Provider>
//   ), el)
// }

// window.unmountAuditApp = function unmountAuditApp(el) {
//   console.log('unmountAuditApp', el);
//   ReactDOM.unmountComponentAtNode(el)
// }
