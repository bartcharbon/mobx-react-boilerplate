import React, {Component} from 'react';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import PhenotypeSelection from './Components/PhenotypeSelection'
import {get} from './MolgenisApi'
import {Phenotype} from './GavinStore'

@observer
class App extends Component {
    render() {
        return (
            <div>
                <PhenotypeSelection phenotypes={this.props.gavinStore.phenotypes} loadOptions={(input) => {
                    return get(this.props.gavinStore.server, this.getUrl(input), this.props.gavinStore.token).then((json) => {
                        return {
                            options: json.items.map(App.getOption),
                            complete: false
                        }
                    })
                }} onPhenoChange={(pheno) => {
                    this.props.gavinStore.addPhenotype(new Phenotype(pheno.value, true))
                }}/>
                <DevTools />
            </div>
        );
    }

    getUrl(input = '') {
        const q = this.getQuery(input)
        const attrs = 'id,ontologyTermIRI,ontologyTermName,ontologyTermSynonym';
        const params = {q, attrs}
        const entityName = "sys_ont_OntologyTerm";
        const query = Object.keys(params)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&')
        return `/v2/${entityName}?${query}`
    }

    static getOption(item) {
        const {ontologyTermName, ontologyTermSynonym, ontologyTermIRI} = item
        const primaryID = ontologyTermIRI.substring(ontologyTermIRI.lastIndexOf('/') + 1)
        const value = {
            primaryID,
            name: ontologyTermName,
            synonyms: ontologyTermSynonym
                .map(synonym => synonym.ontologyTermSynonym)
                .filter(synonym => synonym !== ontologyTermName)
        }
        const label = `${value.name} (${value.primaryID})`
        return {label, value}
    }

    getQuery(input) {
        const termQueryParts = input
            .split(/\s+/)
            .filter(term => term.length)
            .map(term => `(ontologyTermSynonym.ontologyTermSynonym=q="${term.trim()}",ontologyTermIRI=q="${term.trim()}")`)
        // TODO: filter out items that have already been selected
        return [`ontology=="${this.props.gavinStore.ontologyId}"`, ...termQueryParts].join(';')
    }

}
;

export default App;
