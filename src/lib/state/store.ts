import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
// import { createLogger } from 'redux-logger'
import reducer from './reducer'
import { Envs } from '../../common/types'

// const loggerMiddleware = createLogger()

const middleware =
  process.env.NODE_ENV === Envs.dev
    ? applyMiddleware(thunkMiddleware /*, loggerMiddleware*/)
    : applyMiddleware(thunkMiddleware)

const store = createStore(reducer, middleware)

export default store
