import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import {createStore, combineReducers, applyMiddleware} from 'redux'

import {user} from './user'
import {site} from './site'
import {globalSubMenu} from './global-sub-menu'

const loggerMiddleware = createLogger({
    collapsed: true,
    diff: true
})

const rootReducer = combineReducers({user, site, globalSubMenu})

export const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
    loggerMiddleware // neat middleware that logs actions
  )
)
