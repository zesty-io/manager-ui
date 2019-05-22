// import thunkMiddleware from 'redux-thunk'
// import {createLogger} from 'redux-logger'
// import {createStore, combineReducers, applyMiddleware, compose} from 'redux'

// import {logs} from './logs'
// import {loadingLogs} from './loadingLogs'
// import {inViewLogs} from './inViewLogs'
// import {settings} from './settings'

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// const loggerMiddleware = createLogger({
//     collapsed: true,
//     diff: true
// })

// export const store = createStore(
//   combineReducers({
//     logs,
//     loadingLogs,
//     inViewLogs,
//     settings
//   }),
//   composeEnhancers(
//     applyMiddleware(
//       thunkMiddleware, // lets us dispatch() functions
//       loggerMiddleware // neat middleware that logs actions
//     )
//   )
// )
