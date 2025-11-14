import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';

const createSagaMiddleware = require('redux-saga').default;

import rootReducer from './reducer';
import rootSaga from './saga';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(rootSaga);

export default store;
store.js

store.js

// const createSagaMiddleware = require('redux-saga').default;
// const { configureStore } = require('@reduxjs/toolkit');
// const rootReducer = require('./reducer').default;
// const rootSaga = require('./saga').default;

// // Create the saga middleware
// const sagaMiddleware = createSagaMiddleware();

// // Configure the store
// const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
// });

// // Run the root saga
// sagaMiddleware.run(rootSaga);

// // Export the store
// module.exports = store;


