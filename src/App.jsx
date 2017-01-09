import React, { Component } from 'react';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import SelectedPhenotypes from './Components/SelectedPhenotypes'

@observer
class App extends Component {
  render() {
    return (
      <div>
        <SelectedPhenotypes phenotypes={this.props.gavinStore.phenotypes}/>
        <DevTools />
      </div>
    );
  }
};

export default App;
