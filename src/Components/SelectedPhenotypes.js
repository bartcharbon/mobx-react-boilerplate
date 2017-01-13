import React, {Component, PropTypes} from 'react'
import {FormGroup, Checkbox, Glyphicon} from 'react-bootstrap'
import {observer} from 'mobx-react'

const propTypes = {
    store: PropTypes.object
}

@observer
class SelectedPhenotypes extends Component {
    render() {
        const {store} = this.props
        return <div>
            <b>Selected phenotypes:</b>
            <form>
                <FormGroup>
                    {store.phenotypes.map((pheno, index) => <span key={index}><Checkbox inline checked={pheno.active}
                                                                                  onChange={() => {
                                                                                      store.togglePhenotype(index)
                                                                                  }}>
            {pheno.value.name}
          </Checkbox>&nbsp;
                            <small>
              <Glyphicon glyph='remove' onClick={() => store.removePhenotype(index)}/>
            </small>
                            &nbsp;&nbsp;&nbsp;
          </span>
                    )}
                </FormGroup>
            </form>
        </div>
    }
}

SelectedPhenotypes.propTypes = propTypes
export default SelectedPhenotypes
