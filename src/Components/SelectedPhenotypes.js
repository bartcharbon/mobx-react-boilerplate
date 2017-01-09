import React, {Component, PropTypes} from 'react'
import {FormGroup, Checkbox, Glyphicon} from 'react-bootstrap'
import {observer} from 'mobx-react'

const propTypes = {
    phenotypes: PropTypes.object
}

@observer
class SelectedPhenotypes extends Component {
    render() {
        const {phenotypes} = this.props
        return <div>
            <b>Selected phenotypes:</b>
            <form>
                <FormGroup>
                    {phenotypes.map((pheno, index) => <span key={index}><Checkbox inline checked={pheno.active}
                                                                                  onChange={() => {
                                                                                      pheno.active = !pheno.active
                                                                                  }}>
            {pheno.value.name}
          </Checkbox>&nbsp;
                            <small>
              <Glyphicon glyph='remove' onClick={() => phenotypes.remove(phenotypes[index])}/>
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
