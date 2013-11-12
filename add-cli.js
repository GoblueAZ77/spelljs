var path = require('path'),
    fs = require('fs'),
    file,
    word,
    dictionary;

if (process.argv.length < 3) {
    console.log('Usage: node add-cli.js word');
    return;
}

word = process.argv[2];

file = path.resolve(__dirname, 'dictionary.json');

dictionary = JSON.parse(fs.readFileSync(file), 'utf8');
dictionary.long.push(word);
dictionary.long.sort();
fs.writeFileSync(file, JSON.stringify(dictionary, null, 2));
