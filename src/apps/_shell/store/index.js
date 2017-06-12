import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createInjectStore} from 'redux-injector';

import {user} from './user'
import {site} from './site'
import {globalSubMenu} from './global-sub-menu'

const loggerMiddleware = createLogger({
    collapsed: true,
    diff: true
})

// We use redux-injector to allow dynamic addition
// of reducers after other apps are loaded
export const store = createInjectStore(
  {user, site, globalSubMenu},
  applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
    loggerMiddleware // neat middleware that logs actions
  )
)
