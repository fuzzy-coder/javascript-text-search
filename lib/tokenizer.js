class GramTokenizer{
    constructor(options={}){
        this.nGramLowerLimit = options.nGramLowerLimit;
        this.nGramUpperLimit = options.nGramUpperLimit;
    }

    filterCharacters(value){
        let _nonWordRe = /[^\w, ]+/;
        return '-' + value.toLowerCase().replace(_nonWordRe, '') + '-'
    }

    tokenize(value, gramSize){
        gramSize = gramSize || 2;
        let result = {},
            grams = this._iterate(value, gramSize),
            i = 0;
        for (i; i < grams.length; ++i) {
            if (grams[i] in result) {
                result[grams[i]] += 1;
            } else {
                result[grams[i]] = 1;
            }
        }
        return result;
    }

    _iterate(value, gramSize){
        let normalized = this.filterCharacters(value),
            lenDiff = gramSize - normalized.length,
            results = [];
        if (lenDiff > 0) {
            for (let i = 0; i < lenDiff; ++i) {
                value += '-';
            }
        }
        for (var index = 0; index < normalized.length - gramSize + 1; ++index) {
            results.push(normalized.slice(index, index + gramSize));
        }
        return results;
    }
}

module.exports = GramTokenizer