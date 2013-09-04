(function () {
    /*global module, require */

    'use strict';

    var scan = require('./scan.js'),
        assert = require('assert');

    function check(text, elements) {
        assert.deepEqual(scan(text), elements);
    }

    check('', [ ]);

    check(' ', [
        { position: 0, line: 1, column: 1, ws: ' ', text: ' ' }
    ]);

    check('  ', [
        { position: 0, line: 1, column: 1, ws: '  ', text: '  ' }
    ]);

    check('\n', [
        { position: 0, line: 1, column: 1, lt: '\n', text: '\n' }
    ]);

    check('\n\n', [
        { position: 0, line: 1, column: 1, lt: '\n', text: '\n' },
        { position: 1, line: 2, column: 1, lt: '\n', text: '\n' }
    ]);

    check('\r\n\n', [
        { position: 0, line: 1, column: 1, lt: '\r\n', text: '\r\n' },
        { position: 2, line: 2, column: 1, lt: '\n', text: '\n' }
    ]);

    check(' \r\n \n ', [
        { position: 0, line: 1, column: 1, ws: ' ', text: ' ' },
        { position: 1, line: 1, column: 2, lt: '\r\n', text: '\r\n' },
        { position: 3, line: 2, column: 1, ws: ' ', text: ' ' },
        { position: 4, line: 2, column: 2, lt: '\n', text: '\n' },
        { position: 5, line: 3, column: 1, ws: ' ', text: ' ' }
    ]);

    check('\'a\'', [
        { position: 0, line: 1, column: 1, str: '\'a\'', text: '\'a\'' }
    ]);

    check('"a"', [
        { position: 0, line: 1, column: 1, str: '"a"', text: '"a"' }
    ]);

    check('\'a"b\'', [
        { position: 0, line: 1, column: 1, str: '\'a"b\'', text: '\'a"b\'' }
    ]);

    check('\'a\\\'b\'', [
        { position: 0, line: 1, column: 1, str: '\'a\\\'b\'',
            text: '\'a\\\'b\'' }
    ]);

    check('\'\\\\\'', [
        { position: 0, line: 1, column: 1, str: '\'\\\\\'',
            text: '\'\\\\\'' }
    ]);

    check('//', [
        { position: 0, line: 1, column: 1,
            comment: '//', text: '//' }
    ]);

    check('//\n', [
        { position: 0, line: 1, column: 1,
            comment: '//', text: '//' },
        { position: 2, line: 1, column: 3, lt: '\n', text: '\n' }
    ]);

    check('/*  */\n', [
        { position: 0, line: 1, column: 1, multiline: true,
            comment: '/*  */', text: '/*  */', terminator: false },
        { position: 6, line: 1, column: 7, lt: '\n', text: '\n' }
    ]);

    check('/* \r */\n', [
        { position: 0, line: 1, column: 1, multiline: true,
            comment: '/* \r */', text: '/* \r */', terminator: true },
        { position: 7, line: 2, column: 3, lt: '\n', text: '\n' }
    ]);

    check('0', [
        { position: 0, line: 1, column: 1, number: '0', text: '0' }
    ]);

    check('0x00FE', [
        { position: 0, line: 1, column: 1, number: '0x00FE', text: '0x00FE' }
    ]);

    check('a', [
        { position : 0, line : 1, column : 1, id : 'a', text : 'a' }
    ]);

    check('_', [
        { position : 0, line : 1, column : 1, id : '_', text : '_' }
    ]);

    check('$', [
        { position : 0, line : 1, column : 1, id : '$', text : '$' }
    ]);

    check('tst', [
        { position : 0, line : 1, column : 1, id : 'tst', text : 'tst' }
    ]);

    check('/**/v//', [
        { position: 0, line: 1, column: 1, multiline: true,
            comment: '/**/', text: '/**/', terminator: false },
        { position: 4, line: 1, column: 5, id: 'v', text: 'v' },
        { position: 5, line: 1, column: 6, comment: '//',
            text: '//' }
    ]);

    check('var q = 1', [
        { position: 0, line: 1, column: 1, keyword: 'var', text: 'var' },
        { position: 3, line: 1, column: 4, ws: ' ', text: ' ' },
        { position: 4, line: 1, column: 5, id: 'q', text: 'q' },
        { position: 5, line: 1, column: 6, ws: ' ', text: ' ' },
        { position: 6, line: 1, column: 7, pt: '=', text: '=' },
        { position: 7, line: 1, column: 8, ws: ' ', text: ' ' },
        { position: 8, line: 1, column: 9, number: '1', text: '1' }
    ]);

    check('/a/', [
        { position: 0, line: 1, column: 1, re: '/a/', text: '/a/' }
    ]);

    scan(require('fs').readFileSync('./scan.js', 'utf8'));
}());
