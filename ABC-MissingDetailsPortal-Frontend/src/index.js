import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware, ConnectedRouter} from 'connected-react-router';

import allReducers from './reducers';
import routes from './routes';

import './styles/styles.scss'

const history = createBrowserHistory();

const middlewares = [routerMiddleware(history), thunk];

// Only use the redux-logger middleware in development
if (process.env.NODE_ENV === `development`) {
  middlewares.push(createLogger());
}

export const store = createStore(connectRouter(history)(allReducers), applyMiddleware(...middlewares));

// Helper function that reders single route
const renderRoute = (route, props) => {
  window.scrollTo(0, 0); // Reset scroll to top
  return (
    <route.component routeParams={props.match.params} />
  );
};

const removeLoading = () => {
  setTimeout(() => {
    const root = document.getElementById('root');
    root && root.classList.remove('loading');
  }, 100);
  return;
}

// Helper function that create all routes
const createRoutes = () => routes.map((route) => (
  <Route
    exact
    key={route.path}
    path={route.path}
    component={(props) => renderRoute(route, props)}>
  </Route>
));

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        {removeLoading()}
        {createRoutes()}
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
