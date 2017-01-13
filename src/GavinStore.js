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
    totalScore;

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
    Gene;

    constructor(gene, score) {
        this.score = score;
        this.Gene = gene;
    }
}

class GavinStore {

    @observable phenotypes = [];
    @observable scores = asMap();
    @observable variants = [];
    @observable isLoading;
    token = "492d07a9434f48a5915b454200d92c6c";
    server = {apiUrl: "http://localhost:8080/api/"};
    ontologyId = "AAAACWIH7ZE53QSABEBZGYAAAE";

    constructor() {
        this.phenotypes = []
        this.variants = this.getVariantsSortedOnScore()
    }

    @action addPhenotype(phenotype) {
        this.fetchGeneNetworkScores(phenotype).then(
            this.phenotypes.push(phenotype),
            this.getVariantsSortedOnScore()
        );
    }

    @action removePhenotype(index) {
        this.phenotypes.remove(this.phenotypes[index])
        this.getVariantsSortedOnScore()
    }

    @action togglePhenotype(index) {
        var phenotype = this.phenotypes[index];
        phenotype.active = !phenotype.active;
        this.getVariantsSortedOnScore()
    }

    @action getPhenotypeQuery(input) {
        const termQueryParts = input
            .split(/\s+/)
            .filter(term => term.length)
            .map(term => `(ontologyTermSynonym.ontologyTermSynonym=q="${term.trim()}",ontologyTermIRI=q="${term.trim()}")`)
        // TODO: filter out items that have already been selected
        return [`ontology==${this.ontologyId}`, ...termQueryParts].join(';')
    }

    @action setScore(hpo, value) {
        this.scores.set(hpo, value)
    }

    @computed get getVariants() {
        return this.variants;
    }

    fetchVariants(entityName) {
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
            return variants
        }).catch((error) => {
            console.log("error", error)
            var message = ''
            if (error.errors[0] !== undefined) {
                message = error.errors[0].message
            }
            alert('danger', 'Error retrieving entity[' + entityName + '] from the server', message)
        })
    }

    fetchGeneNetworkScores(phenotype) {
        const store = this;
        const genes = this.variants.map(function (variant) {
            return variant.Gene
        }).join()
        const hpo = phenotype.value.primaryID
        return get(this.server, `v2/sys_GeneNetworkScore?q=hpo==${hpo};hugo=in=(${genes})&num=1000`, this.token)
            .then((json) => {
                if (json.items.length === 0) {
                    console.log('warning', 'No Gene Network scores were found for phenotype[' +
                        phenotype.value.name + '(' + hpo + ')]', 'Unable to determine gene priority order')
                }
                json.items.forEach(function (score) {
                    const geneID = score.hugo
                    if (store.scores[phenotype.value.primaryID] != undefined && store.scores[hpo].has(geneID)) {
                        console.log('warning', 'More than one Gene Network score found for combination of gene[' +
                            geneID + ')] and phenotype[' + hpo + ')]', '')
                        score = new Score(geneID, undefined)
                    } else {
                        score = new Score(geneID, score.score)
                    }

                    if (store.scores.get(hpo) === undefined) {
                        store.setScore(hpo, [score])
                    } else {
                        var scores = store.scores.get(hpo);
                        scores.push(score);
                        store.setScore(hpo, scores)
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

    getVariantsSortedOnScore() {
        this.isLoading = true;
        this.fetchVariants("diag_AAAACWIH72E3LQSABEBZGYAAAE").then((variants) => {
                const store = this;
                const phenos = this.phenotypes.filter(pheno => pheno.active).map(pheno => pheno.value.primaryID)
                const genes = variants.map(function (variant) {
                    return variant.Gene
                })
                const scores = this.scores
                const totalScorePerGene = genes.reduce((soFar, gene) => ({
                    ...soFar,
                    [gene]: phenos.reduce((total, pheno) => {
                        if (!scores.has(pheno) || scores.get(pheno).find(score => score.Gene === gene) === undefined || total === undefined) {;
                            return undefined
                        }
                        return total + scores.get(pheno).find(score => score.Gene === gene).score
                    }, 0)
                }), {})
                this.variants = variants.map(element => {
                    return {...element, totalScore: totalScorePerGene[element.Gene]}
                }).sort(function (item1, item2) {
                    return store.sortVariants(item1, item2)
                })
                this.isLoading = false;
            }
        ).catch((error) => {
            console.log('Error retrieving variants from the server', error)
        })
    }
}

const gavinStore = new GavinStore();

export default gavinStore;
export {gavinStore};
