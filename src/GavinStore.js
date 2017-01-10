import {observable, computed, action, asMap} from 'mobx';
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
    identifier;
    CHROM;
    POS;
    REF;
    ALT;
    Gene;
    Gavin;

    constructor(identifier, chrom, pos, ref, alt, gene, gavin) {
        this.identifier = identifier
        this.CHROM = chrom;
        this.POS = pos;
        this.REF = ref;
        this.ALT = alt;
        this.Gene = gene;
        this.Gavin = gavin;
        this.totalScore = 0;
    }
}

export class Score {
    score;
    hpo;
    gene;

    constructor(score, hpo, gene) {
        this.score = score;
        this.hpo = hpo;
        this.gene = gene;
    }
}

class GavinStore {

    @observable phenotypes = [];
    @observable scores = asMap({});
    @observable variants = [];
    @observable isLoading;
    token = "492d07a9434f48a5915b454200d92c6c";
    server = {apiUrl: "http://localhost:8080/api/"};
    ontologyId = "AAAACWIH7ZE53QSABEBZGYAAAE";

    constructor() {
        this.phenotypes = []
        this.fetchVariants("diag_AAAACWIH72E3LQSABEBZGYAAAE");//TODO: where does this method call go? //TODO get entityName from URL
    }

    @action addPhenotype(phenotype) {
        this.fetchGeneNetworkScores(phenotype).then(
            this.phenotypes.push(phenotype)
        );
    }

    @action getPhenotypeQuery(input) {
        const termQueryParts = input
            .split(/\s+/)
            .filter(term => term.length)
            .map(term => `(ontologyTermSynonym.ontologyTermSynonym=q="${term.trim()}",ontologyTermIRI=q="${term.trim()}")`)
        // TODO: filter out items that have already been selected
        return [`ontology==${this.ontologyId}`, ...termQueryParts].join(';')
    }

    @action setScore(geneID, score) {
        console.log("setScore",this);
        this.scores.set(geneID, score)
    }

    fetchVariants(entityName) {
        this.isLoading = true;
        return get(this.server, `v2/${entityName}`, this.token).then((json) => {
            var attrNames = json.meta.attributes.map(function (attr) {
                return attr.name
            })
            var missing = ['#CHROM', 'POS', 'REF', 'ALT', 'Gene', 'Gavin'].filter(function (attr) {
                return attrNames.indexOf(attr) === -1
            })
            if (missing.length > 0) alert('danger', 'Entity [' + entityName + '] is missing required attributes', missing.join(', '))
            var variants = json.items.map(function (variant) {
                return new Variant(variant.INTERNAL_ID, variant['#CHROM'], variant.POS, variant.REF, variant.ALT, variant.Gene, variant.Gavin)
            })
            this.variants.push.apply(this.variants, variants)
            this.isLoading = false;
        }).catch((error) => {
            console.log("error", error)
            var message = ''
            if (error.errors[0] !== undefined) {
                message = error.errors[0].message
            }
            alert('danger', 'Error retrieving entity[' + entityName + '] from the server', message)
            this.isLoading = false;
        })
    }

    fetchGeneNetworkScores(phenotype) {
        const store = this;
        const genes = this.variants.map(function (variant) {
            return variant.Gene
        }).join()
        return get(this.server, `v2/sys_GeneNetworkScore?q=hpo==${phenotype.value.primaryID};hugo=in=(${genes})&num=1000`, this.token)
            .then((json) => {
                if (json.items.length === 0) {
                    console.log('warning', 'No Gene Network scores were found for phenotype[' +
                        phenotype.value.name + '(' + phenotype.value.primaryID + ')]', 'Unable to determine gene priority order')
                }
                json.items.forEach(function (score) {
                    const geneID = score.hugo
                    if (store.scores.has(geneID)) {
                        console.log('warning', 'More than one Gene Network score found for combination of gene[' +
                            geneID + ')] and phenotype[' + phenotype.value.primaryID + ')]', '')
                        store.setScore(geneID, undefined)
                    } else {
                        store.setScore(geneID, score.score)
                    }
                })
            }).catch((error) => {
                console.log('Error retrieving Gene Network scores from the server', error)
            })
    }

    sortVariants(item1, item2) {
        //cope with undefined scores
        var value2 = item2.totalScore
        var value1 = item1.totalScore
        if (value1 === undefined) {
            if (value2 === undefined) return 0
            return 1
        }
        if (value2 === undefined) return -1
        if (value2 > value1) return 1
        if (value2 < value1) return -1
        return 0
    }

    //TODO: rewrite to "normal" function that updates variants in the store, and create getter for variants?
    @computed get variantsSortedOnScore() {
        const store = this;
        const phenos = this.phenotypes.filter(pheno => pheno.active).map(pheno => pheno.id)
        const genes = this.variants.map(function (variant) {
            return variant.Gene
        })
        const scores = this.scores
        const totalScorePerGene = genes.reduce((soFar, gene) => ({
            ...soFar,
            [gene]: phenos.reduce((total, pheno) => {
                if (!scores.has(pheno) || !scores[pheno].has(gene) || total === undefined) {
                    return undefined
                }
                return total + scores[pheno][gene]
            }, 0)
        }), {})

        return this.variants.map(element => {
            return {...element, totalScore: totalScorePerGene[element.Gene]}
        }).sort(function (item1, item2) {
            return store.sortVariants(item1, item2)
        })
    }
}

const gavinStore = new GavinStore();

export default gavinStore;
export {gavinStore};
