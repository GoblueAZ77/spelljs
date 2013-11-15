(function () {
    /*global module, require */

    'use strict';

    var scan = require('./../src/scan.js'),
        check = require('./../src/check.js'),
        assert = require('assert'),
        util = require('util');

    assert.deepEqual(check.run(check.rules(), scan('i')), [ {
        position: 0,
        line: 1,
        column: 1,
        rule: 'shortName',
        message: 'The name \'i\' is too short.'
    } ]);

    assert.deepEqual(check.run(check.rules({ shortName : { enabled : false }}),
        scan('i')), [ ]);

    assert.deepEqual(
        check.run(
            check.rules({ spellCheck : { dictionary : { 'test' : [ 'i', 'am',
                'very', 'long' ] } } }),
            scan('IAmVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLong')
        ),
        [ {
            position: 0,
            line: 1,
            column: 1,
            rule: 'longName',
            message: 'The name \'IAmVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryL' +
                'ong\' is too long.'
        } ]
    );

    assert.deepEqual(check.run(check.rules(), scan('IAmRight')), [ {
        position: 0,
        line: 1,
        column: 1,
        rule: 'spellCheck',
        message: 'The words \'am\', \'right\' in IAmRight are unknown or miss' +
            'pelled.'
    } ] );
}());