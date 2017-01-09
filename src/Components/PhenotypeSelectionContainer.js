import React, { Component, PropTypes } from 'react'
import EntitySelectBoxContainer from 'containers/EntitySelectBoxContainer'
import { selectPhenotype, togglePhenotype, removePhenotype } from 'routes/Gavin/modules/PhenotypeSelection'
import { getSelectedPhenotypes } from 'routes/Gavin/modules/Gavin'
import SelectedPhenotypes from '../components/SelectedPhenotypes'
import { Label } from 'react-bootstrap'
import { observer } from 'mobx'

// ------------------------------------
// Presentation components
// ------------------------------------
const propTypes = {
    phenotypes      : PropTypes.array,
    getQuery        : PropTypes.func,
    togglePhenotype : PropTypes.func,
    removePhenotype : PropTypes.func
}

@observer
class PhenotypeSelection extends Component {
    static getOption (item) {
        const { ontologyTermName, ontologyTermSynonym, ontologyTermIRI } = item
        const primaryID = ontologyTermIRI.substring(ontologyTermIRI.lastIndexOf('/') + 1)
        const value = {
            primaryID,
            name     : ontologyTermName,
            synonyms : ontologyTermSynonym
                .map(synonym => synonym.ontologyTermSynonym)
                .filter(synonym => synonym !== ontologyTermName)
        }
        const label = `${value.name} (${value.primaryID})`
        return { label, value }
    }

    render () {
        const { getQuery, phenotypes } = this.props
        return (
            <div>
                Select the phenotypes for the patient:
                <EntitySelectBoxContainer
                    entityName={'sys_ont_OntologyTerm'}
                    getQuery={getQuery}
                    attrs='id,ontologyTermIRI,ontologyTermName,ontologyTermSynonym'
                    getOption={PhenotypeSelection.getOption}
                    optionRenderer={(pheno) => <span>{pheno.value.name} <Label bsStyle='primary'>{pheno.value.primaryID}</Label>
                        {pheno.value.synonyms && <small><br />{ pheno.value.synonyms.join(', ')}</small>}
          </span>}
                    {...this.props} />

                {phenotypes && <SelectedPhenotypes {...this.props} /> }
            </div>
        )
    }
}

PhenotypeSelection.propTypes = propTypes