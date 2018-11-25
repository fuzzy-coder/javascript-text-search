class Levenshtien{
    distance(str1, str2){
        if (str1 === null && str2 === null) {
            throw 'Trying to compare two null values';
        }
        if (str1 === null || str2 === null) {
            return 0;
        }
        str1 = String(str1); str2 = String(str2);
        let distance = this._compute(str1, str2);
        if (str1.length > str2.length) {
            return 1 - distance / str1.length;
        } else {
            return 1 - distance / str2.length;
        }
    }

    _compute(str1, str2) {
        let current = [], prev, value;
        for (let i = 0; i <= str2.length; i++) {
            for (let j = 0; j <= str1.length; j++) {
                if (i && j) {
                    if (str1.charAt(j - 1) === str2.charAt(i - 1)) {
                        value = prev;
                    } else {
                        value = Math.min(current[j], current[j - 1], prev) + 1;
                    }
                } else {
                    value = i + j;
                }
                prev = current[j];
                current[j] = value;
            }
        }
        return current.pop();
    };
}

module.exports = Levenshtien