import React from 'react'
import renderer from 'react-test-renderer'
import App from './index.js'

import {createStore, combineReducers, applyMiddleware, compose} from 'redux'

const reducer = function() {
  return {}
}
const reducers = combineReducers({reducer})
const store = createStore(reducers)

test('App mounts', () => {
  const component = renderer.create(<App store={store}/>);
  let tree = component.toJSON();

  expect(tree).toMatchSnapshot();

  // manually trigger the callback
  // tree.props.onMouseEnter();
  // re-rendering
  // tree = component.toJSON();
  // expect(tree).toMatchSnapshot();

  // manually trigger the callback
  // tree.props.onMouseLeave();
  // re-rendering
  // tree = component.toJSON();
  // expect(tree).toMatchSnapshot();
});
