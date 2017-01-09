import { observable, computed } from 'mobx';


export class Phenotype {
    value;
    @observable active;

    constructor(value, active){
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

    @computed get sortedVariants() {

    }

    constructor() {
        this.phenotypes = [new Phenotype({primaryID:"ID",synonyms:["naam","syn1","syn2"],name:"naam"},true),new Phenotype({primaryID:"ID2",synonyms:["naam2","syn12","syn22"],name:"naam2"},true)]

    }

    setPhenotypes(phenotypes) {
        //retrieve scores

        //then update state using promise

    }

}

const gavinStore = new GavinStore();

export default gavinStore;
export { gavinStore };
