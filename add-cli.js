var path = require('path'),
    fs = require('fs'),
    file,
    word,
    dictionary;

if (process.argv.length < 3) {
    console.log('Usage: node add-cli.js word');
    return;
}

word = process.argv[2].toLowerCase();

file = path.resolve(__dirname, 'dictionary.json');

dictionary = JSON.parse(fs.readFileSync(file), 'utf8');
if (-1 === dictionary.long.indexOf(word)) {
    dictionary.long.push(word);
    dictionary.long = dictionary.long.sort().reduce(function (state, word) {
        if (word !== state.word) {
            state.list.push(word);
            state.word = word;
        }
        return state;
    }, { list : [ ], word : '' }).list;
}
fs.writeFileSync(file, JSON.stringify(dictionary, null, 2));
