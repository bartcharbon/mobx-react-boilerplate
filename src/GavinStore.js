import {observable, computed} from 'mobx';
import {get} from './MolgenisApi';


export class Phenotype {
    value;
    @observable active;

    constructor(value, active) {
        this.value = value;
        this.active = active;
    }
}

export class Variant {
    chrom;
    pos;
    ref;
    alt;
    gene;
    gavin;
}

class GavinStore {

    @observable phenotypes;
    @observable scores;
    @observable variants;
    token = "492d07a9434f48a5915b454200d92c6c";
    server = {apiUrl: "http://localhost:8080/api/"};
    ontologyId = "AAAACWIH7ZE53QSABEBZGYAAAE";

    @computed get sortedVariants() {

    }

    constructor() {
        this.phenotypes = [new Phenotype({
            primaryID: "ID",
            synonyms: ["naam", "syn1", "syn2"],
            name: "naam"
        }, true), new Phenotype({primaryID: "ID2", synonyms: ["naam2", "syn12", "syn22"], name: "naam2"}, true)]

    }

    addPhenotype(phenotype) {
        //retrieve scores
        //then update state using promise
        this.phenotypes.push(phenotype);
    }

    getPhenotypeQuery(input) {
        const termQueryParts = input
            .split(/\s+/)
            .filter(term => term.length)
            .map(term => `(ontologyTermSynonym.ontologyTermSynonym=q="${term.trim()}",ontologyTermIRI=q="${term.trim()}")`)
        // TODO: filter out items that have already been selected
        return [`ontology==${this.ontologyId}`, ...termQueryParts].join(';')
    }
}


const gavinStore = new GavinStore();

export default gavinStore;
export {gavinStore};
