const _ = require('lodash')
const GramTokenizer = require('./tokenizer')
const Levenshtien = require('./fuzzy')

class TextSearch{
    constructor(options={}){
        let {
            fuzzyMatch = false,
            nGramLowerLimit = 3,
            nGramUpperLimit = 5,
            dataSet = []
        } = options       

        this.tokenizer = new GramTokenizer({nGramLowerLimit, nGramUpperLimit})
        this.shouldFuzzyMatch = fuzzyMatch
        this.fuzzyMatcher = new Levenshtien()
        this.originalValues = {}
        this.reverseIndex = {}
        this.items = {}

        if(dataSet && _.isArray(dataSet) && !_.isEmpty(dataSet)){
            let dataSetChunks = _.chunk(dataSet, Math.round(dataSet.length * 0.1))
            let indexed = 0
            _.forEach(dataSetChunks, (chunk)=>{
                _.forEach(chunk, this.add.bind(this))
                indexed += chunk.length
                console.log(`TextSearch :: INDEXED ${indexed} RECORDS`)
            })
        }
    }

    normalize(str){
        if (!_.isString(str)) {
            throw 'Text Matcher can work only with string datatype';
        }
        return str.toLowerCase();
    }

    add(value){
        let normalizedValue = this.normalize(value);
        if (normalizedValue in this.originalValues) {
            return false;
        }
        for (let i = this.tokenizer.nGramLowerLimit; i < this.tokenizer.nGramUpperLimit + 1; ++i) {
            this._add(value, i);
        }
    }

    _add(value, gramSize){
        let normalizedValue = this.normalize(value),
            items = this.items[gramSize] || [],
            index = items.length;
        items.push(0);
        let gramCounts = this.tokenizer.tokenize(normalizedValue, gramSize),
            sumOfSquareGramCounts = 0,
            gram,
            gramCount;
        for (gram in gramCounts) {
            gramCount = gramCounts[gram];
            sumOfSquareGramCounts += Math.pow(gramCount, 2);
            if (gram in this.reverseIndex) {
                this.reverseIndex[gram].push([index, gramCount]);
            } else {
                this.reverseIndex[gram] = [[index, gramCount]];
            }
        }
        var vectorNormal = Math.sqrt(sumOfSquareGramCounts);
        items[index] = [vectorNormal, normalizedValue];
        this.items[gramSize] = items;
        this.originalValues[normalizedValue] = value;
    }

    search(value, defaultValue = []) {
        let result = this._get(value);
        if (!result && typeof defaultValue !== 'undefined') {
            return defaultValue;
        }
        return result;
    }

    _get(value) {
        let normalizedValue = this.normalize(value),
            result = this.originalValues[normalizedValue];
        if (result) {
            return [[1, result]];
        }
        let results = [];
        for (let gramSize = this.tokenizer.nGramUpperLimit; gramSize >= this.tokenizer.nGramLowerLimit; --gramSize) {
            results = this.__get(value, gramSize);
            if (results) {
                return results;
            }
        }
        return null;
    }

    __get(value, gramSize) {
        let normalizedValue = this.normalize(value),
            matches = {},
            gramCounts = this.tokenizer.tokenize(normalizedValue, gramSize),
            items = this.items[gramSize],
            sumOfSquareGramCounts = 0,
            gram,
            gramCount,
            index,
            levenshteinResults,
            otherGramCount;
        for (gram in gramCounts) {
            gramCount = gramCounts[gram];
            sumOfSquareGramCounts += Math.pow(gramCount, 2);
            if (gram in this.reverseIndex) {
                for (let i = 0; i < this.reverseIndex[gram].length; ++i) {
                    index = this.reverseIndex[gram][i][0];
                    otherGramCount = this.reverseIndex[gram][i][1];
                    if (index in matches) {
                        matches[index] += gramCount * otherGramCount;
                    } else {
                        matches[index] = gramCount * otherGramCount;
                    }
                }
            }
        }
        if (_.isEmpty(matches)) {
            return null;
        }
        let vectorNormal = Math.sqrt(sumOfSquareGramCounts),
            results = [],
            matchScore;
        
        for (let matchIndex in matches) {
            matchScore = matches[matchIndex];
            results.push([matchScore / (vectorNormal * items[matchIndex][0]), items[matchIndex][1]]);
        }

        let sortDescending = function(a, b) {
            if (a[0] < b[0]) {
                return 1;
            } else if (a[0] > b[0]) {
                return -1;
            } else {
                return 0;
            }
        };

        results.sort(sortDescending)

        if (this.shouldFuzzyMatch) {
            levenshteinResults = [];
            
            let endIndex = Math.min(50, results.length);
            
            for (let i = 0; i < endIndex; ++i) {
                levenshteinResults.push([this.fuzzyMatcher.distance(results[i][1], normalizedValue), results[i][1]]);
            }
            results = levenshteinResults;
            results.sort(sortDescending);
        }
        return results;
    }


}

module.exports = TextSearch
