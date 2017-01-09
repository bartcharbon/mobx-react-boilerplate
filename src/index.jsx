import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import gavinStore from './GavinStore';
import App from './App';

render(
  <AppContainer>
    <App gavinStore={gavinStore} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;

    render(
      <AppContainer>
        <NextApp appState={gavinStore} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
