# javascript-text-search

A simple javascript library searches term against list of strings using [Cosine Similarity](https://blog.nishtahir.com/2015/09/19/fuzzy-string-matching-using-cosine-similarity/)

To enable partial matches, the dataset and the search term are tokenized using [NGram](https://en.wikipedia.org/wiki/N-gram)

# usage

```
const TextSearch = require('text-search')
index = new TextSearch({
        fuzzyMatch: true,
        nGramLowerLimit: 3,
        nGramUpperLimit: 4,
        dataSet: ['George', 'John', 'Thomas', 'James', 'Andrew']
      })
console.log(index.search('Tho'))
```
