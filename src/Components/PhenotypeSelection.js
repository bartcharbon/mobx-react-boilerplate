import React, {Component, PropTypes} from 'react'
import SelectedPhenotypes from './SelectedPhenotypes'
import {Label} from 'react-bootstrap'
import {observer} from 'mobx-react'
import ReactSelect from 'react-select'
import {Phenotype} from '../GavinStore'

// ------------------------------------
// Presentation components
// ------------------------------------
const propTypes = {
    store: PropTypes.object,
    togglePhenotype: PropTypes.func,
    removePhenotype: PropTypes.func,
    loadOptions: PropTypes.func,
    onPhenoChange: PropTypes.func
}

@observer
class PhenotypeSelection extends Component {
    render() {
        const {store} = this.props
        return (
            <div>
                Select the phenotypes for the patient:
                <ReactSelect.Async
                    loadOptions={
                        this.props.loadOptions}
                    onChange={(pheno) => store.addPhenotype(new Phenotype(pheno.value, true)) }
                />

                {store.phenotypes && <SelectedPhenotypes {...this.props} /> }
            </div>
        )
    }
}

//PhenotypeSelection.propTypes = propTypes

export default PhenotypeSelection