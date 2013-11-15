var scan = require('./src/scan.js'),
    check = require('./src/check.js'),
    path = require('path'),
    fs = require('fs'),
    file,
    rules;

if (process.argv.length < 3) {
    console.log('Usage: node check-cli.js file.js');
    return;
}

file = process.argv[2];

rules = check.rules({
    // more words
    spellCheck : { dictionary : JSON.parse(fs.readFileSync(
        path.resolve(__dirname, 'dictionary.json')
    )) },
    // everybody use them as first index, second index and exception
    shortName : { exceptions : 'i,j,e,_,$'.split(',') }
});

check.run(rules, scan(fs.readFileSync(file, 'utf8'))).forEach(function (item) {
    console.log(file + ': line ' + item.line + ', col ' + item.column + ', ' +
        item.message);
});