var scan = require('./src/scan.js'),
    check = require('./src/check.js'),
    path = require('path'),
    fs = require('fs'),
    file;

if (process.argv.length < 3) {
    console.log('Usage: node check-cli.js file.js');
    return;
}

file = process.argv[2];
check(scan(fs.readFileSync(file, 'utf8')), {
    rules : {
        // more words
        dictionary : { dictionary : JSON.parse(fs.readFileSync(
            path.resolve(__dirname, 'dictionary.json')
        )) },
        // everybody use them as first index, second index and exception
        shortName : { exceptions : 'i,j,e,_,$'.split(',') }
    }
}).forEach(function (item) {
    console.log(file + ': line ' + item.line + ', col ' + item.column + ', ' +
        item.message);
});